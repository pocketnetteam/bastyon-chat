<template>
  <div class="userspic" :class="{oneuser : users && users.length === 1}" v-if="users">

      <userpic v-if="users.length === 0" :userinfo="single" :status="single.status"/>
      <userpic :status="status[users[0].id]" :userinfo="users[0]" :unseen="unseen" v-if="users.length === 1" />
      
      <many :slidesPerView="slidesPerView" :status="status" :userinfo="users" :unseen="unseen" v-if="users.length > 1"/>

      <div class="unseen" v-if="unseen">
        {{ unseen > 99 ? '99' : unseen }}
      </div>
    </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->



































