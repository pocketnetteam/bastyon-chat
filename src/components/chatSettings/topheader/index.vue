<template>
	<div id="chatTopheader">
		<topheader>
			<template v-slot:left>
				<backButton action="back" />
			</template>

			<template v-slot:info>
				<span>{{ $t("caption.settings") }}</span>
			</template>

			<template v-slot:right> </template>
		</topheader>
	</div>
</template>
<script>
export default {
	methods: {},
};
</script>
