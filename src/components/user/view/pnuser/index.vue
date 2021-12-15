<template>
  <div id="userViewPnuser" :class="{'isBlocked': blocked}" >

    <div class="haskeys" v-if="userinfo.keys && userinfo.keys.length">
      <i class="fas fa-lock"></i>
    </div>

    <div class="name">
      <span>
        {{ userinfo.name }}
      </span>
    </div>

    <div class="imageWrapper">
      <userpic mode="Contact" :userinfo="userinfo" :blocked="blocked"/>
    </div>

    <div class="gotoprofile" v-if="activeuser.id != userinfo.id">
        <button class="button small black rounded" @click="gotopocketnetprofile">
          {{ $t("button.goToPocketnetProfile") }}
        </button>
    </div>

    <div class="info">

      <div class="infoPart" v-if="userinfo.source">
        <div class="label">
          <span>
            {{ $t("caption.followers") }} 
          </span>
        </div>
        <div class="value">
          <span>{{ userinfo.source.subscribers_count }}</span>
        </div>
        
      </div>

      <div class="infoPart" v-if="userinfo.source &&  userinfo.source.reputation.toFixed">

        <div class="label">
          <span>
            {{ $t("caption.reputation") }}
          </span>
        </div>
        <div class="value">
          <span>{{ userinfo.source.reputation.toFixed(1) }}</span>
        </div>

        
      </div>

      <div class="infoPart" v-if="userinfo.source">

        <div class="label">
          <span>
            {{ $t("caption.following") }}
          </span>
        </div>
        <div class="value">
          <span>{{ userinfo.source.subscribes_count }}</span>
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





















