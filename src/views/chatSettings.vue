<template>
  <div v-if="chat">
    <topheader class="topheader"/>

    <maincontent>
      <template v-slot:content>
        <settings :chat="chat" />
      </template>
    </maincontent>
  </div>
</template>
<script>
import topheader from "@/components/chatSettings/topheader/index.vue";
import settings from "@/components/chatSettings/index.vue"

export default {
  name: 'chatSettings',
  data: function (){
    return {
    }
  },
  components: {
    topheader,
    settings
  },
  computed: {
    chat() {
      return this.$store.state.chatsMap[this.$route.query.id.replace('%', '!')]
    },
  },
  methods: {
  }
}
</script>