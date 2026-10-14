<template>
	<div class="reactionBubble" :class="{ active: isOwnReaction }">
		<span class="emoji">{{ emoji }}</span>
		<span class="count">{{ count }}</span>
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
	gap: 5px
	padding: 3px 10px
	border-radius: 16px
	background: rgba(var(--neutral-grad-1), 0.15)
	border: 1.5px solid rgba(var(--neutral-grad-2), 0.3)
	user-select: none
	position: relative
	margin: 3px 4px 3px 0
	min-height: 28px

	&.active
		background: rgba(var(--color-bg-ac), 0.2)
		border-color: rgba(var(--color-bg-ac), 0.5)
		box-shadow: 0 0 0 2px rgba(var(--color-bg-ac), 0.1)

	.emoji
		font-size: 15px
		line-height: 1
		display: inline-block

	.count
		font-size: 12px
		font-weight: 600
		color: rgb(var(--text-color))
		line-height: 1
		opacity: 0.9

@media (max-width: 768px)
	.reactionBubble
		padding: 5px 12px
		min-height: 34px

		.emoji
			font-size: 17px

		.count
			font-size: 13px
</style>
