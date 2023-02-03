<template>
	<div id="chatSettings" :class="{ minimized, active }">
		<div class="chatSettingAbout">
			<div :class="{ chatIconWrapper: 'chatIconWrapper', noSwipe: true }">

				<upload
					@uploaded="(data) => uploadUploaded(data)"
					@error="(error) => uploadError(error)"
					:onlyimage="true"
					:multiple="false"
					:extensions="upl.extensions"
					:images="upl.images"
				>
					<template v-slot:content>
						<label class="chatIconEditImage" for="roomImage">
							<i class="fas fa-camera"></i>
						</label>
						
						<chatIcon
							:slidesPerView="4"
							:dontuseslides="minimized && !active"
							:chat="chat"
							:m_chat="m_chat"
							:hideunseen="true"
						/>
						<img
							v-if="userImagebase64"
							:src="userImagebase64"
							class="userImagebase64"
							alt=""
						/>
					</template>

					<template v-slot:dropzone></template>
				</upload>

				
			</div>
			<div class="chatNameEdit">
				<input type="text" v-model="m_chat.name" placeholder="Name" />
			</div>
			<div class="chatDescription" v-if="topic">
				<textarea
					type="text"
					v-model="topicTxt"
					placeholder="Description"
					maxlength="1000"
				></textarea>
			</div>
			<button class="button small rounded inSettings" @click="saveEdited()">
				{{ $t("button.save") }}
			</button>
		</div>
	</div>
	<!--    <div class="linkPlace">-->
	<!--          <span class="shareLink">-->
	<!--            <i class="fas fa-link"></i> {{ shareRoomLink }}-->
	<!--          </span>-->
	<!--    </div>-->
</template>
<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<style scoped lang="scss">
.chatGroupIcon img {
	width: 50% !important;
}
.chatIconWrapper {
	position: relative;
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
		position: absolute;
		top: 0;
		left: 0;
	}
}
.chatIconEditImage {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 200;
	opacity: 0.9;
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: center;
	i {
		transform: scale(2);
		color: srgb(--color-bg-ac)
	}
}
.chatIconFile {
	display: none;
}
.userImagebase64 {
	z-index: 150;
}
</style>
