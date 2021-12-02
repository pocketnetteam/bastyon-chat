import vMessage from '../message/index.vue'
import {mapActions,mapState} from 'vuex'

export default {
  name: "userChat",

  data: function () {

    return {
      loading: false,
      textValue: ''
    }

  },
  components: {
    vMessage
  },
  props: {
    user: {
      type: Object,
      default: () => {
      }
    },
    messages: {
      type: Array,
      default: () => []
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
        'SEND_MSG_TO_CHAT'
      ]),
      sendMessage() {
        let user = {...this.user};
        let chat = {
          id: this.messages.length + 1,
          time: new Date().toLocaleTimeString('en-US',
            {
              hour12: false,
              hour: "numeric",
              minute: "numeric"
            }
          ),
          text: this.textValue,
          type: "own"
        }

        user.chat.push(chat);

        this.SEND_MSG_TO_CHAT({userId: user.id, chat: user})
        .then(() => {
          this.textValue = ''
        })
      }
  },
}