<template>
  <transition name="fade">
    <div
      id="modal"
      :class="{
        bin: pocketnet,
        bout: !pocketnet,
        minimized: !minimized,
        active,
        mobile,
      }"
    >
      <div class="modal-backdrop" @click="close"></div>
      <div class="modal-wrapper">
        <div
          class="modal"
          role="dialog"
          aria-labelledby="modalTitle"
          aria-describedby="modalDescription"
        >
          <div class="modal-header">
            <slot name="header">
              {{ $t("caption.header") }}
            </slot>
          </div>

          <div class="modal-body" id="modalDescription">
            <slot name="body"> </slot>
          </div>

          <div class="modal-footer" v-if="displayFooter">
            <!--          <div class="eff">-->
            <!--            <i class="fas fa-circle"></i>-->
            <!--          </div>-->
          </div>

          <div class="modal-close" @click="close">
            <i class="fas fa-times"></i>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script src="./index.js"></script>
<style lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->
