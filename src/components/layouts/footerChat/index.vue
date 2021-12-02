<template>
  <div class="footer-chat"
    :class="{'bin' : pocketnet, 'bout' : !pocketnet, minimized, fix : pocketnet, active}"
  >

    <div class="work">


      <div class="menuItems">


          <div class="menuItem bottom-nav__icon"  :class="{active : activecontacts}" @click="gotona('/contacts')">
            <div class="icon">
              <i class="fas fa-user-friends"></i>
            </div>
            <!--<div class="label">
              Contacts
            </div>-->
          </div>

          <div class="menuItem bottom-nav__icon" :class="{active : activechats}" @click="gotona('/chats')">
            <div class="icon">
              <i class="fas fa-comments"></i>
            </div>
            <!--<div class="label">
              Chats
            </div>-->
            <div class="unseen chatMessages" v-if="notificationCount">
              {{notificationCount > 99 ? '99' : notificationCount}}
            </div>
          </div>

          <div class="menuItem bottom-nav__icon" v-if="mobile" @click="movefromchat">
            <div class="icon">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>

        <!--<router-link to="/calls" class="bottom-nav__icon">
          <div class="menuItem">
            <i class="fas fa-phone-square"></i>
          </div>
        </router-link>

        <router-link to="/settings" class="bottom-nav__icon">
          <div class="menuItem">
            <div class="icon">
              <i class="fas fa-cog"></i>
            </div>
            <div class="label">
              Settings
            </div>
          </div>
        </router-link>-->

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