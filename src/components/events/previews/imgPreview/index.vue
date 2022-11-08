<template>
  <div class="loadingImg">
    <div class="imagePreview">
      <img :src="imagePreview" class="imgPreview" alt="" />
      <div class="previewLoader">
        <clip-loader
          :size="'25px'"
          :color="'#0035a8'"
          :loading="true"
          class="clipLoader"
        />
      </div>
    </div>
  </div>
</template>
<script>
import clipLoader from "vue-spinner/src/ClipLoader";

export default {
  props: {
    imagePreview: {},
  },
  components: {
    clipLoader,
  },
};
</script>
<style lang="sass">
.loadingImg
  max-width: 100%
  padding: 0.5em 1em

  .imagePreview
    position: relative
    max-width: 50%
    margin: 0 10px 0 auto

    img
      display: block
      max-width: 100%
      object-fit: cover
      border-radius: 1em
      opacity: .4


    .previewLoader
      position: absolute
      left: 50%
      top: 50%
      transform: translate(-50%, -50%)
      z-index: 9999
</style>
