<template>
  <div id="chatJoin" class="maskedtop" :class="{minimized, active}">
    <div class="work">

      <div class="caption">
        <span v-if="!creatorLeft">
          {{ $t("caption.chatInvite") }}
        </span>
        <span v-if="creatorLeft">{{ $t("caption.cantJoin") }}</span>
      </div>

    </div>

    <chatPreview :usersinfo="usersinfo" :chat="chat" :m_chat="m_chat" :undefinedRoom="creatorLeft"/>
    
    <div class="tip" v-if="!blockedCheck">
      <span v-if="!creatorLeft">{{ $t("caption.chatInviteDecline") }}</span>
      <span v-if="creatorLeft">{{ $t("caption.creatorLeft") }}</span>
    </div>


    <div v-if="!hiddenInParent" class="joinAction fixedOnPageBottom" :class="{'bin' : pocketnet, 'bout' : !pocketnet}">
      <div class="work">
        <div class="actions" v-if="!blockedCheck">
          <div class="action" v-if="!creatorLeft && !tetatet">
            <button class="small button black rounded" @click="decline">{{ $t("button.decline") }}</button>
          </div>

          <div class="action" v-if="tetatet">
            <button class="small button black rounded" @click="ignore">{{ $t("button.declineandignore") }}</button>
          </div>

          <div class="action" v-if="!creatorLeft">
            <button class="small button rounded" @click="join">{{ $t("button.join") }}</button>
          </div>
          <div class="action" v-if="creatorLeft">
            <button class="small button rounded" @click="back">{{ $t("button.ok") }}</button>
          </div>
        </div>

        <div class="actions" v-else>
          <div class="blocked">
            <span>You have blocked this user</span>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
<style src="../../../../node_modules/vue-simple-accordion/dist/vue-simple-accordion.css"></style>
<style src="../../../../node_modules/swiper/swiper-bundle.css"></style>

<!-- THEMES BEGIN -->
<style scoped lang="sass" src="./themes/theme_white.sass"></style>
<style scoped lang="sass" src="./themes/theme_black.sass"></style>
<!-- THEMES END -->





















