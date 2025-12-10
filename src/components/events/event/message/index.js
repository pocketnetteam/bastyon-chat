import filePreview from "@/components/events/previews/filePreview/index.vue";
import actions from "@/components/events/event/actions/index.vue";
import fileMessage from "@/components/events/event/fileMessage/index.vue";
import listPreview from "@/components/events/event/message/listPreview/index.vue";
import f from "@/application/functions";
import url from "@/components/events/event/url/index.vue";
import imagesLoaded from "vue-images-loaded";
import dummypreviews from "@/components/chats/dummypreviews";
import IncomingMessage from "./incomingMessage/incomingMessage.vue";
import VoiceMessage from "@/components/events/event/VoiceMessage";
import Call from "@/components/events/event/Call";
import Request from "@/components/events/event/request";
import ReactionDisplay from "./reactions/ReactionDisplay.vue";

export default {
	name: "eventsMessage",
	props: {
		decryptEvent: {},
		origin: Object,
		prevevent: Object,
		event: Object,
		preview: Boolean,
		userinfo: Object,
		readed: Boolean,
		downloaded: Boolean,
		baseImg: {
			type: String,
			default: "empty"
		},
		filePreview: Object,
		imgEvent: {},
		add_image: Function,
		goToGallery: Function,
		chat: Object,
		encrypted: false,
		encryptedData: Boolean,
		decryptedInfo: null,
		error: String,
		withImage: Boolean,
		reference: Object,
		showmyicontrue: false,
		fromreference: Boolean,
		multiSelect: {
			default: false,
			type: Boolean
		},
		selectedMessages: {
			default: [],
			type: Array
		},
		audioBuffer: null
	},
	directives: {
		imagesLoaded
	},

	data: function () {
		return {
			referenceshowed: false,
			markedText: null,
			hasurlerror: null,
			donationColor: null,
			isHovering: false,
			reactionUpdateTrigger: 0,
			hoverTimeout: null,
			pendingRemovals: [],
			pendingAdditions: [],
			cancelledPendingAdditions: []
		};
	},
	inject: [
		"matches",
		"markText",
		"streamMode",
		"powerLevel",
		"adminActions",
		"menuState"
	],
	components: {
		actions,
		filePreview,
		fileMessage,
		listPreview,
		url,
		dummypreviews,
		IncomingMessage,
		VoiceMessage,
		Call,
		Request,
		ReactionDisplay
	},
	watch: {
		readyToRender: {
			immediate: true,
			handler: function () {
				if (this.readyToRender) this.$emit("readyToRender");
			}
		}
	},
	computed: {
		formattedErrorMessage() {
			if (!this.error) return;

			try {
				const error = JSON.parse(this.error);
				return (
					error.error ||
					error.message ||
					error.errcode ||
					this.$t("caption.error")
				);
			} catch (e) {
				return this.error;
			}
		},
		pkoindisabled: function () {
			return this.$store.state.pkoindisabled || false;
		},

		showburn: function () {
			if (new Date() < new Date(2021, 11, 28)) {
				return "";
			}

			if (
				-moment().diff(this.willburn, this.core.options.burn.v) <
				this.core.options.burn.b
			)
				return "big";

			if (
				-moment().diff(this.willburn, this.core.options.burn.v) <
				this.core.options.burn.m
			)
				return "medium";

			return "";
		},
		willburn: function () {
			var d = moment(this.origin.localTimestamp).add(
				this.core.options.burn.w,
				this.core.options.burn.v
			);

			return d;
		},

		readyToRender: function () {
			var r =
				(this.content.msgtype === "m.encrypted" &&
					!this.textWithoutLinks &&
					this.badenctypted) ||
				this.content.membership ||
				((this.content.msgtype === "m.text" ||
					this.content.msgtype === "m.encrypted") &&
					this.textWithoutLinks) ||
				this.file ||
				this.event.event.type === "m.room.request_calls_access" ||
				this.error ||
				(this.content.msgtype === "m.image" && this.imageUrl) ||
				(this.content.msgtype === "m.audio" && this.audioUrl) ||
				this.urlpreview ||
				this?.content?.call_id ||
				this.preview;

			return r;
		},
		my: function () {
			return this.userinfo.id === this.core.user.userinfo?.id;
		},
		stateChat: function () {
			var id = this.$route.query.id;

			return this.$store.state.chatsMap[id];
		},

		sending: function () {
			return this.origin.status == "sending";
		},

		showmeta: function () {
			if (!this.prevevent) return true;

			var prevuser = this.$f.getmatrixid(this.prevevent.getSender());

			var t = 10 * 60000;

			if (moment().diff(this.origin.localTimestamp, "days") != 0) {
				t = 60 * 1000 * 60 * 24;
			}

			if (
				prevuser != this.userinfo.id ||
				this.prevevent.localTimestamp + t < this.origin.localTimestamp
			) {
				return true;
			}
		},

		imageFrom: function () {
			if (this.content && this.content.info) return this.content.info.from;
		},

		showmyicon: function () {
			return (
				this.streamMode ||
				this.showmyicontrue ||
				this.content.msgtype === "m.image" ||
				this.content.msgtype === "m.file" ||
				this.urlpreview ||
				(!this.$store.state.active && this.$store.state.minimized)
			);
		},

		file: function () {
			if (this.content.msgtype === "m.file") {
				return this.body;
			}
		},

		replacedmintionsbody: function () {
			return this.body.replace(/@\w{68}:(\w{1,50})/g, function (str, l) {
				return "@" + l;
			});
		},

		body: function () {
			let bc = this.origin.event.content;

			if (bc.msgtype === "m.encrypted") {
				bc = this.decryptEvent;
			}

			var content = bc.pbody || bc.body || "";

			if (
				window.findAndReplaceLinkClear &&
				(typeof content === "string" || content instanceof String)
			)
				content = window.findAndReplaceLinkClear(content);

			if (bc.msgtype === "m.text") this.markMatches(content);

			return content;
		},

		content: function () {
			return this.origin.event.content;
		},

		badenctypted: function () {
			return this.decryptEvent.msgtype == "m.bad.encrypted";
		},

		textWithoutLinks: function () {
			var trimmed = this.$f.trim(this.body);

			if (this.hasurlerror) return trimmed;

			if (
				!this.urlpreview ||
				this.urlpreview.length < 10 ||
				(trimmed.indexOf(this.urlpreview) > 0 &&
					trimmed.indexOf(this.urlpreview) + this.urlpreview.length <
						trimmed.length)
			) {
				return trimmed;
			}

			return this.$f.trim(trimmed.replace(this.urlpreview, ""));
		},

		imageUrl: function () {
			if (this.content.msgtype === "m.image") {
				if (this.encryptedData && !this.hasError) {
					return this.decryptedInfo;
				} else {
					return this.content && this.content.url;
				}
			}
		},

		audioUrl: function () {
			if (this.content.msgtype === "m.audio") {
				if (this.hasError) return this.content?.url;
				if (this.encryptedData && this.decryptedInfo) return this.decryptedInfo;
				return this.audioBuffer;
			}
		},

		canediting: function () {
			var type = f.deep(this.origin, "event.type");

			if (type == "m.room.message") {
				if (
					(this.origin.event.content.msgtype == "m.encrypted" ||
						this.origin.event.content.msgtype == "m.text") &&
					!this.hasError
				) {
					return true;
				}
			}
		},

		cancopy: function () {
			var type = f.deep(this.origin, "event.type");

			if (type == "m.room.message") {
				if (
					this.origin.event.content.msgtype == "m.encrypted" ||
					this.origin.event.content.msgtype == "m.text"
				) {
					return true;
				}
			}
		},
		stringifyiedError: function () {
			return f.stringify(this.event.error);
		},
		hasError: function () {
			return !!this.stringifyiedError;
		},
		menuItems: function () {
			var type = f.deep(this.origin, "event.type") || "";

			var menu = [];

			if (type.indexOf("m.call") === -1) {
				menu.push({
					click: "reply",
					title: this.$i18n.t("button.reply"),
					icon: "fas fa-reply"
				});

				menu.push({
					click: "showMultiSelect",
					title: this.$i18n.t("button.select"),
					icon: "fas fa-check-circle"
				});

				menu.push({
					click: "share",
					title: this.$i18n.t("button.share"),
					icon: "fas fa-share-alt"
				});
			}

			if (this.my) {
				menu.push({
					click: "delete",
					title: this.$i18n.t("button.delete"),
					icon: "far fa-trash-alt"
				});
			}

			if (type === "m.room.message") {
				menu.unshift({
					click: "copy",
					title: this.$i18n.t("button.copy"),
					icon: "far fa-copy"
				});

				if (this.my && this.canediting)
					menu.unshift({
						click: "edit",
						title: this.$i18n.t("button.edit"),
						icon: "far fa-edit"
					});
			}

			return menu;
		},

		urlpreview: function () {
			if (
				(this.streamMode && this.content.url) ||
				(!this.streamMode &&
					!this.preview &&
					this.content.msgtype !== "m.file" &&
					this.content.msgtype !== "m.image" &&
					this.content.msgtype !== "m.audio")
			) {
				var url = f.getUrl(this.streamMode ? this.content.url : this.body);

				if (url) {
					try {
						var _u = new URL(url);

						if (_u.pathname == "/") {
							if (f.knsite(url)) return "";
						}

						return url;
					} catch (e) {
						return "";
					}
				}

				return url || "";
			}
		},

		edited: function () {
			if (this.content.edited) {
				return true;
			}

			if (
				this.origin.event.content["m.relates_to"] &&
				this.origin.event.content["m.relates_to"]["rel_type"] == "m.replace"
			) {
				return true;
			}
		},

		selectedMessage: function () {
			const elem = this.selectedMessages.filter(
				item => item.message_id === this.origin.event.event_id
			);
			return elem[0]?.message_id === this.origin.event.event_id ? true : false;
		},

		user: function () {
			return this.chat.getMember(this.chat.myUserId);
		},

		isBanned: function () {
			const id = this.event.event.user_id ?? this.event.event.sender,
				state = this.chat.currentState?.members[id]?.membership === "ban";

			if (this.my) this.userBanned.set(state);

			return state;
		},

		showReactions: function () {
			if (this.streamMode || this.preview || this.fromreference) {
				return false;
			}

			const isRedacted =
				(this.origin.getRedactionEvent && this.origin.getRedactionEvent()) ||
				(this.origin.localRedactionEvent && this.origin.localRedactionEvent());

			return !isRedacted;
		},

		isMenuAllowed: function () {
			return (
				(this.streamMode && !this.my) ||
				(!this.streamMode &&
					!this.content.call_id &&
					this.event.event.type !== "m.room.request_calls_access")
			);
		},

		reactions: function () {
			this.reactionUpdateTrigger;

			if (!this.origin || this.preview || this.fromreference) {
				return [];
			}
			const reactions = this.core.mtrx.getReactionsForMessage(this.origin);

			let processedReactions = reactions;

			if (this.pendingRemovals.length) {
				const currentReactionIds = new Set();
				processedReactions.forEach(r => {
					r.users.forEach(u => currentReactionIds.add(u.reactionEventId));
				});

				const stillPending = this.pendingRemovals.filter(id =>
					currentReactionIds.has(id)
				);

				if (stillPending.length !== this.pendingRemovals.length) {
				}

				processedReactions = processedReactions
					.map(r => {
						if (r.myReaction && this.pendingRemovals.includes(r.myReaction)) {
							const newR = { ...r };
							newR.count--;
							newR.myReaction = null;
							newR.users = newR.users.filter(
								u => !this.pendingRemovals.includes(u.reactionEventId)
							);
							return newR;
						}
						return r;
					})
					.filter(r => r.count > 0);
			}

			if (this.pendingAdditions.length) {
				const reactionMap = new Map();
				processedReactions.forEach(r => reactionMap.set(r.emoji, { ...r }));

				this.pendingAdditions.forEach(emoji => {
					let r = reactionMap.get(emoji);

					if (r) {
						if (!r.myReaction) {
							r.count++;
							r.myReaction = "pending_add_" + emoji;
							r.users = [
								...r.users,
								{ id: this.userinfo.id, reactionEventId: "pending" }
							];
						}
					} else {
						r = {
							emoji: emoji,
							count: 1,
							myReaction: "pending_add_" + emoji,
							users: [{ id: this.userinfo.id, reactionEventId: "pending" }]
						};
					}

					reactionMap.set(emoji, r);
				});

				processedReactions = Array.from(reactionMap.values()).sort(
					(a, b) => b.count - a.count
				);
			}

			return processedReactions;
		},

		quickReactionEmojis: function () {
			return ["👍", "❤️", "😂", "😮", "😢", "🔥"];
		}
	},

	mounted() {
		if (this.origin) {
			console.log(
				"Adding listener to origin:",
				this.origin.getId ? this.origin.getId() : "no-id"
			);
			this.origin.on("Event.relations", this.onEventRelationsChange);
			this.origin.on("MatrixEvent.relations", this.onEventRelationsChange);
		}
	},

	beforeDestroy() {
		if (this.origin) {
			this.origin.removeListener(
				"Event.relations",
				this.onEventRelationsChange
			);
			this.origin.removeListener(
				"MatrixEvent.relations",
				this.onEventRelationsChange
			);
		}
	},

	methods: {
		onEventRelationsChange(e) {
			console.log("Event.relations triggered!", e);
			this.reactionUpdateTrigger++;
		},

		gotoreference: function () {
			var id = this.reference.getId();

			this.$emit("gotoreference", id);
		},
		showError: function () {
			return this.$dialog
				.alert(this.stringifyiedError, {
					okText: "Ok",
					backdropClose: true
				})
				.catch(e => {});
		},
		showwhenburn: function () {
			var text = "";

			if (this.willburn.toDate() < new Date()) {
				text = this.$i18n.t("messagewasburn");
			} else {
				text = this.$i18n.t("messagewillburn");
			}

			this.$store.commit("icon", {
				icon: "info",
				message: text
			});
		},

		imagesLoaded: function () {
			this.updatedSize();
		},
		updatedSize: function (before) {
			this.$emit("updatedSize", before);
		},

		dropDownMenuShow: function (e) {
			if (this.streamMode) return;

			if (e?.button === 2) return e.preventDefault();

			setTimeout(() => {
				this.setmenu();
			}, 200);
		},
		prepareShare: function () {
			var sharing = {};

			if (this.content.msgtype === "m.image" && this.imageUrl)
				sharing.images = [this.imageUrl];

			if (this.content.msgtype === "m.audio" && this.audioUrl)
				sharing.audio = [this.audioUrl];

			if (
				this.content.msgtype === "m.text" ||
				this.content.msgtype === "m.encrypted"
			) {
				var trimmed = this.body ? this.$f.trim(this.body) : "";

				if (trimmed) {
					sharing.messages = [trimmed];
				}
			}

			if (this.file) {
				sharing.download = [
					{
						event: this.event,
						chat: this.chat
					}
				];
			}

			sharing.from = this.userinfo.id;
			sharing.senderName = this.userinfo.name;

			return sharing;
		},

		menushare: function () {
			this.$emit("share", this.prepareShare());

			return Promise.resolve();
		},

		menuresend: function () {
			this.$emit("resend");
			this.hideEventElement();
			return this.resendMessage().then(this.deleteMessage);
		},
		menuedit: function () {
			this.$emit("editing", this.body);

			return Promise.resolve();
		},

		menushowMultiSelect: function () {
			this.$emit("showMultiSelect");
			this.selectMessage();

			return Promise.resolve();
		},

		menureply: function () {
			this.$emit("reply");

			return Promise.resolve();
		},
		menucopy: function () {
			var txt = this.replacedmintionsbody;

			if (
				window.findAndReplaceLinkClear &&
				(typeof txt === "string" || txt instanceof String)
			)
				txt = window.findAndReplaceLinkClear(txt);

			this.$f.copytext(txt);

			return Promise.resolve();
		},
		deleteMessage: function () {
			this.$emit("remove");

			return this.core.mtrx.client.redactEvent(
				this.chat.roomId,
				this.origin.event.event_id,
				null,
				{
					reason: "messagedeleting"
				}
			);
		},
		menudelete: function () {
			return this.$dialog
				.confirm("Do you really want to delete message?", {
					okText: this.$i18n.t("yes"),
					cancelText: this.$i18n.t("cancel")
				})
				.then(() => {
					return this.deleteMessage();
				})
				.catch(e => {
					return Promise.resolve();
				});
		},
		menuItemClickHandler: function (item, d, p) {
			p.hidePopup();

			this["menu" + item.click]()
				.then(r => {})
				.catch(e => {
					p.showPopup();
				});
		},

		imagePaddingStyle: function (c) {
			if (c.info && c.info.h && c.info.w) {
				var cc = c.info.h / c.info.w;

				if (cc > 1.7) cc = 1.7;

				var h = "padding-bottom:" + cc * 100 + "%";

				return h;
			}

			return "";
		},
		parser(event) {
			return JSON.parse(event)["og:title"];
		},
		openImage(img) {
			this.$emit("openImg", img);
		},

		format_date(value) {
			return this.$f.format_date(value);
		},

		download: function () {
			this.$emit("download");
		},

		decryptagain: function () {
			this.$emit("decryptagain");
		},
		async resendMessage() {
			return this.event.event.content.resendMessage();
		},
		openImageGallery(msgEvent) {
			this.$emit("openGalleryImg", msgEvent);
		},
		reshareKeys() {
			let roomId = this.chat.roomId;
		},
		textDonation: function (withTx = false) {
			var from = this.$i18n.t("caption.somebody"),
				msg = "";
			try {
				from = this.$f.deep(
					this,
					"$store.state.users." + this.content.from
				).name;
			} catch (err) {}
			var to = this.$i18n.t("caption.somebody");
			try {
				to = this.$f.deep(this, "$store.state.users." + this.content.to).name;
			} catch (err) {}
			msg +=
				from +
				this.$i18n.t("caption.sent") +
				this.content.amount +
				this.$i18n.t("caption.sent") +
				to;
			return msg;
		},

		menuIsVisibleHandler(isVisible) {
			this.$emit("menuIsVisible", isVisible);
		},

		showreference: function () {
			this.$emit("toreference", this.reference);

			//this.referenceshowed = !this.referenceshowed;
		},

		selectMessage: function () {
			var sharing = this.prepareShare();

			this.$emit("selectMessage", {
				message_id: this.origin.event.event_id,
				sharing,
				time: this.origin._localTimestamp
			});
		},
		removeMessage: function () {
			this.$emit("removeMessage", {
				message_id: this.origin.event.event_id
			});
		},

		eventMessage: function (state) {
			state ? this.removeMessage() : this.selectMessage();
		},

		scrollTo: function () {
			const evtWrp = this.$el.parentElement.parentElement,
				parent = evtWrp.offsetParent;

			/*Scroll eventsflex to message*/
			if (parent)
				parent.parentNode.scrollTop = evtWrp.offsetTop - parent.offsetTop;
		},

		urlloaded: function (data) {
			if (!data) return;

			const holder = data?.el.find(".txcnt"),
				colors = {
					0.5: "blue",
					0.6: "violette",
					0.7: "cyan",
					0.8: "orange",
					0.9: "pink"
				};

			holder?.on("DOMSubtreeModified", () => {
				const value = parseFloat(holder.find(".output:eq(0) .amount").text());

				if (value > 0) {
					holder.off("DOMSubtreeModified");

					Object.keys(colors)
						.slice()
						.reverse()
						.every(amount => {
							if (value >= amount) {
								this.donationColor = `donation-message donation-color-${colors[amount]}`;
								return false;
							}

							return true;
						});

					if (this.event?.event?.unsigned?.age < 5000) {
						if (window.app.platform.donateAnimation) {
							window.app.platform.donateAnimation.inqueue({
								senderName: this.sender.name,
								senderMessage: this.body,
								value: value.toFixed(2)
							});
						}
					}
				}
			});
		},

		urlerror: function (e) {
			this.hasurlerror = e;
		},

		markMatches: function (content) {
			if (!this.matches || !this.markText) return;

			this.markedText = this.markText(content);

			this.$nextTick(() => {
				const localMsg =
						this.origin.localTimestamp !== this.origin.localTimestamp,
					matches = Array.from(this.$el.querySelectorAll("mark"));

				if (localMsg) matches.reverse();

				matches.forEach((mark, id) => {
					if (this.markedText) {
						mark.component = this;
						this.matches[`${localMsg ? "prepend" : "append"}`](mark);
					}
				});
			});
		},
		hideEventElement: function () {
			const eventElement = document.querySelector(
				`[event="${this.event.event.event_id}"]`
			);
			if (eventElement) {
				eventElement.style.display = "none";
			}
		},
		setmenu: function () {
			if (document.activeElement) document.activeElement.blur();
			this.menuState.set({
				items: this.menu(),
				item: {
					handleQuickReaction: this.handleQuickReaction
				}
			});
		},

		menu: function () {
			const type = f.deep(this.origin, "event.type") || "",
				menu = [];

			const canProcessMessage = type.indexOf("m.call") === -1 && !this.hasError;

			const isRedacted =
				(this.origin.getRedactionEvent && this.origin.getRedactionEvent()) ||
				(this.origin.localRedactionEvent && this.origin.localRedactionEvent());

			if (!this.streamMode && canProcessMessage && !isRedacted) {
				menu.quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🔥"];
			}

			if (canProcessMessage) {
				menu.push({
					action: this.menureply,
					text: "button.reply",
					icon: "fas fa-reply"
				});
			}

			if (!this.streamMode) {
				if (canProcessMessage) {
					menu.push({
						action: this.menushowMultiSelect,
						text: "button.select",
						icon: "fas fa-check-circle"
					});

					menu.push({
						action: this.menushare,
						text: "button.share",
						icon: "fas fa-share-alt"
					});
				}

				if (this.my) {
					menu.push({
						action: this.menudelete,
						text: "button.delete",
						icon: "far fa-trash-alt"
					});

					if (this.hasError) {
						menu.push({
							action: this.menuresend,
							text: "button.resend",
							icon: "fa fa-redo"
						});
					}
				}

				if (type === "m.room.message") {
					menu.unshift({
						action: this.menucopy,
						text: "button.copy",
						icon: "far fa-copy"
					});

					if (this.my && this.canediting)
						menu.unshift({
							action: this.menuedit,
							text: "button.edit",
							icon: "far fa-edit"
						});
				}
			} else {
				if (this.user.powerLevel >= this.powerLevel.administrator) {
					menu.push({
						action: () => this.adminActions.toggleModerStatus(this.sender),
						text: `caption.${
							this.sender.powerLevel === this.powerLevel.moderator
								? "cancelModeration"
								: "makeModerator"
						}`,
						icon: "fas fa-user-shield"
					});
				}

				if (this.user.powerLevel >= this.powerLevel.moderator) {
					menu.push({
						action: () => this.adminActions.toggleBanStatus(this.sender),
						text: `caption.${
							this.sender.membership === "ban" ? "removeBan" : "ban"
						}`,
						icon: "fas fa-user-times"
					});
				}
			}

			return menu;
		},

		handleAddReaction: function (emoji) {
			if (this.pendingAdditions.includes(emoji)) {
				return Promise.resolve();
			}

			this.pendingAdditions.push(emoji);
			this.reactionUpdateTrigger++;

			const promise = this.core.mtrx
				.sendReaction(this.chat, this.origin, emoji)
				.then(response => {
					if (this.cancelledPendingAdditions.includes(emoji)) {
						this.cancelledPendingAdditions =
							this.cancelledPendingAdditions.filter(e => e !== emoji);
						this.pendingAdditions = this.pendingAdditions.filter(
							e => e !== emoji
						);

						const eventId = response && response.event_id;
						if (eventId) {
							this.pendingRemovals = [...this.pendingRemovals, eventId];

							return this.core.mtrx
								.removeReaction(this.chat, eventId)
								.then(() => {});
						}
					}

					this.reactionUpdateTrigger++;
				})
				.catch(e => {
					console.error("Failed to send reaction:", e);
					const currentPending = this.pendingAdditions;
					this.pendingAdditions = currentPending.filter(e => e !== emoji);

					this.cancelledPendingAdditions =
						this.cancelledPendingAdditions.filter(e => e !== emoji);

					this.reactionUpdateTrigger++;
					this.$forceUpdate();

					this.$store.commit("icon", {
						icon: "error",
						message:
							this.$t("errors.reactionFailed") || "Failed to send reaction"
					});
				});

			return promise;
		},

		handleRemoveReaction: function (reactionEventId) {
			if (
				typeof reactionEventId === "string" &&
				reactionEventId.startsWith("pending_add_")
			) {
				const emoji = reactionEventId.replace("pending_add_", "");

				this.cancelledPendingAdditions.push(emoji);

				const index = this.pendingAdditions.indexOf(emoji);
				if (index > -1) {
					this.pendingAdditions.splice(index, 1);
				}

				this.reactionUpdateTrigger++;
				return Promise.resolve();
			}

			if (!reactionEventId) {
				console.error("handleRemoveReaction called with null/undefined ID");
				return Promise.resolve();
			}

			try {
				const reactions = this.core.mtrx.getReactionsForMessage(this.origin);
				let foundEmoji = null;

				for (const r of reactions) {
					const userReaction = r.users.find(
						u => u.reactionEventId === reactionEventId
					);
					if (userReaction) {
						foundEmoji = r.emoji;
						break;
					}
				}

				if (foundEmoji) {
					this.pendingAdditions = this.pendingAdditions.filter(
						e => e !== foundEmoji
					);
				}
			} catch (e) {}

			this.pendingRemovals.push(reactionEventId);

			this.reactionUpdateTrigger++;

			return this.core.mtrx
				.removeReaction(this.chat, reactionEventId)
				.then(() => {
					this.reactionUpdateTrigger++;
				})
				.catch(e => {
					console.error("Failed to remove reaction:", e);
					this.pendingRemovals = this.pendingRemovals.filter(
						id => id !== reactionEventId
					);
					this.reactionUpdateTrigger++;
				});
		},

		handleQuickReaction: function (emoji) {
			return this.handleAddReaction(emoji);
		},

		onMessageHover: function (isHovering) {
			if (this.hoverTimeout) clearTimeout(this.hoverTimeout);

			if (isHovering) {
				this.isHovering = true;
			} else {
				this.hoverTimeout = setTimeout(() => {
					this.isHovering = false;
				}, 200);
			}
		}
	}
};
