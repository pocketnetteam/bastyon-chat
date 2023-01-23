import { mapState } from "vuex";

export default {
	name: "contactTopheader",
	props: {
		contact: Object,
	},

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
