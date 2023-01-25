<template>
	<span>
		<clip-loader
			:size="'25px'"
			:color="'#0035a8'"
			:loading="true"
			class="clipLoader"
		/>
		<p>{{ preview.name }}</p>
		<p>{{ preview.size }}</p>
	</span>
</template>
<script>
import clipLoader from "vue-spinner/src/ClipLoader.vue";

export default {
	props: {
		preview: Object,
	},
	components: {
		clipLoader,
	},
};
</script>
