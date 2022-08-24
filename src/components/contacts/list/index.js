import {mapActions, mapGetters, mapState} from 'vuex'
import preview from '@/components/contacts/preview/index.vue'
import ModalWindow from '@/components/utils/ModalWindow.vue'


export default {
  name: "contactsList",
  data: function () {

    return {
      loading: false,
    }

  },
  components: {
    preview,
    ModalWindow
  },

  props: {
    mode: {
      default: '',
      type: String
    },
    users: Array,
    selected : Object,
    title: String,
  },
 
  watch: {
    //$route: 'getdata'
  },

 

  computed: mapState({
    auth: state => state.auth,
    minimized : state => state.minimized,

    ...mapActions([
      'PREPARE_USERDATA'
    ]),

    ...mapState([
      'contactsMap',
      'signedUpUsers',
    ]),

  }),

  methods: {
    select(contact) {
      this.$emit('select', contact)
    },

    navigateToProfile(id, contact) {

      if(this.mode == "Select"){
        this.select(contact)
      }
      else{
        this.$router.push({path: `/contact?id=${id}`}).catch(e => {})
      }
    },

    toggleUser(contact){
      this.$emit('toggleUser', contact.id)
    }

  },

  mounted() {
  }
}