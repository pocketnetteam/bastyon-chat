import f from "@/application/functions.js";
import chatIcon from "@/components/chats/assets/icon.vue";
export default {
	components: {
		chatIcon,
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
	props: {
		membersList: Array,
	},
	computed: {
		meid: function () {
			return this.core.user.userinfo.id;
		},
		me: function () {
			return (
				_.find(this.membersList, (m) => {
					return m.userId == this.core.user.userinfo.id;
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
			var items = {
				setAdmin: {
					click: "setAdmin",
					title: this.$i18n.t("caption.makeModerator"),
					icon: "fas fa-user-shield",
				},
				kick: {
					click: "kick",
					title: this.$i18n.t("caption.kick"),
					icon: "fas fa-user-times",
				},
				ban: {
					click: "ban",
					title: this.$i18n.t("caption.ban"),
					icon: "fas fa-user-times",
				},
			};
			var menu = [];
			if (user.membership === "ban") {
				items.ban.title = this.$i18n.t("caption.removeBan");
			}
			if (
				user.powerLevel === 0 &&
				this.me.powerLevel >= 50 &&
				this.core.user.userinfo.id !== user.id
			) {
				menu = [items.ban];
			}

			if (
				user.powerLevel === 0 &&
				this.me.powerLevel === 100 &&
				this.core.user.userinfo.id !== user.id
			) {
				menu = [items.setAdmin, items.ban];
			}
			if (
				user.powerLevel === 50 &&
				this.core.user.userinfo.id !== user.id &&
				this.me.powerLevel === 100
			) {
				items.setAdmin.title = this.$i18n.t("caption.cancelModeration");
				menu = [items.setAdmin, items.ban];
			}
			return menu;
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
		menusetAdmin(rowObject) {
			this.$emit("admin", rowObject.user);
			return Promise.resolve();
		},
		menukick(rowObject) {
			this.$emit("kick", rowObject.user);
			return Promise.resolve();
		},
		menuban(rowObject) {
			this.$emit("ban", rowObject.user);
			return Promise.resolve();
		},
		setAdmin: function (user) {
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
		},
	},
};
