/**
 * Inline editor feature for RightJS (http://rightjs.org/ui/in-edit)
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
/**
 * An inline editor feature
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov
 */
var InEdit = new Class(Observer, {
  extend: {
    EVENTS: $w('show hide send update'),
    
    Options: {
      url:    null,    // the url address where to send the stuff
      name:   'text',  // the field name
      method: 'put',   // the method
      
      type:   'text',  // the input type, 'text', 'file', 'password' or 'textarea'
      
      toggle:  null,   // a reference to an element that should get hidden when the editor is active
      
      update:  true,   // a marker if the element should be updated with the response-text
      
      Xhr: {}          // additional Xhr options
    },
    
    i18n: {
      save:   'Save',
      cancel: 'Cancel'
    },
    
    current: null      // currently opened editor
  },
  
  /**
   * Constructor
   *
   * @param mixed an element reference
   * @param Object options
   */
  initialize: function(element, options) {
    this.setOptions(options);
    this.element = $(element);
    
    this.build();
  },
  
  /**
   * Shows the inline-editor form
   *
   * @return InEdit this
   */
  show: function() {
    if (InEdit.current !== this) {
      if (InEdit.current) InEdit.current.hide();
      
      this.oldContent = this.element.innerHTML;
      
      if (!['file', 'password'].include(this.options.type))
        this.field.value = this.oldContent;
        
      this.element.clean().insert(this.form);
      
      this.spinner.hide();
      this.submit.show();
      
      if (this.options.toggle)
        $(this.options.toggle).hide();
    }
    
    if (this.options.type != 'file')
      this.field.focus();
    
    InEdit.current = this;
    return this.fire('show', this);
  },
  
  /**
   * Hides the form and brings the content back
   *
   * @param String optional new content
   * @return InEdit this
   */
  hide: function() {
    this.element.innerHTML = this.oldContent;
    
    if (this.xhr) this.xhr.cancel();
    
    return this.finish();
  },
  
  /**
   * Triggers the form remote submit
   *
   * @return InEdit this
   */
  send: function() {
    this.spinner.show().resize(this.submit.sizes());
    this.submit.hide();
    
    this.xhr = new Xhr(this.options.url, Object.merge(this.options.Xhr, {
      method:     this.options.method,
      spinner:    this.spinner,
      onComplete: this.update.bind(this)
    })).send(this.form);
    
    return this.fire('send', this)
  },
  
// protected

  finish: function() {
    if (this.options.toggle)
      this.options.toggle.show();
    
    InEdit.current = null;
    return this.fire('hide', this);
  },

  update: function() {
    if (this.options.update) {
      this.element.update(this.xhr.text);
      this.fire('update', this);
    }
    
    this.xhr = null;
    
    this.finish();
  },
  
  build: function() {
    this.field   = this.buildField();
    this.spinner = this.buildSpinner();
    this.submit  = $E('input', {type: 'submit', 'class': 'right-in-edit-submit', value: this.constructor.i18n.save});
    this.cancel  = $E('a', {href: '', 'class': 'right-in-edit-cancel', html: this.constructor.i18n.cancel});
    this.form    = $E('form', {'class': 'right-in-edit', action: this.options.url})
      .insert([this.field, this.spinner, this.submit, this.cancel]);
    
    this.form.onSubmit(function(e)  {e.stop(); this.send(); }.bind(this));
    this.cancel.onClick(function(e) {e.stop(); this.hide(); }.bind(this));
  },
  
  buildField: function() {
    return (this.options.type == 'textarea' ? $E('textarea') : 
      $E('input', {type: this.options.type}))
        .addClass('right-in-edit-field')
        .set('name', this.options.name);
  },
  
  buildSpinner: function() {
    var spinner = $E('div', {
      'class': 'right-in-edit-spinner',
      'html': '<div class="glow"></div><div></div><div></div>'
    });
    
    (function() {
      if (spinner.firstChild) {
        spinner.insertBefore(spinner.lastChild, spinner.firstChild);
      }
    }).periodical(400);
    
    return spinner;
  }
  
});

/**
 * The document hooks for in-edit form
 *
 * Copyright (C) 2010 Nikolay V. Nemshilov
 */
document.onKeydown(function(event) {
  if (event.keyCode == 27 && InEdit.current)
    InEdit.current.hide();
});

/**
 * The element level inline editor extension
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Element.include({
  /**
   * Triggers an inline-editor feature on the element
   *
   * @param Object options for the InEdit class
   * @return InEdit object
   */
  inEdit: function(options) {
    return new InEdit(this, options).show();
  }
});document.write("<style type=\"text/css\">form.right-in-edit,*.right-in-edit-field,*.right-in-edit-submit,*.right-in-edit-cancel,*.right-in-edit-spinner,*.right-in-edit-spinner div{margin:0;padding:0}form.right-in-edit,*.right-in-edit-spinner,*.right-in-edit-spinner div{display:inline-block;*display:inline;*zoom:1;border:none;background:none}textarea.right-in-edit-field{width:100%;margin-bottom:.5em}*.right-in-edit-field,*.right-in-edit-submit,*.right-in-edit-spinner{margin-right:.2em}*.right-in-edit-spinner{background:#EEE;border:1px solid #DDD;-moz-border-radius:.2em;-webkit-border-radius:.2em;text-align:center;line-height:100%}*.right-in-edit-spinner div{width:.3em;height:.7em;margin-top:.3em;background:#BBB;margin-right:2px;-moz-border-radius:.1em;-webkit-border-radius:.1em}*.right-in-edit-spinner div.glow{background:#777}</style>");