<template>
<div class="listmenuwithupload">
    <listmenu :items="items" @click="click" :onlyimit="true">
        <template v-slot:default="slotProps">

            <div class="menuitem" :class="slotProps.item.class || ''" v-if="!slotProps.item.upload">
                <i :class="slotProps.item.icon" />
                <span>{{$t(slotProps.item.text)}}</span>
            </div>

            <upload
                @start="(files) => slotProps.item.upload.start(slotProps.item, files)"
                @uploaded="(data) => slotProps.item.upload.uploaded(slotProps.item, data)"
                @uploadedAll="(result) => uploadedAll(slotProps.item, result)"
                @error="(error) => slotProps.item.upload.error(slotProps.item, error)"
                :onlyimage="slotProps.item.upload.onlyimage"
                :multiple="slotProps.item.upload.multiple"
                :extensions="slotProps.item.upload.extensions"
                :images="slotProps.item.upload.images"
                v-else
            >
                <template v-slot:content>
                    <div class="menuitem">
                        <i :class="slotProps.item.icon" />
                        <span>{{$t(slotProps.item.text)}}</span>
                    </div>
                </template>

                <template v-slot:dropzone></template>
            </upload>

        </template>
    </listmenu>
</div>
</template>

<style scoped lang="sass">
.menuitem
    display: flex
    padding : 2 * $r
    align-items: center
    background: srgb(--neutral-grad-0)
    color : srgb(--neutral-grad-4)
    margin-bottom: $r
    border-radius: 22px

    &.good
        color : srgb(--color-good)
    &.bad
        color : srgb(--color-bad)
    i
        width: 33px
        text-align: center
        margin-right: $r

::v-deep
    .simplelist
        .item
            &:nth-last-child(1)
                .menuitem
                    margin-bottom : 0           

@media (pointer:fine)
    .menuitem
        cursor: pointer
        +transition(0.3s)

        &:hover
            background: srgb(--neutral-grad-1)     
</style>

<script>
import {
    mapState
} from 'vuex';
import upload from "@/components/assets/upload/index.vue";
export default {
    name: 'listmenuwithupload',
    props: {
        items : Array,
        close : Function
    },
    computed: mapState({
        auth: state => state.auth,
    }),

    components : {
        upload
    },

    methods: {
        uploadedAll : function(item, result){
            item.upload.uploadedAll(item, result)

            if(this.close) this.close()

            else
                this.$emit('close')
        },
        click : function(item){
            if(item.upload) return

            if(item.action) {
                if (typeof item.action == 'function'){
                    item.action()
                }
                else{
                    this.$emit('action', item.action)
                }
            }

            if(this.close) this.close()

            else
                this.$emit('close')

        }
    },
}
</script>
