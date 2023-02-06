<template>
	<div class="eventsMessage">


		<div
			v-touch:touchhold="dropDownMenuShow"
			@contextmenu="dropDownContext"
			:class="{
				showmeta: showmeta,
				my,
				messageRow: 'messageRow',
				urlpreview: urlpreview,
				allscreen: urlpreview || content.msgtype === 'm.image' || file,
				aligncenter: content.msgtype === 'm.audio',
			}"
			:my="my"
			v-if="!preview && content.msgtype !== 'm.notice'"
		>
			<div
				class="timeWrapper"
				v-if="
					urlpreview ||
					imageUrl ||
					content.msgtype === 'm.image' ||
					(showmeta && my) ||
					file ||
					content.call_id
				"
			>
				<i
					:class="'fas fa-fire burn ' + showburn"
					v-if="showburn"
					@click="showwhenburn"
				></i>

				<span v-else>
					{{ format_date(origin._localTimestamp) || "Now" }}
				</span>
			</div>

			<div
				class="actionsWrapper"
				v-if="
					!content.call_id && event.event.type !== 'm.room.request_calls_access'
				"
			>
				<div
					v-if="multiSelect"
					class="multiSelect"
					@click="eventMessage(selectedMessage)"
				>
					<i v-if="selectedMessage" class="far fa-check-circle"></i>
					<i v-else class="far fa-circle"></i>
				</div>
					<i @click="setmenu" v-else class="fas fa-ellipsis-h setmenu"></i>
			</div>

			<div
				class="iconWrapper"
				v-if="!my || showmyicon"
				@click="core.mtrx.opencontact(userinfo)"
			>
				<userpic :userinfo="userinfo" />
			</div>

			<div class="messageImg" v-if="content.msgtype === 'm.image'">
				<div
					class="reference showreference"
					@click="showreference"
					v-if="reference && !preview && !fromreference"
				>
					<eventsEvent
						:event="reference"
						:chat="chat"
						:preview="true"
					/>

					<div class="referenceCaption">
						<span><i class="fas fa-share"></i></span>
					</div>
				</div>

				<div class="" v-if="imageUrl">
					<div class="encryptedDataIcon" v-if="encryptedData">
						<i class="fas fa-lock"></i>
					</div>
					<div class="imgMsg">
						<div
							class="showImage"
							:style="imagePaddingStyle(content)"
							@click="openImageGallery(origin)"
						>
							<div class="abswrapper">
								<img
									:src="imageUrl"
									alt=""
									v-images-loaded:on.loaded="imagesLoaded"
								/>
							</div>
						</div>
					</div>
				</div>

				<div class="preloaderImage" :style="imagePaddingStyle(content)" v-else>
					<div class="abswrapper"><linepreloader /></div>
				</div>
			</div>
			<div class="messageAudio" v-if="content.msgtype === 'm.audio'">
				<div
					class="reference showreference"
					@click="showreference"
					v-if="reference && !preview && !fromreference"
				>
					<eventsEvent
						:event="reference"
						:chat="chat"
						:preview="true"
					/>

					<div class="referenceCaption">
						<span><i class="fas fa-share"></i></span>
					</div>
				</div>

				<VoiceMessage
					v-if="audioUrl"
					:audioBuffer="audioUrl"
					:decryptedInfo="decryptedInfo"
					:id="event._localTimestamp || Date.now()"
				/>
			</div>

			<div class="messageCall" v-if="content.call_id">
				<Call :class="{ my: my }" :my="my" :event="event" />
			</div>
			<Request
				:event="event"
				v-if="event.event.type === 'm.room.request_calls_access'"
			/>

			<div
				class="maxcontent"
				:class="{ my: my }"
				v-if="
					content.msgtype === 'm.encrypted' && !textWithoutLinks && badenctypted
				"
			>
				<div class="badenctyptedText">
					<span>{{ $t("caption.unabletoDecrypt") }}</span>
					<i class="fas fa-undo decryptagain" @click="decryptagain"></i>
				</div>
			</div>

			<div
				class="maxcontent"
				:class="{ my: my }"
				v-if="
					(content.msgtype === 'm.text' || content.msgtype === 'm.encrypted') &&
					textWithoutLinks
				"
			>
				<div class="messageText">
					<div class="edited" v-if="edited">
						<i class="fas fa-pen"></i> {{ $t("caption.edited") }}
					</div>
					<IncomingMessage
						:message="textWithoutLinks"
						:marked-text="markedText"
					></IncomingMessage>
					<div
						class="sendername"
						v-if="(!content.from && !my && showmeta) || (showmyicon && !my)"
					>
						<span class="b"
							>{{ userinfo.name }}</span
						>
						&middot;
						<span>
							{{ format_date(origin._localTimestamp) || "Now" }}
						</span>
					</div>
					<div
						class="reference showreference"
						@click="showreference"
						v-if="reference && !preview && !fromreference"
					>
						<eventsEvent
							:event="reference"
							:chat="chat"
							:preview="true"
						/>

						<div class="referenceCaption">
							<span><i class="fas fa-share"></i></span>
						</div>
					</div>

					<div class="from" v-if="content.from">
						<div class="fromCaption">
							<i class="fas fa-share-alt"></i>
							<span>{{ userinfo.name }}: {{ $t("caption.messagefrom").toLowerCase() }}</span>
						</div>
					</div>
				</div>
			</div>

			<div class="filePreview" v-if="file">
				<fileMessage
					:encryptedData="encryptedData"
					:file="file"
					:downloaded="downloaded"
					@download="download"
				/>
				<div class="encryptedDataIcon" v-if="encryptedData">
					<i class="fas fa-lock"></i>
				</div>

				<div class="badencrypted" v-if="error">
					<span>{{ $t("caption.unabletoDecrypt") }}</span>
				</div>
			</div>

			<div class="linkPreview" v-if="urlpreview">
				<template v-if="!sending">
					<url
						:url="urlpreview"
						:urllink="urlpreview"
						:preview="true"
						@updatedSize="updatedSize"
						@error="urlerror"
						v-if="!origin.localRedactionEvent() && !origin.getRedactionEvent()"
					/>
				</template>
				<div v-else>
					<linepreloader />
				</div>
			</div>

			<div
				class="fromimagesfiles"
				v-if="
					(content.from || imageFrom) &&
					(file ||
						(content.msgtype === 'm.image' && imageUrl) ||
						(content.msgtype === 'm.audio' && audioUrl))
				"
			>
				<div class="fromCaption">
					<i class="fas fa-share-alt"></i>
					<span>{{ userinfo.name }}: {{ $t("caption.messagefrom").toLowerCase() }} </span>
				</div>
			</div>
		</div>
		<!--sdfsf-->
		<div class="messagePreview" v-if="preview">
			<listPreview
				:my="my"
				:event="origin"
				:decryptEvent="decryptEvent"
				:userinfo="userinfo"
				:chat="chat"
				:readed="readed"
			/>
		</div>


		<div
			class="statusWrapper"
			v-if="my && readed && !preview && !fromreference"
		>
			<div class="my">
				<i class="fas fa-check-double"></i>
				<span>{{ $t("caption.messageRead") }}</span>
			</div>
		</div>

	</div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
