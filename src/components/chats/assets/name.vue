<template>
	<div class="nameline">
		<div class="iconGroup" :class="{public : isPublic}" v-if="isShowGroupIcon">
			<i class="fas fa-user-friends" v-if="!isPublic"></i>
			<i class="fas fa-users" v-else></i>
		</div>
		<div class="miniappicon" v-if="miniappicon">
			<bgimage :src="miniappicon" />
		</div>
		<div class="nameofchat" >{{convertedName}}</div>
	</div>
</template>

<style scoped lang="sass">

.nameofchat
	white-space: nowrap
.nameline
	display: flex
	align-items: flex-end

.miniappicon
	margin-right: 0.5 * $r
	margin-block: 0.5 * $r

	.bgimage
		width : 12px
		height: 12px
		border-radius: 2px

.iconGroup
	font-size: 0.4em
	width: 16px
	min-width: 16px
	text-align: center
	height: 16px
	line-height: 16px
	border-radius: 8px
	background: srgb(--neutral-grad-2)
	margin-right: $r
	margin-block: 0.5 * $r

	&.public
		background: srgb(--color-good)

		i
			color: srgb(--text-on-bg-shadow-color)

	i
		color: srgb(--neutral-grad-1)



	
</style>

<script>
export default {
	name: "chatName",

	props: {
		chat: Object,
		preview: Boolean,
		m_chat: {},
	},
	inject: ["matches", "markText"],
	data: function () {
		return {
			//convertedName: ''
		};
	},
	computed: {
		users: function () {
			if (!this.chat) return [];

			return this.core.mtrx.anotherChatUsers(this.chat.roomId);
		},

		convertedName: function () {
			if (
				this.m_chat &&
				this.m_chat.getJoinRule() === "public" &&
				this.m_chat.currentState.getStateEvents("m.room.name").length > 0
			) {
				return this.m_chat.currentState
					.getStateEvents("m.room.name")[0]
					.getContent()?.name;
			}
			var users = _.filter(this.users, (user) => {
				return user.userId != this.core.user.userinfo.id;
			});

			var names = _.filter(
				_.map(users, (user) => {
					if (this.$store.state.users[user.userId])
						return this.$store.state.users[user.userId].name;
				}),
				function (name) {
					return name;
				}
			);

			if (!names.length) {
				if (this.core.mtrx.chatUsers(this.chat.roomId).length) {
					return "-";
				}

				return "-";
			}

			if (this.m_chat?.name.indexOf("@") == 0)
				return this.m_chat?.name.replace("@", "");

			return names.join(", ");
		},

		markMatches: function () {



			return this.markText ? this.markText(this.convertedName, true) : this.convertedName;
		},

		isPublic(){
			return this.isShowGroupIcon && this.m_chat.getJoinRule() === "public"
		},

		isShowGroupIcon() {

			return !this.chat.miniappchat && this.m_chat?.name.slice(0, 1) === "@";
		},

		miniappicon(){
			return this.chat.miniappchat ? this.chat.miniappchat.icon : null
		}

		
	},

	mounted: function () {},
};
</script>
