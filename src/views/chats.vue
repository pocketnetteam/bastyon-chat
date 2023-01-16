<template>
  <div class="page chats" :class="{pocketnet, mobile, minimized, active, newChat}">   

    <topheader
      class="topheader" :share="share" @newchat="newchat" @sendMassMessage="sendMassMessage"
    />
    <maincontent ref="maincontent" :rbackexp="true" > 
      <template v-slot:content>
        
        <list :share="share" @scrolltop="scrolltop"/>

        <modal @close="closeNewChat" v-if="newChat && !hiddenInParent">

          <template v-slot:header>{{ $t("caption.newChat") }}</template>
          <template v-slot:body>
            <chatcreate @completed="chatcreated" @sendMassMessage="sendMassMessage"/>
          </template>
          <template v-slot:footer></template>

        </modal>

      </template>

    </maincontent>

    
  </div>
</template>

<style scoped lang="sass">


.topheader
  top: 0
  z-index: 999



.newChat
  /deep/ #maincontent
    
    .headerSpacer,
    .headerSpacerWrapper
      overflow: visible !important
    .headerSpacerWrapperOvf
      overflow: visible !important


.newChat.minimized.active
  /deep/ #maincontent
    .desktopList
      display: none

</style>

<script>

import list from '@/components/chats/list/index.vue'
import topheader from '@/components/chats/topheader/index.vue'
import { mapState } from 'vuex';
import contacts from '@/components/contacts/index.vue'
import chatcreate from '@/components/chat/create/index.vue'
export default {
  name: 'pagechats',
  components: {

    list,
    topheader,
    contacts,
    chatcreate

  },

  props : {
    share : Object,
  },

  data : function(){
    return {
      newChat : false
    }
  },

  computed:  mapState({
      pocketnet: state => state.pocketnet,
      minimized: state => state.minimized,
      active: state => state.active,
      mobile : state => state.mobile,
      hiddenInParent : state => state.hiddenInParent,
  }),

  methods : {
    // sendMassMessage : function(message){
    //   this.$emit('sendMassMessage', message);
    //   this.closeNewChat();
    // },
    sendMassMessage(chatMassMessage){

      console.log('sendmassmessage!', chatMassMessage)

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

        const sent = () => {

          recipients.shift();

          this.$store.commit('SET_RECIPIENTS', recipients)

          localStorage.setItem('chat_mass_message', JSON.stringify(chatMassMessage))        
        
        }

        
        for (const info of usersInfo){

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


              this.core.mtrx.client.createRoom(
                  {
                  room_alias_name: id,
                  visibility: 'private',
                  invite: [matrixId],
                  name: '#' + id,
                  initial_state: initialstate
              
                  }
              ).then(async(_chat) => {

                  console.log('_chat', _chat);
                  await sleep()

                  sent()
                  const result = await this.core.mtrx.testmessage({room: _chat.room_id, message: message})

                  console.log('result message 2', result);

                  

              })
              

          }




        }

      })


      this.closeNewChat();

    },
    newchat : function(){
      this.newChat = true
    },
    closeNewChat : function(){
      this.newChat = false
    },
    chatcreated : function(chat){
      this.$router.push({
        path: 'chat',
        query: {'id': chat.room_id}
      }).catch(e => {})
    },

    scrolltop : function(){
      this.$refs['maincontent'].scroll(0)
    },

    
  },

  mounted() {

    this.newChat = Boolean(this.$route.query?.type)
    
  }

}
</script>
