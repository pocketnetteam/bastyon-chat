<template>
  <div id="contactActions">
    <div class="actions">
      <!--<div class="actionWrapper">
        <div class="iconbuttonRound bright"><i class="fas fa-phone"></i></div>
      </div>
      <div class="actionWrapper">
        <div class="iconbuttonRound bright"><i class="fas fa-video"></i></div>
      </div>-->
      <div class="actionWrapper" v-if="tetatetid">
        <router-link
          :to="'chat?id=' + tetatetid + '&u=' + contact.id"
          v-if="!blocked"
        >
          <button
            class="button bright rounded small"
            v-if="readyChat.length !== 0"
          >
            {{ $t("caption.moveToChat") }} <i class="far fa-comment-alt"></i>
          </button>
          <button class="button bright rounded small" v-else>
            {{ $t("button.starChatButton") }}<i class="far fa-comment-alt"></i>
          </button>
        </router-link>
      </div>

      <button class="unBlockButton" v-if="blocked" @click="unblock()">
        {{ $t("button.unblock") }}
      </button>
      <button class="blockButton" @click="blockUser()" v-else>
        {{ $t("button.blockUser") }}
      </button>
      <!--<div class="actionWrapper">
        <div class="iconbuttonRound second"><i class="fas fa-ellipsis-h"></i></div>
      </div>-->
    </div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
