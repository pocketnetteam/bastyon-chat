const sdk = require("matrix-js-sdk-bastyon/lib/browser-index.js");

import MTRXKIT from "./mtrxkit";
import f from "./functions";
import images from "./utils/images";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

import qs from "qs";
import fileSaver from "file-saver";
import ChatStorage from "./chatstorage";
import SearchEngine from "./searchEngine";

var axios = require("axios");

class MTRX {
	constructor(core, p) {
		if (!p) p = {};

		this.core = core;
		this.baseUrl = p.baseUrl;
		this.ready = false;
		this.error = false;
		this.kit = new MTRXKIT(this.core, p);
		this.sdk = sdk;
		this.sync = "";
		this.nd = false;
		this.version = 4;
		this.dversion = "2";
		this.backup = {};
		this.db = null;

		this.customrequest = true;

		this.devicekey = "m8_device";

		this.searchEngine = new SearchEngine(this)
	}

	async setCredentials() {
		return this.core.user.matrixCredentials().then((credentials) => {
			this.credentials = credentials;
			return Promise.resolve(credentials);
		});
	}

	getDevices() {
		var devices = localStorage[this.devicekey] || "";

		if (devices) {
			try {
				var d = JSON.parse(devices);

				return d;
			} catch (e) {}
		}

		return {};
	}

	setDevice(device, userkey) {
		var devices = this.getDevices();

		devices[userkey] = device;

		localStorage[this.devicekey] = JSON.stringify(devices);
		localStorage.device_ = JSON.stringify(device);
	}

	getDevice(userkey) {
		// return localStorage.m8_device;
		// var devices = this.getDevices()
		// return devices[userkey] || null
	}

	request(opts, clbk) {
		var response = null;

		var error = null;

		const cancelTokenSource = axios.CancelToken.source();

		var aopts = {
			url: opts.uri,
			params: opts.qs,
			data: JSON.parse(opts.body || "{}"),
			timeout: opts.timeout,
			headers: opts.headers,
			json: opts.json,
			method: opts.method,
			withCredentials: opts.withCredentials,
			_matrix_opts: opts,
			cancelToken: cancelTokenSource.token,

			paramsSerializer: function (params) {
				return qs.stringify(params, opts.qsStringifyOptions);
			},
		};

		var req = axios(aopts)
			.then((response) => {
				return Promise.resolve(response);
			})
			.catch((e) => {
				error = e;
				response = e.response;

				return Promise.resolve(response);
			})
			.then((response) => {
				var parsederror = error;

				if (error) {
					try {
						parsederror = JSON.parse(f.deep(response, "request.responseText"));

						error = new sdk.MatrixError(parsederror);
					} catch (e) {}

					//error.error = parsederror
				}

				clbk(error, response, f.deep(response, "request.responseText") || "");

				/*if (error)
        return Promise.reject(parsederror)*/
			});

		req.abort = function () {
			cancelTokenSource.cancel();
		};

		return req;

		/*
    uri	string	The complete URI.
    method	string	The HTTP method.
    qs	Object	The query parameters to append to the URI.
    body	Object	The JSON-serializable object.
    json	boolean	True if this is a JSON request.
    _matrix_opts
    */
	}

	async getFingerprint() {
		var fp = await FingerprintJS.load();
		var result = await fp.get();
		return result.visitorId + this.dversion;
	}

	createMtrxClient(opts) {
		var client = sdk.createClient(opts);

		client.getProfileInfo = function () {
			return Promise.resolve({
				avatar_url: "",
				displayname: "test",
			});
		};

		return client;
	}

	async getClient() {
		await this.setCredentials();

		var userClientData = {
			baseUrl: this.baseUrl,
		};

		var opts = {
			baseUrl: this.baseUrl,
		};

		if (this.customrequest) opts.request = this.request;

		var client = this.createMtrxClient(opts);

		try {
			var userData = await client.login("m.login.password", {
				user: this.credentials.username,
				password: this.credentials.password,
			});
		} catch (e) {
			if (e && e.indexOf && e.indexOf("M_USER_DEACTIVATED") > -1) {
				this.error = "M_USER_DEACTIVATED";
				return null;
			}

			if (await client.isUsernameAvailable(this.credentials.username)) {
				userData = await client.register(
					this.credentials.username,
					this.credentials.password,
					null,
					{
						type: "m.login.dummy",
						//signature : this.core.user.signature('matrix')
					}
				);
			} else {
				throw "Signup error, username is not available: " + e;
			}
		}

		localStorage.accessToken = userData.access_token;
		var store = new sdk.IndexedDBStore({
			indexedDB: window.indexedDB,
			dbName: "matrix-js-sdk-v3:" + this.credentials.username,
		});
		await store.startup();

		Object.assign(userClientData, {
			userId: userData.user_id,
			accessToken: userData.access_token,
			unstableClientRelationAggregation: true,
			timelineSupport: true,
			store: store,
			deviceId: userData.device_id,
		});

		if (this.customrequest) userClientData.request = this.request;

		var userClient = this.createMtrxClient(userClientData);
		window.client = userClient;
		window.core = this.core;

		await userClient.startClient({
			pollTimeout: 60000,
			resolveInvitesToProfiles: true,
		});

		this.access = userClientData;

		this.client = userClient;

		return userClient;
	}

	clearstorage(key) {
		var keys = Object.keys(localStorage),
			i = keys.length;

		while (i--) {
			if (keys[i] && keys[i].indexOf(key) == 0) {
				localStorage.removeItem(keys[i]);
			}
		}
	}

	clearstore() {
		var version = Number(localStorage.matrixversion || "0");

		if (version < this.version) {
			this.clearstorage("crypto.");
			this.clearstorage("session.");

			var keys = ["", "2", "3", "4", "5", "6", "8"];

			_.each(keys, function (key) {
				delete localStorage["m" + key + "_device"];
			});
		}

		localStorage.matrixversion = this.version;
	}

	async createClient() {
		try {
			this.client = await this.getClient();
			this.store = this.client.store;
			this.ready = true;
		} catch (e) {
			this.error = e;
		}

		return true;
	}

	wait() {
		return f
			.pretry(() => {
				return this.ready;
			})
			.then(() => {
				if (this.error) {
					return Promise.reject(this.error);
				}

				return Promise.resolve();
			});
	}

	waitchats() {
		return f
			.pretry(() => {
				return this.chatsready;
			})
			.then(() => {
				if (this.error) {
					return Promise.reject(this.error);
				}

				return Promise.resolve();
			});
	}

	me(id) {
		return f.getmatrixid(id) == this.core.user.userinfo?.id;
	}

	reciepts(event) {

		var room = (this.core.mtrx.store.rooms || {})[event.getRoomId()];


		if (room){
			return room.getReceiptsForEvent(event)
		}

	}

	storeFileLocal(url, file) {
		return file.arrayBuffer().then((arrayBuffer) => {
			const blob = new Blob([new Uint8Array(arrayBuffer)], { type: file.type });

			if (
				window.POCKETNETINSTANCE &&
				window.POCKETNETINSTANCE.storage &&
				window.cordova
			) {
				return window.POCKETNETINSTANCE.storage.saveFile(url, blob);
			} else {
				if (this.db) {
					return this.db.set(url, blob);
				}
			}
		});
	}

	download(url) {
		// Function to download the file
		var dlFile = () => {
			return f.fetchLocal(url).then((response) => {
				// Update the storage before returning
				if (
					window.POCKETNETINSTANCE &&
					window.POCKETNETINSTANCE.storage &&
					window.cordova
				) {
					window.POCKETNETINSTANCE.storage.saveFile(url, response.data);
				} else {
					if (this.db) {
						this.db.set(url, response.data);
					}
				}

				return Promise.resolve(response.data);
			});
		};

		// Check if file is saved in the storage
		if (
			window.POCKETNETINSTANCE &&
			window.POCKETNETINSTANCE.storage &&
			window.cordova
		) {
			return window.POCKETNETINSTANCE.storage.loadFile(url).then(
				(file) => {
					return Promise.resolve(file);
				},
				(e) => {
					// Nothing in storage, download file
					return dlFile();
				}
			);
		} else {
			if (this.db) {
				return this.db
					.get(url)
					.then((file) => {
						return Promise.resolve(file);
					})
					.catch(() => {
						return dlFile();
					});
			}

			return dlFile();
		}
	}

	customRoomType(roomId) {
		var room = this.core.mtrx.client.getRoom(roomId);

		if (!room) return null;

		var ev = room.currentState.getStateEvents("m.room.custom", "") || {};

		return ev.event?.content.type;
	}

	isReaded(event, me) {

		var reciepts = this.reciepts(event)

		return _.find(reciepts, (reciept) => {
			var m = this.me(reciept.userId);

			return reciept.type == "m.read" && ((me && m) || (!m && !me));
		})
	}

	initEvents() {
		let self = this;

		let userId = this.core.mtrx.client.credentials.userId;

		this.client.on("RoomMember.membership", (event, member) => {
			if (!this.chatsready) return;

			if (
				(member.membership === "invite" || member.membership === "join") &&
				event.getSender() !== userId
			) {
				this.core.notifier.event(event);
			}
		});

		this.client.on("Room.timeline", (message, member) => {

			if (!this.chatsready) return;

			if (!message.event.content) return;

			if (message.event.content.msgtype === "m.file") {
				message.event.content.pbody = JSON.parse(message.event.content.body);
			}

			if (message.getSender() !== userId) {
				var m_chat = this.core.mtrx.client.getRoom(message.event.room_id);

				if (
					message.event.content["m.relates_to"] &&
					message.event.content["m.relates_to"]["rel_type"] == "m.replace"
				)
					return false;

				if (m_chat && this.core.pcrypto.rooms[message.event.room_id])
					this.core.notifier.event(message, m_chat);
			}
		});

		this.client.on("RoomMember.typing", (event, member) => {
			this.core.store.dispatch("TYPING_EVENT", member);
		});

		this.client.on("sync", (state, prevState, res) => {
			if (state === "PREPARED") {
				this.setready();
			}

			this.core.store.dispatch("FETCH_CHATS").then((r) => {
				this.core.store.dispatch("FETCH_EVENTS");
				this.core.store.commit(
					"ALL_NOTIFICATIONS_COUNT",
					this.client.getRooms()
				);
			});
		});
	}

	setready() {
		if (!this.chatsready) {
			this.chatsready = true;
			this.core.store.commit("SET_CHATS_READY", true);
		}
	}

	initdb() {
		return ChatStorage("files", 1)
			.then((db) => {
				this.db = db;
				return Promise.resolve();
			})
			.catch(() => {
				return Promise.resolve();
			});
	}

	init() {
		return this.createClient()
			.then(() => {
				if (this.error) {
					return Promise.reject(this.error);
				}

				return this.initdb();
			})
			.then(() => {
				this.initEvents();

				return Promise.resolve();
			});
	}

	deactivateAccount() {
		if (this.client) {
			return this.client.deactivateAccount(this.credentials, true);
		}

		return Promise.reject("noclient");
	}

	destroy() {

		this.searchEngine.destroy()
		
		if (this.client) {
			// Before client is stopped, delete the pusher if needed
			if (window.cordova) {
				this.deletePusher();
			}

			this.client.stopClient();
		}

		this.chatsready = false;
		this.ready = false;
		this.error = false;

		
	}

	// Try to delete the current pusher if needed
	deletePusher() {
		// Try to get a saved token

		if (!window.cordova) return;

		var savedToken;
		if (localStorage) savedToken = localStorage.getItem("fcmtoken5");
		if (savedToken && this.client.setPusher) {
			var appName = "pocketnet";
			var pusherData = {
				app_display_name: appName,
				app_id: appName + window.cordova.platformId,

				data: {
					url: this.core.mtrx.baseUrl + "/_matrix/push/v1/notify",
					default_payload: {
						aps: {
							sound: "default",
							"content-available": 1,
						},
					},
				},

				device_display_name:
					window.device.manufacturer + " " + window.device.model,
				kind: null, // Set to null to delete the pusher
				lang: localStorage.getItem("loc") || "en",
				pushkey: savedToken,
			};

			this.core.mtrx.client.setPusher(pusherData).then(
				() => {
					localStorage.removeItem("fcmtoken5");
				},
				(err) => {
					console.log(err);
				}
			);
		}
	}

	uploadContent(file, save) {
		return this.client
			.uploadContent(file)
			.then((src) => {

				console.log("SRC", src)

				return Promise.resolve(this.core.mtrx.client.mxcUrlToHttp(src.content_uri));
			})
			.then((url) => {
				console.log("URL", url)
				if (save) {
					return this.storeFileLocal(url, file)
						.then(() => {
							return Promise.resolve(url);
						})
						.catch((e) => {
							return Promise.resolve(url);
						});
				}

				return Promise.resolve(url);
			});
	}

	/*transaction(roomId, txId){
    this.client.sendEvent(roomId, "m.room.message", {

      txId: roomId,
      msgtype: "m.notice"

    }, "");
  }*/

	originalEvent(id, timeline) {
		var rtr = timeline.timelineSet.relations.getChildEventsForEvent(
			e.event.event_id,
			"m.reference",
			"m.room.message"
		);

		if (rtr) {
			var events = rtr.getRelations();
			return events[0];
		}
	}

	clearEventId(event) {
		var previd = null;

		if (
			event.event.content["m.relates_to"] &&
			event.event.content["m.relates_to"]["rel_type"] == "m.replace"
		)
			previd = event.event.content["m.relates_to"]["event_id"];

		return previd || event.getId();
	}

	textEvent(chat, text, clbks = {}) {
		if (chat.pcrypto.canBeEncrypt()) {
 
			if(clbks.encryptEvent) clbks.encryptEvent()

			return chat.pcrypto.encryptEvent(text).then((e) => {

				if(clbks.encryptedEvent) clbks.encryptedEvent(e)

				return Promise.resolve(e)

			})
		}

		return Promise.resolve(this.sdk.ContentHelpers.makeTextMessage(text));
	}

	sendtext(chat, text, { relation, from, donateLink }, clbks) {
		return this.textEvent(chat, text, clbks).then((r) => {
			if (relation) {
				r["m.relates_to"] = {
					rel_type: relation.type,
					event_id: this.clearEventId(relation.event),
				};
			}

			if (from) {
				r["from"] = from;
			}

			if (donateLink) {
				r["url"] = donateLink;
			}

			if (chat.pcrypto.canBeEncrypt()) {
				return this.client.sendEvent(chat.roomId, "m.room.message", r);
			} else return this.client.sendMessage(chat.roomId, r);
		});
	}

	sendFile(chat, file, meta, { relation, from }, notenc) {
		if (!meta) meta = {};

		var fileInfo = {};
		fileInfo.name = file.name;
		fileInfo.size = file.size;

		var encpromise = (() => Promise.resolve(file))();
		var promise = null;

		if (chat.pcrypto.canBeEncrypt() && !notenc) {
			encpromise = chat.pcrypto.encryptFile(file).then((r) => {
				fileInfo.secrets = r.secrets;

				return Promise.resolve(r.file);
			});
		}

		return encpromise
			.then((file) => {
				promise = this.client.uploadContent(file);

				if (promise.abort) meta.abort = promise.abort;

				return promise;
			})
			.then((src) => {


				if (meta.aborted) return Promise.reject("aborted");

				return Promise.resolve(this.client.mxcUrlToHttp(src.content_uri));
			})
			.then((url) => {



				fileInfo.url = url;

				let body = JSON.stringify(fileInfo);

				var r = {
					body: body,
					msgtype: "m.file",
				};

				if (relation) {
					r["m.relates_to"] = {
						rel_type: relation.type,
						event_id: this.clearEventId(relation.event),
					};
				}

				if (from) {
					r["from"] = from;
				}

				return this.client.sendMessage(chat.roomId, r);
			});
	}

	sendImageBase64(chat, base64, meta, p) {
		var method = "toFileFetch";

		if (base64.indexOf("data:") > -1) method = "toFile";

		return f.Base64[method](base64).then((file) => {
			return this.sendImage(chat, base64, file, meta, p);
		});
	}

	sendAudioBase64(chat, base64, meta, p) {
		var method = "toFileFetch";

		if (base64.indexOf("data:") > -1) method = "toFile";

		return f.Base64[method](base64).then((file) => {
			return this.sendAudio(chat, base64, file, meta, p);
		});
	}

	sendImage(chat, base64, file, meta, { relation, from } = {}) {
		if (!file)
			return this.sendImageBase64(chat, base64, meta, { relation, from });

		var i = new images();
		var info = {};

		if (!meta) meta = {};

		return i
			.wh(base64)
			.then((_info) => {
				info = _info;

				if (from) info.from = from;

				if (chat.pcrypto.canBeEncrypt()) {
					return chat.pcrypto.encryptFile(file).then((r) => {
						info.secrets = r.secrets;
						return Promise.resolve(r.file);
					});
				}

				return Promise.resolve(file);
			})
			.then((file) => {
				var promise = this.core.mtrx.uploadContent(file, true);
				if (promise.abort) meta.abort = promise.abort;

				return promise;
			})
			.then((image) => {
				if (meta.aborted) return Promise.reject("aborted");

				

				var content = {
					msgtype: 'm.image',
					url: image,
					
					body: "Image",

					info
				}

				if (relation) {
					content["m.relates_to"] = {
						rel_type: relation.type,
						event_id: this.clearEventId(relation.event),
					};
				}

				return this.client.sendMessage(chat.roomId, content);

				//return this.client.sendImageMessage(chat.roomId, image, info, "Image");
			});
	}

	sendAudio(chat, base64, file, meta, { relation, from } = {}) {
		if (!file)
			return this.sendAudioBase64(chat, base64, meta, { relation, from });

		let info = {};

		info.from = from;

		return new Promise((resolve) => {
			if (chat.pcrypto.canBeEncrypt()) {
				return chat.pcrypto.encryptFile(file).then((r) => {
					info.secrets = r.secrets;
					return resolve(r.file);
				});
			}

			resolve(file);
		})
			.then((file) => {
				let promise = this.core.mtrx.uploadContent(file, true);

				if (promise.abort) meta.abort = promise.abort;

				return promise;
			})
			.then((audio) => {
				if (meta.aborted) return Promise.reject("aborted");

				var content = {
					msgtype: 'm.audio',
					url: audio,
					body: "Audio",
					info
				}

				if (relation) {
					content["m.relates_to"] = {
						rel_type: relation.type,
						event_id: this.clearEventId(relation.event),
					};
				}

				return this.client.sendMessage(chat.roomId, content);

				return this.client.sendAudioMessage(chat.roomId, audio, info, "Audio");
			});
	}

	async getFile(chat, event) {
		try {
			var decryptKey = await chat.pcrypto.decryptKey(event.event);

			event.event.decryptKey = decryptKey;
		} catch (e) {
			return Promise.reject(e);
		}

		return this.download(event.event.content.pbody.url)
			.then((blob) => {
				return chat.pcrypto.decryptFile(blob, decryptKey);
			})
			.then((r) => {
				return Promise.resolve({
					file: r,
					name: event.event.content.pbody.name,
				});
			})
			.catch((e) => {
				return Promise.reject(e);
			});
	}

	async downloadFile(chat, event) {
		return this.getFile(chat, event)
			.then((r) => {
				if (window.cordova && f.saveFileCordova) {
					return new Promise((resolve, reject) => {
						f.saveFileCordova(r.file, r.name, function (i, e) {
							if (e) {
								console.error(e);
							}

							if (!e) resolve();
							else reject("unable");
						}, true);
					});
				}

				return fileSaver.saveAs(r.file, r.name);
			})
			.catch((e) => {
				console.error(e);
				return Promise.reject(e);
			});
	}

	async getAudioUnencrypt(chat, event) {


		if (event.event.content.audioData) {
			return Promise.resolve(event.event.content.audioData);
		}

		return this.download(event.event.content.url, true)
			.then((r) => {
				return f.readFile(r);
			})
			.then((arraybuffer) => {
				event.event.content.audioData = arraybuffer;

				return Promise.resolve(arraybuffer);
			});
	}

	async getAudio(chat, event) {
		if (event.event.decryptedAudio) {
			return Promise.resolve(event.event.decryptedAudio);
		}

		try {
			var decryptKey = await chat.pcrypto.decryptKey(event.event);

			event.event.decryptKey = decryptKey;

			return this.download(event.event.content.url, true)
				.then((blob) => {
					return chat.pcrypto.decryptFile(blob, decryptKey);
				})
				.then((r) => {
					return f.readFile(r);
				})
				.then((arraybuffer) => {
					event.event.decryptedAudio = arraybuffer;

					return Promise.resolve(event.event.decryptedAudio);
				})
				.catch((e) => {
					return Promise.reject(e);
				});
		} catch (e) {
			return Promise.reject(e);
		}
	}

	async getImage(chat, event) {
		if (event.event.decryptedImage) {
			return Promise.resolve(event.event.decryptedImage);
		}

		try {
			var decryptKey = await chat.pcrypto.decryptKey(event.event);

			event.event.decryptKey = decryptKey;

			return this.download(event.event.content.url, true)
				.then((blob) => {
					return chat.pcrypto.decryptFile(blob, decryptKey);
				})
				.then((r) => {
					return f.Base64.fromFile(r);
				})
				.then((url) => {
					event.event.decryptedImage = url.replace(
						"data:file;",
						"data:image/jpeg;"
					);
					return Promise.resolve(event.event.decryptedImage);
				})
				.catch((e) => {
					return Promise.reject(e);
				});
		} catch (e) {
			return Promise.reject(e);
		}
	}

	shareInChat(id, share) {

		if (share.multiple){

			return f.processArray(share.multiple, (share) => {
				return this.shareInChat(id, share)
			})

		}

		var m_chat = this.client.getRoom(id);

		//// share.openwithItems []

		//// https://github.com/j3k0/cordova-plugin-openwith (item.type ---> resize)

		return this.core.mtrx.kit.prepareChat(m_chat).then((r) => {
			var promises = [];

			//// todo resize images.resize.fit
			_.each(share.images, (base64) => {
				var promise = this.sendImageBase64(
					m_chat,
					base64,
					{},
					{ from: share.from }
				);

				promises.push(promise);
			});

			_.each(share.download, ({event, chat}) => {

				var promise = this.core.mtrx.kit.prepareChat(chat).then(() => {

					return this.core.mtrx.getFile(chat, event)

				}).then((r) => {

					return r.file
				})
				.then((r) => {
					return this.sendFile(m_chat, r, {}, { from: share.from })
				})

				///this.sendFile(m_chat, file, {}, { from: share.from })
				promises.push(promise);
			});

			_.each(share.files, (file) => {
				promises.push(this.sendFile(m_chat, file, {}, { from: share.from }));
			});

			_.each(share.urls, (url) => {
				promises.push(this.sendtext(m_chat, url, { from: share.from }));
			});

			_.each(share.messages, (text) => {
				promises.push(this.sendtext(m_chat, text, { from: share.from }));
			});

			_.each(share.audio, (arraybuffer) => {
				var base64 =
					"data:audio/mpeg;base64," + f._arrayBufferToBase64(arraybuffer);

				promises.push(
					this.sendAudioBase64(m_chat, base64, {}, { from: share.from })
				);
			});

			return Promise.all(promises);
		});
	}

	opencontact(contact) {
		this.core.store.commit("setmodal", {
			caption: contact.name,
			type: "contact",
			data: {
				contact: contact,
			},
		});
	}

	complain(caption, p) {
		this.core.store.commit("setmodal", {
			caption: caption,
			type: "complain",
			data: p,
		});
	}

	blockeduser(id) {
		if (!this.core.mtrx.client) return;

		return this.core.mtrx.client.isUserIgnored(this.core.user.matrixId(id));
	}

	blockUser(userId) {
		userId = this.core.user.matrixId(userId);

		if (this.client.isUserIgnored(userId)) {
			return Promise.resolve();
		}

		var blackList = this.client.getIgnoredUsers();

		blackList.push(userId);

		return this.client.setIgnoredUsers(blackList).then((r) => {
			return Promise.resolve(r);
		});
	}

	fastsync = function () {
		var state = this.client.getSyncState();

		if (state === "PREPARED" || state === "SYNCING") {
		} else {
			return this.client.retryImmediately().catch((e) => {
				console.log("fastsyncerror", e);
			});
		}
	};

	unblockUser(userId) {
		userId = this.core.user.matrixId(userId);

		if (!this.client.isUserIgnored(userId)) {
			return Promise.resolve();
		}

		var blackList = this.client.getIgnoredUsers();

		blackList = _.filter(blackList, function (_id) {
			return userId != _id;
		});

		return this.client.setIgnoredUsers(blackList).then((r) => {
			return Promise.resolve(r);
		});
	}

	chatUsersInfo(roomId, m) {
		if (!m) m = "chatUsers";

		var _users = this.core.store.state.users;

		return _.filter(
			_.map(this[m](roomId), (user) => {
				return _users[user.userId];
			}),
			function (u) {
				return u;
			}
		);
	}

	chatUsers(roomId) {
		return this.core.store.state.chatusers[roomId] || [];
	}

	anotherChatUsers(roomId) {
		return _.filter(this.chatUsers(roomId), (user) => {
			return user.userId != this.core.user.userinfo.id;
		});
	}
}

export default MTRX;
