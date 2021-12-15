<template>
	<div id="matrix-root" :theme="theme" class="app">
		<div class="rootcontent" :class="{'bin' : pocketnet, 'fix' : pocketnet, 'bout' : !pocketnet, minimized, active, mobile}">
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
	</div>
</template>

<script>
import MainWrapper from './components/main/index.vue'
import userUnauthorized from './components/user/unauthorized/index.vue'
import store from "@/vuex/store"
import router from "@/router/router"
import modal from '@/components/assets/modal/index.vue'
import pmenu from '@/components/assets/pmenu/index.vue'
import _ from 'underscore';


//import VueObserveVisibility from 'vue-observe-visibility'
import VuePageTransition from '@/editedplugins/vue-page-transition/src/index.js'
import TextareaAutosize from 'vue-textarea-autosize'
import VueI18n from 'vue-i18n'
import Vuelidate from 'vuelidate'
import Message from '@/editedplugins/vue-m-message/src/index.js'
import '@/editedplugins/vue-m-message/dist/index.css'
import Vue2TouchEvents from 'vue2-touch-events'
import VuePlyr from 'vue-plyr'
import 'vue-plyr/dist/vue-plyr.css'

//var VueScrollTo = require('vue-scrollto');
import VuejsDialog from 'vuejs-dialog';
Vue.use(VuejsDialog);

import ToggleButton from 'vue-js-toggle-button'

import eventsEvent from "@/components/events/event/index.vue";
Vue.component('eventsEvent', eventsEvent)
////////

Vue.use(Message)
Vue.use(TextareaAutosize)
Vue.use(VuePageTransition)
Vue.use(VueI18n)
Vue.use(Vuelidate)
//Vue.use(VueObserveVisibility)
Vue.use(Vue2TouchEvents)
Vue.use(VuePlyr)
Vue.use(ToggleButton)

////////

import 'vuejs-dialog/dist/vuejs-dialog.min.css';

/// app

import f from '@/application/functions.js'
import Vue from 'vue';
import Core from '@/application/index.js'

////////

Vue.config.productionTip = false
Vue.prototype._ = _
Vue.prototype.$f = f

if(!window._) window._ = _

import VueVirtualScroller from 'vue-virtual-scroller'
//import SweetAlertIcons from 'vue-sweetalert-icons';
import preloader from '@/components/assets/preloader/index.vue'
import fixedmessageicon from '@/components/assets/fixedmessageicon/index.vue'
import date from '@/components/assets/date/index.vue'
import userpic from '@/components/assets/userpic/index.vue'
import userspic from '@/components/assets/userspic/index.vue'
import bgimage from '@/components/assets/bgimage.vue'
import logotype from '@/components/assets/logotype/index.vue'
import dropdownMenu from '@/components/assets/dropdownMenu/index.vue';
import backButton from '@/components/assets/backButton/index.vue';
import topheader from '@/components/assets/topheader/index.vue';
import maincontent from '@/components/assets/maincontent/index.vue';
import search from '@/components/assets/search/index.vue';
import upload from '@/components/assets/upload/index.vue';
import linepreloader from '@/components/assets/linepreloader/index.vue';
import { PhotoSwipe, PhotoSwipeGallery } from "@/editedplugins/v-photoswipe/src/index.js";

import chats from '@/views/chats.vue'
import func from 'vue-editor-bridge'
////////


Vue.component('pmenu', pmenu)
Vue.component('modal', modal)
Vue.component('v-photoswipe', PhotoSwipe)
Vue.component('v-photoswipe-gallery', PhotoSwipeGallery)
Vue.component('preloader', preloader)
Vue.component('date', date)
Vue.component('userpic', userpic)
Vue.component('userspic', userspic)
Vue.component('fixedmessageicon', fixedmessageicon)
Vue.component('bgimage', bgimage)
Vue.component('logotype', logotype)
Vue.component('dropdownMenu', dropdownMenu)
Vue.component('backButton', backButton)
Vue.component('topheader', topheader)
Vue.component('maincontent', maincontent)
Vue.component('search', search)
Vue.component('upload', upload)
Vue.component('linepreloader', linepreloader)


/*
Vue.use(VueScrollTo, {
	container: "html",
	duration: 200,
	easing: "ease",
	offset: 0,
	force: true,
	cancelable: true,
	onStart: false,
	onDone: false,
	onCancel: false,
	x: false,
	y: true
})*/

//Vue.use(SweetAlertIcons);


Vue.use(VueVirtualScroller)
Vue.directive('click-outside', {
	bind: function(el, binding, vnode) {
		el.clickOutsideEvent = function(event) {
			if (!(el == event.target || el.contains(event.target))) {
				vnode.context[binding.expression](event);
			}
		};
		document.body.addEventListener('click', el.clickOutsideEvent)
	},
	unbind: function(el) {
		document.body.removeEventListener('click', el.clickOutsideEvent)
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
			}), {}
		);

	return { context, messages };
}

const { context, messages } = loadMessages();

const i18n = new VueI18n({
	locale: 'en',
	messages: messages,
	silentTranslationWarn: true
})

///

var core = null

var g = {

	install: function(Vue) {
		Object.defineProperty(Vue.prototype, 'core', {
			get() {
				return core
			}
		})

	}
};

Vue.use(g)

var availableLocales = {
	de : true,
	ru : true,
	en : true,
	fr : true,
	cmn : true,
  it : true,
	es : true,
	kr : true
}

var scriptsadded = false

export default {
	i18n,
	store,
	router,
	name: 'App',
	components: {
		MainWrapper,
		chats,
		userUnauthorized
	},
	props: {
		address: {
			type: String,
			default: ''
		},
		privatekey: {
			type: String,
			defautt: ''
		},

		pocketnet: {
			type: String,
			default: ''
		},

		mobile : {
			type : String,
			default : ''
		},

		ctheme : String,

		fcmtoken : String,

		localization: String

	},
	
	watch: {
		fcmtoken : function(){
			this.setPusher(this.fcmtoken);
		},

		localization : {
			immediate : true,
			handler : function() {

				if(availableLocales[this.localization]){
					i18n.locale = this.localization
				}
				else{
					i18n.locale = 'en'
				}

				// Update the teamroom messages
				this.generateTeamroomMessages();
			}
		}
		
	},
	
	
	computed: {

		statetheme : function(){
			return this.$store.state.theme
		},

		theme : function(){
			return this.ctheme || this.statetheme
		},

		unauthorized: function() {
			return this.$store.state.unauthorized
		},
		online: function() {
			return this.$store.state.online
		},
		loading: function() {
			return this.$store.state.loading
		},
		

		minimized: function() {
			if(this.mobile) return false
			return this.$store.state.minimized
		},

		active: function() {

			if(this.mobile) return false
			return this.$store.state.active
		},

		globalpreloader: function() {
			return this.$store.state.globalpreloader
		},

		share : function() {
			if(!this.unauthorized)
				return this.$store.state.share
		},

		closebybg : function() {
			return !this.$store.state.pinchat
		},

	},

	methods: {	
		hide : function(){

			this.$store.commit('minimize', true);

			setTimeout(() => {

				if (this.$route.name !== 'chats' &&
					/*this.$route.name !== 'chat' &&*/
					this.$route.name !== 'contact' &&
					this.$route.name !== 'chatInfo' &&
					this.$route.name !== 'publicPreview' &&
					this.$route.name !== 'chatSettings' &&
					core.cancelDefaultRoute !== true){

						this.$router.push('/chats')
					}

			}, 500)
				
			
			
		},
		
		iteraction: function() {
			this.$store.commit('setiteraction', true);
		},
		importInitialScripts(){

			/*if (scriptsadded) return
				scriptsadded = true

			let src = document.createElement('script')
			src.setAttribute('src', './js/vendor/emojionearea.js')
			document.head.appendChild(src);

			let link = document.createElement('link')
			link.setAttribute('src', './js/vendor/emojionearea.css')
			link.setAttribute('rel', 'stylesheet')
			document.head.appendChild(link);*/
		},
		// Set a new pusher (if possible) using the token passed as parameter
		setPusher(fcmtoken) {

			// Try to get a saved token
			var savedToken;
			if (localStorage)
				savedToken = localStorage.getItem('fcmtoken5');
			// If we need to set a new pusher, or delete one
			if (savedToken != fcmtoken) {

				// Wait for Matrix client
				this.core.mtrx.wait().then(r => {

					// Delete the old one first, if needed
					this.core.mtrx.deletePusher();

					var data = {
						url: this.core.mtrx.baseUrl + '/_matrix/push/v1/notify'
					}

					/*
					if(typeof device != 'undefined' && device.platform == 'iOS'){
						data.default_payload = {
							aps : {
								"sound": "default",
								"content-available": 1,
                                "topic" : "DEFAULT"
							}
						}
					}
					*/

					// Prepare to create a new pusher
					var appName = 'pocketnet';
					var pusherData = {
						app_display_name: appName,
						app_id: appName + window.cordova.platformId,
						data: data,
						user_id: this.core.mtrx.client.credentials.userId,
						device_display_name: window.device.manufacturer + " " + window.device.model,
						kind: 'http',
						lang: localStorage.getItem('loc') || 'en',
						pushkey: fcmtoken
					};


					// Create the new pusher
					this.core.mtrx.client.setPusher(pusherData).then(() => {
						localStorage.setItem('fcmtoken5', fcmtoken);
					}, (err) => {
						console.log(err);
					});

				});
			}
		},
		// Generate the teamrooms messages
		generateTeamroomMessages() {
			this.$store.commit('SET_POCKETTEAMMESSAGES',
				[
					{
						id: 1,
						text: `
							<h4>${this.$i18n.t('teamMessages.1-title')}</h4>
							<ul>
								<li>${this.$i18n.t('teamMessages.1-list1')}</li>
								<li class="mt">${this.$i18n.t('teamMessages.1-list2')}</li>
								<li class="mt">${this.$i18n.t('teamMessages.1-list3')}</li>
							</ul>
						`,
						previewText: this.$i18n.t('teamMessages.1-title')
					}

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
				]
			);
		}
	},

	

	beforeCreate() {
		this.$store.commit('init');
	},

	created() {

    	/*this.pocketnet = true
		this.mobile = !this.pocketnet*/

		this.$store.commit('setPocketnet', this.pocketnet);
		this.$store.commit('setMobile', this.mobile);
		this.$store.commit('clearall')

		this.$store.commit('ls')

		this.importInitialScripts()

		// Generate the teamroom messages
		this.generateTeamroomMessages();

		setTimeout(() => {
			if (this.fcmtoken && window.cordova)
				this.setPusher(this.fcmtoken);
		}, 5000);

		var testUsers = {
			matrixMan: {
				address: f.hexEncode('PToMRMsMVh9dj4Cpa7yu1pB5iq65g4jrVC'),
				privateKey: '510aa931cdee36b9ac467ad04a2619f46be88815812b46e976e36bc8dbcdc41b'
			},
			ltme: {
				address: f.hexEncode('PKszvjHwMWubQpeEKnQhRonGBVFWcJDbNJ'),
				privateKey: '513bc6a5014e7dd203537227fb0a78f7b974853478fcf95103125f6d793a5f8b'
			},
			travisnoscot1: {
				address: f.hexEncode('PDjvHUQjcDX8Vq6rtpKveUDPtwPVUZEW7m'),
				privateKey: '63d91d001f7b5167a707dd4ee7e2638fc13e1fa3ff7171b040b432bcd1054e28'
			},
			mobRoocky: {
				address: f.hexEncode('PCMnk8T3Edu81iGcTEpVCFq8FQd6UBXi2y'),
				privateKey: '0bbf6fb0dbf78a26f00345f6f96d4f76f52e0093417c51a1b7bccb7ca92e55df'
			},
			user1: {
				address: f.hexEncode('PKxqtUuK3B6qwAxs6HLhvxrQVExuMwKWd5'),
				privateKey: '28f0fdc30094d517bc08abca3f219d77fc32230e313bbf0b699ecd42f80de82a0'
			},
			user2: {
				address: f.hexEncode('PGe4xVAJRJtbD8swPipE2ug9Zk1rhSTa1y'),
				privateKey: '0b4562275da7e60a57e10432bdc7e3318dd9699b8b928224ba360b9fb951c77b'
			},
			FakeBadash: {
				address: f.hexEncode('PDWPDFikMhLJHtiKLLXZGzfgphRcd19eHe'),
				privateKey: '99d8ce99383ccc5d6404535b98f2b43ce5ab939a28bfc52a442565b2351039fa'
			},
			Faketravis: {
				address: f.hexEncode('PGURYzvoXuSvuwCuDty2wW37omjiKgzV5a'),
				privateKey: '93641f20095aa15b89b78d395ebe0a5a9b149ea2b54c57d896091c0ea9b86dfd'
			},
			fakeRocky: {
				address: f.hexEncode('PRDKVP4yvF2wW8p5FUVkzrCvXYE8SMGkQK'),
				privateKey: '80d213d272405d4ff51752f91e79c639919f5f9f302583bdaa1c767b044ce2c0'
			},
			fakeFuture2: {
				address: 'PBHvKTH5TGQYDbRHgQHTTvaBf7tuww6ho7',
				privateKey: '71cacb25f90b18e356e33bc12c428c2e8b6b7c6e2950ab6344412f226aab0b2c'
			},
			fakeFuture: {
				address: f.hexEncode('PBHvKTH5TGQYDbRHgQHTTvaBf7tuww6ho7'),
				privateKey: '71cacb25f90b18e356e33bc12c428c2e8b6b7c6e2950ab6344412f226aab0b2c'
			},
			encMan: {
				address: f.hexEncode('PEkKrb7WJgfU3rCkkU9JYT8jbGiQsw8Qy8'),
				privateKey: '616fd57f7610288978f4c01797a90d56b0c30392e598a2504b98c7a7246569a5'
			},
			harisCalvin: {
				address: f.hexEncode('PXEWRce8siwbQWArQWyjnooogAEieHwhVd'),
				privateKey: '218bcb76df20438c1431c0394a42947f78f279bea987d7b238bfbd1cb1533b62'
			},
			oneSomeoneNigga: {
				address: f.hexEncode('PGyjEoqmmK2tm6xmg69hGoSNM6hUrc4VfE'),
				privateKey: '254f5b9394f0490e78b41c6bf615bfd8e290fde3fb6d862f166b181b35764b06'
			},
			gomer: {
				address: f.hexEncode('PVSdoFQqAg86p6tbAW8Y6CGGGjhiXkr4qh'),
				privateKey: '105de1935fa665bdc23b1b02bcdb3f62e01a3ad48823d5348edb5b94ec1b4526'
			},
			bart: {
				address: f.hexEncode('PWioUw52q4iNpMQUauNYaWg9JpsPE1u9Ut'),
				privateKey: 'a74bc4ee63290dd051d659fe46962176d2b9193e04104dea63116d25703bad72'
			},
			edSheeran: {
				address: f.hexEncode('PVeqjqJk2GthxBK6QdhCCfQVEX1SAK92As'),
				privateKey: 'd89952018721e6762de13fa2f1891b0dc2d1f1e75402ba483251086b2ba181ac'
			},
			duftPunkMan: {
				address: f.hexEncode('PFnN8SExxLsUjMKzs2avdvBdcA3ZKXPPkF'),
				privateKey: '7d1a31cc49a05692cfd992359cd27e8b3783cd186d98053ea0b9307b00a19018'
			},
			jcole: {
				address: f.hexEncode('P93cWU7X31wqn3R9GcUZ7c3fD11asXum5y'),
				privateKey: '900099127ad048d64523c4701d72d67b5b7f2afb18debbfdc53587f04a29c808'
			},
			flowMan: {
				address: f.hexEncode('PM4gVCcWnTmysUXhMukoQA2mT7GpfWQvck'),
				privateKey: '12d28e4c950193665dcaaa32129c061b2213e736ffe20918f0f13b6a2857cc32'
			},
			JokeMan: {
				address: f.hexEncode('PMSULgjrsCsEnWgNigCga5jSjhCvYBFSA8'),
				privateKey: 'f7a2518393db3779a4394f4084473847bc4260a5aad20859eff9d32ab03c310e'
			},
			omgMan: {
				address: f.hexEncode('P9R3aNvyjRbqTWfy5q1h5qvXFYaDtqaRi2'),
				privateKey: '80b4350df8c033a63fd7c6b71516ae05ab3a23a604a39afba5874b87b4effbf8'
			},
			nineBot: {
				address: f.hexEncode('PNcvYsMXzf4RVmS9AjRYEqeeGjk1PiDjvF'),
				privateKey: '447554f94a3512a420ef6d089411dff3bc6d170f65e246cc52fc30aa9ed2216c'
			},
			tenBot: {
				address: f.hexEncode('PS9F8hzGSxeL1Lc2VGvPoqXHotZvpoVkkX'),
				privateKey: '659bd118d33e541bb042015723cab1e6b644a9d330a988b10e6d593f9abe3542'
			},
			bikeBot: {
				address: f.hexEncode('PBK1GDpiLNVFrKsPVAaNLU92byFY5P5KBr'),
				privateKey: '4c1ee4ae821a1ca885d77db84518b4dcbcd4efbed69603c8706b9557618529f9'
			},
			angryBot: {
				address: f.hexEncode('PBMcLRBQNWtNQZYUbRZZAd5FuZ8yb7HMX2'),
				privateKey: '87bec25e930671a06e032dca484083d4b79e23aa985781995882d5d4594f8d8d'
			},

			test099090:	{
				address: f.hexEncode('PP582V47P8vCvXjdV3inwYNgxScZCuTWsq'),
				privateKey: '14ede296d13f8111c77a1da82519939329ee1b81ab23203da48df3f5e52fee3d'
			},
      tony:	{
				address: f.hexEncode('TLENU8HFyz8PqzpKBDWeN6Xix6rM8wjYKd'),
				privateKey: '8cf816c1c7a51cbc114db9aac8896b8654260f9b3a985232f27cf32823c7f45f'
			},
      invoker: {
			  address: f.hexEncode('TPjN8Dy4BpGDezMNw2ePuEdHiHetTvR3Mb'),
				privateKey: 'a7ded16bd9d3350d6c3d233e6905b51e61bd879ba152ae24d0f8def76c4581c7'
      },
      drowRanger: {
			  address: f.hexEncode('TU8fAf96kSfQzmxmpjRDSSqvCiPWzWt67J'),
				privateKey: '38484a2047b5c8170847a97fc5cddf3d485c934c6532a51a73f64ec7e4659891'
      },
      nevermore: {
			  address: f.hexEncode('TKJ7xAC18XC4zQBvkNAWhkr3i7cARu11Uv'),
				privateKey: '8ec7f71d16b07d29bb49b3bc3054b5a4d2e65fb559e0ae695503568227584f53'
      },
      stormSpirit: {
			  address: f.hexEncode('TZBHmnZwLedPtHcJfJnFsbxobGuDKGf9uA'),
				privateKey: '642aaa706fe94ea77239468cb9aad6b463472793a2c4e1f60acf22078770c45f'
      },
       morph: {
			  address: f.hexEncode('TXyieuLsCntT1p4ougtiKURtYTxcdvWN1L'),
				privateKey: '8f59a6a6b7b8c1f63be47a6f571a11d726e9d7cde2baff52a51dc72326b6abb4'
      },
      alchemist: {
			address: f.hexEncode('TT2CeQuHiM8E8hG4rkJcaMKQ8gWqhZmNUH'),
			privateKey: '957ad5e2a009e4c0f06f0ae2737ea4c36c48fa8312555fcd104ca9cff7db6848'
      },
      public_user_test: {
			address: f.hexEncode('TLMXdC2UYSfMVbLzKtmJJTi4oK9LNHNVju'),
			privateKey: '509b219c5cead9545039ae38d428813af6671dbee3e37cadd2cd22f152013f2a'
      },
      cleanUser: {
			  address: f.hexEncode('THCRHFtVAoeDGLg548C4bQxXeDg9bwrs5K'),
        privateKey: '666919a742eb63bededea3fddc44b526148d8b0eb1126b0aaff480a2af888d92'
      },
      userwithoutavatar: {
			  address: f.hexEncode('TVcPMgVQ9TxgpzNrQyEAei5cnnR9jzXtzE'),
        privateKey: '2a3e96562c23a40e3d439b823453fb8fe6f8fb2c0267e8d2411734b3bdff90dd'
      },
	    unnamed: {
			address: f.hexEncode('THsA8rwdeAkq5bePA71Nw5CGtFg2duyDSq'),
			privateKey: '27b42dfba3d20ae7a945e09dd0688137fa7963fd48b94f7b4027dc4eed874a96'
      }
	  
		}

		var actualUser = {
			address: this.address ? f.hexEncode(this.address) : '',
			privateKey: this.privatekey
		}

		var username = 'nevermore'

		var user = (this.address && this.privatekey) ? actualUser : testUsers[`${username}`];

		var listofproxies = f.deep(window, 'window.POCKETNETINSTANCE.options.listofproxies') || [
			{
                host : 'test.pocketnet.app',
                port : 8899,
                wss : 8099
            }
            /*{
                host : 'pocketnet.app',
                port : 8899,
                wss : 8099
            },
            {
                host : '1.pocketnet.app',
                port : 8899,
                wss : 8099
            }*/
        ]

		var domain = f.deep(window, 'window.POCKETNETINSTANCE.options.matrix') || 'vamily.ru'

		core = new Core(this, {
			domain : domain,
			mtrx: {
				logger: function() {

				}
			},

			listofproxies : listofproxies,

			servers: {
				pocketnet: 'https://pocketnet.app:8888'
			}
		})

		core.init()	

		/*
		
		this.$dialog.confirm(
            'question', {
               okText: 'ok',
                cancelText : 'cancel'
            })
    
            .then((dialog) => {
               console.log("CNF")
            })
		
		*/

		/*this.$store.commit('icon', {
          icon : 'success',
          message : "Downloaded"
        })*/

		core.initWithUser(user).then(r => {

			/*core.mtrx.waitchats().then(r => {

				if(_.toArray(this.$store.state.chats).length <= 3 && this.pocketnet){
					this.$store.commit('active', true)
					this.$store.commit('blockactive', {value: true, item: 'initial'})
				}
				
			})*/

			return core.mtrx.wait().then(() => {

				core.user.getContacts()

				if (this.$route.name !== 'chats' &&
					/*this.$route.name !== 'chat' &&*/
					this.$route.name !== 'chatInfo' &&
					this.$route.name !== 'publicPreview' &&
					this.$route.name !== 'chatSettings' &&
					core.cancelDefaultRoute !== true){

						this.$router.push('/chats')
					}

			})

		}).catch(g => {
			
		})

		setInterval(() => {
			if (this.$store.state.autohide || !this.$store.state.iteraction)
				this.$store.commit('active', false)

		}, 3000)

		window.matrixchat = core

	}
}

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

<style src="./editedplugins/vue-m-message/dist/index.css">

</style>
<style lang="sass" src="./index.sass"></style>
<style>
@import 'https://use.fontawesome.com/releases/v5.2.0/css/all.css';
@import '@/../../public/css/main.css';
@import '@/../../public/css/normalize.css';
@import '@/../../public/css/emoji-mart.css';
</style>
<style src="../node_modules/vue-simple-accordion/dist/vue-simple-accordion.css"></style>
<style src="../node_modules/swiper/swiper-bundle.css"></style>

<!-- THEMES BEGIN -->
<style lang="sass" src="./themes/theme_white.sass"></style>
<style lang="sass" src="./themes/theme_black.sass"></style>
<!-- THEMES END -->
