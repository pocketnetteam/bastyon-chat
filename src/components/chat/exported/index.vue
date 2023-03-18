<template>
	<Stream :style.sync="style" :chat.sync="chat" />
</template>

<script>
import { mapState } from "vuex";
import Stream from "./stream.vue";
import f from "@/application/functions";

export default {
	name: "chatExported",

	components : {
		Stream
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
			}
		}
	},

	data : function(){
		return {
			style: null,
			videoUrl: null,
			videoMeta: {},
			authorId: null,
			chat: null,
			powerLevels: {
				administrator: 100,
				moderator: 50,
				participant: 0
			},
			menuState: false
		}
	},

	mounted () {
		/*Get video meta (&stream state)*/
		window.POCKETNETINSTANCE?.platform?.sdk?.videos?.info(this.videoUrl)
			.then(() => window.parseVideo(this.videoUrl))
			.then(meta => {
					if (meta?.type === "peertube") {
						this.videoMeta = Object.assign(this.videoMeta, window.peertubeglobalcache[meta.id]);
						console.log('META', this.videoMeta, this);
					}
			});
	},

	computed: {
		...mapState({
			auth: (state) => state.auth
		}),

		streamMode: function () {
			return this.style === "stream";
		},

		m_chat: function () {
			return this.core.mtrx.client.getRoom(this.chat.roomId);
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
		}
	}
};
</script>
