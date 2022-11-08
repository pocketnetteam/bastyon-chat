import actions from "@/components/events/event/actions/index.vue";
import filePreview from "@/components/events/previews/filePreview/index.vue";
import fileMessage from "@/components/events/event/fileMessage/index.vue";
import listPreview from "@/components/events/event/message/listPreview/index.vue";
import f from "@/application/functions";
import url from "@/components/events/event/url/index.vue";
import imagesLoaded from "vue-images-loaded";
import dummypreviews from "@/components/chats/dummypreviews";
import IncomingMessage from "./incomingMessage/incomingMessage.vue";
import VoiceMessage from "@/components/events/event/VoiceMessage";

export default {
  name: "eventsMessage",
  props: {
    decryptEvent: {},
    origin: Object,
    prevevent: Object,
    event: Object,
    preview: Boolean,
    userinfo: Object,
    readed: Object,
    downloaded: Boolean,
    baseImg: {
      type: String,
      default: "empty",
    },
    filePreview: Object,
    imgEvent: {},
    add_image: Function,
    goToGallery: Function,
    chat: Object,
    encrypted: false,
    encryptedData: Boolean,
    decryptedInfo: null,
    error: String,
    withImage: Boolean,
    reference: Object,
    last: Boolean,
    showmyicontrue: false,
    fromreference: Boolean,
    multiSelect: {
      default: false,
      type: Boolean,
    },
    selectedMessages: {
      default: [],
      type: Array,
    },
    isRemoveSelectedMessages: false,
    audioBuffer: null,
  },
  directives: {
    imagesLoaded,
  },

  data: function () {
    return {
      referenceshowed: false,
    };
  },
  components: {
    actions,
    filePreview,
    fileMessage,
    listPreview,
    url,
    dummypreviews,
    IncomingMessage,
    VoiceMessage,
  },
  watch: {
    isRemoveSelectedMessages: {
      immediate: true,
      handler: function () {
        if (this.isRemoveSelectedMessages) {
          for (let i = 0; i < this.selectedMessages.length; i++) {
            if (
              this.selectedMessages[i].message_id === this.origin.event.event_id
            ) {
              this.$emit("remove");

              return this.core.mtrx.client.redactEvent(
                this.chat.roomId,
                this.origin.event.event_id,
                null,
                {
                  reason: "messagedeleting",
                }
              );
            }
          }
          this.$emit("messagesIsDeleted", true);
        }
      },
    },
    readyToRender: {
      immediate: true,
      handler: function () {
        if (this.readyToRender) this.$emit("readyToRender");
      },
    },
  },
  computed: {
    showburn: function () {
      if (new Date() < new Date(2021, 11, 28)) {
        return "";
      }

      if (
        -moment().diff(this.willburn, this.core.options.burn.v) <
        this.core.options.burn.b
      )
        return "big";

      if (
        -moment().diff(this.willburn, this.core.options.burn.v) <
        this.core.options.burn.m
      )
        return "medium";

      return "";
    },
    willburn: function () {
      var d = moment(this.origin._localTimestamp).add(
        this.core.options.burn.w,
        this.core.options.burn.v
      );

      return d;
    },

    readyToRender: function () {
      var r =
        (this.content.msgtype === "m.encrypted" &&
          !this.textWithoutLinks &&
          this.badenctypted) ||
        this.content.membership ||
        ((this.content.msgtype === "m.text" ||
          this.content.msgtype === "m.encrypted") &&
          this.textWithoutLinks) ||
        this.file ||
        this.error ||
        (this.content.msgtype === "m.image" && this.imageUrl) ||
        (this.content.msgtype === "m.audio" && this.audioUrl) ||
        this.urlpreview ||
        this.preview;

      return r;
    },
    my: function () {
      return this.userinfo.id === this.core.user.userinfo?.id;
    },
    stateChat: function () {
      var id = this.$route.query.id;

      return this.$store.state.chatsMap[id];
    },

    sending: function () {
      return this.origin.status == "sending";
    },

    showmeta: function () {
      if (!this.prevevent) return true;

      var prevuser = this.$f.getmatrixid(this.prevevent.getSender());

      var t = 10 * 60000;

      if (moment().diff(this.origin._localTimestamp, "days") != 0) {
        t = 60 * 1000 * 60 * 24;
      }

      if (
        prevuser != this.userinfo.id ||
        this.prevevent._localTimestamp + t < this.origin._localTimestamp
      ) {
        return true;
      }
    },

    imageFrom: function () {
      if (this.content && this.content.info) return this.content.info.from;
    },

    showmyicon: function () {
      return (
        this.showmyicontrue ||
        this.content.msgtype === "m.image" ||
        /*this.content.msgtype === 'm.audio' ||*/
        this.content.msgtype === "m.file" ||
        this.urlpreview ||
        (!this.$store.state.active && this.$store.state.minimized)
      );
    },

    file: function () {
      if (this.content.msgtype === "m.file") {
        return this.body;
      }
    },

    replacedmintionsbody: function () {
      return this.body.replace(/@\w{68}:(\w{1,50})/g, function (str, l) {
        return "@" + l;
      });
    },

    body: function () {
      var bc = this.origin.event.content;

      if (this.origin.event.content.msgtype == "m.encrypted") {
        bc = this.decryptEvent;
      }

      return bc.pbody || bc.body || "";
    },

    content: function () {
      return this.origin.event.content;
    },

    badenctypted: function () {
      return this.decryptEvent.msgtype == "m.bad.encrypted";
    },

    textWithoutLinks: function () {
      var trimmed = this.$f.trim(this.body);

      if (
        !this.urlpreview ||
        this.urlpreview.length < 10 ||
        (trimmed.indexOf(this.urlpreview) > 0 &&
          trimmed.indexOf(this.urlpreview) + this.urlpreview.length <
            trimmed.length)
      ) {
        return trimmed;
      }

      return this.$f.trim(trimmed.replace(this.urlpreview, ""));
    },

    imageUrl: function () {
      if (this.content.msgtype === "m.image") {
        if (this.encryptedData) {
          return this.decryptedInfo;
        } else {
          return this.content && this.content.url;
        }
      }
    },

    audioUrl: function () {
      if (this.content.msgtype === "m.audio") {
        if (this.encryptedData && this.decryptedInfo) return this.decryptedInfo;

        return this.audioBuffer;

        //return this.content && this.content.audioData
      }
    },

    canediting: function () {
      var type = f.deep(this.origin, "event.type");

      if (type == "m.room.message") {
        if (
          this.origin.event.content.msgtype == "m.encrypted" ||
          this.origin.event.content.msgtype == "m.text"
        ) {
          return true;
        }
      }
    },

    cancopy: function () {
      var type = f.deep(this.origin, "event.type");

      if (type == "m.room.message") {
        if (
          this.origin.event.content.msgtype == "m.encrypted" ||
          this.origin.event.content.msgtype == "m.text"
        ) {
          return true;
        }
      }
    },

    menuItems: function () {
      var menu = [
        {
          click: "reply",
          title: this.$i18n.t("button.reply"),
          icon: "fas fa-reply",
        },
        {
          click: "showMultiSelect",
          title: this.$i18n.t("button.select"),
          icon: "fas fa-check-circle",
        },
        {
          click: "share",
          title: this.$i18n.t("button.share"),
          icon: "fas fa-share-alt",
        },
      ];

      // if(!this.file){
      //   menu.push({
      //     click: "share",
      //     title: this.$i18n.t("button.share"),
      //     icon: "fas fa-share-alt"
      //   })
      // }

      if (this.my) {
        menu.push({
          click: "delete",
          title: this.$i18n.t("button.delete"),
          icon: "far fa-trash-alt",
        });
      }

      var type = f.deep(this.origin, "event.type");

      if (type == "m.room.message") {
        menu.unshift({
          click: "copy",
          title: this.$i18n.t("button.copy"),
          icon: "far fa-copy",
        });

        if (this.my && this.canediting)
          menu.unshift({
            click: "edit",
            title: this.$i18n.t("button.edit"),
            icon: "far fa-edit",
          });
      }

      return menu;
    },

    urlpreview: function () {
      if (!this.preview && this.content.msgtype !== "m.file") {
        var url = f.getUrl(this.body);

        if (url) {
          var _u = new URL(url);

          if (_u.pathname == "/") {
            if (f.knsite(url)) return "";
          }

          return url;
        }

        return url || "";
      }
    },

    edited: function () {
      if (this.content.edited) return true;

      if (
        this.origin.event.content["m.relates_to"] &&
        this.origin.event.content["m.relates_to"]["rel_type"] == "m.replace"
      )
        return true;
    },

    selectedMessage: function () {
      const elem = this.selectedMessages.filter(
        (item) => item.message_id === this.origin.event.event_id
      );
      return elem[0]?.message_id === this.origin.event.event_id ? true : false;
    },
  },

  methods: {
    gotoreference: function () {
      var id = this.reference.getId();

      this.$emit("gotoreference", id);
    },

    showwhenburn: function () {
      var text = "";

      //console.log(this.willburn.toDate(), new Date(), this.willburn.toDate() > new Date())

      if (this.willburn.toDate() < new Date()) {
        text = this.$i18n.t("messagewasburn");
      } else {
        text = this.$i18n.t("messagewillburn");

        //this.willburn.locale(this.$i18n.locale).format('DD MMMM YYYY')
      }

      this.$store.commit("icon", {
        icon: "info",
        message: text,
      });
    },

    imagesLoaded: function () {
      this.updatedSize();
    },
    updatedSize: function (before) {
      this.$emit("updatedSize", before);
    },

    dropDownMenuShow: function () {
      // if(this.urlpreview) return

      setTimeout(() => {
        this.setmenu();
      }, 200);
    },

    setmenu: function () {
      this.core.menu({
        items: this.menuItems,
        handler: this.menuItemClickHandler,
        item: {},
      });
    },

    menushare: function () {
      var sharing = {};

      var trimmed;
      if (this.content.msgtype !== "m.file") {
        trimmed = this.$f.trim(this.body);
      }
      if (
        this.content.msgtype === "m.file" ||
        this.content.msgtype === "m.encrypted"
      )
        sharing.files = [this.file];

      if (this.content.msgtype === "m.image" && this.imageUrl)
        sharing.images = [this.imageUrl];

      if (this.content.msgtype === "m.audio" && this.audioUrl)
        sharing.audio = [this.audioUrl];

      if (
        (this.content.msgtype === "m.text" ||
          this.content.msgtype === "m.encrypted") &&
        trimmed
      )
        sharing.messages = [trimmed];

      //if(this.urlpreview) sharing.urls = [urlpreview]

      // if (this.file) {
      //   sharing.download = true
      // }

      //sharing.route = 'chat?id=' + this.chat.roomId
      sharing.from = this.userinfo.id;

      this.$emit("share", sharing);

      return Promise.resolve();
    },

    menuedit: function () {
      this.$emit("editing", this.body);

      return Promise.resolve();
    },

    menushowMultiSelect: function () {
      this.$emit("showMultiSelect");
      this.selectMessage();

      return Promise.resolve();
    },

    menureply: function () {
      this.$emit("reply");

      return Promise.resolve();
    },
    menucopy: function () {
      this.$f.copytext(this.replacedmintionsbody);

      return Promise.resolve();
    },
    menudelete: function () {
      return this.$dialog
        .confirm("Do you really want to delete message?", {
          okText: this.$i18n.t("yes"),
          cancelText: this.$i18n.t("cancel"),
        })

        .then((dialog) => {
          this.$emit("remove");

          return this.core.mtrx.client.redactEvent(
            this.chat.roomId,
            this.origin.event.event_id,
            null,
            {
              reason: "messagedeleting",
            }
          );
        })
        .catch((e) => {
          return Promise.resolve();
        });
    },
    menuItemClickHandler: function (item, d, p) {
      p.hidePopup();

      this["menu" + item.click]()
        .then((r) => {})
        .catch((e) => {
          p.showPopup();
        });
    },

    imagePaddingStyle: function (c) {
      if (c.info && c.info.h && c.info.w) {
        var cc = c.info.h / c.info.w;

        if (cc > 1.7) cc = 1.7;

        var h = "padding-bottom:" + cc * 100 + "%";

        return h;
      }

      return "";
    },
    parser(event) {
      return JSON.parse(event)["og:title"];
    },
    openImage(img) {
      this.$emit("openImg", img);
    },

    format_date(value) {
      if (value) {
        if (moment().diff(value, "days") === 0) {
          return new Date(value).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        } else {
          if (moment().year() === moment(value).year()) {
            return moment(value).locale(this.$i18n.locale).format("D MMMM");
          } else {
            return moment(value)
              .locale(this.$i18n.locale)
              .format("D MMMM YYYY");
          }
        }
      }
    },

    download: function () {
      this.$emit("download");
    },

    decryptagain: function () {
      this.$emit("decryptagain");
    },

    openImageGallery(msgEvent) {
      this.$emit("openGalleryImg", msgEvent);
    },
    reshareKeys() {
      let roomId = this.chat.roomId;
    },
    textDonation: function (withTx = false) {
      var from = this.$i18n.t("caption.somebody"),
        msg = "";
      try {
        from = this.$f.deep(
          this,
          "$store.state.users." + this.content.from
        ).name;
      } catch (err) {}
      var to = this.$i18n.t("caption.somebody");
      try {
        to = this.$f.deep(this, "$store.state.users." + this.content.to).name;
      } catch (err) {}
      msg +=
        from +
        this.$i18n.t("caption.sent") +
        this.content.amount +
        this.$i18n.t("caption.sent") +
        to;
      return msg;
    },

    menuIsVisibleHandler(isVisible) {
      this.$emit("menuIsVisible", isVisible);
    },

    showreference: function () {
      this.referenceshowed = !this.referenceshowed;
    },

    selectMessage: function () {
      var sharing = {};

      var trimmed;
      if (this.content.msgtype !== "m.file") {
        trimmed = this.$f.trim(this.body);
      }
      if (
        this.content.msgtype === "m.file" ||
        this.content.msgtype === "m.encrypted"
      )
        sharing.files = [this.file];

      if (this.content.msgtype === "m.image" && this.imageUrl)
        sharing.images = [this.imageUrl];

      if (this.content.msgtype === "m.audio" && this.decryptedInfo)
        sharing.audio = [this.decryptedInfo];

      if (
        (this.content.msgtype === "m.text" ||
          this.content.msgtype === "m.encrypted") &&
        trimmed
      )
        sharing.messages = [trimmed];

      //if(this.urlpreview) sharing.urls = [urlpreview]

      // if (this.file) {
      //   sharing.download = true;
      // }

      //sharing.route = 'chat?id=' + this.chat.roomId
      sharing.from = this.userinfo.id;
      this.$emit("selectMessage", {
        message_id: this.origin.event.event_id,
        ...sharing,
      });
    },
    removeMessage: function () {
      this.$emit("removeMessage", {
        message_id: this.origin.event.event_id,
      });
    },

    eventMessage: function (state) {
      state ? this.removeMessage() : this.selectMessage();
    },
  },
};
