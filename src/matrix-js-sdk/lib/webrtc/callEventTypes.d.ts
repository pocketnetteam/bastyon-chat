interface CallOfferAnswer {
  type: string;
  sdp: string;
}
export interface CallCapabilities {
  "m.call.transferee": boolean;
}
export interface MCallAnswer {
  answer: CallOfferAnswer;
  capabilities: CallCapabilities;
}
export interface MCallOfferNegotiate {
  offer: CallOfferAnswer;
  description: CallOfferAnswer;
  lifetime: number;
  capabilities: CallCapabilities;
}
export interface MCallReplacesTarget {
  id: string;
  display_name: string;
  avatar_url: string;
}
export interface MCallReplacesEvent {
  replacement_id: string;
  target_user: MCallReplacesTarget;
  create_call: string;
  await_call: string;
  target_room: string;
}
export {};
