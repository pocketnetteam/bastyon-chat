import { mapState } from "vuex";
import chatIcon from "@/components/chats/assets/icon.vue";
export default {
  data: () => ({
    pubChat: Object,
    topicTxt: "",
    topic: false,
  }),
  props: {
    chat: Object,
    saveClicked: false,
  },

  components: {
    chatIcon,
  },
  computed: mapState({
    pocketnet: (state) => state.pocketnet,
    minimized: (state) => state.minimized,
    active: (state) => state.active,
    auth: (state) => state.auth,
    m_chat: function () {
      return this.core.mtrx.client.getRoom(this.chat.roomId);
    },
    shareRoomLink: function () {
      return `https://${
        this.core.domain
      }/publicPreview/welcome?connect=${this.chat.roomId.replace("!", "%")}`;
    },
  }),
  mounted() {
    if (this.m_chat.getJoinRule() === "public") {
      this.getPublicRoom();
      this.topic = true;
    }
  },
  methods: {
    saveEdited() {
      this.core.mtrx.client.setRoomName(
        this.m_chat.roomId,
        "@" + this.m_chat.name.replace(/[@]*/g, "")
      );
      this.core.mtrx.client
        .setRoomTopic(this.chat.roomId, this.topicTxt.replace(/ /g, "_"))
        .then((r) => {
          return r;
        });
    },
    getPublicRoom() {
      this.core.mtrx.client.publicRooms().then((r) => {
        this.pubChat = r.chunk.filter(
          (room) => room.room_id === this.chat.roomId
        )[0];
        if (this.pubChat["topic"]) {
          this.topicTxt = this.pubChat["topic"].replace(/_/g, " ");
        }
      });
    },
  },
};
