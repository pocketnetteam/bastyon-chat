<template>
	<div
		id="simpleSearch"
		:class="{
			bin: pocketnet,
			bout: !pocketnet,
			minimized,
			fix: pocketnet,
			active,
		}"
	>
		<div class="searchWrapper">
			<div class="iconWrapper" v-if="back && searchTxt" @click="goback">
				<i class="fas fa-chevron-left"></i>
			</div>
			<div class="inputWrapper">
				<input
					ref="input"
					:placeholder="placeholder || this.$i18n.t('caption.search')"
					@keyup="change"
					@input="change"
					:value="searchTxt"
					@focus="focused"
					@blur="blured"
					type="text"
				/>
			</div>

			<div class="iconWrapper" v-if="!searchTxt">
				<i class="fas fa-search"></i>
			</div>

			<div class="iconWrapper" v-if="searchTxt" @click="clear">
				<i class="fas fa-times"></i>
			</div>
		</div>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
