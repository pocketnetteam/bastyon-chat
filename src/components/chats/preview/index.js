import {mapState} from 'vuex';
import chatName from '@/components/chats/assets/name.vue'
import chatTime from '@/components/chats/assets/time.vue'
import chatIcon from '@/components/chats/assets/icon.vue'


export default {
  name: 'preview',
  props: {
    chat: Object,
    dummy: Boolean,
  },

  components: {
    chatName,
    chatTime,
    chatIcon
  },

  data: function () {

    return {
      loading: false,
      roomMuted: false,
      ready: false,
      lastEvent: {},
      userStatusRoom: String,
    }

  },

  watch: {
    m_chat: {
      immediate: true,
      handler: function () {

        this.ready = false

        if (this.m_chat && !_.isEmpty(this.m_chat)) {

          console.log('this.m_chat', this.m_chat, this.m_chat.currentState._joinedMemberCount)

          this.core.mtrx.kit.prepareChat(this.m_chat).then(r => {
            this.ready = true
          })
        }
        
      }
    }

  },


  mounted : function(){

    
  },

  computed: mapState({
    auth: state => state.auth,
    blockedCheck: function () {
      var users = this.core.mtrx.anotherChatUsers(this.m_chat.roomId)

      if (users.length == 1) {
        return this.core.mtrx.blockeduser(users[0].userId)
      }

    },
    m_chat: function () {

      if (!this.core.mtrx.client || !this.chat) return null

      let pushRules = this.core.mtrx.client._pushProcessor.getPushRuleById(this.chat.roomId)

      if (pushRules !== null) {
        this.roomMuted = true
      }

      if (this.chat.roomId) {

        var m_chat = this.core.mtrx.client.getRoom(this.chat.roomId)

        return m_chat || null
      }

    },
    chatevents: function () {
      return (this.events[this.chat.roomId] || {}).timeline || []
    },

    key: function () {
      if (this.event) return this.event.event_id

      return 'key'
    },

    unknowngroupusers : function(){
      return this.core.mtrx.kit.unknowngroupusers(this.chat)
    },

  

    event: function () {

      if (this.chat && this.chat.roomId) {

        var members = this.m_chat.currentState.getMembers()

        var events = _.filter(this.chatevents, (e) => {
     
          if (members.length <= 2 &&
            (e.event.type === 'm.room.power_levels' || (
              e.event.type === 'm.room.member' && e.event.content.membership !== 'invite'
            ))

          ) {
            return false
          }
          if (e.event.type === 'm.room.redaction') {
            return false
          }

          return !(e.event.content['m.relates_to'] && e.event.content['m.relates_to']["rel_type"] === 'm.replace');

        })

        events = _.sortBy(events, function (e) {
          return e.event.origin_server_ts
        })

        if (events.length) {
          return events[events.length - 1]
        }

      }

    },

    ...mapState([
      'minimized',
      'active',
      'events'
    ]),
  }),

  methods: {},
}