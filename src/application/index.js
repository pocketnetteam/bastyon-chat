import MTRX from "./mtrx.js";
import Notifier from "./notifier.js";
import PNUser from "./user/pnuser.js";
import ApiWrapper from "./api.js";
import Pcrypto from "./pcrypto.js";
import listeners from "./listeners";
import f from "./functions";
import Media from "./media";
import Exporter from "./exporter";
/*
import pcm from '@/application/utils/pcm.js'
let Mp3 = require('js-mp3');
*/
/*
var {register} = require('extendable-media-recorder')
var {connect} = require('extendable-media-recorder-wav-encoder')*/

import AudioRecorder from "audio-recorder-polyfill";
import mpegEncoder from "audio-recorder-polyfill/mpeg-encoder";

AudioRecorder.encoder = mpegEncoder;
AudioRecorder.prototype.mimeType = "audio/mpeg";

class Core {
	constructor(vm, p) {
		if (!p) p = {};

		this.options = {
			listofproxies: p.listofproxies,
		};

		if (!p.mtrx) p.mtrx = {};
		p.mtrx.baseUrl = "https://" + p.domain;

		if (p.mtrx.baseUrl == "https://test.matrix.pocketnet.app") {
			this.options.burn = {
				v: "minutes",
				w: 120,
				m: 30,
				b: 15,
			};
		} else {
			this.options.burn = {
				v: "days",
				w: 7,
				m: 2,
				b: 1,
			};
		}

		this.apiHandlers = {
			error: function () {},
			success: function () {},
		};

		this.domain = p.domain;

		this.vm = vm;
		this.mtrx = new MTRX(this, p.mtrx);
		this.user = new PNUser(this, p.user || {});
		this.notifier = new Notifier(this, p.notifier || {});
		this.pcrypto = new Pcrypto(this, p.pcrypto || {});
		this.api = new ApiWrapper(this, p.servers);

		this.onlineListener = new listeners.online(this);
		this.focusListener = new listeners.focus(this);
		this.online = true;
		this.focus = true;
		this.store = vm.$store;
		this.loading = true;

		this.external = {};
		this.hiddenInParent = false;

		this.customRecorderConnected = false;

		this.pcrypto.init(this.user);

		this.media = new Media();
		this.audioContext = null;
		this.exporter = new Exporter(this)
	}

	hideOptimization = function (v) {
		//this.hideOptimization = v
		this.store.commit("hideOptimization", v);
	};

	hideInParent = function (v) {
		this.hiddenInParent = v;
		this.store.commit("hiddenInParent", v);


		if (v)
			this.mtrx.searchEngine.stopall()

		/*if(!v)
            this.store.commit('wasunhidden', true)*/
	};

	setCalls = function () {
		console.log("set calls");
		try {
			let p = {
				el: document.querySelector("body"),
				parameters: {
					getUserInfo: async (address) => {
						address = f.hexDecode(address.split(":")[0].replace("@", ""));
						return this.user.usersInfo([address], true, false);
					},
					getWithLocale: (key) => {
						console.log(this);
						return this.vm.$i18n.t(key);
					},


				},
			};

			if (window.POCKETNETINSTANCE && window.POCKETNETINSTANCE.platform) {
				p = window.POCKETNETINSTANCE.platform.getCallsOptions();
			}

			if (typeof BastyonCalls) {
				this.mtrx.bastyonCalls = new BastyonCalls(
					this.client || client,
					matrixcs,
					p.el,
					p.parameters
				);
				this.mtrx.bastyonCalls.on("initcall", (call) => {
					console.log("---catch init call", call);
					if (this.vm.$store.state.currentPlayingVoiceMessage) {
						this.vm.$store.state.currentPlayingVoiceMessage.pause();
					}

					if (window?.POCKETNETINSTANCE?.playingvideo) {
						console.log(window.POCKETNETINSTANCE.playingvideo);
						window?.POCKETNETINSTANCE?.playingvideo.pause();
						if (document.exitFullscreen) {
							document.exitFullscreen();
						} else if (document.webkitExitFullscreen) {
							document.webkitExitFullscreen();
						} else if (document.mozCancelFullScreen) {
							document.mozCancelFullScreen();
						} else if (document.msExitFullscreen) {
							document.msExitFullscreen();
						}
					}
					if (p?.parameters?.onInitCall){
						p.parameters.onInitCall(call)
					}
				});
				this.mtrx.bastyonCalls.on("error", (err) => {
					console.log("---catch error", err);
					if (p?.parameters?.onError) {
						p.parameters.onError(err)
					}

				});
				this.mtrx.bastyonCalls.on("connected", (call) => {
					console.log("---catch connected", call);
					if (p?.parameters?.onConnected) {
						p.parameters.onConnected(call)
					}

				});
				this.mtrx.bastyonCalls.on("ended", (call) => {
					console.log("---catch ended", call);
					if (p?.parameters?.onEnded) {
						p.parameters.onEnded(call)
					}

				});
			}

			this.store.commit("SET_CALL", this.mtrx.bastyonCalls ? true : false);
		} catch (e) {
			console.log(e);
			return;
		}

		console.log("Calls ready");
	};
	canback = function () {
		return this.store.state.gallery ? false : true;
	};

	update = function ({ block }) {
		this.pcrypto.set.block(block);
	};

	logerror = function (type, data) {
		if (window.POCKETNETINSTANCE) {
			window.POCKETNETINSTANCE.Logger.error({
				err: type,
				payload: data,
				code: 402,
			});
		}
	};

	destroy = function () {
		this.store.commit("clearall");
		this.removeEvents();

		if (!this.vm.$route.name != "chats")
			this.vm.$router.push("/chats").catch((e) => {});

		this.user.destroy();
		this.mtrx.destroy();
		this.pcrypto.destroy();

		if (window.POCKETNETINSTANCE) {
			window.POCKETNETINSTANCE.platform.matrixchat.unlink(this);
		}

		this.vm.$destroy();

		if (this.mtrx.bastyonCalls)
			this.mtrx.bastyonCalls.destroy()
	};

	init = function () {
		this.focusListener.init();
		this.onlineListener.init();

		this.initEvents();

		if (window.POCKETNETINSTANCE) {
			window.POCKETNETINSTANCE.platform.matrixchat.link(this);
		}
	};

	setUnauthorized = function (v) {
		this.unauthorized = v;
		this.store.commit("SET_UNAUTHORIZED", v);
	};

	initWithUserBase = function () {
		this.loading = true;

		return this.user
			.checkCredentials()
			.then((state) => {
				return this.user.userInfo();
			})
			.then((r) => {
				if (!r) {
					return Promise.reject("unknown");
				}

				if (r.deleted) {
					return Promise.reject("deleted");
				}

				return this.pcrypto.prepare();
			})
			.then((r) => {
				return this.mtrx.init();
			})
			.then((r) => {
				this.loading = false;
				this.setUnauthorized(null);

				this.pcrypto.helpers.checkuser();

				if (f.deep(this.user, "userinfo.name"))
					this.mtrx.client.setDisplayName(f.deep(this.user, "userinfo.name"));

				if (this.vm.$store.state.isCallsEnabled) {
					this.setCalls();
				}

				return Promise.resolve();
			})
			.catch((e) => {
				console.log("E", e);

				this.loading = false;

				if (e == "unauthorized" || e == "unknown" || e == "deleted") {
					this.setUnauthorized(e);
				}

				return Promise.resolve();
			});
	};

	initWithUser = function (credentials) {
		this.user.setCredentials(credentials);

		return this.initWithUserBase()
			.then(() => {
				return this.user.initKeysProcess();
			})
			.catch((e) => {
				return Promise.resolve();
			});
	};

	waitonline = function () {
		if (this.online) return Promise.resolve();

		return new Promise((resolve, reject) => {
			f.retry(
				() => {
					return this.online;
				},
				function () {
					resolve();
				},
				5
			);
		});
	};

	removeEvents = function () {
		delete this.focusListener.clbks.resume.core;
		delete this.focusListener.clbks.pause.core;
		delete this.onlineListener.clbks.online.core;
		delete this.onlineListener.clbks.offline.core;
	};

	initEvents = function () {
		this.focusListener.clbks.resume.core = (time) => {
			this.focus = this.focusListener.focus;

			if (time > 60) {
			}
		};

		this.focusListener.clbks.pause.core = () => {
			this.focus = this.focusListener.focus;
		};

		this.onlineListener.clbks.online.core = (time) => {
			this.online = this.onlineListener.online;
		};

		this.onlineListener.clbks.offline.core = () => {
			this.online = this.onlineListener.online;
		};
	};

	externalLink = function (pobj) {
		this.external = pobj;
	};

	destroyExternalLink = function () {
		this.external = {};
	};

	currentTime = function () {
		var created = Math.floor(new Date().getTime() / 1000);

		if (this.timeDifference) {
			created += this.timeDifference;
		}

		return created;
	};

	wait = function () {
		return f
			.pretry(() => {
				return !this.loading;
			})
			.then(() => {
				return Promise.resolve();
			});
	};

	renderChatToElement = function(element, roomid, p){
		return this.exporter.chat(element, roomid, p)
	};

	joinRoom(roomid) {
		return this.wait()
			.then(() => {
				return this.mtrx.wait();
			})
			.then(() => {
				if (this.unauthorized) {
					this.store.commit("JOINROOM", roomid);

					return Promise.reject(this.unauthorized);
				}

				return Promise.resolve();
			})
			.then((info) => {
				if (this.store.state.chatsMap[roomid]) {
					/// old chat
					this.vm.$router.push("/chat?id=" + roomid).catch((e) => {});
				} else {
					this.store.commit("JOINROOM", roomid);
					this.vm.$router.push("/publicPreview?id=" + roomid).catch((e) => {});
				}

				return Promise.resolve();
			});
	}

	connect(address) {
		return this.wait()
			.then(() => {
				return this.mtrx.wait();
			})
			.then(() => {
				if (this.unauthorized) {
					this.store.commit("CONNECT", f.hexEncode(address));

					return Promise.reject(this.unauthorized);
				} else {
					return this.user.usersInfo([address], true);
				}
			})
			.then((info) => {
				var roomId = this.mtrx.kit.tetatetid(info[0], this.user.userinfo);

				if (!roomId) return Promise.reject("roomId");

				if (this.store.state.chatsMap[roomId]) {
					/// old chat

					this.gotoRoute("/chat?id=" + roomId);
					/*this.vm.$router.push('/chat?id=' + roomId).catch(e => {
                    console.error('e', e)
                })*/
				} else {
					this.gotoRoute("/contact?id=" + f.hexEncode(address));
					//this.store.commit('CONTACT', roomId)
					//this.gotoRoute('/chat?id=' + roomId + '&u=' + f.hexEncode(address))
				}

				return Promise.resolve();
			});
	}

	cancelshare() {
		this.store.commit("SHARE", null);

		return Promise.resolve();
	}

	share(share) {
		this.store.commit("SHARE", share);

		this.vm.$router.push("/chats").catch((e) => {});

		return Promise.resolve();
	}

	goto(roomId) {
		this.cancelDefaultRoute = true;

		this.mtrx.wait().then(() => {
			this.vm.$router.push("/chat?id=" + roomId).catch((e) => {});
		});
	}

	gotoRoute(route) {
		this.cancelDefaultRoute = true;

		this.mtrx.wait().then(() => {
			this.vm.$router.push(route).catch((e) => {});
		});
	}

	updateUser() {
		return this.user.userInfo(true).then((r) => {
			/*if (this.unauthorized){
                return this.initWithUserBase()
            }*/
		});
	}

	isactive() {
		return (
			this.vm.$store.state.minimized &&
			this.vm.$store.state.active &&
			this.vm.$store.state.pocketnet
		);
	}

	sitemessage(title) {
		var position = "bottom-right";

		if (this.vm.$store.state.mobile) {
			position = "top-left";
		}

		this.vm.$message({
			title: title,
			zIndex: 999,
			supportHTML: true,
			wrapperClassName: "notificationWrapper",
			position: position,
			type: "info",
			duration: 2000,
		});
	}

	menu(v) {
		this.store.commit(
			"SET_MENU",
			v
				? {
						items: v.items,
						item: v.item,
						handler: v.handler,
				  }
				: null
		);
	}

	invitepnt() {
		var ui = f.deep(this, "user.userinfo.source");

		if (ui) {
			if (window.POCKETNETINSTANCE && window.POCKETNETINSTANCE.platform) {
				if (this.backtoapp) this.backtoapp();

				window.POCKETNETINSTANCE.platform.ui.socialshare(
					"welcome?connect=" + ui.address,
					{
						sharing: {
							image: "",
							images: [ui.i],
							title: this.vm.$i18n.t("caption.joinApp"),
							html: {
								body:
									this.vm.$i18n.t("caption.joinApp") +
									" " +
									this.vm.$i18n.t("caption.hasInvitedToJoin"),
								preview:
									this.vm.$i18n.t("caption.joinApp") +
									" " +
									this.vm.$i18n.t("caption.hasInvitedToJoin"),
							},

							text: {
								body:
									this.vm.$i18n.t("caption.joinApp") +
									" " +
									this.vm.$i18n.t("caption.hasInvitedToJoin"),
								preview:
									this.vm.$i18n.t("caption.joinApp") +
									" " +
									this.vm.$i18n.t("caption.hasInvitedToJoin"),
							},
						},
						embedding: {
							type: "connect",
							id: ui.address,
						},
					}
				);
			} else {
				var l = "https://bastyon.com/welcome?connect=" + ui.address;

				f.copytext(l);

				this.sitemessage("The link was copied successfully");
			}
		} else {
			this.sitemessage("The error was occuried");
		}
	}

	async convertAudioToBase64(blob) {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		return new Promise((resolve) => {
			reader.onloadend = () => {
				resolve(reader.result);
			};
		});
	}

	/*async connectCustomRecorder() {

        if (this.customRecorderConnected) return
            this.customRecorderConnected = true
  
        await register(await connect());
        
    }*/

	/*mp3ToWav(base64Audio){

        var mp3ArrayBuffer = f._base64ToArrayBuffer(base64Audio.split(',')[1])

        var decoder = Mp3.newDecoder(mp3ArrayBuffer);
        var pcmArrayBuffer = decoder.decode();

        var dataURI = new pcm({channels: 1, rate: 8000, depth: 8}).toWav(pcmArrayBuffer).encode();

        return dataURI

    }*/

	initMediaRecorder() {
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			return this.media
				.get({ audio: true })
				.then((stream) => {
					let mediaRecorder = new AudioRecorder(stream, {
						audioBitsPerSecond: 32000,
					});

					return mediaRecorder;
				})
				.catch(function (err) {
					return Promise.reject(err);
				});
		} else {
			return Promise.reject();
		}
	}

	getAudioContext() {
		if (this.audioContext && this.audioContext.state != "closed") {
			if (this.audioContext.state === "suspended") this.audioContext.resume();

			return this.audioContext;
		} else {
		}

		this.audioContext =
			new (window.AudioContext || window.webkitAudioContext)() || null;

		if (f.isios() && window.unmute) {
			unmute(this.audioContext, false, false);
		}

		return this.audioContext;
	}
}

export default Core;
