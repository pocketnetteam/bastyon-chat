<template>
	<div class="wrapper table">
		<div class="filecontent">
			<div class="name">
				<span>{{ file.name }}</span>
			</div>

			<div class="size">
				<span>{{ humanReadableSize(file.size) }}</span>
			</div>

			<!--<div class="download" v-if="!encryptedData">
				<a
					:href="file.url"
					:download="download"
					target="_external"
					class="fileMessage"
				>
					<button class="button small rounded">
						<span v-if="!downloaded">{{ $t("button.download") }}</span>
						<span v-else>{{ $t("button.downloaded") }}</span>
					</button>
				</a>
			</div>-->

			<div class="download" >
				<button class="button small rounded" @click="download">
					<span v-if="!downloaded">{{ $t("button.download") }}</span>
					<span v-else>{{ $t("button.downloaded") }}</span>
				</button>
			</div>
			<template v-if="canDownload">
				<div class="download" v-if="!encryptedData">
					<a
						:href="file.url"
						:download="download"
						target="_external"
						class="fileMessage"
					>
						<button class="button small rounded">
							<span v-if="!downloaded">{{ $t("button.download") }}</span>
							<span v-else>{{ $t("button.downloaded") }}</span>
						</button>
					</a>
				</div>
				<div class="download" v-else>
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
			default: true,
		},
		encryptedData: Boolean,
		downloaded: Boolean,
	},
	computed: {
		getExtension: function (file) {
			var name = file.name.split(".");
			var ext = name[name.length - 1].toLowerCase();

			return ext;
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
			color : srgb(--color-txt-ac)

		button.button
			padding : 0.5 * $r
			margin-top : $r

			&.downloaded
				background: srgb(--color-good)
				border-color : srgb(--color-good)
				color : srgb(--text-on-bg-ac-color)
</style>
