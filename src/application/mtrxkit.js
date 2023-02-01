import f from "@/application/functions";

var cachestorage = {};

class MTRXKIT {
	constructor(core, p) {
		if (!p) p = {};

		this.core = core;
	}

	tetatetchat(m_chat) {
		if (!m_chat) return false;

		if (typeof m_chat.tetatet != "undefined") return m_chat.tetatet;

		var users = this.core.mtrx.chatUsersInfo(m_chat.roomId);
		var tt = false;

		if (users.length == 2) {
			tt = m_chat.name == "#" + this.tetatetid(users[0], users[1]);
		}
		if (users.length > 1) m_chat.tetatet = tt;

		return tt;
	}

	tetatetid(user1, user2) {
		var seed = 2;

		if (user1.id == user2.id) return null;

		var id = parseInt(user1.id, 16) * parseInt(user2.id, 16) * seed;

		if (cachestorage[id]) return cachestorage[id];

		var hash = f.sha224(id.toString()).toString("hex");

		cachestorage[id] = hash;

		return hash;
	}

	unknowngroupusers(m_chat) {
		return (
			m_chat &&
			m_chat._selfMembership === "invite" &&
			!m_chat.summary.members &&
			!this.tetatetchat(this.m_chat)
		);
	}

	usersFromChats(m_chats) {
		var users = {};

		_.each(m_chats, (chat) => {
			users[chat.roomId] = _.map(
				_.uniq(
					[].concat(
						_.toArray(chat.currentState.members),
						chat.summary.members || []
					),
					(r) => {
						return r.userId;
					}
				),
				function (r) {
					return {
						userId: f.getmatrixid(r.userId),
						membership: r.membership,
						powerLevel: r.powerLevel,
					};
				}
			);
		});

		return users;
	}

	prepareChat(m_chat) {
		return this.usersInfoForChatsStore([m_chat]).then(() => {
			return this.core.pcrypto.addroom(m_chat);
		});
	}

	fillContacts(m_chats) {
		m_chats = _.filter(m_chats, (ch) => {
			return ch._selfMembership == "join" && ch.name.length == 57;
		});

		return this.usersInfoForChatsStore(m_chats).then((i) => {
			this.core.store.commit(
				"SET_CONTACTS_FROM_MATRIX",
				_.filter(i, (m) => {
					return (
						!this.core.user.userinfo || m.id !== this.core.user.userinfo.id
					);
				})
			);
		});
	}

	usersInfoForChatsStore(m_chats, reload) {
		return this.usersInfoForChats(m_chats, reload)
			.then((i) => {
				this.core.store.commit("SET_CHATS_USERS", this.usersFromChats(m_chats));

				return Promise.resolve(i);
			})
			.catch((e) => {
				return Promise.resolve();
			});
	}

	allchatmembers(m_chats, reload, withinvite) {
		var members = [];
		var promises = [];


		if (withinvite) {
			var promises = _.map(m_chats, (chat) => {
				if (
					chat._selfMembership === "invite" &&
					(!chat.summary.members || reload) &&
					!chat.summary.membersloading
				) {
					chat.summary.membersloading = true;

					return chat
						._loadMembersFromServer()
						.then((r) => {


							chat.summary.membersloading = false;

							chat.summary.members = _.map(r, (user) => {
								return {
									name: f.getmatrixid(user.state_key),
									membership: user.content.membership,
									user: user,
									userId: user.state_key,
									powerLevel: user.content.powerLevel || 0,
								};
							});

							if (
								chat._selfMembership === "invite" &&
								this.core.user.userinfo
							) {
								if (
									!_.find(chat.summary.members, (m) => {
										return (
											m.userId ==
											this.core.user.matrixId(this.core.user.userinfo.id)
										);
									})
								) {
									chat.summary.members.push({
										name: this.core.user.userinfo.id,
										membership: "invite",
										user: this.core.user.userinfo,
										userId: this.core.user.matrixId(this.core.user.userinfo.id),
										powerLevel: 0,
									});
								}
							}

							return Promise.resolve();
						})
						.catch((e) => {
							console.log("ER", e)
							chat.summary.membersloading = false;

							return Promise.resolve();
						});
				}

				return Promise.resolve();
			});
		}

		return Promise.all(promises).then((r) => {
			_.each(m_chats, (chat) => {
				members = members.concat(
					_.toArray(chat.currentState.members),
					chat.summary.members || []
				);
			});

			members = _.uniq(members, function (m) {
				return m.userId;
			});

			

			return Promise.resolve(members);
		});
	}

	usersInfoForChats(m_chats, reload) {
		/// TODO FILTER CONTACTS

		return this.allchatmembers(m_chats, reload).then((members) => {
			return this.usersInfo(members, reload);
		});
	}

	usersInfoById(id) {
		var ids = [f.getmatrixid(id)];

		return this.core.user.usersInfo(ids, false).then((r) => {
			return Promise.resolve(r[0]);
		});
	}

	usersInfo(members, reload) {
		var ids = _.map(members, function (m) {
			return f.getmatrixid(m.userId);
		});

		ids = _.uniq(ids);

		return this.core.user.usersInfo(ids, false, reload);
	}

	groupId(users) {
		let id = [];
		let idForInviting = [];
		let self = this;

		users.forEach((user) => {
			idForInviting.push(this.core.user.matrixId(user.id));
		});

		users.forEach(function (user) {
			let idsForHash = parseInt(user.id, 16);

			id.push(idsForHash);
		});

		const groupNameId = id.reduce((product, n) => product * n, 1);
		const mGroupNamId = f.makeid(groupNameId);
		let hash = f.sha224(mGroupNamId.toString()).toString("hex");

		return { hash: hash, idForInviting: idForInviting };
	}

	groupIdLight(ids) {
		let id = [];
		let idForInviting = [];
		let self = this;

		var domains = [null];

		if (window.chatinvitedomains)
			domains = [].concat(domains, window.chatinvitedomains);

		_.each(domains, (domain) => {
			_.each(ids, (id) => {
				idForInviting.push(this.core.user.matrixId(id, domain));
			});
		});

		_.each(ids, (_id) => {
			let idsForHash = parseInt(_id, 16);

			id.push(idsForHash);
		});

		const groupNameId = id.reduce((product, n) => product * n, 1);
		const mGroupNamId = f.makeid(groupNameId);

		let hash = f.sha224(mGroupNamId.toString()).toString("hex");
		return { hash: hash, idForInviting: idForInviting };
	}

	chatIsPublic(chat) {
		var join_rules = chat.currentState.getStateEvents("m.room.join_rules");

		return _.find(join_rules, (v) => {
			return f.deep(v, "event.content.join_rule") == "public";
		})
			? true
			: false;
	}
	
	/**
	 * Getting all events recursively
	 *
	 * @param args {Object}
	 * @param args.chat {Room} - Chat room
	 * @param args.timeline {TimelineWindow} - Room timeline
	 * @param [args.direction] {Number} - Pagination direction. Look at {@link paginateEvents}
	 * @param [args.count] {Number} - Count of events to get. Look at {@link paginateEvents}
	 * @param [args.offset] {Boolean} - Prevent override of parsed events. Look at {@link getEvents}
	 * @param [args.eventsTypes] {Object} - Event types. Look at {@link getEvents}
	 * @param [args.eventsCount] {Number} - Count of events already parsed. Look at {@link getEvents}
	 * @param [args.tick] {Function} - Iteration callback
	 *
	 * @return {Object}
	 */
	paginateAllEvents(args) {
		args = Object.assign({
			chat: null,
			timeline: null,
			direction: 'b',
			count: 20,
			offset: false,
			eventsTypes: null,
			tick: () => {}
		}, args);
		
		let
			isPaused = false,
			loading = false;
		
		const
			params = {
				args: args,
				stop: () => {
					isPaused = loading = null;
					console.log('It\'s over');
				},
				pause: () => {
					isPaused = true;
					console.log('Paused')
				},
				resume: () => {
					isPaused = false;
					params.interval();
					console.log('Resumed')
				}
			};
		
			/*Loads timeline first time*/
			params.prepare = () => {
				if (!args.timeline._eventCount) {
					loading = true;
					
					args.timeline.load()
						.then(() => {
							return this.getEventsAndDecrypt(args);
						})
						.then(params.callback);
				} else {
					params.interval();
				}
				
				return params;
			};
			
			/*Iterate get events until end*/
			params.interval = () => {
				args.eventsCount = args.timeline._eventCount;
				
				if (!isPaused && !loading) {
					loading = true;
					
					this.paginateEvents(args)
						.then(params.callback);
				}
			};
			
			/*Callback for iteration*/
			params.callback = (e) => {
				loading = false;
				
				if (e?.length) {
					if (typeof args.tick === 'function') args.tick(e);
					if (!isPaused) params.interval();
				} else {
					params.stop();
				}
				
				// console.log(`next: ${ !!e?.length }, new events: ${ e?.length || 0 }`);
			}
		
		return params.prepare();
	}
	
	/**
	 * Preload timeline events
	 *
	 * @param args {Object}
	 * @param args.chat {Room} - Chat room
	 * @param args.timeline {TimelineWindow} - Room timeline
	 * @param [args.direction] {Number} - Pagination direction
	 * @param [args.count] {Number} - Count of events to get
	 *
	 * @return {*|Promise}
	 */
	paginateEvents(args) {
		args = Object.assign({
			chat: null,
			timeline: null,
			direction: 'b',
			count: 20
		}, args);
		
		if (args.timeline.canPaginate(args.direction)) {
			return args.timeline
				.paginate(args.direction, args.count)
				.then(() => {
					return Promise.resolve();
				})
				.catch(() => {
					return Promise.resolve();
				})
				.then(() => {
					return this.getEventsAndDecrypt(args);
				})
				.then((events) => events);
		} else {
			return Promise.resolve();
		}
	}
	
	/**
	 * Get events and decrypt
	 *
	 * @param args {Object}
	 * @param args.chat {Room} - Chat room
	 * @param args.timeline {TimelineWindow} - Room timeline
	 *
	 * @return {*|Promise}
	 */
	getEventsAndDecrypt(args) {
		args = Object.assign({
			chat: null,
			timeline: null
		}, args);
		
		let events = this.getEvents(args);
		
		return Promise.all(
			_.map(events, (e) => {
				if (!args.chat.pcrypto) return Promise.resolve();
				
				if (e.event.decrypted) return Promise.resolve();
				
				let
					pr = null,
					subtype = f.deep(e, "event.content.msgtype"),
					
					einfo =
						f.deep(e, "event.content.info.secrets") ||
						f.deep(e, "event.content.pbody.secrets");
				
				if (einfo) {
					if (subtype === "m.image") {
						//
					}
					
					if (subtype === "m.audio") {
						pr = this.core.mtrx.getAudio(args.chat, e).catch((error) => {
							console.error(error);
							
							e.event.decrypted = {
								msgtype: "m.bad.encrypted",
							};
						});
					}
				} else {
					if (subtype === "m.audio") {
						pr = this.core.mtrx.getAudioUnencrypt(args.chat, e);
					}
					
					if (subtype === "m.encrypted") {
						pr = args.chat.pcrypto
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
	}
	
	/**
	 * Get events from timeline
	 *
	 * @param args {Object}
	 * @param args.chat {Room} - Chat room
	 * @param args.timeline {TimelineWindow} - Room timeline
	 * @param [args.offset] {Boolean} - Prevent override of parsed events
	 * @param [args.eventsTypes] {{'m.call.invite': boolean, 'm.fully_read': boolean, 'm.room.file': boolean, 'p.room.encrypt.message': boolean, 'm.call.hangup': boolean, 'p.room.': boolean, 'm.room.image': boolean, 'm.room.audio': boolean, 'm.room.message': boolean, 'm.call.reject': boolean, 'm.room.request_calls_access': boolean}} - Event types
	 * @param [args.eventsCount] {Number} - Count of events already parsed. Look at {@link paginateAllEvents}
	 *
	 * @return {Array}
	 */
	getEvents(args) {
		args = Object.assign({
			chat: null,
			timeline: null,
			offset: false,
			eventsTypes: null
		}, args);
		
		/*Define events types*/
		args.eventsTypes = Object.assign({
			'm.room.message': true,
			'p.room.encrypt.message': true,
			'p.room.': true,
			'm.room.image': true,
			'm.room.audio': true,
			'm.room.file': true,
			'm.call.invite': true,
			'm.room.request_calls_access': true,
			'm.call.hangup': true,
			'm.call.reject': true,
			'm.fully_read': true,
		}, args.eventsTypes || {});
		
		/*Get events from chat*/
		let
			events = args.timeline.getEvents(),
			lastCallAccess = events
				.filter((e) => e.event.type === "m.room.request_calls_access")
				.pop();
		
		if (_.toArray((args.chat && args.chat.currentState.members) || {}).length > 2) {
			args.eventsTypes["m.room.member"] = true;
			args.eventsTypes["m.room.power_levels"] = true;
		}
		
		events = _.filter(events, (e) => {
			let type = e.event.type;
			
			if (e.localRedactionEvent() || e.getRedactionEvent()) {
				return;
			}
			
			if (e.event.type === "m.room.request_calls_access") {
				if (e.event.event_id === lastCallAccess.event.event_id) {
					if (e.event.content.accepted !== undefined) {
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
				args.chat.currentState.getMembers().length <= 2 &&
				e.event.type === "m.room.member" &&
				"m.room.power_levels"
			) {
				return;
			}
			
			return !args.eventsTypes || args.eventsTypes[type];
		}).reverse();
		
		this.relations(args.timeline, events);
		
		events = _.sortBy(events, function (e) {
			return e.replacingEventDate() || e.getDate() || Infinity;
		}).reverse();
		
		events = _.uniq(events, (e) => {
			return this.core.mtrx.clearEventId(e) || f.makeid();
		});
		
		events = _.sortBy(events, function (e) {
			return e.getDate() || Infinity;
		});
		
		events = events.reverse();
		
		return events.slice(args.offset ? args.eventsCount : 0);
	}
	
	/**
	 * Get events relations
	 *
	 * @param timeline {TimelineWindow}
	 * @param events {Array}
	 * @return void
	 */
	relations(timeline, events) {
		let ts = timeline._timelineSet;
		
		_.each(events, (e) => {
			try {
				let rt = ts.getRelationsForEvent(
					e.event.event_id,
					"m.replace",
					"m.room.message"
				);
				
				if (rt) {
					let last = rt.getLastReplacement();
					
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
	}
}

export default MTRXKIT;
