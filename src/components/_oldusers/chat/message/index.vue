<template>
  <div class="message" :class="className">
    <div class="message__content">
      <p>{{message.text}}</p>
      <p class="content__time">{{message.time}}</p>
    </div>
  </div>
</template>
<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>


