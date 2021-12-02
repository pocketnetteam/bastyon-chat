<template>
  <div id="settingsTopheader">

    <topheader>
      <template v-slot:left>
        <backButton action="back"/>
      </template>
    
      <template v-slot:info>
        <span>{{ $t("caption.settings") }}</span>
      </template>
      <template v-slot:right>
       
      </template>
    </topheader>
  
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->





















