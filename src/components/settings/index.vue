<template>
  <div id="settings">
  
  
    <div class="infoPart">

      <div class="inputWrapper">
        <div class="label">
          <label for="theme">{{ $t("caption.theme") }}</label>
        </div>
        <div class="forInput">
          <select id="theme" @change="setTheme">
            <option 
              v-for="(name, i) in themes" 
              :key="i"
              :selected="i == theme" 
              :value="i"
            >
              {{name}}
            </option>
          </select>
        </div>
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





















