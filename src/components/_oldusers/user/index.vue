<template>
  <div class='user' @click="toUserChat">
    <div class="user__avatar"></div>
    <div class="user__info">
      <p class="info__name">{{user_data}}</p>
      <p class="info__last-message">23:00</p>
    </div>
    <div class="user__time">22:00</div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>


