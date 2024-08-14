<template>
	<div class="embedded-message">
		<div class="left-icon">
			<i class="fas fa-share-alt"></i>
		</div>
		<div class="message-wrapper">
			<div class="message-title text-ellipsis">
				{{ messageTittle }}
			</div>
			<div class="text-message-wrapper text-ellipsis" v-if="messageText">
				{{ messageText }}
			</div>
		</div>
		<button class="embedded-cancel" @click="onCancelShare">
			<i class="fas fa-times"></i>
		</button>
	</div>
</template>

<script>
export default {
	emits: ["embedded-cancel"],
	props: {
		messageTittle: {
			type: String,
			default: "",
		},
		messageText: {
			type: String,
			default: "",
		},
	},
	methods: {
		onCancelShare() {
			this.$emit("embedded-cancel");
		},
	},
};
</script>

<style lang="sass" scoped>
$borderRadius: 30px
$sizeLeftIcon: 35px

.embedded-message
	font-size: 0.8em
	padding: 0 2 * $r
	padding-top: 4px
	display: flex
	align-items: center
	border-top-right-radius: $borderRadius
	border-top-left-radius: $borderRadius
	background: rgb(var(--background-main))
	

	.left-icon
		display: flex
		justify-content: center
		align-items: center
		height: $sizeLeftIcon
		width: $sizeLeftIcon
		min-width: $sizeLeftIcon
		border-radius: 0.5 * $sizeLeftIcon
		background: srgb(--color-bg-ac-bright)
		color : srgb(--text-on-bg-shadow-color)

		i
			font-size: 0.8em

	.message-wrapper
		.message-title
			color: srgb(--color-bg-ac-bright)
		min-width: 0
		padding: 3px 3px 3px 6px
		width: 100%

	.embedded-cancel
		cursor: pointer
		display: flex
		align-content: center
		justify-content: center
		color: srgb(--color-bg-ac-bright)

		i
			font-size: 1.2em
			color : srgb(--color-bad)
</style>
