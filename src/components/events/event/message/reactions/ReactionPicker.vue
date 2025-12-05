<template>
	<div class="reactionPicker">
		<transition name="slideUp">
			<div
				class="quickReactions"
				v-if="!showFullPicker"
				v-click-outside="handleClickOutside"
			>
				<div
					v-for="emoji in quickEmojis"
					:key="emoji"
					class="quickEmoji"
					@click="selectEmoji(emoji)"
				>
					{{ emoji }}
				</div>
				<div class="moreButton" @click="showFullPicker = true">
					<i class="fas fa-ellipsis-h"></i>
				</div>
			</div>
		</transition>

		<modal v-if="showFullPicker" @close="closeFullPicker">
			<div class="fullPickerWrapper">
				<div class="pickerHeader">
					<span>{{ $t("caption.reactions") || "Reactions" }}</span>
					<i class="fas fa-times closeIcon" @click="closeFullPicker"></i>
				</div>
				<picker
					v-if="emojiIndex"
					:data="emojiIndex"
					@select="handleEmojiSelect"
					:exclude="exclude"
					:showPreview="false"
					:showSearch="true"
					:native="true"
				/>
			</div>
		</modal>
	</div>
</template>

<script>
import { Picker, EmojiIndex } from "emoji-mart-vue-fast";
import modal from "@/components/assets/modal/index.vue";

export default {
	name: "ReactionPicker",
	components: {
		Picker,
		modal
	},
	directives: {
		clickOutside: {
			bind(el, binding, vnode) {
				el.clickOutsideEvent = function (event) {
					if (!(el === event.target || el.contains(event.target))) {
						vnode.context[binding.expression](event);
					}
				};
				document.body.addEventListener("click", el.clickOutsideEvent, true);
			},
			unbind(el) {
				document.body.removeEventListener("click", el.clickOutsideEvent, true);
			}
		}
	},
	data() {
		return {
			showFullPicker: false,
			quickEmojis: ["👍", "❤️", "😂", "😮", "😢", "😡", "🔥"],
			exclude: ["flags"],
			emojiIndex: null
		};
	},
	mounted() {
		// Load emoji data
		if (!window.emojiIndex) {
			var emojidata = require("emoji-mart-vue-fast/data/all.json");
			window.emojiIndex = new EmojiIndex(emojidata);
		}
		this.emojiIndex = window.emojiIndex;
	},
	methods: {
		selectEmoji(emoji) {
			this.$emit("select", emoji);
		},
		handleEmojiSelect(emoji) {
			this.$emit("select", emoji.native);
		},
		closeFullPicker() {
			this.showFullPicker = false;
			this.$emit("close");
		},
		handleClickOutside() {
			this.$emit("close");
		}
	}
};
</script>

<style scoped lang="sass">
.reactionPicker
	position: relative

	.quickReactions
		display: flex
		align-items: center
		gap: 6px
		padding: 10px 12px
		background: rgb(var(--background-main))
		border: 1px solid rgba(var(--neutral-grad-2), 0.4)
		border-radius: 16px
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15)
		position: absolute
		bottom: 100%
		left: 0
		margin-bottom: 8px
		z-index: 1000

		.quickEmoji
			font-size: 26px
			cursor: pointer
			padding: 6px
			border-radius: 12px
			transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1)
			user-select: none
			display: flex
			align-items: center
			justify-content: center
			min-width: 38px
			min-height: 38px

			&:hover
				transform: scale(1.15)
				background: rgba(var(--neutral-grad-1), 0.2)

			&:active
				transform: scale(1.05)

		.moreButton
			display: flex
			align-items: center
			justify-content: center
			min-width: 38px
			min-height: 38px
			border-radius: 12px
			background: rgba(var(--neutral-grad-1), 0.2)
			border: 1px solid rgba(var(--neutral-grad-2), 0.3)
			cursor: pointer
			transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1)

			i
				font-size: 12px
				color: rgb(var(--text-color))
				opacity: 0.7

			&:hover
				transform: scale(1.05)
				background: rgba(var(--neutral-grad-1), 0.3)

				i
					opacity: 1

			&:active
				transform: scale(0.95)

	.fullPickerWrapper
		background: rgb(var(--background-main))
		border-radius: 16px
		overflow: hidden
		max-width: 400px
		max-height: 500px
		display: flex
		flex-direction: column

		.pickerHeader
			display: flex
			align-items: center
			justify-content: space-between
			padding: 16px
			border-bottom: 1px solid rgba(var(--neutral-grad-2), 0.4)

			span
				font-size: 16px
				font-weight: 600
				color: rgb(var(--text-color))

			.closeIcon
				cursor: pointer
				font-size: 18px
				color: rgb(var(--text-color))
				padding: 4px
				transition: all 0.2s ease

				&:hover
					transform: scale(1.1)
					color: rgb(var(--color-bg-ac))

// SlideUp transition
.slideUp-enter-active, .slideUp-leave-active
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)

.slideUp-enter, .slideUp-leave-to
	opacity: 0
	transform: translateY(10px)

// Mobile adjustments
@media (max-width: 768px)
	.reactionPicker
		.quickReactions
			gap: 6px
			padding: 10px

			.quickEmoji
				font-size: 28px
				padding: 10px

			.moreButton
				width: 44px
				height: 44px

		.fullPickerWrapper
			max-width: 90vw
			max-height: 60vh
</style>
