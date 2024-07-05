<template>
	<div class="recordButton_wrapper">
		<div ref="holder" class="recordButton_holder" :class="{ hold: isHold }">
			<i class="icon fas" :class="isHold ? 'fa-lock' : 'fa-lock-open'"></i>
		</div>

		<div
			ref="toggle"
			class="recordButton_micro recordButton_main"
			v-if="!isHold"
			:class="{ active: isRecording, disabled: disabled }"
			@mousedown="mousedown"
			@mouseup="mouseup"
			@touchstart="handleTouchStart"
			@touchend="handleTouchEnd"
			@touchcancel="handleTouchEnd"
		>
			<i class="icon fas fa-microphone"></i>
		</div>

		<div
			ref="stop"
			class="recordButton_stop recordButton_main"
			v-if="isHold"
			@click="recordEnd"
		>
			<i class="icon fas fa-stop"></i>
		</div>
	</div>
</template>

<script src="./index.js" />

<style scoped lang="sass" src="./index.sass" />
