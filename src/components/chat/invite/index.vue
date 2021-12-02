<template>
  <div id="chatinvite" :class="{ minimized, active}">
    <div class="selectedtype">

      <div class="completewrapper">
        <button @click="complete()" class="button small rounded" :class="{orange : cancomplete, ghost : !cancomplete}">
          Invite
        </button>
      </div>
      
    </div>

    <div class="creationbody">

        <div class="contactswrapper">
          <contacts :mode="'Selectmany'" @selectedUsers="selectedUsers"/>
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





















