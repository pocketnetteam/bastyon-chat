import {mapActions, mapState} from 'vuex'
export default {
  name: "ContactUserInfo",
  props: {},

  data: function () {

    return {
      loading: false,
      contact_info: "info contacts"
    }

  },
  components: {
  },
  created: () => {

  },

  watch: {
    //$route: 'getdata'
  },

  

  computed: mapState({
    auth: state => state.auth,
      ...mapState([
        'chats',
        'rooms'
      ])
  }),

  methods: {
    ...mapActions([
      'FETCH_CONTACTS',
      'SET_USER_TO_HEADER'
    ]),
   toContactInfo(room){
      this.$router.push({
        name: 'contact',
        query: {'roomId': room}
      })
      this.SET_USER_TO_HEADER(room)
   }
  },
  mounted() {
     this.rooms.find((room) => {
        if (room === this.$route.query.id) {
          this.contact_info = room
        }
      })
  }
}