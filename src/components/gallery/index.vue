<template>
  <v-photoswipe
    v-if="images && images.length" :isOpen="isOpen" :items="images" :options="options" @close="close" @sharecordova="sharecordova"
  ></v-photoswipe>
</template>
<script>

export default {
  props: {
    images : Array,
    index : Number
  },

  data: () => {

    return {
      isOpen : false
    }

  },

  mounted(){
    this.init()
  },

  computed: {

    options : function(){

      var o = {
        index : 0,
        arrowEl: true,
        fullscreenEl: false,
        shareEl: false,
        history : false
      }


      return o
    }

  },

  methods: {

    close() {
      this.isOpen = false
      this.$emit('close')
    },

    init() {

      this.isOpen = true
      this.$set(this.options, 'index', this.index)
    },

    sharecordova : function(src){
      if (window.plugins && window.plugins.socialsharing){
        window.plugins.socialsharing.shareWithOptions({
          files : [src]
        });
      }     
    },



  }
}
</script>