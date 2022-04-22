<template>
  <div class="voiceMessage">
    <div class="voiceMessage_wrapper">
      <button class="voiceMessage_toggle" @click="audioToggle">
        <i :class="isPlaying ? 'fas fa-pause': 'fas fa-play'"></i>
      </button>
      <div class="voiceMessage_graph">
        <canvas ref="canvas" width="200" height="50" @mousedown="goTo" ></canvas>
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
    }
  },
  data() {
    return {
      voiceMessage: null,
      isPlaying: false,
      interval: null,
    }
  },
  mounted() {
    this.initVoiceMessage()
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
    },
    audioToggle() {
      this.isPlaying = !this.isPlaying
      if (this.isPlaying) {
        this.voiceMessage.audio.play()
        this.interval = setInterval( () => {
          this.setTime()
          this.draw()
        }, 20);
      } else {
        clearInterval(this.interval)
        this.voiceMessage.audio.pause()
      }

    },
    setTime() {
      this.voiceMessage.currentTime = this.voiceMessage.audio.currentTime * 1000
    },

    draw() {
      const canvas = this.$refs.canvas
      const ctx = canvas.getContext("2d")
      ctx.clearRect(0,0, canvas.width, canvas.height)
      const data = this.voiceMessage.signal
      for (let i = 0; i < data.length; i++) {
        let x = Math.floor(i / data.length * canvas.width);
        let L = data[i] * canvas.height;
        if (Math.floor(i / 50) === i / 50) { // Число 16 для больших аудиофайлов лучше побольше. Нужно подбирать.
          if(i / data.length < this.percentPlayed) {
            ctx.fillStyle = '#5181B8'
          } else {
            ctx.fillStyle = '#A8C0DB'
          }
          ctx.fillRect(x, canvas.height / 2 - Math.abs(L) / 2, 1, Math.abs(L));
        }
      }
    },
    async initVoiceMessage() {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioNode = new Audio(this.base64Audio)
      audioNode.addEventListener('loadedmetadata', () => {

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


      })
      audioNode.onended = () => {
        this.isPlaying = false
        this.voiceMessage.audio.currentTime = 0
        this.voiceMessage.currentTime = 0
        this.draw()
        clearInterval(this.interval)
      }

      this.voiceMessage = {
        audio: audioNode,
        duration: 0,
        currentTime: 0
      }

      const data = f._base64ToArrayBuffer(this.base64Audio.split(',')[1])
      await audioContext.decodeAudioData(data, (buffer) => {

        this.voiceMessage = {
          audio: audioNode,
          duration: 0,
          currentTime: 0,
          signal: buffer.getChannelData(0),
        }

          this.draw()
      })

    }
  }
}
</script>

<style scoped lang="scss">
.voiceMessage {
  -webkit-tap-highlight-color: transparent;
  &_wrapper {
    display: flex;
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
    background: #5181B8;
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
  }

  &_options {
    display: flex;
    justify-content: flex-end;
    width: 40px;
  }
}
</style>