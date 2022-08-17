import { mapState } from 'vuex';

export default {
	name: "recordVoice",
	props: {
		isRecording: {
			type: Boolean,
			required: true
		},
		prepareRecording: {
			type: Boolean
		},
		disabled: Boolean,
	},
	data() {
		return {
			start: 0,
			isHold: false,
			direction: null
		}
	},
	computed: {
		...mapState({
			mobile: state => state.mobile,
		})
	},
	mounted() {
	
	},
	beforeDestroy() {

		document.removeEventListener('mousemove', this.handleMove)
		document.removeEventListener('touchmove', this.handleMove)

		if (this.isRecording) {
			this.$emit('onRecordingStop', {cancel : true})
		}
	},
	methods: {

		mouseup : function(e){
			if(!this.mobile)
				this.handleTouchEnd(e)
		},

		mousedown : function(e){
			if(!this.mobile)
				this.handleTouchStart(e)
		},
		
		handleTouchStart(e) {

			console.log('handleTouchStart')
			if(!this.isRecording) {
				this.$emit('onRecordingStart')
			}

			else{
				if(this.isHold) return
			}

			this.start = {
				Y: e.changedTouches ? e.changedTouches[0].pageY : e.pageY,
				X: e.changedTouches ? e.changedTouches[0].pageX : e.pageX
			}

			if(!this.mobile)
				document.addEventListener('mousemove', this.handleMove)
			else
				document.addEventListener('touchmove', this.handleMove)

		},
		handleTouchEnd(e) {
			console.log('handleTouchEnd')

			if (this.isHold) return

			if (this.isRecording || this.prepareRecording) {
				this.$emit('onRecordingStop', {
					sendnow : true
				})
			}

			document.removeEventListener('mousemove', this.handleMove)
			document.removeEventListener('touchmove', this.handleMove)

		},

		handleMove(e) {

			if(!this.isRecording) return

			let deltaY = this.start.Y - e.pageY
			let deltaX = this.start.X - e.pageX

			if (e?.changedTouches?.length) {
				deltaY = this.start.Y - e.changedTouches[0].pageY
				deltaX = this.start.X - e.changedTouches[0].pageX
			}

			if (deltaY > 5 && deltaX < 5) {
				this.direction = 'Y'
			} else {
				this.direction = 'X'
			}


			if (deltaY > 5 && this.direction === 'Y') {

				if(!this.$refs.holder.classList.contains('active'))
					this.$refs.holder.classList.add('active')

				this.$refs.toggle.style.transform = `translate(0,-${deltaY}px)`

				if (deltaY > 70) {
					this.$refs.toggle.style.transform = `translate(0,0)`

					document.removeEventListener('mousemove', this.handleMove)
					document.removeEventListener('touchmove', this.handleMove)
					//document.removeEventListener('mouseup', this.handleTouchEnd)

					this.isHold = true
				}


			} else if (deltaX > 5 && this.direction === 'X') {

				this.$refs.toggle.style.transform = `translate(-${deltaX}px, 0)`

				if(!this.$refs.holder.classList.contains('outside'))
					this.$refs.toggle.classList.add('outside')

				this.$emit('canceling', (deltaX - 5) / 130)
				
				if (deltaX > 130) {
					this.$refs.toggle.style.transform = `translate(0,0)`
					document.removeEventListener('mousemove', this.handleMove)
					document.removeEventListener('touchmove', this.handleMove)
					//document.removeEventListener('mouseup', this.handleTouchEnd)
					this.$emit('onRecordingStop', { cancel: true })
					this.$emit('onClear')
				}

			}
			else {
				this.$refs.toggle.style.transform = `translate(0,0)`
				this.$refs.toggle.classList.remove('outside')
				this.$refs.holder.classList.remove('active')
			}
		},

		recordEnd(e) {

			if (this.isRecording && this.isHold) {

				this.$emit('onRecordingStop', {})
				this.isHold = false

				return

			}

		},

		
	}
}