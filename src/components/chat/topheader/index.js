import { mapState } from "vuex";

import chatName from "@/components/chats/assets/name.vue";
import chatIcon from "@/components/chats/assets/icon.vue";
import chatTyping from "@/components/chats/assets/typing.vue";
import contacts from "@/components/contacts/index.vue";
import f from "@/application/functions";

export default {
  name: "chatTopheader",
  props: {
    chat: Object,
    u: String,
    roomInfo: false,
    aboutUser: false,
  },

  components: {
    chatName,
    chatIcon,
    chatTyping,
    contacts,
  },

  data: function () {
    return {
      menuItems: [
        {
          click: "callupVideoHandler",
          title: this.$i18n.t("caption.videocall"),
          icon: "fas fa-camera",
        },

        {
          click: "callupHandler",
          title: this.$i18n.t("caption.call"),
          icon: "fas fa-phone",
        },
      ],

      menuItemsRoom: [
        {
          click: "AddMember",
          title: this.$i18n.t("caption.add"),
          icon: "fas fa-user-plus",
        },

        {
          click: "MuteRoom",
          title: this.$i18n.t("caption.mute"),
          icon: "fas fa-bell-slash",
        },
        {
          click: "LeaveFromRoom",
          title: this.$i18n.t("caption.leaveAndDelete"),
          icon: "fas fa-sign-out-alt",
        },
      ],
      menuItemsRoomMuted: [
        {
          click: "AddMember",
          title: this.$i18n.t("caption.add"),
          icon: "fas fa-user-plus",
        },

        {
          click: "MuteRoom",
          title: this.$i18n.t("caption.unmute"),
          icon: "fas fa-bell",
        },
        {
          click: "LeaveFromRoom",
          title: this.$i18n.t("caption.leaveAndDelete"),
          icon: "fas fa-sign-out-alt",
        },
      ],

      oneToOne: [
        {
          click: "MuteRoom",
          title: this.$i18n.t("caption.mute"),
          icon: "fas fa-bell-slash",
        },
        /*{
          click: "LeaveFromRoom",
          title: "Leave and Delete",
          icon: "fas fa-sign-out-alt"
        },*/
        {
          click: "Donate",
          title: this.$i18n.t("caption.donate"),
          icon: "fas fa-money-bill-wave",
        },
      ],
      oneToOneMuted: [
        {
          click: "MuteRoom",
          title: this.$i18n.t("caption.unmute"),
          icon: "fas fa-bell",
        },
        {
          click: "LeaveFromRoom",
          title: this.$i18n.t("caption.leaveAndDelete"),
          icon: "fas fa-sign-out-alt",
        },
        {
          click: "Donate",
          title: this.$i18n.t("caption.donate"),
          icon: "fas fa-money-bill-wave",
        },
      ],
      donateMenu: [
        {
          click: "Donate",
          title: this.$i18n.t("caption.donate"),
          icon: "fas fa-money-bill-wave",
        },
      ],

      loading: false,
      typing: false,
      userinfo: null,
      aboutUserShow: false,
      roomBanned: false,
      roomMuted: false,

      // --- Variables for the donation part ---
      // Boolean when the donation modal is open
      donateUserOpened: false,
      // Object containing the receiver informations
      receiver: null,
      // How much PKOIN we want to donate
      donationAmount: 0,
      // Optional message for the transaction
      donationMessage: "",
      // Calculated fees needed for the transaction
      calculatedFees: null,
      // Booleans to show errors
      showFeesError: "",
      showTransactionError: "",
      // Booleans to show spinners
      calculatingFees: false,
      sending: false,
      // To choose by who the fee should be payed by
      feesDirection: "include",
      feesDirectionPossibleValues: [
        {
          value: "include",
          label: this.$i18n.t("caption.toBePaidByReceiver"),
        },
        {
          value: "exclude",
          label: this.$i18n.t("caption.toBePaidBySender"),
        },
      ],
    };
  },

  watch: {
    //$route: 'getdata'
  },

  mounted: function () {
    this.getuserinfo();
  },

  computed: mapState({
    callsEnabled: (state) => state.isCallsEnabled,

    isGroup: function () {
      return this.m_chat.name.slice(0, 1) === "@";
    },

    auth: (state) => state.auth,

    isCallsActive: (state) => state.isCallsActive,

    m_chat: function () {
      if (this.chat && this.chat.roomId) {
        let pushRules = this.core.mtrx.client._pushProcessor.getPushRuleById(
          this.chat.roomId
        );
        if (pushRules !== null) {
          this.roomMuted = true;
        }
        var m_chat = this.core.mtrx.client.getRoom(this.chat.roomId);
        return m_chat || {};
      }
    },
    m_chat_typing: function () {
      if (!this.chat) return false;

      var chat = this.chat.roomId;
      var typing = this.$store.state.typing[chat] || {};

      var userTyping = _.find(typing, (t, i) => {
        if (t) {
          if (i == this.core.user.userinfo?.id) return false;

          return true;
        }
      });

      return userTyping || false;
    },

    totalDonationAmount: function () {
      return this.feesDirection == "include"
        ? this.donationAmount
        : this.donationAmount + this.calculatedFees;
    },
  }),
  methods: {
    bcCall: function () {
      let res = this.m_chat.currentState.getStateEvents("m.room.calls");
      let isEnable = res[res.length - 1]?.event?.content?.enabled
        ? true
        : res[res.length - 1]?.event?.content?.enabled == undefined
        ? true
        : false;
      if (
        !isEnable &&
        this.m_chat.myUserId !== res[res.length - 1]?.event?.sender
      ) {
        console.log(
          "The user has restricted the possibility of calls",
          res[res.length - 1]?.event?.content?.enabled
        );
        return;
      }
      let local = document.querySelector("body");
      try {
        let matrixCall = this.core.mtrx.bastyonCalls.initCall(
          this.chat.roomId,
          local
        );
        console.log(matrixCall);
        if (matrixCall) this.$store.dispatch("CALL", matrixCall);
      } catch (e) {
        console.log("ошибка при создании звонка", e);
        return;
      }
    },

    navigateToProfile(id) {
      this.$router
        .push({ path: `/contact?id=${f.getmatrixid(id)}` })
        .catch((e) => {});
    },
    getuserinfo: function () {
      if (this.u) {
        this.core.user.usersInfo(this.u).then((info) => {
          this.userinfo = info[0];
        });
      }
    },
    // Return the another member in the chat
    // (it returns the last one, so make sense only for the one to one chat)
    // If no user found, return undefined
    findOtherUser: function () {
      let my = this.m_chat.myUserId;
      let receiver;
      let members = this.m_chat.currentState.getMembers();
      members.forEach(function (member) {
        if (member && member.userId !== my) receiver = member;
      });
      return receiver;
    },
    addMember() {
      this.modalInviteUser();
    },
    menuItemClickHandler(item, rowObject) {
      if (item.click === "AddMember") {
        this.$emit("addMember", true);
        this.$refs.dropdownMenu.hidePopup();
      }

      if (item.click === "MuteRoom") {
        var roomId = this.chat.roomId;
        var deviceID = this.core.mtrx.client.deviceId;
        let self = this;
        let pushRules = this.core.mtrx.client._pushProcessor.getPushRuleById(
          this.chat.roomId
        );
        if (pushRules !== null) {
          self.core.mtrx.client.deletePushRule("global", "room", roomId);
          this.roomMuted = false;
        } else {
          self.core.mtrx.client.setRoomMutePushRule("global", roomId, "true");
          this.roomMuted = true;
        }
        this.$refs.dropdownMenu.hidePopup();
      }

      if (item.click === "LeaveFromRoom") {
        let self = this;

        this.core.mtrx.client.leave(this.chat.roomId).then((r) => {
          this.core.mtrx.client
            .forget(this.chat.roomId, true)
            .then((r) => {
              this.$store.commit("DELETE_ROOM", this.chat.roomId);
            })
            .then((r) => {
              this.$router.push({ path: "/chats" }).catch((e) => {});
            });
        });

        this.$refs.dropdownMenu.hidePopup();
      }

      if (item.click === "BanRoom") {
        let banUserId = "";
        let banUser = this.findOtherUser();
        if (banUser && banUser.userId) banUserId = banUser.userId;
        let roomID = this.chat.roomId;
        this.core.mtrx.client.ban(roomID, banUserId, "ban").then((r) => {});
        this.roomBanned = true;
        this.$refs.dropdownMenu.hidePopup();
      }

      if (item.click === "Unban") {
        let banUserId = "";
        let banUser = this.findOtherUser();
        if (banUser && banUser.userId) banUserId = banUser.userId;
        this.core.mtrx.client.unban(this.chat.roomId, banUserId).then((r) => {
          this.core.mtrx.client.invite(this.chat.roomId, banUserId);
        });
        this.roomBanned = false;
        this.$refs.dropdownMenu.hidePopup();
      }

      if (item.click === "Donate") {
        // Open modal
        this.donateUserOpened = true;
        // Close dropdown menu
        this.$refs.dropdownMenu.hidePopup();
        // Find the user we are about to donate to
        let receiverObj = this.findOtherUser();
        this.receiver = receiverObj
          ? this.$f.deep(
              this,
              "$store.state.users." + this.$f.getmatrixid(receiverObj.name)
            )
          : null;
      }
    },

    closeDonateModal() {
      this.donateUserOpened = false;
    },

    onCalculateFeesClick() {
      this.calculatingFees = true;
      this.calculateFees().finally(() => (this.calculatingFees = false));
    },

    calculateFees() {
      var self = this;
      this.showFeesError = "";
      return new Promise((resolve, reject) => {
        // Check parameters
        if (
          this.donationAmount <= 0 ||
          !this.receiver ||
          !this.receiver.source ||
          !this.receiver.source.address
        ) {
          this.showFeesError = "invalid";
          return reject("Missing amount or receiver");
        }
        // Try calculating fees
        try {
          var sdk = window.POCKETNETINSTANCE.platform.sdk;
          sdk.node.fee.estimate(function (fees) {
            var outputs = [
              {
                address: self.receiver.source.address,
                amount: self.donationAmount,
              },
            ];
            sdk.wallet.txbase(
              [sdk.address.pnet().address],
              outputs,
              0,
              self.feesDirection,
              function (err, inputs, _outputs) {
                if (err) {
                  console.error(err);
                  self.showFeesError = err;
                  return reject(err);
                }
                var tx = sdk.node.transactions.create.wallet(inputs, _outputs);
                var totalFees = Math.min(
                  tx.virtualSize() * fees.feerate,
                  0.0999
                );
                // Got the fees
                self.calculatedFees = totalFees;
                return resolve();
              }
            );
          });
        } catch (err) {
          console.error(err);
          self.showFeesError = err;
          return reject(err);
        }
      });
    },

    async sendDonation() {
      var self = this;
      this.sending = true;
      this.showTransactionError = "";
      // Recalculate the fees just before sending
      try {
        await this.calculateFees();
      } catch (err) {
        this.showTransactionError = "error";
        this.sending = false;
        return;
      }
      // Check if current balance is enough
      var sdk = window.POCKETNETINSTANCE.platform.sdk;
      sdk.node.transactions.get.canSpend(
        sdk.address.pnet().address,
        (currentBalance) => {
          // If balance is too low
          if (
            !currentBalance ||
            isNaN(currentBalance) ||
            currentBalance < self.totalDonationAmount
          ) {
            self.showTransactionError = "balance too low";
            self.sending = false;
            return;
          }
          // Start the send transaction process
          try {
            var outputs = [
              {
                address: self.receiver.source.address,
                amount: self.donationAmount,
              },
            ];
            sdk.wallet.embed(outputs, self.donationMessage);
            // Create a transaction
            sdk.wallet.txbase(
              [sdk.address.pnet().address],
              outputs,
              self.calculatedFees,
              self.feesDirection,
              function (err, inputs, _outputs) {
                if (err) {
                  console.error(err);
                  self.showTransactionError = "error";
                  self.sending = false;
                  return reject(err);
                }
                var tx = sdk.node.transactions.create.wallet(inputs, _outputs);
                inputs.forEach((t) => {
                  t.cantspend = true;
                });
                // Try sending the transaction
                sdk.node.transactions.send(tx, function (d, err) {
                  if (err) {
                    sdk.node.transactions.releaseCS(inputs);
                    self.showTransactionError = "error";
                    self.sending = false;
                    return;
                  }
                  // Transaction has been sent
                  var ids = inputs.map((i) => i.txid);
                  sdk.node.transactions.clearUnspents(ids);
                  sdk.wallet.saveTempInfoWallet(d, inputs, _outputs);
                  // Send an event to the chat
                  self.core.mtrx.client.sendEvent(
                    self.chat.roomId,
                    "m.room.message",
                    {
                      from: self.$f.getmatrixid(self.m_chat.myUserId),
                      to: self.receiver.id,
                      amount: self.donationAmount,
                      txId: d,
                      msgtype: "m.notice",
                    },
                    ""
                  );
                  // Close the donation modal
                  self.closeDonateModal();
                });
              }
            );
          } catch (err) {
            console.error(err);
            self.showTransactionError = "error";
            self.sending = false;
          }
        }
      );
    },

    resetDonation() {
      this.calculatedFees = null;
      this.showFeesError = "";
      this.showTransactionError = "";
    },
  },
};
