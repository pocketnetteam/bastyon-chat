var Axios = require("axios");
import axiosRequest from "@nelsonomuto/axios-request-timeout";
var { error, byError } = require("./error");

import f from "@/application/functions";
import qs from "qs";

var Axios = function () {
  var datakeys = ["data.result"];

  var errorkeys = ["data.error"];

  async function axios({ to: to, data: data }) {
    data || (data = {});

    _.each(data, (v, i) => {
      if (_.isArray(v) || _.isObject(v)) {
        data[i] = JSON.stringify(v);
      }
    });

    var response = null;

    try {
      response = await axiosRequest({
        method: "post",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        url: to,
        data: qs.stringify(data),
        timeout: 35000,
      });
    } catch (e) {
      response = e.response;
    }

    if (!response) {
      return Promise.reject("noresponse");
    }

    ////errors

    var ke = _.find(errorkeys, function (k) {
      return f.deep(response.data, k);
    });

    if (ke) {
      return Promise.reject(byError(f.deep(response.data, ke)));
    }

    ////result

    var k = _.find(datakeys, function (k) {
      return f.deep(response.data, k);
    });

    if (k) {
      return Promise.resolve(f.deep(response.data, k));
    }

    ////result

    return Promise.reject("error");
  }

  return {
    axios,
  };
};

export default Axios;
