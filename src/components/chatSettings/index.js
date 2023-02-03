import { mapState } from "vuex";
import chatIcon from "@/components/chats/assets/icon.vue";
import upload from "@/components/assets/upload/index.vue";
export default {
	data: () => ({
		pubChat: Object,
		topicTxt: "",
		topic: false,
		userImagebase64: null,

		upl : {
			extensions : ["jpg", "jpeg", "png", "webp"],
			images: {
				resize: {
					width : 200,
					height : 200,
					type: "fit",
				},
			}
		}
	}),
	props: {
		chat: Object,
		saveClicked: false,
	},

	components: {
		chatIcon, upload
	},
	computed: mapState({
		pocketnet: (state) => state.pocketnet,
		minimized: (state) => state.minimized,
		active: (state) => state.active,
		auth: (state) => state.auth,
		m_chat: function () {
			return this.core.mtrx.client.getRoom(this.chat.roomId);
		},
		shareRoomLink: function () {
			return `https://${
				this.core.domain
			}/publicPreview/welcome?connect=${this.chat.roomId.replace("!", "%")}`;
		},
	}),
	mounted() {
		const avatar =
			this.m_chat.currentState.getStateEvents("m.room.avatar")[0]?.event.content
				.avatarUrl;
		this.userImagebase64 = avatar !== "" ? avatar : null;
		if (this.m_chat.getJoinRule() === "public") {
			this.getPublicRoom();
			this.topic = true;
		}
	},
	methods: {

		cameraHandlerCustom: function () {
			var result = [];

			window.POCKETNETINSTANCE.platform.ui.uploadImage({
				multiple: true,

				action: ({ base64 }, resolve) => {
					return this.resizeImage(base64)
						.then((base64) => {
							return f.Base64.toFile(base64).then((file) => {
								var data = {
									base64,
									file,
								};

								result.push(data);

								this.uploadUploaded(data);

								resolve();
							});
						})
						.catch((e) => {
							console.error(e);
							resolve();
						});
				},

				onSuccess: (imgs) => {
				},
			});
		},

		saveEdited() {

			var promises = []

			promises.push(this.core.mtrx.client.setRoomAvatarUrl(
				this.m_chat.roomId,
				this.userImagebase64
			).catch(e => {
				return Promise.reject('image')
			}));
			promises.push(this.core.mtrx.client.setRoomName(
				this.m_chat.roomId,
				"@" + this.m_chat.name.replace(/[@]*/g, "")
			).catch(e => {
				return Promise.reject('image')
			}));
			promises.push(this.core.mtrx.client
				.setRoomTopic(this.chat.roomId, this.topicTxt.replace(/ /g, "_"))
				.then((r) => {
					return r;
			}).catch(e => {
				return Promise.reject('topic')
			}));

			this.$store.state.globalpreloader = true;

			Promise.all(promises).then(() => {
				this.$store.commit("icon", {
					icon: "success",
				});
			})

			.catch((e) => {

				this.$store.commit("icon", {
					icon: "error",
				});

			}).finally(() => {
				this.$store.state.globalpreloader = false;
			})


		},
		getPublicRoom() {
			this.core.mtrx.client.publicRooms().then((r) => {
				this.pubChat = r.chunk.filter(
					(room) => room.room_id === this.chat.roomId
				)[0];
				if (this.pubChat["topic"]) {
					this.topicTxt = this.pubChat["topic"].replace(/_/g, " ");
				}
			});
		},
		handleImage(e) {
			const selectedImage = e.target.files[0];
			this.createBase64Image(selectedImage);
		},

		uploadUploaded(data){
			this.userImagebase64 = data.base64
			console.log("DATA", data)
		},

		uploadError(){

		},

		createBase64Image(FileObject) {
			const reader = new FileReader();

			reader.onload = (event) => {
				this.userImagebase64 = event.target.result;
			};
			
			reader.readAsDataURL(FileObject);
		},
	},
};
