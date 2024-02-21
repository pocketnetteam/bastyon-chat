import { mapState } from "vuex";

export default {
	name: "date",
	props: ["date", "nofuture"],

	computed: mapState({
		auth: (state) => state.auth,

		label: function () {
			moment.locale(this.$i18n.locale);

			if(this.nofuture){
				if (moment.utc(this.date).unix() >= moment.utc(new Date()).unix()){
					return moment(moment.utc(new Date()).toDate()).local().fromNow();
				}
			}

			return moment(moment.utc(this.date).toDate()).local().fromNow();
		},
	}),
};


moment(moment.utc(new Date()).toDate()).local().fromNow()