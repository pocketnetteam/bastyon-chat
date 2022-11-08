<template>
  <div id="chatsTopheader">
    <topheader :sideSlotsWidth="100">
      <template v-slot:left>
        <div
          class="iconbutton"
          @click="minimizeall"
          v-if="(!minimized || active) && pocketnet"
        >
          <i class="fas fa-times"></i>
        </div>
      </template>

      <template v-slot:info>
        <span>{{ title }}</span>
      </template>

      <template v-slot:right>
        <!-- <div class="iconbutton"><i class="fas fa-ellipsis-h"></i></div> -->
      </template>
    </topheader>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
