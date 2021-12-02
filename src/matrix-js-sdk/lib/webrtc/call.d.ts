/// <reference types="node" />
import { EventEmitter } from 'events';
import MatrixEvent from '../models/event';
/**
 * Fires whenever an error occurs when call.js encounters an issue with setting up the call.
 * <p>
 * The error given will have a code equal to either `MatrixCall.ERR_LOCAL_OFFER_FAILED` or
 * `MatrixCall.ERR_NO_USER_MEDIA`. `ERR_LOCAL_OFFER_FAILED` is emitted when the local client
 * fails to create an offer. `ERR_NO_USER_MEDIA` is emitted when the user has denied access
 * to their audio/video hardware.
 *
 * @event module:webrtc/call~MatrixCall#"error"
 * @param {Error} err The error raised by MatrixCall.
 * @example
 * matrixCall.on("error", function(err){
 *   console.error(err.code, err);
 * });
 */
interface CallOpts {
    roomId?: string;
    client?: any;
    forceTURN?: boolean;
    turnServers?: Array<TurnServer>;
}
interface TurnServer {
    urls: Array<string>;
    username?: string;
    password?: string;
    ttl?: number;
}
export declare enum CallState {
    Fledgling = "fledgling",
    InviteSent = "invite_sent",
    WaitLocalMedia = "wait_local_media",
    CreateOffer = "create_offer",
    CreateAnswer = "create_answer",
    Connecting = "connecting",
    Connected = "connected",
    Ringing = "ringing",
    Ended = "ended"
}
export declare enum CallType {
    Voice = "voice",
    Video = "video"
}
export declare enum CallDirection {
    Inbound = "inbound",
    Outbound = "outbound"
}
export declare enum CallParty {
    Local = "local",
    Remote = "remote"
}
export declare enum CallEvent {
    Hangup = "hangup",
    State = "state",
    Error = "error",
    Replaced = "replaced",
    LocalHoldUnhold = "local_hold_unhold",
    RemoteHoldUnhold = "remote_hold_unhold",
    HoldUnhold = "hold_unhold"
}
export declare enum CallErrorCode {
    /** The user chose to end the call */
    UserHangup = "user_hangup",
    /** An error code when the local client failed to create an offer. */
    LocalOfferFailed = "local_offer_failed",
    /**
     * An error code when there is no local mic/camera to use. This may be because
     * the hardware isn't plugged in, or the user has explicitly denied access.
     */
    NoUserMedia = "no_user_media",
    /**
     * Error code used when a call event failed to send
     * because unknown devices were present in the room
     */
    UnknownDevices = "unknown_devices",
    /**
     * Error code usewd when we fail to send the invite
     * for some reason other than there being unknown devices
     */
    SendInvite = "send_invite",
    /**
     * An answer could not be created
     */
    CreateAnswer = "create_answer",
    /**
     * Error code usewd when we fail to send the answer
     * for some reason other than there being unknown devices
     */
    SendAnswer = "send_answer",
    /**
     * The session description from the other side could not be set
     */
    SetRemoteDescription = "set_remote_description",
    /**
     * The session description from this side could not be set
     */
    SetLocalDescription = "set_local_description",
    /**
     * A different device answered the call
     */
    AnsweredElsewhere = "answered_elsewhere",
    /**
     * No media connection could be established to the other party
     */
    IceFailed = "ice_failed",
    /**
     * The invite timed out whilst waiting for an answer
     */
    InviteTimeout = "invite_timeout",
    /**
     * The call was replaced by another call
     */
    Replaced = "replaced",
    /**
     * Signalling for the call could not be sent (other than the initial invite)
     */
    SignallingFailed = "signalling_timeout"
}
/** Retrieves sources from desktopCapturer */
export declare function getDesktopCapturerSources(): Promise<Array<DesktopCapturerSource>>;
export declare class CallError extends Error {
    code: string;
    constructor(code: CallErrorCode, msg: string, err: Error);
}
/**
 * Construct a new Matrix Call.
 * @constructor
 * @param {Object} opts Config options.
 * @param {string} opts.roomId The room ID for this call.
 * @param {Object} opts.webRtc The WebRTC globals from the browser.
 * @param {boolean} opts.forceTURN whether relay through TURN should be forced.
 * @param {Object} opts.URL The URL global.
 * @param {Array<Object>} opts.turnServers Optional. A list of TURN servers.
 * @param {MatrixClient} opts.client The Matrix Client instance to send events to.
 */
export declare class MatrixCall extends EventEmitter {
    roomId: string;
    type: CallType;
    callId: string;
    state: CallState;
    hangupParty: CallParty;
    hangupReason: string;
    direction: CallDirection;
    ourPartyId: string;
    private client;
    private forceTURN;
    private turnServers;
    private candidateSendQueue;
    private candidateSendTries;
    private sentEndOfCandidates;
    private peerConn;
    private localVideoElement;
    private remoteVideoElement;
    private remoteAudioElement;
    private screenSharingStream;
    private remoteStream;
    private localAVStream;
    private inviteOrAnswerSent;
    private waitForLocalAVStream;
    private config;
    private successor;
    private opponentMember;
    private opponentVersion;
    private opponentPartyId;
    private opponentCaps;
    private inviteTimeout;
    private remoteOnHold;
    private unholdingRemote;
    private micMuted;
    private vidMuted;
    private callStatsAtEnd;
    private makingOffer;
    private ignoreOffer;
    private remoteCandidateBuffer;
    constructor(opts: CallOpts);
    /**
     * Place a voice call to this room.
     * @throws If you have not specified a listener for 'error' events.
     */
    placeVoiceCall(): Promise<void>;
    /**
     * Place a video call to this room.
     * @param {Element} remoteVideoElement a <code>&lt;video&gt;</code> DOM element
     * to render video to.
     * @param {Element} localVideoElement a <code>&lt;video&gt;</code> DOM element
     * to render the local camera preview.
     * @throws If you have not specified a listener for 'error' events.
     */
    placeVideoCall(remoteVideoElement: HTMLVideoElement, localVideoElement: HTMLVideoElement): Promise<void>;
    /**
     * Place a screen-sharing call to this room. This includes audio.
     * <b>This method is EXPERIMENTAL and subject to change without warning. It
     * only works in Google Chrome and Firefox >= 44.</b>
     * @param {Element} remoteVideoElement a <code>&lt;video&gt;</code> DOM element
     * to render video to.
     * @param {Element} localVideoElement a <code>&lt;video&gt;</code> DOM element
     * to render the local camera preview.
     * @throws If you have not specified a listener for 'error' events.
     */
    placeScreenSharingCall(remoteVideoElement: HTMLVideoElement, localVideoElement: HTMLVideoElement, selectDesktopCapturerSource?: () => Promise<DesktopCapturerSource>): Promise<void>;
    getOpponentMember(): any;
    opponentCanBeTransferred(): boolean;
    /**
     * Retrieve the local <code>&lt;video&gt;</code> DOM element.
     * @return {Element} The dom element
     */
    getLocalVideoElement(): HTMLVideoElement;
    /**
     * Retrieve the remote <code>&lt;video&gt;</code> DOM element
     * used for playing back video capable streams.
     * @return {Element} The dom element
     */
    getRemoteVideoElement(): HTMLVideoElement;
    /**
     * Retrieve the remote <code>&lt;audio&gt;</code> DOM element
     * used for playing back audio only streams.
     * @return {Element} The dom element
     */
    getRemoteAudioElement(): HTMLAudioElement;
    /**
     * Set the local <code>&lt;video&gt;</code> DOM element. If this call is active,
     * video will be rendered to it immediately.
     * @param {Element} element The <code>&lt;video&gt;</code> DOM element.
     */
    setLocalVideoElement(element: HTMLVideoElement): Promise<void>;
    /**
     * Set the remote <code>&lt;video&gt;</code> DOM element. If this call is active,
     * the first received video-capable stream will be rendered to it immediately.
     * @param {Element} element The <code>&lt;video&gt;</code> DOM element.
     */
    setRemoteVideoElement(element: HTMLVideoElement): void;
    /**
     * Set the remote <code>&lt;audio&gt;</code> DOM element. If this call is active,
     * the first received audio-only stream will be rendered to it immediately.
     * The audio will *not* be rendered from the remoteVideoElement.
     * @param {Element} element The <code>&lt;video&gt;</code> DOM element.
     */
    setRemoteAudioElement(element: HTMLAudioElement): Promise<void>;
    getCurrentCallStats(): Promise<any[]>;
    private collectCallStats;
    /**
     * Configure this call from an invite event. Used by MatrixClient.
     * @param {MatrixEvent} event The m.call.invite event
     */
    initWithInvite(event: MatrixEvent): Promise<void>;
    /**
     * Configure this call from a hangup or reject event. Used by MatrixClient.
     * @param {MatrixEvent} event The m.call.hangup event
     */
    initWithHangup(event: MatrixEvent): void;
    /**
     * Answer a call.
     */
    answer(): Promise<void>;
    /**
     * Replace this call with a new call, e.g. for glare resolution. Used by
     * MatrixClient.
     * @param {MatrixCall} newCall The new call.
     */
    replacedBy(newCall: MatrixCall): void;
    /**
     * Hangup a call.
     * @param {string} reason The reason why the call is being hung up.
     * @param {boolean} suppressEvent True to suppress emitting an event.
     */
    hangup(reason: CallErrorCode, suppressEvent: boolean): void;
    /**
     * Reject a call
     * This used to be done by calling hangup, but is a separate method and protocol
     * event as of MSC2746.
     */
    reject(): void;
    /**
     * Set whether our outbound video should be muted or not.
     * @param {boolean} muted True to mute the outbound video.
     */
    setLocalVideoMuted(muted: boolean): void;
    /**
     * Check if local video is muted.
     *
     * If there are multiple video tracks, <i>all</i> of the tracks need to be muted
     * for this to return true. This means if there are no video tracks, this will
     * return true.
     * @return {Boolean} True if the local preview video is muted, else false
     * (including if the call is not set up yet).
     */
    isLocalVideoMuted(): boolean;
    /**
     * Set whether the microphone should be muted or not.
     * @param {boolean} muted True to mute the mic.
     */
    setMicrophoneMuted(muted: boolean): void;
    /**
     * Check if the microphone is muted.
     *
     * If there are multiple audio tracks, <i>all</i> of the tracks need to be muted
     * for this to return true. This means if there are no audio tracks, this will
     * return true.
     * @return {Boolean} True if the mic is muted, else false (including if the call
     * is not set up yet).
     */
    isMicrophoneMuted(): boolean;
    /**
     * @returns true if we have put the party on the other side of the call on hold
     * (that is, we are signalling to them that we are not listening)
     */
    isRemoteOnHold(): boolean;
    setRemoteOnHold(onHold: boolean): void;
    /**
     * Indicates whether we are 'on hold' to the remote party (ie. if true,
     * they cannot hear us). Note that this will return true when we put the
     * remote on hold too due to the way hold is implemented (since we don't
     * wish to play hold music when we put a call on hold, we use 'inactive'
     * rather than 'sendonly')
     * @returns true if the other party has put us on hold
     */
    isLocalOnHold(): boolean;
    /**
     * Sends a DTMF digit to the other party
     * @param digit The digit (nb. string - '#' and '*' are dtmf too)
     */
    sendDtmfDigit(digit: string): void;
    private updateMuteStatus;
    /**
     * Internal
     * @param {Object} stream
     */
    private gotUserMediaForInvite;
    private sendAnswer;
    private gotUserMediaForAnswer;
    /**
     * Internal
     * @param {Object} event
     */
    private gotLocalIceCandidate;
    private onIceGatheringStateChange;
    onRemoteIceCandidatesReceived(ev: MatrixEvent): Promise<void>;
    /**
     * Used by MatrixClient.
     * @param {Object} msg
     */
    onAnswerReceived(event: MatrixEvent): Promise<void>;
    onSelectAnswerReceived(event: MatrixEvent): Promise<void>;
    onNegotiateReceived(event: MatrixEvent): Promise<void>;
    private callHasEnded;
    private gotLocalOffer;
    private getLocalOfferFailed;
    private getUserMediaFailed;
    onIceConnectionStateChanged: () => void;
    private onSignallingStateChanged;
    private onTrack;
    onNegotiationNeeded: () => Promise<void>;
    playRemoteAudio(): Promise<void>;
    private playRemoteVideo;
    onHangupReceived: (msg: any) => void;
    onRejectReceived: (msg: any) => void;
    onAnsweredElsewhere: (msg: any) => void;
    setState(state: CallState): void;
    /**
     * Internal
     * @param {string} eventType
     * @param {Object} content
     * @return {Promise}
     */
    private sendVoipEvent;
    queueCandidate(content: RTCIceCandidate): void;
    transfer(targetUserId: string): Promise<void>;
    transferToCall(transferTargetCall?: MatrixCall): Promise<void>;
    private terminate;
    private stopAllMedia;
    private checkForErrorListener;
    private sendCandidateQueue;
    private placeCallWithConstraints;
    private createPeerConnection;
    private partyIdMatches;
    private chooseOpponent;
    private addBufferedIceCandidates;
    private addIceCandidates;
}
/**
 * Set an audio output device to use for MatrixCalls
 * @function
 * @param {string=} deviceId the identifier for the device
 * undefined treated as unset
 */
export declare function setAudioOutput(deviceId: string): void;
/**
 * Set an audio input device to use for MatrixCalls
 * @function
 * @param {string=} deviceId the identifier for the device
 * undefined treated as unset
 */
export declare function setAudioInput(deviceId: string): void;
/**
 * Set a video input device to use for MatrixCalls
 * @function
 * @param {string=} deviceId the identifier for the device
 * undefined treated as unset
 */
export declare function setVideoInput(deviceId: string): void;
/**
 * Create a new Matrix call for the browser.
 * @param {MatrixClient} client The client instance to use.
 * @param {string} roomId The room the call is in.
 * @param {Object?} options DEPRECATED optional options map.
 * @param {boolean} options.forceTURN DEPRECATED whether relay through TURN should be
 * forced. This option is deprecated - use opts.forceTURN when creating the matrix client
 * since it's only possible to set this option on outbound calls.
 * @return {MatrixCall} the call or null if the browser doesn't support calling.
 */
export declare function createNewMatrixCall(client: any, roomId: string, options?: CallOpts): MatrixCall;
export {};
