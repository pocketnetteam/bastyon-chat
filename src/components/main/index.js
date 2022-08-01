import FooterChat from "../layouts/footerChat/index.vue";
import gallery from "@/components/gallery/index.vue";
import { mapState } from "vuex";

export default {
  name: "mainWrapper",
  components: {
    FooterChat,
    gallery,
  },
  data: function () {
    return {
      prevRoute: null,
      loading: false,
    };
  },

  created: () => {},

  watch: {
    //$route: 'getdata'
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.prevRoute = from;
    });
  },

  beforeRouteLeave(to, from, next) {
    this.$store.commit("setmodal", null);
    next();
  },

  computed: mapState({
    auth: (state) => state.auth,

    ...mapState([
      "currentUserChat",
      "minimized",
      "gallery",
      "active",
      "mobile",
    ]),

    showFooter: function () {
      return this.$route.name != "chat" || this.minimized;
    },
  }),

  methods: {
    closeGallery: function () {
      this.$store.commit("GALLERY", null);
    },
  },
};
