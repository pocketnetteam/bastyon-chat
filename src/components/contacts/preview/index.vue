<template>
    <div class="contacts-preview">
      <div class="previewWrapper" :style="isUser">
        <div class="iconWrapper">
          <userpic :userinfo="contact" :mode="'Contacts'"/>
        </div>
        <div class="infoWrapper">
          <div class="summaryLine">

            <div class="caption">
              <span>{{ contact.name }}</span>
            </div>

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





















