<template>
	<div id="ChatPrompt" class="wrapper">
		<div class="chat-prompt-message">
			{{ currentMessage }}
		</div>
	</div>
</template>

<style lang="sass" scoped>
.wrapper
  display: flex
  align-items: center
  justify-content: center
  background-color: srgb(--neutral-grad-0)
  height: 100%
  @media(max-width: $break_md)
    display: none !important
  .chat-prompt-message
    border-radius: 9999px
    font-size: 0.75em
    padding: 0.5em
    color: srgb(--color-txt-gray)
    background-color: srgba(--color-bg-ac-bright, 0.5)
</style>

<script>
import { mapState } from "vuex";

export default {
	data: function () {
		return {  };
	},
	computed: {
		currentMessage() {
			// Check states in order of priority
			if (this.share) return "Select a chat to share";

			return "Select a chat to start the communication"; // Default message;
		},
		...mapState(["share"]),
	},
};
</script>
