<template>
  <div class="main-wrapper" :class="{ minimized, active }">
    <div class="chat-container">
      {{ query }} query
      <ContactsContainer v-if="page === 'contacts'" />
      <ChatsContainer v-if="page === 'chats'" />
      <SettingsContainer v-if="page === 'settings'" />
      <FooterChat />
    </div>
    <div v-if="showPage" class="chat-container-pages">
      <vue-page-transition name="fade-in-right" v-if="!mobile">
        <router-view></router-view>
      </vue-page-transition>
      <router-view v-else></router-view>

      <gallery
        v-if="gallery"
        :images="gallery.images"
        :index="gallery.index"
        @close="closeGallery"
      />
    </div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<style lang="scss">
.main-wrapper {
  display: flex;
  .chat-container {
    width: 400px;
    height: 100%;
    position: relative;

    &-pages {
      position: relative;
      height: 100%;
      width: calc(100% - 400px);
    }
  }
}
@media only screen and (max-width: 768px) {
  .main-wrapper {
    display: block;
    .chat-container {
      width: 100%;
      &-pages {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        z-index: 999;
        background: #fff;
      }
    }
  }
}
</style>
