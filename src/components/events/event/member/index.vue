<template>
	<div class="eventMember">
		<div
			class="iconWrapper"
			v-if="!preview"
			@click="core.mtrx.opencontact(userinfo)"
		>
			<userpic :userinfo="userinfo" />
		</div>
		<div class="labelwrapper">
			<span class="label"
				><b>{{ userinfo?.name || "Somebody" }}:</b> {{ keyword }}</span
			>
		</div>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
