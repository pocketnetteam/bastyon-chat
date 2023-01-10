
import FooterChat from '../layouts/footerChat/index.vue'
import gallery from '@/components/gallery/index.vue'
import {mapState, mapGetters} from 'vuex'

export default {
  name: "mainWrapper",
  components: {
    FooterChat,
    gallery
  },
  data: function () {

    return {
      prevRoute: null,
      loading: false,
    }

  },

  created: () => {

  },

  watch: {
    //$route: 'getdata'
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.prevRoute = from
    })
  },

  beforeRouteLeave(to, from, next) {
		this.$store.commit('setmodal', null)
		next()
	},

  computed: {
    ...mapState({
      auth: state => state.auth,
      pocketnet: (state) => state.pocketnet,

      ...mapState([
        'currentUserChat',
        'minimized',
        'gallery',
        'active',
        'mobile',
        'recipientsTotal',
        'recipients'
      ]),

      showFooter : function(){
        return this.$route.name != 'chat' || this.minimized
      },

    }),
    ...mapGetters(['massMessageAvailable'])
  },

  methods: {
    closeGallery : function(){
      this.$store.commit('GALLERY', null)
    },
    sendMassMessage(chatMassMessage){

      const {message, recipients, total} = chatMassMessage;

      this.$store.commit('PROCESS_MASS_MAILING', true);
      this.$store.commit('SET_RECIPIENTS_TOTAL', total);

      this.core.user.usersInfo(recipients, true).then(async usersInfo => {                      
                              
        const sleep = async () => {

            return new Promise(resolve => {

              setTimeout(() => {

                resolve('slept')
                return true;
                
              }, 200)

            })

        }

        const secondsToHms = (d) => {
          d = Number(d);
          var h = Math.floor(d / 3600);
          var m = Math.floor(d % 3600 / 60);
          var s = Math.floor(d % 3600 % 60);
      
          var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
          var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
          var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
          return hDisplay + mDisplay + sDisplay; 
      }

        const sent = () => {

          recipients.shift();

          this.$store.commit('SET_RECIPIENTS', recipients)

          localStorage.setItem('chat_mass_message', JSON.stringify(chatMassMessage))    
          
          this.$store.commit('SENT_MASS_MESSAGE');

        
        }

        const limit = 86400 - ((new Date().getTime() - Number(this.$store.state.massMessageLimitDate)) / 1000);

        if (!this.massMessageAvailable && (limit < 0)){
          this.$store.commit('SET_MASS_MESSAGE_LIMIT');
        }

        for (const info of usersInfo){

          if (!this.massMessageAvailable){
            this.$store.commit('icon', {
              icon: 'error',
              message: "Exceeded daily limit of 300 messages. Please, wait " + secondsToHms(limit)
            })
            this.$store.commit('PROCESS_MASS_MAILING', false);
            break;
          } 

          const id = this.core.mtrx.kit.tetatetid(info, this.core.user.userinfo)

          const matrixId = this.core.user.matrixId(info.id);
          
          var initialstate = [{
            "type": "m.set.encrypted",
            "state_key": "",
            "content": {
                encrypted: true
            }
          }]


          const room = this.$store.state.chatsMap[id];

          if (room){

            console.log('room', room);
            await sleep()
            sent();
            const result = await this.core.mtrx.testmessage({room: room.roomId, message: message})
            console.log('result message', result);
              

          } else {

            sent();

            this.core.mtrx.client.createRoom(
                {
                room_alias_name: id,
                visibility: 'private',
                invite: [matrixId],
                name: '#' + id,
                initial_state: initialstate
            
                }
            ).then(async(_chat) => {

              const result = await this.core.mtrx.testmessage({room: _chat.room_id, message: message})

              console.log('result message 2', result);

            }).catch(err => {
              console.log('room create mailing err', err);
            })
            

          }

        }

      })
    },

  },

  mounted(){

    const chatMassMessage = JSON.parse(localStorage.getItem('chat_mass_message') || '{}');

    if (chatMassMessage.recipients?.length && chatMassMessage.message){

      this.$store.commit('SET_RECIPIENTS', chatMassMessage.recipients)
      this.$store.commit('SET_RECIPIENTS_TOTAL', chatMassMessage.total)

    }
  }


}