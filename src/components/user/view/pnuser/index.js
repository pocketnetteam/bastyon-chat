import { mapState } from "vuex";

export default {
	name: "userViewPnuser",
	props: {
		userinfo: Object,
		blocked: false,
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
		activeuser: function () {
			return this.core.user.userinfo;
		},

		href: function () {
			var domain = window.pocketnetdomain || "pocketnet.app";

			return "https://" + domain + "/" + this.userinfo.source.name;
		},
	}),

	methods: {
		gotopocketnetprofile: function () {
			if (this.core.backtoapp) this.core.backtoapp(this.href);
			else window.open(this.href, "_blank");

			this.$emit("close");
		},
	},
};
