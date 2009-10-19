/**
 * Ruby On Rails common Ajax operations conventional wrapper
 * and underscored aliases for core methods
 *
 *    http://github.com/MadRabbit/right-rails
 *
 * Copyright (C) Nikolay V. Nemshilov aka St.
 */

/**
 * RR is the common ajax operations wrapper for ruby on rails
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
;
var RR = {
  /**
   * Basic options
   *
   * NOTE: DO NOT CHANGE this hash right here
   *       Use your application.js file to alter the options
   */
  Options: {
    format:           'js',      // the working format for remote requests over the application
    
    flashId:          'flashes', // the flashes element id
    flashHideFx:      'slide',   // use null if you don't want any fx in here
    flashHideDelay:   3200,      // use -1 to disable the flash element hidding
    
    highlightUpdates: true,
    
    removeFx:         'fade'
  },
  
  /**
   * Updates the flashes block with the source
   *
   * @param String new content
   * @return RR this
   */
  update_flash: function(content) {
    var element = $(this.Options.flashId);
    if (element) {
      this.replace(element, content).hide_flash();
    }
    return this;
  },
  
  /**
   * Initializes the delayed flashes hide call
   *
   * @return RR this
   */
  hide_flash: function() {
    if (this.Options.flashHideDelay > -1) {
      var element = $(this.Options.flashId);
      if (element && element.visible()) {
        element.hide.bind(element, this.Options.flashHideFx).delay(this.Options.flashHideDelay);
      }
    }
    return this;
  },
  
  /**
   * Highlights the element according to the options
   * 
   * @param String element id
   * @return RR this
   */
  highlight: function(id) {
    if (this.Options.highlightUpdates) {
      $(id).highlight();
    }
    return this;
  },
  
  /**
   * Inserts the content into the given element
   *
   * @param String destination id
   * @param String content
   * @return RR this
   */
  insert: function(where, what) {
    return this.highlight($(where).insert(what).lastChild).rescan();
  },
  
  /**
   * Replaces the given element with a new content
   *
   * @param String destination id
   * @param String content
   * @return RR this
   */
  replace: function(id, source) {
    $(id).replace(source);
    return this.highlight(id).rescan();
  },
  
  /**
   * removes the element by id
   *
   * @param String element id
   * @return RR this
   */
  remove: function(id) {
    var element = $(id);
    if (element) {
      if (this.Options.removeFx) {
        element.hide(this.Options.removeFx, {
          onFinish: element.remove.bind(element)
        });
      } else {
        element.remove();
      }
    }
  },
  
  /**
   * Makes a remote form out of the form
   *
   * @param String form id
   * @return RR this
   */
  remotize_form: function(id) {
    var form = $(id);
    if (form) {
      form.remotize().enable().action += '.'+this.Options.format;
    }
    return this;
  },
  
  /**
   * Replaces the form with new content and makes it remote
   *
   * @param String form id
   * @param String content
   * @return RR this
   */
  replace_form: function(id, source) {
    var form = $(id);
    if (form) {
      form.replace(source);
      this.remotize_form(id);
    }
    
    return this.rescan();
  },
  
  /**
   * Inserts the form source into the given element
   *
   * @param String target id
   * @param String form source
   * @return RR this
   */
  show_form_for: function(id, source) {
    $(id).select('form').each('remove'); // removing old forms
    $(id).insert(source);
    
    return this.remotize_form($(id).first('form')).rescan();
  },
  
  /**
   * Hijacks the action links and makes them remote
   *
   * @return RR self
   */
  hijack_links: function() {
    this._links = this._links || [];
    
    $$('a.edit, a.destroy').each(function(link) {
      var uid = $uid(link);
      if (!this._links[uid]) {
        this._links[uid] = true;
        
        if (link.hasClass('destroy')) {
          link.onclick = eval('({f:'+ link.onclick.toString().replace('.submit', '.send')+'})').f;
        } else if (link.hasClass('edit')) {
          link.onclick = function(event) { event.stop();
            Xhr.load(link.href + '.' + this.Options.format);
          }.bind(this);
        }
      }
    }, this);
    
    return this;
  },
  
  /**
   * Scans for updated elements
   *
   * @return RR this
   */
  rescan: function() {
    this.hijack_links();
    
    if (self.Lightbox) Lightbox.rescan();
    if (self.Calendar) Calendar.rescan();
    if (self.Autocompleter) Autocompleter.rescan();
    if (self.Draggable) Draggable.rescan();
    if (self.Droppable) Droppable.rescan();
    if (self.Sortable)  Sortable.rescan();
    
    return this;
  }
};

// the document onload hook
document.onReady(function() {
  RR.hide_flash().rescan();
});
/**
 * Underscored aliases for Ruby On Rails
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */

// the language and window level aliases
[String.prototype, Array.prototype, Function.prototype, Object, Options, Observer, Observer.prototype, window, document].each(function(object) {
  for (var key in object) {
    try { // some keys are not accessable
      
      if (/[A-Z]/.test(key) && typeof(object[key]) == 'function') {
        var u_key = key.underscored();
        if (object[u_key] === null || object[u_key] === undefined) {
          object[u_key] = object[key];
        }
      }
    } catch (e) {}
  }
});


// DOM package aliases
[Element, Event, Form, Form.Element].each(function(object) {
  var aliases = {}, methods = object.Methods;
    
  for (var key in methods) {
    if (/[A-Z]/.test(key) && typeof(methods[key]) == 'function') {
      aliases[key.underscored()] = methods[key];
    }
  }
  
  object.addMethods(aliases);
});


// various ruby-like method aliases
$alias(String.prototype, {
  index_of:      'indexOf',
  last_index_of: 'lastIndexOf',
  to_f:          'toFloat',
  to_i:          'toInt',
  gsub:          'replace',
  downcase:      'toLowerCase',
  upcase:        'toUpperCase',
  index:         'indexOf',
  rindex:        'lastIndexOf',
  strip:         'trim'
});

$alias(Array.prototype, {
  collect:       'map',
  detect:        'filter',
  index_of:      'indexOf',
  last_index_of: 'lastIndexOf',
  index:         'indexOf',
  rindex:        'lastIndexOf'
});