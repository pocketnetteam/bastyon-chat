<template>
	<Stream :style.sync="style" :chat.sync="chat" />
</template>

<script>
import { mapState } from "vuex";
import f from "@/application/functions";

export default {
	name: "chatExported",

	components: {
		Stream: () => import('./stream.vue')
	},

	provide() {
		return {
			streamMode: this.streamMode,
			videoMeta: this.videoMeta,
			authorId: this.authorId,

			powerLevel: Object.assign(this.powerLevels, {
				get: this.getPowerLevel
			}),

			adminActions: {
				toggleModerStatus: this.toggleModerStatus,
				toggleBanStatus: this.toggleBanStatus
			},

			menuState: {
				get: () => this.menuState,
				set: (val) => this.$set(this, "menuState", val)
			},

			matches: {},
			markText: () => {},
			
			userBanned: this.userBanned
		}
	},

	data : function(){
		return {
			style: null,
			videoUrl: null,
			videoMeta: null,
			authorId: null,
			chat: null,
			powerLevels: {
				administrator: 100,
				moderator: 50,
				participant: 0
			},
			menuState: false,
			userBanned: {
				value: null,
				get: () => this.userBanned?.value,
				set: (val) => {
					this.$set(this.userBanned, "value", val);
				}
			}
		}
	},

	created () {
		if (!this.videoMeta.isLive) {
			this.leaveRoom();
		}

		this.userBanned.set((() => {
			const id = this.m_chat.myUserId;
			return this.chat.currentState?.members[id]?.membership === "ban";
		})());
	},

	computed: {
		...mapState({
			auth: (state) => state.auth
		}),

		streamMode() {
			return this.style === "stream";
		},

		m_chat() {
			return this.core.mtrx.client.getRoom(this.chat.roomId) || {};
		}
	},

	methods: {
		getMember(user) {
			return this.m_chat.getMember(
				user.userId.includes("@") ? user.userId : f.getMatrixIdFull(user.userId, this.core.domain)
			);
		},

		getPowerLevel(user) {
			if (user.powerLevel > -1) {
				for (let i in this.powerLevels) {
					if (user.powerLevel >= this.powerLevels[i]) {
						return i;
					}
				}
			}
		},

		toggleModerStatus(user) {
			if (!user.events) user = this.getMember(user);

			const event = this.m_chat.currentState.getStateEvents(
				"m.room.power_levels"
			);

			this.core.mtrx.client
				.setPowerLevel(
					this.chat.roomId,
					user.userId,
					user.powerLevel === 50 ? 0 : 50,
					event[0]
				);

			return Promise.resolve();
		},

		toggleBanStatus(user) {
			if (!user.events) user = this.getMember(user);

			if (user.membership === "ban") {
				this.core.mtrx.client
					.unban(
						this.m_chat.roomId,
						user.userId
					)
					.then(() => {
						this.core.mtrx.client
							.invite(
								this.m_chat.roomId,
								user.userId
							);
					});
			} else {
				this.core.mtrx.client
					.ban(
						this.m_chat.roomId,
						user.userId,
						"admin ban"
					);
			}

			return Promise.resolve();
		},

		leaveRoom() {
			this.core.mtrx.client.leave(this.chat.roomId).then((r) => {
				/* this.core.mtrx.client
					.forget(this.chat.roomId, true)
					.then((r) => {
						this.$store.commit("DELETE_ROOM", this.chat.roomId);
					}); */
			});
		}
	}
};
</script>
