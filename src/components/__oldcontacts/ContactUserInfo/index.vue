<template>
  <div class='contact-user-info'>
    <div class="info__avatar"></div>
    <div class="info__content">
      <div class="info__name">
        <span>{{contact_info}}</span>
      </div>
      <div class="info__tools">
        <button class="start-call">Call</button>
        <button class="start-chat" @click="checkChats">
          {{ $t("button.starChatButton") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

