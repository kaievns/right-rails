/**
 * The JSON encode/decode feature
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov aka St. <nemshilov#gma-il>
 */

/**
 * String to JSON export
 *
 * Credits:
 *   Based on the original JSON escaping implementation
 *     http://www.json.org/json2.js
 *
 * @copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
(function(String_proto) {
  var specials = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'},
  quotables = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
  
  // quotes the string
  function quote(string) {
    return string.replace(quotables, function(chr) {
      return specials[chr] || '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4);
    });
  };
  
  String_proto.toJSON = function() {
    return '"'+ quote(this) + '"';
  }
  
})(String.prototype);
/**
 * Dates to JSON convertion
 *
 * Credits:
 *   Based on the original JSON escaping implementation
 *     http://www.json.org/json2.js
 *
 * @copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
(function(Date_proto) {
  var z = function(num) {
    return (num < 10 ? '0' : '')+num;
  };
  
  
  Date_proto.toJSON = function() {
    return this.getUTCFullYear() + '-' +
      z(this.getUTCMonth() + 1)  + '-' +
      z(this.getUTCDate())       + 'T' +
      z(this.getUTCHours())      + ':' +
      z(this.getUTCMinutes())    + ':' +
      z(this.getUTCSeconds())    + 'Z';
  };
  
})(Date.prototype);
/**
 * Number to JSON export
 *
 * @copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
Number.prototype.toJSON = function() { return String(this+0); };
/**
 * The boolean types to prototype export
 *
 * @copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
Boolean.prototype.toJSON = function() { return String(this); };
/**
 * Array instances to JSON export
 *
 * @copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
Array.prototype.toJSON = function() {
  return '['+this.map(JSON.encode).join(',')+']'
};
/**
 * The Hash instances to JSON export
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov
 */
if (window['Hash']) {
  window['Hash'].prototype.toJSON = function() {
    return window['JSON'].encode(this.toObject());
  };
}
/**
 * The generic JSON interface
 *
 * Credits:
 *   Based on the original JSON escaping implementation
 *     http://www.json.org/json2.js
 *
 * @copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
var JSON = {
  encode: function(value) {
    var result;
    
    if (value === null) {
      result = 'null';
    } else if (value.toJSON) {
      result = value.toJSON();
    } else if (isHash(value)){
      result = [];
      for (var key in value) {
        result.push(key.toJSON()+":"+JSON.encode(value[key]));
      }
      result = '{'+result+'}';
    } else {
      throw "JSON can't encode: "+value;
    }
    
    return result;
  },
  
  // see the original JSON decoder implementation for descriptions http://www.json.org/json2.js
  cx: /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
  
  decode: function(string) {
    if (isString(string) && string) {
      // getting back the UTF-8 symbols
      string = string.replace(JSON.cx, function (a) {
        return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      });
      
      // checking the JSON string consistency
      if (/^[\],:{}\s]*$/.test(string.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
        .replace(/(?:^|:|,)(?:\s*\[)+/g, '')))

          return eval('('+string+')');
    }
    
    throw "JSON parse error: "+string;
  }
};
/**
 * Wraps up the Cooke set/get methods so that the values
 * were automatically exported/imported into JSON strings
 * and it allowed transparent objects and arrays saving
 *
 * @copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
if (window['Cookie']) {
  (function(Cookie_prototype) {
    var old_set = Cookie_prototype.set,
        old_get = Cookie_prototype.get;
        
    $ext(Cookie_prototype, {
      set: function(value) {
        return old_set.call(this, JSON.encode(value));
      },
      
      get: function() {
        return JSON.decode(old_get.call(this));
      }
    });
  })(Cookie.prototype);
}
/**
 * Better JSON sanitizing for the Xhr requests
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov
 */
Xhr.prototype.sanitizedJSON = function() {
  try {
    return JSON.decode(this.text);
  } catch(e) {
    if (this.secureJSON) {
      throw e;
    } else {
      return null;
    }
  }
};