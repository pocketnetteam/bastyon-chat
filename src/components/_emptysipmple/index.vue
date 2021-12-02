<template>
  <div id="_emptySimple">
  </div>
</template>

<style scoped lang="sass">

</style>

<script>
import { mapState } from 'vuex';

export default {
    name: '_emptySimple',
    props: {
        data : Object
    },
    computed: mapState({
        auth : state => state.auth,
    }),

    methods : {
        
    },
}
</script>