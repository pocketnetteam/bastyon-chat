<template>
  <div class="page chat" :class="{mobile}">

    <topheader :key="k" class="topheader" v-show="!hideHeader || !ios"
               :u="u" :chat="chat" @addMember="addMemberModal"
    />

    <maincontent>

      <template v-slot:content>
        <chat @sending="sending"
              @newchat="newchat"
              :u="u" :chat="chat"
              :key="k"
              @removeBrokenRoom="creatorLeft"
              @getEvents="eventsRoom"
              @menuIsVisible="menuIsVisibleHandler"
        />

      </template>

    </maincontent>

    <modal @close="closeModal" v-if="openInviteModal">
      <template v-slot:header>
        <span>{{ $t("caption.inviteUser") }}</span>
      </template>
      <template v-slot:body>
        <contacts :mode="`inviteUsers`" :chatRoomId="chat.roomId" @closeModal="closeContactModal"/>
      </template>
      <template v-slot:footer></template>
    </modal>

  </div>
</template>

<style scoped lang="sass">

.topheader
  width: 100%
  top: 0
  z-index: 999

.aboutContact
  position: absolute
  left: 0
  right: 0
  top: 100px
  bottom: 0
  z-index: 999
  background: $color-applebuttontext

.chat.mobile
  /deep/ #maincontent
    .headerSpacerWrapper
      bottom: 0
      overflow: visible

    .headerSpacerWrapperOvf
      overflow: visible
      background: srgb(--background-hidden-layer);
</style>

<script>

import chat from '@/components/chat/index.vue';
import topheader from '@/components/chat/topheader/index.vue';
import contacts from '@/components/contacts/index.vue';
import {mapState} from 'vuex';
import f from '@/application/functions'

export default {
  name: 'pagechat',
  components: {
    chat,
    topheader,
    contacts
  },
  data: () => {
    return {

      events: [],
      openInviteModal: false,
      brokenRoom: false,
      hideHeader: false

    }
  },

  computed: {
    u() {
      return this.$route.query.u
    },
    chat() {
      var id = this.$route.query.id

      return this.$store.state.chatsMap[id]
    },

    k() {
      return this.u + this.$route.query.id
    },
    ios() {
      return f.isios();
    },

    ...mapState({
      pocketnet: state => state.pocketnet,
      minimized: state => state.minimized,
      mobile: state => state.mobile,
    }),

  },

  mounted() {
    setTimeout(() => {

      if (!this.leaveIfBroken()) {


      }


    }, 2000)
  },
  methods: {
    creatorLeft(val) {
      this.brokenRoom = val
    },
    closeModal() {
      this.openInviteModal = false
    },

    closeContactModal(value) {
      this.openInviteModal = value
    },
    addMemberModal(value) {
      this.openInviteModal = value
    },
    newchat(_chat) {

    },
    sending() {
    },
    eventsRoom(data) {
      this.events = data
    },
    menuIsVisibleHandler(isVisible) {
      this.hideHeader = isVisible;
    },

    leaveIfBroken() {
      if (this.brokenRoom) {

        this.core.mtrx.client.leave(from.query.id).then(r => {
          this.core.mtrx.client.forget(from.query.id, true).then(r => {
            return r
          }).then(r => {
            this.$store.commit('DELETE_ROOM', from.query.id);
          })

        })

        return true

      } else {

        return false

      }
    }
  },


}
</script>
