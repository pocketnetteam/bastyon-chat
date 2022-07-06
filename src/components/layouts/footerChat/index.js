import { mapState } from "vuex";
export default {
  name: "footerChat",

  data: function () {
    return {
      loading: false,
    };
  },

  created: () => {},

  watch: {
    //$route: 'getdata'
  },

  computed: mapState({
    pocketnet: (state) => state.pocketnet,
    minimized: (state) => state.minimized,
    active: (state) => state.active,
    auth: (state) => state.auth,
    notificationCount: (state) => state.allnotifications,

    current: function () {
      return this.$route.name;
    },

    query: function () {
      return this.$route.query;
    },

    activesettings: function () {
      return this.query.page === "settings";
    },

    activecontacts: function () {
      return this.query.page == "contacts";
    },

    activechats: function () {
      return this.query.page === undefined || this.query.page == "chats";
    },

    mobile: function () {
      return this.$store.state.mobile;
    },
  }),
  methods: {
    gotona(r) {
      this.$router.push({
        path: this.$router.path,
        query: {
          ...this.$route.query,
          page: r,
        },
      });
      this.$store.commit("active", true);
      this.$store.commit("setiteraction", true);
    },

    movefromchat: function () {
      if (this.core.backtoapp) this.core.backtoapp();
    },
  },
};
