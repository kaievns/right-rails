/**
 * jQuery-like '$' function behavior for RightJS
 * http://rightjs.org/plugins/jquerysh
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
$=function(a){switch(typeof a){case "string":var c=a[0],b=a.substr(1);a=c==="#"&&/^[\w\-]+$/.test(b)?RightJS.$(b):RightJS.$$(a);break;case "function":RightJS.$(document).onReady(a);break;default:a=RightJS.$(a);break}return a};
