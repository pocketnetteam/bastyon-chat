import _ from "underscore/underscore-node.mjs";
import { mapActions, mapState } from "vuex";
import previewRoom from "@/components/chats/preview/index.vue";
import previewContact from "@/components/contacts/preview/index.vue";

export default {
  name: "allContacts",

  components: {
    previewRoom,
    previewContact,
  },

  inject: ["matches"],

  props: {
    chats: Array,
    mode: {
      default: "",
      type: String,
    },
  },

  data: function () {
    return {
      loading: false,

      users: [],
      contacts: [],
      lists: ["contacts", "other", "chats"],
      searchChanged: true,
    };
  },

  computed: {
    ...mapState(["contactsMap"]),

    filteredChats() {
      let chats = this.chats;

      if (this.matches?.value) {
        let mc = _.filter(
          _.map(chats, (c) => {
            const users = this.core.mtrx.chatUsersInfo(
                c.roomId,
                "anotherChatUsers"
              ),
              mChat = this.core.mtrx.client.getRoom(c.roomId),
              userNameString = _.reduce(
                users,
                (m, u) => m + u.name.toLowerCase(),
                ""
              );

            let chatName = "";

            /*Search by chat name*/
            if (
              mChat &&
              mChat.getJoinRule() === "public" &&
              mChat.currentState.getStateEvents("m.room.name", "").length > 0
            ) {
              chatName = mChat.currentState
                .getStateEvents("m.room.name", "")[0]
                ?.getContent().name;
            }

            /*Search by messages*/
            const messages = (c.events || []).filter((m) => {
              const match = (m.event.decrypted || m.event.content).body
                .toLowerCase()
                .includes(this.matches?.value);

              return (match && m.event) || null;
            });

            /*Filter chat that not reach search*/
            if (!chatName || messages.length) {
              chatName = mChat.name;

              if (chatName[0] === "#") chatName = "";
            }

            const uString = (chatName + userNameString).toLowerCase();
            let point = 0;

            if (uString.includes(this.matches.value) || messages.length) {
              point = this.matches.value.length / uString.length;
            }

            return {
              chat: mChat,
              point,
            };
          }),
          (cc) => cc.point
        );

        mc = _.sortBy(mc, (cc) => cc.point).reverse();
        chats = mc
          .filter((c) => {
            /*Exclude tetatet chats when contacts found*/

            return !_.filter(
              this.contacts,
              (u) =>
                c.chat.tetatet &&
                Object.keys(c.chat.currentState.members || {}).find((f) =>
                  f.includes(u.id)
                )
            ).length;
          })
          .map((c) => c.chat.summary);
      }

      return chats;
    },

    filteredContacts() {
      /*Add my contacts*/
      this.contacts = _.filter(this.contactsMap, (contact) => {
        return contact.name
          .toLowerCase()
          .includes(this.matches.value.toLowerCase());
      });

      return this.contacts;
    },

    filteredOther() {
      /*Add bastyon contacts*/
      if (this.matches.value.length > 3 && this.searchChanged) {
        this.core.user.searchContacts(this.matches.value).then((users) => {
          this.users = _.filter(users || [], (u) => {
            /*Exclude myself and users from contacts*/
            return (
              u.id !== this.core.user.userinfo.id &&
              !_.filter(this.contacts, (f) => f.id === u.id).length
            );
          });
        });

        this.searchChanged = false;
      }

      return this.users;
    },
  },

  methods: {
    getList(list) {
      return (
        this[`filtered${list.charAt(0).toUpperCase() + list.slice(1)}`] || []
      );
    },

    loadList(list) {
      return this.getList(list);
    },

    itemClick(item) {
      if (!item.events) {
        return this.navigateToProfile(item.id, item);
      }

      if (this.mode) {
        this.$store.commit("active", true);
        this.$store.commit("blockactive", { value: true, item: "main" });
        this.$store.commit("setiteraction", true);

        /*if (
          !this.share &&
          this.$store.state.lastroom &&
          this.$store.state.lastroom.id == item.roomId) {
          this.$router.push('chat?id=' + this.$store.state.lastroom.id)
        }*/
      } else {
        if (this.share) {
          var _share = this.share;

          this.$store.commit("SHARE", null);

          this.$store.commit("icon", {
            icon: "loading",
            message: "",
            manual: true,
          });

          console.log("_share", _share);

          this.core.mtrx
            .shareInChat(item.roomId, _share)
            .then((r) => {
              this.$store.commit("icon", {
                icon: "success",
                message: "",
              });

              this.$router
                .push(_share.route || "chat?id=" + item.roomId)
                .catch((e) => {});
            })
            .catch((e) => {
              console.error(e);

              this.$store.commit("icon", {
                icon: "error",
                message: "",
              });

              if (_share.route) {
                this.$router.push(_share.route).catch((e) => {});
              }
            });
        } else {
          this.$router.push("chat?id=" + item.roomId).catch((e) => {});
        }
      }
    },
    navigateToProfile(id, contact) {
      if (this.mode === "Select") {
        this.select(contact);
      } else {
        this.$router.push({ path: `/contact?id=${id}` }).catch((e) => {});
      }
    },
  },

  watch: {
    "matches.value": function () {
      this.searchChanged = true;
      this.users = [];
    },
  },
};
