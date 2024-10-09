import { mapState } from "vuex";

import list from "@/components/chat/list/index.vue";
import join from "@/components/chat/join/index.vue";
import attachement from "@/components/chat/attachement/index.vue";
import f from "@/application/functions";
import userRoomStatus from "@/components/chat/userRoomStatus/index.vue";

export default {
	name: "chat",
	props: {
		chat: Object,
		u: String,
		search: String,
		searchresults: Array,
		filterType: String,
		style: ""
	},

	components: {
		list,
		chatInput: () => import("@/components/chat/input/index.vue"),
		join,
		attachement,
		userRoomStatus
	},

	inject: ["streamMode", "userBanned"],

	data: function () {
		return {
			membership: null,
			roomUserBanned: false,
			roomUserKicked: false,
			roomMuted: false,
			loading: false,
			ready: false,
			encrypted: false,
			usersinfo: [],
			chatEvents: {},
			relationEvent: null,
			key: "",
			sendingDataStore: {},
			esize: {},
			fsize: {},
			cantchat: false,
			cantchatexc: false,
			error: null,
			hoverEncrypt: false,
			encrypting: false,
			showInput: true,
			showShareMessages: false,
			selectedMessages: [],
			activated: false,
			membershipReactivity: null
		};
	},

	created() {},

	activated() {
		this.activated = true;
	},

	deactivated() {
		this.activated = false;
	},

	mounted() {
		this.activated = true;

		if (!this.streamMode) {
			this.getuserinfo();

			this.$store.commit("active", true);
			this.$store.commit("blockactive", { value: true, item: "chat" });
		}

		this.createMembershipReactivity();
	},

	destroyed() {
		if (!this.streamMode) {
			this.$store.commit("blockactive", { value: false, item: "chat" });
			this.$store.commit("SET_CURRENT_ROOM", false);
		}

		clearInterval(this.membershipReactivity);
	},

	beforeDestroy() {
		this.activated = false;
	},

	watch: {
		activated: {
			immediate: true,
			handler: function () {
				if (this.activated) {
					this.createMembershipReactivity();
				} else {
					this.destroyMembershipReactivity();
				}
			}
		},

		chatusers: function () {
			if (this.m_chat && this.m_chat.pcrypto) {
				this.core.mtrx.kit
					.allchatmembers([this.m_chat], false, true)
					.then(() => {
						return this.m_chat.pcrypto.userschanded();
					})
					.then(r => {
						return this.checkcrypto();
					});
			}
		},

		m_chat: {
			immediate: true,
			handler: function () {
				if (this.m_chat && !_.isEmpty(this.m_chat)) {
					this.core.mtrx.kit.prepareChatWithUsers(this.m_chat).then(r => {
						this.ready = true;

						this.checkcrypto();
					});

					/*this.core.mtrx.kit
						.allchatmembers([this.m_chat], false, true)
						.then((r) => {
							return this.core.mtrx.kit.prepareChat(this.m_chat);
						})
						.then((r) => {
							this.ready = true;

							this.checkcrypto();
						});*/
				}
			}
		},

		chat: {
			immediate: true,
			handler: function () {
				this.ready = false;
				this.encrypted = false;
				this.$store.commit("setmodal", null);
				if (this.chat) {
					this.$store.commit("SET_CURRENT_ROOM", this.chat.roomId);
					this.$store.commit("SET_LAST_ROOM", this.chat.roomId);
				} else this.$store.commit("SET_CURRENT_ROOM", false);
			}
		},

		userBanned: {
			immediate: true,
			deep: true,
			handler: function () {
				this.membership =
					this.m_chat?.currentState?.members[this.m_chat.myUserId]?.membership;
			}
		}
	},

	computed: mapState({
		pocketnet: state => state.pocketnet,
		minimized: state => state.minimized,
		auth: state => state.auth,
		active: function (state) {
			return this.streamMode || state.active;
		},
		m_chat: function () {
			if (this.chat && this.chat.roomId) {
				let pushRules = this.core.mtrx.client.pushProcessor.getPushRuleById(
					this.chat.roomId
				);
				if (pushRules !== null) {
					this.roomMuted = true;
				}

				if (this.chat.pcrypto) {
					return this.chat;
				} else {
					return this.core.mtrx.client.getRoom(this.chat.roomId) || {};
				}
			}
		},

		keyproblem: function () {
			if (this.core.user.userinfo.keys.length < 12) {
				return "younotgen";
			} else return "usernotgen";
		},

		allowedToRead: function () {
			return this.membership === "join" || this.streamMode;
		},

		allowedToJoin: function () {
			return this.membership === "invite" || this.streamMode;
		},

		blockedUser: function () {
			if (this.u) {
				return this.core.mtrx.blockeduser(this.u[0]);
			}

			if (this.chat) {
				var users = this.core.mtrx.anotherChatUsers(this.chat.roomId);

				if (users.length === 1) {
					return this.core.mtrx.blockeduser(users[0].userId);
				}
			}

			/* if(this.m_chat){

		  var me = this.m_chat.myUserId
		  var anotherUser = this.chat.members.filter(member => member.userId !== me)
		  this.core.mtrx.client.isUserIgnored(anotherUser[0].userId)

		  
	   }*/
		},
		openInviteModal: function () {
			return this.openInviteModal;
		},

		attachements: function () {
			return _.toArray(this.sendingDataStore);
		},

		chatusers: function () {
			if (this.m_chat)
				return this.core.store.state.chatusers[this.m_chat.roomId];
		},

		localisationTitles: function () {
			return this.$i18n.t("button");
		}
	}),

	methods: {
		destroyMembershipReactivity: function () {
			if (this.membershipReactivity) clearInterval(this.membershipReactivity);

			this.membershipReactivity = null;
		},
		createMembershipReactivity: function () {
			if (this.membershipReactivity) clearInterval(this.membershipReactivity);

			this.membershipReactivity = setInterval(() => {
				if (!this.activated) return;

				if (this.m_chat && !this.streamMode) {
					if (this.m_chat.timeline.length > 0) {
						const id = this.core.mtrx.client.credentials.userId,
							timeline = this.core.mtrx.client.getRoom(
								this.chat.roomId
							).timeline,
							lastEvent = timeline[timeline.length - 1];

						if (
							lastEvent.event.state_key === id &&
							lastEvent.event.content.reason === "admin ban"
						) {
							this.roomUserBanned = true;
						} else {
							this.roomUserBanned = false;
						}
					}
				} else if (this.streamMode) {
					this.roomUserBanned =
						this.m_chat?.currentState.members[this.m_chat.myUserId]
							?.membership === "ban";
				}

				this.membership =
					this.m_chat?.currentState.members[this.m_chat.myUserId]?.membership;
			}, 1000);
		},

		clbkencrypt: function () {
			this.encrypting = true;
		},

		clbkencrypted: function () {
			this.encrypting = false;
		},

		checkcrypto: function () {
			this.encrypted = this.m_chat.pcrypto?.canBeEncrypt();
			this.cantchat = this.m_chat.pcrypto?.cantchat();
		},

		force: function () {
			this.key = f.makeid();
		},

		clearRelationEvent: function () {
			if (
				this.relationEvent &&
				this.relationEvent.type === "m.replace" &&
				this.$refs["chatInput"]
			) {
				this.$refs["chatInput"].setText("");
			}

			this.relationEvent = null;
		},

		newchat: function (chat) {
			this.$emit("newchat", chat);

			this.m_chat.pcrypto.userschanded();
		},

		getuserinfo: function () {
			if (this.u) {
				this.core.user.usersInfo(this.u).then(info => {
					this.usersinfo = info;
				});
			}
		},

		cantchatcrypto: function () {
			this.cantchat = true;
		},

		proceedwithoutkeys: function () {
			this.cantchatexc = true;
		},

		refreshkeys: function () {
			this.core.user.userInfo(true).then(r => {
				if (this.u) {
					this.core.user.usersInfo(this.u, false, true).then(info => {
						var _info = info[0];

						if (
							_info &&
							_info.keys &&
							_info.keys.length >= 12 &&
							this.core.user.userinfo.keys.length >= 12
						) {
							this.cantchat = false;
						}

						this.usersinfo = info;

						//this.m_chat.pcrypto.userschanded()
					});
				} else {
					this.core.store
						.dispatch("RELOAD_CHAT_USERS", [this.m_chat])
						.then(r => {
							/*this.m_chat.pcrypto.userschanded()
    
			this.checkcrypto()*/
						});
				}
			});
		},

		closing: function (e) {
			this.PNmetaPreview = e;
		},

		usersinfoNames: function () {
			return _.map(this.usersinfo, function (u) {
				return u.name;
			}).join(", ");
		},

		replyEvent: function ({ event }) {
			this.relationEvent = {
				type: "m.reference",
				event: event,
				action: this.$i18n.t("caption.replyOnMessage")
			};
			if (this.$refs["chatInput"]) {
				this.$refs["chatInput"].focus();
			}
		},

		shareEvent: function ({ event }) {
			this.relationEvent = {
				type: "m.reference",
				event: event,
				action: this.$i18n.t("caption.shareMessage")
			};
			if (this.$refs["chatInput"]) {
				this.$refs["chatInput"].focus();
			}
		},

		editingEvent: function ({ event, text }) {
			this.relationEvent = {
				type: "m.replace",
				event: event,
				action: this.$i18n.t("caption.editMessage")
			};

			if (this.$refs["chatInput"]) {
				this.$refs["chatInput"].setText(text);
			}
		},

		focused: function () {
			this.fsize = _.clone(this.esize);
		},

		scroll(size) {
			this.esize = size;

			var ns = this.esize.scrollTop || 0;
			var fs = this.fsize.scrollTop || 0;

			if (ns - 450 > fs && this.$refs["chatInput"]) {
				this.$refs["chatInput"].blurifempty();
			}
		},

		events(data) {
			this.$emit("getEvents", data);
			this.chatEvents = data;
		},

		galleryImage(e) {
			this.core.store.dispatch("SHOW_GALLERY_FROMEVENTS", {
				events: this.chatEvents,
				event: e
			});
		},

		sending: function () {
			this.$emit("sending");

			this.$refs["list"].scrollToNew(0);

			///$(this.$el).find('.eventsflex').scrollTop(0) ???
		},

		sent: function () {
			if (this.relationEvent && this.relationEvent.type === "m.reference") {
				this.relationEvent = null;
			}

			this.$emit("sent");

			this.error = null;
		},

		sendingData: function (meta) {
			this.$set(this.sendingDataStore, meta.id, meta);
		},

		sentData: function (meta) {
			this.clearMeta(meta);

			this.error = null;
		},

		sentError: function (meta) {
			if (meta && meta.id) {
				this.clearMeta(meta);
			}

			if (meta && meta.error) {
				this.error = meta.error;
			}
		},

		sentMessageError: function (e) {
			this.error = e.error;
			this.core.logerror("sentMessageError", f.stringify(this.error));
		},

		abortSending: function (id) {
			var meta = this.sendingDataStore[id];

			if (meta.abort) meta.abort();

			meta.aborted = true;

			///

			this.clearMeta(meta);
		},
		brokenInvitedRoom(val) {
			this.$emit("removeBrokenRoom", val);
		},

		clearMeta: function (meta) {
			this.$delete(this.sendingDataStore, meta.id);
		},

		menuIsVisibleHandler: function (isVisible) {
			this.$emit("menuIsVisible", isVisible);
		},

		shareDataMessages: function () {
			var messages = _.map(
				_.sortBy(this.selectedMessages, m => {
					return m.time;
				}),
				m => {
					return m.sharing;
				}
			);

			this.core
				.share({
					multiple: messages
				})
				.then(() => {
					this.selectedMessages = [];
				});

			/*let allMessages = [];

			for (let i = 0; i < this.selectedMessages.length; i++) {
				if (this.selectedMessages[i].messages) {
					allMessages.push(this.selectedMessages[i].messages[0]);
				}
			}

			var pr = Promise.resolve();
			var _sharing = this.selectedMessages[0];
			_sharing.messages = allMessages;


			pr.then(() => {
				this.core.share(_sharing);
			});*/
		},

		removeDataMessages: function () {
			this.$store.commit("icon", {
				icon: "loading",
				message: "",
				manual: true
			});

			Promise.all(
				_.map(this.selectedMessages, message => {
					return this.core.mtrx.client.redactEvent(
						this.chat.roomId,
						message.message_id,
						null,
						{
							reason: "messagedeleting"
						}
					);
				})
			)
				.then(r => {
					this.$store.commit("icon", {
						icon: "success",
						message: ""
					});

					this.selectedMessages = [];
				})
				.catch(e => {
					console.error(e);

					this.selectedMessages = [];

					this.$store.commit("icon", {
						icon: "error",
						message: ""
					});
				})
				.finally(() => {
					this.force();
				});
		},

		cancelDataMessages: function () {
			this.selectedMessages = [];
		},

		scrollToEvent: function (event) {
			f.pretry(() => {
				return this.$refs["list"];
			}).then(() => {
				this.$refs["list"].scrollToEvent(event);
			});
		},

		joined: function () {
			/*Trigger chat reactivity*/
			this.$set(this.chat, "joined", +new Date());
			this.userBanned.set(false);
		}
	}
};
