import { mapState } from 'vuex';
import contacts from '@/components/contacts/index.vue'

export default {
    name: 'chatinvite',
    props: {
        chatRoomId : String
    },

    components : {
        contacts
    },

    data : function(){

        return {
            loading : false,
            selected : {}

        }

    },

    created : () => {

    },

    watch: {
        //$route: 'getdata'
    },
    computed: mapState({
        auth : state => state.auth,

        cancomplete : function(){
            return this.selectedLength
        },

        selectedLength : function(){
            return _.toArray(this.selected).length
        },

        active: state => state.active,
        minimized: state => state.minimized,

    }),

    methods : {
    
        selectedUsers : function(u){
            this.selected = u
        },
     
        complete(){

            this.inviteUserAction(this.selected).then(() => {

                this.$emit('completed')

                this.$store.commit('icon', {
                    icon: 'success',
                    message: "",
                })

            }).catch(e => {
                console.error(e)

                var text = 'An unexpected error occurred'

                if (e == 'cancomplete') text = 'Please select at least one contact'

                this.$store.commit('icon', {
                    icon: 'error',
                    message: text
                })
            })

        },

        inviteUserAction(users) {

            if(!this.chatRoomId){
                return Promise.reject('chatRoomId')
            }

            if(!this.cancomplete) return Promise.reject('cancomplete')

            var roomID = this.chatRoomId
      
            return Promise.all(_.map(users, (id) => {

              var matrixID = '@' + `${id}` + ':' + this.core.domain

              console.log('matrixID', matrixID)
      
              return this.core.mtrx.client.invite(roomID, matrixID)

            })).then(r => {
                return Promise.resolve()
            })
      
          }
    },
}