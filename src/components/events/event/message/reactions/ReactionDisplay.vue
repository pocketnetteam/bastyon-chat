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
	font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", "Noto Color Emoji Compat", emoji, sans-serif

	.reactionsList
		display: flex
		flex-wrap: nowrap
		align-items: center
		gap: 2px
</style>
