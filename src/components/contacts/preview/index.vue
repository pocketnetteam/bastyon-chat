<template>
	<div class="contacts-preview minimized active">
		<div class="work">
			<div class="previewWrapper" :style="isUser">
				<div class="iconWrapper">
					<userpic :userinfo="contact" :mode="'Contacts'" />
				</div>
				<div class="infoWrapper">
					<div class="summaryLine">
						<div class="caption">
							<span>{{ contact.name }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
