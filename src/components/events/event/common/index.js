import { mapState } from "vuex";

export default {
  name: "eventsCommon",
  props: {
    event: Object,
    preview: Boolean,
    userinfo: Object,
  },

  data: function () {
    return {
      loading: false,
    };
  },

  computed: mapState({
    auth: (state) => state.auth,
  }),

  methods: {},
};
