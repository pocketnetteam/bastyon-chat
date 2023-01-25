<template>
	<div id="matrixlink">
		<div v-if="idtype">
			<publicroom v-if="idtype.type == 'publicroom'" :id="idtype.id" />

			<div class="contactWrapper" v-if="idtype.type == 'connect'">
				<router-link :to="'contact?id=' + idtype.href">
					<contactid :id="idtype.id" />
				</router-link>
			</div>
		</div>
	</div>
</template>

<style scoped lang="sass">

/deep/
    .actionsWrapper
        display: none
</style>

<script>
import { mapState } from "vuex";
import publicroom from "@/components/chat/publicroom/index.vue";
import contactid from "@/components/contact/indexid.vue";
import f from "@/application/functions";

export default {
	name: "matrixlink",
	props: {
		url: String,
	},
	components: {
		publicroom,
		contactid,
	},

	computed: mapState({
		auth: (state) => state.auth,

		idtype: function () {
			if (!this.url) return;

			var u = new URL(this.url);

			var _searchParams = u.search.replace("?", "").split("&");
			var sp = {};

			_.each(_searchParams, function (s) {
				var ss = s.split("=");

				sp[ss[0]] = ss[1];
			});

			if (sp.publicroom) {
				return {
					type: "publicroom",
					id: sp.publicroom,
				};
			}

			if (sp.connect) {
				return {
					type: "connect",
					id: sp.connect,
					href: f.hexEncode(sp.connect),
				};
			}
		},
	}),

	methods: {},
};
</script>
