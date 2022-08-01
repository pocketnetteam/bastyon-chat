<template>
  <div
    :class="'bgimage ' + (this.imageLoaded ? 'loaded' : '')"
    :style="
      'background-image:url(' +
      src +
      '); background-size: cover; background-position: center center; background-repeat: no-repeat'
    "
    v-images-loaded:on.loaded="loaded"
  ></div>
</template>

<style scoped lang="sass">

.bgimage
    width : 100%
    height: 100%
    opacity: 1
    +transition(0.3s)

    &.loaded
        opacity: 1
</style>

<script>
import imagesLoaded from "vue-images-loaded";

export default {
  name: "bgimage",
  directives: {
    imagesLoaded,
  },
  props: {
    src: String,
  },

  data: function () {
    return {
      imageLoaded: false,
    };
  },

  methods: {
    loaded(instance, image) {
      if (image.isLoaded) {
        this.imageLoaded = true;
      }
    },
  },
};
</script>
