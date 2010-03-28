/**
 * Additional visual effects module
 *
 * Copyright (C) 2008-2010 Nikolay V. Nemshilov
 */
if (!self.Fx) throw "RightJS Fx is missing";
/**
 * The basic move visual effect
 *
 * @copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Fx.Move = new Class(Fx.Morph, {
  extend: {
    Options: Object.merge(Fx.Options, {
      duration: 'long',
      position: 'absolute' // <- defines the positions measurment principle, not the element positioning
    })
  },
  
  prepare: function(end_position) {
    return this.$super(this.getEndPosition(end_position));
  },
  
  // moved to a separated method to be able to call it from subclasses
  getEndPosition: function(end_position) {
    var position = this.element.getStyle('position'), end_style = {};
    
    if (position != 'absolute' || position != 'relative') {
      this.element.style.position = position = position == 'fixed' ? 'absolute' : 'relative';
    }
    
    if (end_position.top)  end_position.y = end_position.top.toInt();
    if (end_position.left) end_position.x = end_position.left.toInt();
    
    // adjusting the end position
    var cur_position = this.element.position();
    var par_position = this.getParentPosition();
    var rel_left     = cur_position.x - par_position.x;
    var rel_top      = cur_position.y - par_position.y;
    
    if (this.options.position == 'relative') {
      if (position == 'absolute') {
        if (defined(end_position.x)) end_position.x += cur_position.x;
        if (defined(end_position.y)) end_position.y += cur_position.x;
      } else {
        if (defined(end_position.x)) end_position.x += rel_left;
        if (defined(end_position.y)) end_position.y += rel_top;
      }
    } else if (position == 'relative') {
      if (defined(end_position.x)) end_position.x += rel_left - cur_position.x;
      if (defined(end_position.y)) end_position.y += rel_top  - cur_position.y;
    }
    
    // need this to bypass the other styles from the subclasses
    for (var key in end_position) {
      switch (key) {
        case 'top': case 'left': break;
        case 'y':   end_style.top  = end_position.y + 'px'; break;
        case 'x':   end_style.left = end_position.x + 'px'; break;
        default:    end_style[key] = end_position[key];
      }
    }
    
    return end_style;
  },
  
  getParentPosition: function() {
    Fx.Move.Dummy = Fx.Move.Dummy || new Element('div', {style: 'width:0;height:0;visibility:hidden'});
    this.element.insert(Fx.Move.Dummy, 'before');
    var position = Fx.Move.Dummy.position();
    Fx.Move.Dummy.remove();
    return position;
  }
});
/**
 * Zoom visual effect, graduately zoom and element in or out
 *
 * @copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Fx.Zoom = new Class(Fx.Move, {
  PROPERTIES: $w('width height lineHeight paddingTop paddingRight paddingBottom paddingLeft fontSize borderWidth'),
  
  extend: {
    Options: Object.merge(Fx.Move.Options, {
      position: 'relative', // overriding the Fx.Move default
      duration: 'normal',
      from:     'center'
    })
  },
  
  prepare: function(size, additional_styles) {
    return this.$super(this._getZoomedStyle(size, additional_styles));
  },
  
// private

  // calculates the end zoommed style
  _getZoomedStyle: function(size, additional_styles) {
    var proportion = this._getProportion(size);
    
    return Object.merge(
      this._getBasicStyle(proportion),
      this._getEndPosition(proportion),
      additional_styles || {}
    );
  },

  // calculates the zooming proportion
  _getProportion: function(size) {
    if (isHash(size)) {
      var sizes = $E('div').insertTo(
        $E('div', {style: "visibility:hidden;float:left;height:0;width:0"}).insertTo(document.body)
      ).setStyle(size).sizes();
      
      if (size.height) size = sizes.y / this.element.sizes().y;
      else             size = sizes.x / this.element.sizes().x;
    } else if (isString(size)) {
      size  = size.endsWith('%') ? size.toFloat() / 100 : size.toFloat();
    }
    
    return size;
  },
  
  // getting the basic end style
  _getBasicStyle: function(proportion) {
    var style = this._cloneStyle(this.element, this.PROPERTIES), re = /([\d\.]+)/g;
    
    for (var key in style) {
      if (key === 'width' || key === 'height') style[key] = style[key] || (this.element['offset'+key.capitalize()]+'px');
      
      if (style[key].match(re)) {
        style[key] = style[key].replace(re, function(m) {
          return ''+ (m.toFloat() * proportion);
        });
      } else {
        delete(style[key]);
      }
    }
    
    // preventing the border disappearance
    if (style.borderWidth && style.borderWidth.toFloat() < 1) {
      style.borderWidth = '1px';
    }
    
    return style;
  },
  
  // getting the position adjustments
  _getEndPosition: function(proportion) {
    var position = {};
    var sizes    = this.element.sizes();
    var x_diff   = sizes.x * (proportion - 1);
    var y_diff   = sizes.y * (proportion - 1);
    
    switch (this.options.from.replace('-', ' ').split(' ').sort().join('_')) {
      case 'top':
        position.x = - x_diff / 2;
        break;
        
      case 'right':
        position.x = - x_diff;
        position.y = - y_diff / 2;
        break;
        
      case 'bottom':
        position.x = - x_diff / 2;
      case 'bottom_left':
        position.y = - y_diff;
        break;
        
      case 'bottom_right':
        position.y = - y_diff;
      case 'right_top':
        position.x = - x_diff;
        break;
        
      case 'center':
        position.x = - x_diff / 2;
      case 'left':
        position.y = - y_diff / 2;
        break;
        
      default: // left_top or none, do nothing, let the thing expand as is
    }
    
    return position;
  }
});
/**
 * Bounce visual effect, slightly moves an element forward and back
 *
 * @copyright (C) 2009 Nikolay V. Nemshilov
 */
Fx.Bounce = new Class(Fx, {
  extend: {
    Options: Object.merge(Fx.Options, {
      duration:  'short',
      direction: 'top',
      value:     16 // the shake distance
    })
  },
  
  prepare: function(value) {
    value = value || this.options.value;
    
    var position = this.element.position();
    var duration = Fx.Durations[this.options.duration]     || this.options.duration;
    var move_options = {duration: duration, position: 'relative'};
    
    var key = 'y'; // top bounce by default
    
    switch (this.options.direction) {
      case 'right':
        value = -value;
      case 'left':
        key = 'x';
        break;
      case 'bottom':
        value = -value;
    }
    
    var up_pos = {}, down_pos = {};
    up_pos[key]   = -value;
    down_pos[key] = value;
    
    new Fx.Move(this.element, move_options).start(up_pos);
    new Fx.Move(this.element, move_options).start(down_pos);
    
    this.finish.bind(this).delay(1);
    
    return this;
  }
});
/**
 * run out and run in efffects
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Fx.Run = new Class(Fx.Move, {
  extend: {
    Options: Object.merge(Fx.Move.Options, {
      direction: 'left'
    })
  },
  
  prepare: function(how) {
    var how = how || 'toggle', position = {}, dimensions = this.element.dimensions(), threshold = 80;
    
    if (how == 'out' || (how == 'toggle' && this.element.visible())) {
      if (this.options.direction == 'left') {
        position.x = -dimensions.width - threshold;
      } else {
        position.y = -dimensions.height - threshold;
      }
      this.onFinish(function() {
        this.element.hide().setStyle(this.getEndPosition({x: dimensions.left, y: dimensions.top}));
      })
    } else {
      dimensions = this.element.setStyle('visibility: hidden').show().dimensions();
      var pre_position = {};
      
      if (this.options.direction == 'left') {
        pre_position.x = - dimensions.width - threshold;
        position.x = dimensions.left;
      } else {
        pre_position.y = - dimensions.height - threshold;
        position.y = dimensions.top;
      }
      
      this.element.setStyle(this.getEndPosition(pre_position)).setStyle('visibility: visible');
    }
    
    return this.$super(position);
  }
});
/**
 * The puff visual effect
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Fx.Puff = new Class(Fx.Zoom, {
  extend: {
    Options: Object.merge(Fx.Zoom.Options, {
      size: 1.4  // the end/initial size of the element
    })
  },
  
// protected

  prepare: function(how) {
    var how = how || 'toggle', opacity = 0, size = this.options.size;
    
    if (how == 'out' || (how == 'toggle' && this.element.visible())) {
      var initial_style = this.getEndPosition(this._getZoomedStyle(1));
      this.onFinish(function() {
        initial_style.opacity = 1;
        this.element.hide().setStyle(initial_style);
      });
      
    } else {
      this.element.setStyle('visibility: visible').show();
      
      var width = this.element.offsetWidth;
      var initial_style = this.getEndPosition(this._getZoomedStyle(1));
      
      this.onFinish(function() {
        this.element.setStyle(initial_style);
      });
      
      this.element.setStyle(Object.merge(
        this.getEndPosition(this._getZoomedStyle(size)), {
          opacity: 0,
          visibility: 'visible'
        }
      ));
      
      size = width / this.element.offsetWidth;
      opacity = 1;
    }
    
    
    return this.$super(size, {opacity: opacity});
  }
  
});
/**
 * Handles the to-class and from-class visual effects
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Fx.CSS = new Class(Fx.Morph, {
  STYLES: $w('width height lineHeight opacity border padding margin color fontSize background top left right bottom'),
  
// protected
  
  prepare: function(add_class, remove_class) {
    this.addClass    = add_class    || '';
    this.removeClass = remove_class || '';
    
    // wiring the classes add/remove on-finish
    if (add_class)    this.onFinish(this.element.addClass.bind(this.element, add_class));
    if (remove_class) this.onFinish(this.element.removeClass.bind(this.element, remove_class));
    
    return this.$super({});
  },
  
  // hacking the old method to make it apply the classes
  _endStyle: eval("({f:"+Fx.Morph.prototype._endStyle.toString().replace(/(\.setStyle\(\w+\))/,
    '$1.addClass(this.addClass).removeClass(this.removeClass)'
  )+"})").f,
  
  // replacing the old method to make it return our own list of properties
  _styleKeys: function() {
    var hash = {};
    this.STYLES.each(function(name) {
      hash[name] = 1;
    });
    
    return this.$super(hash);
  }
});
/**
 * Element shortcuts for the additional effects
 *
 * @copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Element.include({
  /**
   * The move visual effect shortcut
   *
   * @param Object end position x/y or top/left
   * @param Object fx options
   * @return Element self
   */
  move: function(position, options) {
    return this.fx('move', [position, options || {}]); // <- don't replace with arguments
  },
  
  /**
   * The bounce effect shortcut
   *
   * @param Number optional bounce size
   * @param Object fx options
   * @return Element self
   */
  bounce: function() {
    return this.fx('bounce', arguments);
  },
  
  /**
   * The zoom effect shortcut
   *
   * @param mixed the zooming value, see Fx.Zoom#start options
   * @param Object fx options
   * @return Element self
   */
  zoom: function(size, options) {
    return this.fx('zoom', [size, options || {}]);
  },
  
  /**
   * Initiates the Fx.Run effect
   *
   * @param String running direction
   * @param Object fx options
   * @return Element self
   */
  run: function() {
    return this.fx('run', arguments);
  },
  
  /**
   * The puff effect shortcut
   *
   * @param String running direction in|out|toggle
   * @param Object fx options
   * @return Element self
   */
  puff: function() {
    return this.fx('puff', arguments);
  },
  
  /**
   * The Fx.Class effect shortcut
   *
   * @param String css-class name to add
   * @param String css-class name to remove
   * @param Object fx options
   */
  morphToClass: function() {
    var args = $A(arguments);
    if (args[0] === null) args[0] = '';
    
    return this.fx('CSS', args);
  }
});