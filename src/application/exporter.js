import f from "./functions";
import Vue from 'vue'
import chat from '@/components/chat/exported/index.vue'
import store from "@/vuex/store";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

function loadMessages() {
	const context = require.context("../locales", true, /[a-z0-9-_]+\.json$/i);

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

const chatConstructor = Vue.extend({ ...chat, store, i18n })

class Exporter {
	constructor(core, p) {
		this.core = core;
		this.instances = {}
	}

	changeLocalization(localization) {
		i18n.locale = localization;
	}
	async chat(el, roomId, p) {
		console.log('chat: initializing')
		await this.core?.mtrx?.waitchats();

		/*Get video meta (&stream state)*/
		console.log('chat: get video meta')
		if (!p.videoMeta && p.style === "stream") {
			await window.POCKETNETINSTANCE?.platform?.sdk?.videos?.info(p.videoUrl)
				.then(() => window.parseVideo(p.videoUrl))
				.then(meta => {
					if (meta?.type === "peertube") {
						meta = window.peertubeglobalcache[meta.id];
						p.videoMeta = meta;
						console.log('chat:', meta)
					}
				});
		}

		const chat = this.core.vm.$store.state.chatsMap[roomId];
		console.log('chat:', chat)

		if (chat) {
			console.log('chat: build')
			const instance = new chatConstructor({
				data: { chat, ...p },
			});

			instance.$options.shadowRoot = el.ownerDocument.body;

			console.log('chat: mount', el)
			instance.$mount(el);

			instance.destroy = () => {
				instance.$destroy();
				instance.$el.parentNode.removeChild(instance.$el);
			}

			return Promise.resolve(instance);
		} else if (typeof this.core?.mtrx?.client?.peekInRoom !== "undefined") {
			console.log('chat: peekInRoom')
			await this.core.mtrx.client.peekInRoom(roomId)
				.then(room => {
					if (!room) return Promise.reject("missing:chat");

					console.log('chat: room', room)
					this.core.vm.$store.commit(
						"SET_CHATS_TO_STORE",
						this.core.vm.$store.state.chats.concat([
							Object.assign(room.summary, { stream: true })
						])
					);
				});

			return this.chat.apply(this, arguments);
		}
	}
}

export default Exporter;
