import { mapState } from 'vuex';
import f from '@/application/functions'
export default {
    name: 'preloader',
    props: {
    },

    computed : mapState({
        pocketnet: state => state.pocketnet,
        minimized : state => state.minimized,
        active : state => state.active,
        platform : function(){
            return f.deep(window, 'device.platform') || 'browser'
        },
    })
}