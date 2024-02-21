<template>
	<div class="main-wrapper" :class="{ minimized, active }">
		<vue-page-transition name="fade-in-right">
			<!--
				TODO
			<KeepAlive :max="3" v-if="mobile">
				<router-view></router-view>
			</KeepAlive>

			<router-view v-else></router-view>-->

			<router-view></router-view>
		</vue-page-transition>

		<FooterChat v-if="showFooter" />

		<gallery
			v-if="gallery"
			:images="gallery.images"
			:index="gallery.index"
			@close="closeGallery"
		/>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
