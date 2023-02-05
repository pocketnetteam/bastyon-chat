<template>
	<div id="chatTopheader">

		<topheader v-if="chat || u">
			<template v-slot:left>
				<backButton action="chats" />
			</template>

			<template v-slot:leftadd>
				<div class="iconbuttonsmall" @click="tosearch">
					<i class="fas fa-search"></i>
				</div>
				<!--<search chat="true" :minimize="!matches.value" />-->
			</template>

			<template v-slot:info>
				<router-link v-if="chat" :to="'chatInfo?id=' + chat.roomId">
					<div v-if="m_chat">
						<div class="nameWrapper">
							<chatName
								:preview="true"
								:chat="chat"
								:m_chat="m_chat"
								v-if="!roomInfo"
							/>
							<div class="roomMuted" v-if="roomMuted">
								<i class="fas fa-bell-slash"></i>
							</div>
						</div>
						<transition name="fade">
							<chatTyping v-if="m_chat_typing" />
						</transition>
					</div>

					<div v-if="!m_chat && userinfo">
						<span class="nameline">{{ userinfo.name }}</span>
					</div>
				</router-link>
			</template>

			<template v-slot:rightadd v-if="callsEnabled">
				<div
					v-if="isCallsActive && !isGroup"
					class="call btn iconbutton"
					:class="
						checkCallsEnabled === 'wait' || wait
							? 'wait'
							: checkCallsEnabled
							? ''
							: 'disabled'
					"
					:title="
						checkCallsEnabled === 'wait' || wait
							? $t('caption.wait')
							: checkCallsEnabled
							? ''
							: $t('caption.disabled')
					"
					@click="bcCall"
				>
					<i class="fas fa-video"></i>
				</div>
			</template>

			<template v-slot:right>
				<router-link v-if="chat" :to="'chatInfo?id=' + chat.roomId">
					<div class="iconbutton"><i class="fas fa-ellipsis-h"></i></div>
				</router-link>
			</template>
		</topheader>

		<topheader v-if="chat && searchactive" classstyle="noiconsButWithL">
			<template v-slot:left>
				<backButton @back="backfromsearch"/>
			</template>

			<template v-slot:info>
				<simpleSearch :value="search" :controlKeys="true" @search="searching" ref="search" @controlKey="searchControlKey">
					<template v-slot:default v-if="searchresults && searchresults.length">

						<div class="matches">
							<span class="current-match"
								>{{ searchresults.length - (focusedeventIndex) }}/{{ searchresults.length }}</span
							>
							<i class="prev-match fas fa-chevron-up" @click="tobottomsearch"></i>
							<i class="next-match fas fa-chevron-down" @click="toupsearch"></i>
						</div>

						<div class="iconWrapper" v-if="search" @click="() => {searching('')}">
							<i class="fas fa-times"></i>
						</div>

					</template>
				</simpleSearch>
			</template>
			
		</topheader>

	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
