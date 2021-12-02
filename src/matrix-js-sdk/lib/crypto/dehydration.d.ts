export declare const DEHYDRATION_ALGORITHM = "org.matrix.msc2697.v1.olm.libolm_pickle";
export declare class DehydrationManager {
    private crypto;
    private inProgress;
    private timeoutId;
    private key;
    private keyInfo;
    private deviceDisplayName;
    constructor(crypto: any);
    getDehydrationKeyFromCache(): Promise<void>;
    /** set the key, and queue periodic dehydration to the server in the background */
    setKeyAndQueueDehydration(key: Uint8Array, keyInfo?: {
        [props: string]: any;
    }, deviceDisplayName?: string): Promise<void>;
    setKey(key: Uint8Array, keyInfo?: {
        [props: string]: any;
    }, deviceDisplayName?: string): Promise<boolean>;
    /** returns the device id of the newly created dehydrated device */
    dehydrateDevice(): Promise<string>;
    private stop;
}
