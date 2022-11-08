export default {
  name: "simpleButton",
  props: {
    caption: {
      type: String,
      default: this.$i18n.t("caption.caption"),
    },
  },

  methods: {
    click() {
      this.$emit("clicked");
    },
  },
};
