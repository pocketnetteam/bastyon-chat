<template>
  <div class='user-chat'>
    <v-message
        v-for="message in messages"
        :key="message.id"
        :message="message"
    />
    <div class="input__field">
      <input
          type="text"
          class="user-chat__textfield"
          v-model="textValue"
          @keypress.enter="sendMessage"
      >
      <i
          class="icon"
          @click="sendMessage"
      >
        {{ $t("caption.send") }}
      </i>
    </div>
  </div>
</template>
<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>


