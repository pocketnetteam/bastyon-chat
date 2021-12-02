<template>
    <div id="chatTopheader">

    <topheader>

      <template v-slot:left>
        <backButton action="back" />
      </template>

      <template v-slot:info>
        <router-link v-if="chat && cog" :to="`/chatSettings?id=${chat.roomId.replace('!', '%')}`">
          <span>{{ $t("caption.Info") }}</span>
        </router-link>
        <span v-else>{{ $t("caption.Info") }}</span>
      </template>

      <template v-slot:right>
        <router-link v-if="chat && cog" :to="`/chatSettings?id=${chat.roomId.replace('!', '%')}`">
          <i class="fas fa-cog"></i>
        </router-link>
      </template>

    </topheader>
    </div>
</template>

<script>
export default {
  data: function (){
    return {
      cog: false
    }
  },
  props: {
    chat: {}
  },
  mounted() {
    var room = this.core.mtrx.client.getRoom(this.chat.roomId)
    if(room.getMember(this.core.mtrx.client.credentials.userId).powerLevel === 100 && !room.tetatet){
      this.cog = true
    }
  }
}
</script>

<style scoped>

</style>