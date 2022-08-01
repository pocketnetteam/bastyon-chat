import { mapState } from "vuex";
import many from "@/components/assets/userspic/many.vue";
import f from "@/application/functions";
import _ from "underscore";

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
