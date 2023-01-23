import { mapState } from "vuex";

export default {
	name: "settingsTopheader",
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
	}),

	methods: {},
};
