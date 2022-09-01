const iv = [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];
const testMnemonicPhrase = 'a5caf8773a37030632215bfd4049a9cf11a6987d36f775ed391ff4bdfeb56c8960a041337303f9aa03285880b0425a9ea2a80eb0efa6e11c1f5ec65faff1154550165dc5b828dccb2e28c3ad09e3edc4'
const testPrivateMnemonicPhrase = '99e4df2f0588793927f935e63ffdb5044f66c39ee63d6bfe57da531a3cbf17a28da1427a8934303d7398496fbea56156769b3ae79405b8be3328944490df47640ac692cbac0f4fe20488e1d0f979e349'
const testWif = '26b37f3206c710d62f9c4bc6e32750b9f6c4d142c7581d7c833135fcc976f2a73d93289f7e57a6fc4137b32077758015d0f009b7a3d6f1911ee86afc3e9c39f1'

let privateKey = null;
let publicKey = null;
let addressUser = null;

function decryptMnemonic() {
    const mnemonicPhrase = testMnemonicPhrase;

    decryption(mnemonicPhrase, hexEncode('fakefingerprint'), {}, function(mnemonicPhrase){
        (!window.bitcoin.bip39.validateMnemonic(mnemonicPhrase) 
            ? setKeysPairFromPrivate(mnemonicPhrase, function(){}) 
            : setKeys(mnemonicPhrase, function(){}))
    })	   
};
decryptMnemonic();
function getDecryptedMnemonic() {
    return {
        privateKey: privateKey, 
        publicKey: publicKey, 
        addressUser: addressUser
    } 	 
}

decryptMnemonic();

function decryption(str, key, p, clbk) {
    if (!p) p = {};

    p.charsetEnc = (p.charsetEnc || 'utf8')
    p.charsetDec = (p.charsetDec || 'hex')

    const encryptedBytes = new Uint8Array(window.aesjs.utils[p.charsetDec].toBytes(str));

    keyForAes(key, function (akey) {
        if(!window.crypto.subtle){
            if (clbk)
                clbk('')
            return
        }
        window.crypto.subtle.decrypt(
            {
            name: "AES-CBC",
            iv: new Uint8Array(iv), //The initialization vector you used to encrypt
        },
            akey, //from generateKey or importKey above
            encryptedBytes //ArrayBuffer of the data
        )
            .then(function (decrypted) {

                const _decrypted = window.aesjs.utils[p.charsetEnc].fromBytes(new Uint8Array(decrypted));

                if (clbk)
                    clbk(_decrypted)
            })
            .catch(function (err) {

                console.error(err)

                if (clbk)
                    clbk('')
            });
    })
};
function keyForAes(key, clbk) {
    var _clbk = function (key) {
        if(!window.crypto.subtle){
            if (clbk)
                clbk('')
            return
        }
        window.crypto.subtle.importKey(
            "raw",
            window.aesjs.utils.utf8.toBytes(key),
            {   //this is the algorithm options
            name: "AES-CBC",
        },
            false,
            ["encrypt", "decrypt"]
        )
        .then(function (key) {

          if (clbk)
            clbk(key)

        })
        .catch(function (err) {
          console.log(err)
        });
    }

    if (key.length >= 128) {
      _clbk(key)
    }
    else {
      keyFromString(key, 16, function (key) {
        _clbk(key)
      })
    }
};
function keyFromString (key, l, clbk) {
    var mypbkdf2 = new PBKDF2(key, 'helper', 1, l);
    mypbkdf2.deriveKey(null, function (key) {
        clbk(key)
    });
};
function hexEncode(text) {
    var ch = 0;
    var result = "";
  
    for (var i = 0; i < text.length; i++) {
      ch = text.charCodeAt(i);
      if (ch > 0xFF) ch -= 0x350;
      ch = ch.toString(16);
  
      while (ch.length < 2) {
        ch = "0" + ch;
      }
  
      result += ch;
    }
  
    return result;
};
function setKeysPairFromPrivate(_private, clbk){
    var keyPair = null;

    try {
        keyPair = window.bitcoin.ECPair.fromPrivateKey(Buffer.from(_private, 'hex'))
    } catch (e){
        try{
            keyPair = window.bitcoin.ECPair.fromWIF(_private)
        } catch (e){}
    } 

    if(keyPair){
        setKeysPair(keyPair, function(){
            if (clbk)
                clbk(true)
        })
    } else {
        if (clbk)
            clbk(false)
    }
}
function setKeys(mnemonic, clbk) {
    var keyPair =  keysFromMnemo(mnemonic)      
    setKeysPair(keyPair, clbk)    
}
function setKeysPair(keyPair, clbk) {
    privateKey = keyPair.privateKey
    publicKey = keyPair.publicKey  
    addressUser = sdk.address.pnet(publicKey).address

    if (clbk)
        clbk()  
}
function keysFromMnemo(mnemonic) {
    if(!mnemonic) mnemonic = ''
    var seed = window.bitcoin.bip39.mnemonicToSeedSync(mnemonic.toLowerCase())
    return keysFromSeed(seed)
}
function keysFromSeed(seed) {
    var d = window.bitcoin.bip32.fromSeed(seed).derivePath(self.sdk.address.path(0)).toWIF()         
    var keyPair = window.bitcoin.ECPair.fromWIF(d)	    
    return keyPair
}