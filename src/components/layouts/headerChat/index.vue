<template>
  <div class="topheader">
    <!--<div
        v-if="!isCoreRoute"
        class="header__back"
        @click="routeBack">
      <i class="fas fa-arrow-circle-left icon"></i>
    </div>-->

    <div v-if="!isCoreRoute" class="header__user-info">
      <span>{{ currentUserChat }}</span>
    </div>
    <div class="right-side"></div>
  </div>
</template>
<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
