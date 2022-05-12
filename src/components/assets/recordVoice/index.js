import * as _ from 'underscore/underscore-node.mjs';

export default {
  name: "recordVoice",
  props: {
    isRecording: {
      type: Boolean,
      required: true
    },
    disabled: {},
  },
  data() {
    return {
      start: 0,
      isHold: false,
      direction: null
    }
  },
  mounted() {
    this.$refs.toggle.addEventListener('touchstart', this.handleTouchStart)
    this.$refs.toggle.addEventListener('touchend', this.handleTouchEnd)
    this.$refs.toggle.addEventListener('touchcancel', this.handleTouchEnd)
  },
  beforeDestroy() {
    this.$refs.toggle.removeEventListener('touchstart', this.handleTouchStart)
    this.$refs.toggle.removeEventListener('touchend', this.handleTouchEnd)
    this.$refs.toggle.removeEventListener('touchcancel', this.handleTouchEnd)
    document.removeEventListener('mouseup', this.handleTouchEnd)
    document.removeEventListener('mousemove', this.handleMove)
    document.removeEventListener('touchmove', this.handleMove)
  },
  methods: {
    handleTouchStart(e) {
      if (!this.isRecording) {
        this.start = {
          Y: e.changedTouches[0].pageY,
          X: e.changedTouches[0].pageX
        }
        this.$emit('onRecordingStart')
        document.addEventListener('mousemove', this.handleMove)
        document.addEventListener('touchmove', this.handleMove)
      }
    },
    handleTouchEnd(e) {
      if (this.isRecording) {
        this.$emit('onRecordingStop')
        document.removeEventListener('mousemove', this.handleMove)
        document.removeEventListener('touchmove', this.handleMove)
      }
    },
    handleMove(e) {
      let deltaY = this.start.Y - e.pageY
      let deltaX = this.start.X - e.pageX
      if(e?.changedTouches?.length) {
        deltaY = this.start.Y - e.changedTouches[0].pageY
        deltaX = this.start.X - e.changedTouches[0].pageX
      }

      if (deltaY > 5 &&  deltaX < 5) {
        this.direction = 'Y'
      } else {
        this.direction = 'X'
      }


      if (deltaY > 5 && this.direction === 'Y') {
        this.$refs.toggle.classList.add('outside')
        this.$refs.holder.classList.add('active')
        this.$refs.toggle.style.transform = `translate(0,-${deltaY}px)`
        if (deltaY > 80) {
          this.$refs.toggle.style.transform = `translate(0,0)`
          document.removeEventListener('mousemove', this.handleMove)
          document.removeEventListener('touchmove', this.handleMove)
          this.$refs.toggle.removeEventListener('touchend', this.handleTouchEnd)
          this.$refs.toggle.removeEventListener('touchcancel', this.handleTouchEnd)
          document.removeEventListener('mouseup', this.handleTouchEnd)
          this.isHold = true
        }
      } else if (deltaX > 5 && this.direction === 'X') {
        this.$refs.toggle.style.transform = `translate(-${deltaX}px, 0)`
        this.$emit('canceling', (deltaX - 5) /180)
        if (deltaX > 180) {
          this.$refs.toggle.style.transform = `translate(0,0)`
          document.removeEventListener('mousemove', this.handleMove)
          document.removeEventListener('touchmove', this.handleMove)
          document.removeEventListener('mouseup', this.handleTouchEnd)
          this.$emit('onRecordingStop')
          this.$emit('onClear')
        }
      }
        else {
        this.$refs.toggle.style.transform = `translate(0,0)`
        this.$refs.toggle.classList.remove('outside')
        this.$refs.holder.classList.remove('active')
      }
    },

    record(e) {
      if (this.isRecording) {
        this.$emit('onRecordingStop')
        document.removeEventListener('mousemove', this.handleMove)
        document.removeEventListener('touchmove', this.handleMove)
        return
      }
      this.$emit('onRecordingStart')
      this.start = {
        Y: e.pageY,
        X: e.pageX
      }
      document.addEventListener('mouseup', this.handleTouchEnd)
      document.addEventListener('mousemove', this.handleMove)
      document.addEventListener('touchmove', this.handleMove)
    },
  }
}