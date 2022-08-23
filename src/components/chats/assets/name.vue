<template>

  <div class="nameline">
    <div class="iconGroup" v-if="isShowGroupIcon">
      <i class="fas fa-solid fa-users"></i>
    </div>
    <div>
      {{ convertedName }}
    </div>
  </div>

</template>

<style scoped lang="sass">
.nameline
  display: flex !important
  align-items: center
  justify-content: center
.iconGroup
  margin-right: 5px
  i
    color: rgb(0,164,255)
</style>

<script>


export default {
  name: 'chatName',

  props: {
    chat: Object,
    preview: Boolean,
    m_chat: {}
  },
  data: function () {
    return {
      //convertedName: ''
    }
  },
  computed: {

    users : function(){
      if(!this.chat) return []

      return this.core.mtrx.anotherChatUsers(this.chat.roomId)
    },

    convertedName : function(){
      if(this.m_chat && this.m_chat.getJoinRule() === 'public' && this.m_chat.currentState.getStateEvents('m.room.name').length > 0){

        return this.m_chat.currentState.getStateEvents('m.room.name')[0].getContent().name
      }
      var users = _.filter(this.users, (user) => {
        return user.userId != this.core.user.userinfo.id
      })

      var names = _.filter(_.map(users, (user) => {

        if(this.$store.state.users[user.userId]) return this.$store.state.users[user.userId].name

      }), function(name) {
        return name
      })

      if(!names.length) {

        if(this.core.mtrx.chatUsers(this.chat.roomId).length){

          return 'Empty chat: ' + this.chat.roomId
        }

        return '-'

      }

      if(this.m_chat.name.indexOf("@") == 0) return this.m_chat.name.replace('@', '')
      
      return names.join(', ')
    },

    isShowGroupIcon() {
      return this.m_chat.name.slice(0, 1) === '@';
    },
  },

  mounted: function () {
    console.log('m.room.guest_access', m.room.guest_access);
  },
}
</script>
