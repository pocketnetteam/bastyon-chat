<template>
  <div
    class="bgimage"
    :class="{ loaded, hasimage: src }"
    :style="
      'background-image:url(' +
      imageSrc +
      '); background-size: cover; background-position: center center; background-repeat: no-repeat'
    "
  >
    <slot name="cnt"></slot>
  </div>
</template>

<style scoped lang="sass">

.bgimage
    width : 100%
    height: 100%
    opacity: 0
    +transition(0.3s)

    &.loaded
        opacity: 1
</style>

<script>
export default {
  name: "bgimage",
  directives: {},
  props: {
    src: String,
  },

  watch: {
    src: {
      immediate: true,
      handler: function () {
        this.load();
      },
    },
  },

  data: function () {
    return {
      loaded: false,
      imageSrc: "",
    };
  },

  methods: {
    load: function () {
      if (this.src) {
        this.imageSrc = this.src
          .replace("bastyon.com:8092", "pocketnet.app:8092")
          .replace("test.pocketnet", "pocketnet");

        var image = new Image();

        image.src = this.imageSrc;
        image.onload = () => {
          this.loaded = true;
        };
      } else this.loaded = true;
    },
  },
};
</script>
