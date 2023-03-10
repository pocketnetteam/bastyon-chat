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

const chatConstructor = Vue.extend({...chat, store, i18n})

class Exporter {
		constructor(core, p) {
			this.core = core;
			this.instances = {}
	}
		async chat(el, roomId, p){
				await this.core?.mtrx?.waitchats();
				const chat = this.core.vm.$store.state.chatsMap[roomId];
				
				if (chat) {
						const instance = new chatConstructor({
								data: {chat, ...p},
						});

						instance.$options.shadowRoot = el.ownerDocument.body;
						
						instance.$mount(el);
						
						instance.destroy = () => {
							instance.$destroy();
							instance.$el.parentNode.removeChild(instance.$el);
						}

						return Promise.resolve(instance);
				} else {
					await this.core.mtrx.client.peekInRoom(roomId)
						.then(room => {
							if (!room) return Promise.reject('missing:chat');
							
							this.core.vm.$store.commit(
								'SET_CHATS_TO_STORE',
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
