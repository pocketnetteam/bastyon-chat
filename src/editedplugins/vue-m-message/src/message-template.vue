<template>
<transition name="m-message-fade" mode="in-out">
  <div class="m-message-wrapper" v-show="show"
    :style="{
      width: width
    }"
    :class="wrapperClassName"
    >
    <mmessage
      :class="[type && 'm-message--' + type, className]"
      @mouseenter.native="clearTimer"
      @mouseleave.native="startTimer"
      :event="event"
      :chat="chat"
      :closable="showClose"
      :is-collapsed="isCollapsed"
      :close-handler="close"
      :click-handler="click"
      :title="title"
      :supportHTML="supportHTML"
      >
      <template slot="icon">
        <img v-if="iconImg" :src="iconImg" class="m-message--icon" />
        <icon v-else-if="type" :name="type" class="m-message--icon"/>
      </template>
    </mmessage>
  </div>
</transition>
</template>
<script>
import mmessage from './mmessage.vue'
import Icon from './icon'

export default {
  components: { Icon, mmessage },
  data () {
    return {
      show: false,
      type: 'info',
      iconImg: '',
      title: '',
      message: {},
      roomId: '',
      event: null,
      chat : null,
      duration: 3000,
      showClose: false,
      isCollapsed: false,
      width: '',
      className: '',
      wrapperClassName: '',
      supportHTML: false,
      onClose: null,
      onClick : null,
      timer: null,
      closed: false
    }
  },
  watch: {
    closed (val) {
      if (val) {
        this.show = false
        this.$el.addEventListener('animationend', this.destroyElement)
      }
    }
  },
  
  methods: {
    close () {
      this.closed = true
      if (typeof this.onClose === 'function') {
        this.onClose(this)
      }
    },
    click () {

      if (typeof this.onClick === 'function') {
        this.onClick(this)
      }
    },
    clearTimer () {
      clearTimeout(this.timer)
    },
    startTimer () {
      if (this.duration > 0 && this.type !== 'loading') {
        this.timer = setTimeout(() => {
          if (!this.closed) {
            this.close()
          }
        }, this.duration)
      }
    },
    destroyElement () {
      this.$el.removeEventListener('transitionend', this.destroyElement)
      this.$destroy(true)
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  mounted () {
    if (this.type !== 'loading') {
      this.startTimer()
      if (this.duration <= 0) {
        this.showClose = true
      }
    }
  }
}
</script>
