export default {
  name: "list",
  props: {
    items: {
      type: Array,
      required: true,
    },
    sort: {
      type: [Object, Boolean],
      default: false,
    },
  },
  computed: {
    readyItems: function () {
      return this.items;
    },
  },
};
