import { mapState } from "vuex";

export default {
  name: "complain",
  props: {
    p: Object,
  },

  data: function () {
    return {
      loading: false,
      reason: "",
      youremail: "",
    };
  },

  created: () => {},

  watch: {
    //$route: 'getdata'
  },

  computed: mapState({
    auth: (state) => state.auth,
  }),

  methods: {
    send: function () {
      if (this.loading) return;

      if (!this.reason) {
        this.$refs["reason"].focus();

        this.$store.commit("icon", {
          icon: "error",
          message: "State the reason for your complaint",
        });

        return;
      }
      if (!this.youremail) {
        this.$refs["youremail"].focus();

        this.$store.commit("icon", {
          icon: "error",
          message: "Please enter your email for feedback",
        });

        return;
      }

      if (!window.POCKETNETINSTANCE) {
        this.$store.commit("icon", {
          icon: "error",
          message: "Something went wrong, please try again later",
        });

        return;
      }

      var ps = {};
      _.each(this.p, function (v, i) {
        ps[i] = v;
      });

      ps.reason = this.reason;
      ps.email = this.youremail;

      var id = "common";

      if (ps.address2) {
        id = "user";
      }

      if (ps.roomid) {
        id = "room";
      }

      this.loading = true;

      window.POCKETNETINSTANCE.complainletters[id](ps, (r) => {
        this.loading = false;

        if (!r) {
          this.$store.commit("icon", {
            icon: "error",
            message: "Something went wrong, please try again later",
          });
        } else {
          this.$store.commit("icon", {
            icon: "success",
            message: "The complaint was successfully sent",
          });

          this.core.store.commit("setmodal", null);
        }
      });
    },

    setvalue: function (e) {
      this.reason = e.target.value || "";
    },

    setyouremail: function (e) {
      this.youremail = e.target.value || "";
    },
  },
};
