<template>
  <div class="event" :class="{readyToRender, my}" ref="msgElement" v-if="!event.localRedactionEvent() && !event.getRedactionEvent() && !removed">
  
    <member :chat="chat" :event="event"
            :userinfo="userinfo"
            :readed="readed"
            :preview="preview || false"
            v-if="type === 'member' && !preview"/>

    <message @openGalleryImg="openImage" :chat="chat"

             :event="event"
             :prevevent="prevevent"
             :origin="event"
             :decryptEvent="decryptEvent"
             :decryptedImage="decryptedImage"
             :encryptedData="encryptedData"

             :imgEvent="galleryData" 
             :userinfo="userinfo"
             :readed="readed"
             :preview="preview || false"
             :withImage="withImage || false"
             :clientWidth="clientWidth"
             :encrypted="encrypted"
             :subtype="subtype"
             :error="error"
             :reference="reference"
             :downloaded="downloaded"
             :last="last"
             :showmyicontrue="showmyicontrue"
             :fromreference="fromreference"

             ref="cmessage"

             @remove="removeEvent"
             @download="downloadFile"
             @decryptagain="decryptAgain"
             @editing="editing"
             @reply="reply"
             @share="share"
             @menuIsVisible="menuIsVisibleHandler"
             v-if="type === 'message' || preview" />

    <common :event="event"
            :userinfo="userinfo"
            :readed="readed"
            :preview="preview || false"
            v-if="type === 'common'"/>

    <div class="loading" v-if="downloading">
      <linepreloader />
    </div>

  </div>

  <div v-else class="deletedMessage">
    <i class="fas fa-eraser"></i> {{ $t("caption.messageDeleted") }}
  </div>

</template>

<style scoped lang="sass">
  .deletedMessage
    font-size: 0.8em
    text-align: center
    opacity: 0.6

  .event
    opacity: 0
    +transition(0.3s)

    &.readyToRender
      opacity: 1

    .loading
      position: relative
      left : 0
      top : 0
      padding : $r
      width : 100%
      height : 100%
      text-align: center

    .deletedMessage
      position: relative
      left : 0
      top : 0
      padding : $r


</style>

<script>
import dummypreviews from "@/components/chats/dummypreviews";
import common from '@/components/events/event/common/index.vue'
import member from '@/components/events/event/member/index.vue'
import message from '@/components/events/event/message/index.vue'

import f from '@/application/functions'

export default {
  name: 'eventsEvent',

  components: {
    common,
    member,
    message ,
    dummypreviews
  },

  data: function () {
    return {
      readed: null,
      decryptEvent: {},
      decryptedImage : null,
      decryptReady: '',
      readyEvent: false,
      downloading : false,
      error : null,
      reference : null,
      removed : false,
      downloaded : false,
      readedInterval : null,
    }
  },


  props: {
    event: Object,
    prevevent : Object,
    preview: Boolean,
    withImage : Boolean,
    timeline : Object,
    last : Boolean,
    chat: Object,
    showmyicontrue: Boolean,
   
    metaUrl: String,
    galleryData: {},
    goToGallery: Function,
    clientWidth: Number,
    fromreference : Boolean
  },

  computed: {
    readyToRender : function(){
      if(this.$refs["cmessage"]) return this.$refs["cmessage"].readyToRender

      return true
    },
    type: function () {

      var t = f.deep(this, 'event.event.type')

      if (['m.room.member'].indexOf(t) > -1) return 'member'
      if (['m.room.message'].indexOf(t) > -1) return 'message'
      if (['m.room.name'].indexOf(t) > -1) return 'member'
      if (['m.room.power_levels'].indexOf(t) > -1)return 'member'
      if (['m.room.redaction'].indexOf(t) > -1) return 'message'
      if (['m.room.topic'].indexOf(t) > -1) {
        return 'member'
      }

      return ''

    },

    subtype : function(){
      return f.deep(this, 'event.event.content.msgtype')
    },

    encryptedData : function(){
      return f.deep(this, 'event.event.content.info.secrets') || f.deep(this, 'event.event.content.pbody.secrets') ? true : false
    },

    userinfo: function () {

      return this.$f.deep(this, '$store.state.users.' + this.$f.getmatrixid(this.event.getSender())) || {}
    },

    encrypted: function () {
      if (this.chat && this.chat.roomId) {
        return this.core.mtrx.client.isRoomEncrypted(this.chat.roomId)
      }

      return false
    },

    my: function () {
      return this.userinfo.id === this.core.user.userinfo?.id
    },

  },
  
  beforeDestroy : function(){
    if(this.readedInterval){
      clearInterval(this.readedInterval)
      this.readedInterval = null
    }
  },

  mounted: function () {
    this.$emit('mounted')
  },
  
  watch : {
    readed : {
      immediate: true,
      handler: function () {
        this.manageReadedInterval()
      }
    },
    
    last : {
      handler: function () {
        this.manageReadedInterval()
      }
    },
    event : {
      immediate: true,
      handler: function () {

        this.decryptEvent = {}

        this.checkReaded()
        this.relations()

        if(this.encryptedData || this.subtype == 'm.encrypted'){

          f.pretry(() => {

            return this.chat.pcrypto

          }, 20, 10000).then(() => {

            if(this.encryptedData){
              this.decryptImage()
            }

            if(this.subtype == 'm.encrypted'){
              this.decrypt()
            }

          })

        }

        
      }
    }
  },

  methods: {
    manageReadedInterval(){

      if(this.preview || !this.my) return

      if(this.last || this.readed){

        if(!this.readedInterval){
          
          this.readedInterval = setInterval(()=>{
            this.checkReaded()
          }, 500)
        }

      }
      else{

        if(this.readedInterval){
          clearInterval(this.readedInterval)
          this.readedInterval = null
        }
        
      }
    },
    relations(){
      if(this.timeline){

        var ts = this.timeline._timelineSet
        var e = this.event

        if(!this.reference && e.event.content['m.relates_to'] && e.event.content['m.relates_to'] && e.event.content['m.relates_to']['rel_type'] == "m.reference"){

            var id = e.event.content['m.relates_to']['event_id'] 
    
            if (id){

              this.core.mtrx.client.getEventTimeline(ts, id).then(r => {

                var ev = _.find(r.getEvents(), (e) => {
                  if(e.getId() == id){
                    return true
                  }
                })

                if(ev){
                  this.reference = e.event.content.reference = ev

                  var rt = ts.getRelationsForEvent(this.core.mtrx.clearEventId(ev), 'm.replace', 'm.room.message')

                  if (rt){

                    var last = rt.getLastReplacement()

                    if (last){
                      ev.event.content.body = last.event.content.body
                      ev.event.content.edited = last.event.event_id
                    }

                  }
                  
                }
                  
              })

            }
          }

     
      }
    },
    
    editing(text){
      this.$emit('editing', text)
    },

    reply(){
      this.$emit('reply')
    },

    share(_sharing){

      var pr = Promise.resolve()

      if(_sharing.download){

        pr = this.core.mtrx.getFile(this.chat, this.event).then(r => {

          return f.Base64.fromFile(r.file)

        }).then(r => {
          _sharing.files = [r]

          return Promise.resolve()
        })

      }

      return pr.then(() => {
        return this.core.share(_sharing)
      })

    },

    downloadFile(){

      this.downloading = true
      
      this.core.mtrx.downloadFile(this.chat, this.event).catch(e => {
        this.error = e.toString()

        return Promise.resolve(e)
      }).then(r => {

        this.downloading = false
        this.downloaded = true

        this.$store.commit('icon', {
          icon : 'success',
          message : "Downloaded"
        })

      }).catch(e => {

        this.$store.commit('icon', {
          icon : 'error',
          message : "Downloading Failed"
        })


      }) 
    },

    async decryptImage(){

      //if(!this.chat.pcrypto) return

      this.core.mtrx.getImage(this.chat, this.event).then(url => {

        this.decryptedImage = url

      }).catch(e => {

        this.event.event.decryptKey = this.decryptKey = {
          msgtype : 'm.bad.encrypted'
        }
      })
      
    },

    async decryptAgain() {
      this.event.event.decrypted = null
      return this.decrypt()
    },

    async decrypt() {

        //if(!this.chat.pcrypto) return

        if (this.event.event.decrypted){

          this.decryptEvent = this.event.event.decrypted

          return Promise.resolve()
        }

        try{
          this.decryptEvent = await this.chat.pcrypto.decryptEvent(this.event.event)
          this.event.event.decrypted = this.decryptEvent
        }
        catch(e){

          console.error(e, this.event)

          this.event.event.decrypted = this.decryptEvent = {
            msgtype : 'm.bad.encrypted'
          }
          
        }
    },
   
    
    checkReaded: function () {

      if (this.event) {

        this.core.mtrx.isReaded(this.event).then(readed => {
          this.readed = readed || null
        })
      }

    },
    openImage: function () {
      this.$emit('openImageEvent', this.event)
    },

    removeEvent: function (event) {
      this.$emit('removeEvent', event)

      this.removed = true
    },

    menuIsVisibleHandler: function(isVisible) {
      this.$emit('menuIsVisible', isVisible);
    }
  }
}
</script>

