import { mapState } from "vuex";

export default {
  name: "contactsTopheader",
  props: {
    title: {
      type: String,
      default: "Contacts",
      // default : this.$i18n.t("caption.contacts")
    },
  },

  data: function () {
    return {
      loading: false,
    };
  },

  watch: {
    //$route: 'getdata'
  },

  computed: mapState({
    auth: (state) => state.auth,
    minimized: (state) => state.minimized,
    pocketnet: (state) => state.pocketnet,
    active: (state) => state.active,
  }),

  methods: {
    minimizeall: function () {
      this.$store.commit("minimize", true);

      this.$router.push("/chats");
    },
  },
};
