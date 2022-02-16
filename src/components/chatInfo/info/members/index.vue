<template>
  <div class="membersList" v-if="membersList">
    <div class="roomMember" :class="user.membership" v-for="(user, index) in membersList" :key="user.userId" @click="core.mtrx.opencontact(userinfo(user))" >

      <div class="leftWrapper">
        <div class="avatarNameWrapper">
          <userpic :userinfo="userinfo(user)" :status="user.membership"/>
        </div>
        <div class="nameRole">
          <span class="name" >{{ userinfo(user).name || '' }}</span>

          <span class="memberRole" v-if="user.powerLevel">{{ $t('caption.' + role(user)) }}</span>
          <span class="memberRole" v-if="user.userId == meid">You</span>
        </div>
      </div>

      <div v-if="menu(user).length">

        <div class="rightWrapper">
          <dropdownMenu
              @itemClicked="menuItemClickHandler"
              ref="dropdownMenu"
              :menuItems="menu(user)"
              :rowObject="{user: user, index: index}"
              icon="fas fa-ellipsis-h"
          />
        </div>

      </div>
    </div>

  </div>

  <div class="empty" v-else>
    <span>List Empty</span>
  </div>

</template>
<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>