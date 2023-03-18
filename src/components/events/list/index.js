import { mapState } from "vuex";
import f from "@/application/functions";

export default {
	name: "events",
	props: {
		timeline: Object,
		events: Array,
		chat: Object,
		loading: Boolean,
		scrollType: "",
		searchresults : null,
		error: [Object, Error, String],
		selectedMessages: [],
	},
	inject: [
		"matches",
		"menuState"
	],
	components: {},
	data: function () {
		return {
			type: "",
			tmt: null,
			lscroll: null,
			menuOpen: false,
			c: 1,
			ls: 0,
			voiceMessageQueue: [],
			countshow: 0,
			multiSelect: false,
		};
	},
	provide() {
		return {
			addToQueue: (message, id) => {
				var f = _.find(this.voiceMessageQueue, (v) => {
					return v.id == id;
				});

				if (!f)
					this.voiceMessageQueue = [...this.voiceMessageQueue, { message, id }];
			},
			playNext: (id) => {
				let current = this.sortedVoiceMessageQueue.findIndex((i) => {
					return i.id === id;
				});
				let next =
					current === -1 ? null : this.sortedVoiceMessageQueue[current + 1];
				if (next) {
					next.message.setTime(0);
					next.message.play();
				}
			},
		};
	},

	watch: {
		events: function () { },

		selectedMessages: {
			immediate: true,
			handler: function () {
				if (this.selectedMessages.length === 0) {
					this.multiSelect = false;
				}
			},
		},

		notificationCount: function () {
			if (
				this.lscroll &&
				this.lscroll.scrollTop < 180 &&
				this.chat &&
				this.chat.getUnreadNotificationCount()
			) {
				this.scrollToNew();
			}
		},
	},
	computed: {
		sortedVoiceMessageQueue() {
			return _.sortBy(this.voiceMessageQueue, (a) => {
				return a.id;
			});
		},

		ios() {
			return f.isios();
		},

		...mapState({
			auth: (state) => state.auth,
			mobile: (state) => state.mobile,
			scrollbottomshow: function () {
				return this.lscroll && this.lscroll.scrollTop > 500;
			},
			minimized: (state) => state.minimized,
			notificationCount: (state) => state.allnotifications,
		}),

		eventsByPages: function () {
			var ps = [];
			var pc = 0;

			_.each(this.events, function (e) {
				if (!pc) ps.push([]);

				ps[ps.length - 1].push(e);

				pc++;

				if (pc > 19) pc = 0;
			});

			return ps;
		},

		stringifyiedError: function () {
			return f.stringify(this.error);
		},
	},
	destroyed: function () {
		/*this.core.menu(null);*/
		this.menuState.set(null);
	},
	updated: function () {
		/*if(this.countshow === 0) {
	  this.scrollToReadMessages();
	}
	this.countshow = 1;*/
	},
	methods: {
		eventinsearchresult : function(event){

			if(this.searchresults){
				return _.find(this.searchresults, (e) => {
					return e.event.event_id == event.event.event_id
				})
			}

			return false
		},
		scrollToReadMessages: function () {
			/*if(this.notificationCount > 0) {
		const elem = document.getElementById("eventWrapper_" + (this.notificationCount + 1));

		if(elem)
		  elem.scrollIntoView()
	  }*/
		},
		shareEvent: function ({ event }) {
			this.$emit("shareEvent", { event });
		},
		showerror: function () {
			// stringifyiedError

			return this.$dialog
				.alert(this.stringifyiedError, {
					okText: "Ok",
					backdropClose: true,
				})
				.catch((e) => { });
		},

		dupdated: _.debounce(function () {
			this.$emit("updated", this.size());
		}, 75),

		dscroll: _.debounce(function () {
			return this.scroll();
		}, 35),

		ddscroll: function (e) {
			/*var _ls = this.$refs['container'].scrollTop

			if (Math.abs(_ls - this.ls) > 500 && this.c * _ls < this.c * this.ls){
			}
			else{
				this.ls = _ls
			}*/

			this.dscroll();
		},

		emounted: function () {
			this.$nextTick(function () {
				this.scrollCorrection();
				this.dupdated();
			});
		},
		scroll: function () {
			this.$emit("scroll", this.size());
		},

		size: function () {
			var s = {
				scrollHeight: 0,
				scrollTop: 0,
				clientHeight: 0,
			};

			if (this.$refs["container"]) {
				s.scrollHeight = this.$refs["container"].scrollHeight;
				s.scrollTop = this.c * this.$refs["container"].scrollTop;
				s.clientHeight = this.$refs["container"].clientHeight;
			}

			this.lscroll = s;

			return s;
		},

		editingEvent: function ({ event, text }) {
			this.$emit("editingEvent", { event, text });
		},

		replyEvent: function ({ event }) {
			this.$emit("replyEvent", { event });
		},

		removeEvent: function (event) {
			this.$emit("removeEvent", event);
		},

		showPhotoSwipe(index) {
			this.isOpen = true;
			this.$set(this.options, "index", index);
		},

		hidePhotoSwipe() {
			this.isOpen = false;
		},

		galleryOpen(e) {
			this.$emit("galleryEventOpen", e);
		},

		scrolldown() {
			this.scrollToNew(0);
		},

		scrollCorrection() {
			//this.scrollToNew(this.c * this.ls)
		},
		scrollToNew(s) {
			if (this.$refs["container"]) {
				this.$refs["container"].scrollTop = this.c * s;
			}
		},

		scrollToEvent(e) {
			if (this.$refs[e.event.event_id]){
				var r_element = this.$refs[e.event.event_id][0]
				this.scrollToNew(r_element.offsetTop - this.lscroll.clientHeight / 2 + r_element.clientHeight / 2)
				
				r_element.classList.add('attention')

				setTimeout(() => {
					r_element.classList.remove('attention')
				}, 1000)
			}
			//this.scrollToNew(120);
		},

		menuIsVisibleHandler: function (isVisible) {
			this.menuOpen = isVisible;
			this.$emit("menuIsVisible", isVisible);
		},

		mousewheel: function (e) {
			if (this.scrollType === "custom") {
				return;
			} else {
				e.preventDefault();
				this.$refs["container"].scrollTop += -e.deltaY;
				return false;
			}
		},
		showMultiSelect() {
			this.multiSelect = true;
		},
		selectMessage(message) {
			if (
				this.selectedMessages.filter(
					(item) => item.message_id === message.message_id
				).length === 0
			) {
				this.selectedMessages.push(message);
			}
		},
		removeMessage(message) {
			const index = this.selectedMessages.findIndex(
				(item) => item.message_id === message.message_id
			);
			if (index !== -1) {
				this.selectedMessages.splice(index, 1);
			}
		},

		toreference(reference) {

			this.$emit("toreference", reference);
		},
	},
};
