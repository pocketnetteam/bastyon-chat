<template>
	<div id="settings" :class="{ mobile: !pocketnet }">
		<div class="infoPart">
			<div :class="'inputWrapper ' + value.id" v-for="value in settings">
				<div class="forInput">
					<toggle-button
						@change="(e) => set_settings(value.id, e)"
						:value="get_settings(value.id)"
					/>
				</div>

				<div class="label">
					<label :for="'settings_' + value.id">{{ $t(value.label) }}</label>
				</div>
			</div>
		</div>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
