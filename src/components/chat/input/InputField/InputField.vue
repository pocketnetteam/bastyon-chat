<template>
	<div class="input_component">
		<div class="input-wrapper">
			<div class="textarea">
				<textarea
					id="textInput"
					:value="text"
					ref="textarea"
					class="chat-input"
					type="text"
					row="1"
					spellcheck="true"
					autocorrect="on"
					@focus="focused"
					@blur="blured"
					@keydown="keydown"
					@input="textchange"
					@keyup="keyup"
					@click="keyup"
					@paste="paste_image"
					:placeholder="$t('caption.sendmessage')"
				></textarea>
				<transition name="fade" mode="out-in" v-if="!streamMode && !mobile && emojiIndex">
					<picker
						:data="emojiIndex"
						v-show="display_emoji"
						@select="insert_emoji"
						:style="{
							width: 'auto',
							position: 'absolute',
							bottom: '48px',
							right: '0px',
							left : '0px',
							fontSize: '0.8em',
							fontFamily: 'Segoe UI',
						}"
						:exclude="exclude"
						:showPreview="false"
						:showSearch="false"
						v-click-outside="close_emoji_picker"
					/>
				</transition>
			</div>
		</div>

		<div
			class="iconbutton emojipicker"
			@click="toggle_emoji_picker()"
			v-if="!streamMode && !mobile"
		>
			<div class="leftdummy">
				<div class="idummy">
					<i v-if="display_emoji" class="fas fa-times"></i>
					<i v-else class="far fa-smile"></i>
				</div>
			</div>
		</div>

		<div class="iconbutton" v-if="send" @click="send_text($event)">
			<div class="rightdummy">
				<div class="idummy">
					<i class="far fa-paper-plane"></i>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Images from "@/application/utils/images.js";
import f from "@/application/functions";
import { Picker, EmojiIndex } from "emoji-mart-vue-fast";

import vClickOutside from "v-click-outside";

import picturePreview from "@/components/chat/input/picturePreview/picturePreview";

let images = new Images();

export default {
	name: "InputField",
	components: {
		Picker,
		picturePreview,
	},

	directives: {
		clickOutside: vClickOutside.directive,
	},

	inject: ['streamMode'],

	watch: {
		text: {
			immediately: true,
			handler: function (current, prev) {
				if (current) {
					this.send = true;
					this.$emit("FilledInput");
				} else {
					this.send = false;
					this.$emit("emptyInput");
				}

				this.textarea_resize();
			},
		},
	},

	data() {
		return {
			send: false,

			ready: false,
			text: "",
			exclude: ["flags"],
			display_emoji: false,
			content_height: 26,
			pasted_data: [],
			block: false,

			upload: {
				multiple: true,
				extensions: ["image/jpg", "image/jpeg", "image/png"],
				images: {
					resize: {
						type: "fit",
					},
				},
			},
			hidden_previews: null,
			emojiIndex: null,
		};
	},

	computed: {
		mobile: function () {
			return !this.$store.state.pocketnet && this.$store.state.mobile;
		},

		/*emojiIndex: function () {



			return window.emojiIndex

		}*/
	},

	methods: {
		prepareemoji: function () {
			if (!this.mobile) {
				if (window.emojiIndex) this.emojiIndex = window.emojiIndex;
				else {
					var emojidata = require("emoji-mart-vue-fast/data/all.json");
					window.emojiIndex = new EmojiIndex(emojidata);
					this.emojiIndex = window.emojiIndex;
				}
			}
		},

		setText: function (text) {
			this.text = text;

			this.savetextinstorage();

			setTimeout(() => {
				this.textarea_resize();
				this.focus();
			});
		},

		focused: function () {
			this.$emit("focused");
		},

		textchange: function (e) {
			this.text = e.target.value || "";
		},

		savetextinstorage: function () {
			if (this.storagekey) {
				localStorage[this.storagekey] = this.text || "";
			}
		},
		send_empty_array() {
			this.$emit("userSearched", []);
		},

		focus() {
			this.$refs["textarea"].focus();
		},

		blur() {
			this.$refs["textarea"].blur();
		},

		blurifempty() {
			if (!this.text) this.blur();
		},

		close_emoji_picker(event) {
			if (event.target.localName !== "i") {
				if (event.target.localName !== "matrix-element") {
					this.display_emoji = false;
					return false
				}
			}
		},

		textarea_resize() {
			if (!this.text) {
				this.textarea_resize_reset();
			} else {
				this.$refs.textarea.style.height = 1 + "px";
				this.$refs.textarea.style.height =
					this.$refs.textarea.scrollHeight + "px";
				//this.display_emoji = false;
			}
		},

		textarea_resize_reset() {
			this.$refs.textarea.style.height = this.content_height + "px";
		},
		toggle_emoji_picker() {
			this.display_emoji = !this.display_emoji;
		},

		send_text(event) {
			if (this.text && this.text !== "\n") {
				this.display_emoji = false;
				this.$emit("chatMessage", this.text);
				this.$emit("emptyInput");
				this.send = false;
				this.text = "";
			}

			this.savetextinstorage();
		},

		insert_emoji(emoji) {
			this.text += emoji.native;

			this.savetextinstorage();
		},
		paste_image(event) {
			if (!this.streamMode) this.get_base64(event);
		},
		get_base64(event) {
			this.pasted_data = event.clipboardData.items;

			if (this.pasted_data.length) {
				for (let index in this.pasted_data) {
					let item = this.pasted_data[index];

					let correct_image_type = this.upload.extensions.includes(item.type);

					if (correct_image_type) {
						var blob = item.getAsFile();
						var reader = new FileReader();

						reader.onload = (event) => {
							this.$dialog
								.confirm("Do you really want to send attachment?", {
									okText: "Yes",
									cancelText: "No, cancel",
								})

								.then((dialog) => {
									var base64 = event.target.result;
									this.resize_image(base64, item.type);
								});
						};
						reader.readAsDataURL(blob);
					}
				}
			}
		},
		resize_image(data, type) {
			return images
				.autorotation(null, data)
				.then((base64) => {
					let _type = this.upload.images.resize.type || "def";

					return images.resize[_type](base64, 1024, 1024, type, 0.9)
						.then((base64) => {
							this.$emit("base64", base64);
						})
						.catch((error) => console.error("Failed to resize image", error));
				})
				.catch((error) => console.error("Failed to resize image", error));
		},

		getsearchposition(position) {
			if (!position.start || !this.text.length) return null;

			var sposition = { start: position.start, middle: 0, end: position.end };

			var i = position.start;
			var dg = false;
			var br = false;

			var reg = /[a-zA-Z0-9]{1}/;

			sposition.middle = i;

			do {
				var char = this.text[i];

				if (char == "@") {
					if (position.start == i || (i > 0 && reg.test(this.text[i - 1]))) {
						br = true;
					} else {
						dg = true;
					}
				} else {
					if (reg.test(char)) {
						sposition.start = i;
					} else br = true;
				}

				i--;
			} while (i >= 0 && i <= position.start && !dg && !br);

			if (!dg) {
				sposition = null;
			} else {
				br = false;
				i = position.end;

				do {
					if (!this.text[i] || reg.test(this.text[i])) {
						sposition.end = i;
					} else {
						br = true;
					}

					i++;
				} while (i <= this.text.length && !br);
			}

			return sposition;
		},

		getsearch(position) {
			var sposition = this.getsearchposition(position);

			if (!sposition) return null;

			return this.text.substring(sposition.start, sposition.middle);
		},

		keydown(event) {
			if (event.keyCode === 40 || event.keyCode === 38) {
				if (this.tipusers && this.tipusers.length) {
					this.$emit("browsetip", event.keyCode === 40 ? true : false);

					event.preventDefault();

					return false;
				}
			}

			if (event.keyCode === 39 || event.keyCode === 13) {
				if (this.tipusers && this.tipusers.length) {
					this.$emit("selectcurrenttip");

					event.preventDefault();

					return false;
				}
			}

			if (event.keyCode === 13) {
				if (this.mobile) {
					this.text = this.text + "\n";
				} else {
					this.send_text(event);
				}

				event.preventDefault();

				return false;
			}
		},

		keyup(event) {
			if (this.block) {
				event.preventDefault();

				return false;
			}

			var position = f.getCaretPosition(this.$refs["textarea"]);

			var value = this.getsearch(position);

			this.$emit("tipsearchrequest", value);

			this.savetextinstorage();
		},

		blured() {
			setTimeout(() => {
				this.$emit("tipsearchrequest", null);
			}, 300);
		},

		inserttip(text) {
			this.$emit("tipsearchrequest", null);

			this.block = true;
			this.$refs["textarea"];

			var position = this.getsearchposition(
				f.getCaretPosition(this.$refs["textarea"])
			);

			this.text =
				this.text.substring(0, position.start) +
				text +
				this.text.substring(position.end + 1);

			if (!this.text[position.end + 1]) {
				this.text = this.text + " ";
			}

			if (!this.text[position.end + 1] == " ") position.end++;

			f.setCaretPosition(
				this.$refs["textarea"],
				position.end + 1,
				position.end + 1
			);

			setTimeout(() => {
				this.block = false;
			}, 350);
		},
	},

	props: {
		storagekey: String,
		tipusers: Array,
	},

	creared() {},

	mounted() {
		if (!this.mobile) {
			this.focus();
		}

		this.prepareemoji();

		this.$refs.textarea.style.height = "26px";

		if (this.storagekey && localStorage[this.storagekey]) {
			this.text = localStorage[this.storagekey];
		}
	},
};
</script>

<style scoped lang="sass">
.input_component
	width: 100%
	display: flex
	justify-content: center
	align-items: center
	padding: 0 2 * $r
	padding-right: 0

	/deep/ .emoji-mart .emoji-mart-emoji
		width: 12.5%
		height: 40px
		cursor: pointer

		span
			cursor: pointer

		&:hover
			background: none
			box-shadow: none

			&:before
				display: none

	.input-wrapper
		display: flex
		flex-direction: column
		justify-content: center
		align-items: flex-start
		width: 100%

	.right
		margin: 0 $r

	.iconbutton

		.leftdummy
			width: 20px

		.rightdummy
			width: 35px

		.idummy
			width: 100%
			height: 35px
			line-height: 35px

			i
				line-height: 35px !important

	.previews
		width: 100%
		max-width: 198px
		height: 30px
		display: flex
		align-items: flex-start
		padding: 2px 0
		overflow: hidden

		&:first-child
			margin-left: 0


	.textarea
		width: 100%
		display: flex
		justify-content: flex-start
		align-items: center

.chat-input
	background: transparent
	border: 0
	width: 100%
	max-height: 100px
	// min-height: 26px
	overflow-y: auto
	resize: none

	&::-webkit-scrollbar
		width: 0 !important

.fade-enter-active, .fade-leave-active
	transition: all .2s ease-in

.fade-enter, .fade-leave-to
	opacity: 0
</style>


<style>
.emoji-mart,
.emoji-mart * {
	box-sizing: border-box;
	line-height: 1.15;
}

.emoji-mart {
	font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
	font-size: 16px;
	/* display: inline-block; */
	display: flex;
	flex-direction: column;
	height: 420px;
	color: #222427;
	border: 1px solid #d9d9d9;
	border-radius: 5px;
	background: #fff;
}

.emoji-mart-emoji {
	padding: 6px;
	position: relative;
	display: inline-block;
	font-size: 0;
	border: none;
	background: none;
	box-shadow: none;
}

.emoji-mart-emoji span {
	display: inline-block;
}

.emoji-mart-preview-emoji .emoji-mart-emoji span {
	width: 38px;
	height: 38px;
	font-size: 32px;
}

.emoji-type-native {
	font-family: 'Segoe UI Emoji', 'Segoe UI Symbol', 'Segoe UI',
		'Apple Color Emoji', 'Twemoji Mozilla', 'Noto Color Emoji', 'EmojiOne Color',
		'Android Emoji';
	word-break: keep-all;
}

.emoji-type-image {
	/* Emoji sheet has 56 columns, see also utils/emoji-data.js, SHEET_COLUMNS variable */
	/* Here we use (56+1) * 100% to avoid visible edges of nearby icons when scaling for different
	 * screen sizes */
	background-size: 5700%;
}
.emoji-type-image.emoji-set-apple {
	background-image: url("https://unpkg.com/emoji-datasource-apple@6.0.1/img/apple/sheets-256/64.png");
}
.emoji-type-image.emoji-set-facebook {
	background-image: url("https://unpkg.com/emoji-datasource-facebook@6.0.1/img/facebook/sheets-256/64.png");
}
.emoji-type-image.emoji-set-google {
	background-image: url("https://unpkg.com/emoji-datasource-google@6.0.1/img/google/sheets-256/64.png");
}
.emoji-type-image.emoji-set-twitter {
	background-image: url("https://unpkg.com/emoji-datasource-twitter@6.0.1/img/twitter/sheets-256/64.png");
}

.emoji-mart-bar {
	border: 0 solid #d9d9d9;
}
.emoji-mart-bar:first-child {
	border-bottom-width: 1px;
	border-top-left-radius: 5px;
	border-top-right-radius: 5px;
}
.emoji-mart-bar:last-child {
	border-top-width: 1px;
	border-bottom-left-radius: 5px;
	border-bottom-right-radius: 5px;
}

.emoji-mart-scroll {
	position: relative;
	overflow-y: scroll;
	flex: 1;
	padding: 0 6px 6px 6px;
	z-index: 0; /* Fix for rendering sticky positioned category labels on Chrome */
	will-change: transform; /* avoids "repaints on scroll" in mobile Chrome */
	-webkit-overflow-scrolling: touch;
}

.emoji-mart-anchors {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 0 6px;
	color: #858585;
	line-height: 0;
}

.emoji-mart-anchor {
	position: relative;
	display: block;
	flex: 1 1 auto;
	text-align: center;
	padding: 12px 4px;
	overflow: hidden;
	transition: color 0.1s ease-out;
	border: none;
	background: none;
	box-shadow: none;
}
.emoji-mart-anchor:hover,
.emoji-mart-anchor-selected {
	color: #464646;
}

.emoji-mart-anchor-selected .emoji-mart-anchor-bar {
	bottom: 0;
}

.emoji-mart-anchor-bar {
	position: absolute;
	bottom: -3px;
	left: 0;
	width: 100%;
	height: 3px;
	background-color: #464646;
}

.emoji-mart-anchors i {
	display: inline-block;
	width: 100%;
	max-width: 22px;
}

.emoji-mart-anchors svg {
	fill: currentColor;
	max-height: 18px;
}

.emoji-mart .scroller {
	height: 250px;
	position: relative;
	flex: 1;
	padding: 0 6px 6px 6px;
	z-index: 0; /* Fix for rendering sticky positioned category labels on Chrome */
	will-change: transform; /* avoids "repaints on scroll" in mobile Chrome */
	-webkit-overflow-scrolling: touch;
}

.emoji-mart-search {
	margin-top: 6px;
	padding: 0 6px;
}
.emoji-mart-search input {
	font-size: 16px;
	display: block;
	width: 100%;
	padding: 0.2em 0.6em;
	border-radius: 25px;
	border: 1px solid #d9d9d9;
	outline: 0;
}
.emoji-mart-search-results {
	height: 250px;
	overflow-y: scroll;
}

.emoji-mart-category {
	position: relative;
}

.emoji-mart-category .emoji-mart-emoji span {
	z-index: 1;
	position: relative;
	text-align: center;
	cursor: default;
}

.emoji-mart-category .emoji-mart-emoji:hover:before,
.emoji-mart-emoji-selected:before {
	z-index: 0;
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #f4f4f4;
	border-radius: 100%;
	opacity: 0;
}
.emoji-mart-category .emoji-mart-emoji:hover:before,
.emoji-mart-emoji-selected:before {
	opacity: 1;
}

.emoji-mart-category-label {
	position: sticky;
	top: 0;
}
.emoji-mart-static .emoji-mart-category-label {
	z-index: 2;
	position: relative;
	/* position: sticky; */
	/* position: -webkit-sticky; */
}

.emoji-mart-category-label h3 {
	display: block;
	font-size: 16px;
	width: 100%;
	font-weight: 500;
	padding: 5px 6px;
	background-color: #fff;
	background-color: rgba(255, 255, 255, 0.95);
}

.emoji-mart-emoji {
	position: relative;
	display: inline-block;
	font-size: 0;
}

.emoji-mart-no-results {
	font-size: 14px;
	text-align: center;
	padding-top: 70px;
	color: #858585;
}
.emoji-mart-no-results .emoji-mart-category-label {
	display: none;
}
.emoji-mart-no-results .emoji-mart-no-results-label {
	margin-top: 0.2em;
}
.emoji-mart-no-results .emoji-mart-emoji:hover:before {
	content: none;
}

.emoji-mart-preview {
	position: relative;
	height: 70px;
}

.emoji-mart-preview-emoji,
.emoji-mart-preview-data,
.emoji-mart-preview-skins {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
}

.emoji-mart-preview-emoji {
	left: 12px;
}

.emoji-mart-preview-data {
	left: 68px;
	right: 12px;
	word-break: break-all;
}

.emoji-mart-preview-skins {
	right: 30px;
	text-align: right;
}

.emoji-mart-preview-name {
	font-size: 14px;
}

.emoji-mart-preview-shortname {
	font-size: 12px;
	color: #888;
}
.emoji-mart-preview-shortname + .emoji-mart-preview-shortname,
.emoji-mart-preview-shortname + .emoji-mart-preview-emoticon,
.emoji-mart-preview-emoticon + .emoji-mart-preview-emoticon {
	margin-left: 0.5em;
}

.emoji-mart-preview-emoticon {
	font-size: 11px;
	color: #bbb;
}

.emoji-mart-title span {
	display: inline-block;
	vertical-align: middle;
}

.emoji-mart-title .emoji-mart-emoji {
	padding: 0;
}

.emoji-mart-title-label {
	color: #999a9c;
	font-size: 21px;
	font-weight: 300;
}

.emoji-mart-skin-swatches {
	font-size: 0;
	padding: 2px 0;
	border: 1px solid #d9d9d9;
	border-radius: 12px;
	background-color: #fff;
}

.emoji-mart-skin-swatches-opened .emoji-mart-skin-swatch {
	width: 16px;
	padding: 0 2px;
}

.emoji-mart-skin-swatches-opened .emoji-mart-skin-swatch-selected:after {
	opacity: 0.75;
}

.emoji-mart-skin-swatch {
	display: inline-block;
	width: 0;
	vertical-align: middle;
	transition-property: width, padding;
	transition-duration: 0.125s;
	transition-timing-function: ease-out;
}

.emoji-mart-skin-swatch:nth-child(1) {
	transition-delay: 0s;
}
.emoji-mart-skin-swatch:nth-child(2) {
	transition-delay: 0.03s;
}
.emoji-mart-skin-swatch:nth-child(3) {
	transition-delay: 0.06s;
}
.emoji-mart-skin-swatch:nth-child(4) {
	transition-delay: 0.09s;
}
.emoji-mart-skin-swatch:nth-child(5) {
	transition-delay: 0.12s;
}
.emoji-mart-skin-swatch:nth-child(6) {
	transition-delay: 0.15s;
}

.emoji-mart-skin-swatch-selected {
	position: relative;
	width: 16px;
	padding: 0 2px;
}
.emoji-mart-skin-swatch-selected:after {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	width: 4px;
	height: 4px;
	margin: -2px 0 0 -2px;
	background-color: #fff;
	border-radius: 100%;
	pointer-events: none;
	opacity: 0;
	transition: opacity 0.2s ease-out;
}

.emoji-mart-skin {
	display: inline-block;
	width: 100%;
	padding-top: 100%;
	max-width: 12px;
	border-radius: 100%;
}

.emoji-mart-skin-tone-1 {
	background-color: #ffc93a;
}
.emoji-mart-skin-tone-2 {
	background-color: #fadcbc;
}
.emoji-mart-skin-tone-3 {
	background-color: #e0bb95;
}
.emoji-mart-skin-tone-4 {
	background-color: #bf8f68;
}
.emoji-mart-skin-tone-5 {
	background-color: #9b643d;
}
.emoji-mart-skin-tone-6 {
	background-color: #594539;
}

/* vue-virtual-scroller/dist/vue-virtual-scroller.css */
.emoji-mart .vue-recycle-scroller {
	position: relative;
}
.emoji-mart .vue-recycle-scroller.direction-vertical:not(.page-mode) {
	overflow-y: auto;
}
.emoji-mart .vue-recycle-scroller.direction-horizontal:not(.page-mode) {
	overflow-x: auto;
}
.emoji-mart .vue-recycle-scroller.direction-horizontal {
	display: flex;
}
.emoji-mart .vue-recycle-scroller__slot {
	flex: auto 0 0;
}
.emoji-mart .vue-recycle-scroller__item-wrapper {
	flex: 1;
	box-sizing: border-box;
	overflow: hidden;
	position: relative;
}
.emoji-mart .vue-recycle-scroller.ready .vue-recycle-scroller__item-view {
	position: absolute;
	top: 0;
	left: 0;
	will-change: transform;
}
.emoji-mart
	.vue-recycle-scroller.direction-vertical
	.vue-recycle-scroller__item-wrapper {
	width: 100%;
}
.emoji-mart
	.vue-recycle-scroller.direction-horizontal
	.vue-recycle-scroller__item-wrapper {
	height: 100%;
}
.emoji-mart
	.vue-recycle-scroller.ready.direction-vertical
	.vue-recycle-scroller__item-view {
	width: 100%;
}
.emoji-mart
	.vue-recycle-scroller.ready.direction-horizontal
	.vue-recycle-scroller__item-view {
	height: 100%;
}
.emoji-mart .resize-observer[data-v-b329ee4c] {
	position: absolute;
	top: 0;
	left: 0;
	z-index: -1;
	width: 100%;
	height: 100%;
	border: none;
	background-color: transparent;
	pointer-events: none;
	display: block;
	overflow: hidden;
	opacity: 0;
}
.emoji-mart .resize-observer[data-v-b329ee4c] object {
	display: block;
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	overflow: hidden;
	pointer-events: none;
	z-index: -1;
}
.emoji-mart-search .hidden {
	display: none;
	visibility: hidden;
}

</style>
