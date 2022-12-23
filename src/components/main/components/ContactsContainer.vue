<template>
  <div class="page contacts">
    <topheader class="topheader" :title="title" />

    <maincontent>
      <template v-slot:content>
        <contacts :mode="mode" />
      </template>
    </maincontent>
  </div>
</template>

<style scoped lang="sass">

.topheader
  top: 0
  z-index: 999
</style>

<script>
import topheader from "@/components/contacts/topheader/index.vue";
import contacts from "@/components/contacts/index.vue";
import { mapState } from "vuex";

export default {
  name: "pagecontacts",
  data: function () {
    return {
      page: "Contacts",
      showInviteButton: false,
    };
  },
  components: {
    contacts,
    topheader,
  },

  computed: mapState({
    pocketnet: (state) => state.pocketnet,
    minimized: (state) => state.minimized,
    title: function () {
      if (this.$route.query.startnew)
        return this.$i18n.t("caption.startNewChat");

      return this.$i18n.t("caption.contacts");
    },

    mode: function () {
      if (this.$route.query.startnew) {
        return "GroupsCreate";
      }

      return this.page;
    },
  }),

  methods: {},

  mounted() {
    this.$store.commit("SET_LAST_ROOM", null);
  },
};
</script>
