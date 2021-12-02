<template>
    <div class="back"  v-on:click='click'>
        <div class="iconbutton">
            <i :class="(icon || 'fas fa-angle-left')"></i>
        </div>
    </div>
</template>

<script>

export default {
  name: 'backButton',
  props: {
      icon : String,
      action: {
          type: String,
          default: '/',
      },
      caption: {
          type: String,
          default: ""
      }
  },
  methods: {
      click : function() {


        if(this.action == 'back') this.$router.go(-1)

        else

        this.$router.push(this.action);
    }
  }
}
</script>

<style scoped lang="sass">
    .back-icon
        cursor: pointer
    .backbutton-caption
        cursor: pointer
        position: relative
        left: 2 * $r
</style>