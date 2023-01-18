<template>
  <div class="page contact">
    <topheader v-if="user" :contact="user"> </topheader>

    <maincontent>
      <template v-slot:content>
        <contact v-if="user" :contact="user" />
      </template>
    </maincontent>
  </div>
</template>

<style scoped lang="sass"></style>

<script>
import contact from "@/components/contact/index.vue";
import topheader from "@/components/contact/topheader/index.vue";
import { mapState } from "vuex";

export default {
  name: "pagecontact",
  components: {
    contact,
    topheader,
  },

  computed: {
    user: function () {
      var id = this.$route.query.id;

      var contact = this.$store.state.users[id];

      return contact;
    },
    ...mapState({
      pocketnet: (state) => state.pocketnet,
      minimized: (state) => state.minimized,
    }),
  },

  methods: {},

  mounted() {
    var id = this.$route.query.id;
    this.core.user.usersInfo(id).then((r) => {});
  },
};
</script>
