/**
 * The native tooltips feature for RightJS
 *
 * See http://rightjs.org/ui/tooltips for more details
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
if (!RightJS) throw "Gimme RightJS!";

/**
 * The native tooltips feature for RithJS
 *
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */

var Tooltip = new Class({
  include: Options,
  
  extend: {
    Options: {
      checkTags:  '*', // tags that should be checked on-load
      relName:    'tooltip',
      idSuffix:   '-tooltip',
      fxName:     'fade',
      fxDuration: 400,
      delay:      400  // the appearance delay
    },
    
    current: null, // currently active tooltip reference
    
    // scans the page for auto-discoverable tooltiped elements
    rescan: function(scope) {
      var key = Tooltip.Options.relName;
      ($(scope) || document).select(Tooltip.Options.checkTags+'[rel='+key+']').each(function(element) {
        var text = element.get('title') || element.get('alt');
        if (text) {
          var data = element.get('data-'+key+'-options');
          new Tooltip(element, eval('('+data+')'));
        }
      });
    }
  },
  
  initialize: function(element, options) {
    this.element   = $E('div', {'class': 'right-tooltip'}).insertTo(document.body).hide();
    this.container = $E('div', {'class': 'right-tooltip-container'}).insertTo(this.element);
    
    this.setOptions(options).assignTo(element);
  },
  
  setText: function(text) {
    this.container.update(text);
    return this;
  },
  
  getText: function() {
    return this.container.innerHTML;
  },
  
  hide: function() {
    Tooltip.current = null;
    this.cancelTimer();
    this.element.hide(this.options.fxName, {duration: this.options.fxDuration});
    
    return this;
  },
  
  show: function() {
    Tooltip.current = this;
    this.element.show(this.options.fxName, {duration: this.options.fxDuration});

    return this;
  },
  
  showDelayed: function() {
    Tooltip.current = this;
    this.timer = this.show.bind(this).delay(this.options.delay);
  },
  
  cancelTimer: function() {
    if (this.timer) {
      this.timer.cancel(); 
      this.timer = null;
    }
  },
  
  moveTo: function(event) {
    this.element.style.left = event.pageX + 'px';
    this.element.style.top  = event.pageY + 'px';
    
    return this;
  },
  
  assignTo: function(element) {
    this.setText(element.get('title') || element.get('alt'));
    
    // removing the element native title and alt
    element.setAttribute('title', '');
    element.setAttribute('alt', '');
    
    element.on({
      mouseover: this.showDelayed.bind(this),
      mouseout:  this.hide.bind(this)
    });
    
    if (element.id) this.element.id = element.id + this.options.idSuffix;
    
    this.associate = element;
    
    return this;
  }
});

/**
 * The post load tooltips initialization script
 *
 * Copyright (C) 2009 Nikolay V. Nemshilov aka St.
 */
document.on({
  ready: function() { Tooltip.rescan(); },
  
  mousemove: function(event) {
    if (Tooltip.current) {
      Tooltip.current.moveTo(event);
    }
  }
});

document.write("<style type=\"text/css\">div.right-tooltip{position:absolute;margin-top:16pt;margin-left:2pt;border:1px solid #DDD;background-color:#FFF8EE;color:#666;font-size:80%;cursor:default;border-radius:.4em;-moz-border-radius:.4em;-webkit-border-radius:.4em;box-shadow:.4em .4em .4em #AAA;-moz-box-shadow:.4em .4em .4em #AAA;-webkit-box-shadow:.4em .4em .4em #AAA}div.right-tooltip-container{margin:.6em;border-left:2px solid brown;padding-left:.5em}</style>");