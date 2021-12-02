  import {mapActions,mapState} from 'vuex'

export default {
    name: "User",


  data: function () {

    return {
      loading: false,
      textValue: ''
    }

  },
  props: {
        user_data: {
        type: String,
        default: () => {
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
  }),

  methods: {
       ...mapActions([
        'SET_USER_TO_HEADER'
      ]),
      toUserChat() {
        this.SET_USER_TO_HEADER(this.user_data);
        this.$router.push({
          name: 'user',
          params: { 'messages': this.user_data, 'user': this.user_data },
          query: { 'id': this.user_data }
        })
      }
  },
}