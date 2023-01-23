<template>
	<div id="chatsTopheader">
		<topheader>
			<template v-slot:left>
				<backButton action="back" />
			</template>

			<template v-slot:info>
				<span>{{ contact.name }}</span>
			</template>
			<template v-slot:right>
				<!--<div class="iconbutton"><i class="far fa-comment-alt"></i></div>-->
			</template>
		</topheader>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
