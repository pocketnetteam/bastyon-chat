import { mapState } from 'vuex';

export default {
    name: 'settings',
    props: {},

    data: function() {

        return {
            loading: false,

            settings : [

                {
                    id : 'pin',
                    checked : 'yes',
                    unchecked : 'no',
                    label : 'settings_pin'
                },

                {
                    id : 'read',
                    checked : 'yes',
                    unchecked : 'no',
                    label : 'settings_read'
                },

            ]
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
        theme: state => state.theme,

        settings_pin : state => state.pinchat,
        settings_read : state => !state.dontreadreceipts,
        pocketnet : state => state.pocketnet

    }),

    methods: {
        setTheme: function(evt) {
            var theme = evt.target.value
            this.$store.commit('theme', { value: theme, root: this.$root.$el });
        },

        set_settings_pin : function(value){
            this.$store.commit('pinchat', value);
        },  

        set_settings_read : function(value){
            this.$store.commit('dontreadreceipts', !value);
        },  

        set_settings: function(id, e){
            return this['set_settings_' + id](e.value)
        },

        get_settings : function(id){
            return this['settings_' + id]
        },
    },
}