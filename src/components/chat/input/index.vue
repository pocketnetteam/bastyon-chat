<template>
	<div id="chatInput" class="noswipepnt">
		<div class="work" v-if="ready">
			<div class="inputWrapper" v-if="chat">
				<div class="tipusers" v-if="tipusers.length">
					<div
						@click="insertuser(user)"
						class="previewWrapperExt"
						:class="{ selected: tipuserindex == i }"
						:key="user.id"
						v-for="(user, i) in tipusers"
					>
						<preview :contact="user" mode="" />
					</div>
				</div>

        <div
          class="left"
          :class="{ 'donation': streamMode }"
          v-if="streamMode"
        >
          <button class="iconbutton donate">
            <i class="icon donate">Donate</i>
          </button>
        </div>

				<div class="center">
					<record-progress
						v-if="voiceEnable && (isRecording || record)"
						:recordTime="recordTime"
						:isRecording="isRecording"
						:rmsData="recordRmsData"
						:opacity="cancelOpacity"
						@onClear="clear"
					/>
					<InputField
						v-else
						ref="newinput"
						@chatMessage="sendinput"
						@emptyInput="emitInputData"
						@FilledInput="HideUploadPic"
						@base64="pasteImage"
						@focused="focused"
						@tipsearchrequest="tipBySearch"
						@browsetip="browsetip"
						@selectcurrenttip="selectcurrenttip"
						:storagekey="'chatinput' + chat.roomId"
						:tipusers="tipusers"
					/>
					<div
						class="left"
						:class="{ extended: voiceEnable }"
						v-if="!streamMode && upload && chat"
					>
						<div v-if="!isRecording && !record" class="iconbutton" @click="showinputmenu">
							<i class="icon fas fa-plus"></i>
						</div>

						<template v-if="voiceEnable">
							<div v-show="isRecording || !record" class="iconbutton">
								<recordVoice
									@onRecordingStart="initRecording"
									@onRecordingStop="stopRecording"
									:prepareRecording="prepareRecording ? true : false"
									:isRecording="isRecording"
									:disabled="microphoneDisabled"
									@onClear="clear"
									@canceling="setOpacity"
								/>
							</div>

						</template>

						<div
							v-if="!isRecording && record"
							class="iconbutton"
							@click="
								(e) => {
									sendVoiceMessage();
								}
							"
						>
							<div>
								<i class="icon fas fa-paper-plane"></i>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="notready" v-else>
			<linepreloader />
		</div>
	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
