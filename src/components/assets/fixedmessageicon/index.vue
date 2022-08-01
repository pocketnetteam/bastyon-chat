<template>
  <div
    id="wai-fixedmessageicon"
    :class="{
      bin: pocketnet,
      bout: !pocketnet,
      minimized,
      fix: pocketnet,
      active,
    }"
  >
    <div class="wrapper">
      <div class="table">
        <div class="cell">
          <div class="iconWrapper" v-if="icon">
            <sweetalert :icon="icon" />
          </div>

          <div class="message" v-if="message">
            <div>{{ message }}</div>
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
