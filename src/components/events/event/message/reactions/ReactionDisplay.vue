<template>
	<div class="reactionDisplay" v-if="reactions.length || showAddButton">
		<div class="reactionsList">
			<ReactionBubble
				v-for="reaction in reactions"
				:key="reaction.emoji"
				:emoji="reaction.emoji"
				:count="reaction.count"
				:is-own-reaction="!!reaction.myReaction"
				:users="reaction.users"
				@toggle="toggleReaction(reaction)"
			/>

			<div
				class="addReactionButton"
				:class="{ active: showPicker }"
				@click="togglePicker"
				v-if="showAddButton"
			>
				<i :class="showPicker ? 'fas fa-times' : 'fas fa-plus'"></i>
			</div>
		</div>

		<ReactionPicker
			v-if="showPicker"
			@select="handleEmojiSelect"
			@close="closePicker"
		/>
	</div>
</template>

<script>
import ReactionBubble from "./ReactionBubble.vue";
import ReactionPicker from "./ReactionPicker.vue";

export default {
	name: "ReactionDisplay",
	components: {
		ReactionBubble,
		ReactionPicker
	},
	props: {
		event: {
			type: Object,
			required: true
		},
		chat: {
			type: Object,
			required: true
		},
		reactions: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			showPicker: false
		};
	},
	computed: {
		showAddButton() {
			return !!window.emojiIndex;
		}
	},
	methods: {
		toggleReaction(reaction) {
			if (reaction.myReaction) {
				this.$emit("remove-reaction", reaction.myReaction);
			} else {
				this.$emit("add-reaction", reaction.emoji);
			}
		},
		togglePicker() {
			this.showPicker = !this.showPicker;
		},
		closePicker() {
			this.showPicker = false;
		},
		handleEmojiSelect(emoji) {
			this.$emit("add-reaction", emoji);
			this.closePicker();
		}
	}
};
</script>

<style scoped lang="sass">
.reactionDisplay
	display: flex
	flex-direction: column
	margin-top: 6px
	margin-bottom: 4px
	position: relative

	.reactionsList
		display: flex
		flex-wrap: wrap
		align-items: center
		gap: 0

	.addReactionButton
		display: inline-flex
		align-items: center
		justify-content: center
		min-width: 28px
		height: 28px
		padding: 0 8px
		border-radius: 16px
		background: rgba(var(--neutral-grad-1), 0.15)
		border: 1.5px solid rgba(var(--neutral-grad-2), 0.3)
		cursor: pointer
		transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1)
		margin: 3px 4px 3px 0

		i
			font-size: 11px
			color: rgb(var(--text-color))
			opacity: 0.7

		&:hover
			transform: translateY(-1px)
			background: rgba(var(--neutral-grad-1), 0.25)
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)

			i
				opacity: 1

		&:active
			transform: scale(0.95)

		&.active
			background: rgba(var(--color-bg-ac), 0.2)
			border-color: rgba(var(--color-bg-ac), 0.5)

			i
				opacity: 1

@media (max-width: 768px)
	.reactionDisplay
		.addReactionButton
			min-width: 34px
			height: 34px
			padding: 0 10px

			i
				font-size: 12px
</style>
