<template>
	<div
		class="userspic"
		:class="{ oneuser: users && users.length === 1 }"
	>
		<userpic
			v-if="users && users.length === 0"
			:userinfo="single"
			:status="single.status"
		/>
		<userpic
			:status="status[users[0].id]"
			:userinfo="users[0]"
			:unseen="unseen"
			v-if="users && users.length === 1"
		/>

		<many
			:slidesPerView="slidesPerView"
			:status="status"
			:userinfo="users"
			:unseen="unseen"
			v-if="users && users.length > 1"
		/>

		<div class="unseenupic" v-if="users && unseen">
			{{ unseen > 99 ? "99" : unseen }}
		</div>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass">
.userspicwrapper
  width: 44px
  height: 44px
  border-radius: 50%
  background: srgb(--background-main)
  line-height: 44px
  text-align: center
  font-size: 0.8em
  color: srgb(--color-bg-ac-2)
  position: relative

  /deep/ .bgimage
    border-radius: 50%

.swiperWrapperFlex
  margin: 0 auto

.icon
  position: absolute
  right: 70%
  top: 70%
  font-size: 1em
  width: 20px
  height: 20px
  line-height: 20px
  background: transparent
  border-radius: 20px
  color: srgb(--color-txt-gray)
  opacity: 0.8
  z-index: 3

  &.active
    color: srgb(--color-txt-ac)



.userspic
  position: relative

.iconPreview
  width: 44px
  height: 44px
  border-radius: 50%
</style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
