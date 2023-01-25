<template>
	<div
		id="contact"
		:class="{
			bin: pocketnet,
			bout: !pocketnet,
			minimized,
			fix: pocketnet,
			active,
			isBlocked: blocked,
		}"
	>
		<div class="viewWrapper">
			<div class="uviewwr">
				<userView :userinfo="contact" :blocked="blocked" />
			</div>
		</div>
		<div class="actionsWrapper" v-if="contact.id !== activeuser.id">
			<contactActions :contact="contact" :blocked="blocked" />
		</div>

		<div class="actionsWrapper" v-else>
			<div class="youw">It is you</div>
		</div>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
