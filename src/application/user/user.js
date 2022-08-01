var _ = require("underscore");
import f from "../functions.js";
class User {
  constructor(core, p) {
    if (!p) p = {};

    this.core = core;
    this.state = 0;
    this.keysupdatetimeout = null;
    this.userinfo = {
      image: "",
      name: "",
      id: "",
      keys: [],
    };

    this.private = [];
  }

  destroy() {
    if (this.keysupdatetimeout) {
      clearTimeout(this.keysupdatetimeout);
    }

    this.keysupdatetimeout = null;
    this.state = 0;

    this.userinfo = {
      image: "",
      name: "",
      id: "",
      keys: [],
    };

    this.private = [];
  }

  setCredentials(credentials) {
    if (credentials) this.credentials = credentials;
  }

  setUsersInfo(usersinfo, reload) {
    _.each(usersinfo || [], (v) => {
      this.core.store.commit("SET_USERINFO", {
        info: v,
        reload: reload,
      });
    });
  }

  setContacts(usersinfo) {
    //this.core.store.commit('SET_CONTACTS', usersinfo)
  }

  myMatrixId() {
    return this.matrixId(this.userinfo.id);
  }

  matrixId(id, domain) {
    id || (id = "");

    if (id.indexOf("@") == 0) return id;

    return "@" + id + ":" + (domain || this.core.domain);
  }

  fromMatrixId(matrixid) {
    return f.getmatrixid(matrixid);
  }
}

export default User;
