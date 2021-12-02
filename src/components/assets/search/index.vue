<template>
  <div id="search" :class="{'bin' : pocketnet, 'bout' : !pocketnet, minimized, fix : pocketnet, active}">
    
      <div class="searchWrapper">

        <div class="inputWrapper">
          <input ref="input" :placeholder="placeholder || this.$i18n.t('caption.search')" @keyup="change" @input="change" :value="searchTxt" @focus="focused" @blur="blured" type="text"/>
        </div>
        <div class="iconWrapper" @click="clickicon">
          <i class="fas fa-search"></i>
        </div>

      </div>
  
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<style scoped lang="sass" src="./themes/theme_white.sass"></style>
<style scoped lang="sass" src="./themes/theme_black.sass"></style>
<!-- THEMES END -->





















