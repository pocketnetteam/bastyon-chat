import { mapState } from "vuex";

export default {
	name: "contactActions",
	props: {
		contact: Object,
		blocked: Boolean,
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
		tetatetid: function () {
			return this.core.mtrx.kit.tetatetid(
				this.contact,
				this.core.user.userinfo
			);
		},
		readyChat: function () {
			const
				chats = this.$store.state.chats,
				chatID = this.tetatetid;

			return _.filter(
				chats,
				(chat) => (chat?.info?.title ?? "").replace(/#/, "") === chatID
			);
		},
	}),

	methods: {
		chat: function () {
			this.core.mtrx.kit.tetatetid(this.contact, this.core.user.userinfo);
		},
		blockUser() {
			this.core.mtrx.blockUser(this.contact.id).catch((e) => {
				console.error(e);
			});
		},
		unblock() {
			this.core.mtrx.unblockUser(this.contact.id).catch((e) => {
				console.error(e);
			});
		},
	},
};
