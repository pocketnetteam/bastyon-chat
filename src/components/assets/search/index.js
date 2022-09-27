import {mapState} from 'vuex';
// TODO IGOR' SEARCH ALL COMPONENTS
export default {
  name: 'search',
  props: {
    placeholder: String,
    minimize: {
      type: Boolean,
      default: null
    }
  },
  inject: ['matches'],
  data: function () {

    return {
      loading: false,
      isTyping: false,
      searchTxt: this.matches?.value || '',
      collapsed: this.minimize
    }

  },

  mounted: function () {
    /*Override browser CTRL + F*/
    document.onkeydown = this.search
  },
  
  beforeDestroy: function () {
    /*Remove CTRL + F Listener*/
    window.removeEventListener('keypress', () => this.search())
  },

  watch: {
    searchTxt : {
      handler : _.debounce(function() {
        /*Clear previous results*/
        if (typeof this.matches?.clear === 'function')
          this.matches?.clear()
        
        /*Emit search text in root*/
        if (typeof this.matches?.search === 'function')
          this.matches?.search(this.searchTxt)
        
        /*Recalculate matches*/
        this.calcMatches()
  
      }, 500)
    },
  
    'matches.all': {
      handler: _.debounce(function() {
        this.calcMatches()
      })
    }
  },
  computed: mapState({
    auth: state => state.auth,
    pocketnet: state => state.pocketnet,
    minimized: state => state.minimized,
    active: function (state) {
      return state.active || !this.minimize
    },
  }),

  methods: {
    change: function(event){
      this.searchTxt = event.target.value
    },
    
    search: function(event) {
      if (event.keyCode === 114 || (event.ctrlKey && event.keyCode === 70)) {
        /*Block CTRL + F event*/
        event.preventDefault()
        this.toggle()
      }
      
      if (event.keyCode === 27) {
        if (this.collapsed !== null && !this.collapsed) {
          /*Clear on Esc*/
          this.collapsed = true
          this.clear()
        } else {
          /*Go back to chats*/
          this.$router.push('chats').catch(e => {})
        }
      }
    },
    
    toggle: function() {
      if (this.minimize !== null)
        this.collapsed = !this.collapsed
      
      if (!this.collapsed && this.$refs.input)
        this.$refs.input.focus()
    },

    clear: function(event){
      this.searchTxt = ''
      
      if (typeof this.matches?.clear === 'function')
        this.matches?.clear()
    }, 
 
    clickicon: function () {
      this.$refs['input'].focus()
    },

    blured: function () {
      this.$store.commit('blockactive', {value: false, item: 'input'})
    },

    focused: function () {
      this.$store.commit('blockactive', {value: true, item: 'input'})
    },
    
    calcMatches: function () {
      /*Recalc counter*/
      if (this.matches.current > this.matches.all.length-1) {
        this.matches.current = 0
      } else if (this.matches.current < 0) {
        this.matches.current = this.matches.all.length-1
      }
      
      /*Highlight current match*/
      this.matches.all.forEach((match, i) => {
        match.classList.remove('current')
        
        if (i === this.matches.current) {
          match.classList.add('current')
          
          /*Scroll view to match*/
          if (typeof match?.component.scrollTo === 'function')
            match?.component.scrollTo()
        }
      })
    },
    
    prevMatch: function () {
      this.calcMatches(--this.matches.current)
    },
    
    nextMatch: function () {
      this.calcMatches(++this.matches.current)
    }
  }
}