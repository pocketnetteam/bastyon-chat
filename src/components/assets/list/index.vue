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
<!-- THEMES END -->
