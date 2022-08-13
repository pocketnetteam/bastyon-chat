import {mapState} from 'vuex';
import info from "@/components/chatInfo/info/index.vue"
import _ from 'underscore'

export default {
  name: 'chatInfo',

  components: {
    info
  },
  props: {
    chat: {},
    events: {}
  },

  data: function () {
    return {}

  },

  created() {

  },

  mounted() {
    this.$store.commit('blockactive', {value : true, item : 'chatinfo'})
  },

  destroyed() {
    this.$store.commit('blockactive', {value : false, item : 'chatinfo'})
  },

  watch: {
    //$route: 'getdata'
  },

  computed: mapState({
    pocketnet: state => state.pocketnet,
    minimized: state => state.minimized,
    active: state => state.active,
    auth: state => state.auth,
    m_chat: function () {
      if (this.chat && this.chat.roomId) {
        var m_chat = this.core.mtrx.client.getRoom(this.chat.roomId)

        return m_chat || {}
      }
    },
  }),
}