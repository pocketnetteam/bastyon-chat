export default {
	name: 'list',
	props: {
		items: {
			type: [Array, Object],
			required: true,
		},


		simplelistClass : {
			type : String,
			default : 'simplelist'
		},

		transition : String

	},
	computed: {
		readyItems: function () {
			return this.items;
		}
	},

	created : function(){

	},

	data : function(){
		return {
		}
	},

	methods: {
		
		click : function(item){
			this.$emit('click', item)
		},

		scroll : function(prop, value){
			if(this.$refs.simplelist) this.$refs.simplelist[prop] = value
		},
		
		touchhold : function(item, e){
			this.$emit('touchhold', item)

		}
	}
}