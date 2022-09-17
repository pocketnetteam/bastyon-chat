<template>
  <div
    id="chatList"
    :class="{
      bin: pocketnet,
      bout: !pocketnet,
      minimized,
      fix: pocketnet,
      active,
    }"
  >
    <div class="work" ref="work">
      <div class="timeLineWrapper" ref="events">
        <events
          @updated="updatedSize"
          @scroll="scrollE"
          @removeEvent="removeEvent"
          @editingEvent="editingEvent"
          @replyEvent="replyEvent"
          @shareEvent="shareEvent"
          @galleryEventOpen="e => imageGallery(e)"
          @menuIsVisible="menuIsVisibleHandler"
          ref="eventslist"
          :error="error"
          :timeline="timeline"
          :events="events"
          :chat="chat"
          :loading="lloading"
          v-if="timeline"
          :scrollType="scrollType"
          :selectedMessages="selectedMessages"
          :isRemoveSelectedMessages="isRemoveSelectedMessages"
          @messagesIsDeleted="messagesIsDeleted"
        />
      </div>
    </div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
