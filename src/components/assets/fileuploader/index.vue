<template>
  <div id="fileupload">
    <div class="uploader">
      <div class="contentWrapper">
        <slot name="content">
          {{ $t("caption.uploadFiles") }}
        </slot>
      </div>
      <div class="inputWrapper">
        <input v-if="multiple" v-on:change="handle" type="file">
        <input v-else v-on:change="handle" type="file">
      </div>
      <!--<preloader v-show="loading"/>-->
    </div>
    <div class="drop" v-on:drop="handle" v-on:dragover="dragover" v-on:dragout="dragout">
    </div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<style scoped lang="sass" src="./themes/theme_white.sass"></style>
<style scoped lang="sass" src="./themes/theme_black.sass"></style>
<!-- THEMES END -->



































