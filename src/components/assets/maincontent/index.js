import { mapState } from "vuex";

export default {
	name: "maincontent",
	
	components: {
		contact: () => import("@/components/contact/index.vue"),
		contacts: () => import("@/components/contacts/list/index.vue"),
		complain: () => import("@/components/complain/index.vue"),
	},
	
	props: {
		rbackexp: Boolean,
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
		iconshow: function () {
			return this.$store.state.icon ? true : false;
		},
		pocketnet: (state) => state.pocketnet,
		minimized: (state) => state.minimized,
		active: (state) => state.active,
		modalShowed: (state) => state.modalShowed,
		hiddenInParent: (state) => state.hiddenInParent,
		mobile: (state) => state.mobile,
		unauthorized: (state) => state.unauthorized,
	}),

	methods: {
		setactive: function () {
			this.$store.commit("active", true);
			this.$store.commit("blockactive", { value: true, item: "main" });
			this.$store.commit("setiteraction", true);
		},
		mouseenter: function () {
			/*this.$store.commit('active', true)
            this.$store.commit('blockactive', {value : true, item : 'main'})*/
		},

		mouseleave: function () {
			if (this.$store.state.autohide) {
				this.$store.commit("active", false);
			}
			this.$store.commit("blockactive", { value: false, item: "main" });
		},

		effect: function (e) {
			/*const x = e.pageX - e.target.offsetLeft
            const y = e.pageY - e.target.offsetTop

            e.target.style.setProperty('--x', `${ x }px`)
            e.target.style.setProperty('--y', `${ y }px`)*/
		},

		closeModal: function () {
			this.$store.commit("setmodal", null);
		},

		scroll: function (v) {
			this.$refs["scrollable"].scrollTop = v || 0;
		}
	},
};
