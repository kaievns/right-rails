/**
 * Resizable unit for RightJS
 * http://rightjs.org/ui/resizable
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
var Resizable = RightJS.Resizable = (function(document, RightJS) {
/**
 * This module defines the basic widgets constructor
 * it creates an abstract proxy with the common functionality
 * which then we reuse and override in the actual widgets
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */

/**
 * The filenames to include
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
var R       = RightJS,
    $       = RightJS.$,
    $w      = RightJS.$w,
    $E      = RightJS.$E,
    Wrapper = RightJS.Wrapper,
    Element = RightJS.Element;




/**
 * The widget units constructor
 *
 * @param String tag-name or Object methods
 * @param Object methods
 * @return Widget wrapper
 */
function Widget(tag_name, methods) {
  if (!methods) {
    methods = tag_name;
    tag_name = 'DIV';
  }

  /**
   * An Abstract Widget Unit
   *
   * Copyright (C) 2010 Nikolay Nemshilov
   */
  var AbstractWidget = new RightJS.Wrapper(RightJS.Element.Wrappers[tag_name] || RightJS.Element, {
    /**
     * The common constructor
     *
     * @param Object options
     * @param String optional tag name
     * @return void
     */
    initialize: function(key, options) {
      this.key = key;
      var args = [{'class': 'rui-' + key}];

      // those two have different constructors
      if (!(this instanceof RightJS.Input || this instanceof RightJS.Form)) {
        args.unshift(tag_name);
      }
      this.$super.apply(this, args);

      if (RightJS.isString(options)) {
        options = RightJS.$(options);
      }

      // if the options is another element then
      // try to dynamically rewrap it with our widget
      if (options instanceof RightJS.Element) {
        this._ = options._;
        if ('$listeners' in options) {
          options.$listeners = options.$listeners;
        }
        options = {};
      }
      this.setOptions(options, this);
      return this;
    },

  // protected

    /**
     * Catches the options
     *
     * @param Object user-options
     * @param Element element with contextual options
     * @return void
     */
    setOptions: function(options, element) {
      element = element || this;
      RightJS.Options.setOptions.call(this,
        RightJS.Object.merge(options, eval("("+(
          element.get('data-'+ this.key) || '{}'
        )+")"))
      );
      return this;
    }
  });

  /**
   * Creating the actual widget class
   *
   */
  var Klass = new RightJS.Wrapper(AbstractWidget, methods);

  // creating the widget related shortcuts
  RightJS.Observer.createShortcuts(Klass.prototype, Klass.EVENTS || []);

  return Klass;
}


/**
 * The resizable unit main file
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
var Resizable = new Widget({
  extend: {
    version: '2.0.0',

    EVENTS: $w('resize start release'),

    Options: {
      direction:  null, // 'top', 'left', 'right', 'bottom', null for bidrectional

      minWidth:   null,
      maxWidth:   null,
      minHeight:  null,
      maxHeight:  null
    }
  },

  /**
   * Basic constructor
   *
   * @param Element reference
   * @param Object options
   * @return void
   */
  initialize: function(element, options) {
    this
      .$super('resizable', this.old_inst = $(element))
      .setOptions(options);

    if (this.options.direction) {
      this.addClass('rui-resizable-'+ this.options.direction);
    } else {
      this.addClass('rui-resizable');
    }

    // initializing the inner structure
    this.content = this.first('.rui-resizable-content') ||
      $E('div', {'class': 'rui-resizable-content'}).insert(this._.childNodes).insertTo(this);
    this.handle  = this.first('.rui-resizable-handle')  ||
      $E('div', {'class': 'rui-resizable-handle'}).insertTo(this);
  },

  /**
   * destructor
   *
   * @return Resizable this
   */
  destroy: function() {
    this
      .removeClass('rui-resizable')
      .removeClass('rui-resizable-top')
      .removeClass('rui-resizable-left')
      .removeClass('rui-resizable-right')
      .removeClass('rui-resizable-bottom')
      .insert(this.content._.childNodes);

    this.content.remove();
    this.handle.remove();

    // swapping the old element back
    if (this.old_inst) {
      Wrapper.Cache[$uid(this._)] = this.old_inst;
    }

    return this;
  },

  /**
   * Overriding the method to recognize the direction
   * option from the element class-name
   *
   * @param Object options
   * @return Resizable this
   */
  setOptions: function(options, context) {
    options = options || {};

    // trying to recognize the direction
    $w('top left right bottom').each(function(direction) {
      if (this.hasClass('rui-resizable-'+ direction)) {
        options.direction = direction;
      }
    }, this);

    return this.$super(options, context);
  },

  /**
   * Starts the resizing process
   *
   * @param Event mouse event
   */
  start: function(event) {
    this.prevSizes = this.size();
    this.prevEvPos = event.position();

    // used later during the resize process
    this.contXDiff = this.size().x - this.content.size().x;
    this.contYDiff = this.size().y - this.content.size().y;

    // trying to recognize the boundaries
    $w('minWidth maxWidth minHeight maxHeight').each(function(dimension) {
      this[dimension] = this.findDim(dimension);
    }, this);

    return this.fire('start', {original: event});
  },

  /**
   * Tracks the event during the resize process
   *
   * @param Event mouse event
   */
  track: function(event) {
    var event_pos = event.position(), prev_pos = this.prevEvPos,
        handle    = this.handle.dimensions(),
        prev_size = this.prevSizes, width = prev_size.x, height = prev_size.y,
        x_diff    = prev_pos.x - event_pos.x,
        y_diff    = prev_pos.y - event_pos.y,
        min_x     = this.minWidth,
        max_x     = this.maxWidth,
        min_y     = this.minHeight,
        max_y     = this.maxHeight,
        options   = this.options,
        direction = options.direction;

    // calculating the new size
    width  += (direction === 'left' ? 1 : -1) * x_diff;
    height += (direction === 'top'  ? 1 : -1) * y_diff;

    // applying the boundaries
    if (width  < min_x) { width  = min_x; }
    if (width  > max_x) { width  = max_x; }
    if (height < min_y) { height = min_y; }
    if (height > max_y) { height = max_y; }

    // applying the sizes
    if (prev_size.x !== width && direction !== 'top' && direction !== 'bottom') {
      this.setWidth(width);
    }
    if (prev_size.y !== height && direction !== 'left' && direction !== 'right') {
      this.setHeight(height);
    }

    // adjusting the previous cursor position so that it didn't had a shift
    if (width == min_x || width == max_x) {
      event_pos.x = handle.left + handle.width / 2;
    }
    if (height == min_y || height == max_y) {
      event_pos.y = handle.top + handle.height / 2;
    }

    this.prevEvPos = event_pos;
    this.prevSizes = this.size();

    this.fire('resize', {original: event});
  },

  /**
   * Sets the width of the widget
   *
   * @param Number width
   * @return Resizable this
   */
  setWidth: function(width) {
    this.content.setWidth(width - this.contXDiff);
    return this.$super(width);
  },

  /**
   * Sets the height of the widget
   *
   * @param Number height
   * @return Resizable this
   */
  setHeight: function(height) {
    this.content.setHeight(height - this.contYDiff);
    return this.$super(height);
  },

  /**
   * Marks it the end of the action
   *
   * @return Resizable this
   */
  release: function(event) {
    return this.fire('release', {original: event});
  },

// protected

  // finds dimensions of the element
  findDim: function(dimension) {
    var style = this.options[dimension] || this.getStyle(dimension);

    if (style && /\d+/.test(style) && parseFloat(style) > 0) {
      var what  = R(dimension).include('Width') ? 'width' : 'height',
          dummy = (this._dummy || (this._dummy = $E('div', {
            style: 'visibility:hidden;z-index:-1'
          })))
          .setStyle(what, style)
          .insertTo(this, 'before');

      var size = dummy._['offset' + R(what).capitalize()];
      dummy.remove();

      return size;
    }
  }
});


/**
 * Document level hooks for resizables
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
$(document).on({
  mousedown: function(event) {
    var handle = event.find('.rui-resizable-handle');
    if (handle) {
      var resizable = handle.parent();

      if (resizable instanceof Element) {
        resizable = new Resizable(resizable);
      }

      Resizable.current = resizable.start(event.stop());
    }
  },

  mousemove: function(event) {
    var resizable = Resizable.current;
    if (resizable) {
      resizable.track(event);
    }
  },

  mouseup: function(event) {
    var resizable = Resizable.current;

    if (resizable) {
      resizable.release(event);
      Resizable.current = null;
    }
  }
});

$(window).onBlur(function(event) {
  var resizable = Resizable.current;
  if (resizable) {
    resizable.release(event);
    Resizable.current = null;
  }
});


/**
 * Element level hook to make things resizable
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
Element.include({
  /**
   * Makes a resizeable out of the element
   *
   * @param Object options
   * @return Element this
   */
  makeResizable: function(options) {
    new Resizable(this, options);
    return this;
  },

  /**
   * Destroys a resizable functionality
   *
   * @return Element this
   */
  undoResizable: function() {
    if (this instanceof Resizable) {
      this.destroy();
    }
    return this;
  }
});


document.write("<style type=\"text/css\">.rui-resizable,.rui-resizable-top,.rui-resizable-left,.rui-resizable-right,.rui-resizable-bottom,.rui-resizable-content .rui-resizable-handle{margin:0;padding:0;overflow:none;border:none;background:none;width:auto;height:auto;min-width:none;max-width:none;min-height:none;max-height:none}.rui-resizable,.rui-resizable-top,.rui-resizable-left,.rui-resizable-right,.rui-resizable-bottom{position:relative;min-width:8em;min-height:8em;border:1px solid #DDD}.rui-resizable-content{overflow:auto;padding:.5em;position:relative}.rui-resizable-handle{position:absolute;background-image:url(/images/rightjs-ui/resizable.png);background-repeat:no-repeat;background-color:#DDD;cursor:move}.rui-resizable .rui-resizable-handle{right:0;bottom:0;background-position:-2px -2px;background-color:transparent;width:16px;height:16px}.rui-resizable-top .rui-resizable-handle,.rui-resizable-bottom .rui-resizable-handle{height:8px;width:100%;background-position:center -26px;cursor:row-resize}.rui-resizable-left .rui-resizable-handle,.rui-resizable-right .rui-resizable-handle{top:0px;width:8px;height:100%;background-position:-26px center;cursor:col-resize}.rui-resizable-top .rui-resizable-content{padding-top:1em}.rui-resizable-top .rui-resizable-handle{top:0}.rui-resizable-bottom .rui-resizable-content{padding-bottom:1em}.rui-resizable-bottom .rui-resizable-handle{bottom:0}.rui-resizable-left .rui-resizable-content{padding-left:1em}.rui-resizable-left .rui-resizable-handle{left:0}.rui-resizable-right .rui-resizable-content{padding-right:1em}.rui-resizable-right .rui-resizable-handle{right:0}</style>");

return Resizable;
})(document, RightJS);
