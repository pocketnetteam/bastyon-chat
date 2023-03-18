import topheader from "@/components/chat/topheader";
import f from "@/application/functions";

import contacts from "@/components/contacts/index.vue";
import invite from "@/components/chat/invite/index.vue";
import userspic from "@/components/assets/userspic";
import { mapState } from "vuex";
import members from "@/components/chatInfo/info/members/index.vue";
import images from "@/components/chatInfo/info/images/index.vue";
import files from "@/components/chatInfo/info/files/index.vue";

import avatarsList from "@/components/chatInfo/assets/avatarsList/index.vue";
import chatName from "@/components/chats/assets/name.vue";
import chatIcon from "@/components/chats/assets/icon.vue";

export default {
	data: function () {
		return {
			usr: {},
			ind: 0,
			topicTxt: "",
			roomMuted: false,
			roomCallsDisabled: false,
			publicRoom: {},
			public: false,
			encryptedEvents: [],
			imageEvents: [],
			pics: false,
			fileEvents: [],
			inputActive: false,
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
			menuItemsModer: [
				{
					click: "moderBan",
					title: this.$i18n.t("caption.ban"),
					icon: "fas fa-ban",
				},
				{
					click: "moderKick",
					title: this.$i18n.t("caption.kick"),
					icon: "fas fa-user-times",
				},
			],
			admin: String,
			imagesList: [],
			localRoomName: "",
			humanSize: Number,
			inviteUserOpened: false,
			msList: [],
			isOpen: false,
			actionMemberShow: false,
			options: {
				index: 0,
				arrowEl: false,
				fullscreenEl: false,
				shareEl: false,
			},
			roomName: "",
			nameEdit: false,
			accordionList: [
				{ title: this.$i18n.t("caption.members"), id: "members" },
				{ title: this.$i18n.t("caption.media"), id: "media" },
				{ title: this.$i18n.t("caption.files"), id: "files" },
			],
			isActive: null,
			isActiveAction: null,
			currentUser: "",
			actionUser: {},
			actionUserMenu: false,
			chatMembers: [],
		};
	},
	props: {
		chat: {},
	},
	components: {
		images,
		members,
		files,
		topheader,
		avatarsList,
		invite,
		userspic,
		contacts,
		chatName,
		chatIcon,
	},

	watch: {
		m_chat: {
			immediate: true,
			handler: function () {
				if (this.m_chat && !_.isEmpty(this.m_chat)) {
					this.core.mtrx.kit.prepareChat(this.m_chat).then((r) => {
						this.ready = true;

						this.encrypted = this.m_chat.pcrypto.canBeEncrypt();
					});


				}
			},
		},
		chat: {
			immediate: true,
			handler: function () {
				if (this.chat) {
					this.$store.commit("SET_CURRENT_ROOM", this.chat.roomId);
				} else this.$store.commit("SET_CURRENT_ROOM", false);


				if (this.chat && this.chat.roomId) {
					
					let pushRules = this.core.mtrx.client._pushProcessor.getPushRuleById(
						this.chat.roomId
					);

					if (pushRules !== null) {
						this.roomMuted = true;
					}

				}
			},
		},
	},

	computed: {
		...mapState(["minimized", "active"]),

		curation: function () {
			if (window.POCKETNETINSTANCE && window.POCKETNETINSTANCE.curation())
				return true;
		},

		canchangeChatName: function () {
			return !this.tetatet && this.me.powerLevel > 0;
		},

		canInvite: function () {
			return !this.tetatet && this.me.powerLevel > 0;
		},

		shareRoomLink: function () {
			return `https://bastyon.com/welcome?publicroom=${this.chat.roomId}`;

			/*if(this.chat.info.title === '@New Room'){
		return `https://bastyon.com/welcome?publicroom=${this.chat.roomId}`
	  }
	  return `https://bastyon.com/welcome?publicroom=${this.chat.info.title.replace(/ /g, '_')}`*/
		},
		me: function () {
			return (
				_.find(this.membersList, (m) => {
					return m.userId == this.core.user.userinfo.id;
				}) || {}
			);
		},
		events: function () {

			var pushRules = this.core.mtrx.client._pushProcessor.getPushRuleById(
				this.chat.roomId
			);
			let isEnabled = this.m_chat.currentState.getStateEvents(
				"m.room.callsEnabled"
			).find(
				(e) =>
					!(!this.core.mtrx.me(e?.event?.sender)) &&
					e?.event?.sender.split(":")[0].replace("@", "") ===
					e?.event?.state_key
			)
			if (pushRules !== null) {
				this.roomMuted = true;
			}
			if (
				isEnabled
			) {
				this.roomCallsDisabled = !isEnabled.event.content.enabled;
			}
			return this.m_chat.timeline || {};
		},

		customRoomType: function () {
			var type = this.core.mtrx.customRoomType(this.chat.roomId);
			return type;
		},

		blockedCheck: function () {
			var users = this.core.mtrx.anotherChatUsers(this.chat.roomId);

			if (users.length == 1) {
				return this.core.mtrx.blockeduser(users[0].userId);
			}
		},

		membersCount: function () {
			return this.users.length;
		},

		users: function () {
			return this.core.mtrx.chatUsersInfo(this.chat?.roomId) || [];
		},
		m_chat: function () {
			if (this.chat && this.chat.roomId) {
				var m_chat = this.core.mtrx.client.getRoom(this.chat.roomId);

				return m_chat || {};
			}
		},

		galleryImages: function () {
			var imgArr = [];

			this.imageEvents.forEach(function (event) {
				if (event.event.content.msgtype === "m.image") {
					imgArr.push({
						src: event.event.content.url,
						w: event.event.content.info.w,
						h: event.event.content.info.h,
					});
				}
			});
			return imgArr;
		},

		membersList: function () {
			return this.core.mtrx
				.chatUsers(this.chat.roomId)
				.filter((user) => user.membership !== "leave");
		},

		tetatet: function () {
			return this.core.mtrx.kit.tetatetchat(this.m_chat);
		},

		changeRoomName: function () {
			var roomName = this.m_chat.name;
			return roomName.replace("_", " ");
		},

		groupAvatar: function () {
			if (this.m_chat.currentState.getStateEvents("m.room.avatar")[0]) {
				return this.m_chat.currentState.getStateEvents("m.room.avatar")[0].event
					.content.avatarUrl;
			}
		},
	},
	mounted() {
		const smthconstfortexst = this.events;
		// this.changeName()
		this.eventsList();
		if (this.m_chat.getJoinRule() === "public") {
			this.public = true;
			this.getPublicRoom();
		}
	},
	methods: {
		complain: function () {
			if (this.curation) {
				var p = {
					address1: this.core.user.userinfo.source.address,
				};

				if (this.tetatet) {
					var ui = _.find(
						this.core.mtrx.chatUsersInfo(this.chat.roomId) || [],
						(u) => {
							return u.id != this.core.user.userinfo.id;
						}
					);

					if (ui) {
						p.address2 = ui.source.address;
					}
				} else {
					p.roomid = this.chat.roomId;
				}

				this.core.mtrx.complain(this.$t("button.Complain"), p);
			}
		},

		getPublicRoom() {
			this.core.mtrx.client.publicRooms().then((r) => {
				this.publicRoom = r.chunk.filter(
					(room) => room.room_id === this.chat.roomId
				)[0];
				if (this.publicRoom.topic) {
					return (this.topicTxt = this.publicRoom.topic.replace(/_/g, " "));
				}
			});
		},
		//// ???
		banForgetRoom() {
			var banUserId = "";
			var my = this.m_chat.myUserId;
			var members = this.m_chat.currentState.getMembers();

			members.forEach(function (member) {
				if (member !== my) {
					banUserId = member.userId;
				}
			});

			this.core.mtrx.client
				.ban(this.chat.roomId, banUserId, "leave")
				.then((r) => {
					return r;
				});
		},

		muteCalls() {
			let roomId = this.chat.roomId;
			const self = this;
			self.roomCallsDisabled = !self.roomCallsDisabled
			if (!self.roomCallsDisabled) {
				self.core.mtrx.client.sendStateEvent(
				  roomId,
				  "m.room.request_calls_access",
				  { accepted: true }
				);
			}
			self.core.mtrx.client.sendStateEvent(
				roomId,
				"m.room.callsEnabled",
				{ enabled: !self.roomCallsDisabled },
				this.core.user.userinfo.id
			);
		},
		muteRoom() {
			var roomId = this.chat.roomId;
			var deviceID = this.core.mtrx.client.deviceId;
			var self = this;
			if (this.roomMuted) {
				self.core.mtrx.client.deletePushRule("global", "room", roomId);
				self.roomMuted = false;
			} else {
				self.core.mtrx.client.setRoomMutePushRule("global", roomId, "true");
				self.roomMuted = true;
			}
		},

		blockUser() {
			var users = this.core.mtrx.anotherChatUsers(this.chat.roomId);

			if (users.length > 1) {
				return;
			}

			this.core.mtrx.blockUser(users[0].userId).catch((e) => { });
		},

		unblock() {
			var users = this.core.mtrx.anotherChatUsers(this.chat.roomId);

			if (users.length > 1) {
				return;
			}

			this.core.mtrx.unblockUser(users[0].userId).catch((e) => { });
		},

		eventsList() {
			if (typeof this.events.filter == "function") {
				this.imageEvents = this.events.filter(
					(event) =>
						event.event.content.msgtype === "m.image" ||
						(event.event.type === "m.room.encrypted" &&
							event.getClearContent().msgtype === "m.image")
				);
				this.fileEvents = this.events.filter(
					(event) => event.event.content.msgtype === "m.file"
				);
			}
		},

		toggleItem(index) {
			this.isActive = this.isActive === index ? null : index;
			this.actionMemberShow = null;
		},

		forgetRoom() {
			this.$dialog
				.confirm("Do you really want to leave room?", {
					okText: this.$i18n.t("yes"),
					cancelText: this.$i18n.t("cancel"),
				})

				.then((dialog) => {
					this.core.mtrx.client.leave(this.chat.roomId).then((r) => {
						this.core.mtrx.client
							.forget(this.chat.roomId, true)
							.then((r) => {
								return r;
							})
							.then((r) => {
								this.$store.commit("DELETE_ROOM", this.chat.roomId);

								this.$router.push({ path: "/chats" }).catch((e) => { });
							});
					});
				});
		},

		////// TODO

		changeName() {
			this.localRoomName = this.m_chat.name.replace(/@/g, "");
			this.localRoomName.replace("_", " ");
		},

		saveRoomName() {
			this.nameEdit = false;
			this.inputActive = false;

			this.core.mtrx.client.setRoomName(
				this.m_chat.roomId,
				"@" + this.roomName.replace(/[@]*/g, "")
			);
		},

		///////////////
		banUser(user) {
			if (user.membership === "ban") {
				this.core.mtrx.client
					.unban(
						this.m_chat.roomId,
						f.getMatrixIdFull(user.userId, this.core.domain)
					)
					.then((r) => {
						this.core.mtrx.client
							.invite(
								this.m_chat.roomId,
								f.getMatrixIdFull(user.userId, this.core.domain)
							)
							.then((r) => { });
					});
			} else {
				this.core.mtrx.client
					.ban(
						this.m_chat.roomId,
						f.getMatrixIdFull(user.userId, this.core.domain),
						"admin ban"
					)
					.then((r) => { });
			}
		},
		kickUser(user) {
			this.core.mtrx.client
				.kick(
					this.m_chat.roomId,
					f.getMatrixIdFull(user.userId, this.core.domain),
					"admin kicked"
				)
				.then(this.$nextTick(function () { }));
		},
		makeAdmin(user) {
			var level = 50;
			if (user.powerLevel === 50) {
				level = 0;
			}
			var event = this.m_chat.currentState.getStateEvents(
				"m.room.power_levels"
			);

			this.core.mtrx.client
				.setPowerLevel(
					this.m_chat.roomId,
					f.getMatrixIdFull(user.userId, this.core.domain),
					level,
					event[0]
				)
				.then((r) => {
					// console.log(event[0].event.content.users, "event")
				});
		},

		/////////////////

		showEditRoomName() {
			this.nameEdit = true;
			this.roomName = this.m_chat.name;
			this.inputActive = true;
		},

		editRoomName() { },

		showPhotoSwipe(index) {
			this.isOpen = true;
			this.$set(this.options, "index", index);
		},

		accordion: function (event) {
			event.target.classList.toggle("active");
		},

		hidePhotoSwipe() {
			this.isOpen = false;
		},

		focus() {
			return $event.target.select();
		},

		showUserAbout(user) {
			this.$emit("showAbout", user);
		},

		getClick(room) {
			this.$emit("showRoomInfo", room);
		},

		modalInviteUser() {
			this.inviteUserOpened = true;
		},

		closeModal() {
			this.inviteUserOpened = false;
		},

		closeContactModal(value) {
			this.inviteUserOpened = value;
		},
		addTopic() {
			this.core.mtrx.client
				.setRoomTopic(this.chat.roomId, this.topicTxt.replace(/ /g, "_"))
				.then((r) => {
					this.getPublicRoom();
				});
		},
		copyShareLink() {
			this.$f.copytext(this.shareRoomLink);

			this.core.sitemessage("The link was copied successfully");
		},

		sharelink() {
			this.core.share({
				urls: [this.shareRoomLink],
				route: "chatInfo?id=" + this.chat.roomId,
			});
		},
	},
};
