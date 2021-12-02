<template>
  <div id="preloader" :platform="platform" :class="{'bin' : pocketnet, 'bout' : !pocketnet, minimized, fix : pocketnet, active}">

 

    <div class="variant ">

      <div class="iospreloadercenter">

        <div class="spinner-eff spinner-eff-3">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <div class="circle circle-3"></div>
        </div>

      </div>
    </div>

    
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index_ex.sass"></style>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<style scoped lang="sass" src="./themes/theme_white.sass"></style>
<style scoped lang="sass" src="./themes/theme_black.sass"></style>
<!-- THEMES END -->



































