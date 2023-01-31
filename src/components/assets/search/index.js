import { mapState } from "vuex";
// TODO IGOR' SEARCH ALL COMPONENTS
export default {
	name: "search",
	props: {
		placeholder: String,
		chat: false,
		minimize: {
			type: Boolean,
			default: null,
		},
	},
	data: function () {
		return {
			loading: false,
			isTyping: false,
			searchTxt: this.matches?.value || "",
			collapsed: this.minimize
		};
	},

	mounted: function () {
		/*Override browser CTRL + F*/
		document.onkeydown = this.search;
	},

	beforeDestroy: function () {
		/*Remove CTRL + F Listener*/
		window.removeEventListener("keypress", () => this.search());
	},

	watch: {
		searchTxt: {
			handler: _.debounce(function () {
				/*Clear previous results*/
				if (typeof this.matches?.clear === "function")
					this.matches?.clear();

				/*Emit search text in root*/
				if (typeof this.matches?.search === "function")
					this.matches?.search(this.searchTxt);

				/*Recalculate matches*/
				this.calcMatches();
				console.log(this.matches)
			}, 500),
		},

		"matches.all": {
			handler: _.debounce(function () {
				this.calcMatches();
			}),
		},
	},
	computed: mapState({
		auth: (state) => state.auth,
		pocketnet: (state) => state.pocketnet,
		minimized: (state) => state.minimized,
		active: function (state) {
			return state.active || !this.minimize;
		},
		matches: (state) => state.matches
	}),

	methods: {
		change: function (event) {
			this.searchTxt = event.target.value;
		},

		search: function (event) {
			if (event.keyCode === 114 || (event.ctrlKey && event.keyCode === 70)) {
				/*Block CTRL + F event*/
				event.preventDefault();
				this.toggle();
			}

			if (event.keyCode === 27) {
				if (this.collapsed !== null && !this.collapsed) {
					/*Clear on Esc*/
					this.collapsed = true;
				} else {
					/*Go back to chats*/
					this.$router.push("chats").catch((e) => {});
				}
				this.clear();
			}
		},

		toggle: function () {
			if (this.minimize !== null) this.collapsed = !this.collapsed;

			if (!this.collapsed && this.$refs.input) this.$refs.input.focus();

			if (this.searchTxt) this.clear();
		},

		clear: function (event) {
			this.searchTxt = "";
			this.matches.setPos(0);

			if (typeof this.matches?.clear === "function") {
				this.matches?.clear();
				this.toggle();
			}
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

		calcMatches: function () {
			/*Recalculate matches counter*/
			if (this.matches.pos > this.matches.all.length - 1) {
				this.matches.setPos(0);
			} else if (this.matches.pos < 0) {
				this.matches.setPos(this.matches.all.length - 1);
			}

			/*Highlight current match*/
			this.matches.all.forEach((match, i) => {
				// match.classList.remove("current");

				if (i === this.matches.pos) {
					// match.classList.add("current");
				}
			});
		},

		prevMatch: function () {
			this.matches.setPos(--this.matches.pos);
			this.calcMatches();
		},

		nextMatch: function () {
			this.matches.setPos(++this.matches.pos);
			this.calcMatches();
		},
	}
};
