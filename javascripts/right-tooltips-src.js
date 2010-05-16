/**
 * The native tooltips feature for RightJS
 *
 * See http://rightjs.org/ui/tooltips for more details
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
if (!RightJS) throw "Gimme RightJS!";
/**
 * The native tooltips feature for RithJS
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
var Tooltip = new Class({
  include: Options,
  
  extend: {
    Options: {
      cssRule:    '[rel=tooltip]',  // a css-marker of an element with a tooltip
      
      fxName:     'fade',           // the appearance effect name
      fxDuration: 400,              // the appearance effect duration
      delay:      400,              // the appearance delay
      
      move:       true,             // if it should be moved with the mouse
      
      idSuffix:   '-tooltip'        // ID prefix for tooltips with ID
    },
    
    current: null, // currently active tooltip reference
    instances: [], // keeps the list of instances
    
    // tries to find a tip closest to the event
    find: function(event) {
      var target  = event.target, targets = [target].concat(target.parents()),
          targets = targets.slice(0, targets.length - 2),
          element = targets.first(function(node) {
            return node._tooltip || node.match(Tooltip.Options.cssRule);
          });
      
      if (element) {
        var uid = $uid(element);
        return Tooltip.instances[uid] = Tooltip.instances[uid] || new Tooltip(element);
      }
    },
    
    // DEPRECATED a dummy method for the old API backward compatibility
    rescan: function(scope) { }
  },
  
  /**
   * Constructor
   *
   * @param Element associated element
   * @param Object options
   */
  initialize: function(element, options) {
    this.associate = element = $(element);
    this.element   = $E('div', {
      'class': 'right-tooltip',
      'html':  '<div class="right-tooltip-arrow"></div>'+
        '<div class="right-tooltip-container">'+
          (element.get('title') || element.get('alt'))+
        '</div>'
    }).insertTo(document.body);
    
    this.setOptions(options || eval('('+element.get('data-tooltips-options')+')'));
    
    element.set({ title: '', alt: ''});
    
    if (element.id)
      this.element.id = element.id + this.options.idSuffix;
    
    // prevents the false hidding when the mouse gets over the tooltip
    this.element
      .onMouseout('stopEvent')
      .onMouseover(function(event) {
        event.stop();
        this.cancelTimer();
      }.bind(this));
  },
  
  /**
   * Hides the tooltip
   *
   * @return Tooltip this
   */
  hide: function() {
    this.cancelTimer();
    
    this.timer = (function() {
      this.element.hide(this.options.fxName, {
        duration: this.options.fxDuration,
        onFinish: function() {
          if (Tooltip.current === this)
            Tooltip.current = null;
        }.bind(this)
      });
    }).bind(this).delay(100);
    
    return this;
  },
  
  /**
   * Shows the tooltip with a dealy
   *
   * @param Boolean if true will show tooltip immediately
   * @return Tooltip this
   */
  show: function(immediately) {
    // hidding all the others
    Tooltip.instances.each(function(tip) {
      if (tip && tip !== this) tip.hide();
    }, this);
    
    // show the tooltip with a delay
    this.timer = (function() {
      this.element.stop().show(this.options.fxName, {duration: this.options.fxDuration});
      
      Tooltip.current = this;
    }).bind(this).delay(this.options.delay);
    
    return Tooltip.current = this;
  },
  
  /**
   * Moves the tooltip where the event happened
   *
   * @return Tooltip this
   */
  moveTo: function(event) {
    this.element.style.left = event.pageX + 'px';
    this.element.style.top  = event.pageY + 'px';
    
    return this;
  },
  
// protected
  
  // cancels a show timeout
  cancelTimer: function() {
    if (this.timer) {
      this.timer.cancel(); 
      this.timer = null;
    }
  }
});

/**
 * The post load tooltips initialization script
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
document.on({
  /**
   * Watches all the mouse-over events and reacts if one of the targets
   * matches a tooltip
   *
   * @param Event event
   */
  mouseover: function(event) {
    var prev_tip = Tooltip.current, this_tip = Tooltip.find(event);
    
    if (this_tip) {
      if (prev_tip && prev_tip !== this_tip) prev_tip.hide();
      if (this_tip.element.hidden()) this_tip.show();
      
      this_tip.moveTo(event);
    }
  },
  
  /**
   * Catches the mouseout events and hides tooltips when needed
   *
   * @param Event event
   */
  mouseout: function(event) {
    var curr_tip = Tooltip.current, this_tip = Tooltip.find(event);
    
    if (curr_tip && (!this_tip || this_tip === curr_tip))
      curr_tip.hide();
  },
  
  /**
   * Moves tooltips when active
   *
   * @param Event event
   */
  mousemove: function(event) {
    var tip = Tooltip.current;
    if (tip && tip.options.move) {
      tip.moveTo(event);
    }
  }
});document.write("<style type=\"text/css\">div.right-tooltip{display:none;position:absolute;z-index:999999;font-size:90%;margin-top:16pt;margin-left:5pt;color:#FFF;text-shadow:0 0 .2em #000;border:.3em solid rgba(255,255,255,0.2);background-color:rgba(25,25,25,0.92);*background-color:#000;*border:.3em solid #444;background-image:-webkit-gradient(linear,0% 0%,0% 100%,from(transparent),to(#000));border-radius:.4em;-moz-border-radius:.4em;-webkit-border-radius:.4em;box-shadow:0 0 .4em #555;-moz-box-shadow:0 0 .4em #555;-webkit-box-shadow:0 0 .4em #555}div.right-tooltip-container{margin:.4em .6em}</style>");