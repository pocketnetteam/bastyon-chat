<template>
  <div id="teamroom" :class="{'bin' : pocketnet, 'bout' : !pocketnet, minimized, fix : pocketnet, active, mobile}">

    <div class="teamChatWrapper" @click="click">
        <div class="iconWrapper">
            <div class="logo">
              <img src="https://pocketnet.app/img/logo20.svg"/>
            </div>
            <div class="unseen" v-if="teamNotifications > 0"> {{ teamNotifications }} </div>
        </div>
        <div class="infoWrapper">
            <div class="infoName">
                <span>Bastyon</span>
            </div>
            <div class="previewMessage">
                <span v-if="pocketteammessages && pocketteammessages.length > 0">
                  {{ pocketteammessages[pocketteammessages.length - 1].previewText }}
                </span>
            </div>
        </div>
    </div>

  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>