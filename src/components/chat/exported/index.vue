<template>
	<div id="chatExported">
		<chat :chat="chat"/>
	</div>
</template>

<style scoped lang="sass"></style>

<script>
import { mapState } from "vuex";

import chat from '../index.vue'

export default {
	name: "chatExported",
	
	data : function(){
		return {
			chat : null
		}
	},
	components : {
		chat
	},
	computed: mapState({
		auth: (state) => state.auth,
	}),

	methods: {},
};
</script>