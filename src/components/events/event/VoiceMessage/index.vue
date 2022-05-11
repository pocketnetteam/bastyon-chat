<template>
  <div class="voiceMessage">
    <div class="voiceMessage_wrapper">
      <button class="voiceMessage_toggle" @click="audioToggle">
        <i :class="isPlaying ? 'fas fa-pause': 'fas fa-play'"></i>
      </button>
      <div class="voiceMessage_graph">
        <canvas ref="canvas" width="160" height="50" @mousedown="goTo"></canvas>
      </div>
      <div class="voiceMessage_options">
        {{ getDurationString }}
      </div>
    </div>
  </div>
</template>

<script>
import f from '@/application/functions'

export default {
  name: "VoiceMessage",
  props: {
    base64Audio: {
      type: String | null,
      required: true
    },
    id: {
      type: Number
    }
  },
  data() {
    return {
      voiceMessage: null,
      isPlaying: false,
      interval: null,
    }
  },
  inject: ['addToQueue', 'playNext'],

  mounted() {
    this.initVoiceMessage()
  },
  beforeDestroy() {
    if (this.isPlaying) {
      this.isPlaying = false
      this.voiceMessage.audio.pause()
      clearInterval(this.interval)
    }
  },
  computed: {
    getDurationString() {
      if (this.voiceMessage) {
        let sec, min
        if (this.voiceMessage.currentTime) {
          sec = Math.floor(this.voiceMessage.currentTime / 1000)
          min = Math.floor(this.voiceMessage.currentTime / 60000)
          return `${min}:${sec < 10 ? '0' + sec : sec}`
        }
        sec = Math.floor(this.voiceMessage.duration / 1000)
        min = Math.floor(this.voiceMessage.duration / 60000)
        return `${min}:${sec < 10 ? '0' + sec : sec}`
      }
      return '0:00'
    },
    percentPlayed() {
      return this.voiceMessage.currentTime / this.voiceMessage.duration
    }
  },
  methods: {
    goTo(e) {
      this.voiceMessage.audio.currentTime = e.offsetX / this.$refs.canvas.width * this.voiceMessage.audio.duration;
      this.voiceMessage.currentTime = e.offsetX / this.$refs.canvas.width * this.voiceMessage.duration;
      this.draw()


      this.audioToggle()
    },
    audioToggle() {
      this.isPlaying = !this.isPlaying
      if (this.isPlaying) {
        this.voiceMessage.audio.play()
        this.interval = setInterval(() => {
          this.draw()
          this.setTime()
        }, 20);
      }else {
        clearInterval(this.interval)
        this.voiceMessage.audio.pause()
      }
    },
    setTime() {
      this.voiceMessage.currentTime = this.voiceMessage.audio.currentTime * 1000
      console.log(this.voiceMessage.currentTime)
    },

    draw() {
      const canvas = this.$refs.canvas
      const ctx = canvas.getContext("2d")
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const data = this.voiceMessage.signal
      for (let i = 0; i < data.length; i++) {
        let x = Math.floor(i / data.length * canvas.width);
        let L = Math.abs(data[i] * canvas.height) + 1;
        if (Math.floor(i / 200) === i / 200) { // Число 16 для больших аудиофайлов лучше побольше. Нужно подбирать.
          if (i / data.length <= this.percentPlayed) {
            ctx.fillStyle = '#00a4ff'
          } else {
            ctx.fillStyle = '#8bddfb'
          }
          ctx.fillRect(x, canvas.height / 2 - L / 2, 1, L);
        }
      }
    },
    async initVoiceMessage() {

      let audioContext
      let audioNode
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)() || null;
        audioNode = new Audio(this.base64Audio) || null
      } catch (e) {
        console.log(e)
      }
      audioNode.onloadedmetadata = () => {

        const getDuration = () => {
          audioNode.currentTime = 0
          this.voiceMessage.duration = audioNode.duration * 1000
          audioNode.removeEventListener('timeupdate', getDuration)
        }
        if (audioNode.duration === Infinity) {
          audioNode.addEventListener('timeupdate', getDuration)
          audioNode.currentTime = 1e101
        } else {
          this.voiceMessage.duration = audioNode.duration * 1000
        }


      }
      audioNode.onplay = () => {
        let currentPlaying = this.$store.state.currentPlayingVoiceMessage
        if (currentPlaying && currentPlaying.id !== this.id) {
          currentPlaying.audioToggle()
        }
        this.$store.commit('SET_CURRENT_PLAYING_VOICE_MESSAGE', this)
      }
      audioNode.onpause = () => {
        let currentPlaying = this.$store.state.currentPlayingVoiceMessage
        if (currentPlaying && currentPlaying.id === this.id) {
          this.$store.commit('SET_CURRENT_PLAYING_VOICE_MESSAGE', null)
        }
      }
      audioNode.onended = () => {
        this.$store.commit('SET_CURRENT_PLAYING_VOICE_MESSAGE', null)
        this.isPlaying = false
        this.voiceMessage.audio.currentTime = 0
        this.voiceMessage.currentTime = 0
        clearInterval(this.interval)
        this.draw()
        this.playNext(this.id, this.audioToggle)
      }
      this.addToQueue(this, this.id)

      this.voiceMessage = {
        audio: audioNode,
        duration: 0,
        currentTime: 0
      }

      const data = f._base64ToArrayBuffer(this.base64Audio.split(',')[1])
      try {
        await audioContext.decodeAudioData(data, (buffer) => {

          this.voiceMessage = {
            audio: audioNode,
            duration: 0,
            currentTime: 0,
            signal: buffer.getChannelData(0),
          }

          this.draw()
        })
      } catch (e) {
        console.log(e)
      }

    }
  }
}
</script>

<style scoped lang="scss">
.voiceMessage {
  -webkit-tap-highlight-color: transparent;

  &_wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    overflow: hidden;
    height: 60px;
    min-width: 10em;
    padding: 0 1em;
    border-radius: 1em;
    border-bottom-left-radius: 1em;
    border-top-right-radius: 0;
  }

  &_toggle {
    cursor: pointer;
    height: 40px;
    width: 40px;
    margin-right: 1em;
    border-radius: 50%;
    background: srgb(--color-bg-ac);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;

    i {
      font-size: 15px;
    }
  }

  &_graph {
    position: relative;
    cursor: pointer;
  }

  &_options {
    display: flex;
    justify-content: center;
    line-height: 1em;
    margin-left: 10px;
    padding: 2px 10px;
    min-width: 40px;
    background: srgb(--neutral-grad-1);
    border-radius: 10px;
  }
}
</style>