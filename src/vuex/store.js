import Vue from "vue";
import Vuex from "vuex";
import f from "@/application/functions.js";

Vue.use(Vuex);

var themes = {
	white: "White",
	black: "Dark",
	classic: "Classic",
};

var mex = {
	theme: function (state, value) {
		if (themes[value]) {
			state.theme = value;
		}
	},
};

var activetimeout = null;

var store = new Vuex.Store({
	state: {
		contacts: {},
		contactsFromMatrix: {},
		contactsMap: {},
		chats: [],
		prechats: [],
		chatsMap: {},
		events: {},
		users: {},
		typing: {},
		icon: null,
		loading: false,
		online: true,
		unauthorized: false,
		theme: "white",
		themes: themes,
		signedUpUsers: [],
		pocketnet: "",
		mobile: "",
		voiceMessagesEnabled: "",
		isCallsEnabled: false,
		currentPlayingVoiceMessage: null,
		current_user: {},
		minimized: true,
		active: false,
		activeBlock: {},
		globalpreloader: false,
		allnotifications: 0,
		pocketteammessages: [],
		readedteammessages: {},
		chatsready: false,
		autohide: false,
		iteraction: false,
		roomMembes: [],
		gallery: null,
		share: null,
		contact: null,
		connect: null,
		joinroom: null,
		chatusers: {},
		force: {},
		wasunhidden: false,
		hiddenInParent: false,
		hideOptimization: false,
		modalShowed: null,
		modals: [],
		menu: null,
		pinchat: false,
		lastroom: null,
		dontreadreceipts: false,
		donotdisturb: false,
		voicerecording: false,
		deletedrooms: {},
		pkoindisabled: false,
		isCallsActive: null,
		readreciepts : {},
		//share : {url : 'https://yandex.ru/'} //null
	},
	getters: {
		getUser: (state) => {
			return state.user;
		},
		getConnection: (state) => {
			return state.localMatrixStore;
		},

		getSignedUpUsers: (state) => {
			return state.signedUpUsers;
		},
	},
	mutations: {
		SET_CALL(state, isActive) {
			state.isCallsActive = isActive;
		},
		CLEAR_CALL(state) {
			state.isCallsActive = null;
		},
		SET_CURRENT_PLAYING_VOICE_MESSAGE(state, message) {
			state.currentPlayingVoiceMessage = message;
		},
		setUser(state, userData) {
			state.current_user = userData || {};
		},

		clearall(state) {
			state.contacts = {};
			state.contactsFromMatrix = {};
			state.contactsMap = {};
			state.chats = [];
			state.prechats = [];
			state.chatsMap = {};
			state.events = {};
			state.users = {};
			state.typing = {};
			state.icon = null;
			state.loading = false;
			state.online = true;
			state.unauthorized = false;
			state.signedUpUsers = [];
			/*state.pocketnet = ''*/
			state.current_user = {};
			state.minimized = false;
			state.active = false;
			state.activeBlock = {};
			state.globalpreloader = false;
			state.allnotifications = 0;
			state.pocketteammessages = [];
			state.readedteammessages = {};
			state.chatsready = false;
			state.autohide = false;
			state.gallery = null;
			state.modalShowed = null;
			state.menu = null;
			state.pinchat = false;
			state.dontreadreceipts = false;
			state.lastroom = null;
			state.voicerecording = false;
			state.readreciepts = {}

			// state.share = null

			if (state.mobile) {
				state.active = false;
				state.iteraction = false;
				state.minimized = false;
				return;
			} else state.minimized = true;

			if (activetimeout) {
				clearTimeout(activetimeout);
				activetimeout = null;
			}
		},

		blockactive(state, a) {
			if (a.value) Vue.set(state.activeBlock, a.item, a.value);
			else Vue.delete(state.activeBlock, a.item, a.value);
		},

		globalpreloader: function (state, value) {
			state.globalpreloader = value;
		},

		icon(state, value) {
			state.icon = value;

			var mv = f.deep(window, "window.POCKETNETINSTANCE.mobile.vibration");

			if (mv) {
				mv.small();
			}
		},

		pkoindisabled(state, value) {
			state.pkoindisabled = value && value == "true" ? true : false;
		},

		wasunhidden(state, value) {
			state.wasunhidden = true;
		},

		hiddenInParent(state, value) {
			state.hiddenInParent = value;
		},

		hideOptimization(state, value) {
			state.hideOptimization = value;
		},

		pinchat(state, value) {
			state.pinchat = value;
			localStorage["pinchat"] = value ? true : "";
		},

		dontreadreceipts(state, value) {
			state.dontreadreceipts = value;

			localStorage["dontreadreceipts"] = value ? true : "";
		},

		SET_LAST_ROOM(state, value) {
			if (!value) state.lastroom = null;
			else
				state.lastroom = {
					id: value,
					time: new Date(),
				};
		},

		active(state, value) {
			if (state.mobile) {
				state.active = false;
				state.iteraction = false;
				return;
			}

			var time = 50;

			if (!value) time = 1000;

			activetimeout = f.slowMade(
				() => {
					if (!value) {
						if (!_.isEmpty(state.activeBlock)) {
							return;
						}

						state.iteraction = false;
					}

					state.active = value;

					if (!state.active) {
						state.share = null;
						delete state.activeBlock.share;
					}
				},
				activetimeout,
				time
			);
		},

		setiteraction(state, value) {
			state.iteraction = value;
		},

		maximize(state, route) {
			state.minimized = false;
		},

		minimize(state, v) {
			if (state.mobile) {
				state.minimized = false;
				return;
			}

			if (state.minimized) {
				state.activeBlock = {};
				state.active = false;
			}

			console.log("??????????????????")

			state.minimized = true;
		},

		setmodal(state, v) {
			state.modalShowed = v;
		},

		setPocketnet(state, pocketnet) {
			state.pocketnet = pocketnet;
		},
		setMobile(state, mobile) {
			state.mobile = mobile;
		},

		setVoiceMessagesEnabled(state, voiceMessagesEnabled) {
			state.voiceMessagesEnabled = voiceMessagesEnabled;
		},
		setCallsEnabled(state, isCallsEnabled) {
			state.isCallsEnabled = isCallsEnabled == 'true' ? true : false;
		},
		ls(state) {
			if (typeof localStorage.getItem("pinchat") != "undefined")
				state.pinchat = localStorage.getItem("pinchat") ? true : false;

			if (typeof localStorage.getItem("dontreadreceipts") != "undefined")
				state.dontreadreceipts = localStorage.getItem("dontreadreceipts")
					? true
					: false;
		},

		init(state) {
			mex.theme(state, localStorage.getItem("theme") || "black");
		},

		SEARCH_BY_MESSAGES(state, process){

		},

		ALL_NOTIFICATIONS_COUNT(state, rooms) {
			var n = new Date();

			var count = _.filter(rooms, (room) => {
				if (room._selfMembership === "invite") {
					var users = store._vm.core.mtrx.anotherChatUsers(room);

					if (
						users.length == 1 &&
						store._vm.core.mtrx.blockeduser(users[0].userId)
					) {
						return false;
					}

					if (f.date.addseconds(new Date(room.summary.lastModified), 86400) > n)
						return true;
				}
			});

			state.allnotifications =
				_.reduce(
					rooms,
					(s, chat) => {
						return s + (chat.getUnreadNotificationCount() || 0);
					},
					0
				) + count.length;

			if (state.chats.length <= 3) {
				// Count notifications from pocketnet team room
				var pocketMessages = _.filter(state.pocketteammessages, function (m) {
					return !state.readedteammessages[m.id];
				}).length;
				state.allnotifications += pocketMessages;
			}

			var external =
				f.deep(store, "_vm.core.external.clbks.ALL_NOTIFICATIONS_COUNT") || {};

			_.each(external, function (e) {
				e(state.allnotifications);
			});

			return state.allnotifications;
		},

		SET_CHATS_READY(state, v) {
			state.chatsready = v;
		},

		SET_PRECHATS_TO_STORE(state, chats) {
			state.prechats = chats;
		},

		SET_CHAT_TO_FORCE(state, id) {
			Vue.set(state.force, id, true);
		},

		SET_CHATS_TO_STORE(state, chats) {
			state.chats = chats;

			var chatsMap = {};

			_.each(chats, (chat) => {
				var aid = chat.info.title.replace("#", "");

				if (!state.chatsMap[chat.roomId] || state.force[chat.roomId]) {
					Vue.set(state.chatsMap, chat.roomId, chat);
				}

				if (!state.chatsMap[aid] || state.force[chat.roomId]) {
					Vue.set(state.chatsMap, aid, chat);
				}

				chatsMap[chat.roomId] = chat;
				chatsMap[chat.info.title.replace("#", "")] = chat;

				Vue.delete(state.force, chat.roomId);
			});

			_.each(state.chatsMap, function (c, id) {
				if (!chatsMap[id]) Vue.delete(state.chatsMap, id);
			});

			//state.chatsMap = chatsMap;
		},
		SET_READ_TO_STORE(state, readreciepts) {
			_.each(readreciepts, (r, chatid) => {

				if((!state.readreciepts[chatid] && !r) || (!state.readreciepts[chatid] && r) || (state.readreciepts[chatid] && r && state.readreciepts[chatid].ts != r.ts)) {
					Vue.set(state.readreciepts, chatid, r);
				}

			})

		},

		SET_EVENTS_TO_STORE(state, events) {
			//state.events = events

			_.each(events, function (ev, k) {
				var timeline = [];

				_.each(ev.timeline, function (__e) {
					var e = __e.event;

					var _e = {
						event: {
							content: _.clone(e.content),
							event_id: e.event_id,
							origin_server_ts: e.origin_server_ts,
							room_id: e.room_id,
							sender: e.sender,
							state_key: e.state_key,
							type: e.type,
						},

						get: () => __e,
					};

					timeline.push(_e);
				});

				if(timeline.length && state.events[k] && state.events[k].timeline && state.events[k].timeline[0] && 
					(state.events[k].timeline[0].event.event_id == timeline[0].event.event_id)) {
						return
					}

				Vue.set(state.events, k, { timeline });
			});
		},

		SET_TYPING_TO_STORE(state, data) {
			state.typing[data.room] || (state.typing[data.room] = {});
			state.typing[data.room][data.name] = data.typing;

			function allTrue(data) {
				for (var o in data) if (!data[o]) return false;

				return true;
			}

			allTrue(data.typing);
		},
		DELETE_ROOM(state, roomid) {
			Vue.set(state.deletedrooms, roomid, true);
		},
		SET_CONTACTS(state, v) {
			var mp = {};

			_.each(v, function (c) {
				mp[c.id] = c;
			});

			state.contacts = mp;

			store.commit("SET_CONTACTS_MAP");
		},

		SET_CHATS_USERS(state, v) {
			_.each(v || {}, function (u, i) {
				if (!state.chatusers[i] || !_.isEqual(state.chatusers[i], u)) {
					Vue.set(state.chatusers, i, u);
				}
			});

			//state.chatusers = v || {}
		},

		SET_CONTACTS_FROM_MATRIX(state, v) {
			var mp = {};

			_.each(v, function (c) {
				if (
					f.getmatrixid(c.id) !=
					(store._vm.core.user.userinfo && store._vm.core.user.userinfo.id)
				)
					mp[c.id] = c;
			});

			state.contactsFromMatrix = mp;

			store.commit("SET_CONTACTS_MAP");
		},

		SET_CONTACTS_MAP(state) {
			var contactsMap = {};

			_.each(state.contacts, function (contact) {
				contactsMap[contact.id] = contact;
			});

			_.each(state.contactsFromMatrix, function (contact) {
				contactsMap[contact.id] = contact;
			});

			state.contactsMap = contactsMap;
		},

		SET_UNAUTHORIZED(state, v) {
			state.unauthorized = v;
		},

		SET_USERINFO(state, v) {
			if (!v.info) return;

			if (v.reload || !state.users[v.info.id])
				Vue.set(state.users, v.info.id, v.info);
		},

		SET_CURRENT_ROOM(state, v) {
			state.currentRoom = v;
		},

		CLEAR_USERSINFO(state, v) {
			state.users = {};
		},

		OPEN_MODAL(state, modal) {

			if(modal.one && _.find(state.modals, (m) => {
				return m.id == modal.id
			})) return

			state.modals.push(modal);

		
		},

		CLOSE_MODAL(state, id) {
			state.modals = _.filter(state.modals, function (m) {
				return m.id != id
			})

		},

		GALLERY(state, v) {
			state.gallery = v || null;

			var fu = null;

			if (v) {
				fu = f.deep(
					window,
					"window.POCKETNETINSTANCE.mobile.statusbar.gallerybackground"
				);
			} else {
				fu = f.deep(
					window,
					"window.POCKETNETINSTANCE.mobile.statusbar.background"
				);
			}

			if (fu) {
				fu();
			}
		},

		SHARE(state, v) {
			state.share = v || null;

			if (!state.mobile) {
				state.activeBlock.share = true;
				state.active = true;
			}
		},

		CONNECT(state, v) {
			state.connect = v;
		},

		JOINROOM(state, v) {
			state.joinroom = v;
		},

		CONTACT(state, v) {
			state.contact = v || null;
		},

		theme(state, value) {
			mex.theme(state, value);
		},

		SET_POCKETTEAMMESSAGES(state, v) {
			state.pocketteammessages = v;
			// Check local storage
			var readedMessagesStr = localStorage.getItem("readedpocketteammessages");
			if (readedMessagesStr) {
				try {
					var readedMessages = JSON.parse(readedMessagesStr);
					state.readedteammessages = readedMessages;
				} catch (e) {
					localStorage.removeItem("readedpocketteammessages");
					state.readedteammessages = {};
				}
			}
		},

		SET_READEDTEAMMESSAGES(state, v) {
			if (v && v.length > 0) {
				var readedMessages = {};
				_.each(v, function (m) {
					readedMessages[m.id] = true;
				});
				state.readedteammessages = readedMessages;
				// Update local storage
				localStorage.setItem(
					"readedpocketteammessages",
					JSON.stringify(readedMessages)
				);
			}
		},

		SET_MENU(state, v) {
			state.menu = v;
		},

		SET_VOICERECORDING(state, v) {
			state.voicerecording = v;
		},
	},
	actions: {
		SET_CHAT_MEMBERS({ commit }, chat) {},
		TYPING_EVENT({ commit }, member) {
			let room = member.roomId;
			let name = member.name;
			let data = { room, name, typing: member.typing };
			commit("SET_TYPING_TO_STORE", data);
		},
		CHAT_MEMBERS({ commit }) {},
		SHOW_GALLERY_FROMEVENTS({ commit, dispatch }, { events, event }) {
			var images = [],
				index = 0;

			var encrypted = function (event) {
				return f.deep(event, "event.content.info.secrets") ? true : false;
			};

			_.each(events, (event) => {
				if (event.event.content.msgtype === "m.image") {
					var url = event.event.content.url;

					if (encrypted(event)) {
						url = event.event.decryptedImage;
					}

					images.push({
						src: url,
						w: event.event.content.info.w || 500,
						h: event.event.content.info.h || 500,
						eventId: event.event.event_id,
					});
				}
			});

			images = _.filter(images, function (i) {
				return i.src;
			});

			index = images
				.map(function (e) {
					return e.eventId;
				})
				.indexOf(event.event.event_id);

			dispatch("SHOW_GALLERY", { images, index });
		},
		SHOW_GALLERY({ commit }, { images, index }) {
			if (!index) index = 0;

			if (!images) images = [];

			if (images.length) {
				commit("GALLERY", {
					images: images,
					index: index,
				});
			} else {
				commit("GALLERY", null);
			}
		},

		RELOAD_CHAT_USERS({ commit }, m_chats) {
			return store._vm.core.mtrx.kit
				.usersInfoForChats(m_chats, true)
				.then((i) => {
					commit(
						"SET_CHATS_USERS",
						store._vm.core.mtrx.kit.usersFromChats(m_chats)
					);
					return Promise.resolve();
				})
				.catch((e) => {
					return Promise.resolve();
				});
		},

		FETCH_CHATS({ commit }) {
			var m_chats = f.deep(store._vm, "core.mtrx.store.rooms") || {};

			var id = store._vm.core.user.myMatrixId();

			var chats = _.map(m_chats, function (r) {
				if (r.getLastActiveTimestamp() === -9007199254740991) {
					if (r.getMember(id)) {
						r.summary.lastModified =
							r.getMember(id).events.member.event.origin_server_ts;
					}
				} else {
					r.summary.lastModified = r.getLastActiveTimestamp();
				}

				r.summary.key = r.summary.roomId + ':' + r.summary.lastModified

				return r.summary;
			});

			commit("SET_PRECHATS_TO_STORE", chats);

			return store._vm.core.mtrx.kit.allchatmembers(m_chats).then((r) => {
				commit("SET_CHATS_TO_STORE", chats);
				commit(
					"SET_CHATS_USERS",
					store._vm.core.mtrx.kit.usersFromChats(m_chats)
				);

				return store._vm.core.mtrx.kit.fillContacts(m_chats);
			});

		},

		FETCH_EVENTS({ commit }) {
			var m_chats = f.deep(store._vm, "core.mtrx.store.rooms") || {};

			var events = {};
			var readreciepts = {}

			_.each(m_chats, function (chat) {
				events[chat.roomId] = {};

				var timeline = _.first([].concat(
					chat.timeline,
					chat.currentState.getStateEvents("m.room.member")
				).reverse(), 100);

				//console.log(chat.summary.info.title, chat.timeline)

				var members = chat.currentState.getMembers();

				var ts = chat.getLiveTimeline()._eventTimelineSet;

				timeline = _.filter(timeline, (e, i) => {
					if (
						members.length <= 2 &&
						(e.event.type === "m.room.power_levels" /*||
							(e.event.type === "m.room.member" &&
								e.event.content.membership !== "invite")*/)
					) {
						return false;
					}
					if (e.event.type === "m.room.redaction") {
						return false;
					}
					if (e.event.type === "m.room.callsEnabled") {
						return false;
					}

					if (e.event.type === "m.call.candidates") {
						return false;
					}

					if (e.event.type === "m.room.request_calls_access") {
						if (e.event.content.accepted !== undefined) {
							return false;
						} else {
							if (store._vm.core.mtrx.me(e.event.sender)) {
								return false;
							} else {
								return true;
							}
						}
					}

					return !(
						e.event.content["m.relates_to"] &&
						e.event.content["m.relates_to"]["rel_type"] === "m.replace"
					);
				})

				timeline = _.sortBy(timeline, function (event) {
					return -event.event.origin_server_ts
				});


				var lastread = null
				
				_.find(timeline, (event) => {
					var reciepts = chat.getReceiptsForEvent(event)

					var lastreadr2 = _.find(reciepts, (reciept) => {
						var m = store._vm.core.mtrx.me(reciept.userId);

						return reciept.type == "m.read" && !m;
					})
					

					if (lastreadr2){
						lastread = lastreadr2
						return true
					}
				})

				if (lastread){
					readreciepts[chat.roomId] = {
						ts : lastread.data.ts,
						ev : _.find(timeline, (event) => {
							return event.event.origin_server_ts < lastread.data.ts
						})
					}

					
				}
				else{
					readreciepts[chat.roomId] = null
				}

				var e = timeline[0]

				if (e){

					var rt = ts.getRelationsForEvent(
						e.event.event_id,
						"m.replace",
						"m.room.message"
					);
	
					if (rt) {
						var last = rt.getLastReplacement();
	
						if (last) {
							e = last
						}
					}


					events[chat.roomId].timeline = [e];
				}
				else{
					events[chat.roomId].timeline = []
				}

			});

			commit("SET_EVENTS_TO_STORE", events);
			commit("SET_READ_TO_STORE", readreciepts);

		},
	},
});

export default store;
