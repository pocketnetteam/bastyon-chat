<template>
  <div class="chatPreview">
    <div class="work">
      <div class="previewWrapper">
        <div class="users" v-if="users && users.length">
          <div
            class="work"
            v-for="user in users"
            :key="user.id"
            v-if="!empty(user)"
          >
            <div class="userinfoWrapper" :class="{ filter: undefinedRoom }">
              <userView :userinfo="user" v-if="user.name" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
