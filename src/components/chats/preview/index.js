import { mapState } from "vuex";
import chatName from "@/components/chats/assets/name.vue";
import chatTime from "@/components/chats/assets/time.vue";
import chatIcon from "@/components/chats/assets/icon.vue";
import f from "@/application/functions.js";

export default {
	name: "preview",
	props: {
		chat: Object,
		dummy: Boolean,
		search: String,
		messages: Array
	},
	inject: ["matches"],

	components: {
		chatName,
		chatTime,
		chatIcon
	},

	data: function () {
		return {
			loading: false,
			ready: false,
			lastEvent: {},
			userStatusRoom: String
		};
	},

	watch: {
		m_chat: {
			immediate: true,
			handler: function () {
				this.ready = false;

				if (this.m_chat && !_.isEmpty(this.m_chat)) {
					this.core.mtrx.kit.prepareChat(this.m_chat).then(r => {
						this.ready = true;
					});
				}
			}
		}
	},

	mounted: function () {},

	computed: mapState({
		auth: state => state.auth,
		blockedCheck: function () {
			var users = this.core.mtrx.anotherChatUsers(this.m_chat.roomId);

			if (users.length == 1) {
				return this.core.mtrx.blockeduser(users[0].userId);
			}
		},
		roomMuted: function () {
			if (this.chat) {
				let pushRules = this.core.mtrx.client.pushProcessor.getPushRuleById(
					this.chat.roomId
				);

				if (pushRules !== null) {
					return true;
				}
			}

			return false;
		},

		m_chat: function (state) {
			if (!this.core.mtrx.client || !this.chat) return null;

			if (this.chat.roomId) {
				return this.core.mtrx.store.rooms[this.chat.roomId] || null;
			}
		},
		chatevents: function () {
			return (this.events[this.chat.roomId] || {}).timeline || [];
		},

		key: function () {
			if (this.event) return this.event.event_id;

			return "key";
		},

		unknowngroupusers: function () {
			return this.core.mtrx.kit.unknowngroupusers(this.chat);
		},

		matrixevent: function () {
			var e = this.event;

			if (e) {
				return e.get ? e.get() : e;
			}
		},

		event: function () {
			if (this.chat && this.chat.roomId) {
				let events = this.chatevents;
				if (this.messages) {
					return this.messages[0];
				}

				return this.chatevents[0];
			}
		},

		...mapState(["minimized", "active", "events"])
	}),

	methods: {}
};
