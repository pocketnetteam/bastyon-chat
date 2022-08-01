import { MemoryCryptoStore } from "./crypto/store/memory-crypto-store";
import { LocalStorageCryptoStore } from "./crypto/store/localStorage-crypto-store";
import { IndexedDBCryptoStore } from "./crypto/store/indexeddb-crypto-store";
import { MemoryStore } from "./store/memory";
import { StubStore } from "./store/stub";
import { LocalIndexedDBStoreBackend } from "./store/indexeddb-local-backend";
import { RemoteIndexedDBStoreBackend } from "./store/indexeddb-remote-backend";
import { MatrixScheduler } from "./scheduler";
export * from "./client";
export * from "./http-api";
export * from "./autodiscovery";
export * from "./sync-accumulator";
export * from "./errors";
export * from "./models/event";
export * from "./models/room";
export * from "./models/group";
export * from "./models/event-timeline";
export * from "./models/event-timeline-set";
export * from "./models/room-member";
export * from "./models/room-state";
export * from "./models/user";
export * from "./scheduler";
export * from "./filter";
export * from "./timeline-window";
export * from "./interactive-auth";
export * from "./service-types";
export * from "./store/memory";
export * from "./store/indexeddb";
export * from "./store/session/webstorage";
export * from "./crypto/store/memory-crypto-store";
export * from "./crypto/store/indexeddb-crypto-store";
export * from "./content-repo";
export * as ContentHelpers from "./content-helpers";

export {
  createNewMatrixCall,
  setAudioOutput as setMatrixCallAudioOutput,
  setAudioInput as setMatrixCallAudioInput,
  setVideoInput as setMatrixCallVideoInput,
} from "./webrtc/call";
/**
 * The function used to perform HTTP requests. Only use this if you want to
 * use a different HTTP library, e.g. Angular's <code>$http</code>. This should
 * be set prior to calling {@link createClient}.
 * @param {requestFunction} r The request function to use.
 */
export declare function request(r: any): void;
/**
 * Return the currently-set request function.
 * @return {requestFunction} The current request function.
 */
export declare function getRequest(): any;
/**
 * Apply wrapping code around the request function. The wrapper function is
 * installed as the new request handler, and when invoked it is passed the
 * previous value, along with the options and callback arguments.
 * @param {requestWrapperFunction} wrapper The wrapping function.
 */
export declare function wrapRequest(wrapper: any): void;
declare type Store =
  | StubStore
  | MemoryStore
  | LocalIndexedDBStoreBackend
  | RemoteIndexedDBStoreBackend;
declare type CryptoStore =
  | MemoryCryptoStore
  | LocalStorageCryptoStore
  | IndexedDBCryptoStore;
/**
 * Configure a different factory to be used for creating crypto stores
 *
 * @param {Function} fac  a function which will return a new
 *    {@link module:crypto.store.base~CryptoStore}.
 */
export declare function setCryptoStoreFactory(fac: any): void;
export interface ICreateClientOpts {
  baseUrl: string;
  idBaseUrl?: string;
  store?: Store;
  cryptoStore?: CryptoStore;
  scheduler?: MatrixScheduler;
  request?: Request;
  userId?: string;
  deviceId?: string;
  accessToken?: string;
  identityServer?: any;
  localTimeoutMs?: number;
  useAuthorizationHeader?: boolean;
  timelineSupport?: boolean;
  queryParams?: Record<string, unknown>;
  deviceToImport?: {
    olmDevice: {
      pickledAccount: string;
      sessions: Array<Record<string, any>>;
      pickleKey: string;
    };
    userId: string;
    deviceId: string;
  };
  pickleKey?: string;
  sessionStore?: any;
  unstableClientRelationAggregation?: boolean;
  verificationMethods?: Array<any>;
  forceTURN?: boolean;
  iceCandidatePoolSize?: number;
  supportsCallTransfer?: boolean;
  fallbackICEServerAllowed?: boolean;
  cryptoCallbacks?: ICryptoCallbacks;
}
export interface ICryptoCallbacks {
  getCrossSigningKey?: (
    keyType: string,
    pubKey: Uint8Array
  ) => Promise<Uint8Array>;
  saveCrossSigningKeys?: (keys: Record<string, Uint8Array>) => void;
  shouldUpgradeDeviceVerifications?: (
    users: Record<string, any>
  ) => Promise<string[]>;
  getSecretStorageKey?: (
    keys: {
      keys: Record<string, ISecretStorageKeyInfo>;
    },
    name: string
  ) => Promise<[string, Uint8Array] | null>;
  cacheSecretStorageKey?: (
    keyId: string,
    keyInfo: ISecretStorageKeyInfo,
    key: Uint8Array
  ) => void;
  onSecretRequested?: (
    userId: string,
    deviceId: string,
    requestId: string,
    secretName: string,
    deviceTrust: IDeviceTrustLevel
  ) => Promise<string>;
  getDehydrationKey?: (
    keyInfo: ISecretStorageKeyInfo,
    checkFunc: (Uint8Array: any) => void
  ) => Promise<Uint8Array>;
}
export interface ISecretStorageKeyInfo {
  passphrase?: {
    algorithm: "m.pbkdf2";
    iterations: number;
    salt: string;
  };
  iv?: string;
  mac?: string;
}
export interface IDeviceTrustLevel {
  isVerified(): boolean;
  isCrossSigningVerified(): boolean;
  isLocallyVerified(): boolean;
  isTofu(): boolean;
}
/**
 * Construct a Matrix Client. Similar to {@link module:client.MatrixClient}
 * except that the 'request', 'store' and 'scheduler' dependencies are satisfied.
 * @param {(Object|string)} opts The configuration options for this client. If
 * this is a string, it is assumed to be the base URL. These configuration
 * options will be passed directly to {@link module:client.MatrixClient}.
 * @param {Object} opts.store If not set, defaults to
 * {@link module:store/memory.MemoryStore}.
 * @param {Object} opts.scheduler If not set, defaults to
 * {@link module:scheduler~MatrixScheduler}.
 * @param {requestFunction} opts.request If not set, defaults to the function
 * supplied to {@link request} which defaults to the request module from NPM.
 *
 * @param {module:crypto.store.base~CryptoStore=} opts.cryptoStore
 *    crypto store implementation. Calls the factory supplied to
 *    {@link setCryptoStoreFactory} if unspecified; or if no factory has been
 *    specified, uses a default implementation (indexeddb in the browser,
 *    in-memory otherwise).
 *
 * @return {MatrixClient} A new matrix client.
 * @see {@link module:client.MatrixClient} for the full list of options for
 * <code>opts</code>.
 */
export declare function createClient(opts: ICreateClientOpts | string): any;
/**
 * The request function interface for performing HTTP requests. This matches the
 * API for the {@link https://github.com/request/request#requestoptions-callback|
 * request NPM module}. The SDK will attempt to call this function in order to
 * perform an HTTP request.
 * @callback requestFunction
 * @param {Object} opts The options for this HTTP request.
 * @param {string} opts.uri The complete URI.
 * @param {string} opts.method The HTTP method.
 * @param {Object} opts.qs The query parameters to append to the URI.
 * @param {Object} opts.body The JSON-serializable object.
 * @param {boolean} opts.json True if this is a JSON request.
 * @param {Object} opts._matrix_opts The underlying options set for
 * {@link MatrixHttpApi}.
 * @param {requestCallback} callback The request callback.
 */
/**
 * A wrapper for the request function interface.
 * @callback requestWrapperFunction
 * @param {requestFunction} origRequest The underlying request function being
 * wrapped
 * @param {Object} opts The options for this HTTP request, given in the same
 * form as {@link requestFunction}.
 * @param {requestCallback} callback The request callback.
 */
/**
 * The request callback interface for performing HTTP requests. This matches the
 * API for the {@link https://github.com/request/request#requestoptions-callback|
 * request NPM module}. The SDK will implement a callback which meets this
 * interface in order to handle the HTTP response.
 * @callback requestCallback
 * @param {Error} err The error if one occurred, else falsey.
 * @param {Object} response The HTTP response which consists of
 * <code>{statusCode: {Number}, headers: {Object}}</code>
 * @param {Object} body The parsed HTTP response body.
 */
