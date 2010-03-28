/**
 * Advanced dom events handling module
 *
 * Copyright (C) 2008-2010 Nikolay V. Nemshilov
 */

/**
 * The Event class additional functionality
 *
 * Copyright (C) 2008-2010 Nikolay V. Nemshilov
 */
Event.extend({
  // keyboard key codes
  KEYS: {
    BACKSPACE:  8,
    TAB:        9,
    ENTER:     13,
    ESCAPE:    27,
    SPACE:     32,
    PAGE_UP:   33,
    PAGE_DOWN: 34,
    END:       35,
    HOME:      36,
    LEFT:      37,
    UP:        38,
    RIGHT:     39,
    DOWN:      40,
    INSERT:    45,
    DELETE:    46
  },
  
  // mouse button codes
  BUTTONS: (Browser.IE || Browser.Konqueror) ? {
    LEFT:   1,
    MIDDLE: 4,
    RIGHT:  2
  } : {
    LEFT:   0,
    MIDDLE: 1,
    RIGHT:  2
  }
  
});


/**
 * constructor. pretty much plays a virtual factory, instances new events or extends
 * existing ones and always returns an event instead of void as a normal constructor
 *
 * @param mixed native Event instance or String event name
 * @param Object options
 * @return Event instance
 */
Event.prototype.initialize = function() {
  var args = $A(arguments), event = args.shift(), options = args.pop() || {};
  
  if (isString(event)) {
    var name = Event.cleanName(event);
    if (Event.Mouse.NAMES.includes(name)) {
      event = new Event.Mouse(name, options);
    } else if (Event.Keyboard.NAMES.includes(name)) {
      event = new Event.Keyboard(name, options);
    } else {
      event = new Event.Custom(name, options);
    }
  }
  
  return Event.ext(event);
};

/**
 * presents the basic events class
 *
 * Copyright (C) 2008-2010 Nikolay V. Nemshilov
 */
Event.Base = new Class({
  extend: {
    // basic default events options
    Options: {
      bubbles:    true,
      cancelable: true,
      altKey:     false,
      ctrlKey:    false,
      shiftKey:   false,
      metaKey:    false
    }
  },
  
  /**
   * basic constructor
   *
   * NOTE: that's a virtual constructor, it returns a new object instance
   *       not the actual class instance.
   * 
   * @param String event name
   * @param Object options
   * @return Event new event
   */
  initialize: function(name, options) {
    return this.build(this.options(name, options));
  },
  
// protected

  /**
   * default building method
   *
   * the main purpose is that IE browsers share events instaciation interface
   *
   * @param Object options
   * @return Event new event
   */
  build: Browser.IE ? function(options) {
    var event = document.createEventObject();
    event.type = event.eventType = "on" + options.name;
    event.altKey = options.altKey;
    event.ctrlKey = options.ctrlKey;
    event.shiftKey = options.shiftKey;
    return event;
  } : null,
  
  /**
   * initial options parsing
   *
   * @params Sting event name
   * @params Object user options
   * @return Object clean options
   */
  options: function(name, options) {
    options = Object.merge({}, Event.Base.Options, this.Options, options);
    options.name = name;
    
    return options;
  }
});
/**
 * presents the mouse events class
 *
 * NOTE: this class generally is for an internal usage, it builds a new clean
 *       unextended mouse event.
 *       Use the Event general constructor, if you need a usual extened event.
 *
 * Copyright (C) 2008-2010 Nikolay V. Nemshilov
 */
Event.Mouse = new Class(Event.Base, {
  
  extend: {
    NAMES: $w('click middleclick rightclick dblclick mousedown mouseup mouseover mouseout mousemove'),
    
    Methods: {
      isLeftClick: function() {
        return this.which == 1;
      },

      isRightClick : function() {
        return this.which == 3;
      },

      over: function(element) {
        var dims = $(element).dimensions(), x = this.pageX, y = this.pageY;
        return !(x < dims.left || x > (dims.left + dims.width) || y < dims.top || y > (dims.top + dims.height));
      }
    }
  },
  
  // default mouse events related options
  Options: {
    pointerX: 0,
    pointerY: 0,
    button:   0
  },

// protecteds
  build: function(options) {
    var event = Browser.IE ? this.$super(options) : document.createEvent("MouseEvent");
    this[Browser.IE ? 'initIE' : 'initW3C'](event, options);
    return event;
  },
  
  options: function(name, options) {
    options = this.$super(name, options);
    options.button = Event.BUTTONS[options.name == 'rightclick' ? 'RIGHT' : options.name == 'middleclick' ? 'MIDDLE' : 'LEFT'];
    options.name   = Event.realName(options.name);
    
    return options;
  },
  
// private
  initIE: function(event, options) {
    event.clientX = options.pointerX;
    event.clientY = options.pointerY;
    event.button  = options.button;
  },
  
  initW3C: function(event, options) {
    event.initMouseEvent(options.name, options.bubbles, options.cancelable, document.defaultView,
      name == 'dblclick' ? 2 : 1, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
      options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, options.element
    );
  }
});

Event.include(Event.Mouse.Methods);
/**
 * presents the keyboard events class
 *
 * NOTE: this class generally is for an internal usage, it builds a new clean
 *       unextended mouse event.
 *       Use the Event general constructor, if you need a usual extened event.
 *
 * Copyright (C) 2008-2010 Nikolay V. Nemshilov
 */
Event.Keyboard = new Class(Event.Base, {
  
  extend: {
    NAMES: $w('keypress keydown keyup'),
    
    /**
     * automatically generates the key checking methods like
     * isEscape()
     * isEnter()
     * etc
     */
    Methods: {} // generated at the end of the file
  },
  
  // default keyboard related events options
  Options: {
    keyCode:  0,
    charCode: 0
  },
  
// protected
  build: function(options) {
    var event = null;
    
    if (Browser.IE) {
      event = this.$super(options);
      this.initIE(event, options)
    } else try {
      // Gecko, WebKit, Chrome
      event = document.createEvent('KeyboardEvent');
      this['init'+(Browser.WebKit ? 'Webkit' : 'Gecko')](event, options);
    } catch(e) {
      // basically Opera
      event = document.createEvent('UIEvent');
      this.initDOM2(event, options);
    }
    
    return event;
  },
  
  initGecko: function(event, options) {
    event.initKeyEvent(options.name,
      options.bubbles, options.cancelable, document.defaultView,
      options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
      options.keyCode, options.charCode
    );
  },
  
  initWebkit: function(event, options) {
    event.initKeyboardEvent(options.name,
      options.bubbles, options.cancelable, document.defaultView,
      null, 0, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey
    );
  },
  
  initDOM2: function(event, options) {
    event.initUIEvent(options.name, options.bubbles, options.cancelable, document.defaultView, 1);

    event.keyCode   = options.keyCode;
    event.charCode  = options.charCode;
    event.altKey    = options.altKey;
    event.metaKey   = options.metaKey;
    event.ctrlKey   = options.ctrlKey;
    event.shiftKey  = options.shiftKey;
  },
  
  initIE: function(event, options) {
    event.keyCode  = options.keyCode;
    event.charCode = options.charCode;
  }
});

// generates the key checking methods
(function() {
  for (var key in Event.KEYS) {
    (function(key, key_code) {
      Event.Keyboard.Methods[('is_'+key.toLowerCase()).camelize()] = function() {
        return this.keyCode == key_code;
      };
    })(key, Event.KEYS[key]);
  };
  
  Event.include(Event.Keyboard.Methods);
})();

/**
 * Reassigning the element #fire method to support the native events dispatching
 *
 * @copyright 2009-2010 Nikolay V. Nemshilov
 */
Element.include({
  fire: function() {
    var args = $A(arguments), event = new Event(args.shift(), Object.merge(args.shift(), {element: this}));
    
    if (event instanceof Event.Custom) {
      (this.$listeners || []).each(function(i) {
        if (i.e == event.type) {
          i.f.apply(this, [event].concat(i.a).concat(args));
        }
      }, this);
    } else if (this.dispatchEvent) {
      this.dispatchEvent(event);
    } else {
      this.fireEvent(event.eventType, event);
    }
    
    return this;
  }
});