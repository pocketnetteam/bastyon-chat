<template>
  <div id="chatSettings" :class="{minimized, active}">
    <div class="chatSettingAbout">
      <div :class="{'chatIconWrapper':'chatIconWrapper', 'noSwipe' : true }">
        <chatIcon :slidesPerView="4" :dontuseslides="minimized && !active" :chat="chat" :m_chat="m_chat" :hideunseen="true"/>
      </div>
      <div class="chatNameEdit">
        <input type="text" v-model="m_chat.name" placeholder="Name" />
      </div>
      <div class="chatDescription" v-if="topic">
        <textarea type="text" v-model="topicTxt" placeholder="Description" maxlength="74"></textarea>
      </div>
      <button class="button small rounded inSettings" @click="saveEdited()">
        {{ $t("button.save") }}
      </button>
    </div>

  </div>
    <!--    <div class="linkPlace">-->
<!--          <span class="shareLink">-->
<!--            <i class="fas fa-link"></i> {{ shareRoomLink }}-->
<!--          </span>-->
<!--    </div>-->
</template>
<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
