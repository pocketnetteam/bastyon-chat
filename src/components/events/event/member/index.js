import {mapState} from 'vuex';
import f from "@/application/functions";

export default {
  name: 'eventsMember',
  props: {
    event: Object,
    preview: Boolean,
    userinfo: Object,
  },

  data: function () {

    return {
      loading: false,
      pName: Object,
      membership: '',
      moder: false
    }

  },

  mounted : function(){
    this.$emit('readyToRender')
  },

  computed: mapState({
    auth: state => state.auth,
    keyword: function () {
      var pStateUsers = this.$store.state.users
      var membership = this.event.event?.content.membership

      var invitedUserID = f.getmatrixid(f.deep(this.event, 'event.state_key') || this.event.getSender())

      var invitedName = ''

      if (membership === 'join') return this.$i18n.t("caption.joinedInTheChat")

      if (membership === 'invite') {
        _.find(pStateUsers, (key, value) => {
          if (key.id === invitedUserID) {
            return invitedName = key.name
          }
        })
        return this.$i18n.t("caption.invited") + `${invitedName}` + this.$i18n.t("caption.inTheChat")
      }

      if (membership === 'ban') {
        _.find(pStateUsers, (key, value) => {
          if (key.id === invitedUserID) {
            return invitedName = key.name
          }
        })
        return this.$i18n.t("caption.banned") + ` ${invitedName} ` + this.$i18n.t("caption.andRoom")
      }

      if (membership === 'leave') {
        let user = this.$store.state.users[f.getmatrixid(this.event.target.userId)]
        if (user) {
          return `${user.name} ` + this.$i18n.t("caption.left") + this.$i18n.t("caption.theChat")
        }
      }

      if (this.event.event.type === 'm.room.power_levels' && this.event.event.unsigned.prev_content) {
        let newModer = Object.keys(f.ObjDiff(this.event.event.content.users, this.event.event.unsigned.prev_content.users))
        let pocketUser = this.$store.state.users[`${f.getmatrixid(newModer[0])}`]
        let userLevel = this.event.event.content.users[`${newModer[0]}`]
        if (!_.isEmpty(pocketUser) && newModer[0]) {
          if (userLevel === 0) {
            return this.$i18n.t("caption.unmarked") + ` ${pocketUser.name} ` + this.$i18n.t("caption.asModerator")
          }
          if (userLevel === 50) {
            return this.$i18n.t("caption.marked") + ` ${pocketUser.name} ` + this.$i18n.t("caption.asModerator")
          }
        }

      }
      if(this.event.event.type === 'm.room.topic'){
      }

      // }

      if (this.event.event.type === 'm.room.name') {
        return this.$i18n.t("caption.editedChatNameTo") + `"${this.event.event.content.name}"`
      }

    }
  }),

  methods: {},
}