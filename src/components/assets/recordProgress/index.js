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
    },
    opacity: {}
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
      return `${minute ? minute + ':' : '0:'}${(sec < 10) ? '0' + sec : sec}`
    },

    rmsDataLast(){
      return _.last(this.rmsData, 25)
    }
  },

  watch : {
    rmsData : _.throttle(function(){
      this.draw()
    }, 30),

    opacity : function(){
      this.$refs.cancel.style.opacity = this.opacity
    }
  },

  mounted() {
    this.$refs.cancel.style.opacity = 0
    let width = this.$refs.graph.offsetWidth
    this.width = width - width % 100

    window.addEventListener("resize", this.resize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
  },

  methods: {
    resize() {
      let timer = null

      var re = () => {
        if (!timer) {
          timer = setTimeout(() => {
            timer = null
            let width = this.$refs.graph.offsetWidth
            this.width = width - width % 100
          }, 50)
        }
      }

      re()
    },
    draw() {
      const ctx = this.$refs.canvas.getContext(`2d`);
      let x = 0
      let count = 50
      let width = 2 //this.width / 200
      var l = this.rmsDataLast.length
      var c = Math.max(Math.floor(l / count), 1)

      ctx.clearRect(0, 0, this.width, 20);

      for (let i = 0; i < l; i = i + c) {
        ctx.fillStyle = '#00a4ff'
        ctx.fillRect(i * 2 * width, 10 - this.rmsDataLast[i] / 8, width, this.rmsDataLast[i] / 4 + 1)
      }

    },
    clear() {
      this.$emit('onClear')
    }
  }
}