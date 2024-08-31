import { mapState } from "vuex";

export default {
	name: "date",
	props: ["date", "nofuture"],

	computed: mapState({
		auth: (state) => state.auth,

		label: function () {

			if(this.nofuture){
				if (moment.utc(this.date).unix() >= moment.utc(new Date()).unix()){
					return moment(moment.utc(new Date()).toDate()).local().fromNow();
				}
			}

			
			var value = this.date

			return this.$f.format_date(value)

			var today = moment()

			if ((today.diff(value, 'days')) === 0 && moment(value).day() == today.day()) {
				if ((today.diff(value, 'hours') < 12)) return moment(moment.utc(value).toDate()).local().fromNow();

				return  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: "2-digit", hour12: false })
			}

			var mvalue = moment(value)

			if (today.year() === mvalue.year())
				return mvalue.local().format('D MMMM, hh:mm')

			return mvalue.local().format('D MMMM YYYY')
		},
	}),
};


moment(moment.utc(new Date()).toDate()).local().fromNow()