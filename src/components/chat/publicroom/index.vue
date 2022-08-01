<template>
  <div class="chatpublicroom">
    <div v-if="ready">
      <div class="publicPreviewContent" v-if="room.length > 0">
        <div class="name">
          <span>{{ room[0].name }}</span>
        </div>
        <div class="topic" v-if="room[0].topic">
          <span>{{ room[0].topic.replace(/_/g, " ") }}</span>
        </div>
        <div class="membersCount">
          <i class="fas fa-users"></i>
          <span
            ><b>{{ room[0].num_joined_members }}</b> Users in room</span
          >
        </div>
        <div class="actions">
          <button class="button small rounded" @click="joinRoom()">
            {{ $t("button.join") }}
          </button>
        </div>
      </div>

      <div class="empty" v-else>
        <div class="caption">
          <span>Room not found</span>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="empty">
        <linepreloader />
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.empty
  padding : 4 * $r
  text-align: center

  span
    font-size: 0.9em
</style>

<script>
import { mapState } from "vuex";
import topheader from "@/components/assets/topheader/index.vue";

export default {
  name: "chatpublicroom",
  props: {
    id: String,
  },
  data: function () {
    return {
      ready: false,
      room: {},
    };
  },
  components: {
    topheader,
  },
  computed: mapState({
    active: (state) => state.active,
    pocketnet: (state) => state.pocketnet,
    minimized: (state) => state.minimized,
    pocketteammessages: (state) => state.pocketteammessages,
  }),
  methods: {
    joinRoom() {
      this.core.mtrx.client.joinRoom(this.room[0].room_id).then((r) => {
        this.$router.push("/chat?id=" + this.room[0].room_id);
      });
    },
  },

  mounted() {
    //////////////// get public room by id

    this.core.mtrx.wait().then((r) => {
      this.core.mtrx.client.publicRooms().then((r) => {
        this.ready = true;

        if (this.id[0] === "!") {
          return (this.room = r["chunk"].filter((i) => i.room_id === this.id));
        } else {
          return (this.room = r["chunk"].filter(
            (i) => i.name === this.id.replace(/_/g, " ")
          ));
        }
      });
    });
  },
};
</script>
<style lang="sass" scoped>
.empty
    padding : 4 * $r
    text-align: center

    span
        font-size: 0.9em

.publicPreviewContent

    .name
        padding: 3 * $r 2 * $r
        text-align: center

        span
            font-weight: bold
            font-size: 2em

    .topic
        text-align: center
        padding: 0 4 * $r

        span
            font-size: 1em
            width: 100%
            display: block
            word-wrap: break-word

    .membersCount
        display: flex
        flex-direction: column
        justify-content: center
        align-items: center
        text-align: center

        span
            display: block
            font-size: 0.8em

        i
            font-size: 1.2em
            color: srgb(--color-txt-ac)
            margin: 20px 0 10px 0

    .actions
        display: flex
        justify-content: center
        align-items: center
        margin: 50px auto
</style>
