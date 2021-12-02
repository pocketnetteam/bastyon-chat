<template functional>
  <div class="userpic">

    <div class="userpicSquareWrapper">

      <div class="userpicSquareInnerWrapper" >
        <div class="userpicSquareInnerWrapper" :class="props.status">

          <bgimage v-if="props.userinfo.image" :src="props.userinfo.image"/>

          <div v-if="!props.userinfo.image && props.userinfo.name" class="charAvatar">
            <span>{{props.userinfo.name.charAt(0)}}</span>
          </div>

          <div class="statusIcon">  
            <i v-if="props.status == 'blocked' || props.status == 'ban'" class="fas fa-ban"></i>
            <i v-if="props.status == 'invite'" class="fas fa-user-plus"></i>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<style scoped lang="sass" src="./themes/theme_white.sass"></style>
<style scoped lang="sass" src="./themes/theme_black.sass"></style>
<!-- THEMES END -->



































