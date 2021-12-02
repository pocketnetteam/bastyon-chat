<template>
  <div class="chatTime">

    <date v-if="time" :date="time"/>
    <span class="new" v-else>{{ $t("caption.new") }}</span>

  </div>
</template>

<style scoped lang="sass">
  .new
    color: $color-good
</style>

<script>


import moment from "moment";

export default {
  name: 'chatTime',

  props: {
    chat: Object,
    m_chat: {},
  },

  computed: {
    time: function () {
      var d = this.chat.lastModified
      if (this.m_chat._selfMembership === 'invite') {
        var timeFromNow = moment(moment.utc(d).toDate()).local().fromNow()
        if ((timeFromNow === 'in a few seconds' || timeFromNow === 'a few seconds ago')) {
          d = -1
        } else {
          return d
        }
        if (d < 0) return null

        return d
      }else {
        return d
      }
    }
  }
}
</script>



