<template>
	<div class="listPreview">
		<div v-if="urlpreview && metaPreviewLink" class="previewMessage">
			<span class="sname txt" v-if="senderName">{{ senderName == 'You' ? $t("caption.you") : senderName}}&nbsp;</span>
			<span class="linkTitle txt">sent link: {{ meta["og:title"] }} </span>

			<span v-if="meta['og:site_name'] === 'Pocketnet'" class="pocketnetLink">
				{{ meta["og:site_name"] }}
			</span>
			<span v-else>
				{{ meta["og:site_name"] }}
			</span>
		</div>

		<div v-if="content.msgtype === 'm.file'" class="previewMessage">
			<span class="sname txt" v-if="senderName">{{ senderName == 'You' ? $t("caption.you") : senderName }}&nbsp;</span>
			<span class="txt"> sent file: {{ JSON.parse(content.body).name }} </span>
		</div>

		<div v-if="content.msgtype === 'm.bad.encrypted'" class="previewMessage">
			<span>
				{{ $t("caption.unabletoDecrypt") }}
			</span>
		</div>

		<div v-if="event.event.type === 'm.room.redaction'" class="previewMessage">
			<span class="txt">
				<i class="fas fa-eraser"></i> {{ $t("caption.messageDeleted") }}
			</span>
		</div>
		<div
			v-if="event.event.type === 'm.room.power_levels'"
			class="previewMessage"
		>
			<span v-if="senderName" class="txt sname">{{ senderName == 'You' ? $t("caption.you") : senderName }}&nbsp;</span>
			<span class="txt">
				{{ powerLevels }}
			</span>
		</div>

		<div v-if="content.msgtype === 'm.image'" class="previewMessage">
			<span v-if="senderName" class="txt sname">{{ senderName == 'You' ? $t("caption.you") : senderName }}&nbsp;</span
			><span class="txt">{{ $t("caption.sentImage") }}</span>
		</div>

		<div v-if="content.msgtype === 'm.audio'" class="previewMessage">
			<span v-if="senderName" class="txt sname">{{ senderName == 'You' ? $t("caption.you") : senderName}}&nbsp;</span
			><span class="txt">{{ $t("caption.sentVoiceMessage") }}</span>
		</div>

		<div v-if="content.call_id" class="previewMessage">
			<span class="txt">{{ $t(event.event.type) }}</span>
			<span
				v-if="
					senderName &&
					senderName != 'You' &&
					event.event.type === 'm.call.invite'
				"
				class="txt sname"
				> {{ senderName == 'You' ? $t("caption.you") : senderName}}</span
			>
		</div>

		<div
			v-if="event.event.type === 'm.room.request_calls_access'"
			class="previewMessage"
		>
			<span class="txt">{{ core.vm.$i18n.t("caption.requestCallAccess")}}</span>
		</div>

		<div
			v-if="content.msgtype === 'm.text' && !urlpreview"
			class="previewMessage"
		>
			<span v-if="senderName && senderName != 'You'" class="txt sname"
				>{{ senderName == 'You' ? $t("caption.you") : senderName }}:&nbsp;</span
			><IncomingMessage
				:message="content.body"
				:markedText="markMatches"
			></IncomingMessage
			>
		</div>

		<div
			v-if="content.msgtype === 'm.encrypted' && !urlpreview"
			class="previewMessage"
		>
			<span v-if="senderName && senderName != 'You'" class="txt sname"
				>{{ senderName == 'You' ? $t("caption.you") : senderName }}:&nbsp;</span
			><IncomingMessage
				:message="decryptEvent.body"
				:markedText="markMatches"
			></IncomingMessage
			>
		</div>

		<div v-if="content.membership === 'invite'" class="invitedEvent">
			<span v-if="senderName" class="txt sname">{{ senderName == 'You' ? $t("caption.you") : senderName }}:&nbsp;</span>
			<span class="txt" v-if="tetatetchat">{{
				$t("caption.invitationToChat")
			}}</span>
			<span class="txt" v-if="!tetatetchat">{{
				$t("caption.invitationToRoom")
			}}</span>
		</div>

		<div v-if="content.membership === 'leave'" class="previewMessage">
			<span v-if="senderName" class="txt sname">{{ senderName == 'You' ? $t("caption.you") : senderName }}:&nbsp;</span>
			<span class="txt sname"> {{ name }} </span>
			<span class="txt">{{ $t("caption.leftChat") }}</span>
		</div>
		<div v-if="content.membership === 'ban'">
			<span v-if="senderName" class="txt sname">{{ senderName == 'You' ? $t("caption.you") : senderName }}&nbsp;</span>
			<span class="txt">banned {{ content.displayname }}</span>
		</div>
		<div
			v-if="content.membership === 'join' && event.getSender() !== userId"
			class="invitedEvent"
		>
			<span v-if="senderName" class="txt sname">{{ senderName == 'You' ? $t("caption.you") : senderName }}&nbsp;</span
			><span class="txt">{{ $t("caption.joined") }}</span>
		</div>

		<div v-if="content.name">
			<span class="txt"
				>{{ $t("caption.chatRenamed") }} <b>{{ content.name }}</b></span
			>
		</div>
		<div v-if="content.topic">
			<span class="txt"
				>{{ $t("caption.chatTopic") }}
				<b>{{ content.topic.replace(/_/g, " ") }}</b></span
			>
		</div>

		<div class="statusWrapper" v-if="readed">
			<div class="my" v-if="my">
				<i class="fas fa-check-double"></i>
			</div>
		</div>
	</div>
</template>
<script>
import f from "@/application/functions";
import IncomingMessage from "../incomingMessage/incomingMessage.vue";

export default {
	props: {
		event: {},
		chat: {},
		decryptEvent: {},
		notificationPreview: false,
		userinfo: Object,
		readed: Boolean,
		my: Boolean,
	},
	inject: ["matches", "markText"],
	components: { IncomingMessage },
	data: function () {
		return {
			meta: {},
		};
	},
	computed: {
		userId: function () {
			return this.core.user.userinfo?.id;
		},

		countMembers: function () {
			return _.size(this.chat?.currentState.members);
		},

		urlpreview: function () {
			if (this.content.msgtype !== "m.file") {
				return "";

				if (this.content.body) return f.getUrl(this.content.body) || "";
			}
		},

		tetatetchat: function () {
			return this.core.mtrx.kit.tetatetchat(this.chat);
		},

		unknowngroupusers: function () {
			return this.core.mtrx.kit.unknowngroupusers(this.m_chat);
		},

		senderName: function () {
			if (this.userinfo.id == this.userId) return "You";

			return this.userinfo.name || "";
		},

		metaPreviewLink: function () {
			this.core.mtrx.client.getUrlPreview(this.urlpreview, 0).then((r) => {
				return (this.meta = r);
			});

			return this.meta;
		},

		ev: function () {
			return this.event._clearEvent || this.event;
		},
		content: function () {
			return this.event.event.content;
		},
		name: function () {
			var n =
				this.$store.state.users[`${f.getmatrixid(this.event.event.state_key)}`]
					.name;

			if (n == this.senderName) return "";

			return n;
		},
		powerLevels: function () {
			if (
				this.event.event.type === "m.room.power_levels" &&
				this.event.event.unsigned.prev_content
			) {
				let newModer = Object.keys(
					f.ObjDiff(
						this.event.event.content.users,
						this.event.event.unsigned.prev_content.users
					)
				);
				let pocketUser =
					this.$store.state.users[`${f.getmatrixid(newModer[0])}`];
				let userLevel = this.event.event.content.users[`${newModer[0]}`];

				if (!_.isEmpty(pocketUser) && newModer[0]) {
					if (userLevel === 0 && pocketUser.name) {
						return "unmarked " + `${pocketUser.name}` + " as moderator";
					}
					if (userLevel === 50 && pocketUser.name) {
						return "marked " + `${pocketUser.name}` + " as moderator";
					}
				}
			}
		},

		markMatches: function () {
			return this.markText ? this.markText(
				(this.event.event.decrypted || this.event.event.content)?.body,
				true
			) : (this.event.event.decrypted || this.event.event.content)?.body;
		},
	},
};
</script>
<style scoped lang="sass" src="./index.sass"></style>
