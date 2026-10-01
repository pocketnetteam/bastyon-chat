# Bastyon Chat — Полный анализ оптимизаций

> Документ описывает все оптимизационные паттерны, найденные в проекте.
> Проект — Vue 2 чат поверх `matrix-js-sdk-bastyon`, интегрированный с Bastyon (децентрализованная соцсеть на блокчейне).

---

## Содержание

1. [Кэширование и хранение данных](#1-кэширование-и-хранение-данных)
2. [Оптимизация рендеринга и перерисовок](#2-оптимизация-рендеринга-и-перерисовок)
3. [Оптимизация работы с Matrix SDK](#3-оптимизация-работы-с-matrix-sdk)
4. [Криптография и шифрование](#4-криптография-и-шифрование)
5. [Сетевые и серверные оптимизации](#5-сетевые-и-серверные-оптимизации)
6. [Управление состоянием (Vuex)](#6-управление-состоянием-vuex)
7. [Оптимизация событий и слушателей](#7-оптимизация-событий-и-слушателей)
8. [Оптимизация поиска](#8-оптимизация-поиска)
9. [Управление жизненным циклом компонентов](#9-управление-жизненным-циклом-компонентов)
10. [Оптимизация медиа и файлов](#10-оптимизация-медиа-и-файлов)
11. [Lazy loading и отложенная инициализация](#11-lazy-loading-и-отложенная-инициализация)
12. [Уведомления и звуковые сигналы](#12-уведомления-и-звуковые-сигналы)
13. [Платформо-зависимые оптимизации](#13-платформо-зависимые-оптимизации)
14. [Сводная таблица](#14-сводная-таблица)

---

## 1. Кэширование и хранение данных

### 1.1 Двухуровневый кэш в ChatStorage (IndexedDB + Memory)

**Файл:** `src/application/chatstorage.js`

Реализована система хранения с двумя уровнями:

- **Memory-слой** (`memorystorage = {}`) — in-memory объект для мгновенного доступа
- **IndexedDB** — персистентное хранилище для выживания между сессиями
- **Fallback на LocalStorage** — когда IndexedDB недоступен

Механизм: при инициализации (`getall()`) все данные из IndexedDB подгружаются в `memorystorage`. При чтении (`get`) сначала проверяется memory-кэш, и только при промахе идёт запрос в IndexedDB. При записи (`set`) данные пишутся одновременно в обе структуры.

```
get(itemId):
  if memorystorage[itemId] → return immediately (O(1))
  else → read from IndexedDB → cache in memorystorage → return
```

**Автоочистка устаревших данных:** `clearOldItems()` удаляет записи старше 30 дней (для IndexedDB) или 7 дней (для LocalStorage fallback) при инициализации.

**Суть оптимизации:** избежание повторных дорогих обращений к IndexedDB за часто запрашиваемыми данными (расшифрованные сообщения, ключи шифрования, информация о пользователях).

### 1.2 Многоуровневый API-кэш (`scasheAct`)

**Файл:** `src/application/api.js`

Функция `scasheAct` реализует сложную систему батчинга и кэширования API-запросов:

1. **In-memory cache** (`cache[key]`) — проверяется первым
2. **IndexedDB/ChatStorage** — проверяется вторым для промахов по памяти
3. **Deduplication загрузок** (`loading[key]`) — если запрос к ID уже в полёте, повторный запрос ожидает его завершения вместо дублирования
4. **Батчинг** — из массива запрашиваемых ID вычисляются только те, которых нет ни в кэше, ни в процессе загрузки
5. **Сохранение в storage** после получения результатов

```
Запрос userInfo([id1, id2, id3]):
  id1 → в memory-кэше ✓ → пропускаем
  id2 → в IndexedDB ✓ → подгружаем в memory → пропускаем
  id3 → не найден нигде → включаем в API-запрос
  Результат: реальный API-запрос только для id3
```

**Результат:** минимизация сетевых запросов к PocketNet API; запрос `userInfo` для N пользователей может не вызывать ни одного реального HTTP-запроса, если все данные кэшированы.

### 1.3 Кэш hex-декодирования

**Файл:** `src/application/functions.js`, строка ~1084

```javascript
var hexstorage = {};
var hexDecode = function (hex) {
    if (hexstorage[hex]) return hexstorage[hex];
    // ... вычисление ...
    hexstorage[hex] = result;
    return result;
};
```

Мемоизация результатов `hexDecode`, т.к. адреса пользователей конвертируются из hex многократно (при каждом отображении чата, сообщения, контакта).

### 1.4 Кэш хэшей для комнат (tete-a-tete ID)

**Файл:** `src/application/mtrxkit.js`

```javascript
var cachestorage = {};
// В tetatetid(), groupid(), groupideq():
if (cachestorage[id]) return cachestorage[id];
var hash = f.sha224(id.toString()).toString("hex");
cachestorage[id] = hash;
```

Вычисление SHA-224 хэша для идентификаторов комнат — дорогая операция. Результаты кэшируются на уровне модуля, чтобы повторные вызовы для тех же пар пользователей возвращались мгновенно.

### 1.5 Кэш userData при логине в Matrix

**Файл:** `src/application/mtrx.js`, строки ~216-248

```javascript
var userdataLS = localStorage[lsdatakey + this.credentials.username];
if (userdataLS) {
    var userdataPearsed = JSON.parse(userdataLS);
    var d = new Date().getTime() - 1000 * 60 * 60 * 24 * 31;
    if (userdataPearsed.date > d) {
        userData = userdataPearsed.data; // используем кэш
    }
}
```

Данные авторизации (access_token, device_id и т.д.) кэшируются в LocalStorage на 31 день. Это позволяет пропустить API-вызов `client.login()` при повторном входе.

### 1.6 Кэш AES-ключей шифрования

**Файл:** `src/application/pcrypto.js` — функция `eaac.aeskeysls()`

Вычисленные AES-ключи для шифрования/дешифрования сохраняются в ChatStorage (IndexedDB). При следующем запросе ключей проверяется хранилище, и только при промахе выполняется дорогое криптографическое вычисление. Промисы также дедуплицируются (`lsspromises`).

### 1.7 Кэш расшифрованных событий

**Файл:** `src/application/pcrypto.js` — `decryptEvent()`

```javascript
var k = `${ecachekey + pcrypto.user.userinfo.id}-${
    (event.content ? event.content.edited : "") || event.event_id
}`;
// Проверяем ChatStorage (events)
lse.get(k).then(stored => { ... }).catch(async () => {
    // Если нет — расшифровываем и сохраняем
    lse.set(k, JSON.stringify(data));
});
```

Расшифрованные сообщения кэшируются в отдельном ChatStorage (`events`), чтобы при повторном просмотре чата не выполнять повторное дешифрование.

### 1.8 Кэш информации о пользователях через POCKETNETINSTANCE

**Файл:** `src/application/api.js` — `userInfoCached()`

Прежде чем обращаться к API, проверяется внешний кэш платформы Bastyon:

```javascript
f.deep(window, "POCKETNETINSTANCE.platform.sdk.userscl.storage." + address)
```

Если данные о пользователе уже загружены основным приложением Bastyon, чат не дублирует запрос.

### 1.9 Кэш displayName

**Файл:** `src/application/index.js`, строки ~258-273

```javascript
var cuname = f.deep(this.user, "userinfo.name");
var dsname = localStorage['dsname_' + this.user.userinfo.id] || '';
if (cuname != dsname) {
    localStorage['dsname_' + this.user.userinfo.id] = cuname;
    this.mtrx.client.setDisplayName(...);
}
```

`setDisplayName` вызывается только при реальном изменении имени, а не при каждом входе.

---

## 2. Оптимизация рендеринга и перерисовок

### 2.1 HideOptimization — скрытие чатов при неактивном окне

**Файлы:** `src/application/index.js`, `src/vuex/store.js`, `src/components/chats/list/index.js`

Ключевая оптимизация для встроенного режима (pocketnet widget):

```javascript
// Core
hideOptimization = function (v) {
    this.store.commit("hideOptimization", v);
};

// Chats List computed
showchatslist: function () {
    return !this.hideOptimization;
}
```

Когда чат скрыт в родительском приложении Bastyon, через `hideOptimization(true)` полностью отключается рендеринг списка чатов. Это предотвращает ненужные вычисления Vue computed properties и re-render цикл для десятков компонентов превью чатов.

### 2.2 Система readyToRender — плавное появление событий

**Файл:** `src/components/events/event/index.vue`

```javascript
var rendered = {}; // модульный кэш

beforeMount: function () {
    if (rendered[this.event.event.event_id] || rendered[this.event.txnId]) {
        this.readyToRender = true;
    }
}
```

```css
.event
  opacity: 0
  +transition(0.3s)
  &.readyToRender
    opacity: 1
```

- События начинаются с `opacity: 0` и появляются плавно после готовности
- Модульный объект `rendered` помнит уже показанные сообщения; при повторном рендеринге (скроллинг, возврат к чату) они показываются мгновенно без повторной анимации
- `setReadyToRender()` вызывается с `setTimeout(20ms)`, группируя несколько обновлений в один paint cycle

### 2.3 Debounced scroll и update

**Файл:** `src/components/events/list/index.js`

```javascript
dupdated: _.debounce(function () {
    this.$emit("updated", this.size());
}, 75),

dscroll: _.debounce(function () {
    return this.scroll();
}, 35),
```

Обработчики скролла и обновления размеров дебаунсятся для предотвращения каскадных перерисовок во время быстрого скроллинга.

### 2.4 Debounced readAll

**Файл:** `src/components/chat/list/index.js`, строки ~611-676

```javascript
debouncedReadAll: _.debounce(function () {
    // ... отправка read receipt ...
}, 100),
```

Отправка read receipts дебаунсится на 100ms — при быстром скроллинге через множество сообщений отправляется только один receipt для последнего видимого.

### 2.5 Ленивые computed для Vuex-данных

**Файл:** `src/vuex/store.js` — `SET_EVENTS_TO_STORE`

```javascript
if (timeline.length &&
    state.events[k] &&
    state.events[k].timeline &&
    state.events[k].timeline[0] &&
    state.events[k].timeline[0].event.event_id == timeline[0].event.event_id) {
    return; // пропускаем обновление, данные не изменились
}
```

Перед обновлением `state.events` проверяется: если первое событие (самое свежее) не изменилось, обновление пропускается. Это предотвращает каскадную реактивность Vue для всех подписчиков events.

### 2.6 Гранулярное обновление chatsMap

**Файл:** `src/vuex/store.js` — `SET_CHATS_TO_STORE`

```javascript
if (!state.chatsMap[chat.roomId] || state.force[chat.roomId]) {
    Vue.set(state.chatsMap, chat.roomId, chat);
}
```

Чат в `chatsMap` обновляется реактивно (`Vue.set`) только если его там нет или он помечен для принудительного обновления через `force`. Это минимизирует триггеринг watchers.

### 2.7 Гранулярное обновление readreciepts

**Файл:** `src/vuex/store.js` — `SET_READ_TO_STORE`

```javascript
if ((!state.readreciepts[chatid] && !r) ||
    (!state.readreciepts[chatid] && r) ||
    (state.readreciepts[chatid] && r &&
     state.readreciepts[chatid].ts != r.ts)) {
    Vue.set(state.readreciepts, chatid, r);
}
```

Read receipts обновляются только при реальном изменении timestamp, не при каждом sync.

### 2.8 Гранулярное обновление chatusers

**Файл:** `src/vuex/store.js` — `SET_CHATS_USERS`

```javascript
if (!state.chatusers[i] || !_.isEqual(state.chatusers[i], u)) {
    Vue.set(state.chatusers, i, u);
}
```

Deep comparison через `_.isEqual` перед обновлением. Дорого по CPU, но предотвращает каскад реактивных обновлений для всех компонентов, подписанных на `chatusers`.

### 2.9 Пагинация событий по страницам

**Файл:** `src/components/events/list/index.js` — `eventsByPages`

```javascript
eventsByPages: function () {
    var ps = [];
    var pc = 0;
    _.each(this.events, function (e) {
        if (!pc) ps.push([]);
        ps[ps.length - 1].push(e);
        pc++;
        if (pc > 19) pc = 0;
    });
    return ps;
}
```

События разбиваются на страницы по 20 элементов для оптимизации рендеринга (возможно, для использования с vue-virtual-scroller).

### 2.10 Кастомный smooth scroll через requestAnimationFrame

**Файл:** `src/components/events/list/index.js`, строки ~319-379

Собственная реализация плавного скролла через `requestAnimationFrame` с нормализацией wheel events под разные браузеры. Позволяет контролировать скорость и плавность скроллинга без CSS `scroll-behavior: smooth`, что даёт лучшую производительность.

### 2.11 Lazy-загрузка тяжёлых компонентов

**Файл:** `src/components/events/event/index.vue`

```javascript
components: {
    common,
    member,
    message: () => import("@/components/events/event/message/index.vue"),
    dummypreviews: () => import("@/components/chats/dummypreviews"),
}
```

**Файл:** `src/components/chat/index.js`

```javascript
components: {
    list,
    chatInput: () => import("@/components/chat/input/index.vue"),
    // ...
}
```

Тяжёлые компоненты `message` и `chatInput` загружаются лениво через динамический import. Это уменьшает начальный bundle и ускоряет первый рендер.

### 2.12 Активация/деактивация через keep-alive

**Файлы:** `src/components/chat/list/index.js`, `src/components/events/list/index.js`, `src/components/chat/index.js`

```javascript
activated() { this.activated = true; },
deactivated() { this.activated = false; }
```

Компоненты используют Vue `<keep-alive>` с хуками `activated`/`deactivated`. При деактивации прекращаются фоновые процессы (интервалы, пагинация), при активации — восстанавливаются. Это позволяет сохранять состояние компонента (позиция скролла, загруженные данные) без пересоздания.

### 2.13 Сохранение и восстановление позиции скролла

**Файл:** `src/components/events/list/index.js`

```javascript
activated() { this.restoreScrollPosition(); },
deactivated() { this.saveScrollPosition(); }

restoreScrollPosition() {
    const container = this.$refs.container;
    container.style.scrollBehavior = "auto"; // мгновенный скролл
    this.$nextTick(() => {
        container.scrollTo({ top: this.lastScrollPosition });
        container.style.scrollBehavior = originalScrollBehavior;
    });
}
```

Временное отключение `scroll-behavior` при восстановлении позиции предотвращает анимацию и мгновенно возвращает пользователя к месту чтения.

---

## 3. Оптимизация работы с Matrix SDK

### 3.1 Параметры startClient

**Файл:** `src/application/mtrx.js`, строки ~302-307

```javascript
await userClient.startClient({
    pollTimeout: 60000,
    resolveInvitesToProfiles: true,
    initialSyncLimit: 4,
    disablePresence: true,
});
```

- **`initialSyncLimit: 4`** — при первичной синхронизации загружаются только последние 4 события на комнату вместо полной истории. Критическая оптимизация для пользователей с сотнями комнат
- **`disablePresence: true`** — отключены статусы присутствия (online/offline), что значительно снижает трафик и нагрузку на клиент
- **`pollTimeout: 60000`** — long-polling на 60 секунд уменьшает количество повторных подключений

### 3.2 TimelineWindow вместо полной загрузки

**Файл:** `src/components/chat/list/index.js`

```javascript
this.timeline.tl = new this.core.mtrx.sdk.TimelineWindow(
    this.core.mtrx.client, ts
);
```

Вместо загрузки всей истории чата используется `TimelineWindow` — виртуальное окно, которое загружает события по мере необходимости (пагинация). Пользователь видит только последние N сообщений, а старые подгружаются при скроллинге.

### 3.3 Управляемая пагинация с guard-ами

**Файл:** `src/components/chat/list/index.js`

```javascript
paginate: function (direction, rnd) {
    if (!this.loading && this.timeline && !this["p_" + direction]) {
        if (this.timeline.tl.canPaginate(direction) || rnd) {
            this["p_" + direction] = true;
            // ...
        }
    }
}
```

- Флаги `p_b` и `p_f` предотвращают одновременную пагинацию в одном направлении
- `canPaginate()` проверяет наличие данных перед запросом
- Paginate batch size — 20 событий

### 3.4 needLoad — умная проверка необходимости пагинации

**Файл:** `src/components/chat/list/index.js`

```javascript
needLoad: function (direction) {
    var scrollHeight = this.esize.scrollHeight || 0;
    var scrollTop = this.esize.scrollTop || 0;
    var clientHeight = Math.max(this.esize.clientHeight || 0, 800);
    if (direction == "b") {
        if (scrollHeight - scrollTop < clientHeight + safespace) r = true;
    } else {
        if (scrollTop < clientHeight) r = true;
    }
}
```

Пагинация запускается только когда пользователь приближается к границе загруженного контента (в пределах одного экрана). Избыточные запросы не выполняются.

### 3.5 Unpaginate при уходе из чата

**Файл:** `src/components/chat/list/index.js`

```javascript
beforeDestroy() {
    if (this.timeline) {
        this.timeline.tl.unpaginate(this.timeline.tl._eventCount, true);
        this.timeline = null;
    }
}
```

При уходе из чата все загруженные события выгружаются из TimelineWindow, освобождая память. Критично для чатов с длинной историей.

### 3.6 Переопределение getProfileInfo

**Файл:** `src/application/mtrx.js`, строки ~173-179

```javascript
client.getProfileInfo = function () {
    return Promise.resolve({ avatar_url: "", displayname: "test" });
};
```

Полное отключение запросов профиля через Matrix SDK — информация о пользователях получается через PocketNet API и кэшируется отдельно. Это устраняет N+1 проблему при загрузке чатов.

### 3.7 Кастомный HTTP-клиент через axios

**Файл:** `src/application/mtrx.js`, `request()`

Matrix SDK использует свой HTTP-стек; в проекте он заменён на axios с поддержкой cancellation tokens. Это позволяет отменять незавершённые запросы при навигации и даёт лучший контроль над сетевыми запросами.

### 3.8 IndexedDB Store для Matrix

**Файл:** `src/application/mtrx.js`, строки ~270-274

```javascript
var store = new sdk.IndexedDBStore({
    indexedDB: window.indexedDB,
    dbName: "matrix-js-sdk-v6:" + this.credentials.username,
    localStorage: window.localStorage
});
```

Использование IndexedDB store вместо memory store позволяет сохранять состояние sync между перезагрузками, что значительно ускоряет последующие запуски.

---

## 4. Криптография и шифрование

### 4.1 Дедупликация промисов расшифрования

**Файл:** `src/application/pcrypto.js`

```javascript
self.decryptEvent = async function (event) {
    if (event.decrypting) {
        return event.decrypting; // возвращаем существующий промис
    }
    var dpromise = /* ... */;
    event.decrypting = dpromise;
    return dpromise;
};
```

Если расшифрование события уже запущено, повторные вызовы получают тот же промис. Это предотвращает параллельные дорогие криптографические операции для одного сообщения.

### 4.2 Отслеживание изменений пользователей через хэш

**Файл:** `src/application/pcrypto.js` — `needchangeusers()`

```javascript
var needchangeusers = function() {
    var history = getuserseventshistory();
    var lusershash = f.sha224(JSON.stringify(history)).toString("hex");
    if (lusershash == usershistoryhash) return false;
    return true;
};
```

Вместо пересчёта криптографических ключей при каждом изменении, вычисляется хэш истории пользователей. Пересчёт запускается только при реальном изменении состава участников.

### 4.3 Ленивая генерация ключей через Proxy

**Файл:** `src/application/user/pnuser.js`

```javascript
let proxy = new Proxy(proxyData, {
    get: (p, i) => {
        if (!proxyData.pair) {
            proxyData.pair = p.keyPair;
            proxyData.public = p.keyPair.publicKey.toString("hex");
            proxyData.private = p.keyPair.privateKey;
        }
        return proxyData[i];
    }
});
```

Генерация 12 криптографических ключей выполняется лениво через `Proxy`. Публичный и приватный ключи из keyPair вычисляются только при первом обращении. Для ключей, которые не используются (напр., при просмотре незашифрованного чата), вычисление не происходит вовсе.

### 4.4 Отложенная генерация ключей

**Файл:** `src/application/user/pnuser.js` — `checkCredentials()`

```javascript
setTimeout(() => {
    this.private = this.generateKeysLS(key, decodedAddress);
}, 1000);
```

Генерация приватных ключей откладывается на 1 секунду после проверки credentials, чтобы не блокировать UI при инициализации.

### 4.5 Кэширование ключей в LocalStorage

**Файл:** `src/application/user/pnuser.js` — `generateKeysLS()`

```javascript
var lsstorage = JSON.parse(localStorage["wifkeya"] || "{}");
// ...
var { ckeys } = this.generateKeys(key, lsstorage.storage);
localStorage["wifkeya"] = JSON.stringify(lsstorage);
```

Промежуточные результаты генерации ключей (WIF-строки) кэшируются в LocalStorage. При повторном входе вычисляются только `ECPair.fromWIF()`, а не полная `bip32.derivePath()`.

### 4.6 Кэш общего ключа группы

**Файл:** `src/application/pcrypto.js` — `getOrCreateCommonKey()`

При групповом шифровании (>2 участников) используется общий ключ комнаты. Метод `getOrCreateCommonKey()` сначала проверяет наличие ключа в state events комнаты, и создаёт новый только при отсутствии. `getCommonKeyEvent()` ищет событие по state_key с хэшем текущего состава пользователей.

### 4.7 Дедупликация промисов вычисления AES-ключей

**Файл:** `src/application/pcrypto.js` — `eaac.aeskeysls()`

```javascript
if (!lsspromises[ek]) {
    lsspromises[ek] = ls.get(ek).then(...).catch(...).finally(() => {
        delete lsspromises[ek];
    });
}
return lsspromises[ek];
```

Промисы вычисления AES-ключей дедуплицируются. Несколько одновременных запросов к одному ключу разделяют один промис.

---

## 5. Сетевые и серверные оптимизации

### 5.1 Race-ping серверов

**Файл:** `src/application/mtrx.js` — `pingServers()`

```javascript
return Promise.race(
    _.map(servers, url => {
        return axios({ url: requestUrl }).then(response => {
            server = url;
        });
    })
).then(() => { return server; });
```

При наличии зеркал Matrix-сервера выполняется параллельный ping всех серверов через `Promise.race`. Используется первый ответивший сервер, что минимизирует latency.

### 5.2 Автоматический retry при отключении

**Файл:** `src/application/api.js` — `request()`

```javascript
if (e == "noresponse") {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            request(data, to).then(resolve).catch(reject);
        }, 3000);
    });
}
```

При сетевых ошибках (`noresponse`) запрос автоматически повторяется через 3 секунды. В сочетании с `waitonline()` это обеспечивает корректную работу при нестабильном соединении.

### 5.3 fastsync

**Файл:** `src/application/mtrx.js`, строки ~1275-1284

```javascript
fastsync = function () {
    var state = this.client.getSyncState();
    if (state === "PREPARED" || state === "SYNCING") {
    } else {
        return this.client.retryImmediately();
    }
};
```

Принудительная немедленная синхронизация, если клиент не в активном состоянии синхронизации.

### 5.4 Waitonline/Waitready паттерн

**Файлы:** `src/application/index.js`, `src/application/mtrx.js`

```javascript
waitonline = function () {
    if (this.online) return Promise.resolve();
    return new Promise((resolve) => {
        f.retry(() => this.online, resolve, 5);
    });
};

wait() {
    return f.pretry(() => this.ready);
}
```

Все операции, требующие сети, оборачиваются в `waitonline()`. Все операции, требующие готовности Matrix-клиента, оборачиваются в `wait()`. Это обеспечивает правильную последовательность без блокировки UI.

---

## 6. Управление состоянием (Vuex)

### 6.1 Плоский store без модулей

**Файл:** `src/vuex/store.js`

Весь store — один плоский объект без модулей Vuex. Это упрощает доступ к данным и устраняет overhead маппинга namespace. Для проекта такого размера это сознательный выбор: все мутации доступны без `rootState`.

### 6.2 Дебаунс active-состояния

**Файл:** `src/vuex/store.js` — мутация `active`

```javascript
active(state, value) {
    var time = 50;
    if (!value) time = 1000;
    activetimeout = f.slowMade(() => {
        // ...
        state.active = value;
    }, activetimeout, time);
}
```

- Активация — 50ms delay (быстрая реакция)
- Деактивация — 1000ms delay (предотвращение "мигания" при кратковременной потере фокуса)
- `activeBlock` — механизм блокировки деактивации (например, при открытом модальном окне)

### 6.3 Selective Vue.set/Vue.delete

Вместо массовой перезаписи state (что вызвало бы тотальный re-render), используются точечные `Vue.set()` и `Vue.delete()` для реактивного обновления конкретных ключей в объектах `chatsMap`, `events`, `readreciepts`, `chatusers`, `force`.

### 6.4 Ленивый подсчёт уведомлений

**Файл:** `src/vuex/store.js` — `ALL_NOTIFICATIONS_COUNT`

Подсчёт выполняется только при явном вызове мутации (при sync), а не как computed. Результат сохраняется в `state.allnotifications` и вызывает внешние callback-и (для бейджа приложения).

---

## 7. Оптимизация событий и слушателей

### 7.1 Guard chatsready на события Matrix

**Файл:** `src/application/mtrx.js` — `initEvents()`

```javascript
this.client.on("Room.timeline", (message, member) => {
    if (!this.chatsready) return;
    // ...
});

this.client.on("RoomMember.membership", (event, member) => {
    if (!this.chatsready) return;
    // ...
});
```

Все обработчики событий Matrix SDK игнорируются до полной готовности чатов. Это предотвращает обработку событий во время initial sync (где может быть тысячи событий).

### 7.2 Фильтрация событий перед рендером

**Файл:** `src/vuex/store.js` — `FETCH_EVENTS` action

Из timeline каждого чата отфильтровываются:
- `m.room.redaction` (удалённые)
- `m.room.callsEnabled`, `m.call.replaces`, `m.call.select_answer`, `m.call.negotiate`, `m.call.candidates`, `m.call.asserted_identity` (внутренние VoIP)
- `m.room.encryption` (служебные)
- `m.replace` relation events (редактирования — мержатся в оригинал)
- `m.room.power_levels` в тет-а-тет чатах

В store попадает только 1 последнее событие на чат (для превью) вместо полной timeline.

### 7.3 Паттерн callback-based слушатели

**Файл:** `src/application/listeners.js`

```javascript
self.clbks = { resume: {}, pause: {} };
// ...
_.each(self.clbks.resume, function (c) { c(time); });
```

Именованные callback-словари (`clbks.resume.core`, `clbks.pause.core`) позволяют:
- Избежать утечек памяти — callback удаляется по имени при destroy
- Множеству модулей подписываться/отписываться независимо
- Не пересоздавать слушатели при обновлении

### 7.4 Отложенная инициализация TimeLine

**Файл:** `src/components/chat/list/index.js`

```javascript
setTimeout(() => {
    this.timeline.tl.load().then((r) => {
        return this.getEventsAndEncrypt();
    }).then((events) => {
        this.events = events;
        this.loading = false;
        setTimeout(() => { this.autoPaginateAll(); }, 300);
    });
}, 30);
```

- Загрузка timeline откладывается на 30ms после создания компонента (даёт браузеру отрисовать skeleton)
- Автопагинация запускается через 300ms после первой загрузки (не блокирует первый render)

### 7.5 Интервальное обновление вместо watchers

**Файл:** `src/components/chat/list/index.js`

```javascript
activated: {
    handler: function () {
        if (this.activated) {
            this.updateInterval = setInterval(this.update, 300);
        }
    }
}
```

Обновление пагинации выполняется через `setInterval(300ms)` вместо реактивного watcher. Это даёт контролируемую частоту обновления вместо потенциально каскадных вызовов.

---

## 8. Оптимизация поиска

### 8.1 SearchEngine — инкрементальный поиск с кэшированием

**Файл:** `src/application/searchEngine.js`

Архитектура:

```
SearchEngine
  └── Process (per query)
        ├── timelines{} — TimelineWindow для каждого чата
        ├── events{} — все загруженные events
        ├── allevents{} — для diff-вычисления
        └── results{} — найденные результаты
```

Оптимизации:

1. **Дедупликация процессов:** `execute()` проверяет, есть ли уже процесс для того же текста и того же набора чатов (через `hash = f.md5(roomIds.join(''))`)
2. **Инкрементальная загрузка:** события загружаются порциями по 80 (`paginate('b', 80)`), результаты эмитятся после каждой порции
3. **diff-фильтрация:** при каждой пагинации обрабатываются только новые события
4. **updateText без перезагрузки:** при изменении текста поиска результаты пересчитываются по уже загруженным событиям
5. **Таймаут 45 секунд:** процесс автоматически останавливается при превышении
6. **stopall():** при скрытии чата все процессы останавливаются

### 8.2 Fuzzy string matching

**Файл:** `src/application/functions.js` — `clientsearch()`, `wordComparison()`

Поиск реализован клиентским fuzzy matching через trigram-сравнение:
- `wordComparison()` — строит множество триграмм для обеих строк и вычисляет Jaccard index
- `stringComparison()` — разбивает на слова и ищет fuzzy match для каждого
- `clientsearch()` — порог совпадения 0.9 для общего поиска

Это позволяет находить сообщения с опечатками и варианты написания без серверного поиска.

---

## 9. Управление жизненным циклом компонентов

### 9.1 Полная очистка при destroy

**Файл:** `src/application/index.js` — `destroy()`

```javascript
destroy = function () {
    this.store.commit("clearall");
    this.removeEvents();
    this.user.destroy();
    this.mtrx.destroy();
    this.pcrypto.destroy();
    this.vm.$destroy();
    if (this.mtrx.bastyonCalls) this.mtrx.bastyonCalls.destroy();
};
```

Каскадное уничтожение всех подсистем предотвращает утечки памяти:
- Vuex state обнуляется
- Focus/online listeners удаляются
- Matrix client останавливается
- Crypto rooms очищаются
- SearchEngine уничтожается
- BastyonCalls уничтожается

### 9.2 Membership reactivity через setInterval

**Файл:** `src/components/chat/index.js`

```javascript
createMembershipReactivity: function () {
    this.membershipReactivity = setInterval(() => {
        if (!this.activated) return;
        this.membership = this.m_chat?.currentState.members[...].membership;
    }, 1000);
}
```

Отслеживание статуса membership через polling (1 секунда) вместо реактивного watcher на глубоком объекте Matrix. Это контролируемый подход — deep watch на currentState.members вызвал бы тысячи обновлений при sync.

### 9.3 Мгновенный guard в update()

**Файл:** `src/components/chat/list/index.js`

```javascript
update: function (e) {
    if (!this.activated) return;
    if (!this.scrolling) {
        this.autoPaginateAll();
    }
}
```

Мгновенная проверка `activated` предотвращает выполнение работы для невидимых компонентов.

---

## 10. Оптимизация медиа и файлов

### 10.1 Download с кэшем (IndexedDB / Cordova storage)

**Файл:** `src/application/mtrx.js` — `download()`

```
download(url):
  1. Проверить Cordova storage (мобильное приложение)
  2. Проверить IndexedDB (this.db)
  3. Скачать через XHR
  4. Сохранить в storage для будущего использования
```

Скачанные файлы (изображения, аудио, документы) сохраняются в IndexedDB. Повторный просмотр не вызывает сетевой запрос.

### 10.2 Кэш расшифрованных изображений на объекте события

**Файл:** `src/application/mtrx.js` — `getImage()`

```javascript
if (event.event.decryptedImage) {
    return Promise.resolve(event.event.decryptedImage);
}
// ... расшифрование ...
event.event.decryptedImage = url;
```

Аналогично для аудио: `event.event.decryptedAudio`, `event.event.content.audioData`.

Расшифрованные медиа кэшируются прямо на объекте события. При скроллинге вверх-вниз по чату повторное расшифрование не выполняется.

### 10.3 Последовательная обработка файлов

**Файл:** `src/application/functions.js` — `processArray()`

```javascript
f.processArray = function(array, fn) {
    return array.reduce(function(p, item) {
        return p.then(function() {
            return fn(item).then(function(data) {
                results.push(data);
            });
        });
    }, Promise.resolve());
}
```

Файлы отправляются/обрабатываются последовательно через Promise chain, а не параллельно. Это предотвращает перегрузку сети и памяти при отправке множества файлов.

### 10.4 AudioContext переиспользование

**Файл:** `src/application/index.js` — `getAudioContext()`

```javascript
getAudioContext() {
    if (this.audioContext && this.audioContext.state != "closed") {
        if (this.audioContext.state === "suspended") this.audioContext.resume();
        return this.audioContext;
    }
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return this.audioContext;
}
```

Один AudioContext переиспользуется для всего приложения. Создание нового AudioContext — дорогая операция, и браузеры ограничивают их количество.

---

## 11. Lazy loading и отложенная инициализация

### 11.1 Lazy routes

**Файл:** `src/router/router.js`

```javascript
component: () => import("@/views/contacts"),
component: () => import("@/views/chat"),
// ... все routes через dynamic import
```

Все route-level компоненты загружаются лениво, уменьшая начальный bundle.

### 11.2 Lazy SHA-224

**Файл:** `src/application/functions.js`

```javascript
var createHash = null;
f.sha224 = function (text) {
    if (!createHash) {
        createHash = require("create-hash");
    }
    // ...
};
```

Модуль `create-hash` загружается только при первом вызове SHA-224, а не при импорте модуля functions.

### 11.3 Отложенная подготовка чатов

**Файл:** `src/application/mtrxkit.js` — `prepareChat()`

```javascript
prepareChat(m_chat) {
    if (m_chat.getJoinRule() === "public") {
        return Promise.resolve();
    }
    return this.usersInfoForChatsStore([m_chat]).then(() => {
        return this.core.pcrypto.addroom(m_chat);
    });
}
```

Публичные чаты не проходят через подготовку криптографии. Криптография инициализируется для комнаты только при открытии чата (`prepareChat`), а не при загрузке списка.

### 11.4 Кэш tetatet на объекте чата

**Файл:** `src/application/mtrxkit.js` — `tetatetchat()`

```javascript
if (typeof m_chat.tetatet != "undefined") return m_chat.tetatet;
// ... вычисление ...
if (users.length > 1) m_chat.tetatet = tt;
```

Результат проверки "тет-а-тет" кэшируется на самом объекте комнаты. При повторных вызовах (а они частые — при каждом рендере превью чата) вычисление пропускается.

---

## 12. Уведомления и звуковые сигналы

### 12.1 Дедупликация уведомлений

**Файл:** `src/application/notifier.js`

```javascript
this.showed = JSON.parse(localStorage[this.key] || "{}");
// ...
if (this.showed[event.event.event_id]) return;
this.addshowed(event.event.event_id);
```

Каждое показанное уведомление записывается в localStorage. Это предотвращает повторные уведомления при пересинхронизации.

### 12.2 Throttle звуковых уведомлений

**Файл:** `src/application/notifier.js`

```javascript
notifySoundOrAction() {
    var lastsounddate = localStorage["lastsounddate"] || null;
    if (lastsounddate) {
        lastsounddate = new Date(lastsounddate);
        if (f.date.addseconds(lastsounddate, 10) > new Date()) {
            return; // не чаще чем раз в 10 секунд
        }
    }
    localStorage["lastsounddate"] = new Date();
    // ... play sound ...
}
```

Звуковые уведомления не могут воспроизводиться чаще, чем раз в 10 секунд.

### 12.3 Фильтрация уведомлений

**Файл:** `src/application/notifier.js` — `event()`

Уведомление НЕ показывается если:
- Событие уже прочитано (`isReaded`)
- Событие от текущего пользователя
- Событие старше 10 секунд
- Пользователь находится в этой комнате (`state.currentRoom === event.event.room_id`)
- Это stream-комната
- Push-правила Matrix говорят не уведомлять

### 12.4 `Vue.config.silent = true`

**Файл:** `src/main.js`

```javascript
Vue.config.silent = true;
```

Подавление всех Vue warnings в продакшне, что исключает overhead на проверки и вывод в консоль.

---

## 13. Платформо-зависимые оптимизации

### 13.1 Cordova/Mobile: отдельный storage path

```javascript
if (window.POCKETNETINSTANCE && window.POCKETNETINSTANCE.storage && window.cordova) {
    return window.POCKETNETINSTANCE.storage.saveFile(url, blob);
}
```

На мобильных устройствах файлы сохраняются через нативный Cordova storage вместо IndexedDB, что быстрее и имеет больший лимит.

### 13.2 Адаптивный router mode

**Файл:** `src/router/router.js`

```javascript
mode: document.getElementById("automomous") ? "history" : "abstract",
```

В standalone режиме — history mode; в embedded (widget в Bastyon) — abstract mode (без URL-навигации), что устраняет конфликты с routing основного приложения.

### 13.3 iOS AudioContext unmute

**Файл:** `src/application/index.js`

```javascript
if (f.isios() && window.unmute) {
    unmute(this.audioContext, false, false);
}
```

Обходное решение для ограничений iOS на автоматическое воспроизведение аудио.

---

## 14. Сводная таблица

| # | Оптимизация | Категория | Импакт | Файл(ы) |
|---|---|---|---|---|
| 1 | Двухуровневый кэш IndexedDB + Memory | Кэширование | Высокий | `chatstorage.js` |
| 2 | Многоуровневый API-кэш с батчингом | Кэширование | Высокий | `api.js` |
| 3 | Hex-декодирование мемоизация | Кэширование | Средний | `functions.js` |
| 4 | Кэш хэшей комнат | Кэширование | Средний | `mtrxkit.js` |
| 5 | Кэш userData при логине | Кэширование | Высокий | `mtrx.js` |
| 6 | Кэш AES-ключей | Кэширование | Высокий | `pcrypto.js` |
| 7 | Кэш расшифрованных событий | Кэширование | Высокий | `pcrypto.js` |
| 8 | Кэш пользователей через POCKETNETINSTANCE | Кэширование | Средний | `api.js` |
| 9 | Кэш displayName | Кэширование | Низкий | `index.js` |
| 10 | HideOptimization | Рендеринг | Высокий | `store.js`, `list/index.js` |
| 11 | readyToRender система | Рендеринг | Средний | `event/index.vue` |
| 12 | Debounced scroll/update | Рендеринг | Средний | `events/list/index.js` |
| 13 | Debounced readAll | Рендеринг | Средний | `chat/list/index.js` |
| 14 | Skip-update events по первому event_id | Рендеринг | Высокий | `store.js` |
| 15 | Гранулярный Vue.set для chatsMap | Рендеринг | Высокий | `store.js` |
| 16 | Гранулярный Vue.set для readreciepts | Рендеринг | Средний | `store.js` |
| 17 | _.isEqual guard для chatusers | Рендеринг | Средний | `store.js` |
| 18 | eventsByPages пагинация | Рендеринг | Средний | `events/list/index.js` |
| 19 | RAF smooth scroll | Рендеринг | Средний | `events/list/index.js` |
| 20 | Lazy import компонентов | Рендеринг | Средний | `event/index.vue`, `chat/index.js` |
| 21 | keep-alive activated/deactivated | Рендеринг | Высокий | Множество |
| 22 | Сохранение позиции скролла | UX/Рендеринг | Средний | `events/list/index.js` |
| 23 | initialSyncLimit: 4 | Matrix SDK | Критический | `mtrx.js` |
| 24 | disablePresence: true | Matrix SDK | Высокий | `mtrx.js` |
| 25 | TimelineWindow | Matrix SDK | Критический | `chat/list/index.js` |
| 26 | Управляемая пагинация | Matrix SDK | Высокий | `chat/list/index.js` |
| 27 | needLoad guard | Matrix SDK | Средний | `chat/list/index.js` |
| 28 | unpaginate при destroy | Matrix SDK | Высокий | `chat/list/index.js` |
| 29 | Заглушка getProfileInfo | Matrix SDK | Высокий | `mtrx.js` |
| 30 | Кастомный HTTP через axios | Matrix SDK | Средний | `mtrx.js` |
| 31 | IndexedDB Store | Matrix SDK | Высокий | `mtrx.js` |
| 32 | Дедупликация промисов расшифрования | Криптография | Высокий | `pcrypto.js` |
| 33 | Хэш-проверка изменения пользователей | Криптография | Средний | `pcrypto.js` |
| 34 | Lazy Proxy для ключей | Криптография | Средний | `pnuser.js` |
| 35 | setTimeout генерация ключей | Криптография | Средний | `pnuser.js` |
| 36 | Кэш WIF в LocalStorage | Криптография | Средний | `pnuser.js` |
| 37 | Дедупликация AES промисов | Криптография | Средний | `pcrypto.js` |
| 38 | Race-ping серверов | Сеть | Средний | `mtrx.js` |
| 39 | Auto-retry при noresponse | Сеть | Средний | `api.js` |
| 40 | fastsync | Сеть | Низкий | `mtrx.js` |
| 41 | Debounced active state | Vuex | Средний | `store.js` |
| 42 | Guard chatsready | События | Высокий | `mtrx.js` |
| 43 | Фильтрация событий | События | Высокий | `store.js` |
| 44 | Callback-based listeners | События | Средний | `listeners.js` |
| 45 | Отложенная Timeline загрузка | События | Средний | `chat/list/index.js` |
| 46 | setInterval вместо deep watch | События | Средний | `chat/index.js` |
| 47 | Инкрементальный SearchEngine | Поиск | Высокий | `searchEngine.js` |
| 48 | Fuzzy string matching | Поиск | Средний | `functions.js` |
| 49 | Каскадный destroy | Lifecycle | Высокий | `index.js` |
| 50 | Download + cache файлов | Медиа | Высокий | `mtrx.js` |
| 51 | Кэш на объекте события | Медиа | Средний | `mtrx.js` |
| 52 | Последовательная обработка файлов | Медиа | Средний | `functions.js` |
| 53 | AudioContext reuse | Медиа | Низкий | `index.js` |
| 54 | Lazy routes | Loading | Средний | `router.js` |
| 55 | Lazy SHA-224 | Loading | Низкий | `functions.js` |
| 56 | Ленивая подготовка чатов | Loading | Средний | `mtrxkit.js` |
| 57 | Кэш tetatet на объекте | Loading | Средний | `mtrxkit.js` |
| 58 | Дедупликация уведомлений | Уведомления | Средний | `notifier.js` |
| 59 | Throttle звука (10с) | Уведомления | Низкий | `notifier.js` |
| 60 | Vue.config.silent | Общее | Низкий | `main.js` |

---

## Заключение

Проект содержит **более 60 точек оптимизации**, сгруппированных в 13 категорий. Наиболее критичные:

1. **Двухуровневое кэширование** (memory + IndexedDB) для расшифрованных сообщений, ключей и API-данных — устраняет повторные дорогие операции
2. **HideOptimization** — полное отключение рендеринга при скрытии виджета
3. **initialSyncLimit + TimelineWindow + unpaginate** — трио оптимизаций Matrix SDK, минимизирующих объём данных в памяти
4. **Гранулярные обновления Vuex state** с guard-ами на идентичность — предотвращение каскадных перерисовок
5. **Дедупликация промисов** расшифрования и вычисления ключей — предотвращение параллельных криптографических операций

Несмотря на то что код местами выглядит как "костыли", каждое решение имеет конкретную причину — работа с тяжёлым Matrix SDK, E2E-шифрование на блокчейн-ключах, работа во встроенном виджете и на мобильных устройствах через Cordova.
