//require('ion-sound')
import f from "./functions";
//const { Howl, Howler } = require('howler');

class Notifier {
	constructor(core, p) {
		if (!p) p = {};

		this.core = core;
		this.showed = JSON.parse(localStorage[this.key] || "{}");

		this.ion = null;

		if (typeof ion != "undefined") this.ion = ion;

		/*ion.sound({
		  sounds: [
			{
			  name: "glass"
			}
		  ],
		  path: "sounds/",
		  preload: true
		});*/
	}

	key = "showednotifications";
	showed = {};

	addshowed(id) {
		this.showed = JSON.parse(localStorage[this.key] || "{}");
		this.showed[id] = true;
		localStorage[this.key] = JSON.stringify(this.showed);
	}

	clearshowed() {
		this.showed = {};
		localStorage[this.key] = JSON.stringify(this.showed);
	}

	playsound() {
		// If cordova is available, use the media plugin to play a sound
		if (
			window.Media &&
			window.cordova &&
			window.cordova.file &&
			window.cordova.file.applicationDirectory
		) {
			return;

			var soundSrc =
				window.cordova.file.applicationDirectory + "www/sounds/glass.mp3";
			if (soundSrc.startsWith("file://")) soundSrc = soundSrc.substring(7);
			var notificationSound = new Media(soundSrc);
			// Play audio
			notificationSound.play();
		}

		// Else, try to use the Howler sound plugin
		else if (window.ion) {
			ion.sound.play("glass");

			/*var notificationSound = new Howl({
				src: ['sounds/glass.mp3'],
				html5: true
			});
			notificationSound.play();*/
		}
	}

	notifySoundOrAction() {
		var lastsounddate = localStorage["lastsounddate"] || null;

		if (lastsounddate) {
			lastsounddate = new Date(lastsounddate);

			if (f.date.addseconds(lastsounddate, 10) > new Date()) {
				return;
			}
		}

		localStorage["lastsounddate"] = new Date();

		if (window.cordova && window.POCKETNETINSTANCE) {
			window.POCKETNETINSTANCE.mobile.vibration.small();
		} else {
			this.playsound();
		}
	}

	decrypt(event, chat) {

		

		return this.core.mtrx.kit.allchatmembers([chat], false, true).then(() => {
			return this.core.mtrx.kit.prepareChat(chat)
		}).then((r) => {
			if (event.event.decrypted) {
				return Promise.resolve();
			}

			return chat.pcrypto.decryptEvent(event.event);
		})
		.catch((e) => {
			return Promise.resolve();
		});
	}

	message(event, user, chat) {
		var state = this.core.vm.$store.state;

		if (this.showed[event.event.event_id]) return;

		this.addshowed(event.event.event_id);

		var external = f.deep(this, "core.external.clbks.NOTIFICATION") || {};
		var ctype = "";

		var t = f.deep(event, "event.type") || '';

		if (t.indexOf('m.call') > -1) return

		if (["m.room.member"].indexOf(t) > -1) ctype = "invite";
		if (["m.room.message"].indexOf(t) > -1) ctype = "message";
		if (["m.room.name"].indexOf(t) > -1) ctype = "";
		if (["m.room.power_levels"].indexOf(t) > -1) ctype = "moder";
		if (["m.room.redaction"].indexOf(t) > -1) ctype = "redaction";
		if (f.deep(event, "event.content.msgtype") == "m.encrypted")
			ctype = "encrypted";

		var c = () => {
			var msg = {
				title: user.name,
				event: event,
				message:
					event.event.content.type == "m.encrypted"
						? "***"
						: event.event.content.body, // event.content.body,
				roomId: event.event.room_id,
				icon: user.image,
				chat: chat,
				ctype: ctype,
			};

			_.each(external, function (e) {
				e(msg);
			});

			if (
				state.currentRoom === event.event.room_id &&
				!this.core.hiddenInParent
			) {
				return;
			}

			this.notifySoundOrAction();
			this.show(msg, "/chat?id=" + event.event.room_id);
		};

		if (ctype == "encrypted") {
			this.decrypt(event, chat).then(c);
		} else {
			c();
		}
	}

	event(event, chat) {
		let pushAction = this.core.mtrx.client.getPushActionsForEvent(event);

		if (!pushAction.notify && event.event.type !=="m.room.request_calls_access") return;
		//let timeFromNow = moment(moment.utc(event.event.origin_server_ts).toDate()).local().fromNow()

		var date = moment(moment.utc(event.event.origin_server_ts).toDate())
			.local()
			.toDate();
		var iftime = f.date.addseconds(date, 10) > moment().toDate();

		if (!iftime) return;

		var r = this.core.mtrx.isReaded(event, true)
		
		if (r) return;

		if (
			!this.core.mtrx.me(event.getSender()) &&
			event.getSender() &&
			event.getSender() !== this.core.mtrx.client.credentials.userId
		) {
			this.core.user
				.usersInfo([f.getmatrixid(event.getSender())])
				.then((info) => {
					if (info && info[0]) {
						this.message(event, info[0], chat);
					}
				});
		}
	}

	show = function (info, click) {
		if (typeof click != "function") {
			var route = click;
			click = () => {
				this.core.vm.$router.push(route).catch((e) => {});

				if (this.core.apptochat) this.core.apptochat();
			};
		}

		var position = "bottom-right";

		if (this.core.vm.$store.state.mobile) {
			position = "top-left";
		}

		this.core.vm.$message({
			event: info.event,
			title: info.title,
			message: info.message,
			roomId: info.roomId,
			iconImg: info.icon || null,
			onClick: click,
			zIndex: 999,
			supportHTML: true,
			wrapperClassName: "notificationWrapper",
			position: position,
			type: "info",
			chat: info.chat,
			duration: 5000,
		});
	};
}

export default Notifier;
