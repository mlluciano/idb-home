// Helpers module
// general view helping methods
import _ from 'lodash';

const helpers = {
  check(val, prefix, postfix) {
    let acc = [];
    if (_.isArray(val)) {
      _.each(val, function (v) {
        if (_.isString(v) && !_.isEmpty(v)) {
          acc.push(v);
        }
      });
      if (_.isString(prefix)) {
        val = acc.join(prefix);
      } else {
        val = acc.join(' ');
      }
    } else if (_.isNumber(val)) {
      val = val.toString();
    } else {
      if (_.isUndefined(val) || _.isEmpty(val)) {
        val = '';
      }
    }
    if (!_.isEmpty(val) && _.isString(prefix)) {
      val = prefix + val;
    }
    if (!_.isEmpty(val) && _.isString(postfix)) {
      val = val + postfix;
    }
    return val;
  },

  // ### formatNum
  // formats a numeric into the proper string representation with commas.
  // #### Parameters
  // 1. num: number
  formatNum(num) {
    return num.toString().replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  firstToUpper(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1, str.length - 1).toLowerCase();
  },

  // ### strip
  // remove leading and trailing whitespace and formatting chars
  strip(str) {
    return str.replace(/(\r\n|\n|\r)/gm, '').trim();
  },

  /*
   *Pretty print JSON 
   ****/
  formatJSON(json) {
    if (typeof json != 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  },

  /*
   *Test string for valid email
   ****/
  testEmail(value) {
    const emailreg =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailreg.test(value);
  },

  /*
   *filter: tests array elements for undefinedness and returns array of valid elements
   ****/
  filter(vals) {
    return _.filter(vals, function (item) {
      return !_.isUndefined(item) || !_.isEmpty(item);
    });
  },

  /*
   *filterFirst: iterates array and returns first element that is not undefined
   ****/
  filterFirst(vals) {
    let out;
    for (let i = 0; i < vals.length; i++) {
      if (!_.isUndefined(vals[i])) {
        out = vals[i];
        break;
      }
    }
    return out;
  },

  convertDecimalDegrees(D) {
    return [
      0 | D,
      '&deg;',
      0 | ((D < 0 ? (D = -D) : D) % 1 * 60),
      "' ",
      0 | (D * 60) % 1 * 60,
      '"',
    ].join('');
  },
};

export default helpers;
