<template>
	<transition v-if="menu" :name="menu.fromtop ? 'slideDownModal' : 'fademodal'">
		<modal
			@close="hidePopup"
			:fromtop="menu.fromtop"
			:mclass="'small likemenu active' + (menu.fromtop ? ' fromtop' : '')"
		>
			<template v-slot:body>
				<!-- Quick reactions row at the top -->
				<div
					v-if="menu.items && menu.items.quickReactions"
					class="quickReactionsRow"
				>
					<span
						v-for="emoji in menu.items.quickReactions"
						:key="emoji"
						class="quickReactionEmoji"
						@click="selectQuickReaction(emoji)"
						>{{ emoji }}</span
					>
				</div>

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
