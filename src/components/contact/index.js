import {mapState} from 'vuex';

import contactView from '@/components/contact/view/index.vue'
import userView from '@/components/user/view/pnuser/index.vue'
import contactActions from '@/components/contact/actions/index.vue'

export default {
  name: 'contact',
  props: {
    contact: Object
  },

  components: {
    contactView,
    contactActions,
    userView
  },

  data: function () {

    return {
      loading: false,
    }

  },
  created: () => {

  },

  watch: {
    //$route: 'getdata'
  },

  mounted() {
    this.$store.commit('active', true)
    this.$store.commit('blockactive', {value: true, item: 'contact'})
  },

  destroyed() {
    this.$store.commit('blockactive', {value: false, item: 'contact'})
  },

  computed: mapState({
    auth: state => state.auth,
    activeuser: function () {
      return this.core.user.userinfo

    },
    blocked: function () {

      if(this.$store.state.chats.length !== 0){
        return this.core.mtrx.blockeduser(this.contact.id)
      }

    },

    pocketnet: state => state.pocketnet,
    minimized: state => state.minimized,
    active: state => state.active,
  }),

  methods: {},
}