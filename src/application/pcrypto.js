import f from "@/application/functions";
import ChatStorage from "./chatstorage";

const BN = require("bn.js");
import * as miscreant from "miscreant";
var pbkdf2 = require("pbkdf2");
//import cryptoRandomString from 'crypto-random-string';

//var ncrypto = require('crypto')

var salt = "PR7srzZt4EfcNb3s27grgmiG8aB9vYNV82";

var secp256k1CurveN = null;

/**
 * PcryptoStorage annotations:
 *
 * 1. New IndexedDB structure must be handled
 *    if there are any in new release inside of
 *    onupgradeneeded listener.
 *
 * 2. New version number must be assigned on
 *    new releases of this object.
 */

var PcryptoRoom = async function (pcrypto, chat, { ls, lse }) {
	var self = this;
	this.configurable = false;

	var hashes = {};

	var users = {};
	var m = 12;

	var lsspromises = {}
	

	var usersinfo = {};
	var usershistory = [];

	var pcryptoFile = new PcryptoFile();

	chat.pcrypto = self;

	self.version = 2 

	self.clear = function () {
		hashes = {};
		usersinfo = {};
		usershistory = [];
		users = {};
	};

	var lcachekey = "pcrypto8_" + chat.roomId + "_";
	var ecachekey = "e_pcrypto8_";
	var usershashVersion = 11
	var cache = {};

	self.preparedUsers = function (time, v) {

		if(!v || v <= 1){
			return _.filter(getusersinfobytime(time), function (ui) {
				return ui.keys && ui.keys.length >= m;
			})
		}

		else{

			return _.sortBy(_.filter(getusersinfobytime(time), function (ui) {
				return ui.keys && ui.keys.length >= m;
			}), (u) => {return u.source.id})
		}

	};

	self.preparedUsersById = function (ids, v) {

		var ui = []

		_.each(users, (u) => {
			if(_.indexOf(ids, u.id) > -1){

				var u = usersinfo[u.id]

				if (u && u.keys && u.keys.length >= m){
					ui.push(u)
				}
				
			}
		})

		if(!v || v <= 1){
			return ui
		}

		return _.sortBy(ui, (u) => {return u.source.id})
	
	};

	self.cantchat = function () {
		var pu = self.preparedUsers();

		if (pcrypto.core.mtrx.kit.tetatetchat(chat) && pu.length && pu.length < 2) {
			return true;
		}

		return false;
	};

	self.canBeEncrypt = function (time) {
		var usersinfoArray = _.toArray(usersinfo);

		var publicChat = pcrypto.core.mtrx.kit.chatIsPublic(chat);


		if (
			!publicChat &&
			pcrypto.user &&
			pcrypto.user.private &&
			pcrypto.user.private.length == 12 &&
			users[pcrypto.user.userinfo.id] &&
			//pcrypto.core.mtrx.kit.tetatetchat(chat) &&
			usersinfoArray.length > 1 &&
			usersinfoArray.length < 50 &&
			self.preparedUsers(time).length / usersinfoArray.length > 0.6
		) {
			return true;
		}

		return false;
	};

	self.userschanded = function () {
		if (!self.cantchat()) {
			return Promise.resolve();
		}

		self.clear();

		return self.prepare();
	};

	var getusersinfo = function () {
		var us = _.map(users, function (uh) {
			return uh.id;
		});

		/////////////////// FAIL

		return pcrypto.core.user.usersInfo(us).then((_usersinfo) => {
			usersinfo = {};

			_.each(_usersinfo, function (ui) {
				usersinfo[ui.id] = ui;
			});

			return Promise.resolve();
		});
	};

	var getuserseventshistory = function () {
		var tetatet = pcrypto.core.mtrx.kit.tetatetchat(chat);

		var allevents = _.uniq([].concat(chat.oldState.getStateEvents("m.room.member"), chat.currentState.getStateEvents("m.room.member")), (e) => {
		
			return e.event.event_id
		}) 

		var history = _.filter(
			_.map(allevents, function (ue) {
				var event = ue.event;

				var membership = event.content.membership;

				if (
					membership  == "invite" ||
					membership  == "join" ||
					(membership == "leave" && !tetatet)// ||
					//(tetatet && membership == "invite")
				) {
					return {
						time: event.origin_server_ts || 1,

						membership: membership,

						id:
							membership == "invite"
								? f.getmatrixid(event.state_key)
								: f.getmatrixid(event.sender),
					};
				}

				return null;
			}),
			function (h) {
				return h;
			}
		);

		history = _.sortBy(history, function (ui) {
			return ui.time;
		});


		return history;
	};

	var period = function (time) {
		var period = 0;
		var h = getuserseventshistory();

		for (var i = h.length - 1; i >= 0; i--) {
			if ((h[i].time < time || !time) && !period) {
				period = i;
			}
		}

		return period;
	};

	var getusershistory = function () {
		var history = getuserseventshistory();

		var tetatet = pcrypto.core.mtrx.kit.tetatetchat(chat);

		users = {};

		_.each(history, function (ui) {
			if (!users[ui.id]) {
				users[ui.id] = {
					id: ui.id,
					life: [],
				};
			}

			var l = users[ui.id].life;

			if (
				ui.membership &&
				(ui.membership == "join" || (ui.membership == "invite"/* && tetatet*/))
			) {
				l.push({
					start: tetatet ? 1 : ui.time,
				});
			} else {
				if (l.length && ui.membership == "leave" && !tetatet) {
					var last = l[l.length - 1];

					last.end = ui.time;
				}
			}
		});
	};

	var getusersinfobytime = function (time) {
		var us = getusersbytime(time);


		return _.filter(
			_.map(us, function (u) {
				return usersinfo[u.id];
			}),
			function (u) {
				return u;
			}
		);
	};

	var getusersbytime = function (time) {

		return _.filter(users, function (ui) {
			var l = _.find(ui.life, function (l) {
				if (!time) {
					if (l.start && !l.end) return true;
				} else {
					if (l.start < time && (!l.end || l.end > time)) return true;
				}
			});

			if (l) return true;
		});
	};

	//self.users = users
	self.getusersinfobytime = getusersinfobytime;

	self.prepare = function () {
		getusershistory();

		/*if(!pcrypto.core.mtrx.kit.tetatetchat(chat)){
            m = 2
        }*/

		return getusersinfo().then((r) => {
			return self;
		});
	};

	var convert = {
		aeskeys: {
			inp: function (k) {
				var kr = {};

				_.each(k, function (v, i) {
					kr[i] = f._arrayBufferToBase64(v);
				});

				return kr;
			},
			out: function (k) {
				var kr = {};

				_.each(k, function (v, i) {
					kr[i] = new Uint8Array(f._base64ToArrayBuffer(v));
				});

				return kr;
			},
		},
	};

	var eaac = {
		aeskeysls: function (time, block, users, v) {


			if (!time) time = 0;
			if (!block) {
				if (!pcrypto.core.mtrx.kit.tetatetchat(chat)) {
					block = 10;
				} else {
					block = pcrypto.currentblock.height;
				}
			}

			/*if(!pcrypto.core.mtrx.kit.tetatetchat(chat)) {
                block = 10
            }*/

			var k =  ((users ? 'ul+' + orderedIdsHash(users) : period(time)) + "-" + block) + '-' + (v || self.version);
			var ek = `${lcachekey + pcrypto.user.userinfo.id}-${k}`

			

			if(!lsspromises[ek]) {


				lsspromises[ek] = ls.get(ek)
					.then((keys) => {
						const keysPrepared = convert.aeskeys.out(keys);

						return { keys: keysPrepared, k };
					})
					.catch(async (e) => {

						const keysPrepared = eaac.aeskeys(time, block, users, v);

						if (self.preparedUsers(time).length > 1) {
							const itemId = ek;

							await ls
								.set(itemId, convert.aeskeys.inp(keysPrepared))
								.catch(() => {});
						}

						return { keys: keysPrepared, k };
					}).finally(() => {
						delete lsspromises[ek]
					});
			}

				

			return lsspromises[ek]
		},
		aeskeys: function (time, block, users, v) {
			if (!time) time = 0;
			if (!block) block = pcrypto.currentblock.height;

			return eaa.aeskeys(time, block, users, v);
		},
	};

	var eaa = {
		cuhash: function (users, num, block) {
			return pbkdf2.pbkdf2Sync(
				f
					.sha224(
						_.map(users, function (u) {
							return u.keys[num];
						}).join("") + (block || pcrypto.currentblock.height)
					)
					.toString("hex"),
				salt,
				1,
				32,
				"sha256"
			);
		},

		userspublics: function (time, block, usersIds, v) {
			var users = usersIds ? self.preparedUsersById(usersIds, v) : self.preparedUsers(time, v);

			var sum = {};

			_.each(users, function (user) {
				if (user.id == pcrypto.user.userinfo.id && users.length > 1) {
					return;
				}

				var publics = _.map(user.keys, function (key) {
					return Buffer.from(key, "hex");
				});

				sum[user.id] = eaa.points(time, block, publics, usersIds, v);
			});

			return sum;
		},

		current: function (time, block, users, v) {
			var privates = _.map(pcrypto.user.private, function (key) {
				return key.private;
			});

			var buf = Buffer.allocUnsafe(32);
			var sc = eaa.scalars(time, block, privates, users, v).toBuffer();

			sc.copy(buf, 32 - sc.length);

			return buf;
		},

		scalars: function (time, block, scalars, usersIds, v) {
			var users = usersIds ? self.preparedUsersById(usersIds, v) : self.preparedUsers(time, v);

			var sum = null;

			for (var i = 0; i < m; i++) {
				var ch = new BN(this.cuhash(users, i, block));

				var a = new BN(scalars[i], 16);

				var mul = a.mul(ch).umod(secp256k1CurveN);

				if (!i) {
					sum = mul;
				} else {
					sum = sum.add(mul).umod(secp256k1CurveN);
				}
			}

			return sum;
		},

		points: function (time, block, points, usersIds, v) {
			var users = usersIds ? self.preparedUsersById(usersIds, v) : self.preparedUsers(time, v);


			var sum = null;

			for (var i = 0; i < m; i++) {
				var ch = this.cuhash(users, i, block);

				var mul = bitcoin.ecc.pointMultiply(points[i], ch, undefined, true);

				if (!i) {
					sum = mul;
				} else {
					sum = bitcoin.ecc.pointAdd(sum, mul, undefined, true);
				}
			}

			return sum;
		},

		aeskeys: function (time, block, usersIds, v) {


			var us = eaa.userspublics(time, block, usersIds, v);
			var c = eaa.current(time, block, usersIds, v);

			var su = {};

			_.each(us, function (s, id) {
				if (id != pcrypto.user.userinfo.id) {
					su[id] = bitcoin.ecc.pointMultiply(s, c, undefined, true);
					su[id] = pbkdf2.pbkdf2Sync(
						su[id].toString("hex"),
						salt,
						64,
						32,
						"sha512"
					);
				}
			});

			return su;
		},
	};

	self.decrypt = async function (userid, { encrypted, nonce }, time, block, users, v) {

		let { keys, k } = await eaac.aeskeysls(time, block, users, v);

		var error = null;


		if (keys[userid]) {
			try {
				return await decrypt(keys[userid], { encrypted, nonce });
			} catch (e) {

				error = e;
			}
		} else {
			error = "emptykey";
		}

		await ls
			.clear(`${lcachekey + pcrypto.user.userinfo.id}-${k}`)
			.catch((err) => {
				console.error("Error clearing item on LS.CLEAR");
			});

		throw new Error(error);
	};

	self.encrypt = async function (userid, text, version) {
		let { keys } = await eaac.aeskeysls(undefined, undefined, undefined, version || undefined);

		if (keys[userid]) {
			return await encrypt(text, keys[userid]);
		}

		throw new Error("emptykey");
	};

	self.decryptEvent = async function (event) {
		if (event.content.hash) return self.decryptEventGroup(event);

		if (!pcrypto.user.userinfo) {
			throw new Error("userinfo");
		}

		if (event.decrypting) {
			return event.decrypting;
		}

		var k = `${ecachekey + pcrypto.user.userinfo.id}-${
			(event.content ? event.content.edited : "") || event.event_id
		}`;

		var dpromise = lse
			.get(k)
			.then((stored) => {
				var parsed = null;

				try {
					parsed = JSON.parse(stored);
				} catch (e) {}

				if (!parsed) return Promise.reject();

				return Promise.resolve(parsed);
			})
			.catch(async (err) => {
				const sender = f.getmatrixid(event.sender);
				const me = pcrypto.user.userinfo.id;

				let keyindex, bodyindex;

				const body = JSON.parse(f.Base64.decode(event.content.body));
				const time = event.origin_server_ts || 1;
				const block = event.content.block;
				const version = event.content.version

				if (sender == me) {
					_.find(body, function (s, i) {
						if (i != me) {
							keyindex = i;
							bodyindex = i;

							return true;
						}
					});
				} else {
					bodyindex = me;
					keyindex = sender;
				}

				if (!body[bodyindex]) {
					throw new Error("emptyforme");
				}

				return self
					.decrypt(keyindex, body[bodyindex], time, block, null, version)
					.then((decrypted) => {
						var data = {
							body: decrypted,
							msgtype: "m.text",
						};

						lse.set(k, JSON.stringify(data));

						return data;
					}).catch(e => {
						console.error(e)
						console.log(event)

						return Promise.reject(e)
					})
			})
			.finally(() => {
				delete event.decrypting;
			});

		event.decrypting = dpromise;

		return dpromise;
	};

	self.encryptFile = async function (file, p) {
		var secret = await pcryptoFile.randomkey();

		var secrets = await self.encryptKey(secret);

		var result = {
			file: null,
			secrets: secrets,
		};

		return pcryptoFile
			.encryptFile(file, secret, p)
			.then((file) => {
				result.file = file;

				return Promise.resolve(result);
			})
			.catch((e) => {
				console.error(e);

				return Promise.reject(e);
			});
	};

	self.decryptFile = async function (file, secret, p) {
		return pcryptoFile.decryptFile(file, secret, p).then((file) => {
			return Promise.resolve(file);
		});
	};

	self.encryptKey = async function (key) {
		var users = self.preparedUsers(undefined, self.version);
		

		var block = pcrypto.currentblock.height;

		if (!pcrypto.core.mtrx.kit.tetatetchat(chat)) block = 10;

		var encrypted = {
			block: block,
			keys: {},
			v : self.version
		};

		for (var i = 0; i < users.length; i++) {
			var user = users[i];

			if (user.id != pcrypto.user.userinfo.id || users.length <= 1) {
				encrypted.keys[user.id] = await self.encrypt(user.id, key, self.version);
			}
		}

		encrypted.keys = f.Base64.encode(JSON.stringify(encrypted.keys));

		return encrypted;
	};

	self.decryptKey = async function (event) {
		if (!pcrypto.user.userinfo) {
			throw new Error("userinfo");
		}

		var secrets = "";
		var block = "";
		var v = undefined

		if (event.type == "m.room.encryption") {
			secrets = event.content.keys;
			block = event.content.block;
			v = event.content.version || 1;

		} else {
			secrets =
				f.deep(event, "content.info.secrets.keys") ||
				f.deep(event, "content.pbody.secrets.keys");
			block =
				f.deep(event, "content.info.secrets.block") ||
				f.deep(event, "content.pbody.secrets.block");

			v = f.deep(event, "content.info.secrets.version") || f.deep(event, "content.info.secrets.v") ||
				f.deep(event, "content.pbody.secrets.version") || f.deep(event, "content.pbody.secrets.v") || 1
		}


		if (!secrets) throw new Error("secrets");
		if (!block) throw new Error("block");

		var sender = f.getmatrixid(event.sender);
		var me = pcrypto.user.userinfo.id;

		var keyindex = null,
			bodyindex = null;

		var body = JSON.parse(f.Base64.decode(secrets));
		var time = event.origin_server_ts || 1;


		var users = _.map(body, (v, i) => {
			return i
		})

		users.push(sender)

		users = _.uniq(users)

		if (sender == me) {
			_.find(body, function (s, i) {
				if (i != me) {
					keyindex = i;
					bodyindex = i;

					return true;
				}
			});

			
		} else {
			bodyindex = me;
			keyindex = sender;
		}

		if (!body[bodyindex]) throw new Error("emptyforme");

		var decryptedKey = await self.decrypt(
			keyindex,
			body[bodyindex],
			time,
			block,
			users,
			v
		);

		return decryptedKey;
	};

	self.encryptEvent = async function (text) {
		var users = self.preparedUsers();

		if (!pcrypto.core.mtrx.kit.tetatetchat(chat)) {
			return self.encryptEventGroup(text);
		}

		var encryptedEvent = {
			block: pcrypto.currentblock.height,
			version : this.version,
			msgtype: "m.encrypted",
			body: {},
		};

		for (var i = 0; i < users.length; i++) {
			var user = users[i];

			if (user.id != pcrypto.user.userinfo.id || users.length <= 1) {
				encryptedEvent.body[user.id] = await self.encrypt(user.id, text, self.version);
			}
		}

		encryptedEvent.body = f.Base64.encode(JSON.stringify(encryptedEvent.body));

		return encryptedEvent;
	};

	var usershash = function () {
		var users = self.preparedUsers();

		var hash = f.md5(
			_.filter(
				_.map(users, (user) => {
					return user.id;
				}),
				(uid) => {
					return uid && uid != pcrypto.user.userinfo.id;
				}
			).join("") + "_v" + usershashVersion + '_' + self.version
		);

		return hash;
	};

	var orderedIdsHash = function(ids){
		return f.md5(_.sortBy(ids, (id) => {
			return Number(id.replace(/[^0-9]/g, ''))
		}).join(''))
	}

	self.sendCommonKey = function () {
		return self
			.createMyCommonKey()
			.then((result) => {
				//return Promise.reject("HI")

				return pcrypto.core.mtrx.client.sendStateEvent(
					chat.roomId,
					"m.room.encryption",
					result.export,
					"pcrypto." + pcrypto.user.userinfo.id + "." + result.export.hash
				);
			})
			.then((r) => {
				return self.getCommonKey();
			})
			.catch((e) => {
				console.error(e);

				return Promise.reject(e);
			});
	};

	var getCommonKeyEvent = function (userid, _hash) {
	
		var hash = _hash || usershash();

		if (!userid) userid = pcrypto.user.userinfo.id;

		var state_key = "pcrypto." + userid + "." + hash;
		var events = chat.currentState.getStateEvents("m.room.encryption");

		var event = _.find(events, (e) => {
			return e.event.state_key == state_key;
		});

		if (event) {
			return event;
		}
	};

	self.getCommonKey = function (userid, _hash) {
		return f
			.pretry(
				() => {
					var e = getCommonKeyEvent(userid, _hash);

					return e;
				},
				50,
				5000
			)
			.then(() => {
				var e = getCommonKeyEvent(userid, _hash);

				if (!e) {
					Promise.reject("m.room.encryption event not found");
				}

				return Promise.resolve(e.event);
			});
	};

	self.getOrCreateCommonKey = function () {
		var _e = null;
		var ce = getCommonKeyEvent();
		var promise = null;

		if (ce) {
			promise = Promise.resolve(ce.event);
		} else {
			promise = self.sendCommonKey();
		}

		return promise
			.then((event) => {
				_e = event;

				return self.decryptKey(event);
			})
			.then((key) => {
				return {
					key,
					hash: _e.content.hash,
					block: _e.content.block,
					version : _e.content.version || undefined
				};
			});
	};

	self.createMyCommonKey = function () {
		var hash = usershash();

		var result = {
			private: {},
			export: {
				version : self.version
			},
		};

		return pcryptoFile
			.randomkey()
			.then((key) => {
				result.private.secret = key;

				return pcryptoFile.key(key);
			})
			.then((key) => {
				result.private.key = key;
				result.private.hash = hash;
				result.export.hash = hash;

				return self.encryptKey(result.private.secret);
			})
			.then((encrypted) => {
				result.export.keys = encrypted.keys;
				result.export.block = encrypted.block;

				return result;
			});
	};

	self.decryptEventGroup = function (event) {
		if (!pcrypto.user.userinfo) {
			throw new Error("userinfo");
		}

		if (event.decrypting) {
			return event.decrypting;
		}

		var hash = event.content.hash;
		var sender = f.getmatrixid(event.sender);
		var block = event.content.block;


		var dpromise = self
			.getCommonKey(sender, hash)
			.then((event) => {


				return self.decryptKey(event).catch(e => {

					return Promise.reject(e)
				})
			})
			.then((key) => {
				return pcryptoFile
					.decrypt(Buffer.from(event.content.body, "hex"), key)
					.then((decrypted) => {
						var dec = new TextDecoder();

						var data = {
							body: dec.decode(new Uint8Array(decrypted)),
							msgtype: "m.text",
						};

						return Promise.resolve(data);
					});
			}).catch(e => {

				return Promise.reject(e)
			})

			.finally(() => {
				delete event.decrypting;
			});

		event.decrypting = dpromise;

		return dpromise;
	};

	self.encryptEventGroup = async function (text) {
		var encryptedEvent = {
			msgtype: "m.encrypted",
			body: {},
		};

		return self.getOrCreateCommonKey().then((info) => {
			encryptedEvent.block = info.block;
			encryptedEvent.hash = info.hash;

			let utf8Encode = new TextEncoder();

			return pcryptoFile
				.encrypt(utf8Encode.encode(text), info.key)
				.then((encrypted) => {
					encryptedEvent.body = Buffer.from(encrypted).toString("hex");

					return Promise.resolve(encryptedEvent);
				});
		});
	};

	var decrypt = async function (keyData, { encrypted, nonce }) {
		var key = await miscreant.SIV.importKey(keyData, "AES-SIV");

		var _encrypted = new Uint8Array(f._base64ToArrayBuffer(encrypted));
		var _nonce = new Uint8Array(f._base64ToArrayBuffer(nonce));

		var k = await key.open(_encrypted, _nonce);

		var decrypted = await new TextDecoder().decode(k);

		return decrypted;
	};

	var encrypt = async function (text, keyData) {
		let key = await miscreant.SIV.importKey(keyData, "AES-SIV");

		let plaintext = new Uint8Array(new TextEncoder().encode(text));
		let nonce = new Uint8Array(32);

		window.crypto.getRandomValues(nonce);

		let ciphertext = await key.seal(plaintext, nonce);

		let encrypted = {
			encrypted: f._arrayBufferToBase64(ciphertext.buffer),
			nonce: f._arrayBufferToBase64(nonce.buffer),
		};

		return encrypted;
	};

	return self;
};

var PcryptoFile = function () {
	var self = this;
	var iv = [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];

	var readFile = function (file) {
		let reader = new FileReader();

		if (window.cordova) reader = reader._realReader;

		reader.readAsArrayBuffer(file);

		return new Promise((resolve, reject) => {
			reader.onloadend = function (evt) {
				resolve(reader.result);
			};

			reader.onerror = function () {
				reject(reader.error);
			};
		});
	};

	var convertFile = function (blob, file) {
		return new (window.wFile || window.File)([blob], "encrypted", {
			type: "encrypted/" + file.type,
			name: file.name,
		});
	};

	var convertDecryptedFile = function (blob, file) {
		return new (window.wFile || window.File)([blob], "decrypted", {
			type: (file.type || "").replace("encrypted/", ""),
			name: "Unnamed",
		});
	};

	self.randomkey = function () {
		return new Promise((resolve) => {
			var array = new Uint32Array(24);

			var token = window.crypto.getRandomValues(array).toString("hex");
			resolve(token);
		});
	};

	self.key = function (str) {
		let enc = new TextEncoder();

		function getKeyMaterial() {
			return window.crypto.subtle.importKey(
				"raw",
				enc.encode(str),
				"PBKDF2",
				false,
				["deriveBits", "deriveKey"]
			);
		}

		return getKeyMaterial().then((key) => {
			return window.crypto.subtle.deriveKey(
				{
					name: "PBKDF2",
					salt: enc.encode("matrix.pocketnet"),
					iterations: 10000,
					hash: "SHA-256",
				},

				key,

				{ name: "AES-CBC", length: 256 },

				true,

				["encrypt", "decrypt"]
			);
		});
	};

	self.encryptFile = function (file, secret, p) {
		return readFile(file)
			.then((r) => {
				return self.encrypt(r, secret, p);
			})
			.then((encrypted) => {
				return Promise.resolve(convertFile(encrypted, file));
			});
	};

	self.decryptFile = function (file, secret, p) {
		return readFile(file)
			.then((r) => {

				return self.decrypt(r, secret, p);
			})
			.then((decrypted) => {
				return Promise.resolve(convertDecryptedFile(decrypted, file));
			});
	};

	self.encrypt = function (strBytes, secret, p) {
		if (!strBytes || !secret) return Promise.reject("data");

		if (!p) p = {};

		p.charsetEnc = p.charsetEnc || "utf8";
		p.charsetDec = p.charsetDec || "hex";

		return self
			.key(secret)
			.then((key) => {
				return crypto.subtle.encrypt(
					{
						name: "AES-CBC",
						iv: new Uint8Array(iv),
					},
					key,
					strBytes
				);
			})
			.then(function (encrypted) {
				return encrypted;
			});
	};

	self.decrypt = function (encryptedBytes, secret, p) {
		if (!encryptedBytes || !secret) return Promise.reject("data");

		if (!p) p = {};

		p.charsetEnc = p.charsetEnc || "utf8";
		p.charsetDec = p.charsetDec || "hex";

		return self
			.key(secret)
			.then((key) => {
				if (!crypto.subtle) return Promise.reject("crypto.subtle");

				return crypto.subtle.decrypt(
					{
						name: "AES-CBC",
						iv: new Uint8Array(iv),
					},
					key,
					encryptedBytes
				);
			})
			.then(function (decrypted) {
				return decrypted;
			})
			.catch((e) => {
				console.error(e);
				return Promise.reject(e);
			});
	};

	return self;
};

var Pcrypto = function (core, p) {
	//const EC = require('elliptic').ec

	secp256k1CurveN = new BN(
		"fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",
		16
	);

	/////

	//console.log('secp256k1CurveN', secp256k1CurveN, secp256k1CurveN.toJSON())
	//console.log('bbn', bbn, bbn.toJSON())

	var self = this;
	var ls, lse;

	self.core = core;

	self.clearStorage = function () {
		self.core.mtrx.clearstorage("pcrypto");
	};

	self.currentblock = {
		height: 1,
	};

	self.blocks = {};

	self.user = null;
	self.rooms = {};

	self.init = function (user) {
		self.user = user;
	};

	self.destroy = function () {
		_.each(self.rooms, function (r) {
			r.clear();
		});

		self.rooms = {};
		/*self.user = null*/
	};

	self.addroom = function (chat) {
		return pretry(() => {
			return core.user.private && core.user.private.length == 12;
		}).then(async (r) => {
			if (self.rooms[chat.roomId]) {
				return self.rooms[chat.roomId].prepare();
			}

			var room = await new PcryptoRoom(self, chat, { ls, lse });

			self.rooms[chat.roomId] = room;

			return room.prepare();
		});
	};

	self.set = {
		block: function (block) {
			if (block && block.height > self.currentblock.height) {
				self.currentblock = block;
			}

			if (block.height) {
				self.blocks[block.height] = block;
			}
		},
	};

	self.helpers = {
		checkuser: function () {
			if (
				core.user &&
				core.user.private &&
				core.user.private.length == 12 &&
				core.user.userinfo &&
				core.user.userinfo.keys &&
				core.user.userinfo.keys.length
			) {
				var pk = core.user.userinfo.keys.join(",");

				var pk2 = _.map(core.user.private, function (p) {
					return p.public;
				}).join(",");

				return pk == pk2;
			}

			return false;
		},

		/*alternativeKeys : function(){
            if(core.user && core.user.private){

                var pk2 = _.map(core.user.private, function(p){
                    return p.public
                })

                return pk2

            }

            return []
        }*/
	};

	self.prepare = function () {
		return Promise.all([
			ChatStorage("messages", 1),
			ChatStorage("events", 1),
		]).then((r) => {
			ls = r[0];
			lse = r[1];

			return Promise.resolve();
		});
	};

	return self;
};

export default Pcrypto;
