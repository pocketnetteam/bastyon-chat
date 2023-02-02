import _ from "underscore/underscore-node.mjs";
import { mapActions, mapState } from "vuex";
import previewRoom from "@/components/chats/preview/index.vue";
import previewContact from "@/components/contacts/preview/index.vue";

export default {
	name: "allContacts",

	components: {
		previewRoom,
		previewContact,
	},

	props: {
		chats: Array,
		mode: {
			default: "",
			type: String,
		},
	},

	data: function () {
		return {
			loading: false,

			users: [],
			contacts: [],
			lists: [
				{ key: "chats", view: "room", action: "navigateToRoom" },
				{ key: "contacts", view: "contact", action: "navigateToProfile" },
				{ key: "other", view: "contact", action: "navigateToProfile" },

				{
					key: "messages",
					view: "roomWithMessage",
					keepMatches: true,
					action: "navigateToRoomFromMsg",
				},
			],
			
			searchChanged: true,
			searchHandlers: {}
		};
	},

	computed: {
		...mapState([
			"contactsMap",
			"matches"
		]),

		filteredLists: function () {
			var object = {};

			_.each(this.lists, (section) => {
				var items = this.getList(section.key);

				if (items.length) {
					object[section.key] = {
						items,
						section,
					};
				}
			});

			return object;
		},

		filteredMessages() {
			let chats = this.chats;

			if (this.matches?.value) {
				/*return _.filter(
					_.map(chats, (c) => {
						var messages = _.filter(c.events, (m) => {
							const match = (m.event.decrypted || m.event.content).body
								.toLowerCase()
								.includes(this.matches?.value);

							return (match && m.event) || null;
						});

						return {
							chat: c,
							messages: _.sortBy(messages, (m) => {
								return -(m.event.origin_server_ts || 1);
							}),
						};
					}),
					(cm) => {
						return cm.messages.length;
					}
				);*/
			}

			return [];
		},

		filteredChats() {
			let chats = this.chats;

			if (this.matches?.value) {
				let mc = _.filter(
					_.map(chats, (c) => {
						const users = this.core.mtrx.chatUsersInfo(
								c.roomId,
								"anotherChatUsers"
							),
							mChat = this.core.mtrx.client.getRoom(c.roomId),
							userNameString = _.reduce(
								users,
								(m, u) => m + u.name.toLowerCase(),
								""
							);

						let chatName = "";

						/*Search by chat name*/
						if (
							mChat &&
							mChat.getJoinRule() === "public" &&
							mChat.currentState.getStateEvents("m.room.name", "").length > 0
						) {
							chatName = mChat.currentState
								.getStateEvents("m.room.name", "")[0]
								?.getContent().name;
						}

						/*Filter chat that not reach search*/
						if (!chatName) {
							chatName = mChat.name;

							if (chatName[0] === "#") chatName = "";
						}

						const uString = (chatName + userNameString).toLowerCase();
						let point = 0;

						if (uString.includes(this.matches.value)) {
							point = this.matches.value.length / uString.length;
						}

						return {
							chat: mChat,
							point,
						};
					}),
					(cc) => cc.point
				);

				mc = _.sortBy(mc, (cc) => cc.point).reverse();
				chats = mc.map((c) => c.chat.summary);
			}

			return chats;
		},

		filteredContacts() {
			/*Add my contacts*/
			this.contacts = _.filter(this.contactsMap, (contact) => {
				return contact.name
					.toLowerCase()
					.includes(this.matches.value.toLowerCase());
			});
			
			return this.contacts;
		},

		filteredOther() {
			/*Add bastyon contacts*/
			if (this.matches.value.length > 3 && this.searchChanged) {
				this.core.user.searchContacts(this.matches.value).then((users) => {
					this.users = _.filter(users || [], (u) => {
						/*Exclude myself and users from contacts*/
						return (
							u.id !== this.core.user.userinfo.id &&
							!_.filter(this.contactsMap, (f) => f.id === u.id).length
						);
					});
				});

				this.searchChanged = false;
			}

			return this.users;
		},
	},

	methods: {
		getList(list) {
			return (
				this[`filtered${list.charAt(0).toUpperCase() + list.slice(1)}`] || []
			);
		},

		loadList(list) {
			return this.getList(list);
		},

		itemClick(item, section = {}) {
			if (this.mode) {
				this.$store.commit("active", true);
				this.$store.commit("blockactive", { value: true, item: "main" });
				this.$store.commit("setiteraction", true);

				return;
			}

			

			if (section.action == "navigateToProfile") {
				this.navigateToProfile(item.id, item);
			}

			if (
				section.action == "navigateToRoom" ||
				section.action == "navigateToRoomFromMsg"
			) {
				var chat = item;

				if (section.action == "navigateToRoomFromMsg") chat = item.chat;

				if (this.share) {
					var _share = this.share;

					this.$store.commit("SHARE", null);

					this.$store.commit("icon", {
						icon: "loading",
						message: "",
						manual: true,
					});

					this.core.mtrx
						.shareInChat(chat.roomId, _share)
						.then((r) => {
							this.$store.commit("icon", {
								icon: "success",
								message: "",
							});

							this.$router
								.push(_share.route || "chat?id=" + chat.roomId)
								.catch((e) => {});
						})
						.catch((e) => {
							console.error(e);

							this.$store.commit("icon", {
								icon: "error",
								message: "",
							});

							if (_share.route) {
								this.$router.push(_share.route).catch((e) => {});
							}
						});
				} else {
					this.$router.push("chat?id=" + chat.roomId).catch((e) => {});
				}

				;
			}
			if (!section.keepMatches) {
				this.matches.clear();
			}
			
		},
		navigateToProfile(id, contact) {
			if (this.mode === "Select") {
				this.select(contact);
			} else {
				this.$router.push({ path: `/contact?id=${id}` }).catch((e) => {});
			}
		},
		
		prepareSearch() {
			_.each(this.chats, (chat, i) => {
				if (i !== 11) return;
				const room = this.core.mtrx.client.getRoom(chat.roomId);
				console.log(room)
				return;
				
				if (!chat.prepareSearch) {
					this.searchHandlers[chat.roomId] = {
						events: [],
						prepareSearch: () => {
							/*Recursively load all events*/
							const
								tl = room.getLiveTimeline(),
								ts = tl.getTimelineSet(),
								timeline = new this.core.mtrx.sdk.TimelineWindow(
									this.core.mtrx.client,
									ts
								),
								onlyText = (e) => {
									return _.filter(e, f => {
										return (f.event.decrypted || f.event.content)?.msgtype === 'm.text';
									});
								};
							
							this.searchHandlers[chat.roomId].searchControl = this.core.mtrx.kit.paginateAllEvents({
								room: room,
								timeline: timeline,
								count: 10,
								offset: true,
								tick: (e) => {
									if (e) {
										this.searchHandlers[chat.roomId].events = this.searchHandlers[chat.roomId].events.concat(onlyText(e));
									}
									
									this.searchHandlers[chat.roomId].search();
								}
							});
						},
						
						search: () => {
							const handler = this.searchHandlers[chat.roomId];
							
							if (!handler?.events.length) {
								return handler.prepareSearch();
							}
							
							if (this.matches.value?.length < 2) {
								handler.searchControl?.pause();
							} else if (handler.searchControl?.isPaused()) {
								handler.searchControl?.resume();
							}
							
							const matches = _.filter(handler.events, f => {
								return (f.event?.decrypted || f.event.content)?.body
									.toLowerCase()
									.includes(this.matches?.value);
							});
							
							if (matches.length) {
								console.log(matches)
								handler.searchControl?.pause();
								this.matches.append({
									chat: chat,
									match: matches[0] || null
								});
							}
						}
					}
				}
			});
		},
		
		search() {
			_.each(this.chats, (chat) => this.searchHandlers[chat.roomId]?.search());
		}
	},

	watch: {
		"matches.value": function () {
			this.search();
			this.searchChanged = true;
			this.users = [];
		},
	},
	
	mounted() {
		this.prepareSearch();
		if (this.matches.value) this.search();
	}
};
