<template>
  <div class="list">
    <div class="item" v-bind:key="item.id" v-for="item in readyItems">
      <slot v-bind:item="item">
        {{ item.value }}
      </slot>
    </div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<style scoped lang="sass" src="./themes/theme_white.sass"></style>
<style scoped lang="sass" src="./themes/theme_black.sass"></style>
<!-- THEMES END -->
