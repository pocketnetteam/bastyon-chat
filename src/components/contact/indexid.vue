<template>
  <div id="contactid">
      <contact v-if="contact" :contact="contact"/>
  </div>
</template>

<style scoped lang="sass">

</style>

<script>
import { mapState } from 'vuex';
import contact from '@/components/contact/index.vue'
import f from "@/application/functions";
export default {
    name: 'contactid',
    props: {
        id : ''
    },
    components : {
        contact
    },
    computed: mapState({
        auth : state => state.auth,
        contact : function(){

            if (this.id){
                var contact = this.$store.state.users[f.hexEncode(this.id)]

                return contact
            }
            
        }
    }),

    methods : {
        
    },

    mounted : function(){
        if(this.id)
            this.core.user.usersInfo(this.id, true).then(r => {
            })
    }
}
</script>