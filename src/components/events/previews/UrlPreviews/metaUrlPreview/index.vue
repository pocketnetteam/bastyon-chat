<template>
  <div class="previewMetaLink">
    <div class="header">
      <span class="title" v-if="url_object.metaDataPreview['og:title']">{{ url_object.metaDataPreview['og:title'] }}</span>
    </div>
    <a  v-if="url_object.metaUrl" :href="url_object.metaUrl" class="metaUrl">
      {{ url_object.metaUrl }}
    </a>
  </div>
</template>
<script>
export default {
  props: {
    url_object: Object
  }
}
</script>
<style lang="sass">
  .previewMetaLink
    padding: 0 1em
    -webkit-box-shadow: 0px -1px 15px -5px #0059ff
    -moz-box-shadow: 0px -1px 15px -5px #0059ff
    box-shadow: 0px -1px 15px -5px #0059ff

    .header
      display: flex
      justify-content: flex-start
      align-items: center

      .title
        font-weight: bold
        display: block
        font-size: 0.9em
        border-left: .3em solid #0059ff
        padding: 5px

      .image
        width: 100px
        height: 50px
        display: block

        img
          display: block
          border: 0
          width: 100%
          object-fit: scale-down
    .metaUrl
      font-size: 0.9em
      display: flex
      color: #0059ff
      width: 100%
      justify-content: flex-start
      padding-bottom: .4em
      &:hover
        color: #62bcf9
</style>