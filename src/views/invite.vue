<template>
  <div class="page contacts">
    <topheader>
      <template v-slot:left>
        <div class="back" v-on:click="back">
          <div class="iconbutton">
            <i class="fas fa-angle-left"></i>
          </div>
        </div>
      </template>

      <template v-slot:info>
        <span>{{ title }}</span>
      </template>

      <template v-slot:right>
        <div class="iconbutton" @click="openMore" v-if="navigator.share">
          <i class="fas fa-share-alt"></i>
        </div>
      </template>
    </topheader>

    <maincontent>
      <template v-slot:content>
        <inviteChoice ref="inviteChoice"></inviteChoice>
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
import inviteChoice from "@/components/invite/index.vue";
import { mapState } from "vuex";

export default {
  name: "pageinvite",
  data: function () {
    return {};
  },
  components: {
    inviteChoice,
  },

  computed: mapState({
    pocketnet: (state) => state.pocketnet,
    minimized: (state) => state.minimized,
    title: function () {
      return this.$i18n.t("caption.inviteFriend");
    },
    navigator: function () {
      return navigator || {};
    },
  }),

  methods: {
    back: function () {
      this.$refs.inviteChoice.back();
    },
    openMore: function () {
      this.$refs.inviteChoice.openMore();
    },
  },

  mounted() {},
};
</script>
