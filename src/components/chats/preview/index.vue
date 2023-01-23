<template>
	<div class="chatsPreview" :class="{ minimized, active }">
		<div class="work">
			<div class="previewWrapper">
				<div class="iconWrapper">
					<chatIcon
						:m_chat="m_chat"
						v-if="!dummy"
						:chat="chat"
						:key="key"
						:dontuseslides="true"
					/>
					<div v-else class="dummyicon loadinggradient"></div>
				</div>

				<div class="infoWrapper">
					<div class="summaryLine" v-if="!dummy && ready">
						<div class="caption flexBlock">
							<chatName :preview="true" :chat="chat" :m_chat="m_chat" />
							<div class="roomMuted" v-if="roomMuted">
								<i class="fas fa-bell-slash"></i>
							</div>
						</div>

						<div class="time">
							<chatTime :chat="chat" :m_chat="m_chat" />
						</div>
					</div>

					<div class="eventsLine maxwidth" v-if="!dummy && ready">
						<eventsEvent
							:event="matrixevent"
							:chat="m_chat"
							:preview="true"
							v-if="event"
						/>
					</div>

					<div class="eventsLine" v-if="dummy">
						<div class="dummyline loadinggradient"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
