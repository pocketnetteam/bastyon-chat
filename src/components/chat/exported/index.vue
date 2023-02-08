<template>
	<div id="chatExported" :class="style || ''">
		<chat :chat="chat" :style="style"/>
	</div>
</template>

<style scoped lang="sass">
.stream /deep/
</style>


<script>
import { mapState } from "vuex";

import chat from '../index.vue'

export default {
	name: "chatExported",

	data : function(){
		return {
			chat : null,
			style : null
		}
	},
	components : {
		chat
	},
	provide() {
		return {
			streamMode: this.streamMode
		}
	},
	computed: mapState({
		auth: (state) => state.auth,
		streamMode: function () {
			return this.style === 'stream';
		}
	}),

	methods: {},
};
</script>
