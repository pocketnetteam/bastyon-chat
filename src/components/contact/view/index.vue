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
<!-- THEMES END -->
