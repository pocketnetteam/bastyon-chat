<template>
  <div id="contactView">
  
    <div class="imageWrapper">  
      <userpic :userinfo="contact"/>
    </div>

    <div class="nameWrapper">
      <span>{{contact.name}}</span>
    </div>
  
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<style scoped lang="sass" src="./themes/theme_white.sass"></style>
<style scoped lang="sass" src="./themes/theme_black.sass"></style>
<!-- THEMES END -->
