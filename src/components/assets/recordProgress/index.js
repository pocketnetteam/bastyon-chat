import {canvas} from 'caniuse-lite/data/features';

export default {
  name: "recordProgress",
  props: {
    recordTime: {
      type: Number,
      required: true
    },
    rmsData: {
      type: Array,
      required: true
    },
    isRecording: {
      type: Boolean
    }
  },
  data() {
    return {
      width: 0,
    }
  },

  computed: {
    timer() {
      let minute = Math.floor(this.recordTime / 60000)
      let sec = Math.floor(this.recordTime / 1000) % 60
      let milliseconds = this.recordTime % 1000 / 10
      return `${minute ? minute + ':' : '0:'}${(sec < 10) ? '0' + sec : sec}`
    }
  },
  mounted() {
    let width = document.querySelector('.graph').offsetWidth
    this.width =  width - width % 100
    window.addEventListener("resize", this.resize);


  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
  },


  updated() {
    this.draw()
  },
  methods: {
    resize() {
      let timer = null

      function re() {
        if (!timer) {
          timer = setTimeout(() => {
            timer = null
            let width = document.querySelector('.graph').offsetWidth
            this.width =  width - width % 100
          }, 50)
        }
      }

      re.call(this)
    },
    draw() {
      const ctx = document.querySelector(`#canvas`).getContext(`2d`);
      let x = 0
      let width = this.width / 200
      ctx.clearRect(0, 0, this.width, 60);
      for (let i = 0; i < this.rmsData.length; i++) {
        ctx.fillStyle = '#5181B8'
        ctx.fillRect(i * 2 * width , 30 - this.rmsData[i] / 8, width, this.rmsData[i] / 4 + 1)
      }
    },
    clear() {
      this.$emit('onClear')
    }
  }
}