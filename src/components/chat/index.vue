<template>
  <div id="chat" :class="{'bin' : pocketnet, 'bout' : !pocketnet, minimized, fix : pocketnet, active}">

    <div class="cantchatmessage" v-if="cantchat && !cantchatexc">  
      <div class="msg">
       {{ $t("caption." + this.keyproblem) }}
      </div>

      <div class="refresh" v-if="keyproblem=='usernotgen'">
        <button class="button small" @click="refreshkeys">
          Refresh <i class="fas fa-sync"></i>
        </button>
      </div>

      <div class="preloaderwrapper"  v-if="keyproblem=='younotgen'">
        <linepreloader />
      </div>

    </div>

    <div class="chatcontent" v-else>


    <list 
    
      ref="list"
      :error="error"
      :key="key" :chat="m_chat"
       @editingEvent="editingEvent"
       @replyEvent="replyEvent"
       @eventImage="e => galleryImage(e)"
       @scroll="scroll"
       @menuIsVisible="menuIsVisibleHandler"
       v-if="m_chat && membership === 'join' && ready"
       @getEvents="events"
       @shareManyMessages="shareManyMessages"
       :selectedMessages="selectedMessages"
       :isRemoveSelectedMessages="isRemoveSelectedMessages"
       @messagesIsDeleted="messagesIsDeleted"
    />

    <div v-if="m_chat && membership === 'invite'" class="joinwrapper">
      <join :m_chat="m_chat" :chat="chat" :usersinfo="usersinfo" @creatorLeft="brokenInvitedRoom"/>
    </div>

    <div class="chatEmpty" v-if="!m_chat && usersinfo && usersinfo.length">
      <span>{{ $t("caption.startChatWith") }} {{ usersinfoNames() }}</span>
    </div>

    <div
        v-if="!m_chat || membership === 'join'"
        class="chatInputWrapper fixedOnPageBottom"
        :class="{'bin' : pocketnet, 'bout' : !pocketnet}"
    >

      <div>

      

        <div class="relationEvent" v-if="relationEvent">
          
            <div class="relationEventPreview">

              <div class="relationEventCaption">
                <span>{{relationEvent.action}}</span>
              </div>
              <div class="relationEventWrapper" v-if="relationEvent.type!='m.replace'">

                <eventsEvent
                  :event="relationEvent.event"
                  :chat="chat"
                  :preview="true"
                />

               </div>
            </div>

            <div class="relationEventActions">
              <div class="item" @click="clearRelationEvent">
                <i class="far fa-times-circle"></i>
              </div>
            </div>

         
        </div>

        <chatInput
            @sending="sending"
            @sent="sent"
            @sentError="sentError"
            @sentMessageError="sentMessageError"
            @sendingData="sendingData"
            @sentData="sentData"
            @force="force"
            @newchat="newchat"
            @closeMetaPreview="closing"
            @clearRelationEvent="clearRelationEvent"
            @focused="focused"
            @cantchatcrypto="cantchatcrypto"
            :u="u"
            :chat="m_chat"
            :usersinfo="usersinfo"
            :relationEvent="relationEvent"
            v-if="!blockedUser && showInput"
            ref="chatInput"
        />

        <div v-if="showShareMessages" class="center shareEventsWrapper">
          <div @click="removeDataMessages()">
            <i class="far fa-trash-alt"></i>{{ localisationTitles.delete }}
          </div>
          <div @click="shareDataMessages()">
            <i class="fas fa-share-alt"></i> {{ localisationTitles.share }}
          </div>
        </div>

        <div class="blockedcaption" v-if="blockedUser && m_chat">
          <span>You have blocked this user</span>
        </div>

      </div>

    </div>

    <div class="encrypted" v-if="encrypted && membership != 'invite'" @mouseover="e => hoverEncrypt = true">
      <i class="fas fa-lock"></i>
    </div>

    <div v-if="hoverEncrypt" class="encryptedInfo" @mouseover="e => hoverEncrypt = true" @mouseleave="e => hoverEncrypt = false" @click="e => hoverEncrypt = !hoverEncrypt">
      <div id="slide">
        <div class="encryptedTxtIcon">
          <i class="fas fa-user-shield"></i>
          <span>{{ $t("caption.encrypted") }}</span>
        </div>
      </div>
    </div>

    <div class="attachements" v-if="attachements.length"> 
      <div class="attachementsWrapper">
        <attachement @cancel="e => abortSending(attachement.id)" v-for="attachement in attachements" :key="attachement.id" :attachement="attachement"/>
      </div>
    </div>

    </div>
    <userRoomStatus v-if="roomUserBanned" :chat="chat" :text="`You've have been banned in this room`"/>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->

<style lang="scss">
.shareEventsWrapper {
  background: rgb(250, 250, 250);
  border-radius: 30px;
  padding: 0.5em 1em;
  max-width: 622px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9em;

  i {
    margin-right: 10px;
    &.fa-trash-alt {
      color: rgb(244, 26, 77);
    }
    &.fa-share-alt {
      color: #00a3f7;
    }
  }
  div {
    transition: 0.3s;
    opacity: 0.6;
    cursor: pointer;
    &:hover {
      transition: 0.3s;
      opacity: 1;
    }
  }
}
</style>




















