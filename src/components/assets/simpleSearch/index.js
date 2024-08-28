import { mapState } from "vuex";

export default {
	name: "search",
	props: {
		placeholder: String,
		minimize: {
			type: Boolean,
			default: false,
		},
		loading: Boolean,
		activity: String,
		value: String,
		controlKeys: Boolean,
	},

	data: function () {
		return {
			isTyping: false,
			searchTxt: this.value || "",
		};
	},

	watch: {
		searchTxt: {
			handler: _.debounce(function () {
				var text = this.searchTxt;
				if (text !== this.value) {
					this.$emit("input", text);
					this.$emit("search", text);
				}
			}, 500),
		},

		value: {
			immediate: true,
			handler: function (value) {
				if (value !== this.searchTxt) {
					this.searchTxt = value;
				}
			},
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

		clear: function () {
			this.searchTxt = "";
			this.$emit("input", "");
		},

		clickicon: function () {
			if (this.$refs["input"]) {
				this.$refs["input"].focus();
			}
		},

		focus: function () {
			if (this.$refs["input"]) {
				this.$refs["input"].focus();
			}
		},

		keydown(event) {
			let e = false;

			if (this.controlKeys) {
				if (event.keyCode === 40 || event.keyCode === 38) {
					this.$emit("controlKey", event.keyCode === 40 ? "down" : "up");
					e = true;
				}

				if (event.keyCode === 39 || event.keyCode === 13) {
					this.$emit("controlKey", "enter");
					e = true;
				}
			}

			if (e) {
				event.preventDefault();
				return false;
			}
		},

		paste: function (evt) {
			this.$emit("paste", evt);
		},

		blured: function () {
			this.$store.commit("blockactive", { value: false, item: "input" });
		},

		focused: function () {
			this.$store.commit("blockactive", { value: true, item: "input" });
		},
	},
};
