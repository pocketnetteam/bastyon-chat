import { mapState } from "vuex";
// TODO IGOR' SEARCH ALL COMPONENTS
export default {
	name: "search",
	props: {
		placeholder: String,
		minimize: {
			type: Boolean,
			default: false,
		},
	},

	data: function () {
		return {
			loading: false,
			isTyping: false,
			searchTxt: "",
		};
	},

	created: () => {},

	watch: {
		searchTxt: {
			handler: _.debounce(function () {
				var text = this.searchTxt.toLowerCase();
				this.$emit("search", text);
			}, 500),
		},
	},
	computed: mapState({
		auth: (state) => state.auth,
		pocketnet: (state) => state.pocketnet,
		minimized: (state) => state.minimized,
		active: function (state) {
			return state.active || !this.minimize;
		},
	}),

	methods: {
		change: function (event) {
			this.searchTxt = event.target.value;
		},

		clear: function (event) {
			this.searchTxt = "";
		},

		clickicon: function () {
			this.$refs["input"].focus();
		},

		blured: function () {
			this.$store.commit("blockactive", { value: false, item: "input" });
		},

		focused: function () {
			this.$store.commit("blockactive", { value: true, item: "input" });
		},
	},
};
