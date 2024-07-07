<template>
	<div id="SelectChatPrompt" class="wrapper">
		<div class="chat-prompt">Select a chat to start the communication</div>
	</div>
</template>

<style lang="sass">
.wrapper
  display: flex
  align-items: center
  justify-content: center
  background-color: srgb(--neutral-grad-0)
  height: 100%
  @media(max-width: $break_md)
    display: none !important
  .chat-prompt
    border-radius: 9999px
    font-size: 0.75em
    padding: 0.5em
    color: srgb(--color-txt-gray)
    background-color: srgba(--color-bg-ac-bright, 0.5)
</style>
