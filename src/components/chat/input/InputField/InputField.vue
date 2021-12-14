<template>
    <div class="input-component">
        <div class="input-wrapper">
            <div class="textarea">
                <textarea
                    id="textInput"
                    :value="text"
                    ref="textarea"
                    class="chat-input"
                    type="text"
                    row="1"
                    spellcheck="true"
                    @focus="focused"
                    @keydown.enter.prevent.exact="send_text_enter"
                    @input="textchange"
                    @paste="paste_image"
                    placeholder="Send message"                   
                ></textarea>
                <transition name="fade" mode="out-in" v-if="!mobile">
                    <picker
                        :data="emojiIndex"
                        v-show="display_emoji"
                        @select="insert_emoji" 
                        :style="{ width: '325px', position: 'absolute', bottom: '32px', right: '-60px', fontSize: '0.8em', fontFamily: 'Segoe UI' }" 
                        :exclude="exclude"
                        :showPreview="false"
                        :showSearch="false"
                        :native="true"
                        set="emojione"
                        v-click-outside="close_emoji_picker"
                    />
                </transition>
            </div>
        </div>

  

        <div class="iconbutton emojipicker" @click="toggle_emoji_picker()" v-if="!mobile">
            <div class="leftdummy">
                <div class="idummy">
                    <i v-if="display_emoji" class="fas fa-times"></i>
                    <i v-else class="far fa-smile"></i>
                </div>
            </div>
        </div>

        <div class="iconbutton" v-if="send" @click="send_text($event)">
            <div class="rightdummy">
                <div class="idummy">
                    <i class="far fa-paper-plane"></i>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Images from '@/application/utils/images.js'
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Picker, EmojiIndex } from 'emoji-mart-vue-fast'

let emojiIndex = new EmojiIndex(data)

import vClickOutside from 'v-click-outside'

import picturePreview from '@/components/chat/input/picturePreview/picturePreview'
import func from 'vue-editor-bridge';

let images = new Images()

export default {
    name: 'InputField',
    components: {
        Picker,
        picturePreview,
    },

    directives: {
        clickOutside: vClickOutside.directive
    },

    watch: {
        text : {
            immediately : true,
            handler : function(current, prev) {

                if(current) {

                    this.send = true
                    this.$emit('FilledInput')

                } else {

                    this.send = false
                    this.$emit('emptyInput')
                }  

                this.textarea_resize()
            }
        },
    },

   

    computed: {
        mobile : function(){
            return !this.$store.state.pocketnet && this.$store.state.mobile
        }
       
    },
        
    methods: {

        setText : function(text){
			this.text = text

            this.savetextinstorage()

            setTimeout(() => {
                this.textarea_resize()
                this.focus()
            })
            
		},

        addUsername: function(name) {
            let element = document.getElementById('textInput');
            if(element) {
                let caretPos = element.selectionStart;
                let atPosition = () => {
                    for(let i=caretPos; i>=0;i--) {
                        if(this.text[i] === '@') {
                            return i;
                        }
                    }
                }

                let slicedAtText = this.text.slice(0, atPosition() + 1);
                let plusSpaceLength = 1;
                this.text = slicedAtText + name + ' '
                + this.text.slice(this.sliceAfterUsernameText(caretPos, slicedAtText.length + name.length) + plusSpaceLength, this.text.length);
                return this.text.indexOf(' ', caretPos) + plusSpaceLength;
            }
            return 0;
        },
        sliceAfterUsernameText(caretPos, curNamePos) {
            return this.text.indexOf(' ', caretPos) > 0 ? this.text.indexOf(' ', caretPos) : curNamePos
        },


        focused : function(){
            this.$emit('focused')
        },

        textchange : function(e){
            this.text = e.target.value || ''    
        },

        show_usernames : function(text, caretPosition){
            
            for(let i=caretPosition; i>=0 && i<=caretPosition; i--) {
                if(text[i] === '@' && text[caretPosition] !== '@') {
                     if(i === 0) {
                        this.search_for_username(text, i, caretPosition)
                        break;
                    }
                    else if(i > 0 && (text[i-1] === ' ' || text[i-1] === '\n')) {
                        this.search_for_username(text, i, caretPosition)
                        break;
                    }
                    else {
                        this.send_empty_array()
                    }
                }
                else {
                    this.send_empty_array()
                }
            }
        },
        show_usernames : function(caretPosition, isTab){
            for(let i=caretPosition; i>=0 && i<=caretPosition; i--) {
                if(this.text[i] === '@' && this.text[caretPosition] !== '@') {
                    if(i === 0) {
                        if(isTab) {
                            this.setFirstUser(i, caretPosition)
                            break;
                        }
                        else {
                            this.search_for_username(i, caretPosition)
                            break;
                        }
                    }
                    else if(i > 0 && (this.text[i-1] === ' ' || this.text[i-1] === '\n')) {
                        if(isTab) {
                            this.setFirstUser(i, caretPosition)
                            break;
                        }
                        else {
                            this.search_for_username(i, caretPosition)
                            break;
                        }
                    }
                    else {
                        this.send_empty_array()
                    }
                }
                else {
                    this.send_empty_array()
                }
            }
        },
        search_for_username(index, caretPosition) {
            this.$emit('userSearched' ,this.core.mtrx.chatUsersInfo(this.chat.roomId, 'anotherChatUsers')
            .filter(word => word.name.indexOf(this.text.slice(index + 1, caretPosition)) > -1))
            

            this.savetextinstorage()

        },
        setFirstUser(index, caretPosition) {
            let userList = this.core.mtrx.chatUsersInfo(this.chat.roomId, 'anotherChatUsers')
            .filter(word => word.name.indexOf(this.text.slice(index + 1, caretPosition)) > -1)
            this.addUsername(userList[0]?.name || '')
            
        },
        savetextinstorage : function(){
            if (this.storagekey){
                localStorage[this.storagekey] = this.text || ''
            }
        },
        send_empty_array(){
            this.$emit('userSearched', [])
        },

        focus(){
            this.$refs['textarea'].focus()
        },

        blur(){
            this.$refs['textarea'].blur()
        },

        blurifempty(){
            if(!this.text)
                this.blur()
        },

        close_emoji_picker(event) {
            if(event.target.localName !== 'i') {
                if(event.target.localName !== 'matrix-element') {
                    this.display_emoji = false
                }
            }
        },

        textarea_resize() {

            if(!this.text){
                this.textarea_resize_reset()
            }
            else{
                this.$refs.textarea.style.height = 1 + 'px'
                this.$refs.textarea.style.height = this.$refs.textarea.scrollHeight + 'px'
                this.display_emoji = false
            }

            
        },

        textarea_resize_reset() {
            this.$refs.textarea.style.height = '26px'
            console.log('textarea_resize_reset')
        },
        toggle_emoji_picker() {
            this.display_emoji = !this.display_emoji
        },
        
        send_text_enter(event){
            if(this.mobile){
                this.text = this.text + '\n'
            }
            else{
                this.send_text(event)
            }
        },

        send_text(event) {
            event.textContent = this.replace_username(this.text).split(',')

            if(this.text && this.text !== '\n') {

                this.display_emoji = false
                this.$emit('chatMessage', event)
                this.$emit('emptyInput')
                this.send = false
                this.text = ''

            }

            this.savetextinstorage()

        },

        replace_username(text) {
            for(let i=text.length; i>=0;i--) {
               if((text[i] === '@' && i === 0) || (text[i] === '@' && text[i-1] === ' ')) {
                   for(let j=i; j < text.length; j++) {
                       if(text[j] === ' ' || text[j] === '\n') {
                           let userList = this.core.mtrx.chatUsersInfo(this.chat.roomId, 'anotherChatUsers')
                           .filter(word => word.name.indexOf(text.slice(i + 1, j)) > -1)
                           
                           if(userList.length === 1 && userList[0].name === text.slice(i + 1, j)) {
                                text = this.create_username_message(text, userList, i, j)
                           }
                       }
                       if(j === text.length - 1) {
                           let userList = this.core.mtrx.chatUsersInfo(this.chat.roomId, 'anotherChatUsers')
                           .filter(word => word.name.indexOf(text.slice(i + 1, j + 1)) > -1)
                           
                           if(userList.length === 1 && userList[0].name === text.slice(i + 1, j + 1)) {
                               text = this.create_username_message(text, userList, i, j)
                           }
                       }
                   }
               }
            }
            return text;
        },

        create_username_message(text, userList, i, j){
            return text.slice(0, i + 1) 
                    + userList[0].id 
                    + userList[0].name 
                    + ' '
                    + text.slice(j+1, text.length)
        },

        insert_emoji(emoji) {
            this.text += emoji.native;

            this.savetextinstorage()
        },
        paste_image(event) {

            this.get_base64(event)

        },
        get_base64(event) {
            this.pasted_data = event.clipboardData.items

            if(this.pasted_data.length) {

                for(let index in this.pasted_data) {
                    let item = this.pasted_data[index]

                    let correct_image_type = this.upload.extensions.includes(item.type)

                    if (correct_image_type) {


                        var blob = item.getAsFile()
                        var reader = new FileReader();

                        reader.onload = event => {

                            this.$dialog.confirm(
                                'Do you really want to send attachment?', {
                                okText: 'Yes',
                                cancelText : 'No, cancel'
                            })
                    
                            .then((dialog) => {
                                var base64 = event.target.result
                                this.resize_image(base64, item.type)

                            })
                        }
                        reader.readAsDataURL(blob)

                        
                    }   
                }
                
            }
        },
        resize_image(data, type) {
            return images.autorotation(null, data).then(base64 => {
                let _type = this.upload.images.resize.type || 'def'

                return images.resize[_type](base64, 1024, 1024, type, 0.9).then(base64 => {

                    this.$emit('base64', base64)

                }).catch(error => console.error('Failed to resize image', error))
            }).catch(error => console.error('Failed to resize image', error))
        },
    },  

    props : {
        chat: {
            type: Object,
            default: {}
        },
        storagekey : String
    },

    data() {
        return {
            emojiIndex: emojiIndex,
            send: false,
            toMatch: [
                /Android/i,
                /webOS/i,
                /iPhone/i,
                /iPad/i,
                /iPod/i,
                /BlackBerry/i,
                /Windows Phone/i
            ],
            isPhone: true,
            heightUp: 40,
            areaValue: '',
            ready : false,
            text: '',
            exclude: ['flags'],
            display_emoji: false,
            content_height: 26,
            pasted_data: [],
            
            upload: {
                multiple: true,
                extensions: ['image/jpg', 'image/jpeg', 'image/png'],
                images: {
                    resize: {
                        type: 'fit'
                    }
                }
            },
            hidden_previews: null
        }
    },

    creared() {
        
    },

    mounted() {
        //console.log('this.mobile', this.mobile)
        //////////////// not for mobiles
        if(!this.mobile){
            console.log("FOCUS")
            this.focus()
        }

        this.isPhone = this.toMatch.some(toMatchItem => {
            return navigator.userAgent.match(toMatchItem);
        })

        this.$refs.textarea.style.height = '26px'

        let _this = this;
        $("#textInput").bind("keyup click", function(event) {
            if(event.keyCode === 39) {
                _this.show_usernames(this.selectionStart, true)
            }
            else {
                _this.show_usernames(this.selectionStart, false)
                
            }
        });


        // (event.type === "click" || 
        //       (event.type === "keyup" && (event.keyCode >= 35 && event.keyCode <= 40)))

        
        if (this.storagekey && localStorage[this.storagekey]){
            this.text = localStorage[this.storagekey]
        }
    }
}
</script>

<style lang="sass" scoped>



.input-component
    width: 100%
    display: flex
    justify-content: center
    align-items: center
    padding: 0 2 * $r
    padding-right: 0

    /deep/ .emoji-mart .emoji-mart-emoji
        width : 25%
        height : 40px
        cursor : pointer

        span
            cursor : pointer

        &:hover
            background: none
            box-shadow: none

            &:before
                display: none

    .input-wrapper
        display: flex
        flex-direction: column
        justify-content: center
        align-items: flex-start
        position: relative
        width: 100%
    .right
        margin: 0 $r
    .iconbutton

        .leftdummy
            width: 20px

        .rightdummy
            width: 35px

        .idummy
            width: 100%
            height: 35px
            line-height: 35px
            i
                line-height: 35px!important
    .previews
        width: 100%
        max-width: 198px
        height: 30px
        display: flex
        align-items: flex-start
        padding: 2px 0
        overflow: hidden

        &:first-child
            margin-left: 0
            
    
    .textarea
        width: 100%
        display: flex
        justify-content: flex-start
        align-items: center
               
.chat-input
    width: 100%
    max-height: 100px
    // min-height: 26px
    overflow-y: auto
    resize: none
    &::-webkit-scrollbar
        width: 0!important

.fade-enter-active, .fade-leave-active
    transition: all .2s ease-in

.fade-enter, .fade-leave-to
    opacity: 0
</style>