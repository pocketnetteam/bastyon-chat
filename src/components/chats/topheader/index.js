import { mapState } from 'vuex';

import contacts from '@/components/contacts/index.vue'


export default {
    name: 'chatsTopheader',
    props: {
    },

    components : {
        contacts
    },

    data : function(){

        return {
            loading : false,
            newchatopened : false,
            createGroup: false,
            contacts: false,
            isLocalStorageChatAuth: this.$store.state.isLocalStorageChatAuth,
        }

    },

    created(){

        this.$store.commit('SET_CURRENT_ROOM', 'all')
         
    },

    destroyed(){

        this.$store.commit('SET_CURRENT_ROOM', false)
         
    },

    watch: {
        //$route: 'getdata'
    },


    computed: mapState({
        auth : state => state.auth,
        minimized: state => state.minimized,
        pocketnet: state => state.pocketnet,
        mobile: (state) => state.mobile,
        active: state => state.active,
        
        ...mapState([
            'share',
            'closebybg'
        ]),

        window : function(){
            return window
        }
    }),

    methods : {
        changeCloseByBg : function(){
            this.$store.commit('closebybg', !this.closebybg)
        },
        gotoapp : function(){
            if (this.core.backtoapp)
                this.core.backtoapp()
        },  
        cordovashare : function(){

            var share = this.share

            var options = {
                //subject : "Message"
            }

            if(share.messages) options.message = share.messages.join('. ')

            if(share.images || share.files) {
                options.files = [].concat(share.images, share.files) 

                options.files = _.filter(options.files, function(f){return f})
            }

            if (window.plugins && window.plugins.socialsharing){
                window.plugins.socialsharing.shareWithOptions(options);
            }
            
            this.cancelShare()
        },
        cancelShare : function(){

            if(this.share){
                if (this.share.route){
                    this.$router.push(this.share.route).catch(e => {})
                }
            }

            this.$store.commit('SHARE', null)
        },
        newchatmenu : function(){
            this.newchatopened = !this.newchatopened
        },

       
        minimizeall : function(){
            this.$store.commit('minimize', true);
        },

        newchat : function(){
            this.$emit('newchat')
        },

        gotona(r) {
            this.$router.push({
                path: this.$router.path,
                query: {
                    ...this.$route.query,
                    page: r,
    },
            });
        },
    },
}