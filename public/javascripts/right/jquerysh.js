/**
 * jQuery-like '$' function behavior for RightJS
 * http://rightjs.org/plugins/jquerysh
 *
 * Copyright (C) 2010-2011 Nikolay Nemshilov
 */
$=function(a){switch(typeof a){case"string":var b=a[0],c=a.substr(1);a=b==="#"&&/^[\w\-]+$/.test(c)?RightJS.$(c):RightJS.$$(a);break;case"function":RightJS.$(document).onReady(a);break;default:a=RightJS.$(a)}return a}