import {mapState} from 'vuex';


export default {
  name: 'contactsPreview',
  props: {
    contact: {},
    // selected: false,
    mode: {
      default: '',
      type: String
    },
    user: null
  },

  components: {},

  data: function () {

    return {
      loading: false,
      isUser: '',
      asd: {}
    }

  },

  computed: mapState({
    auth: state => state.auth,

  }),

  methods: {

  },

  mounted() {
    // Checking if such user has signed up in chat
    // const user = this.core.mtrx.client.getUser(`@${this.user}:${this.core.domain}`)
    // if(!user) this.isUser = 'opacity: 0.5'
  }
}