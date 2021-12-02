import { mapState } from 'vuex';

export default {
    name: 'settings',
    props: {},

    data: function() {

        return {
            loading: false
        }

    },

    created: () => {

    },

    watch: {
        //$route: 'getdata'
    },
    computed: mapState({
        auth: state => state.auth,
        themes: state => state.themes,
        theme: state => state.theme
    }),

    methods: {
        setTheme: function(evt) {
            var theme = evt.target.value


            this.$store.commit('theme', { value: theme, root: this.$root.$el });
        }
    },
}