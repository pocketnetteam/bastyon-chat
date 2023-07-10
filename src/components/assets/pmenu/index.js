import simpleMenu from "@/components/assets/simpleMenu/simpleMenu.vue";
import { mapState } from "vuex";
export default {
	name: "pmenu",
	
	components: {
		simpleMenu,
	},
	
	inject: ["menuState"],

	data: function () {
		return {
			last: null,
		};
	},

	computed: {
		...mapState({
			pocketnet: (state) => state.pocketnet,
			minimized: (state) => state.minimized,
			mobile: (state) => state.mobile,
			active: (state) => state.active,
			hiddenInParent: (state) => state.hiddenInParent
		}),
		
		menu() {
			return this.menuState.get();
		}
	},

	methods: {
		menuItemClick(item) {
			if (this.menu) {
				this.last = this.menu;

				this.menu.handler(item, this.menu.item, {
					hidePopup: this.hidePopup,
					showPopup: this.showPopup,
				});

				// this.$emit('itemClicked', item, this.menu.item, );
			}
		},

		showPopup: function () {
			if (this.last) {
				this.menuState.set(this.last);
				this.$emit('setmenu', this.last);
				this.last = null;
			}
		},

		hidePopup() {
			this.menuState.set(null);
			this.$emit('setmenu', null);
		},
	},
};
