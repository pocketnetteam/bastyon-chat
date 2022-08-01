import { mapState } from "vuex";

export default {
  name: "modal",
  props: {
    displayFooter: {
      default: true,
      type: Boolean,
    },
    cantclose: Boolean,
  },

  data: function () {
    return {
      loading: false,
    };
  },

  mounted() {
    this.$store.commit("active", true);
    this.$store.commit("blockactive", { value: true, item: "modal" });
  },

  destroyed() {
    this.$store.commit("blockactive", { value: false, item: "modal" });
  },

  watch: {
    //$route: 'getdata'
  },

  computed: mapState({
    auth: (state) => state.auth,
    pocketnet: (state) => state.pocketnet,
    minimized: (state) => state.minimized,
    active: (state) => state.active,
    mobile: (state) => state.mobile,
  }),

  methods: {
    close: function () {
      this.$emit("close");
    },
  },
};
