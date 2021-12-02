<template>
  <div id="chatAttachement">
    <div class="image" v-if="attachement.type == 'image'">
      <bgimage v-if="attachement.base64" :src="attachement.base64"/>
    </div>
    <div class="file" v-if="attachement.type == 'file'">

      <div class="fileicon">
        <i :class="fileicon"></i>
      </div>

      <div class="filename">
       <span>{{attachement.info.name || "File"}}</span>
      </div>
      <div class="filesize" v-if="humanReadableSize">
       <span>{{humanReadableSize}}</span>
      </div>
      
    </div>

    <div class="loading">
      <i class="fas fa-spinner fa-spin"></i>
    </div>

    <div class="cancel" @click="cancel">
      <i class="far fa-times-circle"></i>
    </div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<style scoped lang="sass" src="./themes/theme_white.sass"></style>
<style scoped lang="sass" src="./themes/theme_black.sass"></style>
<!-- THEMES END -->





















