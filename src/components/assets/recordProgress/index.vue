<template>
  <div class="recordProgress">
    <div class="indicatorWrapper" v-if="isRecording">
      <div class="indicator" :class="{'recording': isRecording}"></div>
    </div>
    

    <div v-else class="del" @click="clear">
      <i class="fas fa-trash"></i>
    </div>

    <div class="timer">{{timer}}</div>
    <div class="graph" ref="graph">
      <canvas ref="canvas" id="canvas" :width="width" height="20"/>
    </div>

    <div v-show="isRecording && opacity" class="cancel" ref="cancel">
      <span>Slide left to cancel</span>
    </div>

  </div>
</template>

<script src="./index.js"/>

<style scoped lang="scss" src="./index.scss"/>
