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
			var tid = this.tetatetid(users[0], users[1]);

			tt =
				m_chat.name == "#" + tid ||
				(m_chat.getCanonicalAlias() || "").indexOf(tid) > -1;
		}
		if (users.length > 1) m_chat.tetatet = tt;

		return tt;
	}
	canInteractWithRoom(room) {
		const interactiveTypes = ["join", "invite"];
		return interactiveTypes.includes(room.selfMembership);
	}
	findOneToOneRoom(user1Id, user2Id) {
		const rooms = Object.values(this.core.mtrx.store.rooms);
		const targetUserIds = [
			this.core.user.matrixId(user1Id),
			this.core.user.matrixId(user2Id)
		].sort();

		const isRoomValid = room => {
			return room.getJoinRule() !== "public" && this.canInteractWithRoom(room);
		};

		for (let room of rooms) {
			if (!isRoomValid(room)) continue;

			const members = room.getMembers();
			if (members.length !== 2) continue;

			const memberIds = members.map(member => member.userId).sort();
			if (f.areArraysEqual(memberIds, targetUserIds)) {
				return room.name.replace("#", "");
			}
		}
	}
	tetatetid(user1, user2, version) {
		if (!version) {
			const roomId = this.findOneToOneRoom(user1.id, user2.id);
			if (roomId) {
				return roomId;
			}
		}

		var seed = 2;

		if (user1.id == user2.id) return null;

		const ids = [user1.id, user2.id].sort();

		var id = parseInt(ids[0], 16) * parseInt(ids[1], 16) * seed;
		if (version) {
			id += "-" + version;
		}

		if (cachestorage[id]) return cachestorage[id];

		var hash = f.sha224(id).toString("hex");

		cachestorage[id] = hash;

		return hash;
	}

	groupideq(users) {
		var seed = 2;

		var id = 1 * seed;

		_.each(users, u => {
			id = id * parseInt(u.id, 16);
		});

		if (cachestorage[id]) return cachestorage[id];

		var hash = f.sha224(id.toString()).toString("hex");

		cachestorage[id] = hash;

		return hash;
	}

	groupid(users, owner) {
		var seed = 2;

		var id =
			users.reduce((s, u) => {
				s += parseInt(u.id, 16);
				return s;
			}, 0) *
			parseInt(owner.id, 16) *
			seed;

		if (cachestorage[id]) return cachestorage[id];

		var hash = f.sha224(id.toString()).toString("hex");

		cachestorage[id] = hash;

		return hash;
	}

	unknowngroupusers(m_chat) {
		return (
			m_chat &&
			m_chat.selfMembership === "invite" &&
			!m_chat.summary.members &&
			!this.tetatetchat(this.m_chat)
		);
	}

	usersFromChats(m_chats) {
		var users = {};

		_.each(m_chats, chat => {
			users[chat.roomId] = _.map(
				_.uniq(
					[].concat(
						_.toArray(chat.currentState.members),
						chat.summary.members || []
					),
					r => {
						return r.userId;
					}
				),
				function (r) {
					return {
						userId: f.getmatrixid(r.userId),
						membership: r.membership,
						powerLevel: r.powerLevel
					};
				}
			);
		});

		return users;
	}

	prepareChat(m_chat) {
		if (m_chat.getJoinRule() === "public") {
			return Promise.resolve();
		}

		return this.usersInfoForChatsStore([m_chat]).then(() => {
			return this.core.pcrypto.addroom(m_chat);
		});
	}

	prepareChatWithUsers(m_chat) {
		if (m_chat.getJoinRule() === "public") {
			return Promise.resolve();
		}

		return this.allchatmembers([m_chat], false, true).then(r => {
			return this.prepareChat(m_chat);
		});
	}

	fillContacts(m_chats) {
		m_chats = _.filter(m_chats, ch => {
			return (
				ch.selfMembership == "join" &&
				ch.name.length == 57 &&
				ch.getJoinRule() != "public"
			);
		});

		return this.usersInfoForChatsStore(m_chats).then(i => {
			this.core.store.commit(
				"SET_CONTACTS_FROM_MATRIX",
				_.filter(i, m => {
					return (
						!this.core.user.userinfo || m.id !== this.core.user.userinfo.id
					);
				})
			);
		});
	}

	usersInfoForChatsStore(m_chats, reload) {
		return this.usersInfoForChats(m_chats, reload)
			.then(i => {
				this.core.store.commit("SET_CHATS_USERS", this.usersFromChats(m_chats));

				return Promise.resolve(i);
			})
			.catch(e => {
				return Promise.resolve();
			});
	}

	allchatmembers(m_chats, reload, withinvite) {
		var members = [];
		var promises = [];

		if (withinvite) {
			var promises = _.map(m_chats, chat => {
				if (
					chat.selfMembership === "invite" &&
					(!chat.summary.members || reload) &&
					!chat.summary.membersloading
				) {
					chat.summary.membersloading = true;

					return chat
						.loadMembersFromServer()
						.then(r => {
							chat.summary.membersloading = false;

							chat.summary.members = _.map(r, user => {
								return {
									name: f.getmatrixid(user.state_key),
									membership: user.content.membership,
									user: user,
									userId: user.state_key,
									powerLevel: user.content.powerLevel || 0
								};
							});

							if (chat.selfMembership === "invite" && this.core.user.userinfo) {
								if (
									!_.find(chat.summary.members, m => {
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
										powerLevel: 0
									});
								}
							}

							return Promise.resolve();
						})
						.catch(e => {
							console.log("ER", e);
							chat.summary.membersloading = false;

							return Promise.resolve();
						});
				}

				return Promise.resolve();
			});
		}

		return Promise.all(promises).then(r => {
			_.each(m_chats, chat => {
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

		return this.allchatmembers(m_chats, reload).then(members => {
			return this.usersInfo(members, reload);
		});
	}

	usersInfoById(id) {
		var ids = [f.getmatrixid(id)];

		return this.core.user.usersInfo(ids, false).then(r => {
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

		users.forEach(user => {
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

		_.each(domains, domain => {
			_.each(ids, id => {
				idForInviting.push(this.core.user.matrixId(id, domain));
			});
		});

		_.each(ids, _id => {
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

		return _.find(join_rules, v => {
			return f.deep(v, "event.content.join_rule") == "public";
		})
			? true
			: false;
	}
}

export default MTRXKIT;
