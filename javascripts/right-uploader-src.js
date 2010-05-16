/**
 * Form uploading progress bar feature
 * http://rightjs.org/ui/uploader
 *
 * Copyright (C) 2010 Nikolay V. Nemshilov
 */
if (!RightJS || !Form) throw "Gimme RightJS with Form";

/**
 * The uploading progress feature
 *
 * Copyright (C) 2010 Nikolay V. Nemshilov
 */
var Uploader = new Class(Observer, {
  extend: {
    EVENTS: $w('start update finish error'),

    Options: {
      url:         '/progress',
      param:       'X-Progress-ID',

      timeout:     1000,
      round:       0,
      fxDuration:  400,

      formCssRule: '.with-progress'
    }
  },

  /**
   * Basic constructor
   *
   * @param mixed a form reference
   * @param Object options
   */
  initialize: function(form, options) {
    this.form = $(form);

    this.$super(options || eval('('+this.form.get('data-uploader-options')+')'));

    this.element = this.find_or_build();

    this.bar = this.element.first('.bar');
    this.num = this.element.first('.num');

    this.form._uploader = this;
  },

  /**
   * Starts the uploading monitoring
   *
   * @return Uploader this
   */
  start: function() {
    var data = {state: 'starting'};
    return this.paint(data).prepare().request().fire('start', data);
  },

// protected

  // updates uploading bar progress
  update: function(data) {
    this.paint(data).fire('update', data);

    switch (data.state) {
      case 'starting':
      case 'uploading':
        this.request.bind(this).delay(this.options.timeout);
        break;
      case 'done':
        this.fire('finish', data);
        break;
      case 'error':
        this.fire('error', data);
        break;
    }

    return this;
  },

  // changes the actual element styles
  paint: function(data) {
    var percent = (this.percent || 0)/100;

    switch (data.state) {
      case 'starting':  percent = 0;   break;
      case 'done':      percent = 1; break;
      case 'uploading': percent = data.received / (data.size||1); break;
    }

    this.percent = (percent * 100).round(this.options.round);
    
    if (this.percent == 0 || !self.Fx || !this.options.fxDuration) {
      this.bar.style.width = this.percent + '%';
      this.num.innerHTML   = this.percent + '%';
    } else {
      this.bar.morph({width: this.percent + '%'}, {duration: this.options.fxDuration});
      (function() {
        this.num.innerHTML = this.percent + '%';
      }).bind(this).delay(this.options.fxDuration / 2);
    }

    // marking the failed uploads
    this.element[data.state == 'error' ? 'addClass' : 'removeClass']('right-progress-bar-failed');

    return this;
  },

  // sends a request to the server
  request: function() {
    Xhr.load(this.options.url + "?" + this.options.param + "=" + this.uid, {
      evalJSON: false,
      onSuccess: function(xhr) {
        this.update(eval('('+xhr.text+')'));
      }.bind(this)
    });

    return this;
  },

  // prepares the form to carry the x-progress-id param
  prepare: function() {
    this.uid = "";
    for (i = 0; i < 32; i++) { this.uid += Math.random(0, 15).toString(16); }
    
    var param = this.options.param;
    var url = this.form.action.replace(new RegExp('(\\?|&)'+RegExp.escape(param) + '=[^&]*', 'i'), '');
    this.form.action = (url.includes('?') ? '&' : '?') + param + '=' + this.uid;
    
    this.element.show();
    
    return this;
  },

  // finds or builds the progress-bar element
  find_or_build: function() {
    var element = this.form.first('div.right-progress-bar') || $E('div').insertTo(this.form);

    if (element.innerHTML.blank())
      element.innerHTML = '<div class="bar"></div><div class="num"></div>';

    return element.addClass('right-progress-bar');
  }

});

/**
 * The Form unit `send` method overloading
 * so that we could catch up the moment when it sent
 *
 * Copyright (C) 2010 Nikolay V. Nemshilov
 */
Form.include((function(old_method) {
  return {
    send: function() {
      // initializing the uploading handler if it supposed to be there
      if (this.match(Uploader.Options.formCssRule)) {
        if (!this._uploader)
          new Uploader(this);
          
        this._uploader.start();
      }
      
      return old_method.apply(this, arguments);
    }
  }
})(Form.Methods.send));document.write("<style type=\"text/css\">div.right-progress-bar,div.right-progress-bar*{margin:0;padding:0;border:none;background:none}div.right-progress-bar{position:relative;height:1.4em;line-height:1.4em;width:20em;border:1px solid #999;display:none}div.right-progress-bar,div.right-progress-bar div.bar{-moz-border-radius:0.25em;-webkit-border-radius:0.25em}div.right-progress-bar div.bar{position:absolute;left:0;top:0;width:0%;height:100%;background:#CCC;z-index:1}div.right-progress-bar div.num{position:absolute;width:100%;height:100%;z-index:2;text-align:center}div.right-progress-bar-failed{border-color:red;color:red;background:pink}</style>");