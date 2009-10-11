/**
 * The RubyOnRails hooks for RightJS
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov aka St.
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
    return this.highlight($(where).insert(what).lastChild).hijack_links();
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
    return this.highlight(id).hijack_links();
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
    
    return this; 
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
    
    return this.remotize_form($(id).first('form'));
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
  }
};


// the document onload hook
document.onReady(function() {
  RR.hide_flash();
  RR.hijack_links();
});