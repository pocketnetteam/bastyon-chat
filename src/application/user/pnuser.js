import User from "./user.js";
/*require("@/application/vendors/btc.js")*/
import f from "../functions.js";

class PNUser extends User {
	matrixCredentials = function () {
		var password = bitcoin.crypto
			.sha256(bitcoin.crypto.sha256(Buffer.from(this.credentials.privateKey)))
			.toString("hex");

		return Promise.resolve({
			address: this.credentials.address,
			password: password,
			type: "m.login.password",
			user: this.credentials.address,
			sessionId: "",
			username: this.credentials.address.toLowerCase(),
		});
	};

	initKeysProcess() {
		return this.initKeys().catch((update) => {
			if (!update || !_.isNumber(update)) {
				return Promise.reject(update);
			}

			return new Promise((resolve, reject) => {
				if (this.keysupdatetimeout) clearTimeout(this.keysupdatetimeout);

				this.keysupdatetimeout = setTimeout(function () {
					initKeysProcess().then(resolve).catch(reject);
				}, update);
			});
		});
	}

	initKeys() {
		if (!this.state) return Promise.reject();

		if (
			this.userinfo.name &&
			!this.userinfo.deleted &&
			(!this.userinfo.keys || !this.userinfo.keys.length)
		) {
			if (window.POCKETNETINSTANCE) {
				window.POCKETNETINSTANCE.platform.sdk.keys
					.init()
					.then((r) => {
						if (r == "exist") {
							return Promise.reject(60000);
						}

						if (r == "processing") {
							return Promise.reject(60000);
						}

						return Promise.reject(r);
					})
					.catch((e) => {
						//// say pocketnet to manual update

						return Promise.reject();
					});
			}

			return Promise.reject();
		}

		return Promise.resolve();
	}

	path33 = function (n) {
		return "m/33'/0'/0'/" + n + "'";
	};

	generateKeysLS(key, address) {
		var lsstorage = {};

		try {
			lsstorage = JSON.parse(localStorage["wifkeya"] || "{}");
		} catch (e) {}

		if (lsstorage.address != address) lsstorage = {};

		lsstorage.address = address;
		lsstorage.storage || (lsstorage.storage = []);

		var { ckeys } = this.generateKeys(key, lsstorage.storage);

		localStorage["wifkeya"] = JSON.stringify(lsstorage);

		return ckeys;
	}

	generateKeys(key, storage) {
		var ckeys = [];

		if (!storage) storage = [];

		if (key) {
			for (var i = 1; i < 13; i++) {
				var d =
					storage[i - 1] ||
					bitcoin.bip32.fromSeed(key).derivePath(this.path33(i)).toWIF();

				storage[i - 1] = d;

				var keyPair = bitcoin.ECPair.fromWIF(d);

				ckeys.push({
					pair: keyPair,
					public: keyPair.publicKey.toString("hex"),
					private: keyPair.privateKey,
				});
			}
		}

		return { ckeys, storage };
	}

	generateprivate() {}

	checkCredentials() {
		if (!this.credentials) {
			return Promise.reject("unauthorized");
		}

		var decodedAddress = f.hexDecode(this.credentials.address);

		console.log('decodedAddress', decodedAddress)

		try {
			var key = Buffer.from(this.credentials.privateKey, "hex");

			/*let keyPair = bitcoin.ECPair.fromPrivateKey(key)

            let address = bitcoin.payments['p2pkh']({ pubkey: keyPair.publicKey }).address

            if (address != decodedAddress){
                this.credentials.address = f.hexEncode(address)
            }*/

			setTimeout(() => {
				this.private = this.generateKeysLS(key, decodedAddress);
			}, 1000);
		} catch (e) {
			this.state = 0;
			return Promise.reject("unauthorized");
		}

		return this.core.api.pocketnet
			.userStateMe(decodedAddress)
			.then((r) => {
				//return Promise.reject('unknown')

				this.state = 1;
				return Promise.resolve(this.state);
			})
			.catch((e) => {
				//this.state = 1

				return Promise.reject("unknown");
			});
	}

	convertUser(info) {
		return {
			image: info.i || "",
			name: info.name ? decodeURI(info.name) : "",
			id: f.hexEncode(info.address),
			source: info,
			keys: _.filter((info.k || "").split(","), function (f) {
				return f;
			}),

			deleted: info.deleted,

			nocache: info.nocache || false,
		};
	}

	searchContacts(text) {
		let core = this.core;

		return this.core.api.pocketnet.search(text).then((infos) => {
			infos = _.map(infos, (info) => {
				info.nocache = true;

				return this.convertUser(info);
			});

			this.setUsersInfo(infos);

			return Promise.resolve(infos);
		});
	}
	userInfo(reload) {
		return this.usersInfo(this.credentials.address, false, reload).then(
			(info) => {
				this.userinfo = info[0];
				//this.userinfo.deleted = true

				return Promise.resolve(info[0]);
			}
		);
	}

	usersInfo(addresses, dontdecode, reload) {
		if (!_.isArray(addresses)) addresses = [addresses];

		if (!dontdecode)
			addresses = _.map(addresses, function (a) {
				return f.hexDecode(a);
			});

		return this.core.api.pocketnet
			.userInfoCached(addresses, reload)
			.then((infos) => {
				infos = _.map(infos, (info) => {
					return this.convertUser(info);
				});

				this.setUsersInfo(infos, reload);

				return Promise.resolve(infos);
			});
	}

	signature(str, exp) {
		if (!str) str = "pocketnetproxy";
		if (!exp) exp = 360;

		try {
			var keyPair = bitcoin.ECPair.fromPrivateKey(
				Buffer.from(this.credentials.privateKey, "hex")
			);

			const currentMomentInUTC = new Date().toISOString();

			var nonce =
				"date=" + currentMomentInUTC + ",exp=" + exp + ",s=" + f.hexEncode(str);

			var signature = keyPair.sign(bitcoin.crypto.sha256(Buffer.from(nonce)));

			var sobj = {
				nonce: nonce,
				signature: signature.toString("hex"),
				pubkey: keyPair.publicKey.toString("hex"),
				address: this.credentials.address,
				v: 1,
			};
		} catch (e) {
			return null;
		}

		return sobj;
	}

	getContacts() {
		if (this.state) {
			return Promise.resolve([]);

			return this.userInfo()
				.then((info) => {
					var addresses = _.map(info.source.subscribes, (s) => {
						return s.adddress;
					});

					return this.usersInfo(addresses, true);
				})
				.then((c) => {
					super.setContacts(c);

					return Promise.resolve(c);
				});
		}

		return Promise.reject("unauthorized");
	}
}

export default PNUser;
