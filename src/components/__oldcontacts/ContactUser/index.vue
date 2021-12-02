<template>
  <div class='contact-user' @click="toContactInfo">
    <div class="user__avatar">

    </div>
    <div class="user__name">
      <span>{{rooms_data}}</span>
    </div>
<!--    <div-->
<!--        class="user__status"-->
<!--        :class="{ 'online': contact_data.status === 'online', 'offline': contact_data.status === 'offline' }"-->
<!--    ></div>-->
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
