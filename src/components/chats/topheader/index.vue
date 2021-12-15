<template>
  <div id="chatsTopheader">

    <topheader>
      <template v-slot:left>
        <div class="iconbutton" @click="cancelShare" v-if="share"><i class="fas fa-ban"></i></div>
        <div class="iconbutton" @click="minimizeall" v-if="(!minimized || active) && pocketnet && !share"><i class="fas fa-times"></i></div>
        <div class="iconbutton" @click="gotoapp" v-if="!pocketnet && !share"><img class="logo20" src="@/assets/logo20.svg"></div>
      </template>

      <template v-slot:leftadd >
        <!--<div class="iconbuttonsmall" :class="{active : !closebybg}" @click="changeCloseByBg" v-if="minimized">
          <i class="fas fa-map-pin"></i>
        </div>-->
      </template>
      

      <template v-slot:info>
        <span v-if="!share">{{ $t("caption.chats") }}</span>
        <span v-if="share">{{ $t("caption.shareWith") }}</span>
      </template>

      
      <template v-slot:rightadd >
        <router-link to="settings" v-if="!share">
          <div class="iconbuttonsmall">
            <i class="fas fa-cog"></i>
          </div>
        </router-link>
      </template>
     

      <template v-slot:right>

        <div class="iconbutton" @click="newchat" v-if="!share && (!minimized || active)"><i class="fas fa-plus"></i></div>

        <div v-else>
          <div class="iconbutton" v-if="window.cordova" @click="cordovashare"><i class="fas fa-share-alt"></i>
        </div>

      </div>
        

      </template>
    </topheader>


  
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<style scoped lang="sass" src="./themes/theme_white.sass"></style>
<style scoped lang="sass" src="./themes/theme_black.sass"></style>
<!-- THEMES END -->





















