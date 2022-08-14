<template>
  <div class="voiceMessage" :class="{playing:isPlaying}">
    <div class="voiceMessage_wrapper">
      <button class="voiceMessage_toggle" @click="audioToggle">
        <i :class="isPlaying ? 'fas fa-pause': 'fas fa-play'"></i>
      </button>
      <div class="voiceMessage_graph">
        <canvas ref="canvas" width="100" height="50" @mousedown="goTo"></canvas>
      </div>
      <div class="voiceMessage_options">
        <span v-if="!error">{{ getDurationString }}</span>
        <i v-if="error" class="fas fa-exclamation-circle"></i>
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

      audio : null,
      duration : null,
      currentTime : null,
      signal : null,

      error : null
    }
  },
  inject: ['addToQueue', 'playNext'],

  mounted() {
    this.initVoiceMessage()
  },
  beforeDestroy() {
    if (this.isPlaying) {
      this.isPlaying = false
      this.audio.pause()
      clearInterval(this.interval)
    }
  },
  computed: {
    getDurationString() {

      if (this.duration) {

        let sec, min
        
        if (this.currentTime) {
          sec = Math.floor(this.currentTime / 1000)
          min = Math.floor(this.currentTime / 60000)
          return `${min}:${sec < 10 ? '0' + sec : sec}`
        }

        sec = Math.floor(this.duration / 1000)
        min = Math.floor(this.duration / 60000)

        return `${min}:${sec < 10 ? '0' + sec : sec}`

      }

      return '0:00'
    },
    percentPlayed() {
      return this.currentTime / this.duration
    }
  },
  methods: {
    goTo(e) {

      var dr = e.offsetX / this.$refs.canvas.width * this.duration;
      
      this.audio.currentTime = dr
      this.currentTime = dr
      
      this.draw()

      if (!this.isPlaying) {
        this.isPlaying = true
        this.audio.play()
        this.interval = setInterval(() => {
          this.draw()
          this.setTime()
        }, 20);
      }
    },
    audioToggle() {
      this.isPlaying = !this.isPlaying

      if (this.isPlaying) {
        this.audio.play()
        this.interval = setInterval(() => {
          this.draw()
          this.setTime()
        }, 20);

      }else {

        clearInterval(this.interval)
        this.audio.pause()

      }
    },
    setTime() {
      this.currentTime = this.audio.currentTime * 1000
    },

    draw() {


      const canvas = this.$refs.canvas
      const ctx = canvas.getContext("2d")
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const data = this.signal

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

          this.currentTime = 0
          this.duration = audioNode.duration * 1000

          audioNode.removeEventListener('timeupdate', getDuration)
        }

        if (audioNode.duration === Infinity) {

          audioNode.addEventListener('timeupdate', getDuration)
          audioNode.currentTime = 1e101

          this.currentTime = 1e101
        } else {
          this.duration = audioNode.duration * 1000
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
        this.audio.currentTime = 0
        this.currentTime = 0

        clearInterval(this.interval)

        this.draw()
        this.playNext(this.id, this.audioToggle)

      }

      audioNode.onerror = (E) => {
        this.error = E

        clearInterval(this.interval)
        if(this.isPlaying)
          this.playNext(this.id, this.audioToggle)
      }


      this.addToQueue(this, this.id)

      this.audio = audioNode
      this.duration = 0
      this.currentTime = 0


      const data = f._base64ToArrayBuffer(this.base64Audio.split(',')[1])
      try {
        await audioContext.decodeAudioData(data, (buffer) => {

          this.signal = buffer.getChannelData(0)

          this.draw()
        })
      } catch (e) {
        console.error(e)
      }

    }
  }
}
</script>

<style scoped lang="scss">
.voiceMessage {
  -webkit-tap-highlight-color: transparent;
  display: flex;

  &_wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    overflow: hidden;
    min-width: 10em;
    padding: 0 0.5em;
    padding-right: 1em;
    border-radius: 2em;
    background: srgb(--background-secondary-theme);
  }

  &_toggle {
    cursor: pointer;
    height: 33px;
    width: 33px;
    margin-right: 0.5em;
    border-radius: 50%;
    background: srgb(--neutral-grad-1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: srgb(--color-bg-ac);

    i {
      font-size: 0.5em;
    }
  }

  &_graph {
    position: relative;
    cursor: pointer;
  }

  &_options {
    display: flex;
    justify-content: center;
    margin-left: 10px;
    padding: 2px 10px;
    min-width: 40px;
    background: srgb(--neutral-grad-1);
    border-radius: 10px;

    span{
      font-size: 0.8em;
      color : srgb(--neutral-grad-3);
    }
  }

  &.playing{
    .voiceMessage_options {
      span{
        font-size: 0.8em;
        color : srgb(--color-bg-ac-bright);
      }
    }
  }

  .fa-exclamation-circle{
    font-size: 0.7em;
    color : srgb(--color-bad);
    padding : 0.5em;
  }
}
</style>