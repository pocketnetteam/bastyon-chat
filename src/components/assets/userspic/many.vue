<template>
  <div class="aboutRoomAvatar" v-if="userinfo.length > 1">

    <div class="small" v-if="userinfo.length < 5">

      <div class="userinfopicwrapper" :class="{'twoAvatars': userinfo.length === 2, 'threeAvatars' : userinfo.length === 3, 'fourAvatars' : userinfo.length === 4}" >

        <div class="userwrapper" v-for="(user, i) in userinfo">
          <userpic :status="status[user.id]" :userinfo="user"/>
        </div>
      </div>

    </div>


    <div class="swiperWrapper" v-else>
      <div class="swiperWrapperFlex noswipepnt">
        <div class="imageSwiper" v-for="(user, i) in userinfo">
          <userpic :status="status[user.id]" :userinfo="user"/>
        </div>
      </div>
    </div>

  </div>
</template>

<script>

export default {
  props: {
    userinfo: Array,
    slidesPerView : Number,
    status : {
      type : Object,
      default : {}
    }
  },

  data : function(){
    return {}
  }
 
}
</script>
<style lang="sass" scoped>
  .swiperWrapper
    padding-bottom: 0
    display: flex
    overflow-x: scroll
    scrollbar-width: none
    &::-webkit-scrollbar
      width: 0!important
      height: 0!important

  .swiperWrapperFlex
    display: flex
    flex-wrap: nowrap
    height: 100%
    align-items: center
    .imageSwiper
      width: 33px
      min-width: 33px
  .aboutRoomAvatar
    font-size: 0.5em

  .userwrapper
    border-radius: 50%

  .userinfopicwrapper
    padding-bottom: 100%
    position: relative
    background: none
    margin: 0 auto
    border-radius: 50%
    overflow: hidden
    .userwrapper
      width: 50%

  .threeAvatars
    .userwrapper

      &:nth-child(1)
        position: absolute
        left: 50%
        top: 0
        transform: translate(-50%, 6.5%)

      &:nth-child(2)
        position: absolute
        right: 0
        bottom: 0
        transform: translate(0, -6.5%)

      &:nth-child(3)
        position: absolute
        left: 0
        bottom: 0
        transform: translate(0, -6.5%)

  .twoAvatars

    .userwrapper
      &:first-child
        position: absolute
        top: 0
        left: 0
        transform: translate(6.5%, 6.5%)
      &:last-child
        position: absolute
        right: 0
        bottom: 0
        transform: translate(-6.5%, -6.5%)

  .fourAvatars

    .userwrapper

      &:nth-child(1)
        position: absolute
        top: 0
        left: 0

      &:nth-child(2)
        position: absolute
        right: 0
        top: 0

      &:nth-child(3)
        position: absolute
        left: 0
        bottom: 0

      &:nth-child(4)
        position: absolute
        right: 0
        bottom: 0

  .fourMore
    background: none
    margin: 0 auto

  .imageSwiper
    margin: 0 auto

    img
      display: block
      border-radius: 50%
      width: 100%
      height: 100%
      object-fit: cover

  .invited
    opacity: .5

</style>