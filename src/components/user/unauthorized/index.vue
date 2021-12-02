<template>
  <div id="userUnauthorized" :class="{'bin' : pocketnet, 'fix' : pocketnet, 'bout' : !pocketnet, minimized, active}">
  
    <div class="table">
        <div class="cell">

            <div class="wrapper">
                <div  v-if="!loading">
                    <div v-if="unauthorized == 'unauthorized'">

                        <div class="icon">
                            <i class="fas fa-user-slash"></i>
                        </div>
                        <div class="label">
                            Unauthorized user
                        </div>

                    </div>

                    <div v-if="unauthorized == 'unknown'">

                        <div class="icon">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                        <div class="label">
                            {{$t('caption.accNotFound')}}
                        </div>


                        <div class="connect" v-if="connect && usersinfo[connect]">

                            <div class="connectCaption">
                                <span>
                                    When registration is complete, you will be connected to
                                </span>
                            </div>

                            <preview 
                                :contact="usersinfo[connect]"
                                mode="mini"
                            />

                        </div>

                        <div class="connect joinroom" v-if="joinroom && !connect">

                            <div class="connectCaption">
                                <span>
                                    When registration is complete, you will be redirect to public room
                                </span>
                            </div>

                        </div>
                    </div>




                    <div class="actions">
                        <button class="button small" @click="refresh">
                            Refresh <i class="fas fa-sync"></i>
                        </button>

                        <button class="button small ghost" v-if="mobile" @click="movefromchat">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>

                <div v-else>
                
                    <i class="fas fa-spinner fa-spin"></i>

                </div>
            </div>

           

        </div>

    </div>
  
  </div>
</template>

<style scoped lang="sass">

    .actions
        padding-top : 18 * $r
    
    .connect
        padding-top : 4 * $r

        /deep/
            .previewWrapper
                display: block
                max-width: 70%
                margin : 0 auto
                padding : 4 * $r 0


            .iconWrapper
                margin : 0 auto

            .infoWrapper
                padding : 0

        .connectCaption
            max-width: 70%
            margin : 0 auto
            span
                font-size: 0.8em


    #userUnauthorized
        height: 100%
        

    #userUnauthorized
        &.bin
            +transition(0.3s)
            &.minimized
                .wrapper
                    top : 60px
                    bottom : 100px

                &:not(.active)
                    opacity: 0

            &.active
                .wrapper
                    width: 344px
                    transform: translateX(-300px)
            
    .table
        height: 100%
        .cell
            vertical-align: middle   
</style>

<script>
import { mapState } from 'vuex';
import f from '@/application/functions.js'
import preview from '@/components/contacts/preview/index.vue'

export default {
    name: 'userUnauthorized',
    props: {
        data : Object
    },

    data : function(){
        return {
            loading : false,
            intrv : null
        }
    },

    components : {
        preview
    },

    computed: mapState({

        pocketnet  : state => state.pocketnet,

        minimized: function() {

			if(this.mobile) return false

			return this.$store.state.minimized
		},

		active: function() {

			if(this.mobile) return false

			return this.$store.state.active
		},

        auth : state => state.auth,

        connect : state => state.connect,

        joinroom : state => state.joinroom,

        unauthorized: function() {
			return this.$store.state.unauthorized
		},

        mobile : function(){
            return this.$store.state.mobile
        },

        usersinfo : function(){

            return this.$store.state.users
        },
    }),

    beforeDestroy : function(){
        if(this.intrv){
            clearInterval(this.intrv)
            this.intrv = null
        }
    },
    methods : {
        refresh : function(auto){

            if(!auto)
                this.loading = true

            console.log("refresh")

            this.core.initWithUser().then(r => {

                setTimeout(() => {
                    this.loading = false
                }, 350)
                
            })

        },
        movefromchat : function(){
            if(this.core.backtoapp) this.core.backtoapp()
        }
    },

    mounted : function(){
        if (this.connect)
            this.core.user.usersInfo([this.connect])

        if(this.unauthorized == 'unknown'){

            this.intrv = setInterval(() => {
                this.refresh(true)
            }, 20000)

        }
    }
}
</script>