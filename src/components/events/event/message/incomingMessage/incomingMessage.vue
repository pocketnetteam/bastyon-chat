<template>
    <label>
        <label v-for="(elem, index) in message.split(userCalled)" v-bind:key="index">  
            <label class="likelink" v-if="userCalled.test(elem)" @click="show(elem)">{{ elem.replace(user_id, '') }}</label>
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
            userCalled: /(^|\s)@\w{68}:\w{1,50}/g,
        }
    },
    computed : {
        chunks : function(){
            var c = message.split(userCalled);

            var wordCap = message.replace(this.userCalled, function (l) { return l.toUpperCase() });
        }
    },
    methods: {
        getUser(userName){

            console.log(this.message)

            var user = this.core.mtrx.chatUsersInfo(this.roomId, 'anotherChatUsers').filter(word => word.name === userName.trim().slice(1).toLowerCase())[0]
            
            
            return user
        },

        show : function(elem){

            var user = getUser(elem.replace(this.user_id, ''))

            if(user)
                core.mtrx.opencontact(getUser(elem.replace(this.user_id, '')))
        }
    }
}
</script>

<style lang="sass" scoped>

label
    display: inline

.likelink 
    text-decoration: underline
    cursor: pointer


</style>