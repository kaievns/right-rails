/**
 * RightJS UI Colorpicker widget
 *
 * See http://rightjs.org/ui/colorpicker
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
if (!self.RightJS) throw "Gimme RightJS";
/**
 * The basic file for Colorpicker
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
var Colorpicker = new Class(Observer, {
  extend: {
    EVENTS: $w('change show hide done'),
    
    Options: {
      format:     'hex',   // hex or rgb
      
      update:     null,    // an element to update with the color text
      updateBg:   null,    // an element to update it's background color
      
      fxName:     'fade',  // popup displaying fx
      fxDuration: 'short',
      
      cssRule:    '*[rel^=colorpicker]'
    },
    
    i18n: {
      Done: 'Done'
    },
    
    // builds or finds a colorpicker for the target element
    find: function(element) {
      var uid = $uid(element), instances = Colorpicker.instances;
      
      if (!instances[uid]) {
        var pick = instances[uid] = new Colorpicker(eval('('+ element.get('data-colorpicker-options') +')'));
        
        if (element.tagName == 'INPUT')
          pick.assignTo(element);
        else {
          var attr = Colorpicker.Options.cssRule.split('[').last().split('^=').first(),
              match = /\[(.+?)\]/.exec(element.get(attr)), input;
          
          if (match && (input = $(match[1]))) {
            pick.assignTo(input, element);
          }
        }
      }
      
      return instances[uid];
    },
    
    instances: []
  },
  
  /**
   * basic constructor
   *
   * @param Object options
   */
  initialize: function(options) {
    this.$super(options);
    this.init();
  },
  
  /**
   * Sets the color of the widget
   *
   * @param mixed value, Array or HEX or RGB value
   * @return Colorpicker this
   */
  setValue: function(value) {
    var color = isArray(value) ? value : this.toColor(value);
    if (color && color.length == 3) {
      
      // normalizing the data
      color = color.map(function(value) {
        return this.bound((''+value).toInt(), 0, 255);
      }, this);
      
      this.color = color;
      this.color2tint().update();
    }
    return this;
  },
  
  /**
   * Returns the value of the widget
   * formatted according to the options
   *
   * @param Boolean if you need a clean RGB values array
   * @return mixed value
   */
  getValue: function(array) {
    return array ? this.color : this[this.options.format === 'rgb' ? 'toRgb' : 'toHex']();
  },
  
  /**
   * Inlines the widget into the given element
   *
   * @param Element reference
   * @param String optional position
   * @return Colorpicker this
   */
  insertTo: function(element, position) {
    this.element
      .addClass('right-colorpicker-inline')
      .insertTo(element, position);
      
    return this;
  },
  
// protected

  // initializes the widget
  init: function() {
    this.build();
    
    // attaching the mouse-events to the fields
    [this.field, this.colors].each(function(element) {
      element.onMousedown(this.startTrack.bind(this));
    }, this);
    
    // tracking the changes on the input fields
    [this.display, this.rDisplay, this.gDisplay, this.bDisplay].each('on', {
      keyup: this.recalc.bind(this),
      blur:  this.update.bind(this),
      focus: this.cancelTimer.bind(this)
    });
    
    // attaching the done button
    this.button.onClick(this.fire.bind(this, 'done'));
    
    // preventing the general body clicks
    this.element.onMousedown(function(event) {
      if (event.target.tagName !== 'INPUT') {
        event.stop();
        this.cancelTimer();
      }
    }.bind(this));
    
    // attaching the picker own events
    this
      .onDone('hide')
      .onChange(function(color) {
        if (this.target) {
          this.target[this.target.tagName == 'INPUT' ? 'value' : 'innerHTML'] = 
            this[this.options.format == 'rgb' ? 'toRgb' : 'toHex']();
        }
      }.bind(this));
    
    // hooking up the elements to update
    if (this.options.update)   this.assignTo(this.options.update);
    if (this.options.updateBg) this.updateBg(this.options.updateBg);
    
    // setting up the initial value
    // NOTE: to speed the things up a bit we use params
    //       for tint, saturation and brightness and 
    //       normal RGB value to keep the current color
    this.tint   = [1, 0, 0];
    this.satur  = 0;
    this.bright = 1;
    this.color  = [255, 255, 255];
    
    this.recalc().update();
  },
  
  // builds the widget
  build: function() {
    var base = this.element = $E('div', {'class': 'right-colorpicker right-ui-panel'});
    
    // the field block
    this.field = $E('div', {'class': 'field'}).insertTo(base);
    this.fieldPointer = $E('div', {'class': 'field-pointer'}).insertTo(this.field);
    
    // the tint block
    this.colors = $E('div', {'class': 'colors'}).insertTo(base);
    this.colorsPointer = $E('div', {'class': 'colors-pointer'}).insertTo(this.colors);
    
    // the controls block
    $E('div', {'class': 'controls'}).insert([
      this.preview = $E('div', {'class': 'preview', 'html': '&nbsp;'}).insertTo(base),
      this.display = $E('input', {'type': 'text', 'class': 'display', maxlength: 7}).insertTo(base),
      $E('div', {'class': 'rgb-display'}).insert([
        $E('div').insert([$E('label', {html: 'R:'}), this.rDisplay = $E('input', {maxlength: 3, cIndex: 0})]),
        $E('div').insert([$E('label', {html: 'G:'}), this.gDisplay = $E('input', {maxlength: 3, cIndex: 1})]),
        $E('div').insert([$E('label', {html: 'B:'}), this.bDisplay = $E('input', {maxlength: 3, cIndex: 2})])
      ]),
      this.button  = $E('input', {'type': 'button', 'class': 'right-ui-button', value: Colorpicker.i18n.Done})
    ]).insertTo(base);
  },
  
  // updates the preview and pointer positions
  update: function() {
    this.field.style.backgroundColor   = 'rgb('+ this.tint.map(function(c) { return (c*255).round(); }) +')';
    this.preview.style.backgroundColor = this.display.value = this.toHex();
    
    // updating the input fields
    var color = this.color;
    this.rDisplay.value = color[0];
    this.gDisplay.value = color[1];
    this.bDisplay.value = color[2];
    
    // adjusting the field pointer position
    var pointer = this.fieldPointer.style,
      field = this.field.sizes(),
      top  = field.y - this.bright * field.y - 2,
      left = this.satur * field.x - 2;
    
    pointer.top  = this.bound(top,  0, field.y - 5) + 'px';
    pointer.left = this.bound(left, 0, field.x - 5) + 'px';
    
    // adjusting the ting pointer position
    var field = this.colors.sizes(), tint = this.tint, position;
  
    if (tint[1] == 0) { // the red-blue section
      position = tint[0] == 1 ? tint[2] : (2 - tint[0]);
    } else if (tint[0] == 0) { // the blue-green section
      position = 2 + (tint[2] == 1 ? tint[1] : (2 - tint[2]));
    } else { // the green-red section
      position = 4 + (tint[1] == 1 ? tint[0] : (2 - tint[1]));
    }
    
    position = position / 6 * field.y;
    
    this.colorsPointer.style.top = this.bound(position, 0, field.y - 4) + 'px';
    
    // tracking the color change events
    if (this.prevColor !== ''+this.color) {
      this.fire('change', this.color);
      this.prevColor = ''+ this.color;
    }
    
    return this;
  },
  
  // recalculates the state after the input field changes
  recalc: function(event) {
    if (event) {
      var field = event.target, value = field.value, color = this.color.clone(), changed=false;
      
      if (field == this.display && /#\w{6}/.test(value)) {
        // using the hex values
        changed = color = this.toColor(value);
      } else if (/^\d+$/.test(value)) {
        // using the rgb values
        color[field.cIndex] = value;
        changed  = true;
      }
      
      if (changed) this.setValue(color);
      
    } else {
      this.tint2color();
    }
    
    return this;
  },
  
  // starts the mousemoves tracking
  startTrack: function(event) {
    event.stop();
    this.stopTrack();
    this.cancelTimer();
    Colorpicker.tracking = this;
    event.target.tracking = true;
    this.trackMove(event); // jumping over there
  },
  
  // stops tracking the mousemoves
  stopTrack: function() {
    Colorpicker.tracking = false;
    this.field.tracking  = false;
    this.colors.tracking = false;
  },
  
  // tracks the cursor moves over the fields
  trackMove: function(event) {
    var field, pos = event.position(), top, left;
    
    if (this.field.tracking) {
      field   = this.field.dimensions();
    } else if (this.colors.tracking) {
      field   = this.colors.dimensions();
    }
    
    if (field) {
      top   = this.bound(pos.y - field.top,  0, field.height);
      left  = this.bound(pos.x - field.left, 0, field.width);
      
      if (this.field.tracking) {
        this.satur  = left / field.width;
        this.bright = 1 - top / field.height;
        
      } else if (this.colors.tracking) {
        // preventing it from jumping to the top
        if (top == field.height) top = field.height - 0.1;
        
        var step = field.height / 6,
            tint = this.tint = [0, 0, 0],
            stright = top % step / step,
            reverse = 1 - stright;
        
        if (top < step) {
          tint[0] = 1;
          tint[2] = stright;
        } else if (top < step * 2) {
          tint[0] = reverse;
          tint[2] = 1;
        } else if (top < step * 3) {
          tint[2] = 1;
          tint[1] = stright;
        } else if (top < step * 4) {
          tint[2] = reverse;
          tint[1] = 1;
        } else if (top < step * 5) {
          tint[1] = 1;
          tint[0] = stright;
        } else {
          tint[1] = reverse;
          tint[0] = 1;
        }
      }
      
      this.recalc().update();
    }
  }
});

/**
 * This module contains various caluculations logic for 
 * the Colorpicker widget
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
Colorpicker.include({
  /**
   * Converts the color to a RGB string value
   *
   * @param Array optional color
   * @return String RGB value
   */
  toRgb: function(color) {
    return 'rgb('+ this.color.join(',') +')';
  },
  
  /**
   * Converts the color to a HEX string value
   *
   * @param Array optional color
   * @return String HEX value
   */
  toHex: function(color) {
    return '#'+ this.color.map(function(c) { return (c < 16 ? '0' : '') + c.toString(16); }).join('');
  },
  
  /**
   * Converts a string value into an Array of color
   *
   * @param String value
   * @return Array of color or null
   */
  toColor: function(in_value) {
    var value = in_value.toLowerCase(), match;
    
    if (match = /rgb\((\d+),(\d+),(\d+)\)/.exec(value)) {
      return [match[1], match[2], match[3]].map('toInt');
      
    } else if (/#[\da-f]+/.test(value)) {
      // converting the shortified hex in to the full-length version
      if (match = /^#([\da-f])([\da-f])([\da-f])$/.exec(value))
        value = '#'+match[1]+match[1]+match[2]+match[2]+match[3]+match[3];
        
      if (match = /#([\da-f]{2})([\da-f]{2})([\da-f]{2})/.exec(value)) {
        return [match[1], match[2], match[3]].map('toInt', 16);
      }
    }
  },
  
  /**
   * converts color into the tint, saturation and brightness values
   *
   * @return Colorpicker this
   */
  color2tint: function() {
    var color = this.color.clone().sort(function(a,b) { return a-b; }),
        min = color[0], max = color[2];
    
    this.bright = max / 255;
    this.satur  = 1 - min / (max || 1);
    
    this.tint.each(function(value, i) {
      return this.tint[i] = ((!min && !max) || min == max) ? i == 0 ? 1 : 0 :
        (this.color[i] - min) / (max - min);
    }, this);
    
    return this;
  },
  
  /**
   * Converts tint, saturation and brightness into the actual RGB color
   *
   * @return Colorpicker this
   */
  tint2color: function() {
    var tint = this.tint, color = this.color;
    
    for (var i=0; i < 3; i++) {
      color[i] = 1 + this.satur * (tint[i] - 1);
      color[i] = (255 * color[i] * this.bright).round();
    }
    
    return this;
  },
  
  /**
   * bounds the value to the given limits
   *
   * @param Number value
   * @param Number min value
   * @param Number max value
   * @return Number the value in bounds
   */
  bound: function(in_value, min, max) {
    var value = in_value;
    
    if (min < max) {
      value = value < min ? min : value > max ? max : value;
    } else {
      if (value > max) value = max;
      if (value < min) value = min;
    }
    
    return value;
  }
});

/**
 * This module handles the colorpicker assignments
 * to input fields
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
Colorpicker.include({
  /**
   * Hides the pop up element
   *
   * @return Colorpicker this
   */
  hide: function() {
    if (!this.element.hasClass('right-colorpicker-inline')) {
      this.target = null;
      Colorpicker.current = null;
      this.element.hide(this.options.fxName, {
        duration: this.options.fxDuration
      });
      
      this.fire('hide');
    }
    
    return this;
  },
  
  /**
   * Shows the element as a popup
   *
   * @param Element where to show the popup
   * @return Colorpicker this
   */
  show: function(target) {
    // moving into the target position
    if (target) {
      var element = $(target).dimensions(), style = this.element.style;
      
      if (element) {
        style.left = element.left + 'px';
        style.top  = element.top + element.height + 'px';
        
        this.target = $(target);
      }
    }
    
    // hide the others
    if (Colorpicker.current && Colorpicker.current !== this) {
      Colorpicker.current.element.hide();
    }
    
    this.element.insertTo(document.body);
    
    if (!this.element.visible()) {
      this.element.show(this.options.fxName, {
        duration: this.options.fxDuration
      });
      
      this.fire('show');
    }
    
    if (this.target) {
      this.setValue(this.target.value);
    }
    
    return Colorpicker.current = this;
  },
  
  /**
   * Toggles the visibility status
   *
   * @param Element target
   * @return Colorpicker this
   */
  toggle: function(target) {
    return this[this.element.visible() ? 'hide' : 'show'](target);
  },
  
  /**
   * Assigns the colorpicer to work in pair with an input of a content element
   *
   * @param Element reference
   * @param Element optional trigger element
   * @return Colorpicker this
   */
  assignTo: function(input, trigger) {
    var input = $(input), trigger = $(trigger);
    
    if (trigger) {
      trigger.onClick(function(e) {
        e.stop();
        this.toggle(input.focus());
      }.bind(this));
    } else {
      input.onFocus(this.show.bind(this, input));
    }
    
    input.on({
      blur:  function() {
        this.timer = (function() {
          this.hide();
        }).bind(this).delay(100);
      }.bind(this),
      
      keyUp: function() {
        this.setValue(input.value);
      }.bind(this)
    });
    
    this.element.hide();
    
    return this;
  },
  
  /**
   * Assigns the colorpicer to automatically update
   * given element's background on changes
   *
   * @param mixed element reference
   * @return Colorpicker this
   */
  updateBg: function(element_ref) {
    var element = $(element_ref);
    if (element) {
      this.onChange(function(color) {
        element.style.backgroundColor = this.toRgb();
      }.bind(this));
    }
    return this;
  },
  
// protected

  cancelTimer: function() {
    (function() { // IE has a lack of sync in here
      if (this.timer) {
        this.timer.cancel();
        this.timer = null;
      }
    }).bind(this).delay(10);
  }
});

/**
 * The document level hooks for colorpicker
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
document.on({
  mouseup: function() {
    if (Colorpicker.tracking) {
      Colorpicker.tracking.stopTrack();
    }
  },
  
  mousemove: function(event) {
    if (Colorpicker.tracking) {
      Colorpicker.tracking.trackMove(event);
    }
  },
  
  mousedown: function(event) {
    var picker = Colorpicker.current, target = event.target;
    
    if (picker && target != picker.target && ![target].concat(target.parents()).include(picker.element)) {
      picker.hide();
    }
  }
});

window.on('blur', function() {
  if (Colorpicker.tracking) {
    Colorpicker.tracking.stopTrack();
  }
});

// colorpickers autodiscovery feature
Colorpicker.Options.cssRule.on({
  focus: function(event) {
    if (this.tagName == 'INPUT') {
      Colorpicker.find(this).show(this);
    }
  },
  
  click: function(event) {
    var attr = Colorpicker.Options.cssRule.split('[').last().split('^=').first(),
        match = /\[(.+?)\]/.exec(this.get(attr)), input;

    if (match && (input = $(match[1]))) {
      event.stop();
      
      Colorpicker.find(this).show(input);
    }
  }
});
document.write("<style type=\"text/css\">div.right-colorpicker,div.right-colorpicker*{border:none;background:none;width:auto;height:auto;position:static;float:none;top:none;left:none;right:none;bottom:none;margin:0;padding:0;display:block;font-weight:normal;vertical-align:center}div.right-colorpicker{position:absolute;padding:.6em;background:#EEE;border:1px solid #CCC;-moz-border-radius:.2em;-webkit-border-radius:.2em;-moz-box-shadow:#AAA .3em .3em .4em;-webkit-box-shadow:#AAA .3em .3em .4em;z-index:9999}div.right-colorpicker div.field,div.right-colorpicker div.field-pointer,div.right-colorpicker div.colors,div.right-colorpicker div.colors-pointer{background:url(/images/rightjs-ui/colorpicker.png) no-repeat 0 0}div.right-colorpicker div.field,div.right-colorpicker div.colors,div.right-colorpicker div.controls{display:inline-block;*display:inline;*zoom:1;position:relative;vertical-align:top;height:150px}div.right-colorpicker div.field-pointer,div.right-colorpicker div.colors-pointer{position:absolute;top:0px;left:0;width:9px;height:9px}div.right-colorpicker input.display,div.right-colorpicker div.preview,div.right-colorpicker div.rgb-display,div.right-colorpicker input.right-ui-button{font-size:100%;display:block;width:auto;padding:0 .2em}div.right-colorpicker input.display,div.right-colorpicker div.preview,div.right-colorpicker div.rgb-display input,div.right-colorpicker input.right-ui-button{border:1px solid #AAA;-moz-border-radius:.2em;-webkit-border-radius:.2em}div.right-colorpicker div.field{width:150px;background-color:red;cursor:crosshair;margin-right:1.2em}div.right-colorpicker div.field-pointer{background-position:-170px 0;margin-left:-2px;margin-top:-2px}div.right-colorpicker div.colors{width:16px;background-position:-150px 0;border-color:#EEE;cursor:pointer;margin-right:.6em}div.right-colorpicker div.colors-pointer{cursor:default;background-position:-170px -20px;margin-left:-8px;margin-top:-3px}div.right-colorpicker div.controls{width:5em}div.right-colorpicker div.preview{height:2em;background:white;border-color:#BBB}div.right-colorpicker input.display{margin-top:.5em;background:#FFF;width:4.5em}div.right-colorpicker div.rgb-display{padding:0;text-align:right;margin-top:.5em}div.right-colorpicker div.rgb-display label{display:inline}div.right-colorpicker div.rgb-display input{vertical-align:top;font-size:100%;width:2em;text-align:right;margin-left:.2em;padding:0 .2em;background:#FFF;margin-bottom:1px;display:inline}div.right-colorpicker input.right-ui-button{cursor:pointer;position:absolute;bottom:0;width:5em;background:#CCC}div.right-colorpicker-inline{display:inline-block;*display:inline;*zoom:1;position:relative;-moz-box-shadow:none;-webkit-box-shadow:none;z-index:auto}</style>");