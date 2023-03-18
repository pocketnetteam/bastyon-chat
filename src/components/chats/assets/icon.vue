<template>
	<div class="chatIcon" :class="{ unknowngroupusers }">
		<div v-if="groupAvatar" class="chatGroupIcon">
			<userpic :image="groupAvatar"/>
		</div>
		<userspic
			v-else
			:slidesPerView="slidesPerView"
			:users="usersinfo"
			:status="status"
			:unseen="unseen"
			:key="allnotifications"
			:single="singleAvatar"
			:class="{ opacity: groupAvatar }"
		/>

		<div class="unknowngroupusersicon" v-if="unknowngroupusers">
			<i class="fas fa-question"></i>
		</div>
	</div>
</template>

<style scoped lang="sass">
.opacity
	opacity: 0
.chatIcon
	width: 100%
	position: relative

.unknowngroupusersicon
	position: absolute
	left: 0
	top: 0
	bottom: 0
	right: 0
	font-size: 0.7em
	display: flex
	justify-content: center
	align-items: center
	color: #fff
	text-shadow: 0px 0px 2px rgba(0, 11, 58, 0.714), 0 0 3px rgba(0, 8, 43, 0.519)

.unknowngroupusers
	/deep/
	.bgimage
		transform: scale(0.7)
.chatGroupIcon
	width: 100%
	height: 100%
.chatGroupIcon img
	width: 100%
	height: 100%
	border-radius: 50%
	object-fit: cover
	object-position: 50% 50%
	position: absolute
	top: 0
	z-index: 100
</style>

<script>
import f from "@/application/functions";

export default {
	name: "chatIcon",
	data: function () {
		return {
			single: [],
		};
	},
	props: {
		chat: {},
		m_chat: {},
		slidesPerView: Number,
		hideunseen: Boolean,
		dontuseslides: Boolean,
	},
	computed: {
		allnotifications: function () {
			return this.$store.state.allnotifications || "0";
		},

		unseen: function () {
			if (this.hideunseen) return 0;

			if (this.blockedCheck) return 0;

			if (this.m_chat._selfMembership === "invite") {
				if (
					f.date.addseconds(
						moment.utc(this.m_chat.summary.lastModified).toDate(),
						86400
					) > new Date()
				)
					return 1;
			}

			this.allnotifications;

			return this.m_chat.getUnreadNotificationCount();
		},
		users: function () {
			if (!this.chat) return [];

			var u = this.core.mtrx.anotherChatUsers(this.chat.roomId);

			if (this.dontuseslides) {
				u = _.first(u, 4);
			}

			return _.first(_.shuffle(u), 49);
		},
		singleAvatar: function () {
			if (!this.chat && !this.m_chat) return {};
			if (
				this.m_chat.getJoinRule() === "public" &&
				this.m_chat.currentState.getMembers().length === 1
			) {
				var member = this.m_chat.currentState.getMembers()[0];
				var data = this.$store.state.users[f.getmatrixid(member.userId)];
				if (data) {
					data.status = member.membership;
					data.image = data.source.i;
					return data;
				}
			}
			return {};
		},
		blockedCheck: function () {
			var users = this.core.mtrx.anotherChatUsers(this.m_chat.roomId);

			if (users.length == 1) {
				return this.core.mtrx.blockeduser(users[0].userId);
			}
		},
		usersinfo: function () {
			var u = this.core.mtrx.chatUsersInfo(
				this.chat.roomId,
				"anotherChatUsers"
			);

			if (this.dontuseslides) {
				u = _.first(u, 4);
			}

			return _.first(_.shuffle(u), 49);
		},

		status: function () {
			var us = {};

			_.each(this.users, (u) => {
				us[u.userId] = this.core.mtrx.blockeduser(u.userId)
					? "blocked"
					: u.membership;
			});

			return us;
		},

		unknowngroupusers: function () {
			return this.core.mtrx.kit.unknowngroupusers(this.m_chat);
		},

		groupAvatar: function () {
			const avatar =
				this.m_chat.currentState.getStateEvents("m.room.avatar")[0]?.event
					.content.avatarUrl;
			return avatar !== "" ? avatar : "";
		},
	},
};
</script>
