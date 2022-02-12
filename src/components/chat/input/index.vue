<template>
  <div id="chatInput">
    <div class="work" v-if="ready">

      <div class="inputWrapper" v-if="chat">


        <div class="tipusers" v-if="tipusers.length">

          <div @click="insertuser(user)" class="previewWrapperExt" :class="{selected : tipuserindex == i}" :key="user.id" v-for="(user, i) in tipusers">
            <preview :contact="user" mode=""/>
          </div>
          
        </div>


        <div class="center">

          <InputField
            ref="newinput"

            @transaction="sendtransaction"
            @chatMessage="sendinput"
            @setMetaUrl="emitUrl"
            @emptyInput="emitInputData"
            @FilledInput="HideUploadPic"
            @base64="pasteImage"
            @focused="focused"
            @tipsearchrequest="tipBySearch"
            @browsetip="browsetip"
            @selectcurrenttip="selectcurrenttip"

            :storagekey="'chatinput' + chat.roomId"
            :tipusers="tipusers"
          />

          <div class="left" v-if="upload && chat">
            <div class="iconbutton">
              <dropdownMenu
                ref="dropdownMenu"
                :menuItems="menuItems"
                :rowObject="{}"
                icon="fas fa-plus"
              >
                <template v-slot:default="slotProps">
                  <div class="menu-item" @click="menuItemClick(slotProps.item)" v-if="!slotProps.item.upload">

                    <div class="iconWrapper">
                      <i v-if="slotProps.item.icon" :class="slotProps.item.icon"></i>
                    </div>

                    <div class="title">
                      {{ slotProps.item.title }}
                    </div>
                    
                  </div>

                  <upload 

                    @start="(files) => uploadStart(slotProps.item, files)"
                    @uploaded="(data) => uploadUploaded(slotProps.item, data)"
                    @uploadedAll="(result) => uploadUploadedAll(slotProps.item, result)"
                    @error="(error) => uploadError(slotProps.item, error)"

                    :multiple="slotProps.item.upload.multiple"
                    :extensions="slotProps.item.upload.extensions"
                    :images="slotProps.item.upload.images"

                  v-else>

                    <template v-slot:content>
                      <div class="menu-item">
                        <div class="iconWrapper">
                          <i v-if="slotProps.item.icon" :class="slotProps.item.icon"></i>
                        </div>

                        <div class="title">
                          {{ slotProps.item.title }}
                        </div>

                      </div>
                    </template>

                    <template v-slot:dropzone></template>

                  </upload>

                </template>
              </dropdownMenu>
            </div>
          </div>

        </div>
       
      </div>
      
    </div>
    
    <div class="notready" v-else>
      <linepreloader />
    </div>

    
  
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->





















