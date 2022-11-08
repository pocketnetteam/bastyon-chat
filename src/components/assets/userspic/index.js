import many from "@/components/assets/userspic/many.vue";

export default {
  name: "userspic",
  props: {
    users: Array,
    single: {},
    unseen: Number,
    slidesPerView: Number,
    status: {
      type: Object,
      default: {},
    },
  },

  data: function () {
    return {};
  },
  components: {
    many,
  },
};
