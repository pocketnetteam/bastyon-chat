<template>
    <div>
        <span v-for="(elem, index) in message.split(/[\s]/)" v-bind:key="index">  
            <span v-if="userCalled.test(elem)" class="likelink"> {{ elem.replace(user_id, '') }} </span>
            <span v-else> {{ elem }}</span>
        </span>
    </div>
</template>

<script>
export default {
    name: 'IncomingMessage',
    props: {
        message: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            user_id: /\d{15}\w{1}\d{5}\w{1}\d{1}\w{1}\d{7}\w{1}\d{3}\w{1}\d{17}\w{1}\d{11}\w{1}\d{1}\w{1}/,
            userCalled: /(^|\s)@\d{15}\w{1}\d{5}\w{1}\d{1}\w{1}\d{7}\w{1}\d{3}\w{1}\d{17}\w{1}\d{11}\w{1}\d{1}\w{1}\w{1,50}/,
        }
    },
}
</script>

<style lang="sass" scoped>

.likelink 
    color: black
    cursor: pointer

</style>