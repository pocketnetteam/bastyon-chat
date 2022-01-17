var _ = require('underscore');
import f from "@/application/functions";

const BN = require('bn.js')
import * as miscreant from "miscreant";
var pbkdf2 = require('pbkdf2')
//import cryptoRandomString from 'crypto-random-string';

//var ncrypto = require('crypto')

var salt = 'PR7srzZt4EfcNb3s27grgmiG8aB9vYNV82'

var secp256k1CurveN = null

/**
 * PcryptoStorage annotations:
 *
 * 1. New IndexedDB structure must be handled
 *    if there are any in new release inside of
 *    onupgradeneeded listener.
 *
 * 2. New version number must be assigned on
 *    new releases of this object.
 */
const PcryptoStorage = function(storageName, version) {
    /** Set this flag to TRUE if debug logs needed */
    const DebugFlag = false;
    const DebugForceLocalStorage = false;

    let debugLog = () => {};

    if (DebugFlag) {
        debugLog = console.log;
    }

    /** Time constants */
    const SecondsInHour = 60 * 60;
    const SecondsInDay = SecondsInHour * 24;
    const SecondsInMonth = SecondsInDay * 30;

    /**
     * Function generates UNIX timestamp
     * floored to current hour.
     *
     * @return {number}
     */
    function getHourUnixtime() {
        const dateNow = Math.floor(Date.now() / 1000);
        const hourUnix = dateNow - (dateNow % SecondsInHour);

        return hourUnix;
    }

    /**
     * Using IndexedDB initializer
     * if it is supported.
     */
    function initIndexedDb() {
        let db;

        let openRequest = indexedDB.open(storageName, version);

        openRequest.onupgradeneeded = function (e) {
            let db = openRequest.result;

            const isVersionChanged = (e.oldVersion !== e.newVersion);
            const didExistBefore = (e.oldVersion === 0);

            /**
             * If PCryptoStorage version is changed,
             * then ObjectStore could be removed.
             */
            if (isVersionChanged && !didExistBefore) {
                if (!db.objectStoreNames.contains('items')) {
                    db.deleteObjectStore('items');
                }
            }

            /**
             * Here PCryptoStorage creates ObjectStore
             * needed to function correctly.
             */
            if (!db.objectStoreNames.contains('items')) {
                db.createObjectStore('items', {keyPath: 'id'});
            }
        };

        /**
         * Function removes items cached
         * in IndexedDB 30 days ago
         */
        function clearOldItems() {
            const timeFromCurrent = getHourUnixtime() - SecondsInMonth;

            const transaction = db.transaction('items', 'readwrite');
            const items = transaction.objectStore('items');

            const req = items.openCursor();

            req.onsuccess = (data) => {
                const cursor = data.target.result;

                if (cursor) {
                    if (timeFromCurrent >= cursor.value.cachedAt) {
                        debugLog('PCryptoStorage CLEAR OUTDATED log', data);
                        cursor.delete();
                    }

                    cursor.continue();
                }
            };

            req.onerror = (data) => {
                debugLog('PCryptoStorage CLEAR OUTDATED error', data);
            };
        }

        /**
         * Function opens IDBDatabase transaction.
         *
         * @param {string} name - Name of IDBDatabase store
         * @param {boolean} writeMode - Enable write mode
         *
         * @return {IDBTransaction}
         */
        function openTransaction(name, writeMode = false) {
            const transaction = db.transaction('items', 'readwrite');

            transaction.onsuccess = function (data) {
                debugLog('PCryptoStorage TRANSACTION finished', data);
            };

            transaction.onabort = function (data) {
                debugLog('PCryptoStorage TRANSACTION abort', data.target.error);
            }

            transaction.onerror = function (data) {
                debugLog('PCryptoStorage TRANSACTION error', data.target.error);
            };

            return transaction;
        }

        const instanceFunctions = {
            clear: (itemId) => {
                debugLog('PCryptoStorage clearing', itemId);

                function executor(resolve, reject) {
                    const transaction = openTransaction('items', true);
                    const items = transaction.objectStore('items');

                    const req = items.delete(itemId);

                    req.onsuccess = (data) => {
                        debugLog('PCryptoStorage CLEAR log', data);
                        resolve(true);
                    };

                    req.onerror = (data) => {
                        debugLog('PCryptoStorage CLEAR error', data.target.error);
                        reject(data.target.error);
                    };
                }

                return new Promise(executor);
            },
            set: (itemId, message) => {
                debugLog('PCryptoStorage writing', itemId);

                function executor(resolve, reject) {
                    const transaction = openTransaction('items', true);
                    const items = transaction.objectStore('items');

                    const unixtime = getHourUnixtime();

                    const item = {
                        id: itemId,
                        message,
                        cachedAt: unixtime,
                    };

                    /**
                     * FIXME: It is not the best practice to use
                     *        here put() instead of add(), but it
                     *        solves vue.js repeating decryption
                     *        requests as it doesn't throw Error
                     *        on data update...
                     */
                    const req = items.put(item);

                    req.onsuccess = function (data) {
                        debugLog('PCryptoStorage SET log', data);
                        resolve(true);
                    };

                    req.onerror = function (data) {
                        debugLog('PCryptoStorage SET error', data.target.error);
                        reject(data.target.error);
                    };
                }

                return new Promise(executor);
            },
            get: (itemId) => {
                debugLog('PCryptoStorage reading', itemId);

                function executor(resolve, reject) {
                    const transaction = openTransaction('items');
                    const items = transaction.objectStore('items');

                    const req = items.get(itemId);

                    req.onsuccess = (data) => {
                        debugLog('PCryptoStorage GET log', data, req.result);

                        if (!req.result) {
                            reject('Data does not exist');
                            return;
                        }

                        const foundMessage = ('message' in req.result);

                        if (!foundMessage) {
                            reject('Message property does not exist');
                            return;
                        }

                        resolve(req.result.message);
                    };

                    req.onerror = (data) => {
                        console.log('PCryptoStorage GET error', data);
                        reject(data.target.error);
                    };
                }

                return new Promise(executor);
            },
        }

        function executor(resolve, reject) {
            openRequest.onerror = function (err) {
                debugLog('PCryptoStorage error occurred:', err);
                reject('PCryptoStorage error initiating IndexedDB');
            };

            openRequest.onsuccess = function () {
                db = openRequest.result;

                clearOldItems();

                resolve(instanceFunctions);
            };
        }

        return new Promise(executor);
    }

    /**
     * Using LocalStorage initializer
     * if IndexedDB is not supported.
     */
    function initLocalStorage() {
        /**
         * Function removes items cached
         * in LocalStorage 7 days ago
         */
        function clearOldItems() {
            const timeFromCurrent = getHourUnixtime() - SecondsInDay * 7;

            let k = Object.keys(localStorage);

            let msgItems = k.filter(item => item.includes(storageName));

            msgItems.forEach((msgItem) => {
                const msg = JSON.parse(localStorage[msgItem]);

                console.log(msg);

                if (timeFromCurrent >= msg.cachedAt) {
                    console.log('PCryptoStorage CLEAR OUTDATED log', msg);

                    delete localStorage[msgItem];
                }
            });
        }

        const instanceFunctions = {
            clear: async (itemId) => {
                debugLog('PCryptoStorage clearing localstorage', itemId);

                const itemName = `${storageName}_${itemId}`;

                const isItemSet = (itemName in localStorage);

                if (!isItemSet) {
                    throw Error('Data does not exist');
                }

                const foundMessage = ('message' in localStorage[itemName]);

                if (!foundMessage) {
                    throw Error('Message property does not exist');
                }

                delete localStorage[itemName];

                return new Promise(executor);
            },
            set: async (itemId, message) => {
                debugLog('PCryptoStorage writing localstorage', itemId);

                const itemName = `${storageName}_${itemId}`;
                const unixtime = getHourUnixtime();

                const item = {
                    message,
                    cachedAt: unixtime,
                };

                localStorage[itemName] = JSON.stringify(item);
            },
            get: async (itemId) => {
                debugLog('PCryptoStorage reading', itemId);

                const itemName = `${storageName}_${itemId}`;

                const isItemSet = (itemName in localStorage);

                if (!isItemSet) {
                    throw Error('Data does not exist');
                }

                return localStorage[itemName];
            },
        };

        /** Clearing old items on init */
        clearOldItems();

        return instanceFunctions;
    }

    /**
     * Is IndexedDB supported?
     */
    if(!window.indexedDB || DebugForceLocalStorage) {
        debugLog('PCryptoStorage LOCALSTORAGE_FALLBACK');
        return initLocalStorage();
    }

    return initIndexedDb();
};

var PcryptoRoom = async function(pcrypto, chat, {ls, lse}){
    var self = this
    this.configurable = false

    var hashes = {}

    var users = {}
    var m = 12

    var usersinfo = {}
    var usershistory = []

    var pcryptoFile = new PcryptoFile()

    chat.pcrypto = self
    
    self.clear = function(){

        hashes = {}
        usersinfo = {}
        usershistory = []
        users = {}
    
    }

    var lcachekey = 'pcrypto4_' + chat.roomId + '_';
    var ecachekey = 'e_pcrypto4_';
    var cache = {}

    

    self.preparedUsers = function(time){
        return _.filter(getusersinfobytime(time), function(ui){
            return ui.keys && ui.keys.length == m
        })
    }

    self.cantchat = function(){

        var pu = self.preparedUsers()

        if (pcrypto.core.mtrx.kit.tetatetchat(chat) && pu.length && pu.length < 2){
            return true
        }

        return false
    }

    self.canBeEncrypt = function(time){

        var usersinfoArray = _.toArray(usersinfo)

        if (

            pcrypto.user && pcrypto.user.private && pcrypto.user.private.length == 12 && 
            users[pcrypto.user.userinfo.id] && 
            pcrypto.core.mtrx.kit.tetatetchat(chat) &&
            usersinfoArray.length > 1 && usersinfoArray.length < 5 && 
            self.preparedUsers(time).length / usersinfoArray.length > 0.6){

            return true

        }

        return false

    }


    self.userschanded = function(){

        if(!self.cantchat()){
            return Promise.resolve()
        }
        
        self.clear()

        return self.prepare()
    }

    var getusersinfo = function(){
        var us = _.map(users, function(uh){
            return uh.id
        }) 

        /////////////////// FAIL

        return pcrypto.core.user.usersInfo(us).then(_usersinfo => {

            usersinfo = {}
            
            _.each(_usersinfo, function(ui){
                usersinfo[ui.id] = ui
            })

            return Promise.resolve()
        })
    }

    var getuserseventshistory = function(){


        var tetatet = pcrypto.core.mtrx.kit.tetatetchat(chat) 

        var history =  _.filter(_.map(chat.currentState.getStateEvents("m.room.member"), function(ue){
            var event = ue.event

            var membership = event.content.membership

            if (membership == 'join' || (membership == 'leave' && !tetatet) || (tetatet && membership == 'invite')){

                return {
                    time : event.origin_server_ts || 1,
    
                    membership : membership,
    
                    id : membership == 'invite' ? f.getmatrixid(event.state_key) : f.getmatrixid(event.sender)
                }
            }

            return null

        }), function(h){
            return h
        }) 

        history = _.sortBy(history, function(ui){
            return ui.time
        })

        return history
    }

    var period = function(time){
        var period = 0
        var h = getuserseventshistory()

        for(var i = h.length - 1; i >= 0; i--){
            if(h[i].time < time && !period){
                period = i
            }
        }

        return period
    }

    var getusershistory = function(){
        var history = getuserseventshistory()

        var tetatet = pcrypto.core.mtrx.kit.tetatetchat(chat) 

        _.each(history, function(ui){
            if(!users[ui.id]) {
                users[ui.id] = {
                    id : ui.id,
                    life : []
                }
            }

            var l = users[ui.id].life

            if (ui.membership && (ui.membership == 'join' || (ui.membership == 'invite' && tetatet))){
                l.push({
                    start : tetatet ? 1 : ui.time
                })
            }
            else{

                if (l.length && ui.membership == 'leave' && !tetatet){
                    var last = l[l.length - 1]

                    last.end = ui.time
                }
                
            }
        })

        //console.log("history", history)

    }

    var getusersinfobytime = function(time){
        var us = getusersbytime(time)

        return _.filter(_.map(us, function(u){
            return usersinfo[u.id]
        }), function(u){return u})
    }

    var getusersbytime = function(time){
        return _.filter(users, function(ui){

            var l = _.find(ui.life, function(l){

                if(!time){
                    if(l.start && !l.end) return true
                }
                else{
                    if(l.start < time && (!l.end || l.end > time)) return true
                }

            })

            if(l) return true
        })
    }

    //self.users = users
    self.getusersinfobytime = getusersinfobytime

    self.prepare = function(){

        getusershistory()

        return getusersinfo().then(r => {
            return self
        })

    }


  

    var convert = {
        aeskeys : {
            inp : function(k){
                var kr = {}

                _.each(k, function(v, i){
                    kr[i] = f._arrayBufferToBase64(v)
                })

                return kr
            },
            out : function(k){

                var kr = {}

                _.each(k, function(v, i){
                    kr[i] = new Uint8Array(f._base64ToArrayBuffer(v))
                })

                return kr

            }
        }
    }
    

    var eaac = {
        aeskeysls : function(time, block){

            if(!time) time = 0
            if(!block) block = pcrypto.currentblock.height

            var k = period(time) + '-' + block
       
            return ls.get(`${lcachekey + pcrypto.user.userinfo.id}-${k}`).then((keys) => {

                const keysPrepared = convert.aeskeys.out(keys);

                return { keys: keysPrepared, k }

            }).catch ( async () => {

                const keysPrepared = eaac.aeskeys(time, block);

                if (self.preparedUsers(time).length > 1){

                    const itemId = `${lcachekey + pcrypto.user.userinfo.id}-${k}`;

                    await ls.set(itemId, convert.aeskeys.inp(keysPrepared)).catch(() => {
                        console.error('Error writing item on LS.SET');
                    });

                }

                return { keys: keysPrepared, k }
            });


        },
        aeskeys : function(time, block){

            if(!time) time = 0
            if(!block) block = pcrypto.currentblock.height

            return eaa.aeskeys(time, block)

            var timep = period(time)
            var k = timep + '-' + block

            if(cache[k]){
                return cache[k]
            }

            cache[k] = eaa.aeskeys(time, block)

            return cache[k]
        }
    }

    var eaa = {

        cuhash : function(users, num, block){

            return pbkdf2.pbkdf2Sync(f.sha224(_.map(users, function(u){
                return u.keys[num]
            }).join('') + (block || pcrypto.currentblock.height)).toString('hex'), salt, 1, 32, 'sha256') 

        },

        userspublics : function(time, block){

            var users = self.preparedUsers(time)

            var sum = {}

            _.each(users, function(user){

                if (user.id == pcrypto.user.userinfo.id && users.length > 1){ return }

                var publics = _.map(user.keys, function(key){
                    return Buffer.from(key, 'hex')
                })

                sum[user.id] = eaa.points(time, block, publics)
            })

            return sum
        },

        current : function(time, block){

            var privates = _.map(pcrypto.user.private, function(key){
                return key.private
            })

            var buf = Buffer.allocUnsafe(32)
            var sc = eaa.scalars(time, block, privates).toBuffer()

            sc.copy(buf, 32 - sc.length)

            return buf
        },

        scalars : function(time, block, scalars){

            var users = self.preparedUsers(time)
    
            var sum = null
    
            for(var i = 0; i < m; i++){
    
                var ch = new BN(this.cuhash(users, i, block))

                var a = new BN(scalars[i], 16);

                var mul = a.mul(ch).umod(secp256k1CurveN)
    
                if(!i){
                    sum = mul
                }
                else{
                    sum = sum.add(mul).umod(secp256k1CurveN)
                }
            }

            return sum

        },

        points : function(time, block, points){

            var users = self.preparedUsers(time)
    
            var sum = null

    
            for(var i = 0; i < m; i++){

    
                var ch = this.cuhash(users, i, block) 
                
                var mul = bitcoin.ecc.pointMultiply(points[i], ch, undefined, true)
    
                if(!i){
                    sum = mul
                }
                else{
                    sum = bitcoin.ecc.pointAdd(sum, mul, undefined, true)
                }
            }

            return sum

        },

        aeskeys : function(time, block){

            var us = eaa.userspublics(time, block);
            var c = eaa.current(time, block)

            var su = {}

            _.each(us, function(s, id){

                if (id != pcrypto.user.userinfo.id){
                    su[id] = bitcoin.ecc.pointMultiply(s, c, undefined, true)
                    su[id] = pbkdf2.pbkdf2Sync(su[id].toString('hex'), salt, 64, 32, 'sha512')
                }

                
            })

            return su
        }
    }

    self.decrypt = async function(userid, {encrypted, nonce}, time, block){

        let { keys, k } = await eaac.aeskeysls(time, block);

        var error = null

       

        if (keys[userid]){
            try{
                return await decrypt(keys[userid], {encrypted, nonce})
            }
            catch(e){
                error = e
            }
            
        }
        else{
            error = 'emptykey'
        }

        await ls.clear(`${lcachekey + pcrypto.user.userinfo.id}-${k}`)
            .catch((err) => {
                console.error('Error clearing item on LS.CLEAR');
            });

        throw new Error(error)

    }

    self.encrypt = async function(userid, text){
        let { keys } = await eaac.aeskeysls();

        if (keys[userid]){
            return await encrypt(text, keys[userid])
        }

        throw new Error('emptykey')
    }   

    self.decryptEvent = async function(event){
        if(!pcrypto.user.userinfo) {
            throw new Error('userinfo');
            
        }

        if (event.decrypting){
            return event.decrypting
        }

        var dpromise = lse.get(`${ecachekey + pcrypto.user.userinfo.id}-${event.event_id}`).then((stored) => {

            return stored

        }).catch(async (err) => {

            const sender = f.getmatrixid(event.sender);
            const me = pcrypto.user.userinfo.id;

            let keyindex, bodyindex;

            const body = JSON.parse(f.Base64.decode(event.content.body));
            const time = event.origin_server_ts || 1;
            const block = event.content.block;

            if (sender == me) {
                _.find(body, function(s, i) {
                    if (i != me) {
                        keyindex = i;
                        bodyindex = i;

                        return true;
                    }
                });
            } else {
                bodyindex = me;
                keyindex = sender;
            }

            if(!body[bodyindex]) {
                throw new Error('emptyforme');
            }

            return self.decrypt(keyindex, body[bodyindex], time, block);

        }).then(decrypted => {

            return {
                body: decrypted,
                msgtype: 'm.text'
            }

        }).finally(() => {
            delete event.decrypting
        })

        event.decrypting = dpromise

        return dpromise
    }

    self.encryptFile = async function(file, p){
        var secret = await pcryptoFile.randomkey()

        var secrets = await self.encryptKey(secret)

        var result = {
            file : null,
            secrets : secrets
        }

        return pcryptoFile.encryptFile(file, secret, p).then(file => {
            result.file = file

            return Promise.resolve(result)
        }).catch(e => {

            console.error(e)

            return Promise.reject(e)
        })
    }

    self.decryptFile = async function(file, secret, p){

        return pcryptoFile.decryptFile(file, secret, p).then(file => {
            return Promise.resolve(file)
        })
    }

    self.encryptKey = async function(key){
        var users = self.preparedUsers()

        var encrypted = {
            block : pcrypto.currentblock.height,
            keys : {}
        }

        for(var i = 0; i < users.length ; i++){
            var user = users[i]

            if(user.id != pcrypto.user.userinfo.id || users.length <= 1){
                encrypted.keys[user.id] = await self.encrypt(user.id, key)
            }
        }

   
        encrypted.keys = f.Base64.encode(JSON.stringify(encrypted.keys))
        
        return encrypted
    }

    self.decryptKey = async function(event){

        if(!pcrypto.user.userinfo){
            throw new Error('userinfo')
        }

        var secrets = f.deep(event, 'content.info.secrets.keys') || f.deep(event, 'content.pbody.secrets.keys')
        var block = f.deep(event, 'content.info.secrets.block') || f.deep(event, 'content.pbody.secrets.block')
        

        if(!secrets) throw new Error('secrets')
        if(!block) throw new Error('block')
        
        var sender = f.getmatrixid(event.sender)
        var me = pcrypto.user.userinfo.id

        var keyindex = null,
            bodyindex = null;

        var body = JSON.parse(f.Base64.decode(secrets))
        var time = event.origin_server_ts || 1
        
        if (sender == me){

            _.find(body, function(s, i){

                if (i != me){

                    keyindex = i
                    bodyindex = i

                    return true
                }
                
            })
        }
        else{
            bodyindex = me
            keyindex = sender
        }

        if(!body[bodyindex]) throw new Error('emptyforme')

        var decryptedKey = await self.decrypt(keyindex, body[bodyindex], time, block)

        return decryptedKey

    }

    self.encryptEvent = async function(text){

        var users = self.preparedUsers()

        var encryptedEvent = {
            block : pcrypto.currentblock.height,
            msgtype: 'm.encrypted',
            body : {}
        }

        //console.log(users, encryptedEvent, text)

        for(var i = 0; i < users.length ; i++){
            var user = users[i]

            if(user.id != pcrypto.user.userinfo.id || users.length <= 1){
                encryptedEvent.body[user.id] = await self.encrypt(user.id, text)
            }
        }

   
        encryptedEvent.body = f.Base64.encode(JSON.stringify(encryptedEvent.body))
        
        return encryptedEvent
    }

    var decrypt = async function(keyData, {encrypted, nonce}){

        var key = await miscreant.SIV.importKey(keyData, "AES-SIV");

        var _encrypted = new Uint8Array(f._base64ToArrayBuffer(encrypted))
        var _nonce = new Uint8Array(f._base64ToArrayBuffer(nonce))

        var k = await key.open(_encrypted, _nonce)

        var decrypted = await new TextDecoder().decode(k)

        return decrypted
    }

    var encrypt = async function(text, keyData){

        let key = await miscreant.SIV.importKey(keyData, "AES-SIV");

        let plaintext = new Uint8Array(new TextEncoder().encode(text));
        let nonce = new Uint8Array(32);

        window.crypto.getRandomValues(nonce);

        let ciphertext = await key.seal(plaintext, nonce);

        let encrypted  = {
            encrypted: f._arrayBufferToBase64(ciphertext.buffer),
            nonce: f._arrayBufferToBase64(nonce.buffer),
        }


        return encrypted
    }
    

    return self
}

var PcryptoFile = function(){
    var self = this;
    var iv = [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];

   

    var readFile = function(file) {

        let reader = new FileReader();

        if(window.cordova) reader = reader._realReader

        reader.readAsArrayBuffer(file);

        return new Promise((resolve, reject) => {
            
            reader.onloadend = function(evt) {
                resolve(reader.result);
            };
            
            reader.onerror = function() {
                reject(reader.error);
            };
        })
    }

    var convertFile = function(blob, file){
		return new (window.wFile || window.File)([blob], "encrypted", { type: "encrypted/" + file.type, name : file.name })
	}

    var convertDecryptedFile = function(blob, file){
		return new (window.wFile || window.File)([blob], "decrypted", { 
            type: (file.type || "").replace('encrypted/', ''), name : 'Unnamed'
        })
	}

    self.randomkey = function(){

        return new Promise((resolve) => {

            var array = new Uint32Array(24);

            var token = window.crypto.getRandomValues(array).toString('hex');
            console.log('token', token)
            resolve(token)

            /*ncrypto.randomBytes(24, function(err, buffer) {
                var token = buffer.toString('hex');

                console.log('token', token)

                resolve(token)
            });*/
        })
       

        //return cryptoRandomString({length: 24});
    }

    self.key = function(str){

        let enc = new TextEncoder();

        function getKeyMaterial() {
            

            return window.crypto.subtle.importKey(
              "raw",
              enc.encode(str),
              "PBKDF2",
              false,
              ["deriveBits", "deriveKey"]
            );
        }

        return getKeyMaterial().then(key => {
            return window.crypto.subtle.deriveKey(

                {
                    "name": "PBKDF2",
                    salt: enc.encode('matrix.pocketnet'),
                    "iterations": 10000,
                    "hash": "SHA-256"
                },
    
                key,
    
                { "name": "AES-CBC", "length": 256},
    
                true,
    
                [ "encrypt", "decrypt" ]
    
            );
        })

        
    }

    self.encryptFile = function(file, secret, p){
        return readFile(file).then(r => {

            return self.encrypt(r, secret, p)
        }).then(encrypted => {

            return Promise.resolve(convertFile(encrypted, file))
        })
    }

    self.decryptFile = function(file, secret, p){
        return readFile(file).then(r => {
            

            return self.decrypt(r, secret, p)
        }).then(decrypted => {

            return Promise.resolve(convertDecryptedFile(decrypted, file))
        })
    }

    self.encrypt = function(strBytes, secret, p){

        if(!strBytes || !secret) return Promise.reject('data')

        if (!p) p = {};

        p.charsetEnc = (p.charsetEnc || 'utf8')
        p.charsetDec = (p.charsetDec || 'hex')

        //var strBytes = aesjs.utils[p.charsetEnc].toBytes(str);

        return self.key(secret).then(key => {

            return crypto.subtle.encrypt({
                name: "AES-CBC",
                iv: new Uint8Array(iv)
            }, key, strBytes)
                
        }).then(function (encrypted) {

            return encrypted

        })
    };

    self.decrypt = function (encryptedBytes, secret, p) {

        if(!encryptedBytes || !secret) return Promise.reject('data')

        if (!p) p = {};

        p.charsetEnc = (p.charsetEnc || 'utf8')
        p.charsetDec = (p.charsetDec || 'hex')


        return self.key(secret).then(key => {

            if(!crypto.subtle) return Promise.reject('crypto.subtle')

            return crypto.subtle.decrypt({
                name: "AES-CBC",
                iv: new Uint8Array(iv)
            }, key, encryptedBytes)
                

        }).then(function (decrypted) {
            return decrypted
        }).catch(e => {
            return Promise.reject(e)
        })

    }

    return self
}

var Pcrypto = function(core, p){

    const EC = require('elliptic').ec
    const secp256k1 = new EC('secp256k1')

    secp256k1CurveN = secp256k1.curve.n

    var self = this
    var ls, lse
   

    self.core = core

    self.clearStorage = function(){
        self.core.mtrx.clearstorage('pcrypto')
    }

    self.currentblock = {
        height : 1
    };

    self.blocks = {}

    self.user = null
    self.rooms = {}

    self.init = function(user){
        self.user = user
    }

    self.destroy = function(){
        _.each(self.rooms, function(r){
            r.clear()
        })

        self.rooms = {}
        /*self.user = null*/
    }

    self.addroom = function(chat){

        return pretry(() => {

            return core.user.private && core.user.private.length == 12

        }).then(async (r) => {

            if (self.rooms[chat.roomId]){
                return self.rooms[chat.roomId].prepare()
            }

            var room = await new PcryptoRoom(self, chat, {ls, lse})

            self.rooms[chat.roomId] = room
    
            return room.prepare()
            
        })

        
    }


    self.set = {
        block : function(block){

            if (block && block.height > self.currentblock.height){
                self.currentblock = block
            }
                
            if (block.height){
                self.blocks[block.height] = block
            }
                
        }
    }

    self.helpers = {
        checkuser : function(){
            if(core.user && core.user.private && core.user.private.length == 12 && core.user.userinfo && core.user.userinfo.keys && core.user.userinfo.keys.length){

                var pk = core.user.userinfo.keys.join(',')

                var pk2 = _.map(core.user.private, function(p){
                    return p.public
                }).join(',')

                return pk == pk2

            }

            return false
        },

        /*alternativeKeys : function(){
            if(core.user && core.user.private){

                var pk2 = _.map(core.user.private, function(p){
                    return p.public
                })

                return pk2

            }

            return []
        }*/

    }

    self.prepare = function(){
       
        return Promise.all([PcryptoStorage('messages', 1), PcryptoStorage('events', 1)]).then((r) => {

            ls = r[0]
            lse = r[1]

            return Promise.resolve()
        })

    }

    return self
}


export default Pcrypto