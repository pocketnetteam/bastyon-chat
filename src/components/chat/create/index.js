import { mapState, mapGetters } from 'vuex';
import contacts from '@/components/contacts/index.vue'
import InputField from '@/components/chat/input/InputField/InputField.vue'
import f from '@/application/functions.js'

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

                const addresses = [
                    "PQ8AiCHJaTZAThr2TnpkQYDyVd1Hidq4PM",
                    "TQEGz5cQQtRad8wo2c1KapvFek9rnuprkD",
                    "PU7D6X5bNUdEiuUGWGLp8C6TjSsB2hzHxL",
                    "PP6bNhVaXy7YK19UbLHXbQPKa7oV4yx1rr",
                    "PKU652wwKYC52WGBJ8EHkA1Mtud8iHWChC",
                    "PToMRMsMVh9dj4Cpa7yu1pB5iq65g4jrVC",
                    "PKszvjHwMWubQpeEKnQhRonGBVFWcJDbNJ",
                    "PDjvHUQjcDX8Vq6rtpKveUDPtwPVUZEW7m",
                    "PCMnk8T3Edu81iGcTEpVCFq8FQd6UBXi2y",
                    "PKxqtUuK3B6qwAxs6HLhvxrQVExuMwKWd5",
                    "PGe4xVAJRJtbD8swPipE2ug9Zk1rhSTa1y",
                    "PDWPDFikMhLJHtiKLLXZGzfgphRcd19eHe",
                    "PGURYzvoXuSvuwCuDty2wW37omjiKgzV5a",
                    "PRDKVP4yvF2wW8p5FUVkzrCvXYE8SMGkQK",
                    "PBHvKTH5TGQYDbRHgQHTTvaBf7tuww6ho7",
                    "PBHvKTH5TGQYDbRHgQHTTvaBf7tuww6ho7",
                    "PEkKrb7WJgfU3rCkkU9JYT8jbGiQsw8Qy8",
                    "PXEWRce8siwbQWArQWyjnooogAEieHwhVd",
                    "PGyjEoqmmK2tm6xmg69hGoSNM6hUrc4VfE",
                    "PVSdoFQqAg86p6tbAW8Y6CGGGjhiXkr4qh",
                    "PWioUw52q4iNpMQUauNYaWg9JpsPE1u9Ut",
                    "PVeqjqJk2GthxBK6QdhCCfQVEX1SAK92As",
                    "PFnN8SExxLsUjMKzs2avdvBdcA3ZKXPPkF",
                    "P93cWU7X31wqn3R9GcUZ7c3fD11asXum5y",
                    "PM4gVCcWnTmysUXhMukoQA2mT7GpfWQvck",
                    "PMSULgjrsCsEnWgNigCga5jSjhCvYBFSA8",
                    "P9R3aNvyjRbqTWfy5q1h5qvXFYaDtqaRi2",
                    "PNcvYsMXzf4RVmS9AjRYEqeeGjk1PiDjvF",
                    "PS9F8hzGSxeL1Lc2VGvPoqXHotZvpoVkkX",
                    "PBK1GDpiLNVFrKsPVAaNLU92byFY5P5KBr",
                    "PBMcLRBQNWtNQZYUbRZZAd5FuZ8yb7HMX2",
                    "PP582V47P8vCvXjdV3inwYNgxScZCuTWsq",
                    "TLENU8HFyz8PqzpKBDWeN6Xix6rM8wjYKd",
                    "TPjN8Dy4BpGDezMNw2ePuEdHiHetTvR3Mb",
                    "TU8fAf96kSfQzmxmpjRDSSqvCiPWzWt67J",
                    "TKJ7xAC18XC4zQBvkNAWhkr3i7cARu11Uv",
                    "TZBHmnZwLedPtHcJfJnFsbxobGuDKGf9uA",
                    "TXyieuLsCntT1p4ougtiKURtYTxcdvWN1L",
                    "TT2CeQuHiM8E8hG4rkJcaMKQ8gWqhZmNUH",
                    "TLMXdC2UYSfMVbLzKtmJJTi4oK9LNHNVju",
                    "THCRHFtVAoeDGLg548C4bQxXeDg9bwrs5K",
                    "TVcPMgVQ9TxgpzNrQyEAei5cnnR9jzXtzE",
                    "THsA8rwdeAkq5bePA71Nw5CGtFg2duyDSq"
                ];
                    
                return addresses.indexOf(state.address) > -1;

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

                    recipients.unshift(user[0].source.address)

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