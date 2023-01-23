<template>
	<div class="mod-wrapper">
		<div class="modal-window">
			<span class="message">{{ message }}</span>
			<button class="btn" @click="close">OK</button>
		</div>
	</div>
</template>

<script>
export default {
	name: "ModalWindow",
	props: ["message"],

	methods: {
		close() {
			this.$emit("Close");
		},
	},
};
</script>

<style lang="sass" scoped>
.mod-wrapper
    position: absolute
    top: 0
    left: 0
    display: flex
    justify-content: center
    align-items: center
    width: 100%
    height: 100%

.modal-window
    width: 100%
    border : 1px solid srgb(--background-main)
    display: flex
    flex-direction: column
    align-items: center
    background-color: srgb(--background-total-theme)
    padding: 2 * $r
    max-width: 300px
    margin : 0 auto
    border-radius: 5px

    .btn
        width: 85%
        padding: 10px 5px
        margin-top: 25px
        background-color: srgb(--color-bg-ac)
        border-radius: 5px
        color: white
        cursor: pointer
</style>
