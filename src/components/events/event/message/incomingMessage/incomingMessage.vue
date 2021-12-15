<template>
    <label>
        <label v-for="(elem, index) in message.split(/[\s]/)" v-bind:key="index">  
            <label class="likelink" v-if="userCalled.test(elem)" 
            @click="core.mtrx.opencontact(getUser(elem.replace(user_id, '')))">{{ elem.replace(user_id, '') }}</label>
            <label v-else>{{ elem }}</label>
        </label>
    </label>
</template>

<script>
export default {
    name: 'IncomingMessage',
    props: {
        message: {
            type: String,
            default: ''
        },
        roomId: {
            type: String
        }
    },
    data() {
        return {
            user_id: /\w{68}:/,
            userCalled: /(^|\s)@\w{68}:\w{1,50}/,
        }
    },
    methods: {
        getUser(userName){
            let user = this.core.mtrx.chatUsersInfo(this.roomId, 'anotherChatUsers')
            .filter(word => word.name === userName.trim().slice(1).toLowerCase())[0]
            return user
        }
    }
}
</script>

<style lang="sass" scoped>

.likelink 
    text-decoration: underline
    cursor: pointer


</style>