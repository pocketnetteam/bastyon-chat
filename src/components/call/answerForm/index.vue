<template>
  <div class="form">
    <div class="title">Входящий звонок</div>
    <button class="btn ok" @click="answer">Принять</button>
    <button class="btn cancel" @click="decline">Сбросить</button>
    <div class="video">
      <div id="videoBackground">
        <div id="videoContainer">
          <video id="remote" ref="remote"></video>
        </div>
      </div>
      <div class="videoBackground">
        <div class="videoContainer">
          <video id="local" ref="local"></video>
        </div>
      </div>
    </div>
  </div>


</template>

<script src="./index.js"></script>

<style scoped lang="scss" src="./index.scss"></style>