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
    chat(el, roomId){

        
        var chat = this.core.vm.$store.state.chatsMap[roomId];

        if (chat){

            const instance = new chatConstructor({
                data: {chat},
            })

            instance.$options.shadowRoot = el.ownerDocument.body
            
            instance.$mount(el)

            return Promise.resolve({
                instance
            })

            
        }

        return Promise.reject('missing:chat')
    }
}

export default Exporter;