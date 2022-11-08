export default {
  name: "pageCaption",
  props: {
    caption: {
      type: String,
      default: this.i18n.t("caption.pageCaption"),
    },
  },
};
