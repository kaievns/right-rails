/**
 * The lightbox widget implemented with RightJS
 *
 * Home page: http://rightjs.org/ui/lightbox
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
if (!RightJS) { throw "Gimme RightJS please." };
/**
 * The lightbox widget
 *
 * Credits:
 *   Inspired by and monkeys the Lightbox 2 project
 *    -- http://www.huddletogether.com/projects/lightbox2/ 
 *      Copyright (C) Lokesh Dhakar
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Browser.IE6 = navigator.userAgent.indexOf("MSIE 6") != -1;
var Lightbox = new Class({
  include: Options,
  
  extend: {
    Version: "#{version}",
    
    Options: {
      endOpacity:      0.8,
      fxDuration:      200,
      
      hideOnEsc:       true,
      hideOnOutClick:  true,
      showCloseButton: true,
      blockContent:    false,
      
      cssRule:         "a[rel^=lightbox]",             // all lightbox links css-rule
      
      mediaWidth:      425,  // video links default size
      mediaHeight:     350
    },
    
    i18n: {
      CloseText:  '&times;',
      CloseTitle: 'Close',
      PrevText:   '&lsaquo;&lsaquo;&lsaquo;',
      PrevTitle:  'Previous Image',
      NextText:   '&rsaquo;&rsaquo;&rsaquo;',
      NextTitle:  'Next Image'
    },
    
    // media content sources
    Medias: [
      [/(http:\/\/.*?youtube\.[a-z]+)\/watch\?v=([^&]+)/,       '$1/v/$2',                      'swf'],
      [/(http:\/\/video.google.com)\/videoplay\?docid=([^&]+)/, '$1/googleplayer.swf?docId=$2', 'swf'],
      [/(http:\/\/vimeo\.[a-z]+)\/([0-9]+).*?/,                 '$1/moogaloop.swf?clip_id=$2',  'swf']
    ],
    
    boxes: [],
    
    // DEPRECATED: we use events delegation now, there's no need to call this function any more
    rescan: function() {}
  },
  
  /**
   * basic constructor
   *
   * @param Object options override
   */
  initialize: function(options) {
    this.setOptions(options).build().connectEvents();
    
    Lightbox.boxes.push(this);
  },
  
  /**
   * Sets the popup's title
   *
   * @param mixed string or element or somethin'
   * @return Lighbox self
   */
  setTitle: function(text) {
    (function() {
      this.caption.update(text)
    }).bind(this).delay(this.options.fxDuration);
    
    return this;
  },
  
  /**
   * Hides the box
   *
   * @return Lightbox self
   */
  hide: function() {
    this.element.hide('fade', {
      duration: this.options.fxDuration/2,
      onFinish: this.element.remove.bind(this.element)
    });
    return this;
  },
  
  /**
   * shows the lightbox with the content
   *
   * @param mixed content String, Element, Array, NodeList, ....
   * @return Lightbox self
   */
  show: function(content, size) {
    return this.showingSelf(function() {
      this.lock();
      this.content.update(content || '');
      this.resize(size);
    }.bind(this));
  },
  
  /**
   * resizes the dialogue to fit the content
   *
   * @param Object {x:.., y:..} optional end size definition
   * @return Lightbox self
   */
  resize: function(size, no_fx) {
    this.dialog.style.top = (window.sizes().y - this.dialog.sizes().y) / 2 + 'px';
    
    var body_style   = this.contentSize(size);
    var height_diff  = this.dialog.sizes().y - this.body.sizes().y;
    var body_height  = body_style.height.toInt() || this.minBodyHeight();
    var dialog_style = {
      top: (this.element.sizes().y - body_height - height_diff)/2 + 'px'
    };
    
    // IE6 screws with the dialog width
    if (Browser.IE6) {
      var padding = this.bodyWrap.getStyle('padding').toInt() > 0 ? 15 : 0;
      this.bodyWrap.setStyle('padding: '+padding+'px');
      
      dialog_style.width = (body_style.width.toInt() + padding * 2) + 'px';
    }
    
    if (no_fx === true) {
      this.body.setStyle(body_style);
      this.dialog.setStyle(dialog_style);
      this.loading = false;
    } else {
      this.resizeFx(body_style, dialog_style);
    }
    
    return this;
  },
  
// protected
  
  // locks the body
  lock: function() {
    this.bodyLock.removeClass('lightbox-body-lock-transparent').removeClass('lightbox-body-lock-loading').show();
    if (Browser.OLD) this.bodyLock.setStyle("opacity: 1");
    return this;
  },
  
  // unlocks the body
  unlock: function() {
    if (this.options.blockContent) {
      this.bodyLock.addClass('lightbox-body-lock-transparent');
    } else {
      this.bodyLock.hide();
    }
    return this;
  },
  
  // resize specific lock
  resizeLock: function() {
    this.lock().content.hide();
  },
  
  // resize specific unlock
  resizeUnlock: function() {
    this.unlock().content.show('fade', {
      duration: this.options.fxDuration/2
    });
    this.loading = false;
  },
  
  // returns the content size hash
  contentSize: function(size) {
    var size = size === this.$listeners ? null : size,
      max_width = this.element.offsetWidth * 0.8,
      max_height = this.element.offsetHeight * 0.8;
    
    if (size) this.content.setStyle(size);
    
    size = this.content.sizes();
    
    return {
      width:  (size.x > max_width  ? max_width  : size.x)+"px",
      height: (size.y > max_height ? max_height : size.y)+"px"
    };
  },
  
  // adjusts the box size so that it closed the whole window
  boxResize: function(resize) {
    this.element.resize(window.sizes());
    
    // IE6 needs to handle the locker position and size manually
    if (Browser.IE6) {
      this.locker.resize(window.sizes());
        
      this.element.style.position = 'absolute';
      this.element.style.top = document.documentElement.scrollTop + 'px';
    }
    
    return this.resize(false, true);
  },
  
  // performs an action showing the lighbox
  showingSelf: function(callback) {
    Lightbox.boxes.without(this).each('hide');
    
    if (this.element.hidden()) {
      this.element.insertTo(document.body).show();
      
      this.boxResize();
    }
    
    callback();
    
    return this;
  },
  
  // builds the basic structure
  build: function() {
    this.element  = this.E('lightbox').setStyle('display: none');
    this.locker   = this.E('lightbox-locker',    this.element);
    this.dialog   = this.E('lightbox-dialog',    this.element);
    this.caption  = this.E('lightbox-caption',   this.dialog);
    this.bodyWrap = this.E('lightbox-body-wrap', this.dialog);
    this.body     = this.E('lightbox-body',      this.bodyWrap);
    this.content  = this.E('lightbox-content',   this.body);
    this.bodyLock = this.E('lightbox-body-lock', this.body).hide();
    
    // the close button if asked
    if (this.options.showCloseButton) {
      this.closeButton = this.E('lightbox-close-button', this.dialog)
        .onClick(this.hide.bind(this)).update(Lightbox.i18n.CloseText).set('title', Lightbox.i18n.CloseTitle);
    }
    
    if (this.options.hideOnOutClick) {
      this.locker.onClick(this.hide.bind(this));
    }
    
    document.on('mousewheel', function(e) {
      if (this.element.visible()) {
        e.stop();
        this[(e.detail || -e.wheelDelta) < 0 ? 'showPrev' : 'showNext']();
      }
    }.bind(this));
    
    return this;
  },
  
  // connects the events handling for the box
  connectEvents: function() {
    if (this.options.hideOnEsc) {
      document.onKeydown(function(event) {
        if (event.keyCode == 27) {
          event.stop();
          this.hide();
        }
      }.bindAsEventListener(this));
    }
    
    window.on('resize', this.boxResize.bind(this));
    
    return this;
  },
  
  // calculates the minimal body height
  minBodyHeight: function() {
    var element = $E('div', {'class': 'lightbox-body', style: 'background: none; position: absolute'}).insertTo(document.body),
      height = element.sizes().y;
    element.remove();
    return height;
  },
  
  // processes the resizing visual effect
  resizeFx: function(body_style, dialog_style) {
    this.resizeLock();
    
    // processing everything in a single visual effect so it looked smooth
    var body_start_width   = this.body.sizes().x;
    var body_end_width     = body_style.width.toInt();
    var body_start_height  = this.body.sizes().y;
    var body_end_height    = body_style.height.toInt();
    var dialog_start_top   = this.dialog.style.top.toInt();
    var dialog_end_top     = dialog_style.top.toInt();
    var dialog_start_width = this.dialog.sizes().x;
    var dialog_end_width   = (dialog_style.width || '0').toInt();
    var body_style         = this.body.style;
    var dialog_style       = this.dialog.style;
    
    $ext(new Fx(this.dialog, {duration: this.options.fxDuration}), {
      render: function(delta) {
        body_style.width  = (body_start_width  + (body_end_width  - body_start_width)  * delta) + 'px';
        body_style.height = (body_start_height + (body_end_height - body_start_height) * delta) + 'px';
        dialog_style.top  = (dialog_start_top  + (dialog_end_top  - dialog_start_top)  * delta) + 'px';
        
        if (Browser.IE6) {
          dialog_style.width  = (dialog_start_width  + (dialog_end_width  - dialog_start_width)  * delta) + 'px';
        }
      }
    }).onFinish(this.resizeUnlock.bind(this)).start();
  },
  
// private
  // elements building shortcut
  E: function(klass, parent) {
    var e = $E('div', {'class': klass});
    if (parent) e.insertTo(parent);
    return e;
  }
  
});

/**
 * Ajax loading support module
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Lightbox.include((function(proto) {
  var old_show  = proto.show;
  var old_build = proto.build;
  
  return {
    // hightjacking the links
    show: function(content) {
      if (content && content.href) {
        return this.load(content.href, {
          onComplete: function(request) {
            this.checkTheRoad(content)
              .setTitle(content.title)
              .content.update(request.responseText);
          }.bind(this)
        });
      } else {
        return old_show.apply(this, arguments);
      }
    },
    
    /**
     * Loads the url via an ajax request and assigns the box content wiht the response result
     *
     * NOTE: will perform a GET request by default
     *
     * NOTE: will just update the body content with
     *       the response text if no onComplete or
     *       onSuccess callbacks were set
     *
     * @param String url address
     * @param Object Xhr options
     * @return Lightbox self
     */
    load: function(url, options) {
      var options = options || {};
      
      $w('onCreate onComplete').each(function(name) {
        options[name] = options[name] ? isArray(options[name]) ? options[name] : [options[name]] : [];
      });

      // adding the selfupdate callback as default
      if (options.onComplete.empty() && !options.onSuccess) {
        options.onComplete.push(function(request) {
          this.content.update(request.responseText);
        }.bind(this));
      }

      options.onCreate.unshift(this.loadLock.bind(this));
      options.onComplete.push(this.resize.bind(this));

      options.method = options.method || 'get';

      return this.showingSelf(Xhr.load.bind(Xhr, url, options));
    },
    
  // protected
    
    // xhr requests loading specific lock
    loadLock: function() {
      this.loading = true;
      this.lock().bodyLock.addClass('lightbox-body-lock-loading');
      return this;
    },
    
    build: function() {
      var res = old_build.apply(this, arguments);
      
      // building a textual spinner
      var spinner = this.E('lightbox-body-lock-spinner', this.bodyLock);
      var dots    = '1234'.split('').map(function(i) {
        return $E('div', {'class': i == 1 ? 'glow':null}).insertTo(spinner);
      });
      (function() {
        var dot = dots.pop(); dot.insertTo(spinner, 'top'); dots.unshift(dot);
      }).periodical(400);
      
      return res;
    }
  };
})(Lightbox.prototype));

/**
 * Roadtrips support module for the lightbox
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Lightbox.include((function(proto) {
  var old_show  = proto.show;
  var old_build = proto.build;
  var old_event = proto.connectEvents;
  
  return {
    // highjacking a roadtrip content
    show: function(content) {
      this.roadLink = (content && content.roadtrip) ? content : null;
      return old_show.apply(this, arguments);
    },
    
    // the building process overlaping
    build: function() {
      var res = old_build.apply(this, arguments);
      
      this.prevLink = this.E('lightbox-prev-link', this.dialog).onClick(this.showPrev.bind(this))
        .update(Lightbox.i18n.PrevText).set('title', Lightbox.i18n.PrevTitle).hide();
      this.nextLink = this.E('lightbox-next-link', this.dialog).onClick(this.showNext.bind(this))
        .update(Lightbox.i18n.NextText).set('title', Lightbox.i18n.NextTitle).hide();
      
      return res;
    },
    
    // connecting the left/right arrow buttons
    connectEvents: function() {
      var res = old_event.apply(this, arguments);
      
      document.onKeydown(function(event) {
        if (event.keyCode == 37) { event.stop(); this.showPrev(); }
        if (event.keyCode == 39) { event.stop(); this.showNext(); }
      }.bind(this));
      
      return res;
    },
    
    // tries to show the previous item on the roadtrip
    showPrev: function() {
      if (this.hasPrev() && this.element.visible() && !this.loading) {
        this.show(this.roadLink.roadtrip[this.roadLink.roadtrip.indexOf(this.roadLink) - 1]);
      }
      return this;
    },

    // tries to show the next item on the roadtrip
    showNext: function() {
      if (this.hasNext() && this.element.visible() && !this.loading) {
        this.show(this.roadLink.roadtrip[this.roadLink.roadtrip.indexOf(this.roadLink) + 1]);
      }
      return this;
    },
    
    // checks the roadtrip state and shows/hides the next/prev links
    checkRoadtrip: function() {
      this.prevLink[this.hasPrev() ? 'show' : 'hide']();
      this.nextLink[this.hasNext() ? 'show' : 'hide']();
      return this;
    },

    // checks if there is a previous image link
    hasPrev: function() {
      return this.roadLink && this.roadLink.roadtrip && this.roadLink.roadtrip.first() != this.roadLink;
    },

    // checks if there is a next image link
    hasNext: function() {
      return this.roadLink && this.roadLink.roadtrip && this.roadLink.roadtrip.last() != this.roadLink;
    },
    
    // updates the roadtrip links list
    checkTheRoad: function(link) {
      if (isElement(link)) {
        var rule = this.options.cssRule.split('[').last(),
            value = link.get(rule.split('^=').first()) || '',
            match = value.match(/\[(.+?)\]/);
        
        if (match) {
          var marker = rule.split('^=').last().split(']').first();
          link.roadtrip = $$(this.options.cssRule.replace(marker, "'"+marker+"["+match[1]+"]'"));
        }
      }
      this.roadLink = link;
      
      return this;
    }
  };
})(Lightbox.prototype));

/**
 * The images displaying functionality module
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Lightbox.include((function() {
  var old_show = Lightbox.prototype.show;
  
  return {
    IMAGE_FORMATS: $w('jpg jpeg gif png bmp'),
    
    // hightjacking the links to images and image elements
    show: function(content) {
      // adjusting the element class-name
      this.element[(content && (content.tagName == 'IMG' || this.isImageUrl(content.href))) ?
        'addClass' : 'removeClass']('lightbox-image');
      
      if (content && content.href && this.isImageUrl(content.href)) {
        return this.showingSelf(function() {
          this.checkTheRoad(content).loadLock();
          
          // using the iframed request to make the browser cache work
          var image = new Image();
          image.onload = this.updateImage.bind(this, image, content);
          image.src = content.href;
          
        }.bind(this));
      } else {
        return old_show.apply(this, arguments);
      }
    },
    
  // protected
    
    // inserts the image
    updateImage: function(image, link) {
      this.content.update(image);
      this.checkRoadtrip().setTitle(link.title).resize();
    },
    
    // checks if the given url is an url to an image
    isImageUrl: function(url) {
      return this.IMAGE_FORMATS.include(String(url).toLowerCase().split('?').first().split('.').last());
    }
  };
})());

/**
 * This module handles media-links, like youtube, vimeo etc.
 *
 * Copyright (C) 2010 Nikolay V. Nemshilov
 */
Lightbox.include((function(proto) {
  var old_show = proto.show;
  
  var media_types = {
    swf: [
      'D27CDB6E-AE6D-11cf-96B8-444553540000',
  		'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0',
  		'application/x-shockwave-flash'
    ]
  };
  
  // builds the actual embedded tag
  function build_embedded(addr, type) {
    var sizes = ' width="'+ this.options.mediaWidth + '" height="'+ this.options.mediaHeight + '"';
    
    return '<object classid="clsid:' + media_types[type][0] +
      '" codebase="' + media_types[type][1] + '"'+ sizes + '>' +
      '<param name="src" value="'+addr+'" />'+
      '<embed src="'+ addr +'" type="'+ media_types[type][2]+'"'+ sizes + ' />' +
    '</object>';
  };
  
  // checks and builds an embedded object content if necessary
  function build_media_content(link) {
    if (isElement(link) && link.href) {
      var addr = link.href;
      
      return Lightbox.Medias.map(function(desc) {
        return addr.match(desc[0]) ? build_embedded.call(this, addr.replace(desc[0], desc[1]), desc[2]) : null;
      }, this).compact()[0];
    }
  }
  
return {
  
  // stubbs the show method to hijack the media links
  show: function(link) {
    var media_content = build_media_content.call(this, link);
    
    this.element[media_content ? 'addClass' : 'removeClass']('lightbox-media');
    
    if (media_content) {
      this.content.update(media_content);
      return this.showingSelf(function() {
        this
          .checkTheRoad(link)
          .setTitle(link.title);
          
      }.bind(this));
    }
    
    return old_show.apply(this, arguments);
  }
  
}})(Lightbox.prototype));

/**
 * The class level interface
 *
 * @copyright (C) 2009 Nikolay V. Nemshilov
 */
Lightbox.extend({
  hide: function() {
    this.boxes.each('hide');
  },
  
  show: function() {
    return this.inst('show', arguments);
  },
  
  load: function() {
    return this.inst('load', arguments);
  },

// private

  inst: function(name, args) {
    var inst = new Lightbox();
    return inst[name].apply(inst, args);
  }
});

/**
 * document on-load rescan
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
$(document.documentElement).onClick(function(event) {
  var target = $(event.target);
  var suspects = [target].concat(target.parents());
  
  // we chop off the HTML and BODY element from the end of the list
  var link = suspects.slice(0, suspects.length-2).first('match', Lightbox.Options.cssRule);
  
  if (link) {
    event.stop();
    new Lightbox(eval('('+link.get('data-lightbox-options')+')')).show(link);
  }
});document.write("<style type=\"text/css\">div.lightbox{position:fixed;top:0px;left:0px;width:100%;text-align:center;z-index:9999}div.ligthbox div.right-calendar{z-index:99999}div.lightbox div{line-height:normal}div.lightbox-locker{position:absolute;top:0px;left:0px;width:100%;height:100%;background-color:#000;opacity:0.84;filter:alpha(opacity=84)}div.lightbox-dialog{display:inline-block;*display:inline;*zoom:1;position:relative;text-align:left;padding-bottom:1.6em}div.lightbox-body-wrap{background-color:white;padding:1em;border-radius:.6em;-moz-border-radius:.6em;-webkit-border-radius:.6em}div.lightbox-body{position:relative;height:10em;width:10em;min-height:10em;min-width:10em;overflow:hidden;*background-color:white}div.lightbox-content{position:absolute;*background-color:white}div.lightbox-body-lock{background-color:white;position:absolute;left:0px;top:0px;width:100%;height:100%;text-align:center}div.lightbox-body-lock-spinner{display:none;position:absolute;bottom:0;right:0}div.lightbox-body-lock-spinner div{float:left;width:.5em;height:.9em;background:#AAA;margin-left:.1em;-moz-border-radius:.15em;-webkit-border-radius:.15em}div.lightbox-body-lock-spinner div.glow{background:#666;height:1em;margin-top:-0.05em}div.lightbox-body-lock-loading div.lightbox-body-lock-spinner{display:inline-block;*display:inline;*zoom:1}div.lightbox-body-lock-transparent{background:none}div.lightbox-caption{height:1.2em;margin:0 .7em;margin-bottom:.1em;white-space:nowrap;color:#DDD;font-weight:bold;font-size:1.6em;font-family:Helvetica}div.lightbox-close-button,div.lightbox-prev-link,div.lightbox-next-link{position:absolute;bottom:0;color:#888;cursor:pointer;font-size:150%;font-weight:bold;font-family:Arial}div.lightbox-close-button:hover,div.lightbox-prev-link:hover,div.lightbox-next-link:hover{color:white}div.lightbox-close-button{right:.5em}div.lightbox-prev-link,div.lightbox-next-link{padding:0 .2em;bottom:2px}div.lightbox-prev-link{left:.2em}div.lightbox-next-link{left:2em}div.lightbox-image div.lightbox-body-wrap,div.lightbox-media div.lightbox-body-wrap{padding:0;border:1px solid #777;border-radius:0px;-moz-border-radius:0px;-webkit-border-radius:0px}div.lightbox-image div.lightbox-content img{vertical-align:middle}div.lightbox-image div.lightbox-caption,div.lightbox-media div.lightbox-caption{margin-left:.2em}div.lightbox-image div.lightbox-body-wrap,div.lightbox-image div.lightbox-body-lock,div.lightbox-media div.lightbox-body-wrap,div.lightbox-media div.lightbox-body-lock{background-color:#DDD}div.lightbox-image div.lightbox-body-lock-spinner{bottom:1em;right:1em}div.lightbox-image div.lightbox-close-button{right:.2em}div.lightbox-image div.lightbox-prev-link{left:0}</style>");