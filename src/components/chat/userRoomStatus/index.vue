<template>
	<div class="roomStatusView">
		<div class="statusViewIcon">
			<i class="fas fa-ban"></i>
		</div>
		<div class="text">
			{{ text }}
		</div>
		<button class="button small black rounded" @click="leaveRoom()" v-if="!streamMode">
			Delete room
		</button>
	</div>
</template>
<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
