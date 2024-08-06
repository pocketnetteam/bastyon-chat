const ChatStorage = function (storageName, version, time) {
	/** Set this flag to TRUE if debug logs needed */
	const DebugFlag = false;
	const DebugForceLocalStorage = false;

	let debugLog = () => {};

	if (DebugFlag) {
		debugLog = console.log;
	}

	/** Time constants */
	const SecondsInHour = 60 * 60;
	const SecondsInDay = SecondsInHour * 24;
	const SecondsInMonth = SecondsInDay * 30;

	var cacheTime = time || SecondsInMonth;

	var memorystorage = {};

	/**
	 * Function generates UNIX timestamp
	 * floored to current hour.
	 *
	 * @return {number}
	 */
	function getHourUnixtime() {
		const dateNow = Math.floor(Date.now() / 1000);
		const hourUnix = dateNow - (dateNow % SecondsInHour);

		return hourUnix;
	}

	/**
	 * Using IndexedDB initializer
	 * if it is supported.
	 */
	function initIndexedDb() {
		let db;
		let openRequest;

		function openDatabase() {
			return new Promise((resolve, reject) => {
				openRequest = indexedDB.open(storageName, version);

				openRequest.onupgradeneeded = function (e) {
					let db = openRequest.result;

					const isVersionChanged = e.oldVersion !== e.newVersion;
					const didExistBefore = e.oldVersion === 0;

					if (isVersionChanged && !didExistBefore) {
						if (!db.objectStoreNames.contains("items")) {
							db.deleteObjectStore("items");
						}
					}

					if (!db.objectStoreNames.contains("items")) {
						db.createObjectStore("items", { keyPath: "id" });
					}
				};

				openRequest.onerror = function (err) {
					debugLog("PCryptoStorage error occurred:", err);
					reject("PCryptoStorage error initiating IndexedDB");
				};

				openRequest.onsuccess = function () {
					db = openRequest.result;
					db.onclose = function () {
						debugLog("PCryptoStorage DB closed");
						db = null;
					};
					resolve(db);
				};
			});
		}

		function getDatabase() {
			if (db) {
				return Promise.resolve(db);
			} else {
				return openDatabase();
			}
		}

		/**
		 * Function get all items to memory cache
		 */
		function getall() {
			return getDatabase().then((db) => {
				const transaction = db.transaction("items", "readonly");
				const items = transaction.objectStore("items");

				const req = items.getAll();

				return new Promise((resolve, reject) => {
					req.onsuccess = (data) => {
						const cursor = data.target.result;

						if (cursor) {
							cursor.forEach((item) => {
								memorystorage[item.id] = item.message;
							});
						}

						resolve();
					};

					req.onerror = (data) => {
						debugLog("PCryptoStorage CLEAR OUTDATED error", data);

						resolve();
					};
				});
			});
		}

		/**
		 * Function removes items cached
		 * in IndexedDB 30 days ago
		 */
		function clearOldItems() {
			return getDatabase().then((db) => {
				const timeFromCurrent = getHourUnixtime() - cacheTime;

				const transaction = db.transaction("items", "readwrite");
				const items = transaction.objectStore("items");

				const req = items.openCursor();

				return new Promise((resolve, reject) => {
					req.onsuccess = (data) => {
						const cursor = data.target.result;

						if (cursor) {
							if (timeFromCurrent >= cursor.value.cachedAt) {
								debugLog("PCryptoStorage CLEAR OUTDATED log", data);
								cursor.delete();
							}

							cursor.continue();
						}

						resolve();
					};

					req.onerror = (data) => {
						debugLog("PCryptoStorage CLEAR OUTDATED error", data);

						resolve();
					};
				});
			});
		}

		/**
		 * Function opens IDBDatabase transaction.
		 *
		 * @param {string} name - Name of IDBDatabase store
		 * @param {boolean} writeMode - Enable write mode
		 *
		 * @return {IDBTransaction}
		 */
		function openTransaction(name, writeMode = false) {
			return getDatabase().then((db) => {
				const transaction = db.transaction(
					name,
					writeMode ? "readwrite" : "readonly"
				);

				transaction.onsuccess = function (data) {
					debugLog("PCryptoStorage TRANSACTION finished", data);
				};

				transaction.onabort = function (data) {
					debugLog("PCryptoStorage TRANSACTION abort", data.target.error);
				};

				transaction.onerror = function (data) {
					debugLog("PCryptoStorage TRANSACTION error", data.target.error);
				};

				return transaction;
			});
		}

		const instanceFunctions = {
			clear: (itemId) => {
				debugLog("PCryptoStorage clearing", itemId);

				function executor(resolve, reject) {
					openTransaction("items", true).then((transaction) => {
						const items = transaction.objectStore("items");

						const req = items.delete(itemId);

						delete memorystorage[itemId];

						req.onsuccess = (data) => {
							debugLog("PCryptoStorage CLEAR log", data);
							resolve(true);
						};

						req.onerror = (data) => {
							debugLog("PCryptoStorage CLEAR error", data.target.error);
							reject(data.target.error);
						};
					});
				}

				return new Promise(executor);
			},
			set: (itemId, message) => {
				debugLog("PCryptoStorage writing", itemId);

				function executor(resolve, reject) {
					openTransaction("items", true).then((transaction) => {
						const items = transaction.objectStore("items");

						const unixtime = getHourUnixtime();

						const item = {
							id: itemId,
							message,
							cachedAt: unixtime,
						};

						memorystorage[itemId] = message;

						const req = items.put(item);

						req.onsuccess = function (data) {
							debugLog("PCryptoStorage SET log", data);
							resolve(true);
						};

						req.onerror = function (data) {
							debugLog("PCryptoStorage SET error", data.target.error);
							reject(data.target.error);
						};
					});
				}

				return new Promise(executor);
			},
			get: (itemId) => {
				debugLog("PCryptoStorage reading", itemId);

				function executor(resolve, reject) {
					if (memorystorage[itemId]) {
						return resolve(memorystorage[itemId]);
					}

					openTransaction("items").then((transaction) => {
						const items = transaction.objectStore("items");

						const req = items.get(itemId);

						req.onsuccess = (data) => {
							debugLog("PCryptoStorage GET log", data, req.result);

							if (!req.result) {
								reject("Data does not exist");
								return;
							}

							const foundMessage = "message" in req.result;

							if (!foundMessage) {
								reject("Message property does not exist");
								return;
							}

							memorystorage[itemId] = req.result.message;

							resolve(req.result.message);
						};

						req.onerror = (data) => {
							reject(data.target.error);
						};
					});
				}

				return new Promise(executor);
			},
		};

		function executor(resolve, reject) {
			openDatabase()
				.then((db) => {
					clearOldItems()
						.then((r) => {
							return getall();
						})
						.then((r) => {
							resolve(instanceFunctions);
						});
				})
				.catch((err) => {
					reject("PCryptoStorage error initiating IndexedDB");
				});
		}

		return new Promise(executor);
	}

	/**
	 * Using LocalStorage initializer
	 * if IndexedDB is not supported.
	 */
	function initLocalStorage() {
		/**
		 * Function removes items cached
		 * in LocalStorage 7 days ago
		 */
		function clearOldItems() {
			const timeFromCurrent = getHourUnixtime() - SecondsInDay * 7;

			let k = Object.keys(localStorage);

			let msgItems = k.filter((item) => item.includes(storageName));

			msgItems.forEach((msgItem) => {
				const msg = JSON.parse(localStorage[msgItem]);

				if (timeFromCurrent >= msg.cachedAt) {
					delete localStorage[msgItem];
				}
			});
		}

		const instanceFunctions = {
			clear: async (itemId) => {
				debugLog("PCryptoStorage clearing localstorage", itemId);

				const itemName = `${storageName}_${itemId}`;

				const isItemSet = itemName in localStorage;

				if (!isItemSet) {
					throw Error("Data does not exist");
				}

				const foundMessage = "message" in localStorage[itemName];

				if (!foundMessage) {
					throw Error("Message property does not exist");
				}

				delete localStorage[itemName];

				return new Promise(executor);
			},
			set: async (itemId, message) => {
				debugLog("PCryptoStorage writing localstorage", itemId);

				const itemName = `${storageName}_${itemId}`;
				const unixtime = getHourUnixtime();

				const item = {
					message,
					cachedAt: unixtime,
				};

				localStorage[itemName] = JSON.stringify(item);
			},
			get: async (itemId) => {
				debugLog("PCryptoStorage reading", itemId);

				const itemName = `${storageName}_${itemId}`;

				const isItemSet = itemName in localStorage;

				if (!isItemSet) {
					throw Error("Data does not exist");
				}

				return localStorage[itemName];
			},
		};

		/** Clearing old items on init */
		clearOldItems();

		return instanceFunctions;
	}

	/**
	 * Is IndexedDB supported?
	 */
	if (!window.indexedDB || DebugForceLocalStorage) {
		debugLog("PCryptoStorage LOCALSTORAGE_FALLBACK");
		return initLocalStorage();
	}

	return initIndexedDb();
};

export default ChatStorage;
