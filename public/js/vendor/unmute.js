"use strict";
function unmute(i, e, n) {
  var t;
  function d(n, i, e, t, d) {
    for (var o = 0; o < i.length; ++o)
      n.addEventListener(i[o], e, { capture: t, passive: d });
  }
  function o(n, i, e, t, d) {
    for (var o = 0; o < i.length; ++o)
      n.removeEventListener(i[o], e, { capture: t, passive: d });
  }
  function a() {}
  void 0 === e && (e = !1),
    void 0 === n && (n = !1),
    void 0 !== document.hidden
      ? (t = { hidden: "hidden", visibilitychange: "visibilitychange" })
      : void 0 !== document.webkitHidden
      ? (t = {
          hidden: "webkitHidden",
          visibilitychange: "webkitvisibilitychange",
        })
      : void 0 !== document.mozHidden
      ? (t = { hidden: "mozHidden", visibilitychange: "mozvisibilitychange" })
      : void 0 !== document.msHidden &&
        (t = { hidden: "msHidden", visibilitychange: "msvisibilitychange" });
  var c = navigator.userAgent.toLowerCase(),
    u =
      n ||
      (0 <= c.indexOf("iphone") && c.indexOf("like iphone") < 0) ||
      (0 <= c.indexOf("ipad") && c.indexOf("like ipad") < 0) ||
      (0 <= c.indexOf("ipod") && c.indexOf("like ipod") < 0) ||
      (0 <= c.indexOf("mac os x") && 0 < navigator.maxTouchPoints),
    A = !0;
  function s() {
    var n = !(!e && ((t && document[t.hidden]) || (u && !document.hasFocus())));
    n !== A && ((A = n), b(!1), h());
  }
  function l() {
    s();
  }
  function r(n) {
    (n && n.target !== window) || s();
  }
  function h() {
    var n;
    A
      ? "running" !== i.state &&
        "closed" !== i.state &&
        k &&
        ((n = i.resume()), n && n.then(a, a).catch(a))
      : "running" === i.state &&
        ((n = i.suspend()), n && n.then(a, a).catch(a));
  }
  function v(n) {
    (n && n.unmute_handled) || ((n.unmute_handled = !0), h());
  }
  t && d(document, [t.visibilitychange], l, !0, !0),
    u && d(window, ["focus", "blur"], r, !0, !0),
    d(i, ["statechange"], v, !0, !0),
    i.onstatechange || (i.onstatechange = v);
  var g = null;
  function m(n, i) {
    for (var e = i; 1 < n; n--) e += i;
    return e;
  }
  var f =
    "data:audio/mpeg;base64,//uQx" +
    m(23, "A") +
    "WGluZwAAAA8AAAACAAACcQCA" +
    m(16, "gICA") +
    m(66, "/") +
    "8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnGMHkkI" +
    m(320, "A") +
    "//sQxAADgnABGiAAQBCqgCRMAAgEAH" +
    m(15, "/") +
    "7+n/9FTuQsQH//////2NG0jWUGlio5gLQTOtIoeR2WX////X4s9Atb/JRVCbBUpeRUq" +
    m(18, "/") +
    "9RUi0f2jn/+xDECgPCjAEQAABN4AAANIAAAAQVTEFNRTMuMTAw" +
    m(97, "V") +
    "Q==";
  function b(n) {
    var i;
    u &&
      (A
        ? n &&
          (g ||
            ((i = document.createElement("div")),
            (i.innerHTML = "<audio x-webkit-airplay='deny'></audio>"),
            (g = i.children.item(0)),
            (g.controls = !1),
            (g.disableRemotePlayback = !0),
            (g.preload = "auto"),
            (g.src = f),
            (g.loop = !0),
            g.load()),
          g.paused && ((i = g.play()), i && i.then(a, p).catch(p)))
        : p());
  }
  function p() {
    g && ((g.src = "about:blank"), g.load(), (g = null));
  }
  var w = [
      "click",
      "contextmenu",
      "auxclick",
      "dblclick",
      "mousedown",
      "mouseup",
      "touchend",
      "keydown",
      "keyup",
    ],
    k = !1;
  function y() {
    (k = !0), b(!0), h();
  }
  return (
    d(window, w, y, !0, !0),
    {
      dispose: function () {
        p(),
          t && o(document, [t.visibilitychange], l, !0, !0),
          u && o(window, ["focus", "blur"], r, !0, !0),
          o(window, w, y, !0, !0),
          o(i, ["statechange"], v, !0, !0),
          i.onstatechange === v && (i.onstatechange = null);
      },
    }
  );
}
