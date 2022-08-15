import f from "@/application/functions";
import InputField from './InputField/InputField.vue'
import recordVoice from '@/components/assets/recordVoice/index.vue';
import _ from "underscore";
import { mapState } from "vuex";

import contacts from '@/components/contacts/list/index.vue'
import preview from '@/components/contacts/preview/index.vue'
import recordProgress from '@/components/assets/recordProgress/index.vue';


import { cancelable } from 'cancelable-promise';
export default {
	name: 'chatInput',
	props: {
		chat: Object,
		u: String,
		relationEvent: Object
	},

	components: { InputField, contacts, preview, recordProgress, recordVoice },

	data: function () {

		return {
			upload: true,
			test: [],
			loading: false,
			text: '',
			file: {},
			fileInfo: {},
			ready: false,
			creating: false,
			userId: '',
			showuserselect: null,
			anyUrlMeta: String,
			joinedMembers: [],
			tipvalue: null,
			tipuserindex: 0,
			record: null,
			recordRmsData: [],
			isRecording: false,

			mediaRecorder: null,
			audioContext: null,
			audioAnalyser: null,

			recordTime: 0,
			interval: null,
			cancelOpacity: 0,
			microphoneDisabled: false,
			prepareRecording : false
		}

	},


	watch: {
		usersForKeysHash: {
			//immediate: true,
			handler: function () {
			}
		},
		tipusers: function () {

			if (!this.tipusers.length) {
				this.tipuserindex = 0
			} else {
				if (this.tipuserindex > this.tipusers.length - 1) {
					this.tipuserindex = this.tipusers.length - 1
				}
			}


		}
	},

	beforeDestroy(){
		if (this.audioContext)
			this.audioContext.close()
	},

	computed: {
		voiceEnable() {
			return this.$store.state.voiceMessagesEnabled
		},

		connect: function () {
			return this.$store.state.contact
		},
		menuItems: function () {
			var menuItems = []


			if (!this.relationEvent) {
				menuItems.push({
					click: "cameraHandler",
					title: this.$i18n.t("button.takePhotoOrVideo"),
					icon: "fas fa-camera",

					upload: {
						multiple: true,
						extensions: ['jpg', 'jpeg', 'png', 'webp'],
						maxsize: 100,
						images: {
							resize: {
								type: 'fit'
							}
						}
					}
				})

				menuItems.push({
					click: "fileHandler",
					title: this.$i18n.t("button.sendFile"),
					icon: "fas fa-sticky-note",

					upload: {
						multiple: true,
						extensions: [],
						maxsize: 25,
						images: {
							resize: {
								type: 'fit'
							}
						}
					},
				})
			}


			if (this.transaction) {
				menuItems.unshift({
					click: "sendtransactionWrapper",
					title: this.$i18n.t("button.sendCoins"),
					icon: "fas fa-wallet"
				})
			}

			return menuItems
		},
		...mapState([
			'chats'
		]),

		userlist: function () {


			if (!this.chat) return []

			return this.core.mtrx.chatUsersInfo(this.chat.roomId, 'anotherChatUsers')

		},

		transaction: function () {
			return f.deep(window, 'POCKETNETINSTANCE.platform.ui.wallet.send')
		},

		uusers: function () {
			if (this.u) {
				return _.map(this.u.split(','), (u) => {
					return u
				})
			}

			return []
		},
		ausers: function () {
			if (this.u) {
				return _.map(this.u.split(','), (u) => {
					return this.core.user.matrixId(u)
				})
			}

			return []
		},
		stateChat: function () {
			var id = this.$route.query.id
			return this.$store.state.chatsMap[id]
		},
		invited: function () {

			if (!this.chat) {
				if (this.u) return this.ausers
				return []
			}

			return _.map(_.filter(this.chat.currentState.getMembers(), function (m, v) {
				return m.membership === 'invite'
			}), function (u) {
				return u.userId
			})
		},

		joined: function () {

			if (!this.chat) return []

			let roomId = this.chat.roomId
			let self = this
			let arr = []
			let members = 0

			this.chat.currentState.getMembers().forEach(function (user) {
				if (user.membership === 'join') {
					arr.push(user.userId)
				}
			})

			return arr
		},

		tipusers: function () {

			if (this.tipvalue === null) return []
			if (this.tipvalue === '') return this.userlist

			var value = this.tipvalue.toLowerCase()

			var u = _.filter(this.userlist, function (u) {
				return u.name.toLowerCase().indexOf(value) == 0 && u.name.toLowerCase() != value
			})

			return u

		},

		maintipuser: function () {
			if (this.tipusers.length) {
				return this.tipusers[this.tipuserindex || 0]
			}

			return null
		},

		/*recordViewData() {
			if (this.recordRmsData.length) {
				let length = this.recordRmsData.length
				let step = this.recordRmsData.length / 100

				if (length > 100) {
					let result = []
					for (let i = 0; i < 100; i++) {
						result.push(this.recordRmsData[Math.round(i * step)])
					}
					return result
				}
			}
			return this.recordRmsData
		}*/
	},

	created() {

	},

	///

	mounted() {
		this.ready = true


		if (!this.chat && this.core.mtrx.client) {
			this.newchat().catch(e => {
				return Promise.resolve()
			})
		}

	},

	methods: {
		wait: function () {
			return this.$f.pretry(() => {
				return this.core.mtrx.client && this.core.mtrx.access
			})
		},

		browsetip: function (increase) {

			increase ? this.tipuserindex++ : this.tipuserindex--

			if (this.tipuserindex > this.tipusers.length - 1) {
				this.tipuserindex = 0
			}

			if (this.tipuserindex < 0) {
				this.tipuserindex = this.tipusers.length - 1
			}

		},

		selectcurrenttip: function () {
			this.insertuser(this.tipusers[this.tipuserindex || 0])
		},

		insertuser: function (user = {}) {
			var name = user.name || ''

			this.$refs['newinput'].inserttip(name)
		},

		tipBySearch: function (value) {
			this.tipvalue = value
		},

		showuserselected: function (contact, action) {
			this[action](contact)
		},

		sendtransactionWrapper: function () {

			this.menuIsVisible = false

			var users = _.filter(_.map(this.joined, (j) => {
				return this.$f.deep(this, '$store.state.users.' + this.$f.getmatrixid(j)) || null
			}), (r) => {
				return r && r.source && r.id != this.core.user.userinfo?.id
			})

			if (!users.length) {

				return 'users.length'
			}

			if (users.length > 1) {

				this.core.store.commit('setmodal', {
					caption: this.$i18n.t("caption.sendTransactionTo"),
					type: 'showuserselect',
					data: {
						users: users,
						action: 'sendtransaction',
						userselected: (c) => {
							this.showuserselected(c, 'sendtransaction')
						}
					}
				})

				/*this.showuserselect = {
				  users : users,
				  action : 'sendtransaction'
				}*/
			} else {
				this.sendtransaction(users[0])
			}


			this.$refs.dropdownMenu.hidePopup();

		},

		sendtransaction: function (user) {
			var api = this.transaction

			//TODO get address and send transaction

			api({
				roomid: this.chat.roomId,
				address: user.source.address
			})

			/*.then(({txid, from}) => {
	  
			  return this.core.mtrx.transaction(this.chat.roomId, txid)
	  
			})*/

		},

		emitInputData: function () {
			this.$emit('emptyInput')
			this.upload = true
		},

		HideUploadPic() {
			this.upload = false
		},

		emitUrl: function (url) {
			this.$emit('setMetaUrl', url)
		},

		newchat() {

			if (this.u) {
				this.$store.state.globalpreloader = true
				var matrixId = null
				var myMatrixId = null
				var chat = null
				var id = ''

				this.creating = true
				return this.core.user.usersInfo(this.uusers).then(info => {

					if (this.uusers.length == 1) {

						var _info = info[0]

						if (!_info || !_info.keys || _info.keys.length < 12) {

							this.$emit('cantchatcrypto')
							return Promise.reject('ny2')

						}
					}

					if (this.core.user.userinfo.keys.length < 12) {
						this.$emit('cantchatcrypto')
						return Promise.reject('ny2')
					}


					//return Promise.reject('ny3')

					id = this.core.mtrx.kit.tetatetid(info[0], this.core.user.userinfo)

					matrixId = this.core.user.matrixId(info[0].id)
					myMatrixId = this.core.user.matrixId(this.core.user.userinfo.id)

					var initialstate = [{
						"type": "m.set.encrypted",
						"state_key": "",
						"content": {
							encrypted: true
						}
					}]

					return this.core.mtrx.client.createRoom(
						{
							room_alias_name: id,
							visibility: 'private',
							invite: [matrixId],
							name: '#' + id,
							initial_state: initialstate

						}
					)

				}).then(_chat => {

					chat = _chat
					this.$store.state.globalpreloader = false

					let m_chat = this.core.mtrx.client.getRoom(_chat.room_id)
					let event = m_chat.currentState.getStateEvents("m.room.power_levels")

					return this.core.mtrx.client.setPowerLevel(chat.room_id, matrixId, 100, event[0]).catch(e => {
					})

				}).then(r => {
					this.creating = false


					if (this.connect && this.connect == id) {
						this.greetings()
					}

					this.$store.commit('CONTACT', false)

					return Promise.resolve()

				}).catch(e => {

					this.creating = false

					this.$store.state.globalpreloader = false

					if (e && e.errcode == 'M_ROOM_IN_USE') {

						return this.core.mtrx.client.joinRoom('#' + id + ':' + this.core.mtrx.baseUrl.replace("https://", "")).then(() => {
						}).catch(e => {

						})

					}

					return Promise.reject(e)

				})

			} else {
				return Promise.reject('u')
			}

		},

		maySendMessage() {
			return this.chat && this.chat.maySendMessage()
		},

		greetings() {
			this.send('👋').then(r => {
				return Promise.resolve(r)
			})
		},

		sendinput(text) {

			this.send(text).then(r => {

				return Promise.resolve(r)

			})

		},

		textCutLimit: function (text, limit) {
			text = text.trim();
			if (text.length <= limit) return text;

			text = text.slice(0, limit);

			return text.trim() + "...";
		},

		replaceMentions(text) {

			_.each(this.userlist, function (user) {
				text = text.replace(new RegExp('@' + user.name, 'g'), '@' + user.id + ':' + user.name)
			})

			return text
		},

		send(text) {

			if (!this.chat) {
				this.newchat().catch(e => {
				})
			}

			this.$emit("sending")


			if (!this.relationEvent) {
				this.focus()
			}

			return this.$f.pretry(() => {

				return this.chat && !this.creating

			}).then((r) => {

				this.$emit('sent')

				text = this.replaceMentions(text)

				if (this.relationEvent) {

					if (this.relationEvent.type == 'm.replace' && this.relationEvent.event) {

						return this.core.mtrx.textEvent(this.chat, text).then(r => {

							r['m.relates_to'] = {
								"rel_type": "m.replace",
								"event_id": this.core.mtrx.clearEventId(this.relationEvent.event) || f.makeid(),
							}

							var editEvent = r

							this.relationEvent.event.event.content.body = r.body
							this.relationEvent.event.event.content.block = r.block
							this.relationEvent.event.event.content.msgtype = r.msgtype

							delete this.relationEvent.event.event.decryptKey
							delete this.relationEvent.event.event.decrypted

							return this.core.mtrx.client.sendEvent(this.chat.roomId, 'm.room.message', editEvent)

						}).then(r => {

							this.core.store.dispatch('FETCH_EVENTS')

							this.$emit('clearRelationEvent')

							this.$emit('force')

							return Promise.resolve()
						}).catch(e => {


							return Promise.reject(e)
						})

					}

				}

				return this.core.mtrx.sendtext(this.chat, text, { relation: this.relationEvent })

			}).catch(e => {


				this.$emit('sentMessageError', {
					error: e
				})

			})

		},

		pasteImage(data) {
			this.sendImage({ base64: data })
		},

		sendImage: function ({ base64, file }) {

			var id = f.makeid()

			var meta = {
				type: "image",
				id: id,
				base64: base64,
			}

			this.$emit("sendingData", meta)
			//setTimeout(() => {
			this.$f.pretry(() => {

				return this.chat

			}).then(() => {
				if (meta.aborted)
					return Promise.reject('aborted')

				return this.core.mtrx.sendImage(this.chat, base64, null, meta, { relation: this.relationEvent })

			}).then(r => {

				this.$emit("sentData", {
					id: id
				})

				return Promise.resolve()

			}).catch(e => {

				this.$emit('sentError', {
					id: id,
					error: e
				})

				return Promise.resolve()

			})
			//}, 5000)


		},

		canencryptfilesize: function (file) {

			var s = 10 * 1024 * 1024

			if (!this.chat.pcrypto.canBeEncrypt()) {
				return Promise.resolve(false)
			}

			if (file.size > s) {


				return this.$dialog.confirm(
					'Files larger than 10 megabytes are not encrypted. Do you want to send the file unencrypted?', {
					okText: 'Yes',
					cancelText: 'No, cancel'
				})

					.then((dialog) => {

						return Promise.resolve(true)

					}).catch(e => {
						return Promise.reject('cancel')
					})


			}

			return Promise.resolve(false)
		},

		sendFile: function ({ file }) {

			var id = f.makeid()

			var meta = {
				type: "file",
				id: id,
				info: {
					name: file.name,
					size: file.size
				}
			}

			this.$emit("sendingData", meta)

			this.$f.pretry(() => {

				return this.chat

			}).then(() => {

				return this.canencryptfilesize(file)


			}).then((notenc) => {

				return this.core.mtrx.sendFile(this.chat, file, meta, { relation: this.relationEvent }, notenc)

			}).then(() => {

				this.$emit("sentData", {
					id: id
				})

				return Promise.resolve()

			}).catch(e => {

				this.$emit('sentError', {
					id: id,
					error: e
				})
			})


		},

		focus: function () {
			if (this.$refs['newinput'])
				this.$refs['newinput'].focus()
		},

		focused: function () {
			this.$emit('focused')
		},

		blur: function () {
			if (this.$refs['newinput'])
				this.$refs['newinput'].blur()
		},

		blurifempty: function () {
			if (this.$refs['newinput'])
				this.$refs['newinput'].blurifempty()
		},

		change: function () {
		},

		setText: function (text) {
			this.text = text

			if (this.$refs['newinput'])
				this.$refs['newinput'].setText(text)
		},

		keyup: function (evt) {
			var value = evt.target.value

			if (value === '') {
				this.$emit('inputClean', false)
				return
			} else {
				this.$emit('inputClean', true)
			}

			this.text = value
			this.anyUrlMeta = f.getUrl(this.text)


			if (this.anyUrlMeta !== undefined) {
				this.$emit('setMetaUrl', this.anyUrlMeta)
			} else {
				this.$emit('inputClean', false)
			}

			if (this.chat)
				this.core.mtrx.client.sendTyping(this.chat.roomId, true, 100)
		},

		menuItemClick(item, rowObject) {
			this[item.click](rowObject);
		},

		menuItemLoadedHandler: function (value) {

			this.menuIsVisible = value

			return this.menuIsVisible
		},

		uploadStart(item, files) {

		},

		uploadError(item, error) {
			this.$store.commit('icon', {
				icon: 'error',
				message: error.text
			})
		},
		getImg() {
			return this.imgs = true
		},
		uploadSizeError(value) {
			if (!value) {
				this.$refs.dropdownMenu.hidePopup();
			}
		},
		uploadUploaded(item, data) {
			const validImageTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp'];


			if (!validImageTypes.includes(data.file.type)) {
				this.sendFile(data)
			} else {
				return this.sendImage(data)
			}
		},
		imageWH(file) {
			const img = new Image();
			var imgInfo = {};

			return new Promise((resolve, reject) => {

				img.onload = function () {
					imgInfo.w = this.width
					imgInfo.h = this.height
					resolve(imgInfo)
				}

				img.onerror = function (e) {
					reject(e)
				}

				img.src = file.base64
			})

		},
		uploadUploadedAll(item, result) {
			this.$store.state.loading = false
			this.$refs.dropdownMenu.hidePopup();
		},

		

		async initRecording() {

			if(this.prepareRecording || this.isRecording) return

			this.prepareRecording = cancelable(this.core.initMediaRecorder().then((recorder) => {

				if (this.prepareRecording){
					return Promise.resolve(recorder)
				}
				else{
					recorder.stream.getTracks().forEach((track) => {
						track.stop();
					});
				}

			}))

			this.prepareRecording.then((recorder) => {

				console.log("recorder", recorder)

				this.mediaRecorder = recorder
				this.microphoneDisabled = false
				this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
				this.audioAnalyser = this.audioContext.createAnalyser()

				//var audioDataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount)
				
				var src = this.audioContext.createMediaStreamSource(this.mediaRecorder.stream)
					src.connect(this.audioAnalyser)

				this.startRecording()

			}).catch(err => {

				console.error(err)

				if(err == 'permissions'){
					this.microphoneDisabled = true

					if(window.cordova){
						console.error('cordova')
					}
					else{	
						this.$dialog.confirm(
							this.$i18n.t('micaccessbrowser'), {
							okText: this.$i18n.t("button.ok"),
						})
					}
				}

				else{

					this.$dialog.confirm(
						this.$i18n.t('micaccesscommonproblem'), {
						okText: this.$i18n.t("button.ok"),
					})

					console.error(err)
				}

			}).finally(() => {
				this.prepareRecording = null
			})


		},

		startRecording() {

			this.$store.commit('SET_VOICERECORDING', true)

			this.isRecording = true
			this.cancelOpacity = 0
			this.recordRmsData = []
			this.recordTime = 0
			this.record = null
			this.mediaRecorder.start()

			var sec = 0
			var rmsdata = []


			this.interval = setInterval(() => {
				var dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount)

				this.audioAnalyser.getByteFrequencyData(dataArray)

				rmsdata.push(this.generateRms(dataArray))

				if(rmsdata.length > 50) rmsdata = _.last(rmsdata, 50)

				sec = sec + 50

				this.recordRmsData = _.clone(rmsdata)
 
				if(sec % 1000 === 0) this.recordTime = sec

				
			}, 50)

		},


		checkaudioForSend : function(sendnow){

			if(!this.record){
				return
			}

			if (this.record.duration < 1) {
				this.clear()
			}
			else{
				if(sendnow) this.sendVoiceMessage()
			}
		},


		createVoiceMessage(event, sendnow) {

			console.log('event', event)

			this.record = {
				file: event.data,
				id : f.makeid()
			}

			f.readFile(event.data).then(arraybuffer => {

				this.audioContext.decodeAudioData(arraybuffer, (buffer) => {

					this.record.duration = buffer.duration

					this.checkaudioForSend(sendnow)

				}).catch(e => {
					console.error('e', e)
				})

				
			})
			
		},

		generateRms(frequencies) {
			return +Math.sqrt(frequencies.reduce((a, b) => a + b ** 2) / frequencies.length).toPrecision(4)
		},

		stopRecording({ cancel, sendnow }) {


			this.$store.commit('SET_VOICERECORDING', false)

			if (this.prepareRecording){

				this.prepareRecording.cancel()
				this.prepareRecording = null

				return
			}

			this.isRecording = false

			if (this.interval) {
				clearInterval(this.interval)
				this.interval = null
			}

			if (this.mediaRecorder) {

				if (cancel) {
					//this.mediaRecorder.ondataavailable = () => { }
					
				}
				else{
					this.mediaRecorder.addEventListener('dataavailable', (event) => {
						this.createVoiceMessage(event, sendnow)
					})//ondataavailable = (event) => this.createVoiceMessage(event, sendnow)
				}

				this.mediaRecorder.stop()

				this.mediaRecorder.stream.getTracks().forEach((track) => {
					track.stop();
				});
	
				this.mediaRecorder = null
			}

		},

		async sendVoiceMessage() {

			this.recordRmsData = []
			const base64 = await this.core.convertAudioToBase64(this.record.file)

			const id = f.makeid()

			const meta = {
				type: "audio",
				id: id,
				base64: base64,
			}

			this.clear()

			this.$f.pretry(() => {
				return this.chat
			}).then(() => {
				return this.core.mtrx.sendAudio(this.chat, base64, null, meta, { relation: this.relationEvent })
			}).catch(e => {
				this.$emit('sentError', {
					id: id,
					error: e
				})
				return Promise.resolve()
			})


		},

		clear() {
			this.record = null
			this.recordRmsData = []
		},

		/*async convertAudioToBase64(blob) {
			const reader = new FileReader()
			reader.readAsDataURL(blob)
			return new Promise(resolve => {
				reader.onloadend = () => {
					resolve(reader.result)
				}
			})
		},*/

		setOpacity(opacity) {
			this.cancelOpacity = opacity
		}

	},
}
