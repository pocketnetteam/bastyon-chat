<template>
	<div id="chatJoin" class="maskedtop" :class="{ minimized, active }">
		<div class="work">
			<div class="caption">
				<span v-if="!streamMode && !creatorLeft">
					{{ $t("caption.chatInvite") }}
				</span>
				<span v-if="!streamMode && creatorLeft">{{ $t("caption.cantJoin") }}</span>
				<span v-if="streamMode && videoMeta?.isLive">You need join to write</span>
				<span v-if="streamMode && !videoMeta?.isLive">This stream is over</span>
			</div>
		</div>

		<div class="tip" v-if="!blockedCheck && !streamMode">
			<span v-if="!creatorLeft">{{ $t("caption.chatInviteDecline") }}</span>
			<span v-if="creatorLeft">{{ $t("caption.creatorLeft") }}</span>
		</div>

		<chatPreview
			:usersinfo="usersinfo"
			:chat="chat"
			:m_chat="m_chat"
			:undefinedRoom="creatorLeft"
			v-if="!streamMode"
		/>

		<div
			v-if="streamMode || !hiddenInParent"
			class="joinAction fixedOnPageBottom"
			:class="{ bin: pocketnet, bout: !pocketnet }"
		>
			<div class="work">
				<div class="actions" v-if="!blockedCheck">
					<div class="action" v-if="!streamMode && !creatorLeft && !tetatet">
						<button class="small button black rounded" @click="decline">
							{{ $t("button.decline") }}
						</button>
					</div>

					<div class="action" v-if="!streamMode && tetatet">
						<button class="small button black rounded" @click="ignore">
							{{ $t("button.declineandignore") }}
						</button>
					</div>

					<div class="action" v-if="!creatorLeft">
						<button
							:class="{
								'small': true,
								'button': true,
								'rounded': true,
								'disabled': !videoMeta?.isLive
							}"
							@click="join"
						>
							{{ $t("button.join") }}
						</button>
					</div>
					<div class="action" v-if="!streamMode && creatorLeft">
						<button class="small button rounded" @click="back">
							{{ $t("button.ok") }}
						</button>
					</div>
				</div>

				<div class="actions" v-else>
					<div class="blocked">
						<span>You have blocked this user</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
