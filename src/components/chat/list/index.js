import { mapState } from "vuex";

import events from "@/components/events/list/index.vue";
import time from "../../chats/assets/time";
import f from "@/application/functions";

export default {
	name: "chatList",
	props: {
		chat: Object,
		filterType: String,
		error: [Object, Error, String],
		selectedMessages: {
			type: Array,
			default: () => {
				return [];
			},
		},
		searchresults : null
	},

	components: {
		events,
	},
	
	inject: ['streamMode'],

	data: function () {
		return {
			encryptedEvents: [],
			loading: false,
			scrolling: false,
			scrollingTo: 0,
			cancelNextScroll: false,
			timeline: null,
			lastEvent: {},
			scrollType: String,
			esize: {},
			p_b: false,
			p_f: false,

			updateTimeout: null,
			updateInterval: null,
			events: [],
			firstPaginate: true,
			readPromise : null
		};
	},

	mounted: function () {
		this.init();

		if (this.chat) {
			// this.readAll()
		}
	},

	watch: {
		//$route: 'getdata'

		active: function () {
			// if(this.minimized && !this.active){
			//   this.scrollToNew(0)
			// }
			// if(this.minimized && this.active){
			//   this.readAll();
			// }
		},
	},
	computed: mapState({
		lloading: function () {
			return this.loading || this["p_f"] || this["p_b"];
		},

		auth: (state) => state.auth,

		settings_read: (state) => !state.dontreadreceipts,

		eventsTypes: function () {
			var types = {
				"m.room.message": true,
				"p.room.encrypt.message": true,
				"p.room.": true,
				"m.room.image": true,
				"m.room.audio": true,
				"m.room.file": true,
				"m.call.invite": true,
				"m.room.request_calls_access": true,
				"m.call.hangup": true,
				"m.call.reject": true,
				"m.fully_read": true,
			};

			if (
				_.toArray((this.chat && this.chat.currentState.members) || {}).length >
				2
			) {
				types["m.room.member"] = true;
				types["m.room.power_levels"] = true;
			}

			return types;
		},

		pocketnet: (state) => state.pocketnet,
		minimized: (state) => state.minimized,
		active: (state) => state.active,

		bin: function (state) {
			return state.pocketnet;
		},
	}),

	created() {
		this.updateInterval = setInterval(this.update, 300);
	},
	destroyed() {
		if (this.timeline) {
			this.timeline.unpaginate(this.timeline._eventCount, true);
		}

		clearInterval(this.updateInterval);
	},

	methods: {
		
		editingEvent: function ({ event, text }) {
			this.$emit("editingEvent", { event, text });
		},
		replyEvent: function ({ event }) {
			this.$emit("replyEvent", { event });
		},

		removeEvent: function (event) {
			this.chat.getLiveTimeline().removeEvent(event.event.event_id);
		},
		wh: function () {
			if (this.esize.clientHeight) return this.esize.clientHeight;
		},
		getEvents: function () {
			var events = this.timeline.getEvents();

			var lastCallAccess = events
				.filter((e) => {
					return e.event.type === "m.room.request_calls_access";
				})
				.pop();

			events = _.filter(events, (e) => {
				var type = e.event.type;

				if (e.localRedactionEvent() || e.getRedactionEvent()) {
					return;
				}
				if (e.event.type === "m.room.request_calls_access") {
					if (e.event.event_id === lastCallAccess.event.event_id) {
						if (e.event.content.accepted !== null) {
							return false;
						} else {
							if (this.core.mtrx.me(e.event.sender)) {
								return false;
							} else {
								return true;
							}
						}
					} else {
						return false;
					}
				}

				if (
					e.event.type === "m.room.power_levels" &&
					Object.keys(e.event.content.users).length === 1
				) {
					return;
				}
				if (
					this.chat.currentState.getMembers().length <= 2 &&
					e.event.type === "m.room.member" &&
					"m.room.power_levels"
				) {
					return;
				}
				return !this.eventsTypes || this.eventsTypes[type];
			});

			events = events.reverse();

			this.relations(events);

			events = _.sortBy(events, function (e) {
				return e.replacingEventDate() || e.getDate() || Infinity;
			});

			events = events.reverse();

			events = _.uniq(events, (e) => {
				return this.core.mtrx.clearEventId(e) || f.makeid();
			});

			events = _.sortBy(events, function (e) {
				return e.getDate() || Infinity;
			});

			events = events.reverse();

			this.$emit("getEvents", events);
			// events = _.filter(events, function (e) {
			//   return e.ty
			// })

			return events;
		},

		getEventsAndEncrypt: function () {
			var events = this.getEvents();

			return Promise.all(
				_.map(events, (e) => {
					if (!this.chat.pcrypto) return Promise.resolve();

					if (e.event.decrypted) return Promise.resolve();

					var pr = null;
					var subtype = f.deep(e, "event.content.msgtype");

					//if(f.deep(e, 'event.content.msgtype') != 'm.encrypted') return Promise.resolve()

					var einfo =
						f.deep(e, "event.content.info.secrets") ||
						f.deep(e, "event.content.pbody.secrets");

					if (einfo) {
						if (subtype == "m.image") {
						}

						if (subtype == "m.audio") {
							pr = this.core.mtrx.getAudio(this.chat, e).catch((error) => {
								console.error(error);

								e.event.decrypted = {
									msgtype: "m.bad.encrypted",
								};
							});
						}

						
					} else {
						if (subtype == "m.audio") {
							pr = this.core.mtrx.getAudioUnencrypt(this.chat, e);
						}

						if (subtype == "m.encrypted") {

							pr = this.chat.pcrypto
								.decryptEvent(e.event)
								.then((d) => {
									e.event.decrypted = d;

									return Promise.resolve();
								})
								.catch((e) => {
									e.event.decrypted = {
										msgtype: "m.bad.encrypted",
									};

									return Promise.resolve();
								});
						}
					}

					if (!pr) return Promise.resolve();

					return pr.catch((e) => {
						return Promise.resolve();
					});
					
				})
			).then(() => {
				return Promise.resolve(events);
			});
		},

		relations: function (events) {
			var ts = this.timeline._timelineSet;

			_.each(events, (e) => {
				try {
					//if(!e.event.content.edited){
					var rt = ts.getRelationsForEvent(
						e.event.event_id,
						"m.replace",
						"m.room.message"
					);

					if (rt) {
						var last = rt.getLastReplacement();

						if (last) {
							e.event.content.body = last.event.content.body;
							e.event.content.edited = last.event.event_id;
							e.event.content.block = last.event.content.block;
							e.event.content.msgtype = last.event.content.msgtype;
							e.event.decrypted = last.event.decrypted;
						}
					}
				} catch (e) {
					console.error(e);
				}
			});
		},
		mediaTimelineSet: async function () {
			var filter = new this.core.mtrx.sdk.Filter(client.getUserId());

			filter.setDefinition({
				room: {
					timeline: {
						contains_url: true,
						types: ["m.room.message"],
					},
				},
			});

			filter.filterId = await this.core.mtrx.client.getOrCreateFilter(
				"FILTER_FILES_" + this.core.mtrx.client.credentials.userId,
				filter
			);

			return this.chat.getOrCreateFilteredTimelineSet(filter);
		},
		init: async function () {
			this.loading = true;
			this.firstPaginate = true;

			console.log('this.chat', this.chat)

			//this.chat.getTimelineForEvent('$FXUvcjIqcvDu0meLTnz-8plloZoNHLIYEb6WGQMWO3s')
			
			
			console.log('timeline', timeline)
			
			//this.chat.getTimelineForEvent('$FXUvcjIqcvDu0meLTnz-8plloZoNHLIYEb6WGQMWO3s')
			
			
			//this.chat.getLiveTimeline();

			var ts;

			if (this.filterType === "images") {
				this.scrollType = "custom";
				ts = await this.mediaTimelineSet();
			} else {

				var timeline = this.chat.getLiveTimeline();

				ts = timeline.getTimelineSet();
			}

			this.timeline = new this.core.mtrx.sdk.TimelineWindow(
				this.core.mtrx.client,
				ts
			);

			setTimeout(() => {
				this.timeline
					.load(/*null, (this.wh() || 600)*/)
					.then((r) => {
						return this.getEventsAndEncrypt();
					})
					.then((events) => {
						this.events = events;

						this.loading = false;

						setTimeout(() => {
							this.autoPaginateAll();
						}, 300);
					})
					.catch((e) => {
						this.loading = false;
					});
			}, 30);

			/*setTimeout(() => {
				this.paginateToEvent('$FXUvcjIqcvDu0meLTnz-8plloZoNHLIYEb6WGQMWO3s').then(event => {
					console.log("TOEVENT", event)
				})
			}, 1000)*/
		},

		paginateToEvent: function(event_id){
			var event = _.find(this.events, (e) => {
				return e.event.event_id == event_id
			})

			if (event){
				return Promise.resolve(event)
			}

			else{
				var promise = this.paginate('b')

				if (promise){
					return promise.then(() => {
						return this.paginateToEvent(event_id)
					}).catch(e => {
						console.error('EROR', e)
						if(!event) return Promise.resolve(null)
					})
				}

				else{
					if(!event) return Promise.resolve(null)
				}
			}
		},

		autoPaginate: function (direction) {
			if (this.needLoad(direction)) {
				var pr = this.paginate(direction)

				if (pr) pr.catch(e => {})
			}
		},

		paginate: function (direction, rnd) {
			//$(this.$el).find('.eventsflex')[0]

			if (!this.loading && this.timeline && !this["p_" + direction]) {
				if (this.timeline.canPaginate(direction) || rnd) {
					this["p_" + direction] = true;

					let count = /*this.firstPaginate ? 24 : */ 20;

					var error = null

					return this.timeline
						.paginate(direction, count)
						.then((e) => {
							return Promise.resolve();
						})
						.catch((e) => {
							error = e
							return Promise.resolve();
						})
						.then((r) => {
							return this.getEventsAndEncrypt();
						})
						.then((events) => {
							this.events = events;

							this.firstPaginate = false;

							this["p_" + direction] = false;
						}).catch((e) => {
							if(e) return Promise.reject(e)
						})

					
				} else {
					this.readAll();
				}
			}
		},

		autoPaginateAll: function () {
			if (this.filterType === "images") {
				this.autoPaginate("b");
			} else {
				this.autoPaginate("b");
				this.autoPaginate("f");
			}
		},

		needLoad: function (direction) {
			var r = false;

			var scrollHeight = this.esize.scrollHeight || 0;
			var scrollTop = this.esize.scrollTop || 0;
			var clientHeight = Math.max(this.esize.clientHeight || 0, 800);

			if (direction == "b") {
				var safespace = clientHeight;

				if (scrollHeight - scrollTop < clientHeight + safespace) r = true;
			} else {
				if (scrollTop < clientHeight) r = true;
			}

			return r;
		},

		readEvent: function (event) {
			var byme = this.core.mtrx.me(event.event.sender);

			if (byme) {
				return;
			}
			this.core.mtrx.client.sendReadReceipt(event);
		},

		readFirst: function () {
			var events = this.timeline.getEvents();

			this.readEvent(events[0]);
		},

		readLast: function () {
			var events = this.timeline.getEvents();

			console.log(events);
			this.readEvent(events[events.length - 1]);
		},

		readEvents: function (events) {
			_.each(events, (e) => {
				this.readEvent(e);
			});
		},
		readOne() {
			this.core.mtrx
				.client(this.chat.timeline[this.chat.timeline.length - 1])
				.then((r) => {
					return r;
				});
		},
		debouncedReadAll : _.debounce(function(){

			if (!this.chat) return;
			if (this.readPromise) return

			var i = this.chat.timeline.length - 1;
			var event = null;

			console.log('debouncedReadAll', this.chat.timeline)

			event = this.chat.timeline[i]

			/*while (i >= 0 && !event) {
				var e = this.chat.timeline[i];

				var type = (e.event.type || "")

				if (type.indexOf('m.call') > -1){
					if(type.indexOf('candidates') > -1 ) {
						return
					}
				}

				if(e.readed) return

				if (!this.core.mtrx.me(e.sender.userId)) {

					if(!this.core.mtrx.isReaded(e)){
						event = e;
					}
					
				}
				else{
					
				}

				i--;
			}*/

			console.log('event', event)

			if (event) {

				if (event.readError){
					return
				}

				var eid = event.event.event_id

				this.readPromise = this.streamMode || this.core.mtrx.client
					.setRoomReadMarkers(this.chat.currentState.roomId, eid, event, {
						hidden: !this.settings_read ? true : false,
					}).then((r) => {
						event.readed = true
						return r;
					}).catch(e => {
						console.error(e)
						event.readError = e	
					})
					.finally(() => {
						this.readPromise = null
					});
			}
		}, 100),
		readAll: function () {
			if (
				document.hasFocus() &&
				(!this.pocketnet || this.active) &&
				!this.core.hiddenInParent &&
				this.chat &&
				this.chat.getJoinedMemberCount() > 0 &&
				this.chat.getUnreadNotificationCount() !== 0
			){
				this.debouncedReadAll()
			}
				
		},

		//////////////

		scrollE: function (size) {
			this.updatedSize(size);
			this.$emit("scroll", size);
		},

		updatedSize: function (size) {
			this.esize = size;
		},

		update: function (e) {
			if (!this.scrolling) {
				this.autoPaginateAll();
			} else {
				// e.preventDefault()
			}
		},

		scrollToNew: function (s) {
			this.scrolling = true;

			this.$refs.eventslist.scrollToNew(s);

			this.scrolling = false;
		},

		imageGallery: function (e) {
			this.$emit("eventImage", e);
		},

		menuIsVisibleHandler: function (isVisible) {
			this.$emit("menuIsVisible", isVisible);
		},

		scrollToEvent: function(reference){

			f.pretry(() => {
				return (!this.loading && this.timeline && !this["p_b"])
			}).then(() => {

				this.$store.state.globalpreloader = true;
				
				return this.paginateToEvent(reference.event.event_id)
			}).then(event => {

				console.log('event', event)

				if (event){
					setTimeout(() => {
						this.$refs.eventslist.scrollToEvent(event)
					}, 300)
					
				}
			}).catch(e => {
				console.error(e)
			}).finally(() => {
				this.$store.state.globalpreloader = false;

			})
		}

	
	},
};
