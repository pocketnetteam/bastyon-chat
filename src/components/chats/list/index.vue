<template>
  <div
    class="chats-list"
    :class="{
      bin: pocketnet,
      bout: !pocketnet,
      minimized,
      fix: pocketnet,
      active,
      empty,
    }"
  >
    <div v-if="!unauthorized">
      <div class="work searchWrapperEA" v-if="!minimized || active">
        <search @search="search" :minimize="minimized" />
      </div>

      <teamroom
        v-if="!searchText && this.chats.length <= 2 && chatsready == true"
        @click="openTeamRoom"
      ></teamroom>

      <div class="listChatLoading" v-if="chatsready !== true">
        <dummypreviews />
      </div>

      <div class="Swipes" v-else>
        <transition name="fade">
          <div class="desktopList" v-if="showchatslist">
            <div
              class="chatswrapper"
              v-if="filteredchats.length || !searchText"
            >
              <RecycleScroller
                page-mode
                class="scroller"
                :items="filteredchats"
                :item-size="pocketnet ? 60 : 70"
                key-field="roomId"
                :buffer="pocketnet ? 400 : 700"
              >
                <template v-slot="{ item, active }">
                  <div
                    ref="content"
                    class="card-content"
                    v-if="item"
                    @click="(e) => itemClick(item)"
                  >
                    <preview v-if="active" :chat="item" />
                  </div>
                </template>
              </RecycleScroller>
            </div>

            <div class="work" v-else>
              <div class="chatsearchingempty">
                <span>{{ $t("caption.chatsearchingempty") }}</span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div v-else class="dmdv"></div>
  </div>
</template>
<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
<!--<style src="vue-swipe-actions/dist/vue-swipe-actions.css"></style>-->

<!-- THEMES BEGIN -->
<!-- THEMES END -->
