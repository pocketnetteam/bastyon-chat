<template>
  <label>
    <label :chunks="chunks" v-for="(chunk, index) in chunks" v-bind:key="index">
      <label class="likelink" v-if="chunk.id" @click="show(chunk)"
        >@{{ chunk.name }}</label
      >
      <label v-else>{{ chunk }}</label>
    </label>
  </label>
</template>

<script>
export default {
  name: "IncomingMessage",
  props: {
    message: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      user_id: /\w{68}:/,
      userCalled: /@\w{68}:\w{1,50}/g,
    };
  },
  computed: {
    chunks: function () {
      if (this.message.indexOf("@") == -1) return [this.message];

      var c = this.message.split(this.userCalled);
      var us = Array.from(this.message.matchAll(this.userCalled), (m) => m[0]);

      var r = [];

      _.each(c, function (v, i) {
        r.push(v);

        if (us[i]) {
          var ch = us[i].replace("@", "").split(":");

          ch.length == 2
            ? r.push({
                id: ch[0],
                name: ch[1],
              })
            : r.push(us[i]);
        }
      });

      return r;
    },
  },

  methods: {
    show: function (chunk) {
      this.core.mtrx.kit.usersInfoById(chunk.id).then((r) => {
        core.mtrx.opencontact(r);
      });
    },
  },
};
</script>

<style lang="sass" scoped>

label
    display: inline

.likelink
    text-decoration: underline
    cursor: pointer
</style>
