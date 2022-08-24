<template>
  <div class="input_component">
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
          autocorrect="on"
          @focus="focused"
          @blur="blured"
          @keydown="keydown"
          @input="textchange"
          @keyup="keyup"
          @click="keyup"
          @paste="paste_image"
          :placeholder="$t('caption.sendmessage')"

        ></textarea>
        <transition name="fade" mode="out-in" v-if="!mobile" >
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
import f from "@/application/functions";
import {Picker, EmojiIndex} from 'emoji-mart-vue-fast'


import vClickOutside from 'v-click-outside'

import picturePreview from '@/components/chat/input/picturePreview/picturePreview'

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
    text: {
      immediately: true,
      handler: function (current, prev) {

        if (current) {

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

  data() {
    return {
      send: false,
     
      ready: false,
      text: '',
      exclude: ['flags'],
      display_emoji: false,
      content_height: 26,
      pasted_data: [],
      block: false,

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

  computed: {
    mobile: function () {
      return !this.$store.state.pocketnet && this.$store.state.mobile
    },

    emojiIndex: function () {

      if (!window.emojiIndex) {
        window.emojiIndex = new EmojiIndex(data)
      }

      return window.emojiIndex

    }

  },

  methods: {

    setText: function (text) {
      this.text = text

      this.savetextinstorage()

      setTimeout(() => {
        this.textarea_resize()
        this.focus()
      })

    },

    focused: function () {
      this.$emit('focused')
    },

    textchange: function (e) {
      this.text = e.target.value || ''

    },


    savetextinstorage: function () {
      if (this.storagekey) {
        localStorage[this.storagekey] = this.text || ''
      }
    },
    send_empty_array() {
      this.$emit('userSearched', [])
    },

    focus() {
      this.$refs['textarea'].focus()
    },

    blur() {
      this.$refs['textarea'].blur()
    },

    blurifempty() {
      if (!this.text)
        this.blur()
    },

    close_emoji_picker(event) {
      if (event.target.localName !== 'i') {
        if (event.target.localName !== 'matrix-element') {
          this.display_emoji = false
        }
      }
    },

    textarea_resize() {

      if (!this.text) {
        this.textarea_resize_reset()
      } else {
        this.$refs.textarea.style.height = 1 + 'px'
        this.$refs.textarea.style.height = this.$refs.textarea.scrollHeight + 'px'
        this.display_emoji = false
      }


    },

    textarea_resize_reset() {
      this.$refs.textarea.style.height = this.content_height + 'px'
    },
    toggle_emoji_picker() {
      this.display_emoji = !this.display_emoji
    },

    send_text(event) {

      if (this.text && this.text !== '\n') {

        this.display_emoji = false
        this.$emit('chatMessage', this.text)
        this.$emit('emptyInput')
        this.send = false
        this.text = ''

      }

      this.savetextinstorage()

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

      if (this.pasted_data.length) {

        for (let index in this.pasted_data) {
          let item = this.pasted_data[index]

          let correct_image_type = this.upload.extensions.includes(item.type)

          if (correct_image_type) {


            var blob = item.getAsFile()
            var reader = new FileReader();

            reader.onload = event => {

              this.$dialog.confirm(
                'Do you really want to send attachment?', {
                  okText: 'Yes',
                  cancelText: 'No, cancel'
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

    getsearchposition(position) {

      if (!position.start || !this.text.length) return null

      var sposition = {start: position.start, middle: 0, end: position.end}

      var i = position.start
      var dg = false
      var br = false

      var reg = /[a-zA-Z0-9]{1}/

      sposition.middle = i

      do {

        var char = this.text[i]

        if (char == '@') {

          if (position.start == i || (i > 0 && reg.test(this.text[i - 1]))) {
            br = true
          } else {
            dg = true
          }
        } else {

          if (reg.test(char)) {
            sposition.start = i
          } else br = true
        }

        i--

      } while (i >= 0 && i <= position.start && !dg && !br)

      if (!dg) {
        sposition = null
      } else {

        br = false
        i = position.end

        do {
          if (!this.text[i] || reg.test(this.text[i])) {
            sposition.end = i
          } else {
            br = true
          }

          i++

        } while (i <= this.text.length && !br)
      }

      return sposition

    },


    getsearch(position) {

      var sposition = this.getsearchposition(position)

      if (!sposition) return null

      return this.text.substring(sposition.start, sposition.middle)

    },


    keydown(event) {

      if (event.keyCode === 40 || event.keyCode === 38) {

        if (this.tipusers && this.tipusers.length) {

          this.$emit('browsetip', event.keyCode === 40 ? true : false)

          event.preventDefault()

          return false
        }

      }


      if (event.keyCode === 39 || event.keyCode === 13) {

        if (this.tipusers && this.tipusers.length) {

          this.$emit('selectcurrenttip')

          event.preventDefault()

          return false

        }

      }

      if (event.keyCode === 13) {
        if (this.mobile) {
          this.text = this.text + '\n'
        } else {
          this.send_text(event)
        }

        event.preventDefault()

        return false
      }
    },

    keyup(event) {

      if (this.block) {
        event.preventDefault()

        return false
      }

      var position = f.getCaretPosition(this.$refs['textarea'])

      var value = this.getsearch(position)

      this.$emit('tipsearchrequest', value)

      this.savetextinstorage()
    },

    blured() {

      setTimeout(() => {
        this.$emit('tipsearchrequest', null)
      }, 300)

    },

    inserttip(text) {

      this.$emit('tipsearchrequest', null)

      this.block = true
      this.$refs['textarea']

      var position = this.getsearchposition(f.getCaretPosition(this.$refs['textarea']))

      this.text = this.text.substring(0, position.start) + text + this.text.substring(position.end + 1)


      if (!this.text[position.end + 1]) {
        this.text = this.text + ' '
      }

      if (!this.text[position.end + 1] == ' ') position.end++

      f.setCaretPosition(this.$refs['textarea'], position.end + 1, position.end + 1)

      setTimeout(() => {
        this.block = false
      }, 350)

    }
  },

  props: {
    storagekey: String,
    tipusers: Array
  },

  

  creared() {

  },

  mounted() {

    if (!this.mobile) {
      this.focus()
    }


    this.$refs.textarea.style.height = '26px'

    if (this.storagekey && localStorage[this.storagekey]) {
      this.text = localStorage[this.storagekey]
    }
  }
}
</script>

<style scoped lang="sass">
.input_component
  width: 100%
  display: flex
  justify-content: center
  align-items: center
  padding: 0 2 * $r
  padding-right: 0

  /deep/ .emoji-mart .emoji-mart-emoji
    width: 25%
    height: 40px
    cursor: pointer

    span
      cursor: pointer

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
        line-height: 35px !important

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
    width: 0 !important

.fade-enter-active, .fade-leave-active
  transition: all .2s ease-in

.fade-enter, .fade-leave-to
  opacity: 0

</style>