<template>
	<div class="reactionDisplay" :class="{ my: my }" v-if="reactions.length">
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
		</div>
	</div>
</template>

<script>
import ReactionBubble from "./ReactionBubble.vue";

export default {
	name: "ReactionDisplay",
	components: {
		ReactionBubble
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
		},
		showAddButton: {
			type: Boolean,
			default: false
		},
		my: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		toggleReaction(reaction) {
			if (reaction.myReaction) {
				this.$emit("remove-reaction", reaction.myReaction);
			} else {
				this.$emit("add-reaction", reaction.emoji);
			}
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
	font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", "Noto Color Emoji Compat", emoji, sans-serif

	.reactionsList
		display: flex
		flex-wrap: wrap
		align-items: center
		gap: 0

	&.my
		.reactionsList
			justify-content: flex-end
</style>
