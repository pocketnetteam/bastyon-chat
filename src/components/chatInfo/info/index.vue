<template>
	<div class="aboutRoom">
		<div class="roomInfoWrapper noSwipe">
			<div :class="{ chatIconWrapper: 'chatIconWrapper' }">
				<chatIcon
					:slidesPerView="4"
					:dontuseslides="minimized && !active"
					:chat="chat"
					:m_chat="m_chat"
					:hideunseen="true"
				/>
			
			</div>

			<chatName
				:preview="true"
				:chat="chat"
				:m_chat="m_chat"
				class="roomNameLine"
			/>

			<div class="roomInfo" v-if="topicTxt">
				<span class="topicTxt">{{ topicTxt }}</span>
			</div>
		</div>

		<!--    {{ isRole }}-->

		<div class="roomAccordionsList">
			<div
				class="accordion"
				:key="index"
				v-for="(item, index) in accordionList"
				:class="{ active: isActive === index }"
			>
				<div class="aHeader" @click="toggleItem(index)">
					<div class="head">
						<div class="leftBlock">
							<i class="fas fa-users" v-if="item.id === 'members'"></i>
							<i class="far fa-image" v-if="item.id === 'media'"></i>
							<i class="fas fa-folder" v-if="item.id === 'files'"></i>
							{{ item.title }}
						</div>
						<div class="rightBlock" v-if="item.id === 'members'">
							<div class="membersCount" v-if="membersList">
								<span>{{ membersList.length }}</span>
							</div>
						</div>
					</div>
				</div>
				<div class="body">
					<members
						v-if="isActive === index && item.id === 'members'"
						:membersList="membersList"
						@admin="makeAdmin"
						@kick="kickUser"
						@ban="banUser"
					/>

					<images
						v-if="isActive === index && item.id === 'media'"
						:chat="m_chat"
					/>

					<files
						:chat="m_chat"
						v-if="isActive === index && item.id === 'files'"
						:fileEvents="fileEvents"
					/>
				</div>
			</div>

			<div class="publicRoomElements" v-if="public">
				<div class="linkwrapper">
					<div class="linkPlace">
						<i class="fas fa-link" @click="copyShareLink()"></i>
						<span @click="copyShareLink()">{{ shareRoomLink }}</span>
					</div>

					<div class="sharelink">
						<button class="button small rounded ghost" @click="sharelink">
							Share <i class="fas fa-share-alt"></i>
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="roomActionsList">
			<button
				class="button small rounded"
				@click="modalInviteUser"
				v-if="canInvite"
			>
				{{ $t("caption.add") }} <i class="fas fa-user-plus"></i>
			</button>

			<button class="button small black rounded" @click="muteRoom">
				<span v-if="!roomMuted">
					{{ $t("caption.mute") }} <i class="fas fa-bell-slash"></i>
				</span>
				<span v-if="roomMuted">
					{{ $t("caption.unmute") }} <i class="fas fa-bell"></i>
				</span>
			</button>

			<button
				v-if="tetatet"
				class="button small black rounded"
				@click="muteCalls"
			>
				<span v-if="!roomCallsDisabled">
					{{ $t("caption.disableCalls") }} <i class="fas fa-video-slash"></i>
				</span>
				<span v-if="roomCallsDisabled">
					{{ $t("caption.enableCalls") }} <i class="fas fa-video"></i>
				</span>
			</button>

			<button
				class="button small rounded badbutton"
				@click="forgetRoom()"
				v-if="!tetatet"
			>
				{{ $t("caption.leave") }} <i class="fas fa-sign-out-alt"></i>
			</button>

			<button
				class="button small rounded badbutton"
				@click="blockUser()"
				v-if="tetatet && !blockedCheck"
			>
				{{ $t("button.block") }} <i class="fas fa-sign-out-alt"></i>
			</button>

			<button
				class="button small rounded"
				@click="unblock()"
				v-if="tetatet && blockedCheck"
			>
				{{ $t("button.unblock") }} <i class="fas fa-sign-out-alt"></i>
			</button>

			<button
				class="button small rounded badbutton"
				@click="complain()"
				v-if="curation /* && (blockedCheck || !tetatet)*/"
			>
				{{ $t("button.Complain") }} <i class="fas fa-exclamation-triangle"></i>
			</button>
		</div>
		<transition name="fademodal">
			<modal @close="closeModal" v-if="inviteUserOpened">
				<template v-slot:header>
					<span>{{ $t("caption.inviteUser") }}</span>
				</template>
				<template v-slot:body>
					<invite :chatRoomId="chat.roomId" @completed="closeContactModal" />
				</template>
				<template v-slot:footer></template>
			</modal>
		</transition>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
