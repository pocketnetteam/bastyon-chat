import { mapState } from "vuex";

export default {
	name: "modals",
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
		modals: (state) => state.modals,
	}),

	methods: {
		close: function (id, cl) {
			this.$store.commit("CLOSE_MODAL", id);

			if (cl) cl();
		},
		scroll: function (v) {},
	},
};
