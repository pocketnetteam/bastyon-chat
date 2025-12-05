<template>
	<div
		class="reactionBubble"
		:class="{ active: isOwnReaction, clickable: true }"
		@click="handleClick"
		@mouseenter="showTooltip = true"
		@mouseleave="showTooltip = false"
	>
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
		},
		users: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			showTooltip: false
		};
	},
	computed: {
		userNames() {
			return this.users.map(user => ({
				id: user.id,
				name: user.id.split(":")[0].replace("@", "")
			}));
		}
	},
	methods: {
		handleClick() {
			this.$emit("toggle");
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
	cursor: pointer
	user-select: none
	transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1)
	position: relative
	margin: 3px 4px 3px 0
	min-height: 28px

	&.active
		background: rgba(var(--color-bg-ac), 0.2)
		border-color: rgba(var(--color-bg-ac), 0.5)
		box-shadow: 0 0 0 2px rgba(var(--color-bg-ac), 0.1)

	&.clickable:hover
		transform: translateY(-1px)
		background: rgba(var(--neutral-grad-1), 0.25)
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)

	&.clickable.active:hover
		background: rgba(var(--color-bg-ac), 0.3)
		border-color: rgba(var(--color-bg-ac), 0.6)
		box-shadow: 0 2px 8px rgba(var(--color-bg-ac), 0.15)

	&:active
		transform: scale(0.95)

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

	.tooltip
		position: absolute
		bottom: calc(100% + 8px)
		left: 50%
		transform: translateX(-50%)
		z-index: 1000
		pointer-events: none

		.tooltip-content
			background: rgb(var(--background-main))
			border: 1px solid rgba(var(--neutral-grad-2), 0.4)
			border-radius: 8px
			padding: 8px 12px
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2)
			white-space: nowrap
			max-width: 200px

			.tooltip-user
				font-size: 12px
				color: rgb(var(--text-color))
				padding: 2px 0

@media (max-width: 768px)
	.reactionBubble
		padding: 5px 12px
		min-height: 34px

		.emoji
			font-size: 17px

		.count
			font-size: 13px
</style>
