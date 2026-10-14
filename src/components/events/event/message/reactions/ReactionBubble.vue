<template>
	<div class="reactionBubble" :class="{ active: isOwnReaction }">
		<span class="emoji">{{ emoji }}</span>
		<span class="count" v-if="count > 1">{{ count }}</span>
	</div>
</template>

<script>
export default {
	name: "ReactionBubble",
	props: {
		emoji: {
			type: String,
			required: true
		},
		count: {
			type: Number,
			required: true
		},
		isOwnReaction: {
			type: Boolean,
			default: false
		}
	}
};
</script>

<style scoped lang="sass">
.reactionBubble
	display: inline-flex
	align-items: center
	gap: 3px
	height: 22px
	padding: 0 6px
	border-radius: 11px
	background: rgb(var(--background-main))
	border: 1px solid rgba(var(--neutral-grad-2), 0.5)
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12)
	box-sizing: border-box
	user-select: none
	white-space: nowrap

	&.active
		border-color: rgba(var(--color-bg-ac), 0.8)

	.emoji
		font-size: 13px
		line-height: 1

	.count
		font-size: 11px
		font-weight: 600
		color: rgb(var(--text-color))
		line-height: 1
		opacity: 0.8
</style>
