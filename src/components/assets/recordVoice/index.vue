<template>
  <div ref="toggle" class="recordButton" :class="{active: isRecording}" @mousedown="record">
    <i class="icon fas " :class="isRecording ? 'fa-stop' : 'fa-microphone'"></i>
  </div>
</template>

<script src="./index.js"/>

<style scoped lang="scss" src="./index.scss"/>
