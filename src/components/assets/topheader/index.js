import { mapState } from "vuex";

export default {
	name: "topheader",
	props: {
		classstyle : ""
	},
	data: function () {
		return {
			loading: false,
		};
	},

	created: function () {},

	watch: {
		//$route: 'getdata'
	},

	computed: mapState({
		auth: (state) => state.auth,
		pocketnet: (state) => state.pocketnet,
		minimized: (state) => state.minimized,
		active: (state) => state.active,
	}),

	methods: {
		mouseenter: function () {
			this.$store.commit("active", true);
			this.$store.commit("blockactive", { value: true, item: "header" });
		},

		mouseleave: function () {
			if (this.$store.state.autohide) this.$store.commit("active", false);

			this.$store.commit("blockactive", { value: false, item: "header" });
		},
	},
};
