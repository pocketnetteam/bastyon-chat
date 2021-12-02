<template>
  <div class="input-outter-div" v-bind:class="{ invalid: inputInvalidInner }" >
    <input 
      @focus="onFocusHandler" 
      v-bind:type="inputType" 
      v-bind:placeholder="inputPlaceholder"
      v-model="inputValue"
    >
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<style scoped lang="sass" src="./themes/theme_white.sass"></style>
<style scoped lang="sass" src="./themes/theme_black.sass"></style>
<!-- THEMES END -->





















