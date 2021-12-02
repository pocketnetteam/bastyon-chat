<template>
  <div class="page chatInfo">

    <topheader class="topheader" v-if="chat" :chat="chat"/>

    <maincontent>
      <template v-slot:content>
        <chatInfo v-if="chat" :chat="chat" />
      </template>
    </maincontent>

  </div>
</template>

<style scoped lang="sass">

.topheader
  top: 0
  z-index: 999

</style>

<script>


import topheader from '@/components/chatInfo/topheader/index.vue'
import chatInfo from '@/components/chatInfo/index.vue'
import {mapState} from 'vuex';
import contact from '@/components/contact/index.vue';

export default {
  name: 'chatinfo',
  data: function () {
    return {
    }
  },
  components: {

    topheader,
    contact,
    chatInfo

  },

  computed: mapState({
    pocketnet: state => state.pocketnet,
    minimized: state => state.minimized,

    u() {
      return this.$route.query.u
    },

    chat() {
      var id = this.$route.query.id
      return this.$store.state.chatsMap[id]
    },


  }),
  methods: {},

}
</script>
