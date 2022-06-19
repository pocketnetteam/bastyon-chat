<template>
  <div
    class="page chats"
    :class="{ pocketnet, mobile, minimized, active, newChat }"
  >
    <topheader class="topheader" :share="share" @newchat="newchat" />
    <maincontent ref="maincontent" :rbackexp="true">
      <template v-slot:content>
        <list :share="share" @scrolltop="scrolltop" />

        <modal @close="closeNewChat" v-if="newChat && !hiddenInParent">
          <template v-slot:header>{{ $t("caption.newChat") }}</template>
          <template v-slot:body>
            <chatcreate @completed="chatcreated" />
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
import list from "@/components/chats/list/index.vue";
import topheader from "@/components/chats/topheader/index.vue";
import { mapState } from "vuex";
import contacts from "@/components/contacts/index.vue";
import chatcreate from "@/components/chat/create/index.vue";
export default {
  name: "pagechats",
  components: {
    list,
    topheader,
    contacts,
    chatcreate,
  },

  props: {
    share: Object,
  },

  data: function () {
    return {
      newChat: false,
    };
  },

  computed: mapState({
    pocketnet: (state) => state.pocketnet,
    minimized: (state) => state.minimized,
    active: (state) => state.active,
    mobile: (state) => state.mobile,
    hiddenInParent: (state) => state.hiddenInParent,
  }),

  methods: {
    newchat: function () {
      this.newChat = true;
    },
    closeNewChat: function () {
      this.newChat = false;
    },
    chatcreated: function (chat) {
      this.$router.push({
        path: "chat",
        query: { id: chat.room_id },
      });
    },

    scrolltop: function () {
      this.$refs["maincontent"].scroll(0);
    },
  },

  mounted() {},
};
</script>
