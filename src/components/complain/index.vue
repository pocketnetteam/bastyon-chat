<template>
  <div id="complain">
    <div class="wrapper" v-if="!loading">
      <div class="caption">
        <span>Your e-mail address</span>
      </div>

      <div class="formWrapper">
        <input
          ref="youremail"
          type="email"
          :value="youremail"
          @change="setyouremail"
        />
      </div>

      <div class="caption">
        <span>State the reason for your complaint</span>
      </div>

      <div class="formWrapper">
        <textarea ref="reason" :value="reason" @change="setvalue"></textarea>
      </div>

      <div class="sendWrapper">
        <button class="button orange small rounded" @click="send">Send</button>
      </div>
    </div>
    <div v-else>
      <div class="preloaderwrapperCpm">
        <linepreloader />
      </div>
    </div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
