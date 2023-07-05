import f from "@/application/functions.js";
import chatIcon from "@/components/chats/assets/icon.vue";
export default {
	components: {
		chatIcon,
	},
	
	inject: [
		"streamMode",
		"menuState"
	],
	
	props: {
		membersList: Array,
		allMembers: Array,
		roles: {
			type: Boolean,
			default: true
		}
	},
	
	data: function () {
		return {
			moderItems: [
				{
					click: "adminBan",
					title: this.$i18n.t("caption.ban"),
					icon: "fas fa-ban",

					upload: {
						multiple: true,
					},
				},
				{
					click: "adminKick",
					title: this.$i18n.t("caption.kick"),
					icon: "fas fa-user-times",
				},
			],
			
			menuItems: [
				{
					click: "adminMakeModer",
					title: this.$i18n.t("caption.makeModerator"),
					icon: "fas fa-user-shield",
				},

				{
					click: "adminBan",
					title: this.$i18n.t("caption.ban"),
					icon: "fas fa-ban",

					upload: {
						multiple: true,
					},
				},
				{
					click: "adminKick",
					title: this.$i18n.t("caption.kick"),
					icon: "fas fa-user-times",
				},
			],
		};
	},
	
	computed: {
		meid: function () {
			return this.core.user.userinfo.id;
		},
		me: function () {
			return (
				_.find(this.allMembers || this.membersList, (m) => {
					return m.userId === this.meid;
				}) || {}
			);
		},
	},
	
	methods: {
		userinfo: function (user) {
			return f.deep(this, "core.store.state.users." + user.userId) || {};
		},
		role: function (user) {
			var r = "member";

			if (user.powerLevel >= 50) r = "moderator";
			if (user.powerLevel >= 100) r = "admin";

			return r;
		},
		menu: function (user) {


			/*menu.push({
				action: this.menureply,
				text: "button.reply",
				icon: "fas fa-reply",
			})*/

			var items = {
				setAdmin: {
					action: () => this.setAdmin(user),
					text: this.$i18n.t("caption.makeModerator"),
					icon: "fas fa-user-shield",
				},
				kick: {
					action: () => this.kick(user),
					text: this.$i18n.t("caption.kick"),
					icon: "fas fa-user-times",
				},
				ban: {
					action: () => this.ban(user),
					text: user.membership === "ban" ? this.$i18n.t("caption.removeBan") : this.$i18n.t("caption.ban"),
					icon: "fas fa-user-times",
				},
			};

			var menu = [];

			if (
				user.powerLevel === 0 &&
				this.me.powerLevel >= 50 &&
				this.meid !== user.id
			) {
				menu = [items.ban];
			}

			if (
				user.powerLevel === 0 &&
				this.me.powerLevel === 100 &&
				this.meid !== user.id
			) {
				menu = [items.setAdmin, items.ban];
			}
			if (
				user.powerLevel === 50 &&
				this.meid !== user.id &&
				this.me.powerLevel === 100
			) {
				items.setAdmin.text = this.$i18n.t("caption.cancelModeration");
				menu = [items.setAdmin, items.ban];
			}
			
			return menu;
		},

		dropDownMenuShow: function (user) {
			setTimeout(() => {
				this.setmenu(user);
			}, 200);
		},

		setmenu: function (user) {
			/*this.core.menu({
				items: this.menu(user),
				item: {},
			});*/
			this.menuState.set({
				items: this.menu(user),
				item: {},
			});
		},

		navigateToProfile(id) {
			this.$router
				.push({ path: `/contact?id=${f.getmatrixid(id)}` })
				.catch((e) => {});
		},

		menuItemClickHandler(item, rowObject, utils) {
			if (!this[item.click]) {
				return Promise.resolve();
			}

			this["menu" + item.click](rowObject)
				.then((r) => {
					utils.hidePopup();
				})
				.catch((e) => {
					utils.showPopup();
				});
			return this[item.click](rowObject.user);
		},

		openModal: function(user) {
			this.core.mtrx.opencontact(this.userinfo(user));
		},

		setAdmin(user) {
			this.$emit("admin", user);
			return Promise.resolve();
		},
		kick(user) {
			this.$emit("kick", user);
			return Promise.resolve();
		},
		ban(user) {
			this.$emit("ban", user);
			return Promise.resolve();
		},


		/*setAdmin: function (user) {
			this.$emit("setAdmin", user.id);
			return Promise.resolve();
		},

		ban: function (user) {
			this.$emit("adminKick", user.id);

			return Promise.resolve();
		},

		kick: function (user) {
			this.$emit("adminKick", user.id);
			return Promise.resolve();
		},*/
	},
};
