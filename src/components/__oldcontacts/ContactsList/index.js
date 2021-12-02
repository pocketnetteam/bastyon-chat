import ContactUser from '../ContactUser/index.vue'
import {mapActions, mapState, mapGetters} from 'vuex'
export default {
  name: 'ContactList',
  props: {},

  data: function () {

    return {
      loading: false
    }

  },
  components: {
    ContactUser
  },
  created: () => {

  },

  watch: {
    //$route: 'getdata'
  },


  computed: mapState({
    auth: state => state.auth,
    ...mapState([
      'rooms',
      'localMatrixStore'
    ]),
    ...mapGetters([
      'getConnection'
      // ...
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
}