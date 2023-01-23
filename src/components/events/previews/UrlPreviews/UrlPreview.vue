<template>
	<div>
		<div
			v-if="url_object.is_pocketnet"
			class="pocketnet_iframe"
			ref="iframe"
		></div>
		<metaPreviewUrl v-else :url_object="url_object" />
	</div>
</template>

<script>
import metaPreviewUrl from "./metaUrlPreview/index.vue";
import PNUrlPreview from "./PNUrlPreview/PNUrlPreview.vue";
import Widgets from "@/application/utils/widgets.js";

export default {
	name: "UrlPreview",

	components: {
		metaPreviewUrl,
		PNUrlPreview,
	},

	props: {
		url_object: Object,
	},

	data() {
		return {
			iframe: "",
		};
	},

	mounted() {
		let widget = new Widgets();

		setTimeout(() => {
			widget.makefromurl(this.$refs.iframe, this.$props.url_object.url);
		});
	},
};
</script>

<style lang="sass" scoped></style>
