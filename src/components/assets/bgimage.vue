<template>
	<div
		class="bgimage"
		:class="{ loaded, hasimage: src }"
		:style="
			'background-image:url(' +
			imageSrc +
			'); background-size: cover; background-position: center center; background-repeat: no-repeat'
		"
	>
		<slot name="cnt"></slot>
	</div>
</template>

<style scoped lang="sass">

.bgimage
    width : 100%
    height: 100%
    opacity: 0
    +transition(0.3s)

    &.loaded
        opacity: 1
</style>

<script>

var loadedCache = {}


export default {
	name: "bgimage",
	directives: {},
	props: {
		src: String,
	},

	watch: {
		src: {
			immediate: true,
			handler: function () {
				this.load();
			},
		},
	},

	data: function () {
		return {
			loaded: false,
			imageSrc: "",
		};
	},

	beforeMount : function(){
		if(loadedCache[this.src]){
			this.loaded = true;
		}
	},

	methods: {
		load: function () {
			if (this.src) {
				this.imageSrc = this.src;
			
			if (this.imageSrc && typeof replaceArchiveInImage != 'undefined') {
				this.imageSrc =  replaceArchiveInImage(this.imageSrc);
			};

				var image = new Image();

				image.src = this.imageSrc;
				image.onload = () => {
					loadedCache[this.src] = true
					this.loaded = true;
				};
			} else this.loaded = true;
		},
	},
};
</script>
