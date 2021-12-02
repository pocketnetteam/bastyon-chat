<template>


  <div class='chats-list' v-if="!unauthorized" :class="{'bin' : pocketnet, 'bout' : !pocketnet, minimized, fix : pocketnet, active, empty}">
    
    <teamroom v-if="this.chats.length <= 2 && chatsready == true" @click="openTeamRoom"></teamroom>
    
    <div class="listChatLoading" v-if="(chatsready !== true) && this.chats.length === 0">
      <dummypreviews/>
    </div>
    
    <div class="Swipes" v-else>
      <transition name="fade">
        <div class="desktopList">

         
          <RecycleScroller
              page-mode
              class="scroller"
              :items="chats"
              :item-size="pocketnet ? 60 : 70"
              key-field="roomId"
      
          >
            <template v-slot="{ item }">
              <div ref="content" class="card-content" v-if="item" @click="e=>itemClick(item)">
                  <preview
                    :chat="item"
                  />
              </div>
            </template>

          </RecycleScroller>
        </div>
      </transition>
    </div>

  </div>

</template>
<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
<style src="vue-swipe-actions/dist/vue-swipe-actions.css"></style>


<!-- THEMES BEGIN -->
<style scoped lang="sass" src="./themes/theme_white.sass"></style>
<style scoped lang="sass" src="./themes/theme_black.sass"></style>
<!-- THEMES END -->


