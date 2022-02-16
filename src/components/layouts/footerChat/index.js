import { mapState} from 'vuex'
export default {
    name: "footerChat",

  data: function () {

    return {
      loading: false
    }

  },

  created: () => {

  },

  watch: {
    //$route: 'getdata'
  },

  

  computed: mapState({
    pocketnet: state => state.pocketnet,
    minimized: state => state.minimized,
    active: state => state.active,
    auth: state => state.auth,
    notificationCount : state => state.allnotifications,

    current : function(){
      return this.$route.name
    },

    activesettings : function(){
      return this.current == 'settings'
    },

    activecontacts : function(){
      return this.current == 'contact' || this.current == 'contacts'
    },

    activechats : function(){
      return this.current == 'chat' || this.current == 'chats'
    },

    mobile : function(){
      return this.$store.state.mobile
    }
    
  }),
  methods : {
    gotona(r){
      this.$router.push(r)
      this.$store.commit('active', true)
      this.$store.commit('setiteraction', true)
    },

    movefromchat : function(){
      if(this.core.backtoapp) this.core.backtoapp()
    }
  }
}