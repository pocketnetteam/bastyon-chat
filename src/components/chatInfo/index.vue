<template>
	<div id="chatInfo" class="maskedtop" :class="{ minimized, active }">
		<info :chat="chat" @addMember="addMember"/>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
