import {mapState} from 'vuex';

import events from '@/components/events/list/index.vue'
import time from "../../chats/assets/time";
import f from "@/application/functions";

export default {
  name: 'chatList',
  props: {
    chat: Object,
    filterType: String
  },

  components: {
    events
  },

  data: function () {

    return {
      encryptedEvents: [],
      loading: false,
      scrolling: false,
      scrollingTo: 0,
      cancelNextScroll: false,
      timeline: null,
      lastEvent: {},
        scrollType: String,
      esize : {},
      p_b: false,
      p_f: false,

      updateTimeout: null,
      updateInterval: null,
      events: [],
      firstPaginate: true,
    }

  },

  mounted: function () {


    this.init()
    if (this.chat) {
      this.readAll()
    }

  },

  watch: {
    //$route: 'getdata'

    active : function(){

      if(this.minimized && !this.active){
        this.scrollToNew(0)
      }

      if(this.minimized && this.active){
        this.readAll();
      }

    }
  },
  computed: mapState({

    lloading: function () {
      return this.loading || this['p_f'] || this['p_b']
    },

    auth: state => state.auth,

    settings_read : state => !state.dontreadreceipts,

    eventsTypes: function () {
      var types = {
        'm.room.message': true,
        'p.room.encrypt.message': true,
        'm.room.image': true,
        'm.room.file': true,
        'm.room.member': true,
        'm.fully_read': true
      }

      if (_.toArray(this.chat && this.chat.currentState.members || {}).length > 2) {
        types['m.room.member'] = true
        types['m.room.power_levels'] = true
      }

      return types
    },

    pocketnet: state => state.pocketnet,
    minimized: state => state.minimized,
    active: state => state.active,

    bin: function (state) {
      return state.pocketnet
    },


  }),

  created() {
    this.updateInterval = setInterval(this.update, 300)
  },
  destroyed() {

    if (this.timeline) {
      this.timeline.unpaginate(this.timeline._eventCount, true)
    }

    clearInterval(this.updateInterval)
  },

  methods: {
    editingEvent: function ({event, text}) {
      this.$emit('editingEvent', {event, text})
    },
    replyEvent: function ({event}) {
      this.$emit('replyEvent', {event})
    },

    removeEvent: function (event) {
      this.chat.getLiveTimeline().removeEvent(event.event.event_id)
    },
    wh: function () {

      if (this.esize.clientHeight) return this.esize.clientHeight

    },
    getEvents: function () {
      var events = this.timeline.getEvents()
      // if (this.filterType !== 'images') {
        events = _.filter(events, e => {

          var type = e.event.type;

          if (e.localRedactionEvent() || e.getRedactionEvent()) return

          if (e.event.type === 'm.room.power_levels' && Object.keys(e.event.content.users).length === 1) {
            return
          }
          if (this.chat.currentState.getMembers().length <= 2 && e.event.type === 'm.room.member' && 'm.room.power_levels') {
            return
          }

          return !this.eventsTypes || this.eventsTypes[type]

        })

        events = events.reverse()

        this.relations(events)

        events = _.sortBy(events, function (e) {
          return e.replacingEventDate() || e.getDate() || Infinity
        })

        events = events.reverse()

        events = _.uniq(events, e => {
          return this.core.mtrx.clearEventId(e) || f.makeid()
        })

        events = _.sortBy(events, function (e) {
          return e.getDate() || Infinity
        })


        events = events.reverse()
      // }

      this.$emit('getEvents', events)

      return events

    },

    relations: function (events) {

      var ts = this.timeline._timelineSet

      _.each(events, (e) => {

        try {


          //if(!e.event.content.edited){
          var rt = ts.getRelationsForEvent(e.event.event_id, 'm.replace', 'm.room.message')

          if (rt) {
            var last = rt.getLastReplacement()

            if (last) {
              e.event.content.body = last.event.content.body
              e.event.content.edited = last.event.event_id
              e.event.content.block = last.event.content.block
              e.event.content.msgtype = last.event.content.msgtype
            }

          }

        } catch (e) {
          console.error(e)
        }


      })
    },
    mediaTimelineSet: async function () {
      var filter = new core.mtrx.sdk.Filter(client.getUserId())
      filter.setDefinition({
        "room": {
          "timeline": {
            "contains_url": true,
            "types": [
              "m.room.message",
            ],
          },
        }
      })
      filter.filterId = await client.getOrCreateFilter("FILTER_FILES_" + client.credentials.userId, filter);
      return this.chat.getOrCreateFilteredTimelineSet(filter)
    },
    init: async function () {

      this.loading = true
      this.firstPaginate = true

      var timeline = this.chat.getLiveTimeline();

      var ts;

      if (this.filterType === 'images') {
        this.scrollType = 'custom'
        ts = await this.mediaTimelineSet()

      } else {

        ts = timeline.getTimelineSet()

      }

      this.timeline = new this.core.mtrx.sdk.TimelineWindow(this.core.mtrx.client, ts)

      setTimeout(() => {

        this.timeline.load(/*null, (this.wh() || 600)*/).then(async r => {

          this.events = this.getEvents()


          this.loading = false;

          setTimeout(() => {

            this.autoPaginateAll()

          }, 300)

        }).catch(e => {
          this.loading = false;
        })

      }, 30)

    },

    autoPaginate: function (direction) {

      if (this.needLoad(direction)) {
        this.paginate(direction)
      }

    },


    paginate: function (direction, rnd) {
      //$(this.$el).find('.eventsflex')[0]

      if (!this.loading && this.timeline && !this['p_' + direction]) {

        if (this.timeline.canPaginate(direction) || rnd) {

          this['p_' + direction] = true

          let count = /*this.firstPaginate ? 24 : */20;

          this.timeline.paginate(direction, count).then(e => {

            return Promise.resolve()

          }).catch(e => {

            return Promise.resolve()

          }).then(r => {

            setTimeout(async () => {

              this.events = this.getEvents();

              this.firstPaginate = false

              this.readAll();

              this['p_' + direction] = false;

            }, 100)

          })

        }

      }

    },

    autoPaginateAll: function () {
      if (this.filterType === 'images') {
        this.autoPaginate('b')
      } else {
        this.autoPaginate('b')
        this.autoPaginate('f')
      }
    },

    needLoad: function (direction) {

      var r = false

      var scrollHeight = this.esize.scrollHeight || 0
      var scrollTop = this.esize.scrollTop || 0
      var clientHeight = Math.max(this.esize.clientHeight || 0, 800)

      if (direction == 'b') {

        var safespace = clientHeight

        if (scrollHeight - scrollTop < clientHeight + safespace) r = true
      } else {
        if (scrollTop < clientHeight) r = true
      }

      return r

    },

    readEvent: function (event) {

      var byme = this.core.mtrx.me(event.event.sender)

      if (byme) {
        return
      }
      this.core.mtrx.client.sendReadReceipt(event)
    },

    readFirst: function () {
      var events = this.timeline.getEvents();

      this.readEvent(events[0])
    },

    readLast: function () {
      var events = this.timeline.getEvents();

      this.readEvent(events[events.length - 1])
    },

    readEvents: function (events) {
      _.each(events, (e) => {
        this.readEvent(e)
      })
    },
    readOne() {
      this.core.mtrx.client(this.chat.timeline[this.chat.timeline.length - 1]).then(r => {
        return r
      })
    },
    readAll: function () {

      if(
        document.hasFocus() &&
        (!this.pocketnet || (this.active)) &&
        !this.core.hiddenInParent &&
        this.chat && this.chat.getJoinedMemberCount() > 0 &&
        this.chat.getUnreadNotificationCount() !== 0)

        setTimeout(() => {

          if (!this.chat) return

          var i = this.chat.timeline.length - 1
          var event = null

          while (i >= 0 && !event) {

            var e = this.chat.timeline[i]

            if (!this.core.mtrx.me(e.sender.userId)) {
              event = e
            }

            i--
          }


          this.core.mtrx.client.setRoomReadMarkers(
            this.chat.currentState.roomId,
            e.eventId,
            e, {
              hidden : !this.settings_read ? true : false
            }).then(r => {

            return r
          })

        }, 1000)

    },

    //////////////


    scrollE: function (size) {

        this.updatedSize(size)
        this.$emit('scroll', size)

    },

    updatedSize: function (size) {
      this.esize = size
    },

    update: function (e) {
      if (!this.scrolling) {
        this.autoPaginateAll()
      } else {
        // e.preventDefault()
      }
    },


    scrollToNew: function (s) {
      this.scrolling = true

      this.$refs.eventslist.scrollToNew(s)

      this.scrolling = false

    },


    imageGallery: function (e) {
      this.$emit('eventImage', e)
    },

    menuIsVisibleHandler: function (isVisible) {
      this.$emit('menuIsVisible', isVisible);
    }
  },
}