<template>

  <div class="nameline">
    <div class="iconGroup" v-if="isShowGroupIcon">
      <i class="fas fa-user-friends"></i>
    </div>
    <div class="nameofchat">
      {{ convertedName.toString().slice(0, 13) }}
    </div>
  </div>

</template>

<style scoped lang="sass">
.nameline
  display: flex !important
  justify-content: center
  align-items: center

.iconGroup
  display: block
  font-size: 0.4em
  width: 16px !important
  text-align: center
  height: 16px !important
  line-height: 16px
  border-radius: 8px
  background: srgb(--neutral-grad-2)
  margin-right: $r
  margin-block: 0.5 * $r
  i
    color: srgb(--neutral-grad-1)
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

    convertedName: function () {
      if (
        this.m_chat &&
        this.m_chat.getJoinRule() === "public" &&
        this.m_chat.currentState.getStateEvents("m.room.name").length > 0
      ) {
        return this.m_chat.currentState
          .getStateEvents("m.room.name")[0]
          .getContent().name;
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
  },
}
</script>
