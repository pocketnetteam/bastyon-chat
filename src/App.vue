<template>
	<div id="matrix-root" :theme="theme" class="app">
		<div
			class="rootcontent"
			:class="{
				pip,
				bin: pocketnet,
				fix: pocketnet,
				bout: !pocketnet,
				minimized,
				active,
				mobile,
				unselect,
			}"
		>
			<div class="chatwrapper" @click="iteraction">
				<div>
					<div class="backface" v-if="closebybg" @click="hide"></div>

					<MainWrapper />

					<preloader v-if="globalpreloader" />

					<transition name="fade">
						<div class="fixedallwrapper likeoffline" v-if="unauthorized">
							<userUnauthorized />
						</div>
					</transition>
				</div>
			</div>
		</div>

		<div hidden="" id="sprite-plyr">
			<!--?xml version="1.0" encoding="UTF-8"?-->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
			>
				<symbol id="plyr-airplay">
					<path
						d="M16 1H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3v-2H3V3h12v8h-2v2h3a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"
					></path>
					<path d="M4 17h10l-5-6z"></path>
				</symbol>
				<symbol id="plyr-captions-off">
					<path
						d="M1 1c-.6 0-1 .4-1 1v11c0 .6.4 1 1 1h4.6l2.7 2.7c.2.2.4.3.7.3.3 0 .5-.1.7-.3l2.7-2.7H17c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1H1zm4.52 10.15c1.99 0 3.01-1.32 3.28-2.41l-1.29-.39c-.19.66-.78 1.45-1.99 1.45-1.14 0-2.2-.83-2.2-2.34 0-1.61 1.12-2.37 2.18-2.37 1.23 0 1.78.75 1.95 1.43l1.3-.41C8.47 4.96 7.46 3.76 5.5 3.76c-1.9 0-3.61 1.44-3.61 3.7 0 2.26 1.65 3.69 3.63 3.69zm7.57 0c1.99 0 3.01-1.32 3.28-2.41l-1.29-.39c-.19.66-.78 1.45-1.99 1.45-1.14 0-2.2-.83-2.2-2.34 0-1.61 1.12-2.37 2.18-2.37 1.23 0 1.78.75 1.95 1.43l1.3-.41c-.28-1.15-1.29-2.35-3.25-2.35-1.9 0-3.61 1.44-3.61 3.7 0 2.26 1.65 3.69 3.63 3.69z"
						fill-rule="evenodd"
						fill-opacity=".5"
					></path>
				</symbol>
				<symbol id="plyr-captions-on">
					<path
						d="M1 1c-.6 0-1 .4-1 1v11c0 .6.4 1 1 1h4.6l2.7 2.7c.2.2.4.3.7.3.3 0 .5-.1.7-.3l2.7-2.7H17c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1H1zm4.52 10.15c1.99 0 3.01-1.32 3.28-2.41l-1.29-.39c-.19.66-.78 1.45-1.99 1.45-1.14 0-2.2-.83-2.2-2.34 0-1.61 1.12-2.37 2.18-2.37 1.23 0 1.78.75 1.95 1.43l1.3-.41C8.47 4.96 7.46 3.76 5.5 3.76c-1.9 0-3.61 1.44-3.61 3.7 0 2.26 1.65 3.69 3.63 3.69zm7.57 0c1.99 0 3.01-1.32 3.28-2.41l-1.29-.39c-.19.66-.78 1.45-1.99 1.45-1.14 0-2.2-.83-2.2-2.34 0-1.61 1.12-2.37 2.18-2.37 1.23 0 1.78.75 1.95 1.43l1.3-.41c-.28-1.15-1.29-2.35-3.25-2.35-1.9 0-3.61 1.44-3.61 3.7 0 2.26 1.65 3.69 3.63 3.69z"
						fill-rule="evenodd"
					></path>
				</symbol>
				<symbol id="plyr-download">
					<path
						d="M9 13c.3 0 .5-.1.7-.3L15.4 7 14 5.6l-4 4V1H8v8.6l-4-4L2.6 7l5.7 5.7c.2.2.4.3.7.3zm-7 2h14v2H2z"
					></path>
				</symbol>
				<symbol id="plyr-enter-fullscreen">
					<path
						d="M10 3h3.6l-4 4L11 8.4l4-4V8h2V1h-7zM7 9.6l-4 4V10H1v7h7v-2H4.4l4-4z"
					></path>
				</symbol>
				<symbol id="plyr-exit-fullscreen">
					<path
						d="M1 12h3.6l-4 4L2 17.4l4-4V17h2v-7H1zM16 .6l-4 4V1h-2v7h7V6h-3.6l4-4z"
					></path>
				</symbol>
				<symbol id="plyr-fast-forward">
					<path d="M7.875 7.171L0 1v16l7.875-6.171V17L18 9 7.875 1z"></path>
				</symbol>
				<symbol id="plyr-logo-vimeo">
					<path
						d="M17 5.3c-.1 1.6-1.2 3.7-3.3 6.4-2.2 2.8-4 4.2-5.5 4.2-.9 0-1.7-.9-2.4-2.6C5 10.9 4.4 6 3 6c-.1 0-.5.3-1.2.8l-.8-1c.8-.7 3.5-3.4 4.7-3.5 1.2-.1 2 .7 2.3 2.5.3 2 .8 6.1 1.8 6.1.9 0 2.5-3.4 2.6-4 .1-.9-.3-1.9-2.3-1.1.8-2.6 2.3-3.8 4.5-3.8 1.7.1 2.5 1.2 2.4 3.3z"
					></path>
				</symbol>
				<symbol id="plyr-logo-youtube">
					<path
						d="M16.8 5.8c-.2-1.3-.8-2.2-2.2-2.4C12.4 3 9 3 9 3s-3.4 0-5.6.4C2 3.6 1.3 4.5 1.2 5.8 1 7.1 1 9 1 9s0 1.9.2 3.2c.2 1.3.8 2.2 2.2 2.4C5.6 15 9 15 9 15s3.4 0 5.6-.4c1.4-.3 2-1.1 2.2-2.4.2-1.3.2-3.2.2-3.2s0-1.9-.2-3.2zM7 12V6l5 3-5 3z"
					></path>
				</symbol>
				<symbol id="plyr-muted">
					<path
						d="M12.4 12.5l2.1-2.1 2.1 2.1 1.4-1.4L15.9 9 18 6.9l-1.4-1.4-2.1 2.1-2.1-2.1L11 6.9 13.1 9 11 11.1zM3.786 6.008H.714C.286 6.008 0 6.31 0 6.76v4.512c0 .452.286.752.714.752h3.072l4.071 3.858c.5.3 1.143 0 1.143-.602V2.752c0-.601-.643-.977-1.143-.601L3.786 6.008z"
					></path>
				</symbol>
				<symbol id="plyr-pause">
					<path
						d="M6 1H3c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h3c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1zm6 0c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h3c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1h-3z"
					></path>
				</symbol>
				<symbol id="plyr-pip">
					<path
						d="M13.293 3.293L7.022 9.564l1.414 1.414 6.271-6.271L17 7V1h-6z"
					></path>
					<path
						d="M13 15H3V5h5V3H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6h-2v5z"
					></path>
				</symbol>
				<symbol id="plyr-play">
					<path
						d="M15.562 8.1L3.87.225c-.818-.562-1.87 0-1.87.9v15.75c0 .9 1.052 1.462 1.87.9L15.563 9.9c.584-.45.584-1.35 0-1.8z"
					></path>
				</symbol>
				<symbol id="plyr-restart">
					<path
						d="M9.7 1.2l.7 6.4 2.1-2.1c1.9 1.9 1.9 5.1 0 7-.9 1-2.2 1.5-3.5 1.5-1.3 0-2.6-.5-3.5-1.5-1.9-1.9-1.9-5.1 0-7 .6-.6 1.4-1.1 2.3-1.3l-.6-1.9C6 2.6 4.9 3.2 4 4.1 1.3 6.8 1.3 11.2 4 14c1.3 1.3 3.1 2 4.9 2 1.9 0 3.6-.7 4.9-2 2.7-2.7 2.7-7.1 0-9.9L16 1.9l-6.3-.7z"
					></path>
				</symbol>
				<symbol id="plyr-rewind">
					<path d="M10.125 1L0 9l10.125 8v-6.171L18 17V1l-7.875 6.171z"></path>
				</symbol>
				<symbol id="plyr-settings">
					<path
						d="M16.135 7.784a2 2 0 0 1-1.23-2.969c.322-.536.225-.998-.094-1.316l-.31-.31c-.318-.318-.78-.415-1.316-.094a2 2 0 0 1-2.969-1.23C10.065 1.258 9.669 1 9.219 1h-.438c-.45 0-.845.258-.997.865a2 2 0 0 1-2.969 1.23c-.536-.322-.999-.225-1.317.093l-.31.31c-.318.318-.415.781-.093 1.317a2 2 0 0 1-1.23 2.969C1.26 7.935 1 8.33 1 8.781v.438c0 .45.258.845.865.997a2 2 0 0 1 1.23 2.969c-.322.536-.225.998.094 1.316l.31.31c.319.319.782.415 1.316.094a2 2 0 0 1 2.969 1.23c.151.607.547.865.997.865h.438c.45 0 .845-.258.997-.865a2 2 0 0 1 2.969-1.23c.535.321.997.225 1.316-.094l.31-.31c.318-.318.415-.781.094-1.316a2 2 0 0 1 1.23-2.969c.607-.151.865-.547.865-.997v-.438c0-.451-.26-.846-.865-.997zM9 12a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
					></path>
				</symbol>
				<symbol id="plyr-volume">
					<path
						d="M15.6 3.3c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4C15.4 5.9 16 7.4 16 9c0 1.6-.6 3.1-1.8 4.3-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3C17.1 13.2 18 11.2 18 9s-.9-4.2-2.4-5.7z"
					></path>
					<path
						d="M11.282 5.282a.909.909 0 0 0 0 1.316c.735.735.995 1.458.995 2.402 0 .936-.425 1.917-.995 2.487a.909.909 0 0 0 0 1.316c.145.145.636.262 1.018.156a.725.725 0 0 0 .298-.156C13.773 11.733 14.13 10.16 14.13 9c0-.17-.002-.34-.011-.51-.053-.992-.319-2.005-1.522-3.208a.909.909 0 0 0-1.316 0zm-7.496.726H.714C.286 6.008 0 6.31 0 6.76v4.512c0 .452.286.752.714.752h3.072l4.071 3.858c.5.3 1.143 0 1.143-.602V2.752c0-.601-.643-.977-1.143-.601L3.786 6.008z"
					></path>
				</symbol>
			</svg>
		</div>
	</div>
</template>

<script>
import MainWrapper from "./components/main/index.vue";
import userUnauthorized from "./components/user/unauthorized/index.vue";
import store from "@/vuex/store";
import router from "@/router/router";
import modal from "@/components/assets/modal/index.vue";
import pmenu from "@/components/assets/pmenu/index.vue";
import swipable from "@/components/assets/swipable/index.vue";
import VuePageTransition from "@/editedplugins/vue-page-transition/src/index.js";
import TextareaAutosize from "vue-textarea-autosize";
import VueI18n from "vue-i18n";
import Message from "@/editedplugins/vue-m-message/src/index.js";
import "@/editedplugins/vue-m-message/dist/index.css";
import Vue2TouchEvents from "vue2-touch-events";

import VuejsDialog from "vuejs-dialog";

Vue.use(VuejsDialog);

import ToggleButton from "vue-js-toggle-button";
import eventsEvent from "@/components/events/event/index.vue";
import list from "@/components/assets/list/index.vue";
import listmenu from "@/components/assets/listmenu/index.vue";
import listmenuwithupload from "@/components/assets/listmenuwithupload/index.vue";



Vue.component("eventsEvent", eventsEvent);
Vue.component("listmenu", listmenu);
Vue.component("listmenuwithupload", listmenuwithupload);
Vue.component("list", list);

////////

Vue.use(Message);
Vue.use(TextareaAutosize);
Vue.use(VuePageTransition);
Vue.use(VueI18n);
Vue.use(Vue2TouchEvents);
Vue.use(ToggleButton);
////////

import "vuejs-dialog/dist/vuejs-dialog.min.css";

/// app

import f from "@/application/functions.js";
import Vue from "vue";
import Core from "@/application/index.js";

////////

Vue.config.productionTip = false;
Vue.prototype.$f = f;

import VueVirtualScroller from "vue-virtual-scroller";
import preloader from "@/components/assets/preloader/index.vue";
import fixedmessageicon from "@/components/assets/fixedmessageicon/index.vue";
import date from "@/components/assets/date/index.vue";
import userpic from "@/components/assets/userpic/index.vue";
import userspic from "@/components/assets/userspic/index.vue";
import bgimage from "@/components/assets/bgimage.vue";
import logotype from "@/components/assets/logotype/index.vue";
import dropdownMenu from "@/components/assets/dropdownMenu/index.vue";

import backButton from "@/components/assets/backButton/index.vue";
import topheader from "@/components/assets/topheader/index.vue";
import maincontent from "@/components/assets/maincontent/index.vue";
import search from "@/components/assets/search/index.vue";
import simpleSearch from "@/components/assets/simpleSearch/index.vue";

import linepreloader from "@/components/assets/linepreloader/index.vue";

import chats from "@/views/chats.vue";
import vuescroll from 'vue-scroll'
////////
Vue.use(vuescroll)
Vue.component("pmenu", pmenu);
Vue.component("modal", modal);
Vue.component("swipable", swipable);
Vue.component("preloader", preloader);
Vue.component("date", date);
Vue.component("userpic", userpic);
Vue.component("userspic", userspic);
Vue.component("fixedmessageicon", fixedmessageicon);
Vue.component("bgimage", bgimage);
Vue.component("logotype", logotype);
Vue.component("dropdownMenu", dropdownMenu);
Vue.component("backButton", backButton);
Vue.component("topheader", topheader);
Vue.component("maincontent", maincontent);
Vue.component("search", search);
Vue.component("simpleSearch", simpleSearch);
Vue.component("linepreloader", linepreloader);

Vue.use(VueVirtualScroller);
Vue.directive("click-outside", {
	bind: function (el, binding, vnode) {
		el.clickOutsideEvent = function (event) {
			if (!(el == event.target || el.contains(event.target))) {
				vnode.context[binding.expression](event);
			}
		};
		document.body.addEventListener("click", el.clickOutsideEvent);
	},
	unbind: function (el) {
		document.body.removeEventListener("click", el.clickOutsideEvent);
	},
});

/// localization

function loadMessages() {
	const context = require.context("./locales", true, /[a-z0-9-_]+\.json$/i);

	const messages = context
		.keys()
		.map((key) => ({ key, locale: key.match(/[a-z0-9-_]+/i)[0] }))
		.reduce(
			(messages, { key, locale }) => ({
				...messages,
				[locale]: context(key),
			}),
			{}
		);

	return { context, messages };
}

const { context, messages } = loadMessages();

const i18n = new VueI18n({
	locale: "en",
	messages: messages,
	silentTranslationWarn: true,
});

///

var core = null;

var g = {
	install: function (Vue) {
		Object.defineProperty(Vue.prototype, "core", {
			get() {
				return core;
			},
		});
	},
};

Vue.use(g);

var availableLocales = {
	de: true,
	ru: true,
	en: true,
	fr: true,
	cmn: true,
	it: true,
	es: true,
	kr: true,
};

var scriptsadded = false;

export default {
	i18n,
	store,
	router,
	name: "App",
	components: {
		MainWrapper,
		chats,
		userUnauthorized,
	},

	provide() {
		return {
			isChatEncrypted: this.isChatEncrypted,
			matches: this.matches,
			markText: this.markText,
      streamMode: this.streamMode,
      menuState: {
        get: () => this.menuState,
        set: (val) => this.$set(this, "menuState", val)
      }
		};
	},

	props: {
		address: {
			type: String,
			default: "",
		},
		privatekey: {
			type: String,
			defautt: "",
		},

		pocketnet: {
			type: String,
			default: "",
		},

		mobile: {
			type: String,
			default: "",
		},

		recording: {
			type: String,
			default: "",
		},

		iscallsenabled: {
			type: String,
			default: "false",
		},

		pkoindisabled: {
			type: String,
			default: "",
		},

		ctheme: String,

		fcmtoken: String,

		localization: String,

		pip: {
			type: Boolean,
			default: false,
		},

    cssrules: {
      type: String,
      default: []
    }
	},

	data: function () {
		return {
			/*Stack for "encrypted" chat icon*/
			isChatEncrypted: {
				value: false,
				state: this.isChatEncryptedState,
			},

			/*Stack for global search*/
			matches: {
				value: "",
				all: [],
				current: 0,
				search: this.search,
				prepend: this.prependMatch,
				append: this.appendMatch,
				clear: this.clearMatches,
			},

      menuState: false
		};
	},

	watch: {
		fcmtoken: function () {
			this.setPusher(this.fcmtoken);
		},

		localization: {
			immediate: true,
			handler: function () {
				if (availableLocales[this.localization]) {
					i18n.locale = this.localization;
				} else {
					i18n.locale = "en";
				}

				// Update the teamroom messages
				this.generateTeamroomMessages();
			},
		},

		mobile: function () {
			this.$store.commit("setMobile", this.mobile);
			this.$store.commit("minimize");
		},
		pocketnet: function () {
			this.$store.commit("setPocketnet", this.pocketnet);
			this.$store.commit("minimize");
		},
	},

	computed: {
    streamMode: function () {
      return this.style === 'stream';
    },

		statetheme: function () {
			return this.$store.state.theme;
		},

		theme: function () {
			return this.ctheme || this.statetheme;
		},

		unauthorized: function () {
			return this.$store.state.unauthorized;
		},
		online: function () {
			return this.$store.state.online;
		},
		loading: function () {
			return this.$store.state.loading;
		},

		minimized: function () {
			if (this.mobile) return false;
			return this.$store.state.minimized;
		},

		active: function () {
			if (this.mobile) return false;
			return this.$store.state.active;
		},

		globalpreloader: function () {
			return this.$store.state.globalpreloader;
		},

		share: function () {
			if (!this.unauthorized) return this.$store.state.share;
		},

		closebybg: function () {
			return !this.$store.state.pinchat;
		},

		unselect: function () {
			return this.$store.state.voicerecording;
		}
	},

	methods: {
		hide: function () {
			this.$store.commit("minimize", true);

			setTimeout(() => {
				if (
					this.$route.name !== "chats" &&
					/*this.$route.name !== 'chat' &&*/
					this.$route.name !== "contact" &&
					/*this.$route.name !== 'chatInfo' &&*/
					this.$route.name !== "publicPreview" &&
					this.$route.name !== "chatSettings" &&
					core.cancelDefaultRoute !== true
				) {
					this.$router.push("/chats").catch((e) => {});
				}
			}, 500);

			this.clearMatches();
		},

		iteraction: function () {
			this.$store.commit("setiteraction", true);
		},

		// Set a new pusher (if possible) using the token passed as parameter
		setPusher(fcmtoken) {
			// Try to get a saved token
			var savedToken;
			if (localStorage) savedToken = localStorage.getItem("fcmtoken5");
			// If we need to set a new pusher, or delete one
			if (savedToken != fcmtoken) {
				// Wait for Matrix client
				this.core.mtrx.wait().then((r) => {
					this.core.mtrx.deletePusher();

					var data = {
						url: this.core.mtrx.baseUrl + "/_matrix/push/v1/notify",
					};

					var appName = "pocketnet";
					var pusherData = {
						app_display_name: appName,
						app_id: appName + window.cordova.platformId,
						data: data,
						user_id: this.core.mtrx.client.credentials.userId,
						device_display_name:
							window.device.manufacturer + " " + window.device.model,
						kind: "http",
						lang: localStorage.getItem("loc") || "en",
						pushkey: fcmtoken,
					};

					this.core.mtrx.client.setPusher(pusherData).then(
						() => {
							localStorage.setItem("fcmtoken5", fcmtoken);
						},
						(err) => {
							console.log(err);
						}
					);
				});
			}
		},
		// Generate the teamrooms messages
		generateTeamroomMessages() {
			this.$store.commit("SET_POCKETTEAMMESSAGES", [
				{
					id: 1,
					text: `
							<h4>${this.$i18n.t("teamMessages.1-title")}</h4>
							<ul>
								<li>${this.$i18n.t("teamMessages.1-list1")}</li>
								<li class="mt">${this.$i18n.t("teamMessages.1-list2")}</li>
								<li class="mt">${this.$i18n.t("teamMessages.1-list3")}</li>
							</ul>
						`,
					previewText: this.$i18n.t("teamMessages.1-title"),
				},

				//<li class="mt">${this.$i18n.t('teamMessages.1-list4')}</li>

				/*,
					{
						id: 2,
						text: `
							<h4>${this.$i18n.t('teamMessages.2-title')}</h4>
							<span>${this.$i18n.t('teamMessages.2-message1')}</span>
							<ul>
								<li>${this.$i18n.t('teamMessages.2-list1')}</li>
								<li class="mt">${this.$i18n.t('teamMessages.2-list2')}</li>
								<li class="mt">${this.$i18n.t('teamMessages.2-list3')}</li>
							</ul>
							<span>${this.$i18n.t('teamMessages.2-message2')}</span>
						`,
						previewText: this.$i18n.t('teamMessages.2-title')
					}*/
					{
						id: 2,
						text: `
							<h4>${this.$i18n.t('teamMessages.2-title')}</h4>
							<span>${this.$i18n.t('teamMessages.2-message1')}</span>
							<ul>
								<li>${this.$i18n.t('teamMessages.2-list1')}</li>
								<li class="mt">${this.$i18n.t('teamMessages.2-list2')}</li>
								<li class="mt">${this.$i18n.t('teamMessages.2-list3')}</li>
							</ul>
							<span>${this.$i18n.t('teamMessages.2-message2')}</span>
						`,
						previewText: this.$i18n.t('teamMessages.2-title')
					}*/
			]);
		},

		isChatEncryptedState(state) {
			this.isChatEncrypted.value = state;
		},

		prependMatch(item) {
			this.matches.all = [item].concat(this.matches.all);
		},

		appendMatch(item) {
			this.matches.all.push(item);
		},

		clearMatches() {
			this.matches.value = "";
			this.matches.current = 0;
			this.matches.all.length = 0;
		},

		search(text) {
			this.matches.value = text.toLowerCase();
		},

		markText: function (text, highlight) {
			return this.matches.value && text.includes(this.matches.value)
				? text.replace(new RegExp(`(${this.matches.value})`, "gi"), (match) => {
						const str = `<mark class="match${
							highlight ? " current" : ""
						}">${match}</mark>`;
						highlight = null;
						return str;
					})
				: null;
		},
	},

	beforeCreate() {
		this.$store.commit("init");
	},

	created() {
		// this.pocketnet = false;
		// this.mobile = !this.pocketnet;
		// this.recording = true;
		// this.iscallsenabled = true;

		this.$store.commit("setCallsEnabled", this.iscallsenabled);
		this.$store.commit("setPocketnet", this.pocketnet);
		this.$store.commit("setMobile", this.mobile);
		this.$store.commit("setVoiceMessagesEnabled", this.recording);
		this.$store.commit("pkoindisabled", this.pkoindisabled);
		this.$store.commit("clearall");

		this.$store.commit("ls");


		this.generateTeamroomMessages();
		setTimeout(() => {
			if (this.fcmtoken && window.cordova) this.setPusher(this.fcmtoken);
		}, 5000);

		var testUsers = {
			matrixMan: {
				address: f.hexEncode("PToMRMsMVh9dj4Cpa7yu1pB5iq65g4jrVC"),
				privateKey:
					"510aa931cdee36b9ac467ad04a2619f46be88815812b46e976e36bc8dbcdc41b",
			},
			ltme: {
				address: f.hexEncode("PKszvjHwMWubQpeEKnQhRonGBVFWcJDbNJ"),
				privateKey:
					"513bc6a5014e7dd203537227fb0a78f7b974853478fcf95103125f6d793a5f8b",
			},
			travisnoscot1: {
				address: f.hexEncode("PDjvHUQjcDX8Vq6rtpKveUDPtwPVUZEW7m"),
				privateKey:
					"63d91d001f7b5167a707dd4ee7e2638fc13e1fa3ff7171b040b432bcd1054e28",
			},
			mobRoocky: {
				address: f.hexEncode("PCMnk8T3Edu81iGcTEpVCFq8FQd6UBXi2y"),
				privateKey:
					"0bbf6fb0dbf78a26f00345f6f96d4f76f52e0093417c51a1b7bccb7ca92e55df",
			},
			user1: {
				address: f.hexEncode("PKxqtUuK3B6qwAxs6HLhvxrQVExuMwKWd5"),
				privateKey:
					"28f0fdc30094d517bc08abca3f219d77fc32230e313bbf0b699ecd42f80de82a0",
			},
			user2: {
				address: f.hexEncode("PGe4xVAJRJtbD8swPipE2ug9Zk1rhSTa1y"),
				privateKey:
					"0b4562275da7e60a57e10432bdc7e3318dd9699b8b928224ba360b9fb951c77b",
			},
			FakeBadash: {
				address: f.hexEncode("PDWPDFikMhLJHtiKLLXZGzfgphRcd19eHe"),
				privateKey:
					"99d8ce99383ccc5d6404535b98f2b43ce5ab939a28bfc52a442565b2351039fa",
			},
			Faketravis: {
				address: f.hexEncode("PGURYzvoXuSvuwCuDty2wW37omjiKgzV5a"),
				privateKey:
					"93641f20095aa15b89b78d395ebe0a5a9b149ea2b54c57d896091c0ea9b86dfd",
			},
			fakeRocky: {
				address: f.hexEncode("PRDKVP4yvF2wW8p5FUVkzrCvXYE8SMGkQK"),
				privateKey:
					"80d213d272405d4ff51752f91e79c639919f5f9f302583bdaa1c767b044ce2c0",
			},
			fakeFuture2: {
				address: "PBHvKTH5TGQYDbRHgQHTTvaBf7tuww6ho7",
				privateKey:
					"71cacb25f90b18e356e33bc12c428c2e8b6b7c6e2950ab6344412f226aab0b2c",
			},
			fakeFuture: {
				address: f.hexEncode("PBHvKTH5TGQYDbRHgQHTTvaBf7tuww6ho7"),
				privateKey:
					"71cacb25f90b18e356e33bc12c428c2e8b6b7c6e2950ab6344412f226aab0b2c",
			},
			encMan: {
				address: f.hexEncode("PEkKrb7WJgfU3rCkkU9JYT8jbGiQsw8Qy8"),
				privateKey:
					"616fd57f7610288978f4c01797a90d56b0c30392e598a2504b98c7a7246569a5",
			},
			harisCalvin: {
				address: f.hexEncode("PXEWRce8siwbQWArQWyjnooogAEieHwhVd"),
				privateKey:
					"218bcb76df20438c1431c0394a42947f78f279bea987d7b238bfbd1cb1533b62",
			},
			oneSomeoneNigga: {
				address: f.hexEncode("PGyjEoqmmK2tm6xmg69hGoSNM6hUrc4VfE"),
				privateKey:
					"254f5b9394f0490e78b41c6bf615bfd8e290fde3fb6d862f166b181b35764b06",
			},
			gomer: {
				address: f.hexEncode("PVSdoFQqAg86p6tbAW8Y6CGGGjhiXkr4qh"),
				privateKey:
					"105de1935fa665bdc23b1b02bcdb3f62e01a3ad48823d5348edb5b94ec1b4526",
			},
			bart: {
				address: f.hexEncode("PWioUw52q4iNpMQUauNYaWg9JpsPE1u9Ut"),
				privateKey:
					"a74bc4ee63290dd051d659fe46962176d2b9193e04104dea63116d25703bad72",
			},
			edSheeran: {
				address: f.hexEncode("PVeqjqJk2GthxBK6QdhCCfQVEX1SAK92As"),
				privateKey:
					"d89952018721e6762de13fa2f1891b0dc2d1f1e75402ba483251086b2ba181ac",
			},
			duftPunkMan: {
				address: f.hexEncode("PFnN8SExxLsUjMKzs2avdvBdcA3ZKXPPkF"),
				privateKey:
					"7d1a31cc49a05692cfd992359cd27e8b3783cd186d98053ea0b9307b00a19018",
			},
			jcole: {
				address: f.hexEncode("P93cWU7X31wqn3R9GcUZ7c3fD11asXum5y"),
				privateKey:
					"900099127ad048d64523c4701d72d67b5b7f2afb18debbfdc53587f04a29c808",
			},
			flowMan: {
				address: f.hexEncode("PM4gVCcWnTmysUXhMukoQA2mT7GpfWQvck"),
				privateKey:
					"12d28e4c950193665dcaaa32129c061b2213e736ffe20918f0f13b6a2857cc32",
			},
			JokeMan: {
				address: f.hexEncode("PMSULgjrsCsEnWgNigCga5jSjhCvYBFSA8"),
				privateKey:
					"f7a2518393db3779a4394f4084473847bc4260a5aad20859eff9d32ab03c310e",
			},
			omgMan: {
				address: f.hexEncode("P9R3aNvyjRbqTWfy5q1h5qvXFYaDtqaRi2"),
				privateKey:
					"80b4350df8c033a63fd7c6b71516ae05ab3a23a604a39afba5874b87b4effbf8",
			},
			nineBot: {
				address: f.hexEncode("PNcvYsMXzf4RVmS9AjRYEqeeGjk1PiDjvF"),
				privateKey:
					"447554f94a3512a420ef6d089411dff3bc6d170f65e246cc52fc30aa9ed2216c",
			},
			tenBot: {
				address: f.hexEncode("PS9F8hzGSxeL1Lc2VGvPoqXHotZvpoVkkX"),
				privateKey:
					"659bd118d33e541bb042015723cab1e6b644a9d330a988b10e6d593f9abe3542",
			},
			bikeBot: {
				address: f.hexEncode("PBK1GDpiLNVFrKsPVAaNLU92byFY5P5KBr"),
				privateKey:
					"4c1ee4ae821a1ca885d77db84518b4dcbcd4efbed69603c8706b9557618529f9",
			},
			angryBot: {
				address: f.hexEncode("PBMcLRBQNWtNQZYUbRZZAd5FuZ8yb7HMX2"),
				privateKey:
					"87bec25e930671a06e032dca484083d4b79e23aa985781995882d5d4594f8d8d",
			},

			test099090: {
				address: f.hexEncode("PP582V47P8vCvXjdV3inwYNgxScZCuTWsq"),
				privateKey:
					"14ede296d13f8111c77a1da82519939329ee1b81ab23203da48df3f5e52fee3d",
			},
			tony: {
				address: f.hexEncode("TLENU8HFyz8PqzpKBDWeN6Xix6rM8wjYKd"),
				privateKey:
					"8cf816c1c7a51cbc114db9aac8896b8654260f9b3a985232f27cf32823c7f45f",
			},
			invoker: {
				address: f.hexEncode("TPjN8Dy4BpGDezMNw2ePuEdHiHetTvR3Mb"),
				privateKey:
					"a7ded16bd9d3350d6c3d233e6905b51e61bd879ba152ae24d0f8def76c4581c7",
			},
			drowRanger: {
				address: f.hexEncode("TU8fAf96kSfQzmxmpjRDSSqvCiPWzWt67J"),
				privateKey:
					"38484a2047b5c8170847a97fc5cddf3d485c934c6532a51a73f64ec7e4659891",
			},
			nevermore: {
				address: f.hexEncode("TKJ7xAC18XC4zQBvkNAWhkr3i7cARu11Uv"),
				privateKey:
					"8ec7f71d16b07d29bb49b3bc3054b5a4d2e65fb559e0ae695503568227584f53",
			},
			stormSpirit: {
				address: f.hexEncode("TZBHmnZwLedPtHcJfJnFsbxobGuDKGf9uA"),
				privateKey:
					"642aaa706fe94ea77239468cb9aad6b463472793a2c4e1f60acf22078770c45f",
			},
			morph: {
				address: f.hexEncode("TXyieuLsCntT1p4ougtiKURtYTxcdvWN1L"),
				privateKey:
					"8f59a6a6b7b8c1f63be47a6f571a11d726e9d7cde2baff52a51dc72326b6abb4",
			},
			alchemist: {
				address: f.hexEncode("TT2CeQuHiM8E8hG4rkJcaMKQ8gWqhZmNUH"),
				privateKey:
					"957ad5e2a009e4c0f06f0ae2737ea4c36c48fa8312555fcd104ca9cff7db6848",
			},
			public_user_test: {
				address: f.hexEncode("TLMXdC2UYSfMVbLzKtmJJTi4oK9LNHNVju"),
				privateKey:
					"509b219c5cead9545039ae38d428813af6671dbee3e37cadd2cd22f152013f2a",
			},
			cleanUser: {
				address: f.hexEncode("THCRHFtVAoeDGLg548C4bQxXeDg9bwrs5K"),
				privateKey:
					"666919a742eb63bededea3fddc44b526148d8b0eb1126b0aaff480a2af888d92",
			},
			userwithoutavatar: {
				address: f.hexEncode("TVcPMgVQ9TxgpzNrQyEAei5cnnR9jzXtzE"),
				privateKey:
					"2a3e96562c23a40e3d439b823453fb8fe6f8fb2c0267e8d2411734b3bdff90dd",
			},
			unnamed: {
				address: f.hexEncode("THsA8rwdeAkq5bePA71Nw5CGtFg2duyDSq"),
				privateKey:
					"27b42dfba3d20ae7a945e09dd0688137fa7963fd48b94f7b4027dc4eed874a96",
			},
		};

		var actualUser = {
			address: this.address ? f.hexEncode(this.address) : "",
			privateKey: this.privatekey,
		};

		var username = "nevermore";

		var user =
			this.address && this.privatekey ? actualUser : testUsers[`${username}`];

		var listofproxies = f.deep(
			window,
			"window.POCKETNETINSTANCE.options.listofproxies"
		) || [
      /*{
        host: "test.pocketnet.app",
        port: 8899,
        wss: 809
      },
      /*{
          host : 'pocketnet.app',
          port : 8899,
          wss : 8099
      },*/
      {
          host : '1.pocketnet.app',
          port : 8899,
          wss : 8099
      }
		];

		/*

		////////// new server


		var sarr = ['vamily.ru', 'pnt.com','bst.app', 'sd.ci']


		*/

		var domain =
			f.deep(window, "window.POCKETNETINSTANCE.options.matrix") ||
			"test.matrix.pocketnet.app";

		core = new Core(this, {
			domain: domain,
			mtrx: {
				logger: function () {},
			},

			listofproxies: listofproxies,

			servers: {
				pocketnet: "https://pocketnet.app:8888",
			},
		});

		core.init();

		/*

		this.$dialog.confirm(
						'question', {
							 okText: 'ok',
								cancelText : 'cancel'
						})

						.then((dialog) => {
						})

		*/

		/*this.$store.commit('icon', {
					icon : 'success',
					message : "Downloaded"
				})*/

		core
			.initWithUser(user)
			.then((r) => {
				return core.mtrx.wait().then(() => {
					core.user.getContacts();

					setTimeout(() => {
						if (
							this.$route.name !== "chats" &&
							this.$route.name !== 'chat' &&
							/*this.$route.name !== 'chatInfo' &&*/
							this.$route.name !== "publicPreview" &&
							this.$route.name !== "chatSettings" &&
							this.$route.name !== "contact" &&
							core.cancelDefaultRoute !== true
						) {
							this.$router.push("/chats").catch((e) => {});
						}
					}, 100);

					//this.connectCustomRecorder();
				});
			})
			.catch((g) => {});

		setInterval(() => {
			if (this.$store.state.autohide || !this.$store.state.iteraction)
				this.$store.commit("active", false);
		}, 3000);

    (() => {
      try {
        return JSON.parse(this.cssrules || "[]");
      } catch {
        return [];
      }
    })().forEach(rule => {
      this.$nextTick(() => {
        const link = document.createElement("link");
              link.setAttribute("rel", "stylesheet");
              link.setAttribute("href", rule);

        this.$root.$el.append(link);
      });
    });

		window.matrixchat = core;
	},
};

if (module.hot) {
	module.hot.accept(context.id, () => {
		const { messages: newMessages } = loadMessages();

		Object.keys(newMessages)
			.filter((locale) => messages[locale] !== newMessages[locale])
			.forEach((locale) => {
				messages[locale] = newMessages[locale];
				i18n.setLocaleMessage(locale, messages[locale]);
			});
	});
}
</script>

<style src="./editedplugins/vue-m-message/dist/index.css"></style>
<style lang="sass" src="./index.sass"></style>
<style>
@import "@/../../public/css/main.css";
@import "@/../../public/css/normalize.css";
@import "@/../../public/css/emoji-mart.css";
</style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
