export default {
	name : "answerForm.vue",
	data : {
		lastError : null
	},
	mounted(){
		this.addListeners(this.call);
		this.setVideo(this.call)
	},
	methods : {
		answer(){
			console.log("Answering call...");
			console.log("Call => %s", this.call);
			this.setVideo(this.call)
			this.call.answer();

		},
		decline(){
			console.log("Hanging up call...");
			console.log("Call => %s", this.call);
			this.call.hangup();
		},

		setVideo(call){
			console.log(call)
			console.log('setvideo')
			call.setRemoteVideoElement(this.$refs.remote)
			call.setLocalVideoElement(this.$refs.local)
		},

		addListeners(call){
			call.on("hangup", () => {
				console.log('hangup')
				this.$store.dispatch('HANGUP_CALL')
			});
			call.on("error", function(err){
				console.log(err)
				this.lastError = err.message;
				call.hangup();
			});
		}
	},

	computed : {
		call : function(){
			return this.$store.state.activeCall
		}
	}
}