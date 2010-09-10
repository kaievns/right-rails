/**
 * jQuery-like '$' function behavior for RightJS
 * http://rightjs.org/plugins/jquerysh
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
/**
 * jQuery-like '$' function behavior
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */

/**
 * jquerysh initialization script
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */


$ = function(something) {
  switch(typeof something) {
    case 'string':
        var hash = something[0], id = something.substr(1);
        something = (hash === '#' && (/^[\w\-]+$/).test(id)) ?
          RightJS.$(id) : RightJS.$$(something);
      break;
      
    case 'function':
      RightJS.$(document).onReady(something);
      break;
    
    default:
      something = RightJS.$(something);
      break;
  }
  
  return something;
}; 