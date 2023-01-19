<template>
  <div
    id="search"
    :class="{
      bin: pocketnet,
      bout: !pocketnet,
      minimized,
      fix: pocketnet,
      active,
      collapsed,
    }"
  >
    <div class="searchWrapper">
      <div class="iconWrapper">
        <i
          v-if="!chat || (!searchTxt && (collapsed === null || collapsed))"
          class="fas fa-search"
          @click="toggle"
        ></i>
        <i v-else class="fas fa-angle-left" @click="toggle"></i>
      </div>

      <div class="inputWrapper">
        <input
          ref="input"
          :placeholder="placeholder || this.$i18n.t('caption.search')"
          @keyup="change"
          @input="change"
          :value="searchTxt"
          @focus="focused"
          @blur="blured"
          type="text"
        />
      </div>

      <div class="iconWrapper right" v-if="searchTxt">
        <i class="fas fa-times" @click="clear"></i>
      </div>

      <div class="matches" v-if="chat && matches.all.length && !collapsed">
        <span class="current-match"
          >{{ matches.current + 1 }}/{{ matches.all.length }}</span
        >
        <i class="prev-match fas fa-chevron-down" @click="prevMatch"></i>
        <i class="next-match fas fa-chevron-up" @click="nextMatch"></i>
      </div>
    </div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
