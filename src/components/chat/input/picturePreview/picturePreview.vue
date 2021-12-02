<template>
    <div v-if="is_opened" class="wrapper">
        <img class="preview-picture" :src="base64" alt="picture preview">
        <i @click="hide" class="fas fa-times fa-sm"></i>
    </div>
</template>

<script>

export default {
    name: 'picturePreview',
    props: ['base64'],

    data() {
        return {
            is_opened: true
        }
    },

    methods: {
        hide() {
            this.is_opened = false
        }
    }

}
</script>

<style lang="sass" scoped>
    .wrapper
        position: relative

    .fas
        position: absolute
        right: -8px
        top: -8px

    .preview-picture
        width: 50px
        height: 50px
        border-radius: 10px
</style>
