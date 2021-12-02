export declare enum EventType {
    RoomCanonicalAlias = "m.room.canonical_alias",
    RoomCreate = "m.room.create",
    RoomJoinRules = "m.room.join_rules",
    RoomMember = "m.room.member",
    RoomThirdPartyInvite = "m.room.third_party_invite",
    RoomPowerLevels = "m.room.power_levels",
    RoomName = "m.room.name",
    RoomTopic = "m.room.topic",
    RoomAvatar = "m.room.avatar",
    RoomPinnedEvents = "m.room.pinned_events",
    RoomEncryption = "m.room.encryption",
    RoomHistoryVisibility = "m.room.history_visibility",
    RoomGuestAccess = "m.room.guest_access",
    RoomServerAcl = "m.room.server_acl",
    RoomTombstone = "m.room.tombstone",
    /**
     * @deprecated Should not be used.
     */
    RoomAliases = "m.room.aliases",
    SpaceChild = "org.matrix.msc1772.space.child",
    SpaceParent = "org.matrix.msc1772.space.parent",
    RoomRedaction = "m.room.redaction",
    RoomMessage = "m.room.message",
    RoomMessageEncrypted = "m.room.encrypted",
    Sticker = "m.sticker",
    CallInvite = "m.call.invite",
    CallCandidates = "m.call.candidates",
    CallAnswer = "m.call.answer",
    CallHangup = "m.call.hangup",
    CallReject = "m.call.reject",
    CallSelectAnswer = "m.call.select_answer",
    CallNegotiate = "m.call.negotiate",
    CallReplaces = "m.call.replaces",
    KeyVerificationRequest = "m.key.verification.request",
    KeyVerificationStart = "m.key.verification.start",
    KeyVerificationCancel = "m.key.verification.cancel",
    KeyVerificationMac = "m.key.verification.mac",
    KeyVerificationDone = "m.key.verification.done",
    RoomMessageFeedback = "m.room.message.feedback",
    Typing = "m.typing",
    Receipt = "m.receipt",
    Presence = "m.presence",
    FullyRead = "m.fully_read",
    Tag = "m.tag",
    PushRules = "m.push_rules",
    Direct = "m.direct",
    IgnoredUserList = "m.ignored_user_list",
    RoomKey = "m.room_key",
    RoomKeyRequest = "m.room_key_request",
    ForwardedRoomKey = "m.forwarded_room_key",
    Dummy = "m.dummy"
}
export declare enum MsgType {
    Text = "m.text",
    Emote = "m.emote",
    Notice = "m.notice",
    Image = "m.image",
    File = "m.file",
    Audio = "m.audio",
    Location = "m.location",
    Video = "m.video"
}
export declare const RoomCreateTypeField = "org.matrix.msc1772.type";
export declare enum RoomType {
    Space = "org.matrix.msc1772.space"
}
