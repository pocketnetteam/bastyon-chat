<template>
    
  <div class='main-wrapper' :class="{minimized, active}">
    <vue-page-transition name="fade-in-right" v-if="!mobile">
        <router-view
         @sendMassMessage="sendMassMessage"
        ></router-view>
    </vue-page-transition>
    <router-view v-else></router-view>=

    <FooterChat v-if="showFooter"/>

    <gallery v-if="gallery" :images="gallery.images" :index="gallery.index" @close="closeGallery"/>
    
  </div>

</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>


