import request from 'request';

if (typeof window === 'undefined') {
  var window = global;
}

const api = {
  host: (() => {
     return 'https://search.idigbio.org/v2/';
  })(),
  
  media_host: (() => {
    if (typeof window.idbapi === 'object' && typeof window.idbapi.media_host === 'string') {
      return window.idbapi.media_host;
    } else if (process.env.NODE_ENV === 'beta') {
      return 'https://api.idigbio.org/';
    } else {
      return 'https://api.idigbio.org/';
    }
  })(),
  
  search(query, callback) {
    this._basic('POST', 'search/records/', query, callback);
  },

  media(query, callback) {
    this._basic('POST', 'search/media/', query, callback);
  },

  publishers(query, callback) {
    this._basic('POST', 'search/publishers/', query, callback);
  },

  recordsets(query, callback) {
    this._basic('POST', 'search/recordsets/', query, callback);
  },

  createMap(query, callback) {
    this._basic('POST', 'mapping/', query, callback);
  },

  mapping(path, callback) {
    this._basic('GET', 'mapping/' + path, callback);
  },

  view(type, uuid, callback) {
    this._basic('GET', 'view/' + type + '/' + uuid, callback);
  },

  summary(type, query, callback) {
    this._basic('POST', 'summary/' + type, query, callback);
  },

  countRecords(query, callback) {
    this.summary('count/records/', query, callback);
  },

  _basic(method, arg1, arg2, arg3) {
    const options = {
      method: method,
      uri: this.host,
      json: true,
    };
    let cb;
    [arg1, arg2, arg3].forEach((arg) => {
      switch (typeof arg) {
        case 'object':
          options.json = arg;
          break;
        case 'string':
          options.uri += arg;
          break;
        case 'function':
          cb = (err, resp, body) => {
            if (err) {
              console.log(err);
            }
            arg(body);
          };
          break;
        default:
          break;
      }
    });
    request(options, cb);
  },
};

export default api;
