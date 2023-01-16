<template>
  <div id="chatTopheader">

    <topheader v-if="chat || u">

      <template v-slot:left>
        <backButton action="chats"/>
      </template>

      <template v-slot:leftadd>
        <search :minimize="!matches.value" />
      </template>

      <template v-slot:info>
        <router-link v-if="chat" :to="'chatInfo?id=' + chat.roomId">

          <div v-if="m_chat">

            <div class="nameWrapper">
              <chatName :preview="true" :chat="chat" :m_chat="m_chat" v-if="!roomInfo"/>
              <div class="roomMuted" v-if="roomMuted">
                <i class="fas fa-bell-slash"></i>
              </div>
            </div>
            <transition name="fade">
              <chatTyping v-if="m_chat_typing"/>
            </transition>

          </div>

          <div v-if="!m_chat && userinfo">
            <span class="nameline">{{ userinfo.name }}</span>
          </div>

        </router-link>
      </template>

      <template v-slot:rightadd v-if="callsEnabled">
        <div v-if="isCallsActive && !isGroup" class="call btn iconbutton" @click="bcCall" ><i class="fas fa-video"></i></div>
      </template>

      <template v-slot:right>
        <router-link v-if="chat" :to="'chatInfo?id=' + chat.roomId">
          <div class="iconbutton"><i class="fas fa-ellipsis-h"></i></div>
        </router-link>
      </template>

      <template v-slot:rightadd>
        <div class="encrypted" v-if="isChatEncrypted.value" @mouseover="e => hoverEncrypt = true">
          <i class="fas fa-lock"></i>
        </div>

        <div v-if="hoverEncrypt" class="encryptedInfo" @mouseover="e => hoverEncrypt = true" @mouseleave="e => hoverEncrypt = false" @click="e => hoverEncrypt = !hoverEncrypt">
          <div id="slide">
            <div class="encryptedTxtIcon">
              <i class="fas fa-user-shield"></i>
              <span>{{ $t("caption.encrypted") }}</span>
            </div>
          </div>
        </div>
      </template>

      <!--<template v-slot:right>
        <div class="icon iconbutton" v-if="m_chat && m_chat.currentState.getMembers().length > 2">
          <div v-if="!roomMuted">
            <dropdownMenu
                class="chatRightMenu"
                @itemClicked="menuItemClickHandler"
                ref="dropdownMenu"
                :menuItems="menuItemsRoom"
                :rowObject="{}"
                icon="fas fa-ellipsis-h"
            />
          </div>
          <div v-if="roomMuted">
            <dropdownMenu
                class="chatRightMenu"
                @itemClicked="menuItemClickHandler"
                ref="dropdownMenu"
                :menuItems="menuItemsRoomMuted"
                :rowObject="{}"
                icon="fas fa-ellipsis-h"
            />
          </div>
        </div>
        <div class="icon iconbutton" v-else>
          <div v-if="!roomMuted">
            <dropdownMenu
                class="chatOneToOne"
                @itemClicked="menuItemClickHandler"
                ref="dropdownMenu"
                :menuItems="oneToOne"
                :rowObject="{}"
                icon="fas fa-ellipsis-h"
            />
          </div>
          <div v-if="roomMuted">
            <dropdownMenu
                class="chatOneToOne"
                @itemClicked="menuItemClickHandler"
                ref="dropdownMenu"
                :menuItems="oneToOneMuted"
                :rowObject="{}"
                icon="fas fa-ellipsis-h"
            />
          </div>

        </div>
      </template>-->
    </topheader>

    <!-- Donation modal -->
    <modal @close="closeDonateModal" v-if="donateUserOpened">
      <template v-slot:header>
        <span>{{ $t("caption.donate") }}</span>
      </template>
      <template v-slot:body>
        <div class="donationModalBody">
          <!-- Source -->
          <span>{{ $t("caption.source") }}</span>
          <input type="text" value="Account Address" :disabled="true" class="disabled"/>
          <!-- Amount to donate input -->
          <span>{{ $t("caption.amount") }}</span>
          <input type="number" v-model.number="donationAmount" @keyup="resetDonation()" :disabled="sending"/>
          <!-- Receiver -->
          <span>{{ $t("caption.receiver") }}</span>
          <input type="text" :value="(receiver) ? receiver.name : ''" :disabled="true" class="disabled"/>
          <!-- Message -->
          <span>{{ $t("caption.message") }}</span>
          <input type="text" placeholder="Your message" v-model="donationMessage" :disabled="sending"/>
          <!-- Error -->
          <span class="error" v-if="showFeesError && showFeesError == 'money'">{{ $t("caption.balanceTooLow") }}</span>
          <span class="error" v-else-if="showFeesError">{{ $t("caption.transactionError") }}</span>
          <!-- Calculate fees button -->
          <button v-if="calculatingFees != true" class="button small" v-on:click="onCalculateFeesClick" :disabled="!donationAmount || calculatedFees != null">
            <i class="fas fa-chevron-circle-right"></i> {{ $t("caption.calculateFees") }}
          </button>
          <div v-if="calculatingFees == true" class="linepreloader">
            <linepreloader />
          </div>
        </div>
        <div class="donationModalBody" v-if="calculatedFees != null">
          <!-- Include Fees in Amount -->
          <span>{{ $t("caption.includeFeesInAmount") }}</span>
          <select v-model="feesDirection" :disabled="sending">
            <option v-for="feeDirection in feesDirectionPossibleValues" v-bind:value="feeDirection.value">
              {{ feeDirection.label }}
            </option>
          </select>
          <!-- Transaction Fees -->
          <span>{{ $t("caption.transactionFees") }}</span>
          <input type="number" :value="calculatedFees" :disabled="true" class="disabled"/>
          <!-- Total -->
          <span>{{ $t("caption.totalAmount") }}</span>
          <span class="totalAmount">{{+totalDonationAmount.toFixed(5)}} PKOIN</span>
          <!-- Error -->
          <span class="error" v-if="showTransactionError && showTransactionError == 'balance too low'">{{ $t("caption.balanceTooLow") }}</span>
          <span class="error" v-else-if="showTransactionError">{{ $t("caption.transactionError") }}</span>
          <!-- Send button -->
          <button v-if="sending != true" class="button small" v-on:click="sendDonation" :disabled="sending">
            <i class="fas fa-arrow-alt-circle-right"></i> Send
          </button>
          <div v-if="sending == true" class="linepreloader">
            <linepreloader />
          </div>
        </div>
      </template>
      <template v-slot:footer></template>
    </modal>

  </div>
</template>

<script src="./index.js"></script>
<style scoped lang="sass" src="./index.sass"></style>

<!-- THEMES BEGIN -->
<!-- THEMES END -->





















