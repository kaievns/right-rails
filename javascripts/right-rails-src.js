/**
 * Ruby On Rails common Ajax operations conventional wrapper
 * and underscored aliases for core methods
 *
 *    http://github.com/MadRabbit/right-rails
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */

/**
 * RR is the common ajax operations wrapper for ruby on rails
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
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
    
    removeFx:         'fade',    // blocks removing fx
    insertFx:         'fade',    // blocks insertion fx
    
    insertPosition:   'bottom',  // default insert position
    
    linkToAjaxEdit:   '.ajax_edit',
    linkToAjaxDelete: '.ajax_delete',
    
    rescanWithScopes: true       // if it should rescan only updated elements
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
    if ($(id) && this.Options.highlightUpdates) {
      $(id).highlight();
    }
    return this;
  },
  
  /**
   * Inserts the content into the given element
   *
   * @param String destination id
   * @param String content
   * @param String position
   * @return RR this
   */
  insert: function(where, what, in_position) {
    var position  = in_position || this.Options.insertPosition, new_element,
        container = $(where).insert(what, position);
    
    // trying to find the new block
    switch (position) {
      case 'bottom':  new_element = container.subNodes().last(); break;
      case 'top':     new_element = container.first(); break;
      case 'before':  new_element = container.prev();  break;
      case 'after':   new_element = container.next();  break;
    }
    
    // necely displaying the new block
    if (new_element && this.Options.insertFx) {
      new_element.hide().show(this.Options.insertFx, {
        onFinish: this.highlight.bind(this, new_element)
      });
    } else {
      this.highlight(new_element);
    }
    
    return this.rescan(where);
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
    return this.highlight(id).rescan(id);
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
      var remove_element = element.remove.bind(element);
      
      if (this.Options.removeFx) {
        element.hide(this.Options.removeFx, {onFinish: remove_element});
      } else {
        remove_element();
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
    
    return this.rescan(id);
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
    
    return this.remotize_form($(id).first('form')).rescan(id);
  },
  
  /**
   * watches link clicks and processes the ajax edit/delete operations
   *
   * @param Event event
   */
  process_click: function(event) {
    var target = event.target, link = [target].concat(target.parents()).first('match', 'a');
    
    if (link) {
      if (link.match(this.Options.linkToAjaxEdit)) {
        event.stop();
        Xhr.load(link.href + '.' + this.Options.format);
        
      } else if (link.match(this.Options.linkToAjaxDelete) && link.has('onclick')) {
        event.stop();
        eval('({f:'+ link.onclick.toString().replace('.submit', '.send')+'})').f.call(link);
      }
    }
  },
  
  /**
   * Scans for updated elements
   *
   * @return RR this
   */
  rescan: function(scope) {
    $w('Draggable Droppable Tabs Slider Selectable').each(function(name) {
      if (name in self) self[name].rescan(this.Options.rescanWithScopes ? scope : null);
    }, this);
    
    
    return this;
  }
};

/**
 * Rails 3 UJS support module
 *
 * Copyright (C) 2010 Nikolay V. Nemshilov
 */
(function() {
  // tries to cancel the event via confirmation
  var user_cancels = function(event, element) {
    var message = element.get('data-confirm');
    if (message && !confirm(message)) {
      event.stop();
      return true;
    }
  };
  
  // adds XHR events to the element
  var add_xhr_events = function(element, options) {
    return Object.merge({
      onCreate:   function() { element.fire('ajax:loading',  this) },
      onComplete: function() { element.fire('ajax:complete', this) },
      onSuccess:  function() { element.fire('ajax:success',  this) },
      onFailure:  function() { element.fire('ajax:failure',  this) }
    }, options);
  };
  
  // processes link clicks
  var try_link_submit = function(event, link) {
    var method = link.get('data-method'), remote = link.get('data-remote');
    
    if (user_cancels(event, link)) return;
    if (method || remote) event.stop();
    
    if (remote)
      Xhr.load(link.href, add_xhr_events(link, {
        method:     method || 'get',
        spinner:    link.get('data-spinner')
      }));
      
    else if (method) {
      var param = $$('meta[name=csrf-param]')[0],
          token = $$('meta[name=csrf-token]')[0],
          form  = $E('form', {action: link.href, method: 'post'});
      
      if (param && token)
        form.insert('<input type="hidden" name="'+param.get('content')+'" value="'+token.get('content')+'" />');
      form.insert('<input type="hidden" name="_method" value="'+method+'"/>')
        .insertTo(document.body).submit();
    }
  };

  // processes form submits
  var try_form_submit = function(event, button) {
    if (!user_cancels(event, button) && $(button.form).has('data-remote')) {
      event.stop();
      button.form.send(add_xhr_events(button.form));
    }
  };

  // global events listeners
  document.on({
    click: function (event) {
      var target = event.target, form = target.form,
        link = [target].concat(target.parents()).first('match', 'a');
      
      if (form && ['submit', 'image'].include(target.type))
        try_form_submit(event, target);
      else if (link)
        try_link_submit(event, link);
    },

    keydown: function(event) {
      var target = event.target, form = target.form;
      if (form && target.tagName === 'INPUT' && event.keyCode == 13) {
        try_form_submit(event, target);
      }
    }
  });
})();

// the document onload hook
document.on({
  ready: function() {
    RR.hide_flash();
  },
  
  click: function(event) {
    RR.process_click(event);
  }
});
/**
 * Underscored aliases for Ruby On Rails
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */

// the language and window level aliases
[String.prototype, Array.prototype, Function.prototype, Object, Options, Observer, Observer.prototype, window, document].each(function(object) {
  for (var key in object) {
    try { // some keys are not accessable
      
      if (/[A-Z]/.test(key) && typeof(object[key]) === 'function') {
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
    if (/[A-Z]/.test(key) && typeof(methods[key]) === 'function') {
      aliases[key.underscored()] = methods[key];
    }
  }
  
  object.include(aliases);
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