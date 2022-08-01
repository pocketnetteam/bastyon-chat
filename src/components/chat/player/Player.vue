<template>
  <vue-plyr ref="plyrpreview">
    <div class="plyr__video-embed">
      <iframe
        class="video"
        :src="video"
        allowfullscreen
        allowtransparency
        allow="autoplay"
      ></iframe>
    </div>
  </vue-plyr>
</template>

<script>
export default {
  name: "Player",

  props: ["video", "autoplay"],

  // props: {
  //     video_url: String || Boolean,
  //     autoplay: Boolean
  // },

  data() {
    return {
      player: null,
    };
  },

  beforeMount() {
    // this.video = `https://peertube.swarm.solvingmaz.es/static/webseed/9cc6877c-80a5-4352-b545-068399dd5ee9-720.mp4`
  },

  mounted() {
    if (this.autoplay) {
      this.player = this.$refs.plyrpreview.player;

      this.player.on("ready", () => {
        this.player.muted = true;
        this.player.play();
        // try {
        //     this.player.play()
        // } catch (error) {
        //     console.log('ERROR PLAY', error)
        // }
      });
    }
  },
};
</script>

<style lang="sass" scoped>
/deep/ iframe
    outline: none
    border : 0
    width : 100%
</style>
