import { mapState } from "vuex";

export default {
  name: "headerChat",

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
    auth: (state) => state.auth,
    ...mapState(["currentUserChat"]),
    isCoreRoute() {
      return this.$route.path === "/";
    },
  }),

  methods: {
    routeBack() {
      this.$router.go(-1);
    },
  },
};
