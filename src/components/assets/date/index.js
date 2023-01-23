import { mapState } from "vuex";

export default {
	name: "date",
	props: ["date"],

	computed: mapState({
		auth: (state) => state.auth,

		label: function () {
			moment.locale(this.$i18n.locale);

			return moment(moment.utc(this.date).toDate()).local().fromNow();
		},
	}),
};
