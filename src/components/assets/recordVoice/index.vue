<template>
  <div class="recordButton_wrapper" :class="{disabled: disabled}">
    <div ref="holder" class="recordButton_holder" :class="{hold: isHold}">
      <i class="icon fas" :class="isHold ? 'fa-lock': 'fa-lock-open'"></i>
    </div>
    <div ref="toggle" class="recordButton_toggle" :class="{active: isRecording, hold: isHold }" @mousedown="record">
      <i class="icon fas" :class="isHold ? 'fa-stop': 'fa-microphone'"></i>
    </div>
  </div>
</template>

<script src="./index.js"/>

<style scoped lang="scss" src="./index.scss"/>
