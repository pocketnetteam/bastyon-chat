<template>
  <div class="eventsMessage">

    <div class="reference referenceTop" :class="{my}"  v-if="referenceshowed && reference && !preview && !fromreference">

      <eventsEvent
        :event="reference"
        :chat="chat"
        :preview="false"
        :fromreference="true"
      />

    </div>

    <div v-touch:longtap="dropDownMenuShow" :class="{referenceshowed, showmeta : showmeta, my,'messageRow': 'messageRow', urlpreview : urlpreview, allscreen : urlpreview || content.msgtype === 'm.image'|| file}" :my="my" v-if="!preview && content.msgtype !== 'm.notice'">

      <div class="timeWrapper" v-if="(urlpreview || imageUrl || content.msgtype === 'm.image') || (showmeta && (my)) || file">
        <span>
          {{ format_date(origin._localTimestamp) || "Now" }}
        </span>
      </div>

      <div class="actionsWrapper" v-if="content.msgtype !== 'm.file'" @click="setmenu">
        <i class="fas fa-ellipsis-h"></i>
       <!-- <dropdownMenu
          @itemClicked="menuItemClickHandler"
          @menuIsVisible="menuIsVisibleHandler"
          ref="dropdownMenu"
          :menuItems="menuItems"
          :rowObject="{}"
          icon="fas fa-ellipsis-h"
        />-->
     
      </div>
    
      <div class="iconWrapper" v-if="!my || showmyicon" @click="core.mtrx.opencontact(userinfo)">

        <!--<router-link v-if="chat" :to="'contact?id=' + userinfo.id">-->
          <userpic :userinfo="userinfo"/>
        <!--</router-link>-->
      </div>

      <div class="fromimagesfiles" v-if="(content.from || imageFrom) && (file || (content.msgtype === 'm.image' && imageUrl))">
          <div class="fromCaption">
            <i class="fas fa-share-alt"></i> <span>{{ $t("caption.messagefrom") }}</span>
          </div>
      </div>

      <div class="messageImg" v-if="content.msgtype === 'm.image'">

        <div class="" v-if="imageUrl">

          <div class="encryptedDataIcon" v-if="encryptedData"><i class="fas fa-lock"></i></div>
          <div class="imgMsg">
            <div
              class="showImage"
              :style="imagePaddingStyle(content)"
              @click="openImageGallery(origin)"
            >
              <div class="abswrapper">
              <img :src="imageUrl" alt="" v-images-loaded:on.loaded="imagesLoaded">
              </div>
            </div>
          </div>

        </div>

        <div class="preloaderImage" :style="imagePaddingStyle(content)" v-else>
          <div class="abswrapper"><linepreloader /></div>
        </div>
      </div>

      <div class="maxcontent" :class="{'my' : my }" v-if="content.msgtype === 'm.encrypted' && !textWithoutLinks && badenctypted">
        <div class="badenctyptedText">
          <span>{{ $t("caption.unabletoDecrypt") }}</span> <i class="fas fa-undo decryptagain" @click="decryptagain"></i>
        </div>
      </div>

      <div class="maxcontent" :class="{'my' : my }" v-if="(content.msgtype === 'm.text' || content.msgtype === 'm.encrypted') && textWithoutLinks">
        <div class="messageText">

          <div class="edited" v-if="edited">
            <i class="fas fa-pen"></i> {{ $t("caption.edited") }}
          </div>
          <div class="msgtext">
            <IncomingMessage :message="textWithoutLinks" :roomId="chat.roomId"></IncomingMessage>
          </div>
          <div class="sendername" v-if="(!content.from && !my && showmeta) || (showmyicon && !my)">
            <span><b>{{userinfo.name}}</b></span> 
            &middot;
            <span>
              {{ format_date(origin._localTimestamp) || "Now" }}
            </span>
          </div>
          <div class="reference showreference" @click="showreference" v-if="reference && !preview && !fromreference">

            <eventsEvent
              v-if="!referenceshowed"
              :event="reference"
              :chat="chat"
              :preview="true"
            />

            <div class="referenceCaption">
              <span v-if="!referenceshowed"><i class="fas fa-share"></i></span>
              <button class="button ghost small" v-else>Hide</button>
            </div>

          </div>

          <div class="from" v-if="content.from">
            <div class="fromCaption">
              <i class="fas fa-share-alt"></i> <span>{{ $t("caption.messagefrom") }}</span>
            </div>
          </div>
          
        </div>
        
      </div>

      <div class="filePreview" v-if="file">
        <fileMessage :encryptedData="encryptedData" :file="file" :downloaded="downloaded" @download="download"/>
        <div class="encryptedDataIcon" v-if="encryptedData"><i class="fas fa-lock"></i></div>

        <div class="badencrypted" v-if="error">
          <span>{{ $t("caption.unabletoDecrypt") }}</span>
        </div>
      </div>

      <div class="linkPreview" v-if="urlpreview">
        <div class="pr" v-if="!sending">
          <url :url="urlpreview" :urllink="urlpreview" :preview="true" @updatedSize="updatedSize" v-if="!origin.localRedactionEvent() && !origin.getRedactionEvent()"/>
        </div>
        <div v-else>
          <linepreloader  />
        </div>
      </div>
      
    </div>

    <div class="messagePreview" v-if="preview">
      <listPreview :my="my" :event="origin" :decryptEvent="decryptEvent" :userinfo="userinfo" :chat="chat" :readed="readed" />
    </div>

    <div class="statusWrapper" v-if="my && readed && !preview && !fromreference">
      <div class="my">
        <i class="fas fa-check-double" ></i> <span>{{$t("caption.messageRead")}}</span>
        <!--<date v-if="readed.data" :date="readed.data.ts"/>-->
      </div>
    </div>

  </div>

</template>


<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<style scoped lang="sass" src="./themes/theme_white.sass"></style>
<style scoped lang="sass" src="./themes/theme_black.sass"></style>
<!-- THEMES END -->
