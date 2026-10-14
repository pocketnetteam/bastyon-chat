<template>
	<div class="reactionDisplay" :class="{ my: my }" v-if="reactions.length">
		<div class="reactionsList">
			<ReactionBubble
				v-for="reaction in reactions"
				:key="reaction.emoji"
				:emoji="reaction.emoji"
				:count="reaction.count"
				:is-own-reaction="!!reaction.myReaction"
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
		reactions: {
			type: Array,
			default: () => []
		},
		my: {
			type: Boolean,
			default: false
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
