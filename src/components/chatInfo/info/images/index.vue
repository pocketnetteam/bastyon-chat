<template>
  <div class="chatInfoMedia">
    <imageEvents
      class="roomAboutWrapper"
      :chat="chat"
      :filterType="'images'"
      @eventImage="(e) => galleryImage(e)"
      @getEvents="eventsList"
      v-if="!empty"
      ref="list"
    />
    <!--      <div class="roomAboutImage" v-for="(item, index) in imageEvents" :key="item.index" v-if="!encrypted(item) || item.event.decryptedImage">-->
    <!--        <img :src="item.event.decryptedImage || item.event.content.url || item.getClearContent().url" alt="img" @click="showPhotoSwipe(item)"/>-->
    <!--        <div class="encryptedDataIcon" v-if="encrypted(item)"><i class="fas fa-lock"></i></div>-->
    <!--      </div>-->
    <div class="emptyBlock" v-else>
      <span>{{ $t("caption.noImages") }}</span>
    </div>
  </div>
</template>
<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
