<template>
  <div class="recordProgress">
    <div v-if="isRecording" class="indicator" :class="{'recording': isRecording}"></div>
    <div v-else class="del" @click="clear">
      <i class="fas fa-trash"></i>
    </div>
    <div class="timer">{{timer}}</div>
    <div class="graph">
      <canvas id="canvas" :width="width" height="60"/>
    </div>
  </div>
</template>

<script src="./index.js"/>

<style scoped lang="scss" src="./index.scss"/>
