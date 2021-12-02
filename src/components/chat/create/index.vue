<template>
  <div id="chatcreate">

    <div class="selecttype">

      <div class="types" v-if="!type">
        <div class="type" @click="e => selecttype(type.id)" v-for="type in types" :key="type.id">
          <div class="icon"><i :class="type.icon"></i></div><div><span>{{$t('type.' + type.id)}}</span></div></div>
      </div>
      <div class="selectedtype" v-if="type">

        <div class="icon" @click="unselecttype">
          <i class="fas fa-arrow-left"></i>
        </div>

        <div class="label">
          {{$t('typelabel.' + type.id)}}
        </div>

        <div class="completewrapper">
          <button @click="complete()" class="button small rounded" :class="{orange : cancomplete, ghost : !cancomplete}">
            {{$t('caption.create')}} <i :class="type.icon"></i> <span v-if="selectedLength">{{selectedLength}}</span>
          </button>
        </div>
        
      </div>

      <div class="creationbody">

          <div class="groupsettigns" v-if="type">
            <div class="namebuttoncreate">

              <div class="groupNameInput">
                <label>
                  <input type="text" v-model="groupName" :placeholder="type.id === 'privategroup'? this.$i18n.t('caption.addGroupNamePlaceHolder') : this.$i18n.t('caption.addPublicChatName')"/>
                </label>
              </div>

            </div>
          </div>

          <div class="contactswrapper oneonone" v-if="!type">
            <contacts :mode="'Select'" @select="selectoneuser" />
          </div>

          <div class="contactswrapper" v-if="type">
            <contacts :mode="'Selectmany'" @selectedUsers="selectedUsers"/>
          </div>
          
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





















