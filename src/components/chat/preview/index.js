import {mapState} from 'vuex';
import chatName from '@/components/chats/assets/name.vue'
import chatIcon from '@/components/chats/assets/icon.vue'
import userView from '@/components/user/view/pnuser/index.vue'
import {Swiper, SwiperSlide} from 'vue-awesome-swiper'
import 'swiper/swiper-bundle.css'
//
import {Carousel, Slide} from 'vue-carousel';
import f from '@/application/functions.js'
import _ from "underscore";
//

export default {
  name: 'chatPreview',
  props: {
    chat: Object,
    usersinfo: Array,
    room: {},
    undefinedRoom: false
  },

  components: {
    userView,
    chatName,
    chatIcon,
    Swiper,
    SwiperSlide,
    Carousel,
    Slide
  },

  data: function () {

    return {
      loading: false,
      swiperOption: {
        direction: 'horizontal',
        pagination: {
          el: '.swiper-pagination',
        }
      },
     // pUsers: []
    }

  },

  computed: {

    users : function(){
      if(!this.chat) return []

      return this.core.mtrx.chatUsersInfo(this.chat.roomId, 'anotherChatUsers')
    },

    /*roomMembers: function () {

      var self = this
      var my = f.getmatrixid(this.core.mtrx.client.credentials.userId)
      var names = _.map(self.chat.members, function (member) {
        return member.name
      })

      this.core.user.usersInfo(names).then(r => {
        this.pUsers = r
      }).catch(e => {
        console.log(e, "eeerror name")
      })
      return this.chat.members
    }*/
  }
}