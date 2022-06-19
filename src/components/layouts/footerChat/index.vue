<template>
  <div
    class="footer-chat"
    :class="{
      bin: pocketnet,
      bout: !pocketnet,
      minimized,
      fix: pocketnet,
      active,
    }"
  >
    <div class="work">
      <div class="menuItems">
        <div
          class="menuItem bottom-nav__icon"
          :class="{ active: activecontacts }"
          @click="gotona('contacts')"
        >
          <div class="icon">
            <i class="fas fa-user-friends"></i>
          </div>
          <div class="label">
            {{ $t("caption.contacts") }}
          </div>
        </div>

        <div
          class="menuItem bottom-nav__icon"
          :class="{ active: activechats }"
          @click="gotona('chats')"
        >
          <div class="icon">
            <i class="fas fa-comments"></i>
          </div>
          <div class="label">
            {{ $t("caption.chats") }}
          </div>
          <div class="unseen chatMessages" v-if="notificationCount">
            {{ notificationCount > 99 ? "99" : notificationCount }}
          </div>
        </div>

        <div
          class="menuItem bottom-nav__icon"
          v-if="!pocketnet"
          :class="{ active: activesettings }"
          @click="gotona('settings')"
        >
          <div class="icon">
            <i class="fas fa-cog"></i>
          </div>
          <div class="label">
            {{ $t("caption.settings") }}
          </div>
        </div>

        <!--<div class="menuItem bottom-nav__icon" v-if="mobile" @click="movefromchat">
            <div class="icon">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>-->

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
<!-- THEMES END -->

<style lang="scss" scoped>
@media only screen and (min-width: 768px) {
  .footer-chat {
    width: 40%;
    max-width: 400px;
  }
}
</style>
