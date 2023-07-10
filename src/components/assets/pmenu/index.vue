<template>

	<transition name="fademodal">
		<modal v-if="menu" @close="hidePopup" mclass="small likemenu active">

			<template v-slot:body>
				<listmenuwithupload :items="menu.items" :close="hidePopup">

				</listmenuwithupload>
			</template>

		</modal>
	</transition>


</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
