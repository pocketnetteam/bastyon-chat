import { mapState } from "vuex";

var chekcext = function (file, extensions) {
  var name = file.name.split(".");
  var fileext = name[name.length - 1].toLowerCase();

  extensions = extensions.split(",");

  return !extensions.length || _.indexOf(extensions, fileext) != -1;
};

var errorHandler = function (file, maxsize, extensions) {
  if (file.size > maxsize * 1024 * 1024) {
    return "filesize";
  } else if (!chekcext(file, extensions)) {
    return "fileext";
  }
};

var read = function (file) {
  var reader = new FileReader();

  return new Promise(function (resolve, reject) {
    reader.onload = (function (theFile) {
      return function (e) {
        var name = theFile.name.split(".");
        var ext = name[name.length - 1];

        resolve({
          base64: e.target.result,
          file: theFile,
          ext: ext,
        });
      };
    })(file);

    reader.readAsDataURL(file);
  });
};

async function upload(event, p) {
  event.stopPropagation();
  event.preventDefault();

  var files = [];
  var result = [];

  if (typeof event.dataTransfer === "undefined") files = event.target.files;
  else files = event.dataTransfer.files;

  files = _.filter(files, function (f) {
    if (f.type) return true;
  });

  for (var file of files) {
    var error = errorHandler(file, p.maxsize, p.extensions);

    if (!error) {
      await read(file).then((data) => {
        result.push(data);
      });
    }
  }

  return result;

  /*_.each(files, function(file){
        var error = errorHandler(file, p.maxsize, p.extensions)

        if(!error){

            
            

        }
    })*/
}

export default {
  name: "fileuploader",
  props: {
    multiple: Boolean,
    extensions: String,
    maxsize: Number,
  },

  data: function () {
    return {
      loading: false,
      drag: false,
      files: [],
    };
  },

  mounted: function () {},

  computed: mapState({
    auth: (state) => state.auth,
  }),

  methods: {
    handle: function (e) {
      var t = this;

      t.loading = true;

      upload(e, this).then((result) => {
        t.loading = false;

        t.$emit("loaded", result);
      });
    },
    dragover: function () {
      this.drag = true;
    },
    dragout: function () {
      this.drag = false;
    },
  },
};
