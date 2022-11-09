import { mapState, mapGetters } from 'vuex';
import contacts from '@/components/contacts/index.vue'
import InputField from '@/components/chat/input/InputField/InputField.vue'
import f from '@/application/functions.js'
import publicAddresses from './publicAddresses.json';

export default {
    name: 'chatcreate',
    props: {
    },

    components : {
        contacts,
        InputField: InputField
    },

    data : function(){

        return {
            loading : false,

            types : {
           
                privategroup : {id : 'privategroup', icon : 'fas fa-user-friends', value : 'private'},

                publicgroup : {id : 'publicgroup', icon : 'fas fa-users', value : 'public'},

                massmailing : {id : 'massmailing', icon : 'fas fa-envelope', value : 'mass'},

                
            },

            type : null,

            groupName : '',

            massMessage : '',

            selected : {},

        }

    },

    created : () => {

    },


    watch: {
        //$route: 'getdata'
    },
    computed: {
        ...mapState({
            auth : state => state.auth,

            cancomplete : function(){

                if(!this.type) return false

                if (this.type.id == 'privategroup'){
                return this.selectedLength > 1
                }

                if (this.type.id == 'publicgroup'){
                    if (this.groupName)
                        return true

                    return false
                }

                if (this.type.id == 'massmailing'){
                    return true;
                }

            },

            selectedLength : function(){
                return _.toArray(this.selected).length
            },

            pro : state => {
                    
                return publicAddresses.indexOf(state.address) > -1;

            }

        }),

        viewTypes(){

            const {massmailing, ...typesWithout} = this.types;

            if (this.pro){
                return this.types;
            }

            return typesWithout;
        }

    },

    methods : {
        typeMassMessage(message){
            this.massMessage = message;
        },
        createChats(){

            if (!Object.values(this.selected).length || !this.massMessage){

                this.$store.commit('icon', {
                    icon: 'error',
                    message: 'Please enter a message and choose recipients (subscribers)'
                })

                return;
            }
        
            this.core.user.usersInfo(Object.values(this.selected), null, null, true).then((user, index) => {

                console.log('user', user);

                if (user && user.length){

                    const recipients = user[0].source.subscribers || [];

                    const chatMassMessage = {message: this.massMessage, recipients: recipients, total: recipients.length};

                    localStorage.setItem('chat_mass_message', JSON.stringify(chatMassMessage))

                    this.$emit('sendMassMessage', chatMassMessage)

                }

            
            })
        },


        unselecttype : function(){
            this.type = null
            this.selected = {}
        },

        selecttype : function(id){
            this.type = this.types[id]
            this.selected = {}
        },
        selectedUsers : function(u){
            this.selected = u
        },
        selectoneuser : function(u){

            var tetatetid = this.core.mtrx.kit.tetatetid(u, this.core.user.userinfo)

            this.$router.push('chat?id=' + tetatetid + '&u=' + u.id).catch(e => {})
            
        },

        complete(){

            if (this.type.id === 'massmailing'){
                return this.createChats();
            }

            this.createGroupAction(this.selected).then(chat => {

                this.$emit('completed', chat)

                this.$store.commit('icon', {
                    icon: 'success',
                    message: "",
                })

               

            }).catch(e => {

                var text = 'An unexpected error occurred'

                if (e == 'cantcomplete') text = 'Please enter a group name and add chat members'

                this.$store.commit('icon', {
                    icon: 'error',
                    message: text
                })
            })

        },

        createGroupAction(users) {

            if(!this.cancomplete){
                return Promise.reject('cantcomplete')
            }

            if(!this.type){
                return Promise.reject('type')
            }

            if(_.isEmpty(users)){
                return Promise.reject('users')
            }

            const data = this.core.mtrx.kit.groupIdLight(users)

            this.$store.state.globalpreloader = true;      


            return this.core.mtrx.client.createRoom({

              //room_alias_name: '#' + data.hash,
              visibility: this.type.value, // this.selectedValue === 'Private' ? 'private' : 'public',
              invite: data.idForInviting,
              name: '@' + (this.groupName ? this.groupName : "New Room"),

              initial_state: [
      
                {
                  "type": "m.room.guest_access",
                  "state_key": "",
                  "content": {
                    "guest_access": "can_join"
                  }
                },
              ]
      
            }).then(chat => {
      
              this.$store.state.globalpreloader = false

              return chat

              
      
            }).catch(e => {
      
              this.$store.state.globalpreloader = false

              return Promise.reject(e)
            })
      
          },


    },

    mounted(){

        this.type = this.$route.query?.type || '';
    }

}