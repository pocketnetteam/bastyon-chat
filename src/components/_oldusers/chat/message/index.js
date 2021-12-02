import {mapState} from 'vuex'

export default {
  name: "message",

  data: function () {

    return {
      loading: false,
      message: {
        type: Object,
        default: () => {
        }
      }
    }

  },

  created: () => {

  },

  watch: {
    //$route: 'getdata'
  },

 

  computed: mapState({
    auth: state => state.auth,
    ...mapState([
      'currentUserChat'
    ]),
    className() {
      return {
        'chat__own': this.message.type === 'own',
        'chat__others': this.message.type === 'others'
      }
    }
  }),

  methods: {
    routeBack() {
      this.$router.go(-1);
    }
  },
}