import { mapActions, mapState } from 'vuex'
import dummypreviews from '@/components/chats/dummypreviews/index.vue'
import preview from '@/components/chats/preview/index.vue'
import teamroom from '@/components/teamroom/index.vue'
import f from "@/application/functions";
import moment from "moment";
import _ from "underscore";

export default {
	name: "list",
	data: function () {

		return {
			loading: false,
			textValue: '',
			enabled: true,
			page: 0,
			revealed: {},
			lastEventDescription: '',
			blocked: false
		}

	},
	components: {
		preview,
		/* SwipeOut,*
		 SwipeList,*/
		dummypreviews,
		teamroom
	},

	props: {
		user_data: {
			type: String,
			default: () => {
			}
		}
	},
	created: () => {

	},

	watch: {
		topchatid: function () {
			if (this.hmode) {
				this.$emit('scrolltop')
			}
		}
		//$route: 'getdata'
	},

	beforeDestroy() {
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);
	},

	computed: mapState({
		window: function () {
			return window
		},
		auth: state => state.auth,

		teamNotifications: function () {
			var self = this;
			return _.filter(this.pocketteammessages, function (m) {
				return !self.readedteammessages[m.id]
			}).length;
		},

		...mapState([
			'minimized',
			'active',
			'pocketnet',
			'chatsready',
			'prechats',
			'chats',
			'unauthorized',
			'share',
			'pocketteammessages',
			'readedteammessages',
			'deletedrooms'
		]),

		rooms: function () {
			return this.core.mtrx.client.getRooms()
		},
		empty: function () {
			return this.core.mtrx.ready && this.chats.length === 0
		},

		topchatid: function () {
			if (this.chats && this.chats.length) {
				return this.chats[this.chats.length - 1].roomId
			}

		},

		chats: function (state) {
			var self = this
			var chats = [];

			_.each(state.chats, (chat) => {

				if (this.deletedrooms[chat.roomId]) return

				this.core.mtrx.kit.tetatetchat(this.m_chat)

				

				var users = this.core.mtrx.chatUsersInfo(chat.roomId, 'anotherChatUsers')

				if (
					users.length === 1 &&
					users[0] &&
					self.core.mtrx.client.isUserIgnored(f.getMatrixIdFull(users[0].id, self.core.domain))
				) {

					return

				} else {
					chats.push(chat)
				}

			})

			return _.sortBy(chats, function (o) {
				return o.lastModified
			}).reverse()

		},
		withoutBlockedChats: function () {
			var self = this
			if (this.share) {
				_.map(self.chats, function (chat) {
				})
			}

		},
		activeuser: function () {
			return this.core.user.userinfo
		},

		hmode() {
			return this.pocketnet && this.minimized && !this.active
		}

	}),
	methods: {
		invitepnt() {
			this.core.invitepnt()
		},
		generatekeys: function () {

		},
		moment() {
			return moment()
		},
		dd(v) {
		},
		revealFirstRight() {
			this.$refs.list.revealRight(0);
		},
		revealFirstLeft() {
			this.$refs.list.revealLeft(0);
		},

		remove(item) {
			this.$set(this.mockSwipeList, this.page, this.mockSwipeList[this.page].filter(i => i !== item));
		},

		setLastEvent(name, { item, index }) {
			this.lastEventDescription = {
				name,
				index,
				id: item.id,
			};
		},



		itemClick(chat) {

			if (this.hmode) {

				this.$store.commit('active', true)
				this.$store.commit('blockactive', { value: true, item: 'main' })
				this.$store.commit('setiteraction', true)


				if (
					!this.share &&
					this.$store.state.lastroom &&
					this.$store.state.lastroom.id == chat.roomId) {
					this.$router.push('chat?id=' + this.$store.state.lastroom.id)
				}
			}
			else {

				if (this.share) {

					var _share = this.share

					this.$store.commit('SHARE', null)

					this.$store.commit('icon', {
						icon: 'loading',
						message: "",
						manual: true
					})

					this.core.mtrx.shareInChat(chat.roomId, _share).then(r => {

						this.$store.commit('icon', {
							icon: 'success',
							message: "",
						})

						this.$router.push(_share.route || 'chat?id=' + chat.roomId)

					}).catch(e => {

						this.$store.commit('icon', {
							icon: 'error',
							message: "",
						})

						if (_share.route) {
							this.$router.push(_share.route)
						}

					})

				} else {
					this.$router.push('chat?id=' + chat.roomId)
				}

			}

		},
		fbClick(e) {
		},
		sbClick(e) {
		},
		openTeamRoom: function () {
			console.log('this.hmode', this.hmode)
			if (this.hmode) {

				this.$store.commit('active', true)
				this.$store.commit('blockactive', { value: true, item: 'main' })
				this.$store.commit('setiteraction', true)

			}
			else {
				setTimeout(() => {

					this.$store.commit('SET_READEDTEAMMESSAGES', this.pocketteammessages);
					this.$store.commit('ALL_NOTIFICATIONS_COUNT', this.core.mtrx.client.getRooms());

				}, 500);

				this.$router.push('/teamroom');
			}


		},
		// keyboard
		onKeyDown(e) {
			if (e.keyCode !== 16) return;
			this.enabled = false;
		},
		onKeyUp(e) {
			if (e.keyCode !== 16) return;
			this.enabled = true;
		},
		removeRoom(room) {

			this.$dialog.confirm(
				'Do you really want to leave room?', {
				okText: this.$i18n.t("yes"),
				cancelText: this.$i18n.t("cancel")
			})

				.then((dialog) => {

					this.core.mtrx.client.leave(room).then(r => {
						this.core.mtrx.client.forget(room, true).then(r => {
							return r
						}).then(r => {
							this.$store.commit('DELETE_ROOM', room);
							this.$router.push({ path: '/chats' })
						})
					})

				})


		},

		tetatetchat(room) {


			if (!room) return true

			var m_ch = this.core.mtrx.client.getRoom(room.roomId)

			if (!m_ch) return true

			return this.core.mtrx.kit.tetatetchat(this.core.mtrx.client.getRoom(room.roomId))
		}
	},
	mounted() {

		// ideally should be in some global handler/store
		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);


		if (!this.hmode) {
			this.$store.commit('SET_LAST_ROOM', null);
		}
		else {
			console.log("IN MODE")
		}


	}
}