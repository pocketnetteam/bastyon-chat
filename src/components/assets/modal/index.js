import { mapState } from 'vuex';


export default {
    name: 'modal',
    props: {
        displayFooter : {
            default : true,
            type : Boolean
        },
        cantclose : Boolean,
        module : String,
        path : String,
        data : {
            type : Object,
            default : () => {return {}}
        },
        events : {
            type : Object,
            default : () => {return {}}
        },
        mclass : String,
        fromtop : Boolean
    },

    data : function(){
        

        return {
            loading : false,
            scroll : 0,
            blockclose : null,
            blockTouch : false,
        }

    },

    mounted() {

    },
    
    destroyed() {
    },

    watch: {
        //$route: 'getdata'
    },

    components : {
        
    },
 
    computed: mapState({
        auth : state => state.auth,
		pocketnet: (state) => state.pocketnet,
		minimized: (state) => state.minimized,
		active: (state) => state.active,
		mobile: (state) => state.mobile,


        directions : function(){
            console.log('this.fromtop', this.fromtop)
            return {
                [this.fromtop ? 'top' : 'bottom'] : {
                    distance : 100,
                    direction : this.fromtop ? 'top' : 'bottom',
                    constraints : (e) => {
                        return this.scroll <= 0 && !this.blockTouch
                    }   
                }  
            }
        },


    }),

    methods : {
        endswipe : function(direction){

            this.close()
        },
        close : function(){

            if(!this.blockclose){
                this.$emit('close')
            }
            else{

                this.vm.$dialog.confirm(
                    this.vm.$t(this.blockclose), {
                    okText: "Yes, close",
                    cancelText : 'No'
                })
        
                .then((dialog) => {
                    this.setblockclose(null)
                    this.$emit('close')
                }).catch( e => {
                    
                })

            }
        },

        closeiftop : function(e){
            //if(!this.scroll) this.close()
        },

        swipeHandler : function(e){
        },

        scrolling : function(e, data){
            var target = e.target || e.srcElement;

            this.scroll = target.scrollTop

            if (this.scroll > 0){
                this.blockTouch = true

                setTimeout(() => {
                    this.blockTouch = false
                }, 500)
            }
            
        },

        setblockclose : function(text){
            this.blockclose = text
        },

        moving : function(e, h){
        },

        /*bypath : function(){
            return require("@/components/" + this.path).default
        }*/

        
    },
}