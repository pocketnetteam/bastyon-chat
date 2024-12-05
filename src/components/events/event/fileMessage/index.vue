<template>
	<div class="wrapper table">
		<div class="filecontent">
			<div class="name">
				<span>{{ file.name }}</span>
			</div>

			<div class="size">
				<span>{{ humanReadableSize(file.size) }}</span>
			</div>

			<div v-if="errorMessage" class="error">
				<span v-if="isErrorShort">{{ errorMessage }}</span>
				<span v-else>{{ $t("error_generic") }}</span>
			</div>
			<template v-else-if="canDownload">
				<div class="download">
					<button class="button small rounded" @click="download">
						<span v-if="!downloaded">{{ $t("button.download") }}</span>
						<span v-else>{{ $t("button.downloaded") }}</span>
					</button>
				</div>
			</template>
		</div>

		<div class="icon">
			<a
				:href="file.url"
				:download="download"
				target="_external"
				class="fileMessage"
			>
				<i class="fas fa-file-download"></i>
			</a>
		</div>
	</div>
</template>

<script>
import f from "@/application/functions";

export default {
	props: {
		preview: Object,
		file: Object,
		canDownload: {
			type: Boolean,
			default: true
		},
		errorMessage: String,
		encryptedData: Boolean,
		downloaded: Boolean
	},
	computed: {
		isErrorShort() {
			return this.errorMessage.length <= 35;
		},
	},
	methods: {
		humanReadableSize(data) {
			return f.formatBytes(data);
		},

		download() {
			this.$emit("download");
		},
	},
};
</script>
<style scoped lang="sass">
.wrapper

	>div
		padding: $r
		vertical-align: middle

	.icon
		width: 60px
		text-align: center
		background: srgb(--neutral-grad-0)

		i
			font-size: 1.2em
			opacity: 0.8

	.filecontent
		span
			font-size: 0.8em

		div
			max-width: 80%
			text-overflow: ellipsis
			overflow: hidden
			white-space: nowrap

		.size
			color: srgb(--color-txt-ac)

		button.button
			padding: 0.5 * $r
			margin-top: $r

			&.downloaded
				background: srgb(--color-good)
				border-color: srgb(--color-good)
				color: srgb(--text-on-bg-ac-color)


.error
	color: rgb(var(--color-bad))
</style>
