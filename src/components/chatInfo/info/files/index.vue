<template>
  <div>
    <div v-if="fileEvents.length !== 0" class="aboutRoomFileWrapper">
      <div
        class="aboutRoomFile"
        v-for="item in fileEvents"
        :key="item.event_id"
      >
        <div class="filePreview">
          <fileMessage
            :encryptedData="encryptedData(item)"
            :file="file(item)"
            @download="(e) => download(item)"
          />
          <div class="encryptedDataIcon" v-if="encryptedData">
            <i class="fas fa-lock"></i>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="emptyBlock">
      <span>{{ $t("caption.noFiles") }}</span>
    </div>
  </div>
</template>
<script>
import f from "@/application/functions";
import fileMessage from "@/components/events/event/fileMessage/index.vue";
export default {
  props: {
    fileEvents: Array,
    chat: Object,
  },

  components: {
    fileMessage,
  },

  computed: {},
  methods: {
    encryptedData: function (event) {
      return f.deep(event, "event.content.info.secrets") ||
        f.deep(event, "event.content.pbody.secrets")
        ? true
        : false;
    },

    jsonConvertor(data) {
      return JSON.parse(data);
    },
    humanReadableSize(data) {
      return f.formatBytes(data);
    },

    content: function (e) {
      return e.event.content;
    },

    file: function (e) {
      if (this.content(e).msgtype === "m.file") {
        return this.body(e);
      }
    },

    body: function (e) {
      var bc = e.event.content;

      if (e.event.content.msgtype == "m.encrypted") {
        bc = this.decryptEvent;
      }

      return bc.pbody || bc.body || "";
    },

    download(event) {
      this.downloading = true;

      this.core.mtrx
        .downloadFile(this.chat, event)
        .catch((e) => {
          this.error = e.toString();

          return Promise.resolve(e);
        })
        .then((r) => {
          this.downloading = false;
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
};
</script>
<style lang="sass" scoped>

.encryptedDataIcon
  position: absolute
  color : #fff
  opacity: 0.3
  padding : 0.5 * $r $r
  +shadowSmaller()
  left : 0
  top : 0

  i
    font-size: 0.7em

.filePreview
  position: relative
  .encryptedDataIcon
    color : srgb(--neutral-grad-3)
    text-shadow: none
    color
    right: 0
    left : auto


.aboutRoomFileWrapper
  .aboutRoomFile
    display: flex
    justify-content: flex-start
    align-items: flex-start
    margin-bottom: $r
    padding: $r

    .filePreview
      border: 1px solid srgb(--background-main)
      border-radius: 10px
      position: relative
      overflow: hidden

    .fileName
      font-size: 1.2em
      margin-top: 4px

    .fileSize
      font-size: 0.8em
      font-weight: 700

    a
      display: flex
      flex-direction: column
      align-items: flex-start
      justify-content: flex-start
      margin: .2em 0


.emptyBlock
  text-align: center
  padding: 3 * $r 0

  span
    font-size: 0.9em
</style>
