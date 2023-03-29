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
		search : String,
		mode: {
			default: "",
			type: String,
		},
		
	},

	data: function () {
		return {
			loading: false,
			loadedUsers : {},
			loadedingUsers : {},
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
			processresult : null,
			searchChanged: true,
			processing : false
		};
	},

	beforeDestroy : function(){
		if(this.process) this.process.stop()
	},

	computed: {
		...mapState(["contactsMap", "share"]),

		filteredListsEmpty : function(){
			return _.reduce(this.filteredLists, (m, i) => {
				return m + i.items.length
			}, 0) == 0 ? true : false
		},

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
			var expandedResults = []

			if (this.search && this.processresult) {

				_.each(this.processresult.results, (results, roomId) => {
					var chat = _.find(chats, (chat) => {
						return chat.roomId == roomId
					})

					if(chat){
						_.each(results, (e) => {
							expandedResults.push({
								chat,
								messages : [e]
							})
						})
					}
					
					
				})

			}

			return expandedResults

		},

		filteredChats() {
			let chats = this.chats;

			if (this.search) {
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

						if (uString.includes(this.search)) {
							point = this.search.length / uString.length;
						}

						return {
							chat: mChat,
							point,
						};
					}),
					(cc) => cc.point
				);

				mc = _.sortBy(mc, (cc) => cc.point).reverse();
				chats = mc
					/*.filter((c) => {
						
						return !_.filter(this.contacts, (u) =>
							c.chat.tetatet &&
							Object.keys(c.chat.currentState.members || {}).find((f) => f.includes(u.id))
						).length;
					})*/
					.map((c) => c.chat.summary);
			}

			return chats;
		},

		filteredContacts() {

			if(this.share) return []
			/*Add my contacts*/
			this.contacts = _.filter(this.contactsMap, (contact) => {
				return contact.name
					.toLowerCase()
					.includes(this.search.toLowerCase());
			});
			
			return this.contacts;
		},

		filteredOther() {
			/*Add bastyon contacts*/
			this.users = _.filter(this.loadedUsers[this.search] || [], (u) => {
				/*Exclude myself and users from contacts*/
				return (
					u.id !== this.core.user.userinfo.id &&
					!_.filter(this.contactsMap, (f) => f.id === u.id).length
				);
			});

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
				section.action == "navigateToRoom"
			) {
				var chat = item;

				if (this.share) {
					var _share = this.share;

					this.$store.commit("SHARE", null);

					this.$store.commit("icon", {
						icon: "loading",
						message: "",
						manual: true,
					});

					console.log("_share", _share)

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
				};
			}

			if (section.action == "navigateToRoomFromMsg") {
				chat = item.chat;
				var e = item.messages[0]
				this.$router.push("chat?id=" + chat.roomId + '&process=' + this.processresult.id + '&search=' + this.processresult.text + '&toevent=' + e.event.event_id).catch((e) => {});
			}

			if (!section.keepMatches) {
				this.$emit('clearsearch')
			}
			
		},
		navigateToProfile(id, contact) {
			if (this.mode === "Select") {
				this.select(contact);
			} else {
				this.$router.push({ path: `/contact?id=${id}` }).catch((e) => {});
			}
		},

		initSearchProcess(){

			if (this.share) return

			if (this.search.length > 2){

				if (this.process){
					this.process.updateText(this.search)
					return 
				}

				this.processresult = null

				this.process = this.core.mtrx.searchEngine.execute(this.search, this.chats, ({results}) => {

					var evscount = _.reduce(results, (m, r, i) => {
						return m + r.length
					}, 0)

					if (evscount > 25) return true

				}, {
					all : (result) => {
						this.processresult = result
					}
				})

				this.processing = true
				this.process.execute().then(() => {

				}).catch(e => {
					console.error(e)
				}).finally(() => {

					this.processing = false
				})

			}

			else{
				if(this.process) this.process.stop()

				this.processresult = null
			}
		},

		loadNewUsers(){

			if(this.share) return

			try{

				var txt = (this.search || "").replace(/[^a-z0-9]/g,'')

				if (txt.length > 3) {

					this.loadedingUsers[this.search] = this.core.user.searchContacts(txt).then((users) => {

						this.$set(this.loadedUsers, this.search, users)

					}).catch((e) => {
						console.error(e)
					}).finally(() => {
						this.$delete(this.loadedingUsers, this.search)
					})

				}

			}catch(e){
				console.error(e)
			}

			
		}
	},

	watch: {
		search : {
			immediate : true,
			handler : function(){
				this.loadNewUsers()

				console.log('?????')

				if(!this.share)
					this.initSearchProcess()
			}
		}
		
	},
};
