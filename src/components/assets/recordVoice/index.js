import * as _ from 'underscore/underscore-node.mjs';

export default {
  name: "recordVoice",
  props: {
    isRecording: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {}
  },
  mounted() {
    this.$refs.toggle.addEventListener('touchstart', this.handleTouchStart)
    this.$refs.toggle.addEventListener('touchend', this.handleTouchEnd)
    document.addEventListener('mouseup', this.handleTouchEnd)
  },
  beforeDestroy() {
    this.$refs.toggle.removeEventListener('touchstart', this.handleTouchStart)
    this.$refs.toggle.removeEventListener('touchend', this.handleTouchEnd)
    document.removeEventListener('mouseup', this.handleTouchEnd)
  },
  methods: {
    handleTouchStart(e) {
      e.preventDefault()
      if(!this.isRecording) {
        this.$emit('onRecordingStart')
      }
    },
    handleTouchEnd(e) {
      e.preventDefault()
      if(this.isRecording) {
        this.$emit('onRecordingStop')
      }
    },
    record() {
      if (this.isRecording) {
        this.$emit('onRecordingStop')
        return
      }
      this.$emit('onRecordingStart')
    },
  }
}