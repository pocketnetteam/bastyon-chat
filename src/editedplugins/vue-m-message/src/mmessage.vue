<template>
  <div class="m-message" v-show="visible">
    <div class="m-message-icons" @click="handleClick" v-if="iconImg || $slots.icon">
      <img :src="iconImg" v-if="iconImg" class="m-message--icon" alt="Img"/>
      <slot name="icon" v-else></slot>
    </div>
    <div class="m-message-content" @click="handleClick">
      <div class="m-message--title" v-if="title || $slots.title">
        <slot name="title">
          {{ title }}
        </slot>
      </div>

      <event :event="event" :chat="chat" :preview="true" v-if="event && chat"/>
      <div class="m-message--body" v-else>
        <slot name="message">
<!--          {{ message }}-->
        </slot>
      </div>
      <!--  <listPreview :event="event" :decryptEvent="decrypt" :chat="chat" :notificationPreview="true" />-->
    </div>
  </div>
</template>

<script>

import event from '@/components/events/event/index.vue'
import f from '@/application/functions'
export default {
  name: 'm-mmessage',
  props: {
    event: event,
    iconImg: String,
    closable: Boolean,
    closeHandler: Function,
    clickHandler: Function,
    chat: {},
    title: String,
    supportHTML: Boolean, // content support html
    isCollapsed: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: true,
      collapsed: this.isCollapsed,
    }
  },
  
  components: {
    event
  },
  methods: {
    
    triggerCollapse() {
      this.collapsed = !this.collapsed
    },
    handleClick: function () {
      if (typeof this.clickHandler === 'function') this.clickHandler(this.close)

    },
    close() {
      this.visible = false
    },
    handleClose() {
      if (typeof this.closeHandler === 'function') this.closeHandler(this.close)
      else this.close()
    }
  },
  mounted() {

  }


}
</script>
