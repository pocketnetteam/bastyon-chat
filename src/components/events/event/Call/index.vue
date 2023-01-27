<template>
	<div
		class="call"
		:class="{
			ended : this.getDescription() === 'ended',
			bad: this.getDescription() === 'reject',
		}"
	>
		<div
			class="call-icon"
			:class="this.getDescription() === 'ended' ? 'ended' : ''"
		>
			<i
				:class="
					this.getDescription() === 'reject'
						? 'fas fa-phone-slash'
						: 'fas fa-phone'
				"
			></i>
		</div>
		<div class="call-info">
			<div class="call-info_title">{{ $t(this.getDescription()) }}</div>
			<!--      <div class="call-info_duration">1 min</div>-->
		</div>
	</div>
</template>

<script>
export default {
	name: "Call",
	props: {
		my: Boolean,
		event: Object,
	},
	methods: {
		getDescription: function () {
			let status;

			if (this.event.event.type === "m.call.invite") {
				status = this.my ? "outgoingCall" : "incomingCall";
			}

			if (this.event.event.type === "m.call.hangup") {
				status = "ended";
			}

			if (this.event.event.type === "m.call.reject") {
				status = "reject";
			}

			return status;
		},
	},
};
</script>

<style lang="scss" scoped>
.call {
	display: flex;
	align-items: center;
	width: 200px;
	height: 6 * $r;
	padding: 0.5 * $r;
	border-radius: 2 * $r;
	background-color: srgba(--neutral-grad-1, 0.8);

	&.bad {
		.call {
			&-icon {
				color: srgb(--color-bad);
			}
		}
	}
	&.my {
		background-color: srgb(--color-bg-ac-bright);
		color: srgb(--text-on-bg-ac-color);
		
		&.bad {
			background-color: srgb(--color-bad);
		}

		&.ended{
			background-color: srgba(--neutral-grad-1, 0.8);
			color : srgb(--text-color);

			.call {
				&-icon {
					color: srgb(--color-bg-ac-bright);
				}
			}
		}

		.call {
			&-icon {
				background: rgba(255,255, 255, 0.2);
				color: srgb(--text-on-bg-ac-color);
			}
		}
	}
	&-icon {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 5 * $r;
		height: 5 * $r;
		background: rgba(0, 0, 0, 0.06);
		border-radius: 1.66 * $r;
		color: srgb(--color-bg-ac-bright);

		&.ended {
			i {
				transform: rotate(-135deg);
			}
		}
		i {
			transform: rotate(90deg);
		}
	}
	&-info {
		margin-left: $r;
		flex-grow: 2;
		text-align: left;
		font-weight: 600;
		font-size: 0.8em;
		display: flex;
		flex-direction: column;
		&_title {
		}
		&_duration {
		}
	}
}
</style>
