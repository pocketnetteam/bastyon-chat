import { mapState } from "vuex";
import chatPreview from "@/components/chat/preview/index.vue";

export default {
	name: "chatJoin",
	props: {
		chat: Object,
		m_chat: {},
		usersinfo: Array,
		room: Object
	},

	components: {
		chatPreview
	},

	inject: ["streamMode", "videoMeta"],

	data: function () {
		return {
			loading: false,
			joinedMembers: [],
			creatorLeft: false
		};
	},

	created: () => {},

	watch: {},
	computed: mapState({
		hiddenInParent: state => state.hiddenInParent,
		auth: state => state.auth,
		pocketnet: state => state.pocketnet,
		minimized: state => state.minimized,
		active: state => state.active,
		tetatet: function () {
			return this.core.mtrx.kit.tetatetchat(this.m_chat);
		},

		blockedCheck: function () {
			var users = this.core.mtrx.anotherChatUsers(this.m_chat.roomId);

			if (users.length == 1) {
				return this.core.mtrx.blockeduser(users[0].userId);
			}
		}
	}),
	mounted: function () {},
	methods: {
		join: function () {
			if (this.streamMode && !this.videoMeta?.isLive) return;

			this.$store.commit("SET_CHAT_TO_FORCE", this.m_chat.roomId);

			this.$store.state.globalpreloader = true;

			this.core.mtrx.client
				.joinRoom(this.m_chat.roomId)
				.then(() => {
					//this.$store.commit('SET_CHAT_TO_STORE', this.m_chat.summary)
					this.$emit("joined");
				})
				.catch(e => {

					this.$store.commit("icon", {
						icon: "error",
						message: e
					})

					this.brokenRoom(true);

					return (this.creatorLeft = true);

				}).finally(() => {
				this.$store.state.globalpreloader = false;
			})
		},
		back() {
			this.$router.go(-1);
		},

		ignore: function () {
			var users = this.core.mtrx.anotherChatUsers(this.chat.roomId);

			if (users.length > 1) {
				return;
			}

			this.$store.state.globalpreloader = true;

			this.core.mtrx
				.blockUser(users[0].userId)
				.then(r => {
					this.$router.go(-1);
				})
				.catch((e) => {}).finally(() => {
				this.$store.state.globalpreloader = false;
			})
		},

		decline: function () {
			this.$store.commit("SET_CHAT_TO_FORCE", this.m_chat.roomId);

			this.$store.state.globalpreloader = true;

			this.core.mtrx.client.leave(this.chat.roomId).then((r) => {
				return this.core.mtrx.client
					.forget(this.chat.roomId, true)
					.then(r => {
						return r;
					})
					.then(r => {
						this.$store.commit("DELETE_ROOM", this.chat.roomId);

						this.$router.go(-1);
					});
			}).finally(() => {
				this.$store.state.globalpreloader = false;
			})
		},
		brokenRoom() {
			this.$emit("creatorLeft", true);
		}
	}
};
