<template>
  <div class="upload">
    <div class="uploadWrapper">

      <div class="contentWrapper">
        <slot name="content">
          <i class="fas fa-plus"></i>
        </slot>
      </div>
      <div class="inputWrapper">
        <input type="file" :multiple="multiple" @change="upload">
      </div>

    </div>

    <div class="dropzone" :class="{dropzone : dropzone}" v-if="dropzone" ref="dropzone">
      <slot name="dropzone">
        <i class="fas fa-plus"></i> {{ $t("caption.dragAndDropAFile") }}
      </slot>
    </div>
  </div>
</template>


<style scoped lang="sass">

  .upload
    width: 100%

  .uploadWrapper
    position: relative

    .inputWrapper
      position: absolute
      left: 0
      right: 0
      top: 0
      bottom: 0
      opacity: 0

      input
        position: absolute
        left: 0
        right: 0
        top: 0
        bottom: 0
        opacity: 0

</style>

<script>

import Images from '@/application/utils/images.js'

var each = require('async-each');

var images = new Images()

export default {
  name: 'upload',
  directives: {},
  props: {

    dropzone: String,
    multiple: Boolean,

    maxsize: {
      default: 25,
      type: Number
    },

    extensions: {
      type: Array,
      default: () => []
    },
    images: {
      type: Object,
      default: () => {
      }
    }

  },

  data: function () {
    return {
      loading: false
    }
  },

  computed: {
    maxSize() {
      return this.maxsize * 1024 * 1024
    }
  },

  created: () => {

  },
  methods: {
    read: function (file) {
      var reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = function (e) {

          resolve({
            base64: e.target.result,
            file: file
          })

        }
        reader.readAsDataURL(file);
      })


    },
    upload: function (event) {
      event.stopPropagation();
      event.preventDefault();

      var files = event.dataTransfer?.files || event.target?.files || event.files || [];
      var result = {}

      this.loading = true

      this.$emit('start', files)

      var ha = this

      each(_.toArray(files), (file, next) => {

        var error = this.check(file)

        if (error) {
          
          ha.$emit('error', {
            error: error,
            file: file,
            text: this.errorText(error, file)
          })

          next(new Error(error))

          return
        }

        this.read(file).then(data => {

          result[data.file.name] = data

          return this.handle(data)

        }).then(data => {

          ha.$emit('uploaded', data)
          next()

        }).catch(e => {

          ha.$emit('error', {
            error: e,
            file: file,
            text: this.errorText(e, file)
          })

          next(new Error(error))

        })

      }, (err) => {

        this.loading = false
        ha.$emit('uploadedAll', result)

      })

    },

    errorText: function (error, file) {
      if (error === 'filesize') {
        return "File Size Error: (" + file.name + "). The File can't be more than "+this.maxsize+" mbytes"
      }

      if (error === 'fileext') {
        return "File Extension Error:" + file.name
      }
    },

    check: function (file) {
      if (!this.checkSize(file)) {
        return 'filesize'
      }

      if (!this.checkExtension(file)) {
        return 'fileext'
      }

    },
    checkSize: function (file) {
      return file.size <= this.maxSize
    },
    getExtension: function (file) {
      var name = file.name.split('.');
      var ext = name[name.length - 1].toLowerCase();

      return ext;
    },
    checkExtension: function (file) {

      if (this.extensions.length) {
        if (_.indexOf(this.extensions, this.getExtension(file)) == -1) return false
      }

      return true;
    },
    handle: function (data) {

      if (data.file.type === 'image/jpeg' || data.file.type === 'image/png' || data.file.type === 'image/webp') {
        return this.handleImages(data)
      }
      
      return Promise.resolve(data)
    },
    sendAnyFile: function (data) {
      this.$emit('anyFile', data)
    },
    handleImages: function (data) {

      return images.autorotation(data.file, data.base64).then(base64 => {
        data.base64 = base64

        return Promise.resolve(data)
      }).then(data => {

        if (this.images.resize) {

          var type = this.images.resize.type || 'def'
          
          return images.resize[type](data.base64, this.images.resize.width || 1024, this.images.resize.height || 1024, data.file.type, this.images.resize.quality || 0.85).then(base64 => {

            data.base64 = base64

            return Promise.resolve(data)
          }).catch(e => {
            console.log("E", e)
            return Promise.reject(e)
          })

        }
        return Promise.resolve(data)
      })


    }

  }
}

</script>

