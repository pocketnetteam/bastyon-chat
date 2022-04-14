import simpleMenu from '@/components/assets/simpleMenu/simpleMenu.vue';
import { mapState } from 'vuex';
export default {
    name: 'pmenu',
    props: {
    
    },

    components: {
        simpleMenu,
    },

    data : function(){
        return {
            last : null
        }
    },

    watch: {
        
    },

    computed: {

        ...mapState({
            pocketnet: state => state.pocketnet,
            minimized : state => state.minimized,
            mobile : state => state.mobile,
            active: state => state.active,
            hiddenInParent : state => state.hiddenInParent,

            menu : state => state.menu
        })
    },

    methods : {
        menuItemClick(item) {
            if (this.menu){

                this.last = this.menu


                this.menu.handler(item, this.menu.item, {
                    hidePopup : this.hidePopup,
                    showPopup : this.showPopup
                })

               // this.$emit('itemClicked', item, this.menu.item, );
            }
            
        },

        showPopup : function(){
            if (this.last){
                this.$store.commit('SET_MENU', this.last);
                this.last = null
            }
        },
      
        hidePopup() {
            this.$store.commit('SET_MENU', null);
        }
    },
}