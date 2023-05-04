<template>
	<div
		class="event"
		:class="{ readyToRender, my }"
		ref="msgElement"
		v-if="
			!event.localRedactionEvent() && !event.getRedactionEvent() && !removed
		"
	>
		<member
			:chat="chat"
			:event="event"
			:userinfo="userinfo"
			:readed="readed"
			:preview="preview || false"
			@readyToRender="setReadyToRender"
			v-if="type === 'member' && !preview"
		/>

		<message
			@openGalleryImg="openImage"
			:chat="chat"
			:event="event"
			:prevevent="prevevent"
			:origin="event"
			:decryptEvent="decryptEvent"
			:decryptedInfo="decryptedInfo"
			:encryptedData="encryptedData"
			:imgEvent="galleryData"
			:userinfo="userinfo"
			:readed="readed"
			:preview="preview || false"
			:withImage="withImage || false"
			:clientWidth="clientWidth"
			:encrypted="encrypted"
			:subtype="subtype"
			:error="error"
			:reference="reference"
			:downloaded="downloaded"
			:showmyicontrue="showmyicontrue"
			:fromreference="fromreference"
			:searchText="searchText"
			:multiSelect="multiSelect"
			:selectedMessages="selectedMessages"
			:audioBuffer="audioBuffer"
			@readyToRender="setReadyToRender"
			@remove="removeEvent"
			@download="downloadFile"
			@decryptagain="decryptAgain"
			@showMultiSelect="$emit('showMultiSelect')"
			@selectMessage="selectMessage"
			@removeMessage="removeMessage"
			@editing="editing"
			@reply="reply"
			@share="share"
			@menuIsVisible="menuIsVisibleHandler"
			@toreference="toreference"
			v-if="type === 'message' || preview"
		/>

		<common
			:event="event"
			:userinfo="userinfo"
			:readed="readed"
			:preview="preview || false"
			v-if="type === 'common'"
		/>

		<div class="loading" v-if="downloading">
			<linepreloader />
		</div>
	</div>

	<div v-else class="deletedMessage">
		<i class="fas fa-eraser"></i> {{ $t("caption.messageDeleted") }}
	</div>
</template>

<style scoped lang="sass">
.deletedMessage
  font-size: 0.8em
  text-align: center
  opacity: 0.6
  padding : 2 * $r

.event
  opacity: 0
  +transition(0.3s)

  &.readyToRender
    opacity: 1

  .loading
    position: relative
    left : 0
    top : 0
    padding : $r
    width : 100%
    height : 100%
    text-align: center

  .deletedMessage
    position: relative
    left : 0
    top : 0
    padding : $r
</style>

<script>
import dummypreviews from "@/components/chats/dummypreviews";
import common from "@/components/events/event/common/index.vue";
import member from "@/components/events/event/member/index.vue";
import message from "@/components/events/event/message/index.vue";

import f from "@/application/functions";

var rendered = {};

export default {
	name: "eventsEvent",

	components: {
		common,
		member,
		message,
		dummypreviews,
	},

	data: function () {
		return {
			decryptEvent: {},
			decryptedInfo: null,
			decryptReady: "",
			readyEvent: false,
			downloading: false,
			error: null,
			reference: null,
			removed: false,
			downloaded: false,
			audioBuffer: null,

			readyToRender: false,
      users: []
		};
	},

	props: {
		event: Object,
		prevevent: Object,
		preview: Boolean,
		withImage: Boolean,
		timeline: Object,
		last: Boolean,
		chat: Object,
		showmyicontrue: Boolean,

		metaUrl: String,
		galleryData: {},
		goToGallery: Function,
		clientWidth: Number,
		fromreference: Boolean,
		searchText: String,

		multiSelect: {
			default: false,
			type: Boolean,
		},
		selectedMessages: {
			type: Array,
			default: () => {
				return [];
			},
		},
	},

	computed: {
		/*readyToRender : function(){
      if(this.$refs["cmessage"]) {


        if(this.$refs["cmessage"].readyToRender){
          return true
        }

      }

      return true
    },*/
		type: function () {
			var t = f.deep(this, "event.event.type");
			if (["m.room.member"].indexOf(t) > -1) return "member";
			if (["m.room.message"].indexOf(t) > -1) return "message";
			if (["m.room.name"].indexOf(t) > -1) return "member";
			if (["m.room.power_levels"].indexOf(t) > -1) return "member";
			if (["m.room.redaction"].indexOf(t) > -1) return "message";
			if (["m.room.request_calls_access"].indexOf(t) > -1) return "message";
			if (["m.call.candidates"].indexOf(t) > -1) return "message";
			if (["m.call.hangup"].indexOf(t) > -1) return "message";
			if (["m.call.invite"].indexOf(t) > -1) return "message";
			if (["m.call.reject"].indexOf(t) > -1) return "message";
			if (["m.call.answer"].indexOf(t) > -1) return "message";
			if (["m.room.topic"].indexOf(t) > -1) {
				return "member";
			}

			return "";
		},

		readed: function(){

			var reciept = this.$store?.state.readreciepts[this.chat.roomId]

			if(!reciept) return false

			return (this.event.event.origin_server_ts < reciept.ts && reciept.ev?.event.event_id == this.event.event.event_id)

		},

		subtype: function () {
			return f.deep(this, "event.event.content.msgtype");
		},

		encryptedData: function () {
			return f.deep(this, "event.event.content.info.secrets") ||
				f.deep(this, "event.event.content.pbody.secrets")
				? true
				: false;
		},

		userinfo: function () {

			return this.$store?.state.users[this.$f.getmatrixid(this.event.getSender())] || {}
      /*const id = this.$f.getmatrixid(this.event.getSender());

      return this.$store?.state.users[id] || (() => {
				if (!this.users[id]) {
					this.$set(this.users, id, this.chat.getMember(id));
				}

				return this.users[id];
			})();*/

		},

		///readreciepts

		encrypted: function () {
			if (this.chat && this.chat.roomId) {
				return this.core.mtrx.client.isRoomEncrypted(this.chat.roomId);
			}

			return false;
		},

		my: function () {
			return this.userinfo.id === this.core.user.userinfo?.id;
		},
	},

	beforeDestroy: function () {
		/*if (this.readedInterval) {
			clearInterval(this.readedInterval);
			this.readedInterval = null;
		}*/
	},

	mounted: function () {
		this.$emit("mounted");
	},

	beforeMount: function () {


		if (
			(this.event && this.event.event && rendered[this.event.event.event_id]) ||
			(this.event.txnId && rendered[this.event.txnId])
		) {
			this.readyToRender = true;
		}
	},

	watch: {
		
		event: {
			immediate: true,
			handler: function () {
				this.decryptEvent = {};

				//this.checkReaded();
				this.relations();

				if (this.encryptedData || this.subtype == "m.encrypted") {
					f.pretry(
						() => {
							return this.chat.pcrypto;
						},
						20,
						10000
					).then(() => {
						if (this.encryptedData && this.subtype == "m.image") {
							this.decryptImage();
						}

						if (this.encryptedData && this.subtype == "m.audio") {
							this.decryptAudio();
						}

						if (this.subtype == "m.encrypted") {
							this.decrypt();
						}
					});
				} else {
					if (this.subtype == "m.audio") {
						this.getAudioUnencrypt();
					}
				}
			},
		},
	},

	methods: {
		setReadyToRender() {
			setTimeout(() => {

				if (this.readyToRender) return;

				if (this.event && this.event.event) {
					rendered[this.event.event.event_id] = true;
				}

				if (this.event && this.event.txnId) {
					rendered[this.event.txnId] = true;
				}

				this.readyToRender = true;

				rendered;
			}, 20);
		},
	
		relations() {
			if (this.timeline) {
				var ts = this.timeline.timelineSet;
				var e = this.event;

				if (
					!this.reference &&
					e.event.content["m.relates_to"] &&
					e.event.content["m.relates_to"] &&
					e.event.content["m.relates_to"]["rel_type"] == "m.reference"
				) {
					var id = e.event.content["m.relates_to"]["event_id"];

					if (id) {
						this.core.mtrx.client.getEventTimeline(ts, id).then((r) => {
							var ev = _.find(r.getEvents(), (e) => {
								if (e.getId() == id) {
									return true;
								}
							});

							if (ev) {
								this.reference = e.event.content.reference = ev;

								var rt = ts.relations.getChildEventsForEvent(
									this.core.mtrx.clearEventId(ev),
									"m.replace",
									"m.room.message"
								);

								if (rt) {
									var last = rt.getLastReplacement();

									if (last) {
										ev.event.content.body = last.event.content.body;
										ev.event.content.edited = last.event.event_id;
										ev.event.content.block = last.event.content.block;
										ev.event.content.msgtype = last.event.content.msgtype;
										ev.event.decrypted = last.event.decrypted;
									}
								}
							}
						});
					}
				}
			}
		},

		editing(text) {
			this.$emit("editing", text);
		},

		reply() {
			this.$emit("reply");
		},

		share(sharing) {
			return this.core.share(sharing)
		},

		downloadFile() {
			this.downloading = true;

			this.core.mtrx
				.downloadFile(this.chat, this.event).then((r) => {
					
					this.downloaded = true;

					this.$store.commit("icon", {
						icon: "success",
						message: "Downloaded",
					});

				})
				.catch((e) => {
					this.error = e.toString();

					this.$store.commit("icon", {
						icon: "error",
						message: "Downloading Failed",
					});

					return Promise.resolve(e);
				}).finally(() => {
					this.downloading = false;
					
				})
		},

		getAudioUnencrypt() {
			this.core.mtrx
				.getAudioUnencrypt(this.chat, this.event)
				.then((url) => {
					this.audioBuffer = url;

					//this.$set(this.event.event.content, 'audioData', url)
				})
				.catch((e) => {
					//console.error(e)
				});
		},

		async decryptAudio() {
			this.core.mtrx
				.getAudio(this.chat, this.event)
				.then((url) => {
					this.decryptedInfo = url;
				})
				.catch((e) => {
					this.event.event.decryptKey = this.decryptKey = {
						msgtype: "m.bad.encrypted",
					};
				});
		},

		async decryptImage() {
			this.core.mtrx
				.getImage(this.chat, this.event)
				.then((url) => {
					this.decryptedInfo = url;
				})
				.catch((e) => {
					this.event.event.decryptKey = this.decryptKey = {
						msgtype: "m.bad.encrypted",
					};
				});
		},

		async decryptAgain() {
			this.event.event.decrypted = null;
			return this.decrypt();
		},

		async decrypt() {
			if (this.event.event.decrypted) {
				this.decryptEvent = this.event.event.decrypted;

				return Promise.resolve();
			}

			try {
				var de = await this.chat.pcrypto.decryptEvent(this.event.event);

				this.decryptEvent = de;
				this.event.event.decrypted = this.decryptEvent;
			} catch (e) {
				console.error(e);

				this.event.event.decrypted = this.decryptEvent = {
					msgtype: "m.bad.encrypted",
				};
			}
		},

		/*checkReaded: function () {
			if (this.event) {
				this.readed = this.core.mtrx.isReaded(this.event) || null
			}
		},*/
		openImage: function () {
			this.$emit("openImageEvent", this.event);
		},

		removeEvent: function (event) {
			this.$emit("removeEvent", event);

			this.removed = true;
		},

		menuIsVisibleHandler: function (isVisible) {
			this.$emit("menuIsVisible", isVisible);
		},

		selectMessage: function (message) {
			this.$emit("selectMessage", message);
		},

		removeMessage: function (message) {
			this.$emit("removeMessage", message);
		},

		shareManyMessages: function (isShare) {
			this.$emit("shareManyMessages", isShare);
		},


		toreference : function(reference){
			this.$emit("toreference", reference);

		}
	},
};
</script>
