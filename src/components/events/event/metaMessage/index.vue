<template>
	<div ref="metaMsg" class="metaMsg">

		<div class="pocketnet_miniapp" v-if="miniapplink">

			<div class="miniappcontent">
				<div class="preloaderWrapperLocal" v-if="applicationLoading">
					<linepreloader />
				</div>

				<div class="info" v-else>
					<template v-if="application">
						<div class="approw">
							<div class="appicon">
								<bgimage v-if="application.application.icon" :src="application.application.icon" />
							</div>
							<div class="appname">
								<span>{{ application.application.manifest.name }}</span>
							</div>
						</div>
						<div class="linkinfo">

							<div class="imagePreview" v-if="application.meta.image">
								<bgimage :src="application.meta.image" />
							</div>

							<div class="header">
								<div class="header-text">
									<span class="title" v-if="application.meta.title || application.meta.titlePage">{{ application.meta.title || application.meta.titlePage}}</span>
									<span class="description" v-if="application.meta.description || application.meta.descriptionPage || application.application.manifest.descriptions['en']">{{ application.meta.description || application.meta.descriptionPage || application.application.manifest.descriptions['en'] }}</span>
								</div>
							</div>
							
						</div>
					</template>
					<div class="link">
						<i class="fas fa-link"></i> <span>{{ url }}</span>
					</div>
				</div>
			</div>
			<div class="openlink" v-if="gotopn">
				<button
					class="button orange small rounded"
					@click="openlinkiframe(url)"
				>
					{{ $t("caption.open") }}
				</button>
			</div>


		</div>

		<div class="pocketnet_iframe_wrapper" v-if="iframe && !miniapplink">
			<div class="pocketnet_iframe" ref="iframe"></div>

			<div class="openlink" v-if="gotopn">
				<button
					class="button orange small rounded"
					@click="openlinkiframe(url)"
				>
					{{ $t("caption.open") }}
				</button>
			</div>
		</div>

		<div class="matrixUrl" v-if="matrix">
			<matrixlink :url="url" />
		</div>

		<div class="customURL" v-if="!iframe && !matrix">
			<div class="link">
				<div @click="openlink(url)">
					<i class="fas fa-link"></i> <span>{{ url }}</span>
				</div>
			</div>

			<div class="header" v-if="image || title">
				<div v-if="image">
					<bgimage :src="image" />
				</div>

				<div class="header-text">
					<span class="title">{{ title }}</span>
					<span class="description" v-if="description">{{ description }}</span>
				</div>
			</div>

			<!--<Player v-if="video" :video="video_url" :autoplay="false" />-->
		</div>
	</div>
</template>
<script>
//import Player from '@/components/chat/player/Player.vue'
import Widgets from "@/application/utils/widgets.js";
import matrixlink from "@/components/events/event/metaMessage/matrixlink.vue";
//import imagesLoaded from "vue-images-loaded";

/*import icons from './plyr.svg';*/

export default {
	components: {
		//Player,
		matrixlink,
	},
	directives: {
		//imagesLoaded,
	},
	props: {
		title: String,
		msg: String,
		name: String,
		description: String,
		image: String,
		video: String,
		url: String,
		h: Number,
		w: Number,
		initImageWidth: Number,
		imageFactor: Number,
		clientWidth: Number,
		post: String,
		type: String,
	},

	data: () => {
		return {
			link: "",
			txt: String,
			gotopn: false,
			module: {},

			application : null,
			applicationLoading : false,
			playingVideo : null
		};
	},

	watch: {
		hiddenInParent: function (v) {
			if (this.hiddenInParent && this.playingVideo){
				this.playingVideo.pause()
			}
		},
	},

	computed: {
		smallsize() {
			if (this.url) {
				var _u = new URL(this.url);

				if (_u.pathname && _u.pathname != "/") return false;

				return true;
			}
		},

		imageWidth() {
			return this.clientWidth < 650
				? this.imageFactor * this.initImageWidth
				: this.initImageWidth;
		},

		getUrl: function () {
			var domain = window.pocketnetdomain || "pocketnet.app";

			if (this.metaUrl) return new URL(this.metaUrl).hostname === domain;
		},

		imageHeight() {
			const ratio = this.w / this.imageWidth;

			return this.h / ratio || 300;
		},

		miniapplink(){
			if(this.type === 'pocketnet'){
				if(window.POCKETNETINSTANCE && window.POCKETNETINSTANCE.apps && window.POCKETNETINSTANCE.apps){
					
					var appinfo = window.POCKETNETINSTANCE.apps.isApplicationLink(this.url)

					return appinfo
				}
			}
		},

		iframe() {
			if (this.type === "pocketnet") {
				return true;
			}
		},

		matrix() {
			if (this.type === "matrix") {
				return true;
			}
		},

		hiddenInParent(){
			return this.$store.state.hiddenInParent || false
		}
	},

	beforeMount() {},
	beforeDestroy() {
		setTimeout(() => {

		
		if (this.module.d) {


			try {
				this.module.d.destroy();
			} catch (e) {}

			delete this.module.d;
		}

		}, 200)
	},
	mounted() {
		if (this.type === "pocketnet" && !this.miniapplink) {

			setTimeout(() => {
				if(this.$refs.iframe){
					let widget = new Widgets();

					this.gotopn = widget.makefromurl(
						this.$refs.iframe,
						this.url,
						(before) => {
							this.updatedSize(before);
						},
						{
							theme: this.core.vm.ctheme || this.$store.state.theme,
							playingClbk : (video) => {
								this.playingVideo = video
							}
						},
						(p, m) => {
							this.module.d = m;
							this.loaded(m);
						}
					);
				}
				
			}, 50)
			
		}

		if (this.type === "pocketnet" && this.miniapplink) {

			this.gotopn = true
			this.applicationLoading = true

			window.POCKETNETINSTANCE.apps.get.applicationAny(this.miniapplink).then(r => {

				this.application = r || {}

			}).catch(e => {

				console.error(e)
				
			}).finally(() => {
				this.gotopn = true
				this.applicationLoading = false
				this.loaded(null);
			})
		}

	},

	methods: {
		openlink: function (url) {
			if (
				typeof window != "undefined" &&
				typeof window.cordova != "undefined" &&
				cordova.InAppBrowser
			) {
				var ref = cordova.InAppBrowser.open(url, "_system");
				return false;
			} else {

				if (window.electron && window.electron.shell && window.electron.shell.openExternal){
					window.electron.shell.openExternal(url);
				}

				else{
					window.open(url, "_blank");
				}
			}
		},

		openlinkiframe: function (url) {
			if (this.core.backtoapp) {
				//var pu = new URL(url);

				this.core.backtoapp(url);

			} else window.open(url, "_blank");
		},

		//imagesLoaded: function () {},
		updatedSize: function (before) {},

		loaded: function (data) {
			this.$emit("loaded", data);
		}
	},
};
</script>

<style
	lang="less"
	src="@/components/events/event/metaMessage/exported.less"
></style>
<style
	lang="less"
	src="@/components/events/event/metaMessage/exported2.less"
></style>
<style src="@/styles/peerTube.css"></style>

<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
