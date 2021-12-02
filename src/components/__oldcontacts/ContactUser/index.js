import { mapState} from 'vuex'
export default {
    name: "ContactUser",
   props: {
      rooms_data: {
        type: String,
        default: () => {}
      }
    },

  data: function () {

    return {
      loading: false
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
     toContactInfo() {
        this.$emit('to-contact-info')
      }
  },
}