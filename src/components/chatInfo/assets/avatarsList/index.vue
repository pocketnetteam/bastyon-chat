<template>
	<div class="aboutRoomAvatar" v-if="membersList.length > 1">
		<div class="userspicwrapper twoAvatars" v-if="membersList.length === 2">
			<bgimage
				v-for="user in membersList"
				:key="user.id"
				:src="user.image"
				class="bgImage invited"
				v-if="user.roomStatus === 'invite'"
			/>
			<bgimage
				v-for="user in membersList"
				:key="user.id"
				:src="user.image"
				class="bgImage"
				v-if="user.roomStatus === 'join'"
			/>
		</div>
		<div class="userspicwrapper threeAvatars" v-if="membersList.length === 3">
			<bgimage
				v-for="user in membersList"
				:key="user.id"
				:src="user.image"
				class="bgImage invited"
				v-if="user.roomStatus === 'invite'"
			/>
			<bgimage
				v-for="user in membersList"
				:key="user.id"
				:src="user.image"
				class="bgImage"
				v-if="user.roomStatus === 'join'"
			/>
		</div>
		<div class="userspicwrapper fourAvatars" v-if="membersList.length === 4">
			<bgimage
				v-for="user in membersList"
				:key="user.id"
				:src="user.image"
				class="bgImage invited"
				v-if="user.roomStatus === 'invite'"
			/>
			<bgimage
				v-for="user in membersList"
				:key="user.id"
				:src="user.image"
				class="bgImage"
				v-if="user.roomStatus === 'join'"
			/>
		</div>
		<swiper
			class="swiper"
			:options="swiperOption"
			v-if="membersList.length > 4"
		>
			<swiper-slide v-for="user in membersList" :key="user.id">
				<div class="imageSwiper" v-if="user.roomStatus === 'join'">
					<img :src="user.image" alt="" />
				</div>
				<div class="imageSwiper invited" v-if="user.roomStatus === 'invite'">
					<img :src="user.image" alt="" />
				</div>
			</swiper-slide>
			<div class="swiper-pagination" slot="pagination"></div>
		</swiper>
	</div>
</template>
<script>
import { Swiper, SwiperSlide } from "vue-awesome-swiper";

export default {
	props: {
		membersList: Array,
	},
	data: function () {
		return {
			swiperOption: {
				watchSlidesProgress: true,
				watchSlidesVisibility: true,
				slidesPerView: 5,
				direction: "horizontal",
				pagination: {
					el: ".swiper-pagination",
					clickable: true,
				},
			},
		};
	},
	components: {
		Swiper,
		SwiperSlide,
	},
};
</script>
<style lang="sass" scoped>
.aboutRoomAvatar
  padding-top: 2 * $r
.bgImage
  border-radius: 50%
.threeAvatars
  position: relative
  background: none
  width: 80px
  height: 80px
  margin: 0 auto

  .bgImage
    width: 40px
    height: 40px

    &:nth-child(1)
      position: absolute
      left: 50%
      top: 0
      transform: translate(-50%, 0)

    &:nth-child(2)
      position: absolute
      right: -3px
      bottom: 0
      transform: translate(0, 0)

    &:nth-child(3)
      position: absolute
      left: -3px
      bottom: 0

.twoAvatars
  background: none
  position: relative
  margin: 0 auto
  width: 80px
  height: 80px

  .bgImage
    width: 40px
    height: 40px
    display: flex

    &:first-child
      position: absolute
      top: 0
      left: 0

    &:last-child
      position: absolute
      right: 0
      bottom: 0

.fourAvatars
  background: none
  position: relative
  margin: 0 auto
  width: 80px
  height: 80px

  .bgImage
    width: 40px
    height: 40px

    &:nth-child(1)
      position: absolute
      top: -3px
      left: -3px
      transform: translate(0, 0)

    &:nth-child(2)
      position: absolute
      right: -3px
      top: -3px
      transform: translate(0, 0)

    &:nth-child(3)
      position: absolute
      left: -3px
      bottom: -3px

    &:nth-child(4)
      position: absolute
      right: -3px
      bottom: -3px

.fourMore
  background: none
  margin: 0 auto
  width: 80px
  height: 80px

.bgImageMore
  width: 40px
  height: 40px

.imageSwiper
  width: 50px
  height: 50px
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
