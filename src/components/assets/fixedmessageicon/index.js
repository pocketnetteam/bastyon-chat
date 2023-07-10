import { mapState } from "vuex";
export default {
	name: "fixedmessageicon",
	props: {},

	components: {
		sweetalert : () => import("@/editedplugins/vue-sweetalert-icons/src/components/icon.vue") ,
	},

	data: function () {
		return {
			loading: false,
		};
	},

	created: () => {},

	watch: {
		icon: {
			immediate: true,
			handler() {
				this.init();
			},
		},
	},

	computed: mapState({
		auth: (state) => state.auth,
		icon: function () {
			return this.$store.state.icon ? this.$store.state.icon.icon : null;
		},

		message: function () {
			return this.$store.state.icon ? this.$store.state.icon.message : null;
		},

		pocketnet: (state) => state.pocketnet,
		minimized: (state) => state.minimized,
		active: (state) => state.active,
	}),

	methods: {
		init: function () {
			var t = this;

			const timeout = this.$store.state.icon?.timeout;

			if (this.$store.state.icon.manual) return;

			setTimeout(function () {
				t.$store.commit("icon", null);
			}, timeout || 2000);
		},
	},
};
