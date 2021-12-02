<template>
  <div id="chatList" :class="{'bin' : pocketnet, 'bout' : !pocketnet, minimized, fix : pocketnet, active}">

    <div class="work" ref="work">

 

      <div class="timeLineWrapper" ref="events">
        <events 
          @updated="updatedSize"
          @scroll="scrollE"
          @removeEvent="removeEvent"
          @editingEvent="editingEvent"
          @replyEvent="replyEvent"
          @galleryEventOpen="e => imageGallery(e)"
          @menuIsVisible="menuIsVisibleHandler"

          ref="eventslist"
          
          :timeline="timeline"
          :events="events"
          :chat="chat"
          :loading="lloading"
          v-if="timeline"
          :scrollType="scrollType"
        />
      </div>

    </div>

  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<style scoped lang="sass" src="./themes/theme_white.sass"></style>
<style scoped lang="sass" src="./themes/theme_black.sass"></style>
<!-- THEMES END -->





















