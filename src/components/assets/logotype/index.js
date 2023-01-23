import { mapState } from "vuex";

var bwl = {
	black: "black",
	white: "white",
	classic: "white",
};

export default {
	name: "wai-logotype",
	props: {},

	data: function () {
		return {
			loading: false,
		};
	},

	created: () => {},

	watch: {
		//$route: 'getdata'
	},

	computed: mapState({
		auth: (state) => state.auth,

		themeL: function (state) {
			return bwl[state.theme] || "white";
		},
	}),

	methods: {},
};
