export default {
	inject: ["streamMode"],
	props: {
		text: String,
		chat: Object,
	},
	methods: {
		leaveRoom() {
			this.core.mtrx.client
				.forget(this.chat.roomId, true)
				.then((r) => {
					this.$store.commit("DELETE_ROOM", this.chat.roomId);
				})
				.then((r) => {
					this.$router.push({ path: "/chats" }).catch((e) => {});
				});
		},
	},
};
