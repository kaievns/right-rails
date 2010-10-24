/**
 * Tables specific dom-wrapper
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
var Table=RightJS.Table=function(e){var m=e.$,h=e.$E,n=e.isHash,o=e.isElement,p=e.Object,i=e.Element,k=i.Wrappers.TABLE=new e.Class(i,{extend:{Options:{ascMarker:"&#x25BC;",descMarker:"&#x25B2;",algorithm:"text",order:"asc"}},initialize:function(a){var c=a=a||{};if(n(a)&&!o(a))c="table";this.$super(c,a);this.options=p.merge(k.Options,eval("("+this.get("data-table")+")"))},sort:function(a,c,f){var g=a instanceof i?a:this.header().last().children("th")[a];if(!g)return this;a=g.parent().children("th").indexOf(g);
c=c||(this.marker&&this.marker.parent()===g?this.marker.asc?"desc":"asc":null);f=f||(g.hasClass("numeric")?"numeric":null);c=c||this.options.order;f=f||this.options.algorithm;var j=this.rows().map(function(d){var b=d.children("td")[a];b=b?b.text():"";if(f==="numeric")b=e(b).toFloat();return{row:d,text:b}}),l=j[0]?h("tr").insertTo(j[0].row,"before"):h("tr").insertTo(this.first("tbody")||this);if(typeof f!=="function")f=c==="asc"?function(d,b){return d.text>b.text?1:d.text<b.text?-1:0}:function(d,b){return d.text>
b.text?-1:d.text<b.text?1:0};j.sort(f).reverse().each(function(d){l.insert(d.row,"after")});l.remove();this.marker=(this.marker||g.first("span.sort-marker")||h("span",{"class":"sort-marker"})).update(this.options[c==="asc"?"ascMarker":"descMarker"]).insertTo(g,"bottom");this.marker.asc=c==="asc";return this},rows:function(){return this.find("tr").reject(function(a){return a.first("th")||a.parent("tfoot")})},header:function(){return this.find("tr").filter("first","th")},footer:function(){return this.find("tfoot > tr")}});
m(document).onClick(function(a){(a=a.find("th.sortable"))&&a.parent("table").sort(a)});return k}(RightJS);
