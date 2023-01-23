import { mapState } from "vuex";

export default {
	name: "msgActions",
	props: {
		position: String,
	},

	data: function () {
		return {
			loading: false,
			actionMessage: false,
		};
	},

	computed: mapState({
		auth: (state) => state.auth,
	}),

	methods: {},
};
