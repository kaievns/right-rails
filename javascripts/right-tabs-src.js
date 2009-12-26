/**
 * Unified tabs engine for RightJS (http://rightjs.org/ui/tabs)
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
if (!RightJS) throw "Gimme RightJS";
/**
 * The basic tabs handling engine
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
var Tabs = new Class(Observer, {
  extend: {
    EVENTS: $w('show hide click load disable enable add remove move'),
    
    Options: {
      idPrefix:       '',      // the tab-body elements id prefix
      tabsElement:    null,    // the tabs list element reference, in case it situated somewhere else
      
      resizeFx:       'both',  // 'slide', 'fade', 'both' or null for no fx
      resizeDuration: 400,     // the tab panels resize fx duration
      
      scrollTabs:     false,   // use the tabs list scrolling
      scrollDuration: 400,     // the tabs scrolling fx duration
      
      selected:       null,    // the index of the currently opened tab, by default will check url, cookies or set 0
      disabled:       [],      // list of disabled tab indexes
      
      closable:       false,   // set true if you want a close icon on your tabs
      
      loop:           false,   // put a delay in ms to make it autostart the slideshow loop
      loopPause:      true,    // make the loop get paused when user hovers the tabs with mouse
      
      url:            false,   // a common remote tabs url template, should have the %{id} placeholder
      cache:          false,   // marker if the remote tabs should be cached
      
      Xhr:            null,    // the xhr addtional options
      Cookie:         null     // set the cookie options if you'd like to keep the last selected tab index in cookies
    },
    
    // scans and automatically intializes the tabs
    rescan: function(scope) {
      ($(scope) || document).select('*.right-tabs').each(function(element) {
        if (!element._tabs) {
          new Tabs(element);
        }
      });
    }
  },
  
  /**
   * The basic constructor
   *
   * @param element or id
   * @param Object options
   */
  initialize: function(element, options) {
    this.element = $(element);
    this.$super(options || eval('('+this.element.get('data-tabs-options')+')'));
    
    this.element._tabs = this.init();
  },
  
  /**
   * destructor
   *
   * @return Tabs this
   */
  destroy: function() {
    delete(this.element._tabs);
  },
  
  /**
   * Shows the given tab
   *
   * @param integer tab index or a Tabs.Tab instance
   * @return Tabs this
   */
  show: function(tab) {
    return this.callTab(tab, 'show');
  },
  
  /**
   * Disables the given tab
   *
   * @param integer tab index or a Tabs.Tab instance or a list of them
   * @return Tabs this
   */
  disable: function(tab) {
    return this.callTab(tab, 'disable');
  },
  
  /**
   * Enables the given tab
   *
   * @param integer tab index or a Tabs.Tab instance or a list of them
   * @return Tabs this
   */
  enable: function(tab) {
    return this.callTab(tab, 'enable');
  },
  
// protected
  
  // calls the tab (or tabs) method
  callTab: function(tab, method) {
    if (isArray(tab)) tab.each(this[method], this);
    else if (tab = isNumber(tab) ? this.tabs[tab] : tab) tab[method]();
    return this;
  },
  
  // initializes the tabs unit
  init: function() {
    this.isHarmonica = this.element.tagName == 'DL';
    this.isCarousel  = this.element.hasClass('right-tabs-carousel');
    this.isSimple    = !this.isHarmonica && !this.isCarousel;
    
    this.findTabs();
    
    this.element.addClass('right-tabs');
    if (this.isSimple)
      this.element.addClass('right-tabs-simple');
    
    return this.disable(this.options.disabled);
  },
  
  // finds and interconnects the tabs
  findTabs: function() {
    this.tabsList = this.isHarmonica ? this.element : $(this.options.tabsElement) || this.element.first('UL').addClass('right-tabs-list');
    
    this.tabs = this.tabsList.subNodes(this.isHarmonica ? 'dt' : null).map(function(node) {
      return new Tabs.Tab(node, this);
    }, this);
  },
  
  // searches/builds a panel for the tab
  findPanel: function(tab) {
    var panel_id = this.options.idPrefix + tab.id, panel;
    
    if (this.isHarmonica) {
      var next = tab.element.next();
      panel = (next && next.tagName == 'DD') ? next : $E('DD').insertTo(tab.element, 'after');
    } else {
      panel = $(panel_id) || $E(this.element.tagName == 'UL' ? 'LI' : 'DIV').insertTo(this.element);
    }
      
    return panel.set('id', panel_id);
  }
});

/**
 * A single tab handling object
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
Tabs.Tab = new Class({
  extend: {
    autoId: 0
  },
  
  initialize: function(element, controller) {
    this.element    = element.addClass('right-tabs-tab');
    this.controller = controller;
    
    this.element.onMousedown(this.click.bind(this)).onClick('stopEvent');
    
    this.findLink();
      
    this.panel = new Tabs.Panel(controller.findPanel(this), this);
    
    // adding the 'close' icon onto the tab
    if (controller.options.closable) {
      this.link.insert($E('div', {
        'class': 'right-tabs-tab-close-icon', 'html': '&times;'
      }).onMousedown(this.remove.bind(this)).onClick('stopEvent'));
    }
  },
  
  click: function(event) {
    event.stop();
    return this.fire('click').show();
  },
  
  show: function() {
    if (this.enabled()) {
      var prev_tab = this.controller.tabs.first('current');
      if (prev_tab)  prev_tab.fire('hide');
      
      this.element.radioClass('right-tabs-current');
      this.controller.scrollToTab(this);
      this.panel.show();
      
      this.fire('show');
    }
    
    return this;
  },
  
  disable: function() {
    this.element.addClass('right-tabs-disabled');
    return this.fire('disable');
  },
  
  enable: function() {
    this.element.removeClass('right-tabs-disabled');
    return this.fire('enable');
  },
  
  disabled: function() {
    return !this.enabled();
  },
  
  enabled: function() {
    return !this.element.hasClass('right-tabs-disabled');
  },
  
  current: function() {
    return this.element.hasClass('right-tabs-current');
  },
  
  remove: function(event) {
    if (event) event.stop();
    
    // switching to the next available sibling
    if (this.current()) {
      var enabled = this.controller.tabs.filter('enabled');
      var sibling = enabled[enabled.indexOf(this) + 1] || enabled[enabled.indexOf(this)-1];
      
      if (sibling) {
        sibling.show();
      }
    }
    
    // removing the tab out of the list
    this.controller.tabs.splice(this.controller.tabs.indexOf(this), 1);
    this.element.remove();
    this.panel.remove();
    
    return this;
  },
  
// protected
  // returns the tab width, used for the scrolling calculations
  width: function() {
    return this.element.offsetWidth + this.element.getStyle('marginRight').toInt();
  },

  // the events firing wrapper
  fire: function(event) {
    this.controller.fire(event, this);
    return this;
  },
  
  // generates the automaticall id for the tab
  findLink: function() {
    this.link = this.element.first('a');
    this.id = this.link.href.split('#')[1] || (this.controller.options.idPrefix + (Tabs.Tab.autoId++));
  }
});

/**
 * The tab panels behavior logic
 *
 * Copyright (C) Nikolay V. Nemshilov aka St.
 */
Tabs.Panel = new Class(Observer, {
  
  initialize: function(element, tab) {
    this.tab     = tab;
    this.id      = element.id;
    this.element = element.addClass('right-tabs-panel');
  },
  
  // shows the panel
  show: function() {
    return this.resizing(function() {
      this.element.radioClass('right-tabs-panel-current');
    });
  },
  
  // updates the panel content
  update: function(content) {
    return this.resizing(function() {
      this.element.update(content||'');
    });
  },
  
  // removes the pannel
  remove: function() {
    this.element.remove();
    return this;
  },
  
  // locks the panel with a spinner locker
  lock: function() {
    var locker  = $E('div', {'class': 'right-tabs-panel-locker'});
    var spinner = $E('div', {'class': 'right-tabs-panel-locker-spinner'}).insertTo(locker);
    var dots    = '1234'.split('').map(function(i) {
      return $E('div', {'class': i == 1 ? 'glow':null}).insertTo(spinner);
    });
    
    (function() {
      spinner.insert(dots.last(), 'top');
      dots.unshift(dots.pop());
    }).periodical(400);
    
    this.element.insert(locker, 'top');
  },
  
// protected
  
  resizing: function(callback) {
    if (Tabs.__working) return this.resizing.bind(this, callback).delay(20);
    
    var controller = this.tab.controller;
    var options    = controller.options;
    var prev_panel = controller.element.subNodes().first('hasClass', 'right-tabs-panel-current');
    var this_panel = this.element;
    var swapping   = prev_panel != this_panel;
    var loading    = this.element.first('div.right-tabs-panel-locker');
    
    if (options.resizeFx && self.Fx && prev_panel && (swapping || loading)) {
      Tabs.__working = true;
      
      // calculating the visual effects durations
      var fx_name  = (options.resizeFx == 'both' && loading) ? 'slide' : options.resizeFx;
      var duration = options.resizeDuration; duration = Fx.Durations[duration] || duration;
      var resize_duration = fx_name == 'fade' ? 0 : fx_name == 'slide' ? duration : duration / 2;
      var fade_duration   = duration - resize_duration;
      
      if (fx_name != 'slide')
        this_panel.setStyle({opacity: 0});
      
      // saving the previous sizes
      var prev_panel_height = (controller.isHarmonica && swapping) ? 0 : prev_panel.offsetHeight;
      
      // applying the changes
      callback.call(this);
      
      // getting the new size
      var new_panel_height  = this_panel.offsetHeight;
      
      if (fx_name != 'fade' && prev_panel_height != new_panel_height) {
        // preserving the whole element size so it didn't jump when we are tossing the tabs around
        controller.element.style.height = controller.element.offsetHeight + 'px';
        
        // wrapping the element with an overflowed element to visualize the resize
        var fx_wrapper = $E('div', {'class': 'right-tabs-resizer'});
        var set_back = fx_wrapper.replace.bind(fx_wrapper, this_panel);
        this_panel.wrap(fx_wrapper);
        fx_wrapper.setHeight(prev_panel_height);
        
        // in case of harmonica nicely hidding the previous panel
        if (controller.isHarmonica && swapping) {
          prev_panel.addClass('right-tabs-panel-current');
          var hide_wrapper = $E('div', {'class': 'right-tabs-resizer'}).setHeight(prev_panel.offsetHeight);
          var prev_back = function() {
            hide_wrapper.replace(prev_panel.removeClass('right-tabs-panel-current'));
          };
          prev_panel.wrap(hide_wrapper);
        }
        
        // getting back the auto-size so we could resize it
        controller.element.style.height = 'auto';
        
        if (hide_wrapper) hide_wrapper.morph({height: '0px'}, {duration: resize_duration, onFinish: prev_back});
        fx_wrapper.morph({height: new_panel_height + 'px'}, {duration: resize_duration, onFinish: set_back });
      } else {
        // removing the resize duration out of the equasion
        rezise_duration = 0;
        duration = fade_duration;
      }
      
      if (fx_name != 'slide')
        this_panel.morph.bind(this_panel, {opacity: 1}, {duration: fade_duration}).delay(resize_duration);
      
      // removing the working marker
      (function() { Tabs.__working = false; }).bind(this).delay(duration);
    } else {
      callback.call(this);
    }
    
    return this;
  }
  
});

/**
 * Contains the tabs scrolling functionality
 *
 * NOTE: different types of tabs have different scrolling behavior
 *       simple tabs just scroll the tabs line without actually picking
 *       any tab. But the carousel tabs scrolls to the next/previous
 *       tabs on the list.
 *
 * Copyright (C) Nikolay V. Nemshilov aka St.
 */
Tabs.include((function() {
  var old_init = Tabs.prototype.init;
  
return {
  
  /**
   * Shows the next tab
   *
   * @return Tabs this
   */
  next: function() {
    return this.pickTab(+1);
  },

  /**
   * Shows the preveious tab
   *
   * @return Tabs this
   */
  prev: function() {
    return this.pickTab(-1);
  },

  /**
   * Scrolls the tabs to the left
   *
   * @return Tabs this
   */
  scrollLeft: function() {
    return this[this.isCarousel ? 'prev' : 'justScroll'](+0.6);
  },

  /**
   * Scrolls the tabs to the right
   *
   * @return Tabs this
   */
  scrollRight: function() {
    return this[this.isCarousel ? 'next' : 'justScroll'](-0.6);
  },

// protected

  // overloading the init script to add the scrollbar support
  init: function() {
    old_init.call(this);

    if (this.scrollable = (this.options.scrollTabs || this.isCarousel)) {
      this.buildScroller();
    }

    return this;
  },

  // builds the tabs scroller block
  buildScroller: function() {
    if (!this.element.first('right-tabs-scroller')) {
      this.prevButton = $E('div', {'class': 'right-tabs-scroll-left',  'html': '&laquo;'}).onClick(this.scrollLeft.bind(this));
      this.nextButton = $E('div', {'class': 'right-tabs-scroll-right', 'html': '&raquo;'}).onClick(this.scrollRight.bind(this));
      
      this.element.insert($E('div', {'class': 'right-tabs-scroller'}).insert([
        this.prevButton, this.nextButton, $E('div', {'class': 'right-tabs-scroll-body'}).insert(this.tabsList)
      ]), 'top');
    }
  },

  // picks the next/prev non-disabled available tab
  pickTab: function(pos) {
    var current = this.tabs.first('current');
    if (current && current.enabled()) {
      var enabled_tabs = this.tabs.filter('enabled');
      var tab = enabled_tabs[enabled_tabs.indexOf(current) + pos];
      if (tab) tab.show();
    }
  },
  
  // scrolls the tabs line to make the tab visible
  scrollToTab: function(tab) {
    if (this.scrollable) {
      // calculating the previous tabs widths
      var tabs_width      = 0;
      for (var i=0; i < this.tabs.length; i++) {
        tabs_width += this.tabs[i].width();
        if (this.tabs[i] == tab) break;
      }
      
      // calculating the scroll (the carousel tabs should be centralized)
      var available_width = this.tabsList.parentNode.offsetWidth;
      var scroll = (this.isCarousel ? (available_width/2 + tab.width()/2) : available_width) - tabs_width;
      
      // check if the tab doesn't need to be scrolled
      if (!this.isCarousel) {
        var current_scroll  = this.tabsList.getStyle('left').toInt() || 0;
        
        if (scroll >= current_scroll && scroll < (current_scroll + available_width - tab.width()))
          scroll = current_scroll;
        else if (current_scroll > -tabs_width && current_scroll <= (tab.width() - tabs_width))
          scroll = tab.width() - tabs_width;
      }
      
      this.scrollTo(scroll);
    }
  },
  
  // just scrolls the scrollable area onto the given number of scrollable area widths
  justScroll: function(size) {
    var current_scroll  = this.tabsList.getStyle('left').toInt() || 0;
    var available_width = this.tabsList.parentNode.offsetWidth;
    
    this.scrollTo(current_scroll + available_width * size);
  },
  
  // scrolls the tabs list to the position
  scrollTo: function(scroll) {
    // checking the constraints
    var current_scroll  = this.tabsList.getStyle('left').toInt() || 0;
    var available_width = this.tabsList.parentNode.offsetWidth;
    var overall_width   = 0;
    for (var i=0; i < this.tabs.length; i++) {
      overall_width += this.tabs[i].width();
    }
    
    if (scroll < (available_width - overall_width))
      scroll = available_width - overall_width;
    if (scroll > 0) scroll = 0;
    
    // applying the scroll
    var style = {left: scroll + 'px'};
    
    if (this.options.scrollDuration && self.Fx && current_scroll != scroll) {
      this.tabsList.morph(style, {duration: this.options.scrollDuration});
    } else {
      this.tabsList.setStyle(style);
    }
    
    this.checkScrollButtons(overall_width, available_width, scroll);
  },
  
  // checks the scroll buttons
  checkScrollButtons: function(overall_width, available_width, scroll) {
    var has_prev = has_next = false;
    
    if (this.isCarousel) {
      var enabled = this.tabs.filter('enabled');
      var current = enabled.first('current');
      
      if (current) {
        var index = enabled.indexOf(current);
        
        has_prev = index > 0;
        has_next = index < enabled.length - 1;
      }
    } else {
      has_prev = scroll != 0;
      has_next = scroll > (available_width - overall_width);
    }
    
    this.prevButton[has_prev ? 'removeClass' : 'addClass']('right-tabs-scroll-disabled');
    this.nextButton[has_next ? 'removeClass' : 'addClass']('right-tabs-scroll-disabled');
  }
  
}})());

/**
 * This module handles the current tab state saving/restoring processes
 *
 * Copyright (C) Nikolay V. Nemshilov aka St.
 */
Tabs.include((function() {
  var old_initialize = Tabs.prototype.initialize;
  
  var get_cookie_indexes = function() {
    return self.Cookie ? (Cookie.get('right-tabs-indexes') || '').split(',') : [];
  };
  
  var save_tab_in_cookies = function(options, tabs, tab) {
    if (self.Cookie) {
      var indexes = get_cookie_indexes();
      indexes = indexes.without.apply(indexes, tabs.map('id'));
      indexes.push(tab.id);
      Cookie.set('right-tabs-indexes', indexes.uniq().join(','), options);
    }
  };

return {
  
  // overloading the constructor to catch up the current tab properly
  initialize: function() {
    old_initialize.apply(this, arguments);
    
    this.findCurrent();
    
    // initializing the cookies storage if set
    if (this.options.Cookie)
      this.onShow(save_tab_in_cookies.curry(this.options.Cookie, this.tabs));
  },
  
  
// protected
  
  // searches and activates the current tab
  findCurrent: function() {
    var current;
    if (this.options.selected !== null)
      current = this.options.selected;
    else {
      var enabled = this.tabs.filter('enabled');
      current = enabled[this.urlIndex()] || enabled[this.cookieIndex()] || enabled.first('current') || enabled[0];
    }
    if (current) current.show();
  },
  
  // tries to find the current tab index in the url hash
  urlIndex: function() {
    var index = -1, id = document.location.href.split('#')[1];
    
    if (id) {
      for (var i=0; i < this.tabs.length; i++) {
        if (this.tabs[i].id == id) {
          index = i;
          break;
        }
      }
    }
    
    return index;
  },
  
  // tries to find the current tab index in the cookies storage
  cookieIndex: function() {
    var index = -1;
    
    if (this.options.Cookie) {
      var indexes = get_cookie_indexes();
      for (var i=0; i < this.tabs.length; i++) {
        if (indexes.include(this.tabs[i].id)) {
          index = i;
          break;
        }
      }
    }
    
    return index;
  }
  
}})());

/**
 * This module handles the tabs cration and removing processes   
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
Tabs.include({
  /**
   * Creates a new tab
   *
   * USAGE:
   *   With the #add method you have to specify the tab title
   *   optional content (possibly empty or null) and some options
   *   The options might have the following keys
   *
   *     * id - the tab/panel id (will use the idPrefix option for the panels)
   *     * url - a remote tab content address
   *     * position - an integer position of the tab in the stack
   *
   * @param String title
   * @param mixed content
   * @param Object options
   * @return Tabs this
   */
  add: function(title, content, options) {
    var options = options || {};
    
    // creating the new tab element
    var element = $E(this.isHarmonica ? 'dt' : 'li').insert(
      $E('a', {html: title, href: options.url || '#'+(options.id||'')}
    )).insertTo(this.tabsList);
    
    // creating the actual tab instance
    var tab = new Tabs.Tab(element, this);
    tab.panel.element.update(content||'');
    this.tabs.push(tab);
    
    // moving the tab in place if asked
    if (defined(options.position)) this.move(tab, options.position);
    
    return this.fire('add', tab);
  },
  
  /**
   * Moves the given tab to the given position
   *
   * NOTE if the position is not within the tabs range then it will do nothing
   *
   * @param mixed tab index or a tab instance
   * @param Integer position
   * @return Tabs this
   */
  move: function(tab, position) {
    var tab = this.tabs[tab] || tab;
    
    if (this.tabs[position] && this.tabs[position] !== tab) {
      // moving the tab element
      this.tabs[position].element.insert(tab.element, (position == this.tabs.length-1) ? 'after' : 'before');
      if (this.isHarmonica) tab.element.insert(tab.panel.element, 'after');
      
      // moving the tab in the registry
      this.tabs.splice(this.tabs.indexOf(tab), 1);
      this.tabs.splice(position, 0, tab);
      
      this.fire('move', tab, position);
    }
    
    return this;
  },
  
  /**
   * Removes the given tab
   *
   * @param integer tab index or a Tabs.Tab instance or a list of them
   * @return Tabs this
   */
  remove: function(tab) {
    return this.callTab(tab, 'remove');
  }
  
});

/**
 * This module contains the remote tabs loading logic
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
Tabs.Tab.include((function() {
  var old_show = Tabs.Tab.prototype.show;
  
return {
  
  // wrapping the show mehtod, to catch the remote requests
  show: function() {
    var result  = old_show.apply(this, arguments);
    var url     = this.link.href;
    var options = this.controller.options;
    
    // building the url
    if (url.includes('#')) 
      url = options.url ? options.url.replace('%{id}', url.split('#')[1]) : null;
    
    // if there is an actual url and no ongoing request or a cache, starting the request
    if (url && !this.request && !(options.cache || this.cache)) {
      this.panel.lock();
      
      try { // basically that's for the development tests, so the IE browsers didn't get screwed on the test page
        
        this.request = Xhr.load(url, options.Xhr).onComplete(function(response) {
          this.panel.update(response.text);

          this.request = null; // removing the request marker so it could be rerun
          if (options.cache) this.cache = true;

          this.fire('load');
        }.bind(this));
        
      } catch(e) { if (!Browser.OLD) throw(e) }
    }
    
    return result;
  }
  
}})());

/**
 * This module handles the slide-show loop feature for the Tabs
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
Tabs.include((function() {
  var old_initialize = Tabs.prototype.initialize;
  
return {
  /**
   * Overloading the constructor to start the slideshow loop automatically
   *
   */
  initialize: function() {
    old_initialize.apply(this, arguments);
    
    if (this.options.loop) {
      this.startLoop();
    }
  },
  
  /**
   * Starts the slideshow loop
   *
   * @param Number optional delay in ms
   * @return Tabs this
   */
  startLoop: function(delay) {
    if (isNumber(delay)) this.options.loop = delay;
    
    // attaching the loop pause feature
    if (this.options.loopPause) {
      this._stopLoop  = this._stopLoop  || this.stopLoop.bind(this);
      this._startLoop = this._startLoop || this.startLoop.bind(this);
      
      this.element
        .stopObserving('mouseover', this._stopLoop)
        .stopObserving('mouseout', this._startLoop)
        .on({
          mouseover: this._stopLoop,
          mouseout:  this._startLoop
        });
    }
    
    if (this.timer) this.timer.stop();
    
    this.timer = function() {
      var enabled = this.tabs.filter('enabled');
      var current = this.tabs.first('current');
      var next    = enabled[enabled.indexOf(current)+1];
      
      this.show(next || enabled.first());
      
    }.bind(this).periodical(this.options.loop);
    
    return this;
  },
  
  /**
   * Stops the slideshow loop
   *
   * @return Tabs this
   */
  stopLoop: function() {
    if (this.timer) {
      this.timer.stop();
      this.timer = null;
    }
  }
  
}})());

/**
 * The document level hooks for the tabs-egnine
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
document.onReady(function() {
  Tabs.rescan();
});

document.write("<style type=\"text/css\">.right-tabs,.right-tabs .right-tabs-list,.right-tabs .right-tabs-tab,.right-tabs .right-tabs-panel,.right-tabs-scroll-left,.right-tabs-scroll-right,.right-tabs-scroll-body,.right-tabs-panel-locker,.right-tabs-resizer{margin:0;padding:0;background:none;border:none;list-style:none;display:block;width:auto;height:auto}.right-tabs{border-bottom:1px solid #CCC}.right-tabs-resizer{overflow:hidden}.right-tabs-tab,.right-tabs-tab a{display:block;float:left}.right-tabs-tab a{position:relative;cursor:pointer;text-decoration:none;border:1px solid #CCC;background:#DDD;color:#444;-moz-border-radius:.3em;-webkit-border-radius:.3em}.right-tabs-tab a:hover{border-color:#CCC;background:#EEE}.right-tabs .right-tabs-list .right-tabs-current a,dl.right-tabs dt.right-tabs-current a{font-weight:bold;color:#000;background:#FFF}.right-tabs-tab a img{border:none;opacity:.6;filter:alpha(opacity=60)}.right-tabs-tab a:hover img,.right-tabs .right-tabs-list .right-tabs-current a img{opacity:1;filter:alpha(opacity=100)}.right-tabs-disabled,.right-tabs-disabled a,.right-tabs-disabled a:hover{background:#EEE;border-color:#DDD;color:#AAA;cursor:default}.right-tabs-disabled a img,.right-tabs-disabled a:hover img{opacity:.5;filter:alpha(opacity=50)}.right-tabs-tab-close-icon{display:inline-block;*display:inline;*zoom:1;margin-right:-0.5em;margin-left:0.5em;cursor:pointer;opacity:0.5;filter:alpha(opacity=50)}.right-tabs-tab-close-icon:hover{opacity:1;filter:alpha(opacity=100);color:#B00;text-shadow:#888 .15em .15em .2em}.right-tabs .right-tabs-panel{display:none;position:relative;min-height:4em;padding:.5em 0}.right-tabs .right-tabs-panel-current{display:block}.right-tabs-panel-locker{position:absolute;top:0px;left:0px;opacity:0.5;filter:alpha(opacity=50);background:#CCC;width:100%;height:100%;text-align:center;line-height:100%}.right-tabs-panel-locker-spinner{position:absolute;left:44%;top:44%}.right-tabs-panel-locker-spinner div{float:left;background:#777;width:.5em;height:1em;margin-right:.1em;-moz-border-radius:.1em;-webkit-border-radius:.1em}.right-tabs-panel-locker-spinner div.glow{background:#444;height:1.2em;margin-top:-0.1em}.right-tabs .right-tabs-scroller{padding:0 1.4em;position:relative;margin-bottom:.5em}.right-tabs .right-tabs-scroller .right-tabs-scroll-left,.right-tabs .right-tabs-scroller .right-tabs-scroll-right{width:1.1em;text-align:center;background:#EEE;color:#666;cursor:pointer;border:1px solid #CCC;-moz-border-radius:.2em;-webkit-border-radius:.2em;position:absolute;top:0px;left:0px;z-index:100}.right-tabs .right-tabs-scroller .right-tabs-scroll-left:hover,.right-tabs .right-tabs-scroller .right-tabs-scroll-right:hover{color:#000;background:#DDD;border-color:#AAA}.right-tabs .right-tabs-scroller .right-tabs-scroll-right{left:auto;right:0px}.right-tabs .right-tabs-scroller .right-tabs-scroll-disabled,.right-tabs .right-tabs-scroller .right-tabs-scroll-disabled:hover{cursor:default;background:#DDD;border-color:#DDD;color:#AAA}.right-tabs .right-tabs-scroller .right-tabs-scroll-body{width:100%;overflow:hidden;position:relative;z-index:50}.right-tabs .right-tabs-scroller .right-tabs-list{position:relative;width:999em;margin:0}.right-tabs-simple .right-tabs-list{height:2em;padding:0 1em;border-bottom:1px solid #CCC}.right-tabs-simple .right-tabs-tab{margin-top:-1px;margin-right:1px}.right-tabs-simple .right-tabs-tab a{line-height:1.8em;margin-top:.2em;padding:0 1em;border-bottom:none;-moz-border-radius-bottomleft:0;-moz-border-radius-bottomright:0;-webkit-border-bottom-left-radius:0;-webkit-border-bottom-right-radius:0}.right-tabs-simple .right-tabs-list .right-tabs-current a{line-height:2em;margin-top:1px}.right-tabs-simple .right-tabs-scroller{border-bottom:1px solid #CCC}.right-tabs-simple .right-tabs-scroller .right-tabs-scroll-left,.right-tabs-simple .right-tabs-scroller .right-tabs-scroll-right{line-height:1.8em;top:.2em;-moz-border-radius-bottomleft:0;-moz-border-radius-bottomright:0;-webkit-border-bottom-left-radius:0;-webkit-border-bottom-right-radius:0}.right-tabs-simple .right-tabs-scroller .right-tabs-scroll-body{position:relative;top:1px}.right-tabs-simple .right-tabs-scroller .right-tabs-scroll-body .right-tabs-list{padding:0}.right-tabs-carousel .right-tabs-list,.right-tabs-carousel .right-tabs-tab a,.right-tabs-carousel .right-tabs-scroller .right-tabs-scroll-left,.right-tabs-carousel .right-tabs-scroller .right-tabs-scroll-right{height:6em;line-height:6em}.right-tabs-carousel .right-tabs-tab{margin-right:2px}.right-tabs-carousel .right-tabs-tab a img{border:1px solid #CCC;margin:.4em;padding:0}dl.right-tabs{overflow:none;border:none}dt.right-tabs-tab,dt.right-tabs-tab a{display:block;float:none}dt.right-tabs-tab a{padding:.2em 1em}dl.right-tabs dt.right-tabs-current a{background:#EEE;-moz-border-radius-bottomleft:0;-moz-border-radius-bottomright:0;-webkit-border-bottom-left-radius:0;-webkit-border-bottom-right-radius:0}</style>");