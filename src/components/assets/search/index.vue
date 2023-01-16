<template>
  <div id="search" :class="{'bin' : pocketnet, 'bout' : !pocketnet, minimized, fix : pocketnet, active, collapsed}">
    
      <div class="searchWrapper">

        <div class="inputWrapper">
          <input ref="input" :placeholder="placeholder || this.$i18n.t('caption.search')" @keyup="change" @input="change" :value="searchTxt" @focus="focused" @blur="blured" type="text"/>
        </div>

        <div class="matches" v-if="matches.all.length && !collapsed">
          <i class="prev-match fas fa-chevron-left" @click="prevMatch"></i>
          <span class="current-match">{{ matches.current+1 }}/{{ matches.all.length }}</span>
          <i class="next-match fas fa-chevron-right" @click="nextMatch"></i>
        </div>

        <div class="iconWrapper" v-if="!searchTxt">
          <i v-if="collapsed === null || collapsed" class="fas fa-search" @click="toggle"></i>
          <i v-else class="fas fa-chevron-right" @click="toggle"></i>
        </div>

        <div class="iconWrapper" v-if="searchTxt">
          <i class="fas fa-times" @click="clear"></i>
        </div>

      </div>
  
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->





















