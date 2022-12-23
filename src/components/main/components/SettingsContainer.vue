<template>
  <div class="page settings">
    <topheader class="topheader" />

    <maincontent>
      <template v-slot:content>
        <settings />
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
import settings from "@/components/settings/index.vue";
import topheader from "@/components/settings/topheader/index.vue";
import { mapState } from "vuex";

export default {
  name: "pagesettings",
  components: {
    settings,
    topheader,
  },

  computed: mapState({
    pocketnet: (state) => state.pocketnet,
    minimized: (state) => state.minimized,
  }),

  methods: {},

  mounted() {},
};
</script>
