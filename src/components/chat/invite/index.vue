<template>
	<div id="chatinvite" :class="{ minimized, active }">
		<div class="selectedtype">
			<div class="completewrapper">
				<button
					@click="complete()"
					class="button small rounded"
					:class="{ orange: cancomplete, gray: !cancomplete }"
				>
					{{ $t("caption.invite") }} 
				</button>
			</div>
		</div>

		<div class="creationbody">
			<div class="contactswrapper">
				<contacts :mode="'Selectmany'" @selectedUsers="selectedUsers" />
			</div>
		</div>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
