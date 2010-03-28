/**
 * The behavior definitions library for RightJS
 *
 * See http://rightjs.org/goods/behave for more details
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */

/**
 * The behavior definition unit
 *
 * Once created will have two methods #start and #stop
 * Once started will be added to all the matching elemnts
 * on the page, and will watch any updates on the page
 * and refresh the behaves automatically
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
var Behavior = new Class({
  extend: {
    /**
     * Class level behavior creator
     *
     * @param String css-selector
     * @param String event name or a hash of events
     * @param Function callback or a method name or a list of callbacks/names
     * @param mixed optional argument
     * ....
     * @return Behavior instance
     */
    add: function() {
      var args = $A(arguments);
      var behavior = new Behavior(args.shift());

      return behavior.on.apply(behavior, args).start();
    },
    
    /**
     * makes a certain behavior stop
     *
     * @param String css-selector
     * @return Behavior stopped behavior or null if there weren't any
     */
    stop: function(rule) {
      var behavior = Behavior.active[rule];
      if (behavior)  behavior.stop();
      
      return behavior;
    },
    
    /**
     * Events handling delegation method
     *
     * USAGE:
     *  ".something".behave('click', Behavior.delegate({
     *    ".foo": function() { return 'foo'; },
     *    ".bar": function() { return 'bar'; }
     *  }));
     *
     * @param Object delegations description
     * @return Object delegated event handlers
     */
    delegate: function(rules) {
      return function(event) {
          var element = $(event.target);
          for (var selector in rules)
            if (element.match(selector))
              return rules[selector].apply(this, arguments);
        }
    },
    
    /**
     * applies all the active behaviors to the page
     *
     * @return void
     */
    refresh: function() {
      for (var key in Behavior.active) {
        Behavior.active[key].refresh();
      }
    },
    
    // a hash of active behaviors
    active:   {}
  },
  
  
  rule: null, // the css rule
  args: null, // the received arguments
  regs: null, // the list of UID of elements that are already processed
  
  /**
   * The basic constructor
   *
   * @param String css-rule
   * @param String event name or a hash of event definitions
   * @return void
   */
  initialize: function() {
    var args = $A(arguments);
    this.rule = args.shift();
    this.on.apply(this, args);
    
    this.regs = [];
  },
  
  /**
   * makes the behavior active
   *
   * @return Behavior self
   */
  start: function() {
    return Behavior.active[this.rule] = this.refresh();
  },
  
  /**
   * Deactivates the behavior
   *
   * @return Behavior self
   */
  stop: function() {
    var args = this.args;
    
    // converting a non-hash args into a hash
    if (!isHash(args[0])) {
      var hash = {};
      hash[args.shift()] = args;
      args = hash;
    } else {
      args = args[0];
    }
    
    // unregistering the listeners
    $$(this.rule).each(function(element) {
      var uid = $uid(element);
      if (this.regs[uid]) {
        for (var key in args) {
          
          // if the definition had some nauty arrays and call-by name definitions
          if (isArray(args[key])) {
            args[key].each(function(option) {
              if (isArray(option)) {
                element.stopObserving.apply(element, [key].concat(options[0]));
              }
            });
            if (!isArray(args[key][0])) {
              element.stopObserving.apply(element, [key].concat(args[key][0]));
            }
          } else {
            element.stopObserving.apply(element, [key].concat(args[key]));
          }
        }
      }
    }, this);
    
    this.regs = [];
    
    delete(Behavior.active[this.rule]);
    
    return this;
  },
  
  /**
   * Checks if the given behavior is active
   *
   * @return boolean check result
   */
  active: function() {
    return Behavior.active[this.rule] === this;
  },
  
// private
  
  /**
   * Defines the behavior options
   *  
   *  Takes all the same type of options as the {Observer#on} method
   *
   * @param String event name or anevents definition hash
   * @param Function callback or method name to call
   * @return Behavior self
   */
  on: function() {
    this.args = $A(arguments);
    return this;
  },
  
  /**
   * refreshes the behavior applying on the page elements
   *
   * @return Behavior self
   */
  refresh: function() {
    $$(this.rule).each(function(element) {
      var uid = $uid(element);
      if (!this.regs[uid]) {
        element.on.apply(element, this.args);
        this.regs[uid] = 1;
      }
    }, this);
    
    return this;
  }
});

document.onReady(Behavior.refresh);
/**
 * The Element unit wrapups for automaticall behaves processing on the page updates
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Element.include((function(old_methods) {
  var old_insert = old_methods.insert;
  var old_update = old_methods.update;
  
return {
  insert: function() {
    old_insert.apply(this, arguments);
    Behavior.refresh();
    
    return this;
  },
  
  update: function(content) {
    old_update.apply(this, arguments);
    if (isString(content)) Behavior.refresh();
    
    return this;
  }
};
  
})(Element.Methods));
/**
 * The bahave library string level shortcuts, mean to create behaviors like that
 *
 * USAGE:
 *   "div#sidebar ul li".behave('click', function() {...});
 *
 *   "div#sidebar ul li".stopBehave('click', function() {...});
 *
 * Copyright (C) 2009-2010 Nikolay V Nemshilov
 */
$ext(String.prototype, {
  /**
   * Starts behavior
   *
   * Takes all the same params as the {Behavior#on} method
   */
  behave: function() {
    return Behavior.add.apply(Behavior, [''+this].concat($A(arguments)));
  },
  
  /**
   * Stops a behavior
   *
   * Takes all the same params as the {Behavior#stop} method
   */
  stopBehave: function() {
    return Behavior.stop.apply(Behavior, [''+this].concat($A(arguments)));
  }
});