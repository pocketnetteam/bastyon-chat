<template>
	<div style="position: relative" class="typingBlock">
		<div class="typingBlockWrapper">
			<div>
				<span>{{ $t("caption.typing") }}</span>
			</div>
			<div>
				<PulseLoader :color="color" :size="size" :loading="true" />
			</div>
		</div>
	</div>
</template>
<script>
import PulseLoader from "vue-spinner/src/PulseLoader.vue";

export default {
	name: "typing",

	props: {},
	components: {
		PulseLoader,
	},
	data: () => {
		return {
			color: "#868686",
			size: "2px",
			loading: true,
		};
	},
	methods: {},
	computed: {},
};
</script>
<style lang="sass">

.typingBlock
  position: relative

  .typingBlockWrapper
    position: absolute
    left: 50%
    transform: translateX(-50%)
    top: -5px
    display: flex
    align-items: center

    >div
      padding : 0 $r

    span
      font-size: 0.7em
      color : srgb(--neutral-grad-3)
      opacity: 0.8
</style>
