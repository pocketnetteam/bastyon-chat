<template>
  <div id="events" class="maskedtop" :class="{mobile, ios, menuOpen, imagesList: (this.scrollType === 'custom' ? 'imagesList' : '')}">
    <div class="eventsflex" @wheel="mousewheel" ref="container" @scroll="dscroll" :class="{mobile, ios, menuOpen}">
      <div class="ewr">
          <div class="errorWrapper" v-if="stringifyiedError" >
            <div class="error"><div>{{ $t("sendingerror") }}</div><div class="btnwrp"><button @click="showerror" class="button small">{{ $t("details") }}</button></div></div>
          </div>
            
          <div class="eventWrapper"
              
              v-for="(event, i) in events"
              :key="event.event.event_id"
          >

            <eventsEvent
                :event="event"
                :prevevent="events[i+1]"
                :galleryData="events"
                :chat="chat"
                :timeline="timeline"
                :last="i == 0"
                :multiSelect="multiSelect"
                :selectedMessages="selectedMessages"
                @showMultiSelect="showMultiSelect"
                @selectMessage="selectMessage"
                @removeMessage="removeMessage"
                @openImageEvent="e => galleryOpen(e)"
                @removeEvent="e => removeEvent(event)"
                @editing="text => editingEvent({event, text})"
                @reply="e => replyEvent({event})"
                @mounted="emounted"
                @menuIsVisible="menuIsVisibleHandler"
                :isRemoveSelectedMessages="isRemoveSelectedMessages"
                @messagesIsDeleted="messagesIsDeleted"
            />
          </div>
      </div>

      <div class="preloadingWrapper" v-if="loading">
        <linepreloader />
      </div>

      

    </div>

    <transition name="fade">
      <div class="scrollbottom" v-show="scrollbottomshow" @click="scrolldown"> 
        <i class="fas fa-chevron-down"></i>
      </div>
    </transition>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->





















