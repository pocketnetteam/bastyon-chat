var _ = require('underscore');
const SHA2 = require("sha2");
import f from "@/application/functions";

var cachestorage = {}

class MTRXKIT {

  constructor(core, p) {
    if (!p) p = {}

    this.core = core
  }

  tetatetchat(m_chat){
    if(!m_chat) return false
 
    if(typeof m_chat.tetatet != 'undefined') return m_chat.tetatet

    var users = this.core.mtrx.chatUsersInfo(m_chat.roomId)
    var tt = false

    if(users.length == 2){
      tt = m_chat.name == '#' + this.tetatetid(users[0], users[1])
    }
    if(users.length > 1)
      m_chat.tetatet = tt

    return tt
  }

  tetatetid(user1, user2) {

    var seed = 2;

    if(user1.id == user2.id) return null

    var id = parseInt(user1.id, 16) * parseInt(user2.id, 16) * seed

    if(cachestorage[id]) return cachestorage[id]

    var hash = SHA2.sha224(id.toString()).toString('hex')

    cachestorage[id] = hash

    return hash
  }

  unknowngroupusers(m_chat){
    return m_chat && m_chat._selfMembership === 'invite' && !m_chat.summary.members && !this.tetatetchat(this.m_chat)
  }

  usersFromChats(m_chats){
    var users = {}
    
    _.each(m_chats, (chat) => {

      users[chat.roomId] = _.map(_.uniq([].concat(_.toArray(chat.currentState.members), chat.summary.members || []), (r) => {
        return r.userId

      }), function(r){

        return {
          userId : f.getmatrixid(r.userId),
          membership : r.membership,
          powerLevel : r.powerLevel
        }

      }) 
    })



    return users
  }

  prepareChat(m_chat){
		return this.usersInfoForChatsStore([m_chat]).then(() => {
      return this.core.pcrypto.addroom(m_chat)
    })
	}

  fillContacts(m_chats){

    m_chats = _.filter(m_chats, (ch) => {
      return ch._selfMembership == 'join' && ch.name.length == 57
    })

    return this.usersInfoForChatsStore(m_chats).then(i => {

      this.core.store.commit('SET_CONTACTS_FROM_MATRIX', _.filter(i, (m) => {
        return !this.core.user.userinfo || m.id !== this.core.user.userinfo.id
      }))

    })
  }

  usersInfoForChatsStore(m_chats, reload){

    return this.usersInfoForChats(m_chats, reload).then(i => {

      this.core.store.commit('SET_CHATS_USERS', this.usersFromChats(m_chats))

      return Promise.resolve(i)
    }).catch(e => {
      return Promise.resolve()
    })
  }

  allchatmembers(m_chats, reload, withinvite){
    var members = []
    var promises = []


    if(withinvite){
      var promises = _.map(m_chats, (chat) => {


        if(chat._selfMembership === 'invite' && (!chat.summary.members || reload) && !chat.summary.membersloading){
  
          chat.summary.membersloading = true
  
          return chat._loadMembersFromServer().then(r => {
  
            chat.summary.membersloading = false
  
            chat.summary.members = _.map(r,  (user) => {
    
              return {
                name: f.getmatrixid(user.state_key),
                membership: user.content.membership,
                user: user,
                userId : user.state_key,
                powerLevel : user.content.powerLevel || 0
              }
    
            })
  
            if(chat._selfMembership === 'invite' && this.core.user.userinfo){
  
              if(!_.find(chat.summary.members, (m) => {
                return m.userId == this.core.user.matrixId(this.core.user.userinfo.id)
              } )){
  
                chat.summary.members.push({
                  name: this.core.user.userinfo.id,
                  membership: 'invite',
                  user: this.core.user.userinfo,
                  userId : this.core.user.matrixId(this.core.user.userinfo.id),
                  powerLevel : 0
                })
  
              }
  
            }
  
            return Promise.resolve()
    
          }).catch(e => {
              
            chat.summary.membersloading = false
  
            return Promise.resolve()
          })
        }
  
        return Promise.resolve()
  
      })
    }

    return Promise.all(promises).then(r => {

      _.each(m_chats, (chat) => {
        members = members.concat(_.toArray(chat.currentState.members), chat.summary.members || [])
      })

      members = _.uniq(members, function(m){
        return m.userId
      })

      return Promise.resolve(members)
    })
  }

  usersInfoForChats(m_chats, reload) {

    /// TODO FILTER CONTACTS

    return this.allchatmembers(m_chats, reload).then(members => {

      return this.usersInfo(members, reload)
    })
    
  }

  usersInfo(members, reload) {

    var ids = _.map(members, function (m) {
      return f.getmatrixid(m.userId)
    })

    ids = _.uniq(ids)

    return this.core.user.usersInfo(ids, false, reload)
  }

  groupId(users) {
    let id = [];
    let idForInviting = []
    let self = this

    users.forEach( (user) => {
      idForInviting.push( this.core.user.matrixId(user.id) )
    })

    users.forEach(function (user) {
      let idsForHash = parseInt(user.id, 16)

      id.push(idsForHash)
    })

    const groupNameId = id.reduce((product, n) => product * n, 1);
    const mGroupNamId = f.makeid(groupNameId)
    let hash = SHA2.sha224(mGroupNamId.toString()).toString('hex')

    return {hash: hash, idForInviting: idForInviting}

  }

  groupIdLight(ids) {

    let id = [];
    let idForInviting = []
    let self = this

    var domains = [null]

    if (window.chatinvitedomains) domains = [].concat(domains, window.chatinvitedomains)

    _.each(domains, (domain) => {

      _.each(ids, (id) => {
        idForInviting.push( this.core.user.matrixId(id, domain) )
      })

    })

   
    _.each(ids, (_id) => {
      let idsForHash = parseInt(_id, 16)

      id.push(idsForHash)
    })

    const groupNameId = id.reduce((product, n) => product * n, 1);
    const mGroupNamId = f.makeid(groupNameId)

    let hash = SHA2.sha224(mGroupNamId.toString()).toString('hex')
    return {hash: hash, idForInviting: idForInviting}
  }

  
}

export default MTRXKIT