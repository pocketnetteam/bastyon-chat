<template>
  <div class="msgAction">
    <div class="contentAction" :style="{ margin: position }">
      <ul>
        <li>
          <a href="google.com"
            >{{ $t("button.reply") }} <i class="fas fa-reply"></i
          ></a>
        </li>
        <li>{{ $t("button.copy") }} <i class="far fa-copy"></i></li>
        <li>{{ $t("button.forward") }} <i class="fas fa-share"></i></li>
        <li>{{ $t("button.delete") }} <i class="far fa-trash-alt"></i></li>
      </ul>
    </div>
  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>
