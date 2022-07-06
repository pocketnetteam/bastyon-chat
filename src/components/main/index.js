import FooterChat from "../layouts/footerChat/index.vue";
import gallery from "@/components/gallery/index.vue";
import ChatsContainer from "@/components/main/components/ChatsContainer.vue";
import ContactsContainer from "@/components/main/components/ContactsContainer.vue";
import SettingsContainer from "@/components/main/components/SettingsContainer.vue";
import { mapState } from "vuex";

export default {
  name: "mainWrapper",
  components: {
    FooterChat,
    gallery,
    ChatsContainer,
    ContactsContainer,
    SettingsContainer,
  },
  data: function () {
    return {
      prevRoute: null,
      loading: false,
      page: this.$route.query.page ? this.$route.query.page : "chats",
      showPage:
        this.$route.path === "/chat" ||
        this.$route.path === "/contact" ||
        this.$route.path === "/publicPreview" ||
        this.$route.path === "/chatSettings" ||
        this.$route.path === "/chatInfo" ||
        this.$route.path === "/teamRoom" ||
        this.$route.path === "/invite",
    };
  },

  created: () => {},

  watch: {
    "$route.query.page": {
      handler: function (page) {
        this.page = page ? page : "chats";
      },
      deep: true,
      immediate: true,
    },
    "$route.path": {
      handler: function (path) {
        this.showPage =
          path === "/chat" ||
          path === "/contact" ||
          path === "/publicPreview" ||
          path === "/chatSettings" ||
          path === "/chatInfo" ||
          path === "/teamRoom" ||
          path === "/invite";
      },
      deep: true,
      immediate: true,
    },
  },

  mounted() {
    this.page = this.$route.query.page ? this.$route.query.page : "chats";
    this.showPage =
      this.$route.path === "/chat" ||
      this.$route.path === "/contact" ||
      this.$route.path === "/publicPreview" ||
      this.$route.path === "/chatSettings" ||
      this.$route.path === "/chatInfo" ||
      this.$route.path === "/teamRoom" ||
      this.$route.path === "/invite";
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
