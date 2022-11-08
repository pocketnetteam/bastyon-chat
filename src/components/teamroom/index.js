import { mapState } from "vuex";

export default {
  name: "teamroom",
  props: {},

  data: function () {
    return {};
  },

  created: () => {},

  watch: {},
  computed: mapState({
    ...mapState([
      "minimized",
      "active",
      "pocketnet",
      "pocketteammessages",
      "readedteammessages",
    ]),
    mobile: function () {
      return this.$store.state.mobile;
    },
    teamNotifications: function () {
      var self = this;
      return _.filter(this.pocketteammessages, function (m) {
        return !self.readedteammessages[m.id];
      }).length;
    },
  }),

  methods: {
    click: function () {
      this.$emit("click");
    },
  },
};
