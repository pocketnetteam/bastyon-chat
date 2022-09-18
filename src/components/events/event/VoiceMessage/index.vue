<template>
  <div class="voiceMessage" :class="{playing:isPlaying}">
    <div class="voiceMessage_wrapper">
      <button class="voiceMessage_toggle" @touchend="audioToggle" @click="audioToggleClick">
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
import { mapState } from 'vuex';
export default {
  name: "VoiceMessage",
  props: {
    audioBuffer: {
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
      audioContext : null,
      audio : null,
      duration : null,
      currentTime : null,
      signal : null,
      audiobuffer : null,
      error : null,
    }
  },
  inject: ['addToQueue', 'playNext'],

  mounted() {
    this.initVoiceMessage()
  },
  beforeDestroy() {

    if (this.isPlaying) {
      this.pause()
    }

    if(this.interval){
      clearInterval(this.interval)
      this.interval = null
    }
      
    //if(this.audioContext) this.audioContext.close()

  },
  watch : {
    isPlaying : function(v){
      if(!this.isPlaying){
        

        
        
      }
      else{

        

      }
    }
  },
  computed: {

		...mapState({
			mobile: state => state.mobile,
		}),

    getDurationString() {

      if (this.duration) {

        let sec, min
        
        if (this.currentTime) {
          sec = Math.floor(this.currentTime)
          min = Math.floor(this.currentTime / 60)
          return `${min}:${sec < 10 ? '0' + sec : sec}`
        }

        sec = Math.floor(this.duration)
        min = Math.floor(this.duration / 60)

        return `${min}:${sec < 10 ? '0' + sec : sec}`

      }

      return '0:00'
    },
    percentPlayed() {
      return this.currentTime / this.duration
    },

    localBuffer(){
      return f.copyArrayBuffer(this.audioBuffer)
    }
  },
  methods: {
    goTo(e) {

      if(!this.$refs.canvas) return

      var dr = e.offsetX / this.$refs.canvas.width * this.duration;
      
      

      if(!this.isPlaying) { 
        this.setTime(dr)
        this.play()
      }
      else{
        this.pause()
        
        setTimeout(() => {
          this.setTime(dr)
          this.play()
        }, 20)
        
      }

    },
    audioToggleClick(){
      if(this.mobile) return 

      this.audioToggle()
    },
    audioToggle() {
      if(this.isPlaying){
        this.pause()
      }
      else{
        

        this.play()
      }
    },

    pause(){

      if(this.audio) {
        this.audio.stop()
        this.audio.disconnect()
      }

      
      this.isPlaying = false

      this.draw()

      let currentPlaying = this.$store.state.currentPlayingVoiceMessage
        
      if (currentPlaying && currentPlaying.id == this.id) {
        this.$store.commit('SET_CURRENT_PLAYING_VOICE_MESSAGE', null)
      }

      if(this.interval){
        clearInterval(this.interval)
        this.interval = null
      }
    },

    play(){

      if(!this.audiobuffer) return

      
      if(this.error){

        this.playNext(this.id)
        
        return
      }

      this.audioContext = this.core.getAudioContext()

      

      this.isPlaying = true

      this.audio = this.initAudioNode()


      if(this.currentTime >= this.duration){
        this.setTime(0)
      }
      
      if (this.audio.start) {
        this.audio.start(0, this.currentTime);
      } else if (this.audio.play) {
        this.audio.play(0, this.currentTime);
      } else if (this.audio.noteOn) {
        this.audio.noteOn(0, this.currentTime);
      }

      let currentPlaying = this.$store.state.currentPlayingVoiceMessage
        
      if (currentPlaying && currentPlaying.id !== this.id) {
          currentPlaying.pause()
      }
      
      this.$store.commit('SET_CURRENT_PLAYING_VOICE_MESSAGE', this)

      if(this.interval){
        clearInterval(this.interval)
      }

      var t = 50

      this.interval = setInterval(() => {

        var time = this.currentTime + t / 1000

        if(this.duration - t / 1000 < time) time = this.duration

        if(this.currentTime > this.duration){
          this.pause()
        }

        this.draw()
        this.setTime(time)

      }, t);

    },


    draw() {

      const canvas = this.$refs.canvas

      if(!this.signal) return
      if(!canvas) return

      const data = this.signal

      var w = canvas.width
      var h = canvas.height
      var l = data.length
      var perc = this.percentPlayed
      
      const ctx = canvas.getContext("2d")
      ctx.clearRect(0, 0, w, h)
      
      var r = 0
      var c = Math.floor (l / 20)

      for (let i = 0; i < l; i = i + c) {
        let x = Math.floor(i / l * w);
        let L = Math.abs(data[i] * h) + 1;

        
        if (i / l <= perc) {
          ctx.fillStyle = '#00a4ff'
        } else {
          ctx.fillStyle = '#8bddfb'
        }

        ctx.fillRect(x, h / 2 - L / 2, 2, L);
        r++

      }

    },

    

    initAudioNode(){

      let audioNode = null

      audioNode = this.audioContext.createBufferSource();
      audioNode.buffer = this.audiobuffer
      audioNode.connect(this.audioContext.destination);

      ///let unmuteHandle = unmute(context, allowBackgroundPlayback, forceIOSBehavior);

      audioNode.onended = () => {

        this.audio = null

        if(this.isPlaying){
          setTimeout(() => {
            this.playNext(this.id)
          }, 300)
        }
        else{
          
        }

        if(this.duration - 100 < this.currentTime) this.setTime(0)

        this.pause()
        
      }

      return audioNode
    
    },

    setTime(time = 0){
      this.currentTime = time
    },

    async initVoiceMessage() {
      
      try {
        this.audioContext = this.core.getAudioContext() //new (window.AudioContext || window.webkitAudioContext)() || null;
      } catch (e) {
        this.error = e
      }

      if(this.error) return

      this.addToQueue(this, this.id)
      
      this.duration = 0
      this.setTime(0)

      //const data = f._base64ToArrayBuffer(this.base64Audio.split(',')[1])

      try {
        await this.audioContext.decodeAudioData(this.localBuffer, (buffer) => {

          this.audiobuffer = buffer

          this.duration = buffer.duration
          this.setTime(0)

          this.signal = buffer.getChannelData(0)

          this.draw()
        })
      } catch (e) {
        this.error = e
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
  contain: strict;
  width: 230px;
  height: 100%;
  

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