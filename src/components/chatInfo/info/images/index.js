import _ from "underscore";
import f from "@/application/functions";
import imageEvents from "@/components/chat/list/index.vue"
export default {
  data: function () {
    return {
      events: [],
      empty: false,
    }
  },
  components: {
    imageEvents
  },
  props: {
    images: Array,
    chat : Object
  },

  computed: {

  },

  mounted : function(){
    this.core.mtrx.kit.prepareChat(this.chat).then(r => {
      _.each(this.imageEvents, (e) => {

        if(this.encrypted(e)){
          this.core.mtrx.getImage(this.chat, e).catch(e => {
            console.error(e)
          })
        }
  
      })
    })


    
  },

  methods: {
    galleryImage(e) {

      this.core.store.dispatch('SHOW_GALLERY_FROMEVENTS', {
        events: this.events,
        event: e
      })

    },
    eventsList(events){
      if(events.length === 0){
        this.empty = true
      }
      this.events = events

    },
    showPhotoSwipe(event) {

      this.core.store.dispatch('SHOW_GALLERY_FROMEVENTS', {
        events : this.imageEvents, 
        event
      })

    },

    encrypted : function(event){
      return f.deep(event, 'event.content.info.secrets') ? true : false
    }
   
  }
}