<template>

	<transition v-if="menu" :name="menu.fromtop ? 'slideDownModal' :'fademodal'">
		<modal  @close="hidePopup" :fromtop="menu.fromtop" :mclass="'small likemenu active' + (menu.fromtop ? ' fromtop' : '')">

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
