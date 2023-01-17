import { mapState, mapGetters  } from 'vuex';

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


    computed: {
           
        ...mapState([
            'auth',
            'minimized',
            'pocketnet',
            'active',
            'mobile',
            'share',
            'closebybg',
            'recipients',
            'recipientsTotal',
            'processMassMailing',
            'massMessageLimitCount',
            'massmailingenabled'
        ]),    

        ...mapGetters(['massMessageAvailable']),

        window : function(){
            return window
        },
        
        recipientsCompleted(){
            return this.recipientsTotal - this.recipients.length;
        },
    },

    methods : {
        
        resumeProcess : function(){

            const chatMassMessage = JSON.parse(localStorage.getItem('chat_mass_message') || '{}');

            console.log('chatMassMessage', chatMassMessage);

            this.$emit('sendMassMessage', chatMassMessage);
        },
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
        }
    },

}