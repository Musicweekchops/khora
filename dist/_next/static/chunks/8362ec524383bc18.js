(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,42033,e=>{"use strict";let t,i,a;var r=e.i(71645),n=Object.create,s=Object.defineProperty,o=Object.getOwnPropertyDescriptor,l=Object.getOwnPropertyNames,d=Object.getPrototypeOf,u=Object.prototype.hasOwnProperty,c=function(e,t){return function(){return e&&(t=e(e=0)),t}},h=function(e,t){return function(){return t||e((t={exports:{}}).exports,t),t.exports}},m=function(e,t,i,a){if(t&&"object"==typeof t||"function"==typeof t)for(var r,n=l(t),d=0,c=n.length;d<c;d++)r=n[d],u.call(e,r)||r===i||s(e,r,{get:(function(e){return t[e]}).bind(null,r),enumerable:!(a=o(t,r))||a.enumerable});return e},p=function(e,t,i){return i=null!=e?n(d(e)):{},m(!t&&e&&e.__esModule?i:s(i,"default",{value:e,enumerable:!0}),e)},v=h(function(t,i){i.exports="u">typeof window?window:e.g});function b(e,t){return null!=t&&"u">typeof Symbol&&t[Symbol.hasInstance]?!!t[Symbol.hasInstance](e):b(e,t)}var g=c(function(){g()});function f(e){return e&&"u">typeof Symbol&&e.constructor===Symbol?"symbol":typeof e}var E=c(function(){}),y=h(function(e,t){var i=Array.prototype.slice;t.exports=function(e,t){for(("length"in e)||(e=[e]),e=i.call(e);e.length;){var a=e.shift(),r=t(a);if(r)return r;a.childNodes&&a.childNodes.length&&(e=i.call(a.childNodes).concat(e))}}}),T=h(function(e,t){function i(e,t){if(!b(this,i))return new i(e,t);this.data=e,this.nodeValue=e,this.length=e.length,this.ownerDocument=t||null}g(),t.exports=i,i.prototype.nodeType=8,i.prototype.nodeName="#comment",i.prototype.toString=function(){return"[object Comment]"}}),A=h(function(e,t){function i(e,t){if(!b(this,i))return new i(e);this.data=e||"",this.length=this.data.length,this.ownerDocument=t||null}g(),t.exports=i,i.prototype.type="DOMTextNode",i.prototype.nodeType=3,i.prototype.nodeName="#text",i.prototype.toString=function(){return this.data},i.prototype.replaceData=function(e,t,i){var a=this.data,r=a.substring(0,e),n=a.substring(e+t,a.length);this.data=r+i+n,this.length=this.data.length}}),k=h(function(e,t){t.exports=function(e){var t=this,i=e.type;e.target||(e.target=t),t.listeners||(t.listeners={});var a=t.listeners[i];if(a)return a.forEach(function(i){e.currentTarget=t,"function"==typeof i?i(e):i.handleEvent(e)});t.parentNode&&t.parentNode.dispatchEvent(e)}}),w=h(function(e,t){t.exports=function(e,t){this.listeners||(this.listeners={}),this.listeners[e]||(this.listeners[e]=[]),-1===this.listeners[e].indexOf(t)&&this.listeners[e].push(t)}}),S=h(function(e,t){t.exports=function(e,t){if(this.listeners&&this.listeners[e]){var i=this.listeners[e],a=i.indexOf(t);-1!==a&&i.splice(a,1)}}}),I=h(function(e,t){E(),t.exports=function e(t){switch(t.nodeType){case 3:return r(t.data);case 8:return"<!--"+t.data+"-->";default:var n,s,o;return s=[],o=(n=t).tagName,"http://www.w3.org/1999/xhtml"===n.namespaceURI&&(o=o.toLowerCase()),s.push("<"+o+function(e){var t=[];for(var i in e)(function(e,t){var i=f(e[t]);return"style"===t&&Object.keys(e.style).length>0||e.hasOwnProperty(t)&&("string"===i||"boolean"===i||"number"===i)&&"nodeName"!==t&&"className"!==t&&"tagName"!==t&&"textContent"!==t&&"innerText"!==t&&"namespaceURI"!==t&&"innerHTML"!==t})(e,i)&&t.push({name:i,value:e[i]});for(var r in e._attributes)for(var n in e._attributes[r]){var s=e._attributes[r][n],o=(s.prefix?s.prefix+":":"")+n;t.push({name:o,value:s.value})}return e.className&&t.push({name:"class",value:e.className}),t.length?a(t):""}(n)+function(e){var t=e.dataset,i=[];for(var r in t)i.push({name:"data-"+r,value:t[r]});return i.length?a(i):""}(n)),i.indexOf(o)>-1?s.push(" />"):(s.push(">"),n.childNodes.length?s.push.apply(s,n.childNodes.map(e)):n.textContent||n.innerText?s.push(r(n.textContent||n.innerText)):n.innerHTML&&s.push(n.innerHTML),s.push("</"+o+">")),s.join("")}};var i=["area","base","br","col","embed","hr","img","input","keygen","link","menuitem","meta","param","source","track","wbr"];function a(e){var t=[];return e.forEach(function(e){var i=e.name,a=e.value;"style"===i&&(a=function(e){if("string"==typeof e)return e;var t="";return Object.keys(e).forEach(function(i){var a=e[i];i=i.replace(/[A-Z]/g,function(e){return"-"+e.toLowerCase()}),t+=i+":"+a+";"}),t}(a)),t.push(i+'="'+r(a).replace(/"/g,"&quot;")+'"')}),t.length?" "+t.join(" "):""}function r(e){var t="";return"string"==typeof e?t=e:e&&(t=e.toString()),t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}}),R=h(function(e,t){g();var i=y(),a=k(),r=w(),n=S(),s=I(),o="http://www.w3.org/1999/xhtml";function l(e,t,i){if(!b(this,l))return new l(e);var a=void 0===i?o:i||null;this.tagName=a===o?String(e).toUpperCase():e,this.nodeName=this.tagName,this.className="",this.dataset={},this.childNodes=[],this.parentNode=null,this.style={},this.ownerDocument=t||null,this.namespaceURI=a,this._attributes={},"INPUT"===this.tagName&&(this.type="text")}t.exports=l,l.prototype.type="DOMElement",l.prototype.nodeType=1,l.prototype.appendChild=function(e){return e.parentNode&&e.parentNode.removeChild(e),this.childNodes.push(e),e.parentNode=this,e},l.prototype.replaceChild=function(e,t){e.parentNode&&e.parentNode.removeChild(e);var i=this.childNodes.indexOf(t);return t.parentNode=null,this.childNodes[i]=e,e.parentNode=this,t},l.prototype.removeChild=function(e){var t=this.childNodes.indexOf(e);return this.childNodes.splice(t,1),e.parentNode=null,e},l.prototype.insertBefore=function(e,t){e.parentNode&&e.parentNode.removeChild(e);var i=null==t?-1:this.childNodes.indexOf(t);return i>-1?this.childNodes.splice(i,0,e):this.childNodes.push(e),e.parentNode=this,e},l.prototype.setAttributeNS=function(e,t,i){var a=null,r=t,n=t.indexOf(":");(n>-1&&(a=t.substr(0,n),r=t.substr(n+1)),"INPUT"===this.tagName&&"type"===t)?this.type=i:(this._attributes[e]||(this._attributes[e]={}))[r]={value:i,prefix:a}},l.prototype.getAttributeNS=function(e,t){var i=this._attributes[e],a=i&&i[t]&&i[t].value;return"INPUT"===this.tagName&&"type"===t?this.type:"string"!=typeof a?null:a},l.prototype.removeAttributeNS=function(e,t){var i=this._attributes[e];i&&delete i[t]},l.prototype.hasAttributeNS=function(e,t){var i=this._attributes[e];return!!i&&t in i},l.prototype.setAttribute=function(e,t){return this.setAttributeNS(null,e,t)},l.prototype.getAttribute=function(e){return this.getAttributeNS(null,e)},l.prototype.removeAttribute=function(e){return this.removeAttributeNS(null,e)},l.prototype.hasAttribute=function(e){return this.hasAttributeNS(null,e)},l.prototype.removeEventListener=n,l.prototype.addEventListener=r,l.prototype.dispatchEvent=a,l.prototype.focus=function(){},l.prototype.toString=function(){return s(this)},l.prototype.getElementsByClassName=function(e){var t=e.split(" "),a=[];return i(this,function(e){if(1===e.nodeType){var i=(e.className||"").split(" ");t.every(function(e){return -1!==i.indexOf(e)})&&a.push(e)}}),a},l.prototype.getElementsByTagName=function(e){e=e.toLowerCase();var t=[];return i(this.childNodes,function(i){1===i.nodeType&&("*"===e||i.tagName.toLowerCase()===e)&&t.push(i)}),t},l.prototype.contains=function(e){return i(this,function(t){return e===t})||!1}}),C=h(function(e,t){g();var i=R();function a(e){if(!b(this,a))return new a;this.childNodes=[],this.parentNode=null,this.ownerDocument=e||null}t.exports=a,a.prototype.type="DocumentFragment",a.prototype.nodeType=11,a.prototype.nodeName="#document-fragment",a.prototype.appendChild=i.prototype.appendChild,a.prototype.replaceChild=i.prototype.replaceChild,a.prototype.removeChild=i.prototype.removeChild,a.prototype.toString=function(){return this.childNodes.map(function(e){return String(e)}).join("")}}),L=h(function(e,t){function i(e){}t.exports=i,i.prototype.initEvent=function(e,t,i){this.type=e,this.bubbles=t,this.cancelable=i},i.prototype.preventDefault=function(){}}),M=h(function(e,t){g();var i=y(),a=T(),r=A(),n=R(),s=C(),o=L(),l=k(),d=w(),u=S();function c(){if(!b(this,c))return new c;this.head=this.createElement("head"),this.body=this.createElement("body"),this.documentElement=this.createElement("html"),this.documentElement.appendChild(this.head),this.documentElement.appendChild(this.body),this.childNodes=[this.documentElement],this.nodeType=9}t.exports=c;var h=c.prototype;h.createTextNode=function(e){return new r(e,this)},h.createElementNS=function(e,t){return new n(t,this,null===e?null:String(e))},h.createElement=function(e){return new n(e,this)},h.createDocumentFragment=function(){return new s(this)},h.createEvent=function(e){return new o(e)},h.createComment=function(e){return new a(e,this)},h.getElementById=function(e){return e=String(e),i(this.childNodes,function(t){if(String(t.id)===e)return t})||null},h.getElementsByClassName=n.prototype.getElementsByClassName,h.getElementsByTagName=n.prototype.getElementsByTagName,h.contains=n.prototype.contains,h.removeEventListener=u,h.addEventListener=d,h.dispatchEvent=l}),D=h(function(e,t){t.exports=new(M())}),x=h(function(t,i){var a,r=e.g,n=D();"u">typeof document?a=document:(a=r["__GLOBAL_DOCUMENT_CACHE@4"])||(a=r["__GLOBAL_DOCUMENT_CACHE@4"]=n),i.exports=a});function P(e,t){(null==t||t>e.length)&&(t=e.length);for(var i=0,a=Array(t);i<t;i++)a[i]=e[i];return a}function N(e,t){if(e){if("string"==typeof e)return P(e,t);var i=Object.prototype.toString.call(e).slice(8,-1);if("Object"===i&&e.constructor&&(i=e.constructor.name),"Map"===i||"Set"===i)return Array.from(i);if("Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i))return P(e,t)}}function O(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var i=null==e?null:"u">typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=i){var a,r,n=[],s=!0,o=!1;try{for(i=i.call(e);!(s=(a=i.next()).done)&&(n.push(a.value),!(t&&n.length===t));s=!0);}catch(e){o=!0,r=e}finally{try{s||null==i.return||i.return()}finally{if(o)throw r}}return n}}(e,t)||N(e,t)||function(){throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}var U=p(v()),B=p(v()),H=p(v()),W=function(){var e=H.default.performance,t=e&&e.timing,i=t&&t.navigationStart;return Math.round("number"==typeof i&&"function"==typeof e.now?i+e.now():Date.now())},$=function(){if("function"==typeof(null==(e=B.default.crypto)?void 0:e.getRandomValues)){i=new Uint8Array(32),B.default.crypto.getRandomValues(i);for(var e,t,i,a=0;a<32;a++)i[a]=i[a]%16}else{i=[];for(var r=0;r<32;r++)i[r]=16*Math.random()|0}var n=0;t="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t="x"===e?i[n]:3&i[n]|8;return n++,t.toString(16)});var s=W(),o=null==s?void 0:s.toString(16).substring(3);return o?t.substring(0,28)+o:t},q=function(){return("000000"+(0x81bf1000*Math.random()|0).toString(36)).slice(-6)},V=function(e){var t;if(e&&void 0!==e.nodeName)return e.muxId||(e.muxId=q()),e.muxId;try{t=document.querySelector(e)}catch(e){}return t&&!t.muxId&&(t.muxId=e),(null==t?void 0:t.muxId)||e},F=function(e){e&&void 0!==e.nodeName?e=V(t=e):t=document.querySelector(e);var t,i=t&&t.nodeName?t.nodeName.toLowerCase():"";return[t,e,i]};function K(e){return function(e){if(Array.isArray(e))return P(e)}(e)||function(e){if("u">typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||N(e)||function(){throw TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}var G=function(e){var t,i,a,r,n,s=arguments.length>1&&void 0!==arguments[1]?arguments[1]:3,o=e?[console,e]:[console],l=(t=console.trace).bind.apply(t,K(o)),d=(i=console.info).bind.apply(i,K(o)),u=(a=console.debug).bind.apply(a,K(o)),c=(r=console.warn).bind.apply(r,K(o)),h=(n=console.error).bind.apply(n,K(o)),m=s;return{trace:function(){for(var e=arguments.length,t=Array(e),i=0;i<e;i++)t[i]=arguments[i];if(!(m>0))return l.apply(void 0,K(t))},debug:function(){for(var e=arguments.length,t=Array(e),i=0;i<e;i++)t[i]=arguments[i];if(!(m>1))return u.apply(void 0,K(t))},info:function(){for(var e=arguments.length,t=Array(e),i=0;i<e;i++)t[i]=arguments[i];if(!(m>2))return d.apply(void 0,K(t))},warn:function(){for(var e=arguments.length,t=Array(e),i=0;i<e;i++)t[i]=arguments[i];if(!(m>3))return c.apply(void 0,K(t))},error:function(){for(var e=arguments.length,t=Array(e),i=0;i<e;i++)t[i]=arguments[i];if(!(m>4))return h.apply(void 0,K(t))},get level(){return m},set level(_){_!==this.level&&(m=null!=_?_:s)}}}("[mux]"),j=p(v());function Y(){return"1"===(j.default.doNotTrack||j.default.navigator&&j.default.navigator.doNotTrack)}function Q(e){if(void 0===e)throw ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function z(e,t){if(!b(e,t))throw TypeError("Cannot call a class as a function")}function Z(e,t){for(var i=0;i<t.length;i++){var a=t[i];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}function X(e,t,i){return t&&Z(e.prototype,t),i&&Z(e,i),e}function J(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function ee(e){return(ee=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function et(e,t,i){return(et="u">typeof Reflect&&Reflect.get?Reflect.get:function(e,t,i){var a=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=ee(e)););return e}(e,t);if(a){var r=Object.getOwnPropertyDescriptor(a,t);return r.get?r.get.call(i||e):r.value}})(e,t,i||e)}function ei(e,t){return(ei=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}g(),E();var ea=function(e){return er(e)[0]},er=function(e){if("string"!=typeof e||""===e)return["localhost"];var t,i=(e.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/)||[])[4];return i&&(t=(i.match(/[^\.]+\.[^\.]+$/)||[])[0]),[i,t]},en=p(v()),es=function(){var e=en.default.performance;return void 0!==(e&&e.timing)},eo=function(){var e=en.default.performance,t=e&&e.timing;return t&&t.domContentLoadedEventEnd},el=function(){var e=en.default.performance,t=e&&e.timing;return t&&t.navigationStart};function ed(e,t,i){i=void 0===i?1:i,e[t]=e[t]||0,e[t]+=i}function eu(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{},a=Object.keys(i);"function"==typeof Object.getOwnPropertySymbols&&(a=a.concat(Object.getOwnPropertySymbols(i).filter(function(e){return Object.getOwnPropertyDescriptor(i,e).enumerable}))),a.forEach(function(t){J(e,t,i[t])})}return e}function ec(e,t){return t=null!=t?t:{},Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):(function(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);i.push.apply(i,a)}return i})(Object(t)).forEach(function(i){Object.defineProperty(e,i,Object.getOwnPropertyDescriptor(t,i))}),e}var eh=["x-request-id","cf-ray","x-amz-cf-id","x-akamai-request-id"],em=["x-cdn","content-type"].concat(eh);function ep(e){var t={};return(e=e||"").trim().split(/[\r\n]+/).forEach(function(e){if(e){var i=e.split(": "),a=i.shift();a&&(em.indexOf(a.toLowerCase())>=0||0===a.toLowerCase().indexOf("x-litix-"))&&(t[a]=i.join(": "))}}),t}function ev(e){if(e){var t=eh.find(function(t){return void 0!==e[t]});return t?e[t]:void 0}}var eb=function(e){var t={};for(var i in e){var a=e[i];-1!==a["DATA-ID"].search("io.litix.data.")&&(t[a["DATA-ID"].replace("io.litix.data.","")]=a.VALUE)}return t},eg=function(e){if(!e)return{};var t=el(),i=e.loading,a=i?i.start:e.trequest,r=i?i.first:e.tfirst,n=i?i.end:e.tload;return{bytesLoaded:e.total,requestStart:Math.round(t+a),responseStart:Math.round(t+r),responseEnd:Math.round(t+n)}},ef=function(e){if(!(!e||"function"!=typeof e.getAllResponseHeaders))return ep(e.getAllResponseHeaders())},eE=function(e,t,i){arguments.length>3&&void 0!==arguments[3]&&arguments[3];var a=arguments.length>4?arguments[4]:void 0,r=e.log,n=e.utils.secondsToMs,s=function(e){var t,i=parseInt(a.version);return 1===i&&null!==e.programDateTime&&(t=e.programDateTime),0===i&&null!==e.pdt&&(t=e.pdt),t};if(!es())return void r.warn("performance timing not supported. Not tracking HLS.js.");var o=function(i,a){return e.emit(t,i,a)},l=function(e,t){var i=t.levels,a=t.audioTracks,r=t.url,n=t.stats,s=t.networkDetails,l=t.sessionData,d={},u={};i.forEach(function(e,t){d[t]={width:e.width,height:e.height,bitrate:e.bitrate,attrs:e.attrs}}),a.forEach(function(e,t){u[t]={name:e.name,language:e.lang,bitrate:e.bitrate}});var c=eg(n),h=c.bytesLoaded,m=c.requestStart,p=c.responseStart,v=c.responseEnd;o("requestcompleted",ec(eu({},eb(l)),{request_event_type:e,request_bytes_loaded:h,request_start:m,request_response_start:p,request_response_end:v,request_type:"manifest",request_hostname:ea(r),request_response_headers:ef(s),request_rendition_lists:{media:d,audio:u,video:{}}}))};i.on(a.Events.MANIFEST_LOADED,l);var d=function(e,t){var i=t.details,a=t.level,r=t.networkDetails,l=eg(t.stats),d=l.bytesLoaded,u=l.requestStart,c=l.responseStart,h=l.responseEnd,m=i.fragments[i.fragments.length-1],p=s(m)+n(m.duration);o("requestcompleted",{request_event_type:e,request_bytes_loaded:d,request_start:u,request_response_start:c,request_response_end:h,request_current_level:a,request_type:"manifest",request_hostname:ea(i.url),request_response_headers:ef(r),video_holdback:i.holdBack&&n(i.holdBack),video_part_holdback:i.partHoldBack&&n(i.partHoldBack),video_part_target_duration:i.partTarget&&n(i.partTarget),video_target_duration:i.targetduration&&n(i.targetduration),video_source_is_live:i.live,player_manifest_newest_program_time:isNaN(p)?void 0:p})};i.on(a.Events.LEVEL_LOADED,d);var u=function(e,t){var i=t.details,a=t.networkDetails,r=eg(t.stats);o("requestcompleted",{request_event_type:e,request_bytes_loaded:r.bytesLoaded,request_start:r.requestStart,request_response_start:r.responseStart,request_response_end:r.responseEnd,request_type:"manifest",request_hostname:ea(i.url),request_response_headers:ef(a)})};i.on(a.Events.AUDIO_TRACK_LOADED,u);var c=function(e,t){var a=t.stats,r=t.networkDetails,n=t.frag,s=eg(a=a||n.stats),l=s.bytesLoaded,d=s.requestStart,u=s.responseStart,c=s.responseEnd,h=r?ef(r):void 0,m={request_event_type:e,request_bytes_loaded:l,request_start:d,request_response_start:u,request_response_end:c,request_hostname:r?ea(r.responseURL):void 0,request_id:h?ev(h):void 0,request_response_headers:h,request_media_duration:n.duration,request_url:null==r?void 0:r.responseURL};"main"===n.type?(m.request_type="media",m.request_current_level=n.level,m.request_video_width=(i.levels[n.level]||{}).width,m.request_video_height=(i.levels[n.level]||{}).height,m.request_labeled_bitrate=(i.levels[n.level]||{}).bitrate):m.request_type=n.type,o("requestcompleted",m)};i.on(a.Events.FRAG_LOADED,c);var h=function(e,t){var i=t.frag,a=i.start;o("fragmentchange",{currentFragmentPDT:s(i),currentFragmentStart:n(a)})};i.on(a.Events.FRAG_CHANGED,h);var m=function(e,t){var i,r=t.type,n=t.details,s=t.response,l=t.fatal,d=t.frag,u=t.networkDetails,c=(null==d?void 0:d.url)||t.url||"",h=u?ef(u):void 0;(n===a.ErrorDetails.MANIFEST_LOAD_ERROR||n===a.ErrorDetails.MANIFEST_LOAD_TIMEOUT||n===a.ErrorDetails.FRAG_LOAD_ERROR||n===a.ErrorDetails.FRAG_LOAD_TIMEOUT||n===a.ErrorDetails.LEVEL_LOAD_ERROR||n===a.ErrorDetails.LEVEL_LOAD_TIMEOUT||n===a.ErrorDetails.AUDIO_TRACK_LOAD_ERROR||n===a.ErrorDetails.AUDIO_TRACK_LOAD_TIMEOUT||n===a.ErrorDetails.SUBTITLE_LOAD_ERROR||n===a.ErrorDetails.SUBTITLE_LOAD_TIMEOUT||n===a.ErrorDetails.KEY_LOAD_ERROR||n===a.ErrorDetails.KEY_LOAD_TIMEOUT)&&o("requestfailed",{request_error:n,request_url:c,request_hostname:ea(c),request_id:h?ev(h):void 0,request_type:n===a.ErrorDetails.FRAG_LOAD_ERROR||n===a.ErrorDetails.FRAG_LOAD_TIMEOUT?"media":n===a.ErrorDetails.AUDIO_TRACK_LOAD_ERROR||n===a.ErrorDetails.AUDIO_TRACK_LOAD_TIMEOUT?"audio":n===a.ErrorDetails.SUBTITLE_LOAD_ERROR||n===a.ErrorDetails.SUBTITLE_LOAD_TIMEOUT?"subtitle":n===a.ErrorDetails.KEY_LOAD_ERROR||n===a.ErrorDetails.KEY_LOAD_TIMEOUT?"encryption":"manifest",request_error_code:null==s?void 0:s.code,request_error_text:null==s?void 0:s.text}),l&&o("error",{player_error_code:r,player_error_message:n,player_error_context:"".concat(c?"url: ".concat(c,"\n"):"")+"".concat(s&&(s.code||s.text)?"response: ".concat(s.code,", ").concat(s.text,"\n"):"")+"".concat(t.reason?"failure reason: ".concat(t.reason,"\n"):"")+"".concat(t.level?"level: ".concat(t.level,"\n"):"")+"".concat(t.parent?"parent stream controller: ".concat(t.parent,"\n"):"")+"".concat(t.buffer?"buffer length: ".concat(t.buffer,"\n"):"")+"".concat(t.error?"error: ".concat(t.error,"\n"):"")+"".concat(t.event?"event: ".concat(t.event,"\n"):"")+"".concat(t.err?"error message: ".concat(null==(i=t.err)?void 0:i.message,"\n"):"")})};i.on(a.Events.ERROR,m);var p=function(e,t){var i=t.frag,a=i&&i._url||"";o("requestcanceled",{request_event_type:e,request_url:a,request_type:"media",request_hostname:ea(a)})};i.on(a.Events.FRAG_LOAD_EMERGENCY_ABORTED,p);var v=function(e,t){var a=t.level,n=i.levels[a];if(n&&n.attrs&&n.attrs.BANDWIDTH){var s,l=n.attrs.BANDWIDTH,d=parseFloat(n.attrs["FRAME-RATE"]);isNaN(d)||(s=d),l?o("renditionchange",{video_source_fps:s,video_source_bitrate:l,video_source_width:n.width,video_source_height:n.height,video_source_rendition_name:n.name,video_source_codec:null==n?void 0:n.videoCodec}):r.warn("missing BANDWIDTH from HLS manifest parsed by HLS.js")}};i.on(a.Events.LEVEL_SWITCHED,v),i._stopMuxMonitor=function(){i.off(a.Events.MANIFEST_LOADED,l),i.off(a.Events.LEVEL_LOADED,d),i.off(a.Events.AUDIO_TRACK_LOADED,u),i.off(a.Events.FRAG_LOADED,c),i.off(a.Events.FRAG_CHANGED,h),i.off(a.Events.ERROR,m),i.off(a.Events.FRAG_LOAD_EMERGENCY_ABORTED,p),i.off(a.Events.LEVEL_SWITCHED,v),i.off(a.Events.DESTROYING,i._stopMuxMonitor),delete i._stopMuxMonitor},i.on(a.Events.DESTROYING,i._stopMuxMonitor)},ey=function(e){e&&"function"==typeof e._stopMuxMonitor&&e._stopMuxMonitor()},e_=function(e,t){if(!e||!e.requestEndDate)return{};var i,a=ea(e.url),r=e.url,n=e.bytesLoaded,s=new Date(e.requestStartDate).getTime(),o=new Date(e.firstByteDate).getTime(),l=new Date(e.requestEndDate).getTime(),d=isNaN(e.duration)?0:e.duration,u="function"==typeof t.getMetricsFor?t.getMetricsFor(e.mediaType).HttpList:t.getDashMetrics().getHttpRequests(e.mediaType);u.length>0&&(i=ep(u[u.length-1]._responseHeaders||""));var c=i?ev(i):void 0;return{requestStart:s,requestResponseStart:o,requestResponseEnd:l,requestBytesLoaded:n,requestResponseHeaders:i,requestMediaDuration:d,requestHostname:a,requestUrl:r,requestId:c}},eT=function(e,t){if("function"==typeof t.getCurrentRepresentationForType){var i=t.getCurrentRepresentationForType(e);return i?{currentLevel:i.absoluteIndex,renditionWidth:i.width||null,renditionHeight:i.height||null,renditionBitrate:i.bandwidth}:{}}var a=t.getQualityFor(e),r=t.getCurrentTrackFor(e).bitrateList;return r?{currentLevel:a,renditionWidth:r[a].width||null,renditionHeight:r[a].height||null,renditionBitrate:r[a].bandwidth}:{}},eA=function(e){var t;return null==(t=e.match(/.*codecs\*?="(.*)"/))?void 0:t[1]},ek=function(e){try{var t,i;return null==(i=e.getVersion)||null==(t=i.call(e))?void 0:t.split(".").map(function(e){return parseInt(e)})[0]}catch(e){return!1}},ew=function(e,t,i){arguments.length>3&&void 0!==arguments[3]&&arguments[3];var a=e.log;if(!i||!i.on)return void a.warn("Invalid dash.js player reference. Monitoring blocked.");var r=ek(i),n=function(i,a){return e.emit(t,i,a)},s=function(e){var t=e.type,i=(e.data||{}).url;n("requestcompleted",{request_event_type:t,request_start:0,request_response_start:0,request_response_end:0,request_bytes_loaded:-1,request_type:"manifest",request_hostname:ea(i),request_url:i})};i.on("manifestLoaded",s);var o={},l=function(e){if("function"!=typeof e.getRequests)return null;var t=e.getRequests({state:"executed"});return 0===t.length?null:t[t.length-1]},d=function(e){var t=e.type,a=e.chunk,r=e.request,s=(a||{}).mediaInfo||{},l=s.type,d=s.bitrateList,u={};(d=d||[]).forEach(function(e,t){u[t]={},u[t].width=e.width,u[t].height=e.height,u[t].bitrate=e.bandwidth,u[t].attrs={}}),"video"===l?o.video=u:"audio"===l?o.audio=u:o.media=u;var c=e_(r,i),h=c.requestStart,m=c.requestResponseStart,p=c.requestResponseEnd,v=c.requestResponseHeaders,b=c.requestMediaDuration,g=c.requestHostname,f=c.requestUrl;n("requestcompleted",{request_event_type:t,request_start:h,request_response_start:m,request_response_end:p,request_bytes_loaded:-1,request_type:l+"_init",request_response_headers:v,request_hostname:g,request_id:c.requestId,request_url:f,request_media_duration:b,request_rendition_lists:o})};r>=4?i.on("initFragmentLoaded",d):i.on("initFragmentLoaded",function(e){var t=e.type,i=e.fragmentModel,a=e.chunk;d({type:t,request:l(i),chunk:a})});var u=function(e){var t=e.type,a=e.chunk,r=e.request,s=a||{},o=s.mediaInfo,l=s.start,d=(o||{}).type,u=e_(r,i),c=u.requestStart,h=u.requestResponseStart,m=u.requestResponseEnd,p=u.requestBytesLoaded,v=u.requestResponseHeaders,b=u.requestMediaDuration,g=u.requestHostname,f=u.requestUrl,E=u.requestId,y=eT(d,i),T=y.currentLevel,A=y.renditionWidth,k=y.renditionHeight;n("requestcompleted",{request_event_type:t,request_start:c,request_response_start:h,request_response_end:m,request_bytes_loaded:p,request_type:d,request_response_headers:v,request_hostname:g,request_id:E,request_url:f,request_media_start_time:l,request_media_duration:b,request_current_level:T,request_labeled_bitrate:y.renditionBitrate,request_video_width:A,request_video_height:k})};r>=4?i.on("mediaFragmentLoaded",u):i.on("mediaFragmentLoaded",function(e){var t=e.type,i=e.fragmentModel,a=e.chunk;u({type:t,request:l(i),chunk:a})});var c={video:void 0,audio:void 0,totalBitrate:void 0},h=function(){if(c.video&&"number"==typeof c.video.bitrate){if(!(c.video.width&&c.video.height))return void a.warn("have bitrate info for video but missing width/height");var e=c.video.bitrate;if(c.audio&&"number"==typeof c.audio.bitrate&&(e+=c.audio.bitrate),e!==c.totalBitrate)return c.totalBitrate=e,{video_source_bitrate:e,video_source_height:c.video.height,video_source_width:c.video.width,video_source_codec:eA(c.video.codec)}}},m=function(e,t,r){var s=e.mediaType;if("audio"===s||"video"===s){if("function"==typeof i.getRepresentationsByType)if(e.newRepresentation)o={bitrate:e.newRepresentation.bandwidth,width:e.newRepresentation.width,height:e.newRepresentation.height,qualityIndex:e.newRepresentation.absoluteIndex};else{var o,l=i.getRepresentationsByType(s);if(l&&"number"==typeof e.newQuality){var d=l.find(function(t){return t.absoluteIndex===e.newQuality||t.index===e.newQuality});d&&(o={bitrate:d.bandwidth,width:d.width,height:d.height,qualityIndex:e.newQuality})}}else{if("number"!=typeof e.newQuality)return void a.warn("missing evt.newQuality in qualityChangeRendered event",e);o=i.getBitrateInfoListFor(s).find(function(t){return t.qualityIndex===e.newQuality})}if(!(o&&"number"==typeof o.bitrate))return void a.warn("missing bitrate info for ".concat(s));c[s]=ec(eu({},o),{codec:i.getCurrentTrackFor(s).codec});var u=h();u&&n("renditionchange",u)}};i.on("qualityChangeRendered",m);var p=function(e){var t=e.request,i=e.mediaType;n("requestcanceled",{request_event_type:(t=t||{}).type+"_"+t.action,request_url:t.url,request_type:i,request_hostname:ea(t.url)})};i.on("fragmentLoadingAbandoned",p);var v=function(e){var t,i,a=e.error,r=(null==a||null==(t=a.data)?void 0:t.request)||{},s=(null==a||null==(i=a.data)?void 0:i.response)||{};(null==a?void 0:a.code)===27&&n("requestfailed",{request_error:r.type+"_"+r.action,request_url:r.url,request_hostname:ea(r.url),request_type:r.mediaType,request_error_code:s.status,request_error_text:s.statusText});var o="".concat(null!=r&&r.url?"url: ".concat(r.url,"\n"):"")+"".concat(null!=s&&s.status||null!=s&&s.statusText?"response: ".concat(null==s?void 0:s.status,", ").concat(null==s?void 0:s.statusText,"\n"):"");n("error",{player_error_code:null==a?void 0:a.code,player_error_message:null==a?void 0:a.message,player_error_context:o})};i.on("error",v),i._stopMuxMonitor=function(){i.off("manifestLoaded",s),i.off("initFragmentLoaded",d),i.off("mediaFragmentLoaded",u),i.off("qualityChangeRendered",m),i.off("error",v),i.off("fragmentLoadingAbandoned",p),delete i._stopMuxMonitor}},eS=function(e){e&&"function"==typeof e._stopMuxMonitor&&e._stopMuxMonitor()},eI=0,eR=function(){function e(){z(this,e),J(this,"_listeners",void 0)}return X(e,[{key:"on",value:function(e,t,i){return t._eventEmitterGuid=t._eventEmitterGuid||++eI,this._listeners=this._listeners||{},this._listeners[e]=this._listeners[e]||[],i&&(t=t.bind(i)),this._listeners[e].push(t),t}},{key:"off",value:function(e,t){var i=this._listeners&&this._listeners[e];i&&i.forEach(function(e,a){e._eventEmitterGuid===t._eventEmitterGuid&&i.splice(a,1)})}},{key:"one",value:function(e,t,i){var a=this;t._eventEmitterGuid=t._eventEmitterGuid||++eI;var r=function(){a.off(e,r),t.apply(i||this,arguments)};r._eventEmitterGuid=t._eventEmitterGuid,this.on(e,r)}},{key:"emit",value:function(e,t){var i=this;if(this._listeners){t=t||{};var a=this._listeners["before"+e]||[],r=this._listeners["before*"]||[],n=this._listeners[e]||[],s=this._listeners["after"+e]||[],o=function(t,a){(t=t.slice()).forEach(function(t){t.call(i,{type:e},a)})};o(a,t),o(r,t),o(n,t),o(s,t)}}}]),e}(),eC=p(v()),eL=function(){function e(t){var i=this;z(this,e),J(this,"_playbackHeartbeatInterval",void 0),J(this,"_playheadShouldBeProgressing",void 0),J(this,"pm",void 0),this.pm=t,this._playbackHeartbeatInterval=null,this._playheadShouldBeProgressing=!1,t.on("playing",function(){i._playheadShouldBeProgressing=!0}),t.on("play",this._startPlaybackHeartbeatInterval.bind(this)),t.on("playing",this._startPlaybackHeartbeatInterval.bind(this)),t.on("adbreakstart",this._startPlaybackHeartbeatInterval.bind(this)),t.on("adplay",this._startPlaybackHeartbeatInterval.bind(this)),t.on("adplaying",this._startPlaybackHeartbeatInterval.bind(this)),t.on("devicewake",this._startPlaybackHeartbeatInterval.bind(this)),t.on("viewstart",this._startPlaybackHeartbeatInterval.bind(this)),t.on("rebufferstart",this._startPlaybackHeartbeatInterval.bind(this)),t.on("pause",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("ended",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("viewend",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("error",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("aderror",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("adpause",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("adended",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("adbreakend",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("seeked",function(){t.data.player_is_paused?i._stopPlaybackHeartbeatInterval():i._startPlaybackHeartbeatInterval()}),t.on("timeupdate",function(){null!==i._playbackHeartbeatInterval&&t.emit("playbackheartbeat")}),t.on("devicesleep",function(e,a){null!==i._playbackHeartbeatInterval&&(eC.default.clearInterval(i._playbackHeartbeatInterval),t.emit("playbackheartbeatend",{viewer_time:a.viewer_time}),i._playbackHeartbeatInterval=null)})}return X(e,[{key:"_startPlaybackHeartbeatInterval",value:function(){var e=this;null===this._playbackHeartbeatInterval&&(this.pm.emit("playbackheartbeat"),this._playbackHeartbeatInterval=eC.default.setInterval(function(){e.pm.emit("playbackheartbeat")},this.pm.playbackHeartbeatTime))}},{key:"_stopPlaybackHeartbeatInterval",value:function(){this._playheadShouldBeProgressing=!1,null!==this._playbackHeartbeatInterval&&(eC.default.clearInterval(this._playbackHeartbeatInterval),this.pm.emit("playbackheartbeatend"),this._playbackHeartbeatInterval=null)}}]),e}(),eM=function e(t){var i=this;z(this,e),J(this,"viewErrored",void 0),t.on("viewinit",function(){i.viewErrored=!1}),t.on("error",function(e,a){try{var r=t.errorTranslator({player_error_code:a.player_error_code,player_error_message:a.player_error_message,player_error_context:a.player_error_context,player_error_severity:a.player_error_severity,player_error_business_exception:a.player_error_business_exception});r&&(t.data.player_error_code=r.player_error_code||a.player_error_code,t.data.player_error_message=r.player_error_message||a.player_error_message,t.data.player_error_context=r.player_error_context||a.player_error_context,t.data.player_error_severity=r.player_error_severity||a.player_error_severity,t.data.player_error_business_exception=r.player_error_business_exception||a.player_error_business_exception,i.viewErrored=!0)}catch(e){t.mux.log.warn("Exception in error translator callback.",e),i.viewErrored=!0}}),t.on("aftererror",function(){var e,i,a,r,n;null==(e=t.data)||delete e.player_error_code,null==(i=t.data)||delete i.player_error_message,null==(a=t.data)||delete a.player_error_context,null==(r=t.data)||delete r.player_error_severity,null==(n=t.data)||delete n.player_error_business_exception})},eD=function(){function e(t){z(this,e),J(this,"_watchTimeTrackerLastCheckedTime",void 0),J(this,"pm",void 0),this.pm=t,this._watchTimeTrackerLastCheckedTime=null,t.on("playbackheartbeat",this._updateWatchTime.bind(this)),t.on("playbackheartbeatend",this._clearWatchTimeState.bind(this))}return X(e,[{key:"_updateWatchTime",value:function(e,t){var i=t.viewer_time;null===this._watchTimeTrackerLastCheckedTime&&(this._watchTimeTrackerLastCheckedTime=i),ed(this.pm.data,"view_watch_time",i-this._watchTimeTrackerLastCheckedTime),this._watchTimeTrackerLastCheckedTime=i}},{key:"_clearWatchTimeState",value:function(e,t){this._updateWatchTime(e,t),this._watchTimeTrackerLastCheckedTime=null}}]),e}(),ex=function(){function e(t){var i=this;z(this,e),J(this,"_playbackTimeTrackerLastPlayheadPosition",void 0),J(this,"_lastTime",void 0),J(this,"_isAdPlaying",void 0),J(this,"_callbackUpdatePlaybackTime",void 0),J(this,"pm",void 0),this.pm=t,this._playbackTimeTrackerLastPlayheadPosition=-1,this._lastTime=W(),this._isAdPlaying=!1,this._callbackUpdatePlaybackTime=null,t.on("viewinit",function(){i.pm.data.view_playing_time_ms_cumulative=0});var a=this._startPlaybackTimeTracking.bind(this);t.on("playing",a),t.on("adplaying",a);var r=function(){i.pm.data.player_is_paused||a()};t.on("seeked",r),t.on("rebufferend",r);var n=this._stopPlaybackTimeTracking.bind(this);t.on("playbackheartbeatend",n),t.on("seeking",n),t.on("rebufferstart",n),t.on("adplaying",function(){i._isAdPlaying=!0}),t.on("adended",function(){i._isAdPlaying=!1}),t.on("adpause",function(){i._isAdPlaying=!1}),t.on("adbreakstart",function(){i._isAdPlaying=!1}),t.on("adbreakend",function(){i._isAdPlaying=!1}),t.on("adplay",function(){i._isAdPlaying=!1}),t.on("viewinit",function(){i._playbackTimeTrackerLastPlayheadPosition=-1,i._lastTime=W(),i._isAdPlaying=!1,i._callbackUpdatePlaybackTime=null})}return X(e,[{key:"_startPlaybackTimeTracking",value:function(){null===this._callbackUpdatePlaybackTime&&(this._callbackUpdatePlaybackTime=this._updatePlaybackTime.bind(this),this._playbackTimeTrackerLastPlayheadPosition=this.pm.data.player_playhead_time,this._lastTime=W(),this.pm.on("playbackheartbeat",this._callbackUpdatePlaybackTime))}},{key:"_stopPlaybackTimeTracking",value:function(){this._callbackUpdatePlaybackTime&&(this._updatePlaybackTime(),this.pm.off("playbackheartbeat",this._callbackUpdatePlaybackTime),this._callbackUpdatePlaybackTime=null,this._playbackTimeTrackerLastPlayheadPosition=-1)}},{key:"_updatePlaybackTime",value:function(){var e=this.pm.data.player_playhead_time||0,t=W(),i=t-this._lastTime,a=-1;this._playbackTimeTrackerLastPlayheadPosition>=0&&e>this._playbackTimeTrackerLastPlayheadPosition?a=e-this._playbackTimeTrackerLastPlayheadPosition:this._isAdPlaying&&(a=i),a>0&&a<=1e3&&ed(this.pm.data,"view_content_playback_time",a),null!==this._callbackUpdatePlaybackTime&&i>0&&i<=1e3&&(this._isAdPlaying&&ed(this.pm.data,"ad_playing_time_ms_cumulative",i),ed(this.pm.data,"view_playing_time_ms_cumulative",i)),this._playbackTimeTrackerLastPlayheadPosition=e,this._lastTime=t}}]),e}(),eP=function(){function e(t){z(this,e),J(this,"pm",void 0),this.pm=t;var i=this._updatePlayheadTime.bind(this);t.on("playbackheartbeat",i),t.on("playbackheartbeatend",i),t.on("timeupdate",i),t.on("destroy",function(){t.off("timeupdate",i)})}return X(e,[{key:"_updateMaxPlayheadPosition",value:function(){this.pm.data.view_max_playhead_position=void 0===this.pm.data.view_max_playhead_position?this.pm.data.player_playhead_time:Math.max(this.pm.data.view_max_playhead_position,this.pm.data.player_playhead_time)}},{key:"_updatePlayheadTime",value:function(e,t){var i=this,a=function(){i.pm.currentFragmentPDT&&i.pm.currentFragmentStart&&(i.pm.data.player_program_time=i.pm.currentFragmentPDT+i.pm.data.player_playhead_time-i.pm.currentFragmentStart)};if(t&&t.player_playhead_time)this.pm.data.player_playhead_time=t.player_playhead_time,a(),this._updateMaxPlayheadPosition();else if(this.pm.getPlayheadTime){var r=this.pm.getPlayheadTime();void 0!==r&&(this.pm.data.player_playhead_time=r,a(),this._updateMaxPlayheadPosition())}}}]),e}(),eN=function e(t){if(z(this,e),!t.disableRebufferTracking){var i,a=function(e,t){r(t),i=void 0},r=function(e){if(i){var a=e.viewer_time-i;ed(t.data,"view_rebuffer_duration",a),i=e.viewer_time,t.data.view_rebuffer_duration>3e5&&(t.emit("viewend"),t.send("viewend"),t.mux.log.warn("Ending view after rebuffering for longer than ".concat(3e5,"ms, future events will be ignored unless a programchange or videochange occurs.")))}t.data.view_watch_time>=0&&t.data.view_rebuffer_count>0&&(t.data.view_rebuffer_frequency=t.data.view_rebuffer_count/t.data.view_watch_time,t.data.view_rebuffer_percentage=t.data.view_rebuffer_duration/t.data.view_watch_time)};t.on("playbackheartbeat",function(e,t){return r(t)}),t.on("rebufferstart",function(e,r){i||(ed(t.data,"view_rebuffer_count",1),i=r.viewer_time,t.one("rebufferend",a))}),t.on("viewinit",function(){i=void 0,t.off("rebufferend",a)})}},eO=function(){function e(t){var i=this;z(this,e),J(this,"_lastCheckedTime",void 0),J(this,"_lastPlayheadTime",void 0),J(this,"_lastPlayheadTimeUpdatedTime",void 0),J(this,"_rebuffering",void 0),J(this,"pm",void 0),this.pm=t,t.disableRebufferTracking||t.disablePlayheadRebufferTracking||(this._lastCheckedTime=null,this._lastPlayheadTime=null,this._lastPlayheadTimeUpdatedTime=null,t.on("playbackheartbeat",this._checkIfRebuffering.bind(this)),t.on("playbackheartbeatend",this._cleanupRebufferTracker.bind(this)),t.on("seeking",function(){i._cleanupRebufferTracker(null,{viewer_time:W()})}))}return X(e,[{key:"_checkIfRebuffering",value:function(e,t){if(this.pm.seekingTracker.isSeeking||this.pm.adTracker.isAdBreak||!this.pm.playbackHeartbeat._playheadShouldBeProgressing)return void this._cleanupRebufferTracker(e,t);if(null===this._lastCheckedTime)return void this._prepareRebufferTrackerState(t.viewer_time);if(this._lastPlayheadTime!==this.pm.data.player_playhead_time)return void this._cleanupRebufferTracker(e,t,!0);var i=t.viewer_time-this._lastPlayheadTimeUpdatedTime;"number"==typeof this.pm.sustainedRebufferThreshold&&i>=this.pm.sustainedRebufferThreshold&&(this._rebuffering||(this._rebuffering=!0,this.pm.emit("rebufferstart",{viewer_time:this._lastPlayheadTimeUpdatedTime}))),this._lastCheckedTime=t.viewer_time}},{key:"_clearRebufferTrackerState",value:function(){this._lastCheckedTime=null,this._lastPlayheadTime=null,this._lastPlayheadTimeUpdatedTime=null}},{key:"_prepareRebufferTrackerState",value:function(e){this._lastCheckedTime=e,this._lastPlayheadTime=this.pm.data.player_playhead_time,this._lastPlayheadTimeUpdatedTime=e}},{key:"_cleanupRebufferTracker",value:function(e,t){var i=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if(this._rebuffering)this._rebuffering=!1,this.pm.emit("rebufferend",{viewer_time:t.viewer_time});else{if(null===this._lastCheckedTime)return;var a=this.pm.data.player_playhead_time-this._lastPlayheadTime,r=t.viewer_time-this._lastPlayheadTimeUpdatedTime;"number"==typeof this.pm.minimumRebufferDuration&&a>0&&r-a>this.pm.minimumRebufferDuration&&(this._lastCheckedTime=null,this.pm.emit("rebufferstart",{viewer_time:this._lastPlayheadTimeUpdatedTime}),this.pm.emit("rebufferend",{viewer_time:this._lastPlayheadTimeUpdatedTime+r-a}))}i?this._prepareRebufferTrackerState(t.viewer_time):this._clearRebufferTrackerState()}}]),e}(),eU=function(){function e(t){var i=this;z(this,e),J(this,"pm",void 0),this.pm=t,t.on("viewinit",function(){var e=t.data,a=e.view_id;if(!e.view_program_changed){var r=function(e,r){var n=r.viewer_time;"playing"===e.type&&void 0===t.data.view_time_to_first_frame?i.calculateTimeToFirstFrame(n||W(),a):"adplaying"===e.type&&(void 0===t.data.view_time_to_first_frame||i._inPrerollPosition())&&i.calculateTimeToFirstFrame(n||W(),a)};t.one("playing",r),t.one("adplaying",r),t.one("viewend",function(){t.off("playing",r),t.off("adplaying",r)})}})}return X(e,[{key:"_inPrerollPosition",value:function(){return void 0===this.pm.data.view_content_playback_time||this.pm.data.view_content_playback_time<=1e3}},{key:"calculateTimeToFirstFrame",value:function(e,t){t===this.pm.data.view_id&&(this.pm.watchTimeTracker._updateWatchTime(null,{viewer_time:e}),this.pm.data.view_time_to_first_frame=this.pm.data.view_watch_time,(this.pm.data.player_autoplay_on||this.pm.data.video_is_autoplay)&&this.pm.pageLoadInitTime&&(this.pm.data.view_aggregate_startup_time=this.pm.data.view_start+this.pm.data.view_watch_time-this.pm.pageLoadInitTime))}}]),e}(),eB=function e(t){var i=this;z(this,e),J(this,"_lastPlayerHeight",void 0),J(this,"_lastPlayerWidth",void 0),J(this,"_lastPlayheadPosition",void 0),J(this,"_lastSourceHeight",void 0),J(this,"_lastSourceWidth",void 0),t.on("viewinit",function(){i._lastPlayheadPosition=-1}),["pause","rebufferstart","seeking","error","adbreakstart","hb","renditionchange","orientationchange","viewend","playbackmodechange"].forEach(function(e){t.on(e,function(){if(i._lastPlayheadPosition>=0&&t.data.player_playhead_time>=0&&i._lastPlayerWidth>=0&&i._lastSourceWidth>0&&i._lastPlayerHeight>=0&&i._lastSourceHeight>0){var e=t.data.player_playhead_time-i._lastPlayheadPosition;if(e<0){i._lastPlayheadPosition=-1;return}var a=Math.min(i._lastPlayerWidth/i._lastSourceWidth,i._lastPlayerHeight/i._lastSourceHeight),r=Math.max(0,a-1),n=Math.max(0,1-a);t.data.view_max_upscale_percentage=Math.max(t.data.view_max_upscale_percentage||0,r),t.data.view_max_downscale_percentage=Math.max(t.data.view_max_downscale_percentage||0,n),ed(t.data,"view_total_content_playback_time",e),ed(t.data,"view_total_upscaling",r*e),ed(t.data,"view_total_downscaling",n*e)}i._lastPlayheadPosition=-1})}),["playing","hb","renditionchange","orientationchange","playbackmodechange"].forEach(function(e){t.on(e,function(){i._lastPlayheadPosition=t.data.player_playhead_time,i._lastPlayerWidth=t.data.player_width,i._lastPlayerHeight=t.data.player_height,i._lastSourceWidth=t.data.video_source_width,i._lastSourceHeight=t.data.video_source_height})})},eH=function e(t){var i=this;z(this,e),J(this,"isSeeking",void 0),this.isSeeking=!1;var a=-1,r=function(){var e=W(),r=(t.data.viewer_time||e)-(a||e);ed(t.data,"view_seek_duration",r),t.data.view_max_seek_time=Math.max(t.data.view_max_seek_time||0,r),i.isSeeking=!1,a=-1};t.on("seeking",function(e,n){if(Object.assign(t.data,n),i.isSeeking&&n.viewer_time-a<=2e3){a=n.viewer_time;return}i.isSeeking&&r(),i.isSeeking=!0,a=n.viewer_time,ed(t.data,"view_seek_count",1),t.send("seeking")}),t.on("seeked",function(){r()}),t.on("viewend",function(){i.isSeeking&&(r(),t.send("seeked")),i.isSeeking=!1,a=-1})},eW=function(e,t){e.push(t),e.sort(function(e,t){return e.viewer_time-t.viewer_time})},e$=["adbreakstart","adrequest","adresponse","adplay","adplaying","adpause","adended","adbreakend","aderror","adclicked","adskipped"],eq=function(){function e(t){var i=this;z(this,e),J(this,"_adHasPlayed",void 0),J(this,"_adRequests",void 0),J(this,"_adResponses",void 0),J(this,"_currentAdRequestNumber",void 0),J(this,"_currentAdResponseNumber",void 0),J(this,"_prerollPlayTime",void 0),J(this,"_wouldBeNewAdPlay",void 0),J(this,"isAdBreak",void 0),J(this,"pm",void 0),this.pm=t,t.on("viewinit",function(){i.isAdBreak=!1,i._currentAdRequestNumber=0,i._currentAdResponseNumber=0,i._adRequests=[],i._adResponses=[],i._adHasPlayed=!1,i._wouldBeNewAdPlay=!0,i._prerollPlayTime=void 0}),e$.forEach(function(e){return t.on(e,i._updateAdData.bind(i))});var a=function(){i.isAdBreak=!1};t.on("adbreakstart",function(){i.isAdBreak=!0}),t.on("play",a),t.on("playing",a),t.on("viewend",a),t.on("adrequest",function(e,a){a=Object.assign({ad_request_id:"generatedAdRequestId"+i._currentAdRequestNumber++},a),eW(i._adRequests,a),ed(t.data,"view_ad_request_count"),i.inPrerollPosition()&&(t.data.view_preroll_requested=!0,i._adHasPlayed||ed(t.data,"view_preroll_request_count"))}),t.on("adresponse",function(e,a){a=Object.assign({ad_request_id:"generatedAdRequestId"+i._currentAdResponseNumber++},a),eW(i._adResponses,a);var r=i.findAdRequest(a.ad_request_id);r&&ed(t.data,"view_ad_request_time",Math.max(0,a.viewer_time-r.viewer_time))}),t.on("adplay",function(e,a){i._adHasPlayed=!0,i._wouldBeNewAdPlay&&(i._wouldBeNewAdPlay=!1,ed(t.data,"view_ad_played_count")),i.inPrerollPosition()&&!t.data.view_preroll_played&&(t.data.view_preroll_played=!0,i._adRequests.length>0&&(t.data.view_preroll_request_time=Math.max(0,a.viewer_time-i._adRequests[0].viewer_time)),t.data.view_start&&(t.data.view_startup_preroll_request_time=Math.max(0,a.viewer_time-t.data.view_start)),i._prerollPlayTime=a.viewer_time)}),t.on("adplaying",function(e,a){i.inPrerollPosition()&&void 0===t.data.view_preroll_load_time&&void 0!==i._prerollPlayTime&&(t.data.view_preroll_load_time=a.viewer_time-i._prerollPlayTime,t.data.view_startup_preroll_load_time=a.viewer_time-i._prerollPlayTime)}),t.on("adclicked",function(e,a){i._wouldBeNewAdPlay||ed(t.data,"view_ad_clicked_count")}),t.on("adskipped",function(e,a){i._wouldBeNewAdPlay||ed(t.data,"view_ad_skipped_count")}),t.on("adended",function(){i._wouldBeNewAdPlay=!0}),t.on("aderror",function(){i._wouldBeNewAdPlay=!0})}return X(e,[{key:"inPrerollPosition",value:function(){return void 0===this.pm.data.view_content_playback_time||this.pm.data.view_content_playback_time<=1e3}},{key:"findAdRequest",value:function(e){for(var t=0;t<this._adRequests.length;t++)if(this._adRequests[t].ad_request_id===e)return this._adRequests[t]}},{key:"_updateAdData",value:function(e,t){if(this.inPrerollPosition()){if(!this.pm.data.view_preroll_ad_tag_hostname&&t.ad_tag_url){var i=O(er(t.ad_tag_url),2),a=i[0],r=i[1];this.pm.data.view_preroll_ad_tag_domain=r,this.pm.data.view_preroll_ad_tag_hostname=a}if(!this.pm.data.view_preroll_ad_asset_hostname&&t.ad_asset_url){var n=O(er(t.ad_asset_url),2),s=n[0],o=n[1];this.pm.data.view_preroll_ad_asset_domain=o,this.pm.data.view_preroll_ad_asset_hostname=s}this.pm.data.ad_type="preroll"}this.pm.data.ad_asset_url=null==t?void 0:t.ad_asset_url,this.pm.data.ad_tag_url=null==t?void 0:t.ad_tag_url,this.pm.data.ad_creative_id=null==t?void 0:t.ad_creative_id,this.pm.data.ad_id=null==t?void 0:t.ad_id,this.pm.data.ad_universal_id=null==t?void 0:t.ad_universal_id,null!=t&&t.ad_type&&(this.pm.data.ad_type=null==t?void 0:t.ad_type)}}]),e}(),eV=function e(t){var i=this;z(this,e),J(this,"lastWallClockTime",void 0);var a=function(){i.lastWallClockTime=W(),t.on("before*",r)},r=function(e){var a=W(),r=i.lastWallClockTime;i.lastWallClockTime=a,a-r>3e4&&(t.emit("devicesleep",{viewer_time:r}),Object.assign(t.data,{viewer_time:r}),t.send("devicesleep"),t.emit("devicewake",{viewer_time:a}),Object.assign(t.data,{viewer_time:a}),t.send("devicewake"))};t.one("playbackheartbeat",a),t.on("playbackheartbeatend",function(){t.off("before*",r),t.one("playbackheartbeat",a)})},eF=p(v()),eK=(tE=function(){for(var e=0,t={};e<arguments.length;e++){var i=arguments[e];for(var a in i)t[a]=i[a]}return t},function e(t){function i(e,a,r){var n;if("u">typeof document){if(arguments.length>1){if("number"==typeof(r=tE({path:"/"},i.defaults,r)).expires){var s=new Date;s.setMilliseconds(s.getMilliseconds()+864e5*r.expires),r.expires=s}try{n=JSON.stringify(a),/^[\{\[]/.test(n)&&(a=n)}catch(e){}return a=t.write?t.write(a,e):encodeURIComponent(String(a)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=(e=(e=encodeURIComponent(String(e))).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent)).replace(/[\(\)]/g,escape),document.cookie=e+"="+a+(r.expires?"; expires="+r.expires.toUTCString():"")+(r.path?"; path="+r.path:"")+(r.domain?"; domain="+r.domain:"")+(r.secure?"; secure":"")}e||(n={});for(var o=document.cookie?document.cookie.split("; "):[],l=/(%[0-9A-Z]{2})+/g,d=0;d<o.length;d++){var u=o[d].split("="),c=u.slice(1).join("=");'"'===c.charAt(0)&&(c=c.slice(1,-1));try{var h=u[0].replace(l,decodeURIComponent);if(c=t.read?t.read(c,h):t(c,h)||c.replace(l,decodeURIComponent),this.json)try{c=JSON.parse(c)}catch(e){}if(e===h){n=c;break}e||(n[h]=c)}catch(e){}}return n}}return i.set=i,i.get=function(e){return i.call(i,e)},i.getJSON=function(){return i.apply({json:!0},[].slice.call(arguments))},i.defaults={},i.remove=function(e,t){i(e,"",tE(t,{expires:-1}))},i.withConverter=e,i}(function(){})),eG="muxData",ej=function(){var e;try{e=(eK.get(eG)||"").split("&").reduce(function(e,t){var i=O(t.split("="),2),a=i[0],r=i[1],n=+r;return e[a]=r&&n==r?n:r,e},{})}catch(t){e={}}return e},eY=function(e){try{eK.set(eG,Object.entries(e).map(function(e){var t=O(e,2),i=t[0],a=t[1];return"".concat(i,"=").concat(a)}).join("&"),{expires:365})}catch(e){}},eQ=function(){var e=ej();return e.mux_viewer_id=e.mux_viewer_id||$(),e.msn=e.msn||Math.random(),eY(e),{mux_viewer_id:e.mux_viewer_id,mux_sample_number:e.msn}},ez=function(){var e=ej(),t=W();return e.session_start&&(e.sst=e.session_start,delete e.session_start),e.session_id&&(e.sid=e.session_id,delete e.session_id),e.session_expires&&(e.sex=e.session_expires,delete e.session_expires),(!e.sex||e.sex<t)&&(e.sid=$(),e.sst=t),e.sex=t+15e5,eY(e),{session_id:e.sid,session_start:e.sst,session_expires:e.sex}},eZ=eJ({a:"env",b:"beacon",c:"custom",d:"ad",e:"event",f:"experiment",i:"internal",m:"mux",n:"response",p:"player",q:"request",r:"retry",s:"session",t:"timestamp",u:"viewer",v:"video",w:"page",x:"view",y:"sub"}),eX=eJ({ad:"ad",af:"affiliate",ag:"aggregate",ap:"api",al:"application",ao:"audio",ar:"architecture",as:"asset",au:"autoplay",av:"average",bi:"bitrate",bn:"brand",br:"break",bw:"browser",by:"bytes",bz:"business",ca:"cached",cb:"cancel",cc:"codec",cd:"code",cg:"category",ch:"changed",ci:"client",ck:"clicked",cl:"canceled",cm:"cmcd",cn:"config",co:"count",ce:"counter",cp:"complete",cq:"creator",cr:"creative",cs:"captions",ct:"content",cu:"current",cv:"cumulative",cx:"connection",cz:"context",da:"data",dg:"downscaling",dm:"domain",dn:"cdn",do:"downscale",dr:"drm",dp:"dropped",du:"duration",dv:"device",dy:"dynamic",eb:"enabled",ec:"encoding",ed:"edge",en:"end",eg:"engine",em:"embed",er:"error",ep:"experiments",es:"errorcode",et:"errortext",ee:"event",ev:"events",ex:"expires",ez:"exception",fa:"failed",fi:"first",fm:"family",ft:"format",fp:"fps",fq:"frequency",fr:"frame",fs:"fullscreen",ha:"has",hb:"holdback",he:"headers",ho:"host",hn:"hostname",ht:"height",id:"id",ii:"init",in:"instance",ip:"ip",is:"is",ke:"key",la:"language",lb:"labeled",le:"level",li:"live",ld:"loaded",lo:"load",lw:"low",ls:"lists",lt:"latency",ma:"max",md:"media",me:"message",mf:"manifest",mi:"mime",ml:"midroll",mm:"min",mn:"manufacturer",mo:"model",mp:"mode",ms:"ms",mx:"mux",ne:"newest",nm:"name",no:"number",on:"on",or:"origin",os:"os",pa:"paused",pb:"playback",pd:"producer",pe:"percentage",pf:"played",pg:"program",ph:"playhead",pi:"plugin",pl:"preroll",pn:"playing",po:"poster",pp:"pip",pr:"preload",ps:"position",pt:"part",pv:"previous",py:"property",px:"pop",pz:"plan",ra:"rate",rd:"requested",re:"rebuffer",rf:"rendition",rg:"range",rm:"remote",ro:"ratio",rp:"response",rq:"request",rs:"requests",sa:"sample",sd:"skipped",se:"session",sh:"shift",sk:"seek",sm:"stream",so:"source",sq:"sequence",sr:"series",ss:"status",st:"start",su:"startup",sv:"server",sw:"software",sy:"severity",ta:"tag",tc:"tech",te:"text",tg:"target",th:"throughput",ti:"time",tl:"total",to:"to",tt:"title",ty:"type",ug:"upscaling",un:"universal",up:"upscale",ur:"url",us:"user",va:"variant",vd:"viewed",vi:"video",ve:"version",vw:"view",vr:"viewer",wd:"width",wa:"watch",wt:"waiting"});function eJ(e){var t={};for(var i in e)e.hasOwnProperty(i)&&(t[e[i]]=i);return t}function e0(e){var t={},i={};return Object.keys(e).forEach(function(a){var r=!1;if(e.hasOwnProperty(a)&&void 0!==e[a]){var n=a.split("_"),s=n[0],o=eZ[s];o||(G.info("Data key word `"+n[0]+"` not expected in "+a),o=s+"_"),n.splice(1).forEach(function(e){"url"===e&&(r=!0),eX[e]?o+=eX[e]:Number.isInteger(Number(e))?o+=e:(G.info("Data key word `"+e+"` not expected in "+a),o+="_"+e+"_")}),r?i[o]=e[a]:t[o]=e[a]}}),Object.assign(t,i)}var e1=p(v()),e2=p(x()),e3={maxBeaconSize:300,maxQueueLength:3600,baseTimeBetweenBeacons:1e4,maxPayloadKBSize:500},e4=["hb","requestcompleted","requestfailed","requestcanceled"],e5=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this._beaconUrl=e||"https://img.litix.io",this._eventQueue=[],this._postInFlight=!1,this._resendAfterPost=!1,this._failureCount=0,this._sendTimeout=!1,this._options=Object.assign({},e3,t)};e5.prototype.queueEvent=function(e,t){var i=Object.assign({},t);return(this._eventQueue.length<=this._options.maxQueueLength||"eventrateexceeded"===e)&&(this._eventQueue.push(i),this._sendTimeout||this._startBeaconSending(),this._eventQueue.length<=this._options.maxQueueLength)},e5.prototype.flushEvents=function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];e&&1===this._eventQueue.length?this._eventQueue.pop():(this._eventQueue.length&&this._sendBeaconQueue(),this._startBeaconSending())},e5.prototype.destroy=function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];this.destroyed=!0,e?this._clearBeaconQueue():this.flushEvents(),e1.default.clearTimeout(this._sendTimeout)},e5.prototype._clearBeaconQueue=function(){var e=this._eventQueue.length>this._options.maxBeaconSize?this._eventQueue.length-this._options.maxBeaconSize:0,t=this._eventQueue.slice(e);e>0&&Object.assign(t[t.length-1],e0({mux_view_message:"event queue truncated"}));var i=this._createPayload(t);e8(this._beaconUrl,i,!0,function(){})},e5.prototype._sendBeaconQueue=function(){var e=this;if(this._postInFlight){this._resendAfterPost=!0;return}var t=this._eventQueue.slice(0,this._options.maxBeaconSize);this._eventQueue=this._eventQueue.slice(this._options.maxBeaconSize),this._postInFlight=!0;var i=this._createPayload(t),a=W();e8(this._beaconUrl,i,!1,function(i,r){r?(e._eventQueue=t.concat(e._eventQueue),e._failureCount+=1,G.info("Error sending beacon: "+r)):e._failureCount=0,e._roundTripTime=W()-a,e._postInFlight=!1,e._resendAfterPost&&(e._resendAfterPost=!1,e._eventQueue.length>0&&e._sendBeaconQueue())})},e5.prototype._getNextBeaconTime=function(){if(!this._failureCount)return this._options.baseTimeBetweenBeacons;var e=Math.pow(2,this._failureCount-1);return(1+(e*=Math.random()))*this._options.baseTimeBetweenBeacons},e5.prototype._startBeaconSending=function(){var e=this;e1.default.clearTimeout(this._sendTimeout),this.destroyed||(this._sendTimeout=e1.default.setTimeout(function(){e._eventQueue.length&&e._sendBeaconQueue(),e._startBeaconSending()},this._getNextBeaconTime()))},e5.prototype._createPayload=function(e){var t=this,i={transmission_timestamp:Math.round(W())};this._roundTripTime&&(i.rtt_ms=Math.round(this._roundTripTime));var a,r,n,s=function(){n=(a=JSON.stringify({metadata:i,events:r||e})).length/1024},o=function(){return n<=t._options.maxPayloadKBSize};return s(),o()||(G.info("Payload size is too big ("+n+" kb). Removing unnecessary events."),r=e.filter(function(e){return -1===e4.indexOf(e.e)}),s()),o()||(G.info("Payload size still too big ("+n+" kb). Cropping fields.."),r.forEach(function(e){for(var t in e){var i=e[t];"string"==typeof i&&i.length>51200&&(e[t]=i.substring(0,51200))}}),s()),a};var e9="function"==typeof e2.default.exitPictureInPicture?function(e){return e.length<=57344}:function(e){return!1},e8=function(e,t,i,a){if(i&&navigator&&navigator.sendBeacon&&navigator.sendBeacon(e,t))return void a();if(e1.default.fetch)return void e1.default.fetch(e,{method:"POST",body:t,headers:{"Content-Type":"text/plain"},keepalive:e9(t)}).then(function(e){return a(null,e.ok?null:"Error")}).catch(function(e){return a(null,e)});if(e1.default.XMLHttpRequest){var r=new e1.default.XMLHttpRequest;r.onreadystatechange=function(){if(4===r.readyState)return a(null,200!==r.status?"error":void 0)},r.open("POST",e),r.setRequestHeader("Content-Type","text/plain"),r.send(t);return}a()},e6=["env_key","view_id","view_sequence_number","player_sequence_number","beacon_domain","player_playhead_time","viewer_time","mux_api_version","event","video_id","player_instance_id","player_error_code","player_error_message","player_error_context","player_error_severity","player_error_business_exception","view_playing_time_ms_cumulative","ad_playing_time_ms_cumulative"],e7=["adplay","adplaying","adpause","adfirstquartile","admidpoint","adthirdquartile","adended","adresponse","adrequest"],te=["ad_id","ad_creative_id","ad_universal_id"],tt=["viewstart","error","ended","viewend"],ti=function(){function e(t,i){var a,r,n,s,o,l,d,u,c,h,m,p,v,b,g,f,E,y,T,A=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};z(this,e),J(this,"mux",void 0),J(this,"envKey",void 0),J(this,"options",void 0),J(this,"eventQueue",void 0),J(this,"sampleRate",void 0),J(this,"disableCookies",void 0),J(this,"respectDoNotTrack",void 0),J(this,"previousBeaconData",void 0),J(this,"lastEventTime",void 0),J(this,"rateLimited",void 0),J(this,"pageLevelData",void 0),J(this,"viewerData",void 0),this.mux=t,this.envKey=i,this.options=A,this.previousBeaconData=null,this.lastEventTime=0,this.rateLimited=!1,this.eventQueue=new e5((a=this.envKey,n=(r=this.options).beaconCollectionDomain,s=r.beaconDomain,n?(/localhost(?::\d+)?$/.test(n)?"http://":"https://")+n:(a=a||"inferred").match(/^[a-z0-9]+$/)?"https://"+a+"."+(s||"litix.io"):"https://img.litix.io/a.gif")),this.sampleRate=null!=(E=this.options.sampleRate)?E:1,this.disableCookies=null!=(y=this.options.disableCookies)&&y,this.respectDoNotTrack=null!=(T=this.options.respectDoNotTrack)&&T,this.previousBeaconData=null,this.lastEventTime=0,this.rateLimited=!1,this.pageLevelData={mux_api_version:this.mux.API_VERSION,mux_embed:this.mux.NAME,mux_embed_version:this.mux.VERSION,viewer_application_name:null==(o=this.options.platform)?void 0:o.name,viewer_application_version:null==(l=this.options.platform)?void 0:l.version,viewer_application_engine:null==(d=this.options.platform)?void 0:d.layout,viewer_device_name:null==(u=this.options.platform)?void 0:u.product,viewer_device_category:"",viewer_device_manufacturer:null==(c=this.options.platform)?void 0:c.manufacturer,viewer_os_family:null==(m=this.options.platform)||null==(h=m.os)?void 0:h.family,viewer_os_architecture:null==(v=this.options.platform)||null==(p=v.os)?void 0:p.architecture,viewer_os_version:null==(g=this.options.platform)||null==(b=g.os)?void 0:b.version,page_url:null===eF.default||void 0===eF.default||null==(f=eF.default.location)?void 0:f.href},this.viewerData=this.disableCookies?{}:eQ()}return X(e,[{key:"send",value:function(e,t){if(!(!e||!(null!=t&&t.view_id))){if(this.respectDoNotTrack&&Y())return G.info("Not sending `"+e+"` because Do Not Track is enabled");if(!t||"object"!=typeof t)return G.error("A data object was expected in send() but was not provided");var i=this.disableCookies?{}:ez(),a=ec(eu({},this.pageLevelData,t,i,this.viewerData),{event:e,env_key:this.envKey});a.user_id&&(a.viewer_user_id=a.user_id,delete a.user_id);var r,n=(null!=(r=a.mux_sample_number)?r:0)>=this.sampleRate,s=e0(this._deduplicateBeaconData(e,a));if(this.lastEventTime=this.mux.utils.now(),n)return G.info("Not sending event due to sample rate restriction",e,a,s);if(this.envKey||G.info("Missing environment key (envKey) - beacons will be dropped if the video source is not a valid mux video URL",e,a,s),!this.rateLimited)if(G.info("Sending event",e,a,s),this.rateLimited=!this.eventQueue.queueEvent(e,s),this.mux.WINDOW_UNLOADING&&"viewend"===e)this.eventQueue.destroy(!0);else{if(this.mux.WINDOW_HIDDEN&&"hb"===e)this.eventQueue.flushEvents(!0);else if(tt.indexOf(e)>=0){if("error"===e&&"warning"===t.player_error_severity)return;this.eventQueue.flushEvents()}if(this.rateLimited)return a.event="eventrateexceeded",s=e0(a),this.eventQueue.queueEvent(a.event,s),G.error("Beaconing disabled due to rate limit.")}}}},{key:"destroy",value:function(){this.eventQueue.destroy(!1)}},{key:"_deduplicateBeaconData",value:function(e,t){var i=this,a={},r=t.view_id;if("-1"===r||"viewstart"===e||"viewend"===e||!this.previousBeaconData||this.mux.utils.now()-this.lastEventTime>=6e5)a=eu({},t),r&&(this.previousBeaconData=a),r&&"viewend"===e&&(this.previousBeaconData=null);else{var n=0===e.indexOf("request");Object.entries(t).forEach(function(t){var r=O(t,2),s=r[0],o=r[1];i.previousBeaconData&&(o!==i.previousBeaconData[s]||e6.indexOf(s)>-1||i.objectHasChanged(n,s,o,i.previousBeaconData[s])||i.eventRequiresKey(e,s))&&(a[s]=o,i.previousBeaconData[s]=o)})}return a}},{key:"objectHasChanged",value:function(e,t,i,a){return!!e&&0===t.indexOf("request_")&&("request_response_headers"===t||"object"!=typeof i||"object"!=typeof a||Object.keys(i||{}).length!==Object.keys(a||{}).length)}},{key:"eventRequiresKey",value:function(e,t){return!!("renditionchange"===e&&0===t.indexOf("video_source_")||te.includes(t)&&e7.includes(e)||"playbackmodechange"===e&&0===t.indexOf("player_playback_mode"))}}]),e}(),ta=function e(t){z(this,e);var i=0,a=0,r=0,n=0,s=0,o=0,l=0;t.on("requestcompleted",function(e,o){var l,d,u=o.request_start,c=o.request_response_start,h=o.request_response_end,m=o.request_bytes_loaded;if(n++,c?(l=c-(null!=u?u:0),d=(null!=h?h:0)-c):d=(null!=h?h:0)-(null!=u?u:0),d>0&&m&&m>0){var p=m/d*8e3;s++,a+=m,r+=d,t.data.view_min_request_throughput=Math.min(t.data.view_min_request_throughput||1/0,p),t.data.view_average_request_throughput=a/r*8e3,t.data.view_request_count=n,l>0&&(i+=l,t.data.view_max_request_latency=Math.max(t.data.view_max_request_latency||0,l),t.data.view_average_request_latency=i/s)}}),t.on("requestfailed",function(e,i){n++,o++,t.data.view_request_count=n,t.data.view_request_failed_count=o}),t.on("requestcanceled",function(e,i){n++,l++,t.data.view_request_count=n,t.data.view_request_canceled_count=l})},tr=function e(t){var i=this;z(this,e),J(this,"_lastEventTime",void 0),t.on("before*",function(e,a){var r=a.viewer_time,n=W(),s=i._lastEventTime;if(i._lastEventTime=n,s&&n-s>36e5){var o=Object.keys(t.data).reduce(function(e,i){return 0===i.indexOf("video_")?Object.assign(e,J({},i,t.data[i])):e},{});t.mux.log.info("Received event after at least an hour inactivity, creating a new view");var l=t.playbackHeartbeat._playheadShouldBeProgressing;t._resetView(Object.assign({viewer_time:r},o)),t.playbackHeartbeat._playheadShouldBeProgressing=l,t.playbackHeartbeat._playheadShouldBeProgressing&&"play"!==e.type&&"adbreakstart"!==e.type&&(t.emit("play",{viewer_time:r}),"playing"!==e.type&&t.emit("playing",{viewer_time:r}))}})};function tn(e,t){return(null==e?void 0:e.toLowerCase())===(null==t?void 0:t.toLowerCase())}var ts=function e(t){z(this,e);var i=function(e){var i,a,r,o=null!=(i=e)&&i.request_type&&("media"===i.request_type||"video"===i.request_type)&&null!=(a=i.request_response_headers)&&a["x-cdn"]?i.request_response_headers["x-cdn"]:null!=i&&i.video_cdn?i.video_cdn:null,l=null!=(r=e)&&r.request_start?r.request_start:null!=r&&r.viewer_time?r.viewer_time:Date.now();null!=o&&!tn(o,n)&&s<=l&&(n=o,s=l,t.emit("cdnchange",{video_cdn:o}))},a=null,r=null,n=null,s=0;t.on("viewinit",function(){a=null,r=null,n=null,s=0}),t.on("beforecdnchange",function(e,t){var i=null==t?void 0:t.video_cdn;i&&(void 0===t.video_previous_cdn||null===t.video_previous_cdn)&&(tn(i,r)?t.video_previous_cdn=null!=a?a:void 0:(t.video_previous_cdn=null!=r?r:void 0,a=r,r=i))}),t.on("requestcompleted",function(e,t){i(t)})},to=function(e){try{return JSON.parse(e),!0}catch(e){return!1}},tl=function e(t){var i=this;z(this,e),J(this,"_emittingAutomaticEvent",!1),J(this,"_hasInitialized",!1),J(this,"_currentMode","standard"),t.on("viewstart",function(){i._hasInitialized||(i._hasInitialized=!0,i._currentMode=t.data.player_playback_mode||"standard",i._emittingAutomaticEvent=!0,t.emit("playbackmodechange",{player_playback_mode:i._currentMode,player_playback_mode_data:"{}"}),i._emittingAutomaticEvent=!1)}),t.on("viewend",function(){i._hasInitialized=!1}),t.on("playbackmodechange",function(e,a){i._emittingAutomaticEvent||(a.player_playback_mode_data?to(a.player_playback_mode_data)||(t.mux.log.warn("Invalid JSON string for player_playback_mode_data"),a.player_playback_mode_data="{}"):a.player_playback_mode_data="{}",t.data.player_playback_mode_data=a.player_playback_mode_data,t.data.player_playback_mode=a.player_playback_mode,i._currentMode=a.player_playback_mode)})},td=function(){function e(t){z(this,e),J(this,"pm",void 0),J(this,"_currentRangeStart",void 0),J(this,"_lastPlayheadTime",void 0),this.pm=t,this._currentRangeStart=null,this._lastPlayheadTime=null,t.on("playbackheartbeat",this._updatePlaybackRange.bind(this)),t.on("playbackheartbeatend",this._endPlaybackRange.bind(this))}return X(e,[{key:"_updateLastRangeEnd",value:function(){var e=this.pm.data.video_playback_ranges;if(e&&e.length>0){var t=this.pm.data.player_playhead_time||0;e[e.length-1][1]=t}}},{key:"_updatePlaybackRange",value:function(){var e,t=this.pm.data.player_playhead_time||0;if(!(!this.pm.disableAdPlaybackRangeFiltering&&null!=(e=this.pm.adTracker)&&e.isAdBreak&&null!==this._lastPlayheadTime&&t<this._lastPlayheadTime)){if(null!==this._lastPlayheadTime&&null!==this._currentRangeStart&&Math.abs(t-this._lastPlayheadTime)>1e3){var i=this.pm.data.video_playback_ranges;i&&i.length>0&&(i[i.length-1][1]=this._lastPlayheadTime),this._currentRangeStart=null}if(null===this._currentRangeStart){var a=this.pm.data.video_playback_ranges||[];a.length>0&&a[a.length-1][1]===t?this._currentRangeStart=a[a.length-1][0]:(this._currentRangeStart=t,a.push([t,t])),this.pm.data.video_playback_ranges=a}else this._updateLastRangeEnd();this._lastPlayheadTime=t}}},{key:"_endPlaybackRange",value:function(){null!==this._currentRangeStart&&(this._updateLastRangeEnd(),this._currentRangeStart=null,this._lastPlayheadTime=null)}}]),e}(),tu=Object.freeze({CELLULAR:"cellular",WIFI:"wifi",WIRED:"wired",OTHER:"other",NO_CONNECTION:"no_connection",UNKNOWN:"unknown"}),tc=function(e){if(!e)return tu.UNKNOWN;switch(e){case"cellular":case"wimax":return tu.CELLULAR;case"wifi":return tu.WIFI;case"ethernet":return tu.WIRED;case"none":return tu.NO_CONNECTION;case"bluetooth":case"other":default:return tu.OTHER;case"unknown":return tu.UNKNOWN}},th=p(v()),tm=function(){function e(t){var i=this;z(this,e),J(this,"pm",void 0),J(this,"lastType",void 0),J(this,"lastLowDataMode",void 0),this.pm=t,this.pm.one("viewinit",function(){var t,a=i.emit.bind(i);a(),th.default.addEventListener("online",a),th.default.addEventListener("offline",a),null==(t=e.connection)||t.addEventListener("change",a),i.pm.on("destroy",function(){var t;null==(t=e.connection)||t.removeEventListener("change",a),th.default.removeEventListener("online",a),th.default.removeEventListener("offline",a)})})}return X(e,[{key:"type",get:function(){var t,i;return(null==(t=th.default.navigator)?void 0:t.onLine)===!1?tu.NO_CONNECTION:null!=(i=e.connection)&&i.type?tc(e.connection.type):tu.UNKNOWN}},{key:"lowDataMode",get:function(){var t;return null==(t=e.connection)?void 0:t.saveData}},{key:"emit",value:function(){var e=this.type,t=this.lowDataMode;e===this.lastType&&t===this.lastLowDataMode||(this.lastType=e,this.lastLowDataMode=t,this.pm.emit("networkchange",eu({viewer_connection_type:e},void 0!==t&&{viewer_connection_low_data_mode:t})))}}],[{key:"connection",get:function(){var e;return"object"==typeof(e=th.default.navigator)&&"connection"in e&&"object"==typeof e.connection?th.default.navigator.connection:null}}]),e}(),tp=["viewstart","ended","loadstart","pause","play","playing","ratechange","waiting","adplay","adpause","adended","aderror","adplaying","adrequest","adresponse","adbreakstart","adbreakend","adfirstquartile","admidpoint","adthirdquartile","rebufferstart","rebufferend","seeked","error","hb","requestcompleted","requestfailed","requestcanceled","renditionchange","networkchange","cdnchange","playbackmodechange"],tv=new Set(["requestcompleted","requestfailed","requestcanceled"]),tb=function(e){if("function"!=typeof e&&null!==e)throw TypeError("Super expression must either be null or a function");a.prototype=Object.create(e&&e.prototype,{constructor:{value:a,writable:!0,configurable:!0}}),e&&ei(a,e);var t,i=(t=function(){if("u"<typeof Reflect||!Reflect.construct||Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(e){return!1}}(),function(){var e,i=ee(a);return e=t?Reflect.construct(i,arguments,ee(this).constructor):i.apply(this,arguments),e&&("object"===f(e)||"function"==typeof e)?e:Q(this)});function a(e,t,r){z(this,a),J(Q(n=i.call(this)),"pageLoadEndTime",void 0),J(Q(n),"pageLoadInitTime",void 0),J(Q(n),"_destroyed",void 0),J(Q(n),"_heartBeatTimeout",void 0),J(Q(n),"adTracker",void 0),J(Q(n),"dashjs",void 0),J(Q(n),"data",void 0),J(Q(n),"disablePlayheadRebufferTracking",void 0),J(Q(n),"disableRebufferTracking",void 0),J(Q(n),"disableAdPlaybackRangeFiltering",void 0),J(Q(n),"errorTracker",void 0),J(Q(n),"errorTranslator",void 0),J(Q(n),"emitTranslator",void 0),J(Q(n),"getAdData",void 0),J(Q(n),"getPlayheadTime",void 0),J(Q(n),"getStateData",void 0),J(Q(n),"stateDataTranslator",void 0),J(Q(n),"hlsjs",void 0),J(Q(n),"id",void 0),J(Q(n),"longResumeTracker",void 0),J(Q(n),"minimumRebufferDuration",void 0),J(Q(n),"mux",void 0),J(Q(n),"playbackEventDispatcher",void 0),J(Q(n),"playbackHeartbeat",void 0),J(Q(n),"playbackHeartbeatTime",void 0),J(Q(n),"playheadTime",void 0),J(Q(n),"seekingTracker",void 0),J(Q(n),"sustainedRebufferThreshold",void 0),J(Q(n),"watchTimeTracker",void 0),J(Q(n),"currentFragmentPDT",void 0),J(Q(n),"currentFragmentStart",void 0),n.pageLoadInitTime=el(),n.pageLoadEndTime=eo(),n.mux=e,n.id=t,null!=r&&r.beaconDomain&&n.mux.log.warn("The `beaconDomain` setting has been deprecated in favor of `beaconCollectionDomain`. Please change your integration to use `beaconCollectionDomain` instead of `beaconDomain`."),(r=Object.assign({debug:!1,minimumRebufferDuration:250,sustainedRebufferThreshold:1e3,playbackHeartbeatTime:25,beaconDomain:"litix.io",sampleRate:1,disableCookies:!1,respectDoNotTrack:!1,disableRebufferTracking:!1,disablePlayheadRebufferTracking:!1,disableAdPlaybackRangeFiltering:!1,errorTranslator:function(e){return e},emitTranslator:function(){for(var e=arguments.length,t=Array(e),i=0;i<e;i++)t[i]=arguments[i];return t},stateDataTranslator:function(e){return e}},r)).data=r.data||{},r.data.property_key&&(r.data.env_key=r.data.property_key,delete r.data.property_key),G.level=r.debug?1:3,n.getPlayheadTime=r.getPlayheadTime,n.getStateData=r.getStateData||function(){return{}},n.getAdData=r.getAdData||function(){},n.minimumRebufferDuration=r.minimumRebufferDuration,n.sustainedRebufferThreshold=r.sustainedRebufferThreshold,n.playbackHeartbeatTime=r.playbackHeartbeatTime,n.disableRebufferTracking=r.disableRebufferTracking,n.disableRebufferTracking&&n.mux.log.warn("Disabling rebuffer tracking. This should only be used in specific circumstances as a last resort when your player is known to unreliably track rebuffering."),n.disablePlayheadRebufferTracking=r.disablePlayheadRebufferTracking,n.disableAdPlaybackRangeFiltering=r.disableAdPlaybackRangeFiltering,n.errorTranslator=r.errorTranslator,n.emitTranslator=r.emitTranslator,n.stateDataTranslator=r.stateDataTranslator,n.playbackEventDispatcher=new ti(e,r.data.env_key,r),n.data={player_instance_id:$(),mux_sample_rate:r.sampleRate,beacon_domain:r.beaconCollectionDomain||r.beaconDomain},n.data.view_sequence_number=1,n.data.player_sequence_number=1;var n,s=(function(){void 0===this.data.view_start&&(this.data.view_start=this.mux.utils.now(),this.emit("viewstart"),this.emit("renditionchange"))}).bind(Q(n));if(n.on("viewinit",function(e,t){this._resetVideoData(),this._resetViewData(),this._resetErrorData(),this._updateStateData(),Object.assign(this.data,t),this._initializeViewData(),this.one("play",s),this.one("adbreakstart",s)}),n.on("videochange",function(e,t){this._resetView(t)}),n.on("programchange",function(e,t){this.data.player_is_paused&&this.mux.log.warn("The `programchange` event is intended to be used when the content changes mid playback without the video source changing, however the video is not currently playing. If the video source is changing please use the videochange event otherwise you will lose startup time information."),this._resetView(Object.assign(t,{view_program_changed:!0})),s(),this.emit("play"),this.emit("playing")}),n.on("fragmentchange",function(e,t){this.currentFragmentPDT=t.currentFragmentPDT,this.currentFragmentStart=t.currentFragmentStart}),n.on("destroy",n.destroy),"u">typeof window&&"function"==typeof window.addEventListener&&"function"==typeof window.removeEventListener){var o=function(){var e=void 0!==n.data.view_start;n.mux.WINDOW_HIDDEN="hidden"===document.visibilityState,e&&n.mux.WINDOW_HIDDEN&&(n.data.player_is_paused||n.emit("hb"))};window.addEventListener("visibilitychange",o,!1);var l=function(e){e.persisted||n.destroy()};window.addEventListener("pagehide",l,!1),n.on("destroy",function(){window.removeEventListener("visibilitychange",o),window.removeEventListener("pagehide",l)})}return n.on("playerready",function(e,t){Object.assign(this.data,t)}),tp.forEach(function(e){n.on(e,function(t,i){0!==e.indexOf("ad")&&this._updateStateData(),Object.assign(this.data,i),this._sanitizeData()}),n.on("after"+e,function(){("error"!==e||this.errorTracker.viewErrored)&&this.send(e)})}),n.on("viewend",function(e,t){Object.assign(n.data,t)}),n.one("playerready",function(e){var t=this.mux.utils.now();this.data.player_init_time&&(this.data.player_startup_time=t-this.data.player_init_time),this.pageLoadInitTime=this.data.page_load_init_time||this.pageLoadInitTime,this.pageLoadEndTime=this.data.page_load_end_time||this.pageLoadEndTime,!this.mux.PLAYER_TRACKED&&this.pageLoadInitTime&&(this.mux.PLAYER_TRACKED=!0,(this.data.player_init_time||this.pageLoadEndTime)&&(this.data.page_load_time=Math.min(this.data.player_init_time||1/0,this.pageLoadEndTime||1/0)-this.pageLoadInitTime)),this.send("playerready"),delete this.data.player_startup_time,delete this.data.page_load_time}),n.longResumeTracker=new tr(Q(n)),n.errorTracker=new eM(Q(n)),new eV(Q(n)),n.seekingTracker=new eH(Q(n)),n.playheadTime=new eP(Q(n)),n.playbackHeartbeat=new eL(Q(n)),new eB(Q(n)),n.watchTimeTracker=new eD(Q(n)),new ex(Q(n)),new td(Q(n)),n.adTracker=new eq(Q(n)),new eO(Q(n)),new eN(Q(n)),new eU(Q(n)),new ta(Q(n)),new ts(Q(n)),new tl(Q(n)),new tm(Q(n)),r.hlsjs&&n.addHLSJS(r),r.dashjs&&n.addDashJS(r),n.emit("viewinit",r.data),n}return X(a,[{key:"emit",value:function(e,t){var i,r=Object.assign({viewer_time:this.mux.utils.now()},t),n=[e,r];if(this.emitTranslator)try{n=this.emitTranslator(e,r)}catch(e){this.mux.log.warn("Exception in emit translator callback.",e)}null!=n&&n.length&&(i=et(ee(a.prototype),"emit",this)).call.apply(i,[this].concat(K(n)))}},{key:"destroy",value:function(){this._destroyed||(this._destroyed=!0,void 0!==this.data.view_start&&(this.emit("viewend"),this.send("viewend")),this.playbackEventDispatcher.destroy(),this.removeHLSJS(),this.removeDashJS(),window.clearTimeout(this._heartBeatTimeout))}},{key:"send",value:function(e){if(this.data.view_id){var t=Object.assign({},this.data);if(void 0===t.video_source_is_live&&(t.player_source_duration===1/0||t.video_source_duration===1/0?t.video_source_is_live=!0:(t.player_source_duration>0||t.video_source_duration>0)&&(t.video_source_is_live=!1)),t.video_source_is_live||["player_program_time","player_manifest_newest_program_time","player_live_edge_program_time","player_program_time","video_holdback","video_part_holdback","video_target_duration","video_part_target_duration"].forEach(function(e){t[e]=void 0}),t.video_source_url=t.video_source_url||t.player_source_url,t.video_source_url){var i=O(er(t.video_source_url),2),a=i[0];t.video_source_domain=i[1],t.video_source_hostname=a}delete t.ad_request_id,t.video_playback_ranges&&(t.video_playback_range=JSON.stringify(t.video_playback_ranges.filter(function(e){return e[0]!==e[1]}).map(function(e){return"".concat(e[0],":").concat(e[1])})),delete t.video_playback_ranges),this.playbackEventDispatcher.send(e,t),this.data.view_sequence_number++,this.data.player_sequence_number++,tv.has(e)||this._restartHeartBeat(),"viewend"===e&&delete this.data.view_id}}},{key:"_resetView",value:function(e){this.emit("viewend"),this.send("viewend"),this.emit("viewinit",e)}},{key:"_updateStateData",value:function(){var e,t=this.getStateData();if("function"==typeof this.stateDataTranslator)try{t=this.stateDataTranslator(t)}catch(e){this.mux.log.warn("Exception in stateDataTranslator translator callback.",e)}null!=(e=this.data)&&e.video_cdn&&null!=t&&t.video_cdn&&(t.video_cdn,t=function(e,t){if(null==e)return{};var i,a,r=function(e,t){if(null==e)return{};var i,a,r={},n=Object.keys(e);for(a=0;a<n.length;a++)i=n[a],t.indexOf(i)>=0||(r[i]=e[i]);return r}(e,t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(a=0;a<n.length;a++)i=n[a],!(t.indexOf(i)>=0)&&Object.prototype.propertyIsEnumerable.call(e,i)&&(r[i]=e[i])}return r}(t,["video_cdn"])),Object.assign(this.data,t),this.playheadTime._updatePlayheadTime(),this._sanitizeData()}},{key:"_sanitizeData",value:function(){var e=this;["player_width","player_height","video_source_width","video_source_height","player_playhead_time","video_source_bitrate"].forEach(function(t){var i=parseInt(e.data[t],10);e.data[t]=isNaN(i)?void 0:i}),["player_source_url","video_source_url"].forEach(function(t){if(e.data[t]){var i=e.data[t].toLowerCase();(0===i.indexOf("data:")||0===i.indexOf("blob:"))&&(e.data[t]="MSE style URL")}})}},{key:"_resetVideoData",value:function(){var e=this;Object.keys(this.data).forEach(function(t){0===t.indexOf("video_")&&delete e.data[t]})}},{key:"_resetViewData",value:function(){var e=this;Object.keys(this.data).forEach(function(t){0===t.indexOf("view_")&&delete e.data[t]}),this.data.view_sequence_number=1}},{key:"_resetErrorData",value:function(){delete this.data.player_error_code,delete this.data.player_error_message,delete this.data.player_error_context,delete this.data.player_error_severity,delete this.data.player_error_business_exception}},{key:"_initializeViewData",value:function(){var e=this,t=this.data.view_id=$(),i=function(){t===e.data.view_id&&ed(e.data,"player_view_count",1)};this.data.player_is_paused?this.one("play",i):i()}},{key:"_restartHeartBeat",value:function(){var e=this;window.clearTimeout(this._heartBeatTimeout),this._heartBeatTimeout=window.setTimeout(function(){e.data.player_is_paused||e.emit("hb")},1e4)}},{key:"addHLSJS",value:function(e){e.hlsjs?this.hlsjs?this.mux.log.warn("An instance of HLS.js is already being monitored for this player."):(this.hlsjs=e.hlsjs,eE(this.mux,this.id,e.hlsjs,{},e.Hls||window.Hls)):this.mux.log.warn("You must pass a valid hlsjs instance in order to track it.")}},{key:"removeHLSJS",value:function(){this.hlsjs&&(ey(this.hlsjs),this.hlsjs=void 0)}},{key:"addDashJS",value:function(e){e.dashjs?this.dashjs?this.mux.log.warn("An instance of Dash.js is already being monitored for this player."):(this.dashjs=e.dashjs,ew(this.mux,this.id,e.dashjs)):this.mux.log.warn("You must pass a valid dashjs instance in order to track it.")}},{key:"removeDashJS",value:function(){this.dashjs&&(eS(this.dashjs),this.dashjs=void 0)}}]),a}(eR),tg=p(x());function tf(){return tg.default&&!!(tg.default.fullscreenElement||tg.default.webkitFullscreenElement||tg.default.mozFullScreenElement||tg.default.msFullscreenElement)}var tE,ty,t_=["loadstart","pause","play","playing","seeking","seeked","timeupdate","ratechange","stalled","waiting","error","ended"],tT={1:"MEDIA_ERR_ABORTED",2:"MEDIA_ERR_NETWORK",3:"MEDIA_ERR_DECODE",4:"MEDIA_ERR_SRC_NOT_SUPPORTED"},tA=p(v());tA.default&&tA.default.WeakMap&&(ty=new WeakMap);var tk=function(e){return this.buffer="",this.manifest={segments:[],serverControl:{},sessionData:{}},this.currentUri={},this.process(e),this.manifest};tk.prototype.process=function(e){var t;for(this.buffer+=e,t=this.buffer.indexOf("\n");t>-1;t=this.buffer.indexOf("\n"))this.processLine(this.buffer.substring(0,t)),this.buffer=this.buffer.substring(t+1)},tk.prototype.processLine=function(e){var t=e.indexOf(":"),i=tM(e,t),a=i[0],r=2===i.length?tI(i[1]):void 0;if("#"!==a[0])this.currentUri.uri=a,this.manifest.segments.push(this.currentUri),!this.manifest.targetDuration||"duration"in this.currentUri||(this.currentUri.duration=this.manifest.targetDuration),this.currentUri={};else switch(a){case"#EXT-X-TARGETDURATION":if(!isFinite(r)||r<0)return;this.manifest.targetDuration=r,this.setHoldBack();break;case"#EXT-X-PART-INF":tw(this.manifest,i),this.manifest.partInf.partTarget&&(this.manifest.partTargetDuration=this.manifest.partInf.partTarget),this.setHoldBack();break;case"#EXT-X-SERVER-CONTROL":tw(this.manifest,i),this.setHoldBack();break;case"#EXTINF":0===r?this.currentUri.duration=.01:r>0&&(this.currentUri.duration=r);break;case"#EXT-X-PROGRAM-DATE-TIME":var n=new Date(r);this.manifest.dateTimeString||(this.manifest.dateTimeString=r,this.manifest.dateTimeObject=n),this.currentUri.dateTimeString=r,this.currentUri.dateTimeObject=n;break;case"#EXT-X-VERSION":tw(this.manifest,i);break;case"#EXT-X-SESSION-DATA":var s=eb(tD(i[1]));Object.assign(this.manifest.sessionData,s)}},tk.prototype.setHoldBack=function(){var e=this.manifest,t=e.serverControl,i=e.targetDuration,a=e.partTargetDuration;if(t){var r="holdBack",n="partHoldBack",s=i&&3*i,o=a&&2*a;i&&!t.hasOwnProperty(r)&&(t[r]=s),s&&t[r]<s&&(t[r]=s),a&&!t.hasOwnProperty(n)&&(t[n]=3*a),a&&t[n]<o&&(t[n]=o)}};var tw=function(e,t){var i,a=tS(t[0].replace("#EXT-X-",""));tL(t[1])?(i={},i=Object.assign(tC(t[1]),i)):i=tI(t[1]),e[a]=i},tS=function(e){return e.toLowerCase().replace(/-(\w)/g,function(e){return e[1].toUpperCase()})},tI=function(e){if("yes"===e.toLowerCase()||"no"===e.toLowerCase())return"yes"===e.toLowerCase();var t=-1!==e.indexOf(":")?e:parseFloat(e);return isNaN(t)?e:t},tR=function(e){var t={},i=e.split("=");return i.length>1&&(t[tS(i[0])]=tI(i[1])),t},tC=function(e){for(var t=e.split(","),i={},a=0;t.length>a;a++)i=Object.assign(tR(t[a]),i);return i},tL=function(e){return e.indexOf("=")>-1},tM=function(e,t){return -1===t?[e]:[e.substring(0,t),e.substring(t+1)]},tD=function(e){var t={};if(e){var i=e.search(",");return[e.slice(0,i),e.slice(i+1)].forEach(function(e,i){for(var a=e.replace(/['"]+/g,"").split("="),r=0;r<a.length;r++)"DATA-ID"===a[r]&&(t["DATA-ID"]=a[1-r]),"VALUE"===a[r]&&(t.VALUE=a[1-r])}),{data:t}}},tx={safeCall:function(e,t,i,a){var r=a;if(e&&"function"==typeof e[t])try{r=e[t].apply(e,i)}catch(e){G.info("safeCall error",e)}return r},safeIncrement:ed,getComputedStyle:function(e,t){var i;return e&&t&&tA.default&&"function"==typeof tA.default.getComputedStyle?(ty&&ty.has(e)&&(i=ty.get(e)),i||(i=tA.default.getComputedStyle(e,null),ty&&ty.set(e,i)),i.getPropertyValue(t)):""},secondsToMs:function(e){return Math.floor(1e3*e)},assign:Object.assign,headersStringToObject:ep,cdnHeadersToRequestId:ev,extractHostnameAndDomain:er,extractHostname:ea,manifestParser:tk,generateShortID:q,generateUUID:$,now:W,findMediaElement:F},tP={},tN=function(e){var t=arguments;"string"==typeof e?tN.hasOwnProperty(e)?U.default.setTimeout(function(){t=Array.prototype.splice.call(t,1),tN[e].apply(null,t)},0):G.warn("`"+e+"` is an unknown task"):"function"==typeof e?U.default.setTimeout(function(){e(tN)},0):G.warn("`"+e+"` is invalid.")},tO={loaded:W(),NAME:"mux-embed",VERSION:"5.18.1",API_VERSION:"2.1",PLAYER_TRACKED:!1,monitor:function(e,t){return function(e,t,i){var a=O(F(t),3),r=a[0],n=a[1],s=a[2],o=e.log,l=e.utils.getComputedStyle,d=e.utils.secondsToMs;if(!r)return o.error("No element was found with the `"+n+"` query selector.");if("video"!==s&&"audio"!==s)return o.error("The element of `"+n+"` was not a media element.");r.mux&&(r.mux.destroy(),delete r.mux,o.warn("Already monitoring this video element, replacing existing event listeners")),(i=Object.assign({automaticErrorTracking:!0},i,{getPlayheadTime:function(){return d(r.currentTime)},getStateData:function(){var e,t,i=(null==(e=this.getPlayheadTime)?void 0:e.call(this))||d(r.currentTime),a=this.hlsjs&&this.hlsjs.url,n=this.dashjs&&"function"==typeof this.dashjs.getSource&&this.dashjs.getSource(),s={player_is_paused:r.paused,player_width:parseInt(l(r,"width")),player_height:parseInt(l(r,"height")),player_autoplay_on:r.autoplay,player_preload_on:r.preload,player_language_code:r.lang,player_is_fullscreen:tf(),video_poster_url:r.poster,video_source_url:a||n||r.currentSrc,video_source_duration:d(r.duration),video_source_height:r.videoHeight,video_source_width:r.videoWidth,view_dropped_frame_count:null==r||null==(t=r.getVideoPlaybackQuality)?void 0:t.call(r).droppedVideoFrames};if(r.getStartDate&&i>0){var o=r.getStartDate();if(o&&"function"==typeof o.getTime&&o.getTime()){var u=o.getTime();s.player_program_time=u+i,r.seekable.length>0&&(s.player_live_edge_program_time=u+r.seekable.end(r.seekable.length-1))}}return s}})).data=Object.assign({player_software:"HTML5 Video Element",player_mux_plugin_name:"VideoElementMonitor",player_mux_plugin_version:e.VERSION},i.data),r.mux=r.mux||{},r.mux.deleted=!1,r.mux.emit=function(t,i){e.emit(n,t,i)},r.mux.updateData=function(e){r.mux.emit("hb",e)};var u=function(){o.error("The monitor for this video element has already been destroyed.")};r.mux.destroy=function(){Object.keys(r.mux.listeners).forEach(function(e){r.removeEventListener(e,r.mux.listeners[e],!1)}),delete r.mux.listeners,r.mux.fullscreenChangeListener&&(document.removeEventListener("fullscreenchange",r.mux.fullscreenChangeListener,!1),delete r.mux.fullscreenChangeListener),r.mux.destroy=u,r.mux.swapElement=u,r.mux.emit=u,r.mux.addHLSJS=u,r.mux.addDashJS=u,r.mux.removeHLSJS=u,r.mux.removeDashJS=u,r.mux.updateData=u,r.mux.setEmitTranslator=u,r.mux.setStateDataTranslator=u,r.mux.setGetPlayheadTime=u,r.mux.deleted=!0,e.emit(n,"destroy")},r.mux.swapElement=function(t){var i=O(F(t),3),a=i[0],n=i[1],s=i[2];return a?"video"!==s&&"audio"!==s?e.log.error("The element of `"+n+"` was not a media element."):void(a.muxId=r.muxId,delete r.muxId,a.mux=a.mux||{},a.mux.listeners=Object.assign({},r.mux.listeners),delete r.mux.listeners,Object.keys(a.mux.listeners).forEach(function(e){r.removeEventListener(e,a.mux.listeners[e],!1),a.addEventListener(e,a.mux.listeners[e],!1)}),a.mux.fullscreenChangeListener=r.mux.fullscreenChangeListener,delete r.mux.fullscreenChangeListener,a.mux.swapElement=r.mux.swapElement,a.mux.destroy=r.mux.destroy,delete r.mux,r=a):e.log.error("No element was found with the `"+n+"` query selector.")},r.mux.addHLSJS=function(t){e.addHLSJS(n,t)},r.mux.addDashJS=function(t){e.addDashJS(n,t)},r.mux.removeHLSJS=function(){e.removeHLSJS(n)},r.mux.removeDashJS=function(){e.removeDashJS(n)},r.mux.setEmitTranslator=function(t){e.setEmitTranslator(n,t)},r.mux.setStateDataTranslator=function(t){e.setStateDataTranslator(n,t)},r.mux.setGetPlayheadTime=function(t){t||(t=i.getPlayheadTime),e.setGetPlayheadTime(n,t)},e.init(n,i),e.emit(n,"playerready"),r.paused||(e.emit(n,"play"),r.readyState>2&&e.emit(n,"playing")),r.mux.listeners={},t_.forEach(function(t){("error"!==t||i.automaticErrorTracking)&&(r.mux.listeners[t]=function(){var i={};if("error"===t){if(!r.error||1===r.error.code)return;i.player_error_code=r.error.code,i.player_error_message=tT[r.error.code]||r.error.message}e.emit(n,t,i)},r.addEventListener(t,r.mux.listeners[t],!1))}),r.mux.listeners.enterpictureinpicture=function(){e.emit(n,"playbackmodechange",{player_playback_mode:"pip",player_playback_mode_data:"{}"})},r.mux.listeners.leavepictureinpicture=function(){var t=tf()?"fullscreen":"standard";e.emit(n,"playbackmodechange",{player_playback_mode:t,player_playback_mode_data:"{}"})},r.addEventListener("enterpictureinpicture",r.mux.listeners.enterpictureinpicture,!1),r.addEventListener("leavepictureinpicture",r.mux.listeners.leavepictureinpicture,!1),r.mux.fullscreenChangeListener=function(){var t=tf(),i=document.fullscreenElement;if(t&&(i===r||null!=i&&i.contains(r)))e.emit(n,"playbackmodechange",{player_playback_mode:"fullscreen",player_playback_mode_data:"{}"});else if(!t){var a=document.pictureInPictureElement===r;e.emit(n,"playbackmodechange",{player_playback_mode:a?"pip":"standard",player_playback_mode_data:"{}"})}},document.addEventListener("fullscreenchange",r.mux.fullscreenChangeListener,!1)}(tN,e,t)},destroyMonitor:function(e){var t=O(F(e),1)[0];t&&t.mux&&"function"==typeof t.mux.destroy?t.mux.destroy():G.error("A video element monitor for `"+e+"` has not been initialized via `mux.monitor`.")},addHLSJS:function(e,t){var i=V(e);tP[i]?tP[i].addHLSJS(t):G.error("A monitor for `"+i+"` has not been initialized.")},addDashJS:function(e,t){var i=V(e);tP[i]?tP[i].addDashJS(t):G.error("A monitor for `"+i+"` has not been initialized.")},removeHLSJS:function(e){var t=V(e);tP[t]?tP[t].removeHLSJS():G.error("A monitor for `"+t+"` has not been initialized.")},removeDashJS:function(e){var t=V(e);tP[t]?tP[t].removeDashJS():G.error("A monitor for `"+t+"` has not been initialized.")},init:function(e,t){Y()&&t&&t.respectDoNotTrack&&G.info("The browser's Do Not Track flag is enabled - Mux beaconing is disabled.");var i=V(e);tP[i]=new tb(tN,i,t)},emit:function(e,t,i){var a=V(e);tP[a]?(tP[a].emit(t,i),"destroy"===t&&delete tP[a]):G.error("A monitor for `"+a+"` has not been initialized.")},updateData:function(e,t){var i=V(e);tP[i]?tP[i].emit("hb",t):G.error("A monitor for `"+i+"` has not been initialized.")},setEmitTranslator:function(e,t){var i=V(e);tP[i]?tP[i].emitTranslator=t:G.error("A monitor for `"+i+"` has not been initialized.")},setStateDataTranslator:function(e,t){var i=V(e);tP[i]?tP[i].stateDataTranslator=t:G.error("A monitor for `"+i+"` has not been initialized.")},setGetPlayheadTime:function(e,t){var i=V(e);tP[i]?tP[i].getPlayheadTime=t:G.error("A monitor for `"+i+"` has not been initialized.")},checkDoNotTrack:Y,log:G,utils:tx,events:{PLAYER_READY:"playerready",VIEW_INIT:"viewinit",VIDEO_CHANGE:"videochange",PLAY:"play",PAUSE:"pause",PLAYING:"playing",TIME_UPDATE:"timeupdate",SEEKING:"seeking",SEEKED:"seeked",REBUFFER_START:"rebufferstart",REBUFFER_END:"rebufferend",ERROR:"error",ENDED:"ended",RENDITION_CHANGE:"renditionchange",ORIENTATION_CHANGE:"orientationchange",PLAYBACK_MODE_CHANGE:"playbackmodechange",NETWORK_CHANGE:"networkchange",AD_REQUEST:"adrequest",AD_RESPONSE:"adresponse",AD_BREAK_START:"adbreakstart",AD_PLAY:"adplay",AD_PLAYING:"adplaying",AD_PAUSE:"adpause",AD_FIRST_QUARTILE:"adfirstquartile",AD_MID_POINT:"admidpoint",AD_THIRD_QUARTILE:"adthirdquartile",AD_ENDED:"adended",AD_BREAK_END:"adbreakend",AD_ERROR:"aderror",REQUEST_COMPLETED:"requestcompleted",REQUEST_FAILED:"requestfailed",REQUEST_CANCELLED:"requestcanceled",HEARTBEAT:"hb",DESTROY:"destroy"},WINDOW_HIDDEN:!1,WINDOW_UNLOADING:!1};Object.assign(tN,tO),void 0!==U.default&&"function"==typeof U.default.addEventListener&&U.default.addEventListener("pagehide",function(e){e.persisted||(tN.WINDOW_UNLOADING=!0)},!1);var tU=e.i(50471),tB=tU.default,tH="video",tW=e=>e===tH?"playback":e,t$=class e extends Error{constructor(t,i=e.MEDIA_ERR_CUSTOM,a,r){var n;super(t),this.name="MediaError",this.code=i,this.context=r,this.fatal=null!=a?a:i>=e.MEDIA_ERR_NETWORK&&i<=e.MEDIA_ERR_ENCRYPTED,this.message||(this.message=null!=(n=e.defaultMessages[this.code])?n:"")}};t$.MEDIA_ERR_ABORTED=1,t$.MEDIA_ERR_NETWORK=2,t$.MEDIA_ERR_DECODE=3,t$.MEDIA_ERR_SRC_NOT_SUPPORTED=4,t$.MEDIA_ERR_ENCRYPTED=5,t$.MEDIA_ERR_CUSTOM=100,t$.defaultMessages={1:"You aborted the media playback",2:"A network error caused the media download to fail.",3:"A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.",4:"An unsupported error occurred. The server or network failed, or your browser does not support this format.",5:"The media is encrypted and there are no keys to decrypt it."};var tq=(e,t)=>null!=t&&e in t,tV={ANY:"any",MUTED:"muted"},tF="on-demand",tK="live",tG="unknown",tj="native",tY={HEADER:"header",QUERY:"query",NONE:"none"},tQ=Object.values(tY),tz={M3U8:"application/vnd.apple.mpegurl",MP4:"video/mp4"},tZ={HLS:tz.M3U8},tX=(Object.keys(tZ),[...Object.values(tz)],{upTo720p:"720p",upTo1080p:"1080p",upTo1440p:"1440p",upTo2160p:"2160p"}),tJ={noLessThan480p:"480p",noLessThan540p:"540p",noLessThan720p:"720p",noLessThan1080p:"1080p",noLessThan1440p:"1440p",noLessThan2160p:"2160p"},t0={DESCENDING:"desc"},t1={code:"en"},t2=(e,t,i,a,r=e)=>{r.addEventListener(t,i,a),e.addEventListener("teardown",()=>{r.removeEventListener(t,i)},{once:!0})},t3=e=>{let t=e.indexOf("?");return t<0?[e]:[e.slice(0,t),e.slice(t)]},t4=e=>{let{type:t}=e;if(t){let e=t.toUpperCase();return tq(e,tZ)?tZ[e]:t}return t8(e)},t5=e=>"VOD"===e?tF:tK,t9=e=>"EVENT"===e?1/0:"VOD"===e?NaN:0,t8=e=>{let{src:t}=e;if(!t)return"";let i="";try{i=t7(t).pathname}catch{console.error("Invalid url when trying to infer mime type",t)}let a=i.lastIndexOf(".");if(a<0)return it(e)?tz.M3U8:"";let r=i.slice(a+1).toUpperCase();return tq(r,tz)?tz[r]:""},t6=e=>{try{return new URL(e),!1}catch{return!0}},t7=(e,t)=>{var i;if(!t6(e))return new URL(e);let a=null==(i=null==window?void 0:window.location)?void 0:i.href,r=null!=t?t:a;return t&&t6(t.toString())&&(r=new URL(t,a)),new URL(e,r)},ie="mux.com",it=({src:e,customDomain:t=ie})=>{let i;try{i=new URL(`${e}`)}catch{return!1}let a="https:"===i.protocol,r=i.hostname===`stream.${t}`.toLowerCase(),n=i.pathname.split("/"),s=2===n.length,o=!(null!=n&&n[1].includes("."));return a&&r&&s&&o},ii=e=>{let t=(null!=e?e:"").split(".")[1];if(t)try{let e=t.replace(/-/g,"+").replace(/_/g,"/"),i=decodeURIComponent(atob(e).split("").map(function(e){return"%"+("00"+e.charCodeAt(0).toString(16)).slice(-2)}).join(""));return JSON.parse(i)}catch{return}};function ia(e,t=!0){var i;return new ir(t&&null!=(i=null==t1?void 0:t1[e])?i:e,t?t1.code:"en")}var ir=class{constructor(e,t=(e=>null!=(e=t1)?e:"en")()){this.message=e,this.locale=t}format(e){return this.message.replace(/\{(\w+)\}/g,(t,i)=>{var a;return null!=(a=e[i])?a:""})}toString(){return this.message}},is=Object.values(tV),io=e=>"boolean"==typeof e||"string"==typeof e&&is.includes(e),il=(e,t)=>{if(!t)return;let i=e.muted,a=()=>e.muted=i;switch(t){case tV.ANY:e.play().catch(()=>{e.muted=!0,e.play().catch(a)});break;case tV.MUTED:e.muted=!0,e.play().catch(a);break;default:e.play().catch(()=>{})}},id=e=>"time"in e?e.time:e.startTime;function iu(e,t,i,a,r,n){let s=document.createElement("track");return s.kind=t,s.label=i,a&&(s.srclang=a),r&&(s.id=r),n&&(s.default=!0),s.track.mode=["subtitles","captions"].includes(t)?"disabled":"hidden",s.setAttribute("data-removeondestroy",""),e.append(s),s.track}function ic(e,t,i){var a;return null==(a=Array.from(e.querySelectorAll("track")).find(e=>e.track.label===t&&e.track.kind===i))?void 0:a.track}async function ih(e,t,i,a){let r=ic(e,i,a);return r||((r=iu(e,a,i)).mode="hidden",await new Promise(e=>setTimeout(()=>e(void 0),0))),"hidden"!==r.mode&&(r.mode="hidden"),[...t].sort((e,t)=>id(t)-id(e)).forEach(t=>{var i,n;let s=t.value,o=id(t);if("endTime"in t&&null!=t.endTime)null==r||r.addCue(new VTTCue(o,t.endTime,"chapters"===a?s:JSON.stringify(null!=s?s:null)));else{let t=Array.prototype.findIndex.call(null==r?void 0:r.cues,e=>e.startTime>=o),l=null==(i=null==r?void 0:r.cues)?void 0:i[t],d=l?l.startTime:Number.isFinite(e.duration)?e.duration:Number.MAX_SAFE_INTEGER,u=null==(n=null==r?void 0:r.cues)?void 0:n[t-1];u&&(u.endTime=o),null==r||r.addCue(new VTTCue(o,d,"chapters"===a?s:JSON.stringify(null!=s?s:null)))}}),e.textTracks.dispatchEvent(new Event("change",{bubbles:!0,composed:!0})),r}var im="cuepoints",ip=Object.freeze({label:im});async function iv(e,t,i=ip){return ih(e,t,i.label,"metadata")}var ib=e=>({time:e.startTime,value:JSON.parse(e.text)});function ig(e,t={label:im}){var i,a;let r=ic(e,t.label,"metadata");if(!(null!=(i=null==r?void 0:r.activeCues)&&i.length))return;if(1===r.activeCues.length)return ib(r.activeCues[0]);let{currentTime:n}=e;return ib(Array.prototype.find.call(null!=(a=r.activeCues)?a:[],({startTime:e,endTime:t})=>e<=n&&t>n)||r.activeCues[0])}async function iE(e,t=ip){return new Promise(i=>{t2(e,"loadstart",async()=>{let a=await iv(e,[],t);t2(e,"cuechange",()=>{let t=ig(e);if(t){let i=new CustomEvent("cuepointchange",{composed:!0,bubbles:!0,detail:t});e.dispatchEvent(i)}},{},a),i(a)})})}var iy="chapters",i_=Object.freeze({label:iy}),iT=e=>({startTime:e.startTime,endTime:e.endTime,value:e.text});async function iA(e,t,i=i_){return ih(e,t,i.label,"chapters")}function ik(e,t={label:iy}){var i,a;let r=ic(e,t.label,"chapters");if(!(null!=(i=null==r?void 0:r.activeCues)&&i.length))return;if(1===r.activeCues.length)return iT(r.activeCues[0]);let{currentTime:n}=e;return iT(Array.prototype.find.call(null!=(a=r.activeCues)?a:[],({startTime:e,endTime:t})=>e<=n&&t>n)||r.activeCues[0])}async function iw(e,t=i_){return new Promise(i=>{t2(e,"loadstart",async()=>{let a=await iA(e,[],t);t2(e,"cuechange",()=>{let t=ik(e);if(t){let i=new CustomEvent("chapterchange",{composed:!0,bubbles:!0,detail:t});e.dispatchEvent(i)}},{},a),i(a)})})}var iS=(e,t,i,a,r=!1,n=!(e=>null==(e=globalThis.navigator)?void 0:e.onLine)())=>{var s,o,l,d;let u,c;if(n){let i=ia("Your device appears to be offline",r),a=t$.MEDIA_ERR_NETWORK,n=new t$(i,a,!1,void 0);return n.errorCategory=t,n.muxCode=2000002,n.data=e,n}let h="status"in e?e.status:e.code,m=Date.now(),p=t$.MEDIA_ERR_NETWORK;if(200===h)return;let v=tW(t),b=(u=tW(t),c=`${u}Token`,null!=(l=i.tokens)&&l[u]?null==(d=i.tokens)?void 0:d[u]:tq(c,i)?i[c]:void 0),g=t===tH?"v":"drm"===t?"d":void 0,[f]=t3(null!=(s=i.playbackId)?s:"");if(!h||!f)return;let E=ii(b);if(b&&!E){let i=new t$(ia("The {tokenNamePrefix}-token provided is invalid or malformed.",r).format({tokenNamePrefix:v}),p,!0,ia("Compact JWT string: {token}",r).format({token:b}));return i.errorCategory=t,i.muxCode=2412202,i.data=e,i}if(h>=500){let e=new t$("",p,null==a||a);return e.errorCategory=t,e.muxCode=2e6,e}if(403===h)if(E){if((({exp:e},t=Date.now())=>!e||1e3*e<t)(E,m)){let i={timeStyle:"medium",dateStyle:"medium"},a=new t$(ia("The video’s secured {tokenNamePrefix}-token has expired.",r).format({tokenNamePrefix:v}),p,!0,ia("Expired at: {expiredDate}. Current time: {currentDate}.",r).format({expiredDate:new Intl.DateTimeFormat("en",i).format(null!=(o=E.exp)?o:0),currentDate:new Intl.DateTimeFormat("en",i).format(m)}));return a.errorCategory=t,a.muxCode=2403210,a.data=e,a}if((({sub:e},t)=>e!==t)(E,f)){let i=new t$(ia("The video’s playback ID does not match the one encoded in the {tokenNamePrefix}-token.",r).format({tokenNamePrefix:v}),p,!0,ia("Specified playback ID: {playbackId} and the playback ID encoded in the {tokenNamePrefix}-token: {tokenPlaybackId}",r).format({tokenNamePrefix:v,playbackId:f,tokenPlaybackId:E.sub}));return i.errorCategory=t,i.muxCode=2403232,i.data=e,i}if((({aud:e},t)=>!e)(E,0)){let i=new t$(ia("The {tokenNamePrefix}-token is formatted with incorrect information.",r).format({tokenNamePrefix:v}),p,!0,ia("The {tokenNamePrefix}-token has no aud value. aud value should be {expectedAud}.",r).format({tokenNamePrefix:v,expectedAud:g}));return i.errorCategory=t,i.muxCode=2403221,i.data=e,i}if((({aud:e},t)=>e!==t)(E,g)){let i=new t$(ia("The {tokenNamePrefix}-token is formatted with incorrect information.",r).format({tokenNamePrefix:v}),p,!0,ia("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.",r).format({tokenNamePrefix:v,expectedAud:g,aud:E.aud}));return i.errorCategory=t,i.muxCode=2403222,i.data=e,i}}else{let i=new t$(ia("Authorization error trying to access this {category} URL. If this is a signed URL, you might need to provide a {tokenNamePrefix}-token.",r).format({tokenNamePrefix:v,category:t}),p,null==a||a,ia("Specified playback ID: {playbackId}",r).format({playbackId:f}));return i.errorCategory=t,i.muxCode=2403201,i.data=e,i}if(412===h){let n=new t$(ia("This playback-id may belong to a live stream that is not currently active or an asset that is not ready.",r),p,null==a||a,ia("Specified playback ID: {playbackId}",r).format({playbackId:f}));return n.errorCategory=t,n.muxCode=2412e3,n.streamType=i.streamType===tK?"live":i.streamType===tF?"on-demand":"unknown",n.data=e,n}if(404===h){let i=new t$(ia("This URL or playback-id does not exist. You may have used an Asset ID or an ID from a different resource.",r),p,null==a||a,ia("Specified playback ID: {playbackId}",r).format({playbackId:f}));return i.errorCategory=t,i.muxCode=2404e3,i.data=e,i}if(400===h){let i=new t$(ia("The URL or playback-id was invalid. You may have used an invalid value as a playback-id."),p,null==a||a,ia("Specified playback ID: {playbackId}",r).format({playbackId:f}));return i.errorCategory=t,i.muxCode=24e5,i.data=e,i}let y=new t$("",p,null==a||a);return y.errorCategory=t,y.muxCode=2e6,y.data=e,y},iI=tB.DefaultConfig.capLevelController,iR={"720p":921600,"1080p":2073600,"1440p":4194304,"2160p":8294400},iC=class e extends iI{constructor(e){super(e)}static setMaxAutoResolution(t,i){i?e.maxAutoResolution.set(t,i):e.maxAutoResolution.delete(t)}getMaxAutoResolution(){var t;let i=this.hls;return null!=(t=e.maxAutoResolution.get(i))?t:void 0}get levels(){var e;return null!=(e=this.hls.levels)?e:[]}getValidLevels(e){return this.levels.filter((t,i)=>this.isLevelAllowed(t)&&i<=e)}getMaxLevelCapped(e){let t=this.getValidLevels(e),i=this.getMaxAutoResolution();if(!i)return super.getMaxLevel(e);let a=iR[i.toLowerCase().trim()];if(!a)return super.getMaxLevel(e);let r=t.filter(e=>e.width*e.height<=a),n=r.findIndex(e=>e.width*e.height===a);if(-1!==n){let e=r[n];return t.findIndex(t=>t===e)}if(0===r.length)return 0;let s=r[r.length-1];return t.findIndex(e=>e===s)}getMaxLevel(t){if(void 0!==this.getMaxAutoResolution())return this.getMaxLevelCapped(t);let i=super.getMaxLevel(t),a=this.getValidLevels(t);if(!a[i])return i;let r=Math.min(a[i].width,a[i].height),n=e.minMaxResolution;return r>=n?i:iI.getMaxLevelByMediaSize(a,16/9*n,n)}};iC.minMaxResolution=720,iC.maxAutoResolution=new WeakMap;var iL,iM,iD,ix,iP,iN,iO=e=>new TextDecoder("utf-16le").decode(e).replace("skd://","").slice(1),iU="fairplay",iB=/([A-Z0-9-]+)="?(.*?)"?(?:,|$)/g,iH=async(e,t)=>{if(t===tz.MP4)return{streamType:tF,targetLiveWindow:NaN,liveEdgeStartOffset:void 0,sessionData:void 0};if(t===tz.M3U8){let t=await fetch(e);if(!t.ok)return Promise.reject(t);let i=await t.text(),a=await ((e,t)=>{let i,a=e.split(`
`).find((e,t,i)=>t>0&&i[t-1].startsWith("#EXT-X-STREAM-INF"));if(!a)return Promise.reject(Error("No media playlist URL found in multivariant playlist"));if(t6(a)&&!t)return Promise.reject(Error("masterPlaylistUrl is required to resolve relative media playlist URL"));try{i=t7(a,t)}catch(e){return Promise.reject(e)}return fetch(i).then(e=>200!==e.status?Promise.reject(e):e.text())})(i,t.url);return{...(e=>{let t=e.split(`
`).filter(e=>e.startsWith("#EXT-X-SESSION-DATA"));if(!t.length)return{};let i={};for(let e of t){let t=Object.fromEntries([...e.matchAll(iB)].map(([,e,t])=>[e,t])),a=t["DATA-ID"];a&&(i[a]={...t})}return{sessionData:i}})(i),...(e=>{var t,i,a;let r=e.split(`
`),n=null==(i=(null!=(t=r.find(e=>e.startsWith("#EXT-X-PLAYLIST-TYPE")))?t:"").split(":")[1])?void 0:i.trim(),s=t5(n),o=t9(n),l;if(s===tK){let e=r.find(e=>e.startsWith("#EXT-X-PART-INF"));if(e)l=2*e.split(":")[1].split("=")[1];else{let e=r.find(e=>e.startsWith("#EXT-X-TARGETDURATION")),t=null==(a=null==e?void 0:e.split(":"))?void 0:a[1];l=(null!=t?t:6)*3}}return{streamType:s,targetLiveWindow:o,liveEdgeStartOffset:l}})(a)}}return console.error(`Media type ${t} is an unrecognized or unsupported type for src ${e}.`),{streamType:void 0,targetLiveWindow:void 0,liveEdgeStartOffset:void 0,sessionData:void 0}},iW=async(e,t,i=t4({src:e}))=>{var a,r,n,s;let{streamType:o,targetLiveWindow:l,liveEdgeStartOffset:d,sessionData:u}=await iH(e,i),c=null==u?void 0:u["com.apple.hls.chapters"];(null!=c&&c.URI||null!=c&&c.VALUE.toLocaleLowerCase().startsWith("http"))&&i$(null!=(a=c.URI)?a:c.VALUE,t),(null!=(r=iK.get(t))?r:{}).liveEdgeStartOffset=d,(null!=(n=iK.get(t))?n:{}).targetLiveWindow=l,t.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0})),(null!=(s=iK.get(t))?s:{}).streamType=o,t.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}))},i$=async(e,t)=>{var i,a;try{let r=await fetch(e);if(!r.ok)throw Error(`Failed to fetch Mux metadata: ${r.status} ${r.statusText}`);let n=await r.json(),s={};if(!(null!=(i=null==n?void 0:n[0])&&i.metadata))return;for(let e of n[0].metadata)e.key&&e.value&&(s[e.key]=e.value);(null!=(a=iK.get(t))?a:{}).metadata=s;let o=new CustomEvent("muxmetadata");t.dispatchEvent(o)}catch(e){console.error(e)}},iq=null!=(iM=null==(iL=null==globalThis?void 0:globalThis.navigator)?void 0:iL.userAgent)?iM:"",iV=null!=(iP=null==(ix=null==(iD=null==globalThis?void 0:globalThis.navigator)?void 0:iD.userAgentData)?void 0:ix.platform)?iP:"",iF=iq.toLowerCase().includes("android")||["x11","android"].some(e=>iV.toLowerCase().includes(e)),iK=new WeakMap,iG="mux.com",ij=null==(iN=tB.isSupported)?void 0:iN.call(tB),iY=()=>{if("u">typeof window)return tN.utils.now()},iQ=tN.utils.generateUUID,iz=({playbackId:e,customDomain:t=iG,maxResolution:i,minResolution:a,renditionOrder:r,programStartTime:n,programEndTime:s,assetStartTime:o,assetEndTime:l,playbackToken:d,tokens:{playback:u=d}={},extraSourceParams:c={}}={})=>{if(!e)return;let[h,m=""]=t3(e),p=new URL(`https://stream.${t}/${h}.m3u8${m}`);return u||p.searchParams.has("token")?(p.searchParams.forEach((e,t)=>{"token"!=t&&p.searchParams.delete(t)}),u&&p.searchParams.set("token",u)):(i&&p.searchParams.set("max_resolution",i),a&&(p.searchParams.set("min_resolution",a),i&&+i.slice(0,-1)<+a.slice(0,-1)&&console.error("minResolution must be <= maxResolution","minResolution",a,"maxResolution",i)),r&&p.searchParams.set("rendition_order",r),n&&p.searchParams.set("program_start_time",`${n}`),s&&p.searchParams.set("program_end_time",`${s}`),o&&p.searchParams.set("asset_start_time",`${o}`),l&&p.searchParams.set("asset_end_time",`${l}`),Object.entries(c).forEach(([e,t])=>{null!=t&&p.searchParams.set(e,t)})),p.toString()},iZ=e=>{if(!e)return;let[t]=e.split("?");return t||void 0},iX=e=>{if(!e||!e.startsWith("https://stream."))return;let[t]=new URL(e).pathname.slice(1).split(/\.m3u8|\//);return t||void 0},iJ=e=>{var t;return null==(t=iK.get(e))?void 0:t.error},i0=e=>{var t,i;return null!=(i=null==(t=iK.get(e))?void 0:t.streamType)?i:tG},i1=e=>{var t,i;return null!=(i=null==(t=iK.get(e))?void 0:t.seekable)?i:e.seekable},i2=.034,i3=(e,t,i=i2)=>e>t||((e,t,i=i2)=>Math.abs(e-t)<=i)(e,t,i),i4=(e,t)=>{var i,a,r;if(!t||!e.buffered.length)return;if(e.readyState>2)return!1;let n=t.currentLevel>=0?null==(a=null==(i=t.levels)?void 0:i[t.currentLevel])?void 0:a.details:null==(r=t.levels.find(e=>!!e.details))?void 0:r.details;if(!n||n.live)return;let{fragments:s}=n;if(!(null!=s&&s.length))return;if(e.currentTime<e.duration-(n.targetduration+.5))return!1;let o=s[s.length-1];if(e.currentTime<=o.start)return!1;let l=o.start+o.duration/2,d=e.buffered.start(e.buffered.length-1),u=e.buffered.end(e.buffered.length-1);return l>d&&l<u},i5=(e,t)=>e.ended||e.loop?e.ended:!!(t&&i4(e,t))||((e,t=i2)=>e.paused&&i3(e.currentTime,e.duration,t))(e),i9=(e,t,i)=>{var a,r,n;i8(t,i,e);let{metadata:s={}}=e,{view_session_id:o=iQ()}=s,l=null!=(a=null==e?void 0:e.metadata)&&a.video_id?e.metadata.video_id:as(e)&&null!=(n=null!=(r=iZ(e.playbackId))?r:iX(e.src))?n:e.src;s.view_session_id=o,s.video_id=l,e.metadata=s,e.drmTypeCb=e=>{var i;null==(i=t.mux)||i.emit("hb",{view_drm_type:e})},e.fallbackToWebkitFairplay=async()=>{var i;let a=!t.paused,r=t.currentTime;e.useWebkitFairplay=!0;let n=e.muxDataKeepSession;e.muxDataKeepSession=!0;let s=null==(i=iK.get(t))?void 0:i.coreReference;i9(e,t,s),e.muxDataKeepSession=n,e.useWebkitFairplay=!1,a&&await t.play().then(()=>{t.currentTime=r}).catch(()=>{}),t.currentTime=r},iK.set(t,{retryCount:0});let d=i7(e,t),u=(({preload:e,src:t},i,a)=>{let r=e=>{null!=e&&["","none","metadata","auto"].includes(e)?i.setAttribute("preload",e):i.removeAttribute("preload")};if(!a)return r(e),r;let n=!1,s=!1,o=a.config.maxBufferLength,l=a.config.maxBufferSize,d=e=>{r(e);let t=null!=e?e:i.preload;s||"none"===t||("metadata"===t?(a.config.maxBufferLength=1,a.config.maxBufferSize=1):(a.config.maxBufferLength=o,a.config.maxBufferSize=l),u())},u=()=>{!n&&t&&(n=!0,a.loadSource(t))};return t2(i,"play",()=>{s=!0,a.config.maxBufferLength=o,a.config.maxBufferSize=l,u()},{once:!0}),d(e),d})(e,t,d);null!=e&&e.muxDataKeepSession&&null!=t&&t.mux&&!t.mux.deleted?d&&t.mux.addHLSJS({hlsjs:d,Hls:d?tB:void 0}):al(e,t,d),ad(e,t,d),iE(t),iw(t);let c=((e,t,i)=>{let{autoplay:a}=e,r=!1,n=!1,s=io(a)?a:!!a,o=()=>{r||t2(t,"playing",()=>{r=!0},{once:!0})};if(o(),t2(t,"loadstart",()=>{r=!1,o(),il(t,s)},{once:!0}),t2(t,"loadstart",()=>{i||(n=e.streamType&&e.streamType!==tG?e.streamType===tK:!Number.isFinite(t.duration)),il(t,s)},{once:!0}),i&&i.once(tB.Events.LEVEL_LOADED,(t,i)=>{var a;n=e.streamType&&e.streamType!==tG?e.streamType===tK:null!=(a=i.details.live)&&a}),!s){let a=()=>{!n||Number.isFinite(e.startTime)||(null!=i&&i.liveSyncPosition?t.currentTime=i.liveSyncPosition:Number.isFinite(t.seekable.end(0))&&(t.currentTime=t.seekable.end(0)))};i&&t2(t,"play",()=>{"metadata"===t.preload?i.once(tB.Events.LEVEL_UPDATED,a):a()},{once:!0})}return e=>{r||il(t,s=io(e)?e:!!e)}})(e,t,d);((e,t,i)=>{let{minPreloadSegments:a}=e;if(null==a||a<=0||!i)return;let r=0,n=!1,s=t.playbackRate||1,o=()=>{0!==t.playbackRate&&(s=t.playbackRate,t.playbackRate=0)};t.playbackRate=0,t2(t,"ratechange",o);let l=(e,{frag:i})=>{n||"main"!==i.type||++r>=a&&(n=!0,t.removeEventListener("ratechange",o),t.playbackRate=s)};i.on(tB.Events.FRAG_BUFFERED,l),t.addEventListener("teardown",()=>{n||(n=!0,i.off(tB.Events.FRAG_BUFFERED,l),t.playbackRate=s)},{once:!0})})(e,t,d),((e,t,i)=>{let{initialEstimateSegments:a}=e;if(null==a||a<=0||!i)return;let r=0;i.on(tB.Events.FRAG_BUFFERED,(e,{frag:t})=>{"main"===t.type&&++r<a&&i.abrController.resetEstimator(i.config.abrEwmaDefaultEstimate)})})(e,0,d);let h={engine:d,setAutoplay:c,setPreload:u},m=iK.get(t);return m&&(m.coreReference=h),h},i8=(e,t,i)=>{let a=null==t?void 0:t.engine;null!=e&&e.mux&&!e.mux.deleted&&(null!=i&&i.muxDataKeepSession?a&&e.mux.removeHLSJS():(e.mux.destroy(),delete e.mux)),a&&(a.detachMedia(),a.destroy()),e&&(e.hasAttribute("src")&&(e.removeAttribute("src"),e.load()),e.removeEventListener("error",ac),e.removeEventListener("error",am),e.removeEventListener("durationchange",au),iK.delete(e),e.dispatchEvent(new Event("teardown")))};function i6(e,t){var i;let a=t4(e);if(a!==tz.M3U8)return!0;let r=!a||null==(i=t.canPlayType(a))||i,{preferPlayback:n}=e,s=ij&&("mse"===n||iF||!(/^((?!chrome|android).)*safari/i.test(iq)&&t.canPlayType("application/vnd.apple.mpegurl")));return r&&(n===tj||!s)}var i7=(e,t)=>{let{debug:i,streamType:a,startTime:r=-1,metadata:n,preferCmcd:s,_hlsConfig:o={},maxAutoResolution:l,initialBandwidthEstimateKbps:d}=e,u=t4(e)===tz.M3U8,c=i6(e,t);if(u&&!c&&ij){let u={backBufferLength:30,renderTextTracksNatively:!1,liveDurationInfinity:!0,capLevelOnFPSDrop:!0,...null!=d?{abrEwmaDefaultEstimate:1e3*d}:{}},c=ae(a),h=at(e),m=[tY.QUERY,tY.HEADER].includes(s)?{useHeaders:s===tY.HEADER,sessionId:null==n?void 0:n.view_session_id,contentId:null==n?void 0:n.video_id}:void 0,p=ao(e,o),v=new tB({debug:i,startPosition:r,cmcd:m,xhrSetup:(e,t)=>{var i,a;if(s&&s!==tY.QUERY)return;let r=t7(t);if(!r.searchParams.has("CMCD"))return;let n=(null!=(a=null==(i=r.searchParams.get("CMCD"))?void 0:i.split(","))?a:[]).filter(e=>e.startsWith("sid")||e.startsWith("cid")).join(",");r.searchParams.set("CMCD",n),e.open("GET",r)},...u,...p,...c,...h,...o});return p.capLevelController===iC&&void 0!==l&&iC.setMaxAutoResolution(v,l),v.on(tB.Events.MANIFEST_PARSED,async function(e,i){var a,r;let n=null==(a=i.sessionData)?void 0:a["com.apple.hls.chapters"];(null!=n&&n.URI||null!=n&&n.VALUE.toLocaleLowerCase().startsWith("http"))&&i$(null!=(r=null==n?void 0:n.URI)?r:null==n?void 0:n.VALUE,t)}),v}},ae=e=>e===tK?{backBufferLength:8}:{},at=e=>{let{tokens:{drm:t}={},playbackId:i,drmTypeCb:a}=e,r=iZ(i);return t&&r?{emeEnabled:!0,drmSystems:{"com.apple.fps":{licenseUrl:ar(e,"fairplay"),serverCertificateUrl:an(e,"fairplay")},"com.widevine.alpha":{licenseUrl:ar(e,"widevine")},"com.microsoft.playready":{licenseUrl:ar(e,"playready")}},requestMediaKeySystemAccessFunc:(e,t)=>("com.widevine.alpha"===e&&(t=[...t.map(e=>{var t;let i=null==(t=e.videoCapabilities)?void 0:t.map(e=>({...e,robustness:"HW_SECURE_ALL"}));return{...e,videoCapabilities:i}}),...t]),navigator.requestMediaKeySystemAccess(e,t).then(t=>{let i=e.includes("fps")?iU:e.includes("playready")?"playready":e.includes("widevine")?"widevine":void 0;return null==a||a(i),t}))}:{}},ai=async e=>{let t=await fetch(e);return 200!==t.status?Promise.reject(t):await t.arrayBuffer()},aa=async(e,t)=>{let i=await fetch(t,{method:"POST",headers:{"Content-type":"application/octet-stream"},body:e});return 200!==i.status?Promise.reject(i):new Uint8Array(await i.arrayBuffer())},ar=({playbackId:e,tokens:{drm:t}={},customDomain:i=iG},a)=>{let r=iZ(e);return`https://license.${i.toLocaleLowerCase().endsWith(iG)?i:iG}/license/${a}/${r}?token=${t}`},an=({playbackId:e,tokens:{drm:t}={},customDomain:i=iG},a)=>{let r=iZ(e);return`https://license.${i.toLocaleLowerCase().endsWith(iG)?i:iG}/appcert/${a}/${r}?token=${t}`},as=({playbackId:e,src:t,customDomain:i})=>{if(e)return!0;if("string"!=typeof t)return!1;let a=new URL(t,null==window?void 0:window.location.href).hostname.toLocaleLowerCase();return a.includes(iG)||!!i&&a.includes(i.toLocaleLowerCase())},ao=(e,t)=>{let i={};return i.capLevelToPlayerSize=e.capRenditionToPlayerSize,null==i.capLevelToPlayerSize?(i.capLevelController=iC,i.capLevelToPlayerSize=!0):i.capLevelController=tU.CapLevelController,i},al=(e,t,i)=>{var a;let{envKey:r,disableTracking:n,muxDataSDK:s=tN,muxDataSDKOptions:o={}}=e,l=as(e);if(!n&&(r||l)){let{playerInitTime:n,playerSoftwareName:l,playerSoftwareVersion:d,beaconCollectionDomain:u,debug:c,disableCookies:h}=e,m={...e.metadata,video_title:(null==(a=null==e?void 0:e.metadata)?void 0:a.video_title)||void 0};s.monitor(t,{debug:c,beaconCollectionDomain:u,hlsjs:i,Hls:i?tB:void 0,automaticErrorTracking:!1,errorTranslator:t=>"string"!=typeof t.player_error_code&&("function"==typeof e.errorTranslator?e.errorTranslator(t):t),disableCookies:h,...o,data:{...r?{env_key:r}:{},player_software_name:l,player_software:l,player_software_version:d,player_init_time:n,...m}})}},ad=(e,t,i)=>{var a,r;let n=i6(e,t),{src:s,customDomain:o=iG}=e,l=()=>{t.ended||e.disablePseudoEnded||!i5(t,i)||(i4(t,i)?t.currentTime=t.buffered.end(t.buffered.length-1):t.dispatchEvent(new Event("ended")))},d,u,c=()=>{let e=i1(t),i,a;e.length>0&&(i=e.start(0),a=e.end(0)),(u!==a||d!==i)&&t.dispatchEvent(new CustomEvent("seekablechange",{composed:!0})),d=i,u=a};if(t2(t,"durationchange",c),t&&n){let i=t4(e);if("string"==typeof s){if(s.endsWith(".mp4")&&s.includes(o)){let e=iX(s);i$(new URL(`https://stream.${o}/${e}/metadata.json`).toString(),t)}let n=()=>{if(i0(t)!==tK||Number.isFinite(t.duration))return;let e=setInterval(c,1e3);t.addEventListener("teardown",()=>{clearInterval(e)},{once:!0}),t2(t,"durationchange",()=>{Number.isFinite(t.duration)&&clearInterval(e)})},l=async()=>iW(s,t,i).then(n).catch(i=>{if(i instanceof Response){let a=iS(i,tH,e);if(a)return void ah(t,a)}});if("none"===t.preload){let e=()=>{l(),t.removeEventListener("loadedmetadata",i)},i=()=>{l(),t.removeEventListener("play",e)};t2(t,"play",e,{once:!0}),t2(t,"loadedmetadata",i,{once:!0})}else l();null!=(a=e.tokens)&&a.drm?((e,t)=>{let i={mediaEl:t,getAppCertificate:()=>ai(an(e,"fairplay")).catch(t=>{if(t instanceof Response){let i=iS(t,"drm",e);return console.error("mediaError",null==i?void 0:i.message,null==i?void 0:i.context),i?Promise.reject(i):Promise.reject(Error("Unexpected error in app cert request"))}return Promise.reject(t)}),getLicenseKey:t=>aa(t,ar(e,"fairplay")).catch(t=>{if(t instanceof Response){let i=iS(t,"drm",e);return console.error("mediaError",null==i?void 0:i.message,null==i?void 0:i.context),i?Promise.reject(i):Promise.reject(Error("Unexpected error in license key request"))}return Promise.reject(t)}),saveAndDispatchError:ah,drmTypeCb:()=>{var t;null==(t=e.drmTypeCb)||t.call(e,iU)}};if(e.useWebkitFairplay)(({mediaEl:e,getAppCertificate:t,getLicenseKey:i,saveAndDispatchError:a,drmTypeCb:r})=>{if(!window.WebKitMediaKeys||!("onwebkitneedkey"in e)){console.error("No WebKitMediaKeys. FairPlay may not be supported");let t=new t$(ia("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser."),t$.MEDIA_ERR_ENCRYPTED,!0);return t.errorCategory="drm",t.muxCode=5000005,a(e,t),()=>{}}let n=t(),s=null,o=t=>{(async()=>{try{var i,r;let a,s,o,u,c,h,m,p;e.webkitKeys||l();let v=await n;if(null===t.initData||null==v)return;let b=(i=t.initData,r=v,a=function(e){let t=new ArrayBuffer(2*e.length),i=new DataView(t);for(let t=0;t<e.length;t++)i.setUint16(2*t,e.charCodeAt(t),!0);return t}(iO(i)),s=new Uint8Array(i),o=new Uint8Array(a),u=new Uint8Array(r),c=new Uint8Array(s.byteLength+4+u.byteLength+4+o.byteLength),h=0,m=e=>{c.set(e,h),h+=e.byteLength},p=e=>{let t=new DataView(c.buffer),i=e.byteLength;t.setUint32(h,i,!0),h+=4,m(e)},m(s),p(o),p(u),c);d(b)}catch(t){console.error("Could not start encrypted playback due to exception",t),a(e,t)}})()},l=()=>{try{let t=new WebKitMediaKeys("com.apple.fps.1_0");e.webkitSetMediaKeys(t),r()}catch{let e=new t$("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser.",t$.MEDIA_ERR_ENCRYPTED,!0);throw e.errorCategory="drm",e.muxCode=5000001,e}},d=t=>{let r=e.webkitKeys.createSession("application/vnd.apple.mpegurl",t),n=async t=>{try{let e=t.message,a=await i(e);r.update(a)}catch(t){console.error("Error on FairPlay session message",t),a(e,t)}},o=t=>{let i=t.target.error;if(!i)return;console.error(`Internal Webkit Key Session Error - sysCode: ${i.systemCode} code: ${i.code}`);let r=new t$(ia("The DRM Content Decryption Module system had an internal failure. Try reloading the page, upading your browser, or playing in another browser."),t$.MEDIA_ERR_ENCRYPTED,!0);r.errorCategory="drm",r.muxCode=5000005,a(e,r)},l=()=>{r.removeEventListener("webkitkeymessage",n),r.removeEventListener("webkitkeyerror",o),e.removeEventListener("teardown",l),"webkitCurrentPlaybackTargetIsWireless"in e&&e.removeEventListener("webkitcurrentplaybacktargetiswirelesschanged",l),s=null;try{r.close()}catch{}};"webkitCurrentPlaybackTargetIsWireless"in e&&e.addEventListener("webkitcurrentplaybacktargetiswirelesschanged",l,{once:!0}),r.addEventListener("webkitkeymessage",n),r.addEventListener("webkitkeyerror",o),e.addEventListener("teardown",l),s=l},u=()=>{e.removeEventListener("webkitneedkey",o),e.removeEventListener("teardown",u),null==s||s();try{e.webkitSetMediaKeys(null)}catch{}};return e.addEventListener("webkitneedkey",o),e.addEventListener("teardown",u,{once:!0})})(i);else{let t=(({mediaEl:e,getAppCertificate:t,getLicenseKey:i,saveAndDispatchError:a,drmTypeCb:r,fallbackToWebkitFairplay:n})=>{let s=null,o=async t=>{try{let i=t.initDataType;if("skd"!==i)return void console.error(`Received unexpected initialization data type "${i}"`);e.mediaKeys||await l(i);let a=t.initData;if(null==a)return void console.error(`Could not start encrypted playback due to missing initData in ${t.type} event`);await d(i,a)}catch(t){a(e,t);return}},l=async i=>{let n=await navigator.requestMediaKeySystemAccess("com.apple.fps",[{initDataTypes:[i],videoCapabilities:[{contentType:"application/vnd.apple.mpegurl",robustness:""}],distinctiveIdentifier:"not-allowed",persistentState:"not-allowed",sessionTypes:["temporary"]}]).then(e=>(r(),e)).catch(()=>{let t=new t$(ia("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser."),t$.MEDIA_ERR_ENCRYPTED,!0);t.errorCategory="drm",t.muxCode=5000001,a(e,t)});if(!n)return;let s=await n.createMediaKeys();try{let e=await t();await s.setServerCertificate(e).catch(()=>{let e=ia("Your server certificate failed when attempting to set it. This may be an issue with a no longer valid certificate."),t=new t$(e,t$.MEDIA_ERR_ENCRYPTED,!0);return t.errorCategory="drm",t.muxCode=5000004,Promise.reject(t)})}catch(t){a(e,t);return}await e.setMediaKeys(s)},d=async(t,r)=>{let o=e.mediaKeys.createSession(),l=async t=>{let r=t.message,n=await i(r);try{await o.update(n)}catch{let t=new t$(ia("Failed to update DRM license. This may be an issue with the player or your protected content."),t$.MEDIA_ERR_ENCRYPTED,!0);t.errorCategory="drm",t.muxCode=5000003,a(e,t)}},d=()=>{o.keyStatuses.forEach(t=>{let i;"internal-error"===t?((i=new t$(ia("The DRM Content Decryption Module system had an internal failure. Try reloading the page, upading your browser, or playing in another browser."),t$.MEDIA_ERR_ENCRYPTED,!0)).errorCategory="drm",i.muxCode=5000005):("output-restricted"===t||"output-downscaled"===t)&&((i=new t$(ia("DRM playback is being attempted in an environment that is not sufficiently secure. User may see black screen."),t$.MEDIA_ERR_ENCRYPTED,!1)).errorCategory="drm",i.muxCode=5000006),i&&a(e,i)})};o.addEventListener("keystatuseschange",d),o.addEventListener("message",l);let u=async()=>{o.removeEventListener("keystatuseschange",d),o.removeEventListener("message",l),"webkitCurrentPlaybackTargetIsWireless"in e&&e.removeEventListener("webkitcurrentplaybacktargetiswirelesschanged",u),e.removeEventListener("teardown",u),await o.close().catch(e=>{console.warn("There was an error when closing EME session",e)}),s=null};"webkitCurrentPlaybackTargetIsWireless"in e&&e.addEventListener("webkitcurrentplaybacktargetiswirelesschanged",u,{once:!0}),e.addEventListener("teardown",u,{once:!0}),s=u,await o.generateRequest(t,r).catch(async t=>{if("NotSupportedError"===t.name&&"webkitCurrentPlaybackTargetIsWireless"in e&&e.webkitCurrentPlaybackTargetIsWireless)console.warn("Failed to generate a DRM license request. Attempting to fallback to Webkit DRM"),null==n||n();else{let e=new t$(ia("Failed to generate a DRM license request. This may be an issue with the player or your protected content."),t$.MEDIA_ERR_ENCRYPTED,!0);return e.errorCategory="drm",e.muxCode=5000002,console.error("Failed to generate license request",t),Promise.reject(e)}})},u=async()=>{e.removeEventListener("encrypted",o),e.removeEventListener("teardown",u),s&&await s(),await e.setMediaKeys(null).catch(()=>{})};return e.addEventListener("encrypted",o),e.addEventListener("teardown",u,{once:!0}),u})({fallbackToWebkitFairplay:async()=>{var i;await t(),null==(i=e.fallbackToWebkitFairplay)||i.call(e)},...i})}})(e,t):t2(t,"encrypted",()=>{let e=new t$(ia("Attempting to play DRM-protected content without providing a DRM token."),t$.MEDIA_ERR_ENCRYPTED,!0);e.errorCategory="drm",e.muxCode=5000002,ah(t,e)},{once:!0}),t.setAttribute("src",s),e.startTime&&((null!=(r=iK.get(t))?r:{}).startTime=e.startTime,t.addEventListener("durationchange",au,{once:!0}))}else t.removeAttribute("src");t.addEventListener("error",ac),t.addEventListener("error",am),t.addEventListener("emptied",()=>{t.querySelectorAll("track[data-removeondestroy]").forEach(e=>{e.remove()})},{once:!0}),t2(t,"pause",l),t2(t,"seeked",l),t2(t,"play",()=>{t.ended||i3(t.currentTime,t.duration)&&(t.currentTime=t.seekable.length?t.seekable.start(0):0)})}else{let a,r;i&&s?(i.once(tB.Events.LEVEL_LOADED,(e,a)=>{((e,t,i)=>{var a,r,n,s,o,l,d,u,c;let h,m,p,v,b,{streamType:g,targetLiveWindow:f,liveEdgeStartOffset:E,lowLatency:y}=(m=t5(h=e.type),p=t9(h),b=!!(null!=(c=e.partList)&&c.length),m===tK&&(v=b?2*e.partTarget:3*e.targetduration),{streamType:m,targetLiveWindow:p,liveEdgeStartOffset:v,lowLatency:b});if(g===tK){y?(i.config.backBufferLength=null!=(a=i.userConfig.backBufferLength)?a:4,i.config.maxFragLookUpTolerance=null!=(r=i.userConfig.maxFragLookUpTolerance)?r:.001,i.config.abrBandWidthUpFactor=null!=(n=i.userConfig.abrBandWidthUpFactor)?n:i.config.abrBandWidthFactor):i.config.backBufferLength=null!=(s=i.userConfig.backBufferLength)?s:8;let e=Object.freeze({get length(){return t.seekable.length},start:e=>t.seekable.start(e),end(e){var a;return e>this.length||e<0||Number.isFinite(t.duration)?t.seekable.end(e):null!=(a=i.liveSyncPosition)?a:t.seekable.end(e)}});(null!=(o=iK.get(t))?o:{}).seekable=e}(null!=(l=iK.get(t))?l:{}).liveEdgeStartOffset=E,(null!=(d=iK.get(t))?d:{}).targetLiveWindow=f,t.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0})),(null!=(u=iK.get(t))?u:{}).streamType=g,t.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}))})(a.details,t,i),c(),i0(t)!==tK||Number.isFinite(t.duration)||(i.on(tB.Events.LEVEL_UPDATED,c),t2(t,"durationchange",()=>{Number.isFinite(t.duration)&&i.off(tB.Events.LEVELS_UPDATED,c)}))}),i.on(tB.Events.ERROR,(a,r)=>{var n,s;let o=aR(r,e);if(2412e3===o.muxCode){let e=null!=(n=iK.get(t))?n:{},a=null!=(s=e.retryCount)?s:0;if(a<6){let n=0===a?5e3:6e4,s=new t$(`Retrying in ${n/1e3} seconds...`,o.code,o.fatal);Object.assign(s,o),ah(t,s);let l=setTimeout(()=>{e.retryCount=a+1,"manifestLoadError"===r.details&&r.url&&i.loadSource(r.url)},n);t.addEventListener("teardown",()=>clearTimeout(l),{once:!0});return}{e.retryCount=0;let i=new t$('Try again later or <a href="#" onclick="window.location.reload(); return false;" style="color: #4a90e2;">click here to retry</a>',o.code,o.fatal);Object.assign(i,o),ah(t,i);return}}ah(t,o)}),i.on(tB.Events.MANIFEST_LOADED,()=>{let e=iK.get(t);e&&e.error&&(e.error=null,e.retryCount=0,t.dispatchEvent(new Event("emptied")),t.dispatchEvent(new Event("loadstart")))}),t.addEventListener("error",am),t2(t,"waiting",l),function(e,t){var i;if(!("videoTracks"in e))return;let a=new WeakMap;t.on(tB.Events.MANIFEST_PARSED,function(t,i){o();let r=e.addVideoTrack("main");for(let[e,t]of(r.selected=!0,i.levels.entries())){let i=r.addRendition(t.url[0],t.width,t.height,t.videoCodec,t.bitrate);a.set(t,`${e}`),i.id=`${e}`}}),t.on(tB.Events.AUDIO_TRACKS_UPDATED,function(t,i){for(let t of(s(),i.audioTracks)){let i=t.default?"main":"alternative",a=e.addAudioTrack(i,t.name,t.lang);a.id=`${t.id}`,t.default&&(a.enabled=!0)}});let r=()=>{var i;let a=+(null==(i=[...e.audioTracks].find(e=>e.enabled))?void 0:i.id),r=t.audioTracks.map(e=>e.id);a!=t.audioTrack&&r.includes(a)&&(t.audioTrack=a)};e.audioTracks.addEventListener("change",r),t.on(tB.Events.LEVELS_UPDATED,function(t,i){var r;let n=e.videoTracks[null!=(r=e.videoTracks.selectedIndex)?r:0];if(!n)return;let s=i.levels.map(e=>a.get(e));for(let t of e.videoRenditions)t.id&&!s.includes(t.id)&&n.removeRendition(t)});let n=e=>{let i=e.target.selectedIndex;i!=t.nextLevel&&(t.nextLevel=i)};null==(i=e.videoRenditions)||i.addEventListener("change",n);let s=()=>{for(let t of e.audioTracks)e.removeAudioTrack(t)},o=()=>{(()=>{for(let t of e.videoTracks)e.removeVideoTrack(t)})(),s()};t.once(tB.Events.DESTROYING,()=>{var t,i;o(),null==(t=e.audioTracks)||t.removeEventListener("change",r),null==(i=e.videoRenditions)||i.removeEventListener("change",n)})}(e,i),i.on(tB.Events.NON_NATIVE_TEXT_TRACKS_FOUND,(e,{tracks:a})=>{a.forEach(e=>{var a,r;let n=null!=(a=e.subtitleTrack)?a:e.closedCaptions,s=i.subtitleTracks.findIndex(({lang:t,name:i,type:a})=>t==(null==n?void 0:n.lang)&&i===e.label&&a.toLowerCase()===e.kind),o=(null!=(r=e._id)?r:e.default)?"default":`${e.kind}${s}`;iu(t,e.kind,e.label,null==n?void 0:n.lang,o,e.default)})}),a=()=>{if(!i.subtitleTracks.length)return;let e=Array.from(t.textTracks).find(e=>e.id&&"showing"===e.mode&&["subtitles","captions"].includes(e.kind));if(!e)return;let a=i.subtitleTracks[i.subtitleTrack],r=a?a.default?"default":`${i.subtitleTracks[i.subtitleTrack].type.toLowerCase()}${i.subtitleTrack}`:void 0;if(i.subtitleTrack<0||(null==e?void 0:e.id)!==r){let t=i.subtitleTracks.findIndex(({lang:t,name:i,type:a,default:r})=>"default"===e.id&&r||t==e.language&&i===e.label&&a.toLowerCase()===e.kind);i.subtitleTrack=t}(null==e?void 0:e.id)===r&&e.cues&&Array.from(e.cues).forEach(t=>{e.addCue(t)})},t.textTracks.addEventListener("change",a),i.on(tB.Events.CUES_PARSED,(e,{track:i,cues:a})=>{let r=t.textTracks.getTrackById(i);if(!r)return;let n="disabled"===r.mode;n&&(r.mode="hidden"),a.forEach(e=>{var t;null!=(t=r.cues)&&t.getCueById(e.id)||r.addCue(e)}),n&&(r.mode="disabled")}),i.once(tB.Events.DESTROYING,()=>{t.textTracks.removeEventListener("change",a),t.querySelectorAll("track[data-removeondestroy]").forEach(e=>{e.remove()})}),r=()=>{Array.from(t.textTracks).forEach(e=>{var i,a;if(!["subtitles","caption"].includes(e.kind)&&("thumbnails"===e.label||"chapters"===e.kind)){if(!(null!=(i=e.cues)&&i.length)){let i="track";e.kind&&(i+=`[kind="${e.kind}"]`),e.label&&(i+=`[label="${e.label}"]`);let r=t.querySelector(i),n=null!=(a=null==r?void 0:r.getAttribute("src"))?a:"";null==r||r.removeAttribute("src"),setTimeout(()=>{null==r||r.setAttribute("src",n)},0)}"hidden"!==e.mode&&(e.mode="hidden")}})},i.once(tB.Events.MANIFEST_LOADED,r),i.once(tB.Events.MEDIA_ATTACHED,r),i.attachMedia(t)):console.error("It looks like the video you're trying to play will not work on this system! If possible, try upgrading to the newest versions of your browser or software.")}};function au(e){var t;let i=e.target,a=null==(t=iK.get(i))?void 0:t.startTime;if(a&&function(e,t,i){t&&i>t&&(i=t);for(let t=0;t<e.length;t++)if(e.start(t)<=i&&e.end(t)>=i)return!0;return!1}(i.seekable,i.duration,a)){let e="auto"===i.preload;e&&(i.preload="none"),i.currentTime=a,e&&(i.preload="auto")}}async function ac(e){if(!e.isTrusted)return;e.stopImmediatePropagation();let t=e.target;if(!(null!=t&&t.error))return;let{message:i,code:a}=t.error,r=new t$(i,a);if(t.src&&a===t$.MEDIA_ERR_SRC_NOT_SUPPORTED&&t.readyState===HTMLMediaElement.HAVE_NOTHING)return void setTimeout(()=>{var e;let i=null!=(e=iJ(t))?e:t.error;(null==i?void 0:i.code)===t$.MEDIA_ERR_SRC_NOT_SUPPORTED&&ah(t,r)},500);if(t.src&&(a!==t$.MEDIA_ERR_DECODE||void 0!==a))try{let{status:e}=await fetch(t.src);r.data={response:{code:e}}}catch{}ah(t,r)}function ah(e,t){var i;t.fatal&&((null!=(i=iK.get(e))?i:{}).error=t,e.dispatchEvent(new CustomEvent("error",{detail:t})))}function am(e){var t,i;if(!(e instanceof CustomEvent)||!(e.detail instanceof t$))return;let a=e.target,r=e.detail;r&&r.fatal&&((null!=(t=iK.get(a))?t:{}).error=r,null==(i=a.mux)||i.emit("error",{player_error_code:r.code,player_error_message:r.message,player_error_context:r.context}))}var ap,av,ab,ag,af,aE,ay,a_,aT,aA,ak,aw,aS,aI,aR=(e,t)=>{var i,a,r;e.fatal?console.error("getErrorFromHlsErrorData()",e):t.debug&&console.warn("getErrorFromHlsErrorData() (non-fatal)",e);let n={[tB.ErrorTypes.NETWORK_ERROR]:t$.MEDIA_ERR_NETWORK,[tB.ErrorTypes.MEDIA_ERROR]:t$.MEDIA_ERR_DECODE,[tB.ErrorTypes.KEY_SYSTEM_ERROR]:t$.MEDIA_ERR_ENCRYPTED},s,o=[tB.ErrorDetails.KEY_SYSTEM_LICENSE_REQUEST_FAILED,tB.ErrorDetails.KEY_SYSTEM_SERVER_CERTIFICATE_REQUEST_FAILED].includes(e.details)?t$.MEDIA_ERR_NETWORK:n[e.type];if(o===t$.MEDIA_ERR_NETWORK&&e.response){let r=null!=(i=e.type===tB.ErrorTypes.KEY_SYSTEM_ERROR?"drm":e.type===tB.ErrorTypes.NETWORK_ERROR?tH:void 0)?i:tH;s=null!=(a=iS(e.response,r,t,e.fatal))?a:new t$("",o,e.fatal)}else o===t$.MEDIA_ERR_ENCRYPTED?e.details===tB.ErrorDetails.KEY_SYSTEM_NO_CONFIGURED_LICENSE?((s=new t$(ia("Attempting to play DRM-protected content without providing a DRM token."),t$.MEDIA_ERR_ENCRYPTED,e.fatal)).errorCategory="drm",s.muxCode=5000002):e.details===tB.ErrorDetails.KEY_SYSTEM_NO_ACCESS?((s=new t$(ia("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser."),t$.MEDIA_ERR_ENCRYPTED,e.fatal)).errorCategory="drm",s.muxCode=5000001):e.details===tB.ErrorDetails.KEY_SYSTEM_NO_SESSION?((s=new t$(ia("Failed to generate a DRM license request. This may be an issue with the player or your protected content."),t$.MEDIA_ERR_ENCRYPTED,!0)).errorCategory="drm",s.muxCode=5000002):e.details===tB.ErrorDetails.KEY_SYSTEM_SESSION_UPDATE_FAILED?((s=new t$(ia("Failed to update DRM license. This may be an issue with the player or your protected content."),t$.MEDIA_ERR_ENCRYPTED,e.fatal)).errorCategory="drm",s.muxCode=5000003):e.details===tB.ErrorDetails.KEY_SYSTEM_SERVER_CERTIFICATE_UPDATE_FAILED?((s=new t$(ia("Your server certificate failed when attempting to set it. This may be an issue with a no longer valid certificate."),t$.MEDIA_ERR_ENCRYPTED,e.fatal)).errorCategory="drm",s.muxCode=5000004):e.details===tB.ErrorDetails.KEY_SYSTEM_STATUS_INTERNAL_ERROR?((s=new t$(ia("The DRM Content Decryption Module system had an internal failure. Try reloading the page, upading your browser, or playing in another browser."),t$.MEDIA_ERR_ENCRYPTED,e.fatal)).errorCategory="drm",s.muxCode=5000005):e.details===tB.ErrorDetails.KEY_SYSTEM_STATUS_OUTPUT_RESTRICTED?((s=new t$(ia("DRM playback is being attempted in an environment that is not sufficiently secure. User may see black screen."),t$.MEDIA_ERR_ENCRYPTED,!1)).errorCategory="drm",s.muxCode=5000006):((s=new t$(e.error.message,t$.MEDIA_ERR_ENCRYPTED,e.fatal)).errorCategory="drm",s.muxCode=5e6):s=new t$("",o,e.fatal);return s.context||(s.context=`${e.url?`url: ${e.url}
`:""}${e.response&&(e.response.code||e.response.text)?`response: ${e.response.code}, ${e.response.text}
`:""}${e.reason?`failure reason: ${e.reason}
`:""}${e.level?`level: ${e.level}
`:""}${e.parent?`parent stream controller: ${e.parent}
`:""}${e.buffer?`buffer length: ${e.buffer}
`:""}${e.error?`error: ${e.error}
`:""}${e.event?`event: ${e.event}
`:""}${e.err?`error message: ${null==(r=e.err)?void 0:r.message}
`:""}`),s.data=e,s},aC=e.i(2709),aL=e=>{throw TypeError(e)},aM=(e,t,i)=>t.has(e)||aL("Cannot "+i),aD=(e,t,i)=>(aM(e,t,"read from private field"),i?i.call(e):t.get(e)),ax=(e,t,i)=>t.has(e)?aL("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,i),aP=(e,t,i,a)=>(aM(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),aN=(e,t,i)=>(aM(e,t,"access private method"),i),aO=(()=>{try{return"0.31.0"}catch{}return"UNKNOWN"})(),aU=`
<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" part="logo" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2" viewBox="0 0 1600 500"><g fill="#fff"><path d="M994.287 93.486c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31m0-93.486c-34.509 0-62.484 27.976-62.484 62.486v187.511c0 68.943-56.09 125.033-125.032 125.033s-125.03-56.09-125.03-125.033V62.486C681.741 27.976 653.765 0 619.256 0s-62.484 27.976-62.484 62.486v187.511C556.772 387.85 668.921 500 806.771 500c137.851 0 250.001-112.15 250.001-250.003V62.486c0-34.51-27.976-62.486-62.485-62.486M1537.51 468.511c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31m-275.883-218.509-143.33 143.329c-24.402 24.402-24.402 63.966 0 88.368 24.402 24.402 63.967 24.402 88.369 0l143.33-143.329 143.328 143.329c24.402 24.4 63.967 24.402 88.369 0 24.403-24.402 24.403-63.966.001-88.368l-143.33-143.329.001-.004 143.329-143.329c24.402-24.402 24.402-63.965 0-88.367s-63.967-24.402-88.369 0L1349.996 161.63 1206.667 18.302c-24.402-24.401-63.967-24.402-88.369 0s-24.402 63.965 0 88.367l143.329 143.329v.004ZM437.511 468.521c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31M461.426 4.759C438.078-4.913 411.2.432 393.33 18.303L249.999 161.632 106.669 18.303C88.798.432 61.922-4.913 38.573 4.759 15.224 14.43-.001 37.214-.001 62.488v375.026c0 34.51 27.977 62.486 62.487 62.486 34.51 0 62.486-27.976 62.486-62.486V213.341l80.843 80.844c24.404 24.402 63.965 24.402 88.369 0l80.843-80.844v224.173c0 34.51 27.976 62.486 62.486 62.486s62.486-27.976 62.486-62.486V62.488c0-25.274-15.224-48.058-38.573-57.729" style="fill-rule:nonzero"/></g></svg>`,aB={BEACON_COLLECTION_DOMAIN:"beacon-collection-domain",CUSTOM_DOMAIN:"custom-domain",DEBUG:"debug",DISABLE_TRACKING:"disable-tracking",DISABLE_COOKIES:"disable-cookies",DISABLE_PSEUDO_ENDED:"disable-pseudo-ended",DRM_TOKEN:"drm-token",PLAYBACK_TOKEN:"playback-token",ENV_KEY:"env-key",MAX_RESOLUTION:"max-resolution",MIN_RESOLUTION:"min-resolution",MAX_AUTO_RESOLUTION:"max-auto-resolution",RENDITION_ORDER:"rendition-order",PROGRAM_START_TIME:"program-start-time",PROGRAM_END_TIME:"program-end-time",ASSET_START_TIME:"asset-start-time",ASSET_END_TIME:"asset-end-time",METADATA_URL:"metadata-url",PLAYBACK_ID:"playback-id",PLAYER_SOFTWARE_NAME:"player-software-name",PLAYER_SOFTWARE_VERSION:"player-software-version",PLAYER_INIT_TIME:"player-init-time",PREFER_CMCD:"prefer-cmcd",PREFER_PLAYBACK:"prefer-playback",START_TIME:"start-time",STREAM_TYPE:"stream-type",TARGET_LIVE_WINDOW:"target-live-window",LIVE_EDGE_OFFSET:"live-edge-offset",TYPE:"type",LOGO:"logo",CAP_RENDITION_TO_PLAYER_SIZE:"cap-rendition-to-player-size",INITIAL_BANDWIDTH_ESTIMATE_KBPS:"initial-bandwidth-estimate-kbps",INITIAL_ESTIMATE_SEGMENTS:"initial-estimate-segments",MIN_PRELOAD_SEGMENTS:"min-preload-segments"},aH=Object.values(aB),aW="mux-video",a$=class extends aC.CustomVideoElement{constructor(){super(),ax(this,ak),ax(this,ap),ax(this,av),ax(this,ab,{}),ax(this,ag,{}),ax(this,af),ax(this,aE),ax(this,ay),ax(this,a_),ax(this,aT,""),ax(this,aA,e=>{var t,i,a;let r=(i=this.nativeEl,null==(a=iK.get(i))?void 0:a.metadata),n=null!=(t=this.metadata)?t:{};this.metadata={...r,...n},(null==r?void 0:r["com.mux.video.branding"])==="mux-free-plan"&&(aP(this,aT,"default"),this.updateLogo())}),ax(this,aS),aP(this,av,iY())}static get NAME(){return aW}static get VERSION(){return aO}static get observedAttributes(){var e;return[...aH,...null!=(e=aC.CustomVideoElement.observedAttributes)?e:[]]}static getLogoHTML(e){return e&&"false"!==e?"default"===e?aU:`<img part="logo" src="${e}" />`:""}static getTemplateHTML(e={}){var t;return`
      ${aC.CustomVideoElement.getTemplateHTML(e)}
      <style>
        :host {
          position: relative;
        }
        slot[name="logo"] {
          display: flex;
          justify-content: end;
          position: absolute;
          top: 1rem;
          right: 1rem;
          opacity: 0;
          transition: opacity 0.25s ease-in-out;
          z-index: 1;
        }
        slot[name="logo"]:has([part="logo"]) {
          opacity: 1;
        }
        slot[name="logo"] [part="logo"] {
          width: 5rem;
          pointer-events: none;
          user-select: none;
        }
      </style>
      <slot name="logo">
        ${this.getLogoHTML(null!=(t=e[aB.LOGO])?t:"")}
      </slot>
    `}get preferCmcd(){var e;return null!=(e=this.getAttribute(aB.PREFER_CMCD))?e:void 0}set preferCmcd(e){e!==this.preferCmcd&&(e?tQ.includes(e)?this.setAttribute(aB.PREFER_CMCD,e):console.warn(`Invalid value for preferCmcd. Must be one of ${tQ.join()}`):this.removeAttribute(aB.PREFER_CMCD))}get playerInitTime(){return this.hasAttribute(aB.PLAYER_INIT_TIME)?+this.getAttribute(aB.PLAYER_INIT_TIME):aD(this,av)}set playerInitTime(e){e!=this.playerInitTime&&(null==e?this.removeAttribute(aB.PLAYER_INIT_TIME):this.setAttribute(aB.PLAYER_INIT_TIME,`${+e}`))}get playerSoftwareName(){var e;return null!=(e=aD(this,ay))?e:aW}set playerSoftwareName(e){aP(this,ay,e)}get playerSoftwareVersion(){var e;return null!=(e=aD(this,aE))?e:aO}set playerSoftwareVersion(e){aP(this,aE,e)}get _hls(){var e;return null==(e=aD(this,ak,aw))?void 0:e.engine}get mux(){var e;return null==(e=this.nativeEl)?void 0:e.mux}get error(){var e;return null!=(e=iJ(this.nativeEl))?e:null}get errorTranslator(){return aD(this,a_)}set errorTranslator(e){aP(this,a_,e)}get src(){return this.getAttribute("src")}set src(e){e!==this.src&&(null==e?this.removeAttribute("src"):this.setAttribute("src",e))}get type(){var e;return null!=(e=this.getAttribute(aB.TYPE))?e:void 0}set type(e){e!==this.type&&(e?this.setAttribute(aB.TYPE,e):this.removeAttribute(aB.TYPE))}get preload(){let e=this.getAttribute("preload");return""===e?"auto":["none","metadata","auto"].includes(e)?e:super.preload}set preload(e){e!=this.getAttribute("preload")&&(["","none","metadata","auto"].includes(e)?this.setAttribute("preload",e):this.removeAttribute("preload"))}get debug(){return null!=this.getAttribute(aB.DEBUG)}set debug(e){e!==this.debug&&(e?this.setAttribute(aB.DEBUG,""):this.removeAttribute(aB.DEBUG))}get disableTracking(){return this.hasAttribute(aB.DISABLE_TRACKING)}set disableTracking(e){e!==this.disableTracking&&this.toggleAttribute(aB.DISABLE_TRACKING,!!e)}get disableCookies(){return this.hasAttribute(aB.DISABLE_COOKIES)}set disableCookies(e){e!==this.disableCookies&&(e?this.setAttribute(aB.DISABLE_COOKIES,""):this.removeAttribute(aB.DISABLE_COOKIES))}get disablePseudoEnded(){return this.hasAttribute(aB.DISABLE_PSEUDO_ENDED)}set disablePseudoEnded(e){e!==this.disablePseudoEnded&&(e?this.setAttribute(aB.DISABLE_PSEUDO_ENDED,""):this.removeAttribute(aB.DISABLE_PSEUDO_ENDED))}get startTime(){let e=this.getAttribute(aB.START_TIME);if(null==e)return;let t=+e;return Number.isNaN(t)?void 0:t}set startTime(e){e!==this.startTime&&(null==e?this.removeAttribute(aB.START_TIME):this.setAttribute(aB.START_TIME,`${e}`))}get initialBandwidthEstimateKbps(){let e=this.getAttribute(aB.INITIAL_BANDWIDTH_ESTIMATE_KBPS);if(null==e)return;let t=+e;return Number.isNaN(t)?void 0:t}set initialBandwidthEstimateKbps(e){e!==this.initialBandwidthEstimateKbps&&(null==e?this.removeAttribute(aB.INITIAL_BANDWIDTH_ESTIMATE_KBPS):this.setAttribute(aB.INITIAL_BANDWIDTH_ESTIMATE_KBPS,`${e}`))}get initialEstimateSegments(){let e=this.getAttribute(aB.INITIAL_ESTIMATE_SEGMENTS);if(null==e)return;let t=+e;return Number.isNaN(t)?void 0:t}set initialEstimateSegments(e){e!==this.initialEstimateSegments&&(null==e?this.removeAttribute(aB.INITIAL_ESTIMATE_SEGMENTS):this.setAttribute(aB.INITIAL_ESTIMATE_SEGMENTS,`${e}`))}get minPreloadSegments(){let e=this.getAttribute(aB.MIN_PRELOAD_SEGMENTS);if(null==e)return;let t=+e;return Number.isNaN(t)?void 0:t}set minPreloadSegments(e){e!==this.minPreloadSegments&&(null==e?this.removeAttribute(aB.MIN_PRELOAD_SEGMENTS):this.setAttribute(aB.MIN_PRELOAD_SEGMENTS,`${e}`))}get playbackId(){var e;return this.hasAttribute(aB.PLAYBACK_ID)?this.getAttribute(aB.PLAYBACK_ID):null!=(e=iX(this.src))?e:void 0}set playbackId(e){e!==this.playbackId&&(e?this.setAttribute(aB.PLAYBACK_ID,e):this.removeAttribute(aB.PLAYBACK_ID))}get maxResolution(){var e;return null!=(e=this.getAttribute(aB.MAX_RESOLUTION))?e:void 0}set maxResolution(e){e!==this.maxResolution&&(e?this.setAttribute(aB.MAX_RESOLUTION,e):this.removeAttribute(aB.MAX_RESOLUTION))}get minResolution(){var e;return null!=(e=this.getAttribute(aB.MIN_RESOLUTION))?e:void 0}set minResolution(e){e!==this.minResolution&&(e?this.setAttribute(aB.MIN_RESOLUTION,e):this.removeAttribute(aB.MIN_RESOLUTION))}get maxAutoResolution(){var e;return null!=(e=this.getAttribute(aB.MAX_AUTO_RESOLUTION))?e:void 0}set maxAutoResolution(e){null==e?this.removeAttribute(aB.MAX_AUTO_RESOLUTION):this.setAttribute(aB.MAX_AUTO_RESOLUTION,e)}get renditionOrder(){var e;return null!=(e=this.getAttribute(aB.RENDITION_ORDER))?e:void 0}set renditionOrder(e){e!==this.renditionOrder&&(e?this.setAttribute(aB.RENDITION_ORDER,e):this.removeAttribute(aB.RENDITION_ORDER))}get programStartTime(){let e=this.getAttribute(aB.PROGRAM_START_TIME);if(null==e)return;let t=+e;return Number.isNaN(t)?void 0:t}set programStartTime(e){null==e?this.removeAttribute(aB.PROGRAM_START_TIME):this.setAttribute(aB.PROGRAM_START_TIME,`${e}`)}get programEndTime(){let e=this.getAttribute(aB.PROGRAM_END_TIME);if(null==e)return;let t=+e;return Number.isNaN(t)?void 0:t}set programEndTime(e){null==e?this.removeAttribute(aB.PROGRAM_END_TIME):this.setAttribute(aB.PROGRAM_END_TIME,`${e}`)}get assetStartTime(){let e=this.getAttribute(aB.ASSET_START_TIME);if(null==e)return;let t=+e;return Number.isNaN(t)?void 0:t}set assetStartTime(e){null==e?this.removeAttribute(aB.ASSET_START_TIME):this.setAttribute(aB.ASSET_START_TIME,`${e}`)}get assetEndTime(){let e=this.getAttribute(aB.ASSET_END_TIME);if(null==e)return;let t=+e;return Number.isNaN(t)?void 0:t}set assetEndTime(e){null==e?this.removeAttribute(aB.ASSET_END_TIME):this.setAttribute(aB.ASSET_END_TIME,`${e}`)}get customDomain(){var e;return null!=(e=this.getAttribute(aB.CUSTOM_DOMAIN))?e:void 0}set customDomain(e){e!==this.customDomain&&(e?this.setAttribute(aB.CUSTOM_DOMAIN,e):this.removeAttribute(aB.CUSTOM_DOMAIN))}get capRenditionToPlayerSize(){var e;return(null==(e=this._hlsConfig)?void 0:e.capLevelToPlayerSize)!=null?this._hlsConfig.capLevelToPlayerSize:aD(this,aS)}set capRenditionToPlayerSize(e){aP(this,aS,e)}get drmToken(){var e;return null!=(e=this.getAttribute(aB.DRM_TOKEN))?e:void 0}set drmToken(e){e!==this.drmToken&&(e?this.setAttribute(aB.DRM_TOKEN,e):this.removeAttribute(aB.DRM_TOKEN))}get playbackToken(){var e,t,i,a;if(this.hasAttribute(aB.PLAYBACK_TOKEN))return null!=(e=this.getAttribute(aB.PLAYBACK_TOKEN))?e:void 0;if(this.hasAttribute(aB.PLAYBACK_ID)){let[,e]=t3(null!=(t=this.playbackId)?t:"");return null!=(i=new URLSearchParams(e).get("token"))?i:void 0}if(this.src)return null!=(a=new URLSearchParams(this.src).get("token"))?a:void 0}set playbackToken(e){e!==this.playbackToken&&(e?this.setAttribute(aB.PLAYBACK_TOKEN,e):this.removeAttribute(aB.PLAYBACK_TOKEN))}get tokens(){let e=this.getAttribute(aB.PLAYBACK_TOKEN),t=this.getAttribute(aB.DRM_TOKEN);return{...aD(this,ag),...null!=e?{playback:e}:{},...null!=t?{drm:t}:{}}}set tokens(e){aP(this,ag,null!=e?e:{})}get ended(){return i5(this.nativeEl,this._hls)}get envKey(){var e;return null!=(e=this.getAttribute(aB.ENV_KEY))?e:void 0}set envKey(e){e!==this.envKey&&(e?this.setAttribute(aB.ENV_KEY,e):this.removeAttribute(aB.ENV_KEY))}get beaconCollectionDomain(){var e;return null!=(e=this.getAttribute(aB.BEACON_COLLECTION_DOMAIN))?e:void 0}set beaconCollectionDomain(e){e!==this.beaconCollectionDomain&&(e?this.setAttribute(aB.BEACON_COLLECTION_DOMAIN,e):this.removeAttribute(aB.BEACON_COLLECTION_DOMAIN))}get streamType(){var e;return null!=(e=this.getAttribute(aB.STREAM_TYPE))?e:i0(this.nativeEl)}set streamType(e){e!==this.streamType&&(e?this.setAttribute(aB.STREAM_TYPE,e):this.removeAttribute(aB.STREAM_TYPE))}get targetLiveWindow(){var e,t,i;return this.hasAttribute(aB.TARGET_LIVE_WINDOW)?+this.getAttribute(aB.TARGET_LIVE_WINDOW):(e=this.nativeEl,null!=(i=null==(t=iK.get(e))?void 0:t.targetLiveWindow)?i:NaN)}set targetLiveWindow(e){e!=this.targetLiveWindow&&(null==e?this.removeAttribute(aB.TARGET_LIVE_WINDOW):this.setAttribute(aB.TARGET_LIVE_WINDOW,`${+e}`))}get liveEdgeStart(){var e,t;if(this.hasAttribute(aB.LIVE_EDGE_OFFSET)){let{liveEdgeOffset:i}=this,a=null!=(e=this.nativeEl.seekable.end(0))?e:0;return Math.max(null!=(t=this.nativeEl.seekable.start(0))?t:0,a-i)}return(e=>{var t;let i=null==(t=iK.get(e))?void 0:t.liveEdgeStartOffset;if("number"!=typeof i)return NaN;let a=i1(e);return a.length?a.end(a.length-1)-i:NaN})(this.nativeEl)}get liveEdgeOffset(){if(this.hasAttribute(aB.LIVE_EDGE_OFFSET))return+this.getAttribute(aB.LIVE_EDGE_OFFSET)}set liveEdgeOffset(e){e!=this.liveEdgeOffset&&(null==e?this.removeAttribute(aB.LIVE_EDGE_OFFSET):this.setAttribute(aB.LIVE_EDGE_OFFSET,`${+e}`))}get seekable(){return i1(this.nativeEl)}async addCuePoints(e){return iv(this.nativeEl,e)}get activeCuePoint(){return ig(this.nativeEl)}get cuePoints(){return function(e,t={label:im}){let i=ic(e,t.label,"metadata");return null!=i&&i.cues?Array.from(i.cues,e=>ib(e)):[]}(this.nativeEl)}async addChapters(e){return iA(this.nativeEl,e)}get activeChapter(){return ik(this.nativeEl)}get chapters(){return function(e,t={label:iy}){var i;let a=ic(e,t.label,"chapters");return null!=(i=null==a?void 0:a.cues)&&i.length?Array.from(a.cues,e=>iT(e)):[]}(this.nativeEl)}getStartDate(){return function(e,t){if(t){let i=t.playingDate;if(null!=i)return new Date(i.getTime()-1e3*e.currentTime)}return"function"==typeof e.getStartDate?e.getStartDate():new Date(NaN)}(this.nativeEl,this._hls)}get currentPdt(){var e,t;return e=this.nativeEl,(t=this._hls)&&t.playingDate?t.playingDate:new Date("function"==typeof e.getStartDate?e.getStartDate().getTime()+1e3*e.currentTime:NaN)}get preferPlayback(){let e=this.getAttribute(aB.PREFER_PLAYBACK);if("mse"===e||e===tj)return e}set preferPlayback(e){e!==this.preferPlayback&&("mse"===e||e===tj?this.setAttribute(aB.PREFER_PLAYBACK,e):this.removeAttribute(aB.PREFER_PLAYBACK))}get metadata(){return{...this.getAttributeNames().filter(e=>e.startsWith("metadata-")&&![aB.METADATA_URL].includes(e)).reduce((e,t)=>{let i=this.getAttribute(t);return null!=i&&(e[t.replace(/^metadata-/,"").replace(/-/g,"_")]=i),e},{}),...aD(this,ab)}}set metadata(e){aP(this,ab,null!=e?e:{}),this.mux&&this.mux.emit("hb",aD(this,ab))}get _hlsConfig(){return aD(this,af)}set _hlsConfig(e){aP(this,af,e)}get logo(){var e;return null!=(e=this.getAttribute(aB.LOGO))?e:aD(this,aT)}set logo(e){e?this.setAttribute(aB.LOGO,e):this.removeAttribute(aB.LOGO)}load(){i9(this,this.nativeEl,aD(this,ak,aw))}unload(){i8(this.nativeEl,aD(this,ak,aw),this)}attributeChangedCallback(e,t,i){var a,r;switch(aC.CustomVideoElement.observedAttributes.includes(e)&&!["src","autoplay","preload"].includes(e)&&super.attributeChangedCallback(e,t,i),e){case aB.PLAYER_SOFTWARE_NAME:this.playerSoftwareName=null!=i?i:void 0;break;case aB.PLAYER_SOFTWARE_VERSION:this.playerSoftwareVersion=null!=i?i:void 0;break;case"src":{let e=!!t,a=!!i;!e&&a?aN(this,ak,aI).call(this):e&&!a?this.unload():e&&a&&(this.unload(),aN(this,ak,aI).call(this));break}case"autoplay":if(i===t)break;null==(a=aD(this,ak,aw))||a.setAutoplay(this.autoplay);break;case"preload":if(i===t)break;null==(r=aD(this,ak,aw))||r.setPreload(i);break;case aB.PLAYBACK_ID:case aB.CUSTOM_DOMAIN:case aB.MAX_RESOLUTION:case aB.MIN_RESOLUTION:case aB.RENDITION_ORDER:case aB.PROGRAM_START_TIME:case aB.PROGRAM_END_TIME:case aB.ASSET_START_TIME:case aB.ASSET_END_TIME:case aB.PLAYBACK_TOKEN:this.src=iz(this);break;case aB.DEBUG:{let e=this.debug;this.mux&&console.info("Cannot toggle debug mode of mux data after initialization. Make sure you set all metadata to override before setting the src."),this._hls&&(this._hls.config.debug=e);break}case aB.METADATA_URL:i&&fetch(i).then(e=>e.json()).then(e=>this.metadata=e).catch(()=>console.error(`Unable to load or parse metadata JSON from metadata-url ${i}!`));break;case aB.STREAM_TYPE:(null==i||i!==t)&&this.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}));break;case aB.TARGET_LIVE_WINDOW:(null==i||i!==t)&&this.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0,detail:this.targetLiveWindow}));break;case aB.LOGO:(null==i||i!==t)&&this.updateLogo();break;case aB.DISABLE_TRACKING:if(null==i||i!==t){let e=this.currentTime,t=this.paused;this.unload(),aN(this,ak,aI).call(this).then(()=>{this.currentTime=e,t||this.play()})}break;case aB.DISABLE_COOKIES:(null==i||i!==t)&&this.disableCookies&&document.cookie.split(";").forEach(e=>{e.trim().startsWith("muxData")&&(document.cookie=e.replace(/^ +/,"").replace(/=.*/,"=;expires="+new Date().toUTCString()+";path=/"))});break;case aB.CAP_RENDITION_TO_PLAYER_SIZE:(null==i||i!==t)&&(this.capRenditionToPlayerSize=null!=i||void 0)}}updateLogo(){if(!this.shadowRoot)return;let e=this.shadowRoot.querySelector('slot[name="logo"]');e&&(e.innerHTML=this.constructor.getLogoHTML(aD(this,aT)||this.logo))}connectedCallback(){var e,t;null==(e=super.connectedCallback)||e.call(this),null==(t=this.nativeEl)||t.addEventListener("muxmetadata",aD(this,aA)),this.nativeEl&&this.src&&!aD(this,ak,aw)&&aN(this,ak,aI).call(this)}disconnectedCallback(){var e,t;null==(e=this.nativeEl)||e.removeEventListener("muxmetadata",aD(this,aA)),this.unload(),null==(t=super.disconnectedCallback)||t.call(this)}handleEvent(e){e.target===this.nativeEl&&this.dispatchEvent(new CustomEvent(e.type,{composed:!0,detail:e.detail}))}};ap=new WeakMap,av=new WeakMap,ab=new WeakMap,ag=new WeakMap,af=new WeakMap,aE=new WeakMap,ay=new WeakMap,a_=new WeakMap,aT=new WeakMap,aA=new WeakMap,ak=new WeakSet,aw=function(){var e,t;return e=this.nativeEl,null==(t=iK.get(e))?void 0:t.coreReference},aS=new WeakMap,aI=async function(){aD(this,ap)||(await aP(this,ap,Promise.resolve()),aP(this,ap,null),this.load())};let aq=new WeakMap;class aV extends Error{}class aF extends Error{}let aK=["application/x-mpegURL","application/vnd.apple.mpegurl","audio/mpegurl"];function aG(){return globalThis.cast?.framework?.CastContext.getInstance()}function aj(){return aG()?.getCurrentSession()}function aY(){return aj()?.getSessionObj().media[0]}function aQ(e){return aG().setOptions({...az(),...e})}function az(){return{receiverApplicationId:"CC1AD845",autoJoinPolicy:"origin_scoped",androidReceiverCompatible:!1,language:"en-US",resumeSavedSession:!0}}function aZ(e){if(!e)return;let t=e.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);return t?t[1]:null}function aX(e){let t=e.split("\n").find(e=>!e.trim().startsWith("#")&&""!==e.trim());return t?.trim()}async function aJ(e){if(!e)return!1;if(/\.m3u8?(\?.*)?$/i.test(e))return!0;if(e.startsWith("blob:"))return!1;try{let t=(await fetch(e,{method:"HEAD"})).headers.get("Content-Type");return aK.some(e=>t===e)}catch(e){return console.error("Error while trying to get the Content-Type of the manifest",e),!1}}async function a0(e){if(!e||e.startsWith("blob:"))return{videoFormat:void 0,audioFormat:void 0};try{let t=await (await fetch(e)).text(),i=t,a=function(e){let t=e.split("\n"),i=[];for(let e=0;e<t.length;e++)if(t[e].trim().startsWith("#EXT-X-STREAM-INF")){let a=t[e+1]?t[e+1].trim():"";a&&!a.startsWith("#")&&i.push(a)}return i}(t);if(a.length>0){let t=new URL(a[0],e).toString();i=await (await fetch(t)).text()}let r=aX(i),n=aZ(r),s=function(e){for(let t of e.split("\n")){let e=t.trim();if(e.startsWith("#EXT-X-MEDIA")&&/TYPE=AUDIO/i.test(e)){let t=e.match(/URI="([^"]+)"/i);if(t)return t[1]}}}(t),o=n;if(s)try{let t=new URL(s,e).toString(),i=await (await fetch(t)).text(),a=aX(i);o=aZ(a)??n}catch(e){console.error("Error while trying to parse the audio rendition playlist",e)}return{videoFormat:n,audioFormat:o}}catch(e){return console.error("Error while trying to parse the manifest playlist",e),{videoFormat:void 0,audioFormat:void 0}}}let a1=new(globalThis.WeakRef?class extends Set{add(e){super.add(new WeakRef(e))}forEach(e){super.forEach(t=>{let i=t.deref();i&&e(i)})}}:Set),a2=new WeakSet;ra=()=>{globalThis.chrome?.cast?.isAvailable?t||(t=cast.framework,aG().addEventListener(t.CastContextEventType.CAST_STATE_CHANGED,e=>{a1.forEach(t=>aq.get(t).onCastStateChanged?.(e))}),aG().addEventListener(t.CastContextEventType.SESSION_STATE_CHANGED,e=>{a1.forEach(t=>aq.get(t).onSessionStateChanged?.(e))}),a1.forEach(e=>aq.get(e).init?.())):console.debug("chrome.cast.isAvailable",globalThis.chrome?.cast?.isAvailable)},globalThis.chrome?.cast?.isAvailable?globalThis.cast?.framework?ra():customElements.whenDefined("google-cast-button").then(ra):globalThis.__onGCastApiAvailable=()=>{customElements.whenDefined("google-cast-button").then(ra)};let a3=0;class a4 extends EventTarget{#e;#t;#i;#a;#r="disconnected";#n=!1;#s=new Set;#o=new WeakMap;#l=()=>this.#d();constructor(e){super(),this.#e=e,a1.add(this),aq.set(this,{init:()=>this.#u(),onCastStateChanged:()=>this.#c(),onSessionStateChanged:()=>this.#h(),getCastPlayer:()=>this.#m}),this.#u()}destroy(){this.#e?.textTracks?.removeEventListener("change",this.#l),this.#a&&this.#i?.controller&&Object.entries(this.#a).forEach(([e,t])=>{this.#i.controller.removeEventListener(e,t)}),this.#e&&a2.delete(this.#e),this.#t=!1}get #m(){if(a2.has(this.#e))return this.#i}get state(){return this.#r}async watchAvailability(e){if(this.#e.disableRemotePlayback)throw new aV("disableRemotePlayback attribute is present.");return this.#o.set(e,++a3),this.#s.add(e),queueMicrotask(()=>e(this.#p())),a3}async cancelWatchAvailability(e){if(this.#e.disableRemotePlayback)throw new aV("disableRemotePlayback attribute is present.");e?this.#s.delete(e):this.#s.clear()}async prompt(){if(this.#e.disableRemotePlayback)throw new aV("disableRemotePlayback attribute is present.");if(!globalThis.chrome?.cast?.isAvailable)throw new aF("The RemotePlayback API is disabled on this platform.");let e=a2.has(this.#e);a2.add(this.#e),aQ(this.#e.castOptions),Object.entries(this.#a).forEach(([e,t])=>{this.#i.controller.addEventListener(e,t)});try{await aG().requestSession()}catch(t){if(e||a2.delete(this.#e),"cancel"===t)return;throw Error(t)}aq.get(this.#e)?.loadOnPrompt?.()}#v(){a2.has(this.#e)&&(Object.entries(this.#a).forEach(([e,t])=>{this.#i.controller.removeEventListener(e,t)}),a2.delete(this.#e),this.#e.muted=this.#i.isMuted,this.#e.currentTime=this.#i.savedPlayerState.currentTime,!1===this.#i.savedPlayerState.isPaused&&this.#e.play())}#p(){let e=aG()?.getCastState();return e&&"NO_DEVICES_AVAILABLE"!==e}#c(){let e=aG().getCastState();if(a2.has(this.#e)&&"CONNECTING"===e&&(this.#r="connecting",this.dispatchEvent(new Event("connecting"))),!this.#n&&e?.includes("CONNECT"))for(let e of(this.#n=!0,this.#s))e(!0);else if(this.#n&&(!e||"NO_DEVICES_AVAILABLE"===e))for(let e of(this.#n=!1,this.#s))e(!1)}async #h(){let{SESSION_RESUMED:e}=t.SessionState;if(aG().getSessionState()===e&&this.#e.castSrc===aY()?.media.contentId){a2.add(this.#e),Object.entries(this.#a).forEach(([e,t])=>{this.#i.controller.addEventListener(e,t)});try{var i;await (i=new chrome.cast.media.GetStatusRequest,new Promise((e,t)=>{aY().getStatus(i,e,t)}))}catch(e){console.error(e)}this.#a[t.RemotePlayerEventType.IS_PAUSED_CHANGED](),this.#a[t.RemotePlayerEventType.PLAYER_STATE_CHANGED]()}}#u(){t&&!this.#t&&(this.#t=!0,aQ(this.#e.castOptions),this.#e.textTracks.addEventListener("change",this.#l),this.#c(),this.#i=new t.RemotePlayer,new t.RemotePlayerController(this.#i),this.#a={[t.RemotePlayerEventType.IS_CONNECTED_CHANGED]:({value:e})=>{!0===e?(this.#r="connected",this.dispatchEvent(new Event("connect"))):(this.#v(),this.#r="disconnected",this.dispatchEvent(new Event("disconnect")))},[t.RemotePlayerEventType.DURATION_CHANGED]:()=>{this.#e.dispatchEvent(new Event("durationchange"))},[t.RemotePlayerEventType.VOLUME_LEVEL_CHANGED]:()=>{this.#e.dispatchEvent(new Event("volumechange"))},[t.RemotePlayerEventType.IS_MUTED_CHANGED]:()=>{this.#e.dispatchEvent(new Event("volumechange"))},[t.RemotePlayerEventType.CURRENT_TIME_CHANGED]:()=>{this.#m?.isMediaLoaded&&this.#e.dispatchEvent(new Event("timeupdate"))},[t.RemotePlayerEventType.VIDEO_INFO_CHANGED]:()=>{this.#e.dispatchEvent(new Event("resize"))},[t.RemotePlayerEventType.IS_PAUSED_CHANGED]:()=>{this.#e.dispatchEvent(new Event(this.paused?"pause":"play"))},[t.RemotePlayerEventType.PLAYER_STATE_CHANGED]:()=>{this.#m?.playerState!==chrome.cast.media.PlayerState.PAUSED&&this.#e.dispatchEvent(new Event({[chrome.cast.media.PlayerState.PLAYING]:"playing",[chrome.cast.media.PlayerState.BUFFERING]:"waiting",[chrome.cast.media.PlayerState.IDLE]:"emptied"}[this.#m?.playerState]))},[t.RemotePlayerEventType.IS_MEDIA_LOADED_CHANGED]:async()=>{this.#m?.isMediaLoaded&&(await Promise.resolve(),this.#b())}})}#b(){this.#d()}async #d(){let e;if(!this.#m)return;let t=(this.#i.mediaInfo?.tracks??[]).filter(({type:e})=>e===chrome.cast.media.TrackType.TEXT),i=[...this.#e.textTracks].filter(({kind:e})=>"subtitles"===e||"captions"===e),a=t.map(({language:e,name:t,trackId:a})=>{let{mode:r}=i.find(i=>i.language===e&&i.label===t)??{};return!!r&&{mode:r,trackId:a}}).filter(Boolean),r=a.filter(({mode:e})=>"showing"!==e).map(({trackId:e})=>e),n=a.find(({mode:e})=>"showing"===e),s=aj()?.getSessionObj().media[0]?.activeTrackIds??[],o=s;if(s.length&&(o=o.filter(e=>!r.includes(e))),n?.trackId&&(o=[...o,n.trackId]),e=o=[...new Set(o)],!(s.length===e.length&&s.every(t=>e.includes(t))))try{let e=new chrome.cast.media.EditTracksInfoRequest(o);await new Promise((t,i)=>{aY().editTracksInfo(e,t,i)})}catch(e){console.error(e)}}}let a5=e=>class extends e{static observedAttributes=[...e.observedAttributes??[],"cast-src","cast-content-type","cast-stream-type","cast-receiver"];#g={paused:!1};#f=az();#E;#y;get remote(){if(this.#y)return this.#y;if(globalThis.chrome){if(!this.isConnected)return;return this.disableRemotePlayback||function(){let e="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";if(globalThis.chrome?.cast||document.querySelector(`script[src="${e}"]`))return;let t=document.createElement("script");t.src=e,document.head.append(t)}(),aq.set(this,{loadOnPrompt:()=>this.#_()}),this.#y=new a4(this)}return super.remote}get #m(){return aq.get(this.#y)?.getCastPlayer?.()}disconnectedCallback(){this.#y?.destroy(),this.#y=null,aq.delete(this),super.disconnectedCallback?.()}attributeChangedCallback(e,t,i){if(super.attributeChangedCallback(e,t,i),"cast-receiver"===e&&i){this.#f.receiverApplicationId=i;return}if(this.#m)switch(e){case"cast-stream-type":case"cast-src":this.load()}}async #_(){this.#g.paused=super.paused,super.pause(),this.muted=super.muted;try{await this.load()}catch(e){console.error(e)}}async load(){if(!this.#m)return super.load();let e=new chrome.cast.media.MediaInfo(this.castSrc,this.castContentType);e.customData=this.castCustomData;let t=[...this.querySelectorAll("track")].filter(({kind:e,src:t})=>t&&("subtitles"===e||"captions"===e)),i=[],a=0;if(t.length&&(e.tracks=t.map(e=>{let t=++a;0===i.length&&"showing"===e.track.mode&&i.push(t);let r=new chrome.cast.media.Track(t,chrome.cast.media.TrackType.TEXT);return r.trackContentId=e.src,r.trackContentType="text/vtt",r.subtype="captions"===e.kind?chrome.cast.media.TextTrackType.CAPTIONS:chrome.cast.media.TextTrackType.SUBTITLES,r.name=e.label,r.language=e.srclang,r})),"live"===this.castStreamType?e.streamType=chrome.cast.media.StreamType.LIVE:e.streamType=chrome.cast.media.StreamType.BUFFERED,e.metadata=new chrome.cast.media.GenericMediaMetadata,e.metadata.title=this.title,e.metadata.images=[{url:this.poster}],await aJ(this.castSrc)){e.contentType||(e.contentType="application/x-mpegURL");let{videoFormat:t,audioFormat:i}=await a0(this.castSrc);t?.includes("m4s")||t?.includes("mp4")||t?.includes("m4a")?(e.hlsSegmentFormat=chrome.cast.media.HlsSegmentFormat.FMP4,e.hlsVideoSegmentFormat=chrome.cast.media.HlsVideoSegmentFormat.FMP4):i?.includes("aac")?(e.hlsSegmentFormat=chrome.cast.media.HlsSegmentFormat.AAC,e.hlsVideoSegmentFormat=chrome.cast.media.HlsVideoSegmentFormat.MPEG2_TS):(t?.includes("ts")||i?.includes("ts"))&&(e.hlsSegmentFormat=chrome.cast.media.HlsSegmentFormat.TS,e.hlsVideoSegmentFormat=chrome.cast.media.HlsVideoSegmentFormat.MPEG2_TS)}let r=new chrome.cast.media.LoadRequest(e);r.currentTime=super.currentTime??0,r.autoplay=!this.#g.paused,r.activeTrackIds=i,await aj()?.loadMedia(r),this.dispatchEvent(new Event("volumechange"))}play(){if(this.#m){this.#m.isPaused&&this.#m.controller?.playOrPause();return}return super.play()}pause(){if(this.#m){this.#m.isPaused||this.#m.controller?.playOrPause();return}super.pause()}get castOptions(){return this.#f}get castReceiver(){return this.getAttribute("cast-receiver")??void 0}set castReceiver(e){this.castReceiver!=e&&this.setAttribute("cast-receiver",`${e}`)}get castSrc(){let e=this.currentSrc,t=e?.startsWith("blob:")?void 0:e;return this.getAttribute("cast-src")??this.querySelector("source")?.src??t??this.getAttribute("src")??void 0}set castSrc(e){this.castSrc!=e&&this.setAttribute("cast-src",`${e}`)}get castContentType(){return this.getAttribute("cast-content-type")??void 0}set castContentType(e){this.setAttribute("cast-content-type",`${e}`)}get castStreamType(){return this.getAttribute("cast-stream-type")??this.streamType??void 0}set castStreamType(e){this.setAttribute("cast-stream-type",`${e}`)}get castCustomData(){return this.#E}set castCustomData(e){let t=typeof e;["object","undefined"].includes(t)?this.#E=e:console.error(`castCustomData must be nullish or an object but value was of type ${t}`)}get readyState(){if(this.#m)switch(this.#m.playerState){case chrome.cast.media.PlayerState.IDLE:return 0;case chrome.cast.media.PlayerState.BUFFERING:return 2;default:return 3}return super.readyState}get paused(){return this.#m?this.#m.isPaused:super.paused}get muted(){return this.#m?this.#m?.isMuted:super.muted}set muted(e){if(this.#m){(e&&!this.#m.isMuted||!e&&this.#m.isMuted)&&this.#m.controller?.muteOrUnmute();return}super.muted=e}get volume(){return this.#m?this.#m?.volumeLevel??1:super.volume}set volume(e){if(this.#m){this.#m.volumeLevel=+e,this.#m.controller?.setVolumeLevel();return}super.volume=e}get duration(){return this.#m&&this.#m?.isMediaLoaded?this.#m?.duration??NaN:super.duration}get currentTime(){return this.#m&&this.#m?.isMediaLoaded?this.#m?.currentTime??0:super.currentTime}set currentTime(e){if(this.#m){this.#m.currentTime=e,this.#m.controller?.seek();return}super.currentTime=e}};e.i(91205);var a9=e.i(7180),a8=e=>{throw TypeError(e)},a6=(e,t,i)=>t.has(e)||a8("Cannot "+i),a7=(e,t,i)=>(a6(e,t,"read from private field"),i?i.call(e):t.get(e)),re=(e,t,i)=>t.has(e)?a8("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,i),rt=(e,t,i,a)=>(a6(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),ri=class{addEventListener(){}removeEventListener(){}dispatchEvent(e){return!0}};"u"<typeof DocumentFragment&&(globalThis.DocumentFragment=class extends ri{});var ra,rr,rn=class extends ri{},rs=class{constructor(e,t={}){re(this,rr),rt(this,rr,null==t?void 0:t.detail)}get detail(){return a7(this,rr)}initCustomEvent(){}};rr=new WeakMap;var ro={document:{createElement:function(e,t){return new rn}},DocumentFragment,customElements:{get(e){},define(e,t,i){},getName:e=>null,upgrade(e){},whenDefined:e=>Promise.resolve(rn)},CustomEvent:rs,EventTarget:ri,HTMLElement:rn,HTMLVideoElement:class extends ri{}},rl="u"<typeof window||void 0===globalThis.customElements,rd=rl?ro:globalThis;rl&&ro.document;var ru,rc=class extends a5((0,a9.MediaTracksMixin)(a$)){constructor(){super(...arguments),re(this,ru)}get autoplay(){let e=this.getAttribute("autoplay");return null!==e&&(""===e||e)}set autoplay(e){e!==this.autoplay&&(e?this.setAttribute("autoplay","string"==typeof e?e:""):this.removeAttribute("autoplay"))}get muxCastCustomData(){return{mux:{playbackId:this.playbackId,minResolution:this.minResolution,maxResolution:this.maxResolution,renditionOrder:this.renditionOrder,customDomain:this.customDomain,tokens:{drm:this.drmToken},envKey:this.envKey,metadata:this.metadata,disableCookies:this.disableCookies,disableTracking:this.disableTracking,beaconCollectionDomain:this.beaconCollectionDomain,startTime:this.startTime,preferCmcd:this.preferCmcd}}}get castCustomData(){var e;return null!=(e=a7(this,ru))?e:this.muxCastCustomData}set castCustomData(e){rt(this,ru,e)}};ru=new WeakMap,rd.customElements.get("mux-video")||(rd.customElements.define("mux-video",rc),rd.MuxVideoElement=rc);let rh={MEDIA_PLAY_REQUEST:"mediaplayrequest",MEDIA_PAUSE_REQUEST:"mediapauserequest",MEDIA_MUTE_REQUEST:"mediamuterequest",MEDIA_UNMUTE_REQUEST:"mediaunmuterequest",MEDIA_LOOP_REQUEST:"medialooprequest",MEDIA_VOLUME_REQUEST:"mediavolumerequest",MEDIA_SEEK_REQUEST:"mediaseekrequest",MEDIA_AIRPLAY_REQUEST:"mediaairplayrequest",MEDIA_ENTER_FULLSCREEN_REQUEST:"mediaenterfullscreenrequest",MEDIA_EXIT_FULLSCREEN_REQUEST:"mediaexitfullscreenrequest",MEDIA_PREVIEW_REQUEST:"mediapreviewrequest",MEDIA_ENTER_PIP_REQUEST:"mediaenterpiprequest",MEDIA_EXIT_PIP_REQUEST:"mediaexitpiprequest",MEDIA_ENTER_CAST_REQUEST:"mediaentercastrequest",MEDIA_EXIT_CAST_REQUEST:"mediaexitcastrequest",MEDIA_SHOW_TEXT_TRACKS_REQUEST:"mediashowtexttracksrequest",MEDIA_HIDE_TEXT_TRACKS_REQUEST:"mediahidetexttracksrequest",MEDIA_SHOW_SUBTITLES_REQUEST:"mediashowsubtitlesrequest",MEDIA_DISABLE_SUBTITLES_REQUEST:"mediadisablesubtitlesrequest",MEDIA_TOGGLE_SUBTITLES_REQUEST:"mediatogglesubtitlesrequest",MEDIA_PLAYBACK_RATE_REQUEST:"mediaplaybackraterequest",MEDIA_RENDITION_REQUEST:"mediarenditionrequest",MEDIA_AUDIO_TRACK_REQUEST:"mediaaudiotrackrequest",MEDIA_SEEK_TO_LIVE_REQUEST:"mediaseektoliverequest",REGISTER_MEDIA_STATE_RECEIVER:"registermediastatereceiver",UNREGISTER_MEDIA_STATE_RECEIVER:"unregistermediastatereceiver"},rm={MEDIA_CHROME_ATTRIBUTES:"mediachromeattributes",MEDIA_CONTROLLER:"mediacontroller"},rp={MEDIA_AIRPLAY_UNAVAILABLE:"mediaAirplayUnavailable",MEDIA_AUDIO_TRACK_ENABLED:"mediaAudioTrackEnabled",MEDIA_AUDIO_TRACK_LIST:"mediaAudioTrackList",MEDIA_AUDIO_TRACK_UNAVAILABLE:"mediaAudioTrackUnavailable",MEDIA_BUFFERED:"mediaBuffered",MEDIA_CAST_UNAVAILABLE:"mediaCastUnavailable",MEDIA_CHAPTERS_CUES:"mediaChaptersCues",MEDIA_CURRENT_TIME:"mediaCurrentTime",MEDIA_DURATION:"mediaDuration",MEDIA_ENDED:"mediaEnded",MEDIA_ERROR:"mediaError",MEDIA_ERROR_CODE:"mediaErrorCode",MEDIA_ERROR_MESSAGE:"mediaErrorMessage",MEDIA_FULLSCREEN_UNAVAILABLE:"mediaFullscreenUnavailable",MEDIA_HAS_PLAYED:"mediaHasPlayed",MEDIA_HEIGHT:"mediaHeight",MEDIA_IS_AIRPLAYING:"mediaIsAirplaying",MEDIA_IS_CASTING:"mediaIsCasting",MEDIA_IS_FULLSCREEN:"mediaIsFullscreen",MEDIA_IS_PIP:"mediaIsPip",MEDIA_LOADING:"mediaLoading",MEDIA_MUTED:"mediaMuted",MEDIA_LOOP:"mediaLoop",MEDIA_PAUSED:"mediaPaused",MEDIA_PIP_UNAVAILABLE:"mediaPipUnavailable",MEDIA_PLAYBACK_RATE:"mediaPlaybackRate",MEDIA_PREVIEW_CHAPTER:"mediaPreviewChapter",MEDIA_PREVIEW_COORDS:"mediaPreviewCoords",MEDIA_PREVIEW_IMAGE:"mediaPreviewImage",MEDIA_PREVIEW_TIME:"mediaPreviewTime",MEDIA_RENDITION_LIST:"mediaRenditionList",MEDIA_RENDITION_SELECTED:"mediaRenditionSelected",MEDIA_RENDITION_UNAVAILABLE:"mediaRenditionUnavailable",MEDIA_SEEKABLE:"mediaSeekable",MEDIA_STREAM_TYPE:"mediaStreamType",MEDIA_SUBTITLES_LIST:"mediaSubtitlesList",MEDIA_SUBTITLES_SHOWING:"mediaSubtitlesShowing",MEDIA_TARGET_LIVE_WINDOW:"mediaTargetLiveWindow",MEDIA_TIME_IS_LIVE:"mediaTimeIsLive",MEDIA_VOLUME:"mediaVolume",MEDIA_VOLUME_LEVEL:"mediaVolumeLevel",MEDIA_VOLUME_UNAVAILABLE:"mediaVolumeUnavailable",MEDIA_LANG:"mediaLang",MEDIA_WIDTH:"mediaWidth"},rv=Object.entries(rp),rb=rv.reduce((e,[t,i])=>(e[t]=i.toLowerCase(),e),{}),rg=rv.reduce((e,[t,i])=>(e[t]=i.toLowerCase(),e),{USER_INACTIVE_CHANGE:"userinactivechange",BREAKPOINTS_CHANGE:"breakpointchange",BREAKPOINTS_COMPUTED:"breakpointscomputed"}),rf=Object.entries(rg).reduce((e,[t,i])=>{let a=rb[t];return a&&(e[i]=a),e},{userinactivechange:"userinactive"}),rE=Object.entries(rb).reduce((e,[t,i])=>{let a=rg[t];return a&&(e[i]=a),e},{userinactive:"userinactivechange"}),ry={SUBTITLES:"subtitles",CAPTIONS:"captions",DESCRIPTIONS:"descriptions",CHAPTERS:"chapters",METADATA:"metadata"},r_={DISABLED:"disabled",HIDDEN:"hidden",SHOWING:"showing"},rT={HAVE_NOTHING:0,HAVE_METADATA:1,HAVE_CURRENT_DATA:2,HAVE_FUTURE_DATA:3,HAVE_ENOUGH_DATA:4},rA={MOUSE:"mouse",PEN:"pen",TOUCH:"touch"},rk={UNAVAILABLE:"unavailable",UNSUPPORTED:"unsupported"},rw={LIVE:"live",ON_DEMAND:"on-demand",UNKNOWN:"unknown"},rS={HIGH:"high",MEDIUM:"medium",LOW:"low",OFF:"off"},rI={INLINE:"inline",FULLSCREEN:"fullscreen",PICTURE_IN_PICTURE:"picture-in-picture"};function rR(e){if(e){let{id:t,width:i,height:a}=e;return[t,i,a].filter(e=>null!=e).join(":")}}function rC(e){if(e){let[t,i,a]=e.split(":");return{id:t,width:+i,height:+a}}}function rL(e){if(e){let{id:t,kind:i,language:a,label:r}=e;return[t,i,a,r].filter(e=>null!=e).join(":")}}function rM(e){if(e){let[t,i,a,r]=e.split(":");return{id:t,kind:i,language:a,label:r}}}function rD(e){return"number"==typeof e&&!Number.isNaN(e)&&Number.isFinite(e)}function rx(e){return"string"==typeof e&&!isNaN(e)&&!isNaN(parseFloat(e))}e.s(["AttributeToStateChangeEventMap",()=>rE,"AvailabilityStates",()=>rk,"MediaStateChangeEvents",()=>rg,"MediaStateReceiverAttributes",()=>rm,"MediaUIAttributes",()=>rb,"MediaUIEvents",()=>rh,"MediaUIProps",()=>rp,"PointerTypes",()=>rA,"ReadyStates",()=>rT,"StateChangeEventToAttributeMap",()=>rf,"StreamTypes",()=>rw,"TextTrackKinds",()=>ry,"TextTrackModes",()=>r_,"VolumeLevels",()=>rS,"WebkitPresentationModes",()=>rI],92617),e.i(92617);let rP=e=>new Promise(t=>setTimeout(t,e)),rN={en:{"Start airplay":"Start airplay","Stop airplay":"Stop airplay",Audio:"Audio",Captions:"Captions","Enable captions":"Enable captions","Disable captions":"Disable captions","Start casting":"Start casting","Stop casting":"Stop casting","Enter fullscreen mode":"Enter fullscreen mode","Exit fullscreen mode":"Exit fullscreen mode",Mute:"Mute",Unmute:"Unmute",Loop:"Loop","Enter picture in picture mode":"Enter picture in picture mode","Exit picture in picture mode":"Exit picture in picture mode",Play:"Play",Pause:"Pause","Playback rate":"Playback rate","Playback rate {playbackRate}":"Playback rate {playbackRate}",Quality:"Quality","Seek backward":"Seek backward","Seek forward":"Seek forward",Settings:"Settings",Auto:"Auto","audio player":"audio player","video player":"video player",volume:"volume",seek:"seek","closed captions":"closed captions","current playback rate":"current playback rate","playback time":"playback time","media loading":"media loading",settings:"settings","audio tracks":"audio tracks",quality:"quality",play:"play",pause:"pause",mute:"mute",unmute:"unmute","chapter: {chapterName}":"chapter: {chapterName}",live:"live",Off:"Off","start airplay":"start airplay","stop airplay":"stop airplay","start casting":"start casting","stop casting":"stop casting","enter fullscreen mode":"enter fullscreen mode","exit fullscreen mode":"exit fullscreen mode","enter picture in picture mode":"enter picture in picture mode","exit picture in picture mode":"exit picture in picture mode","seek to live":"seek to live","playing live":"playing live","seek back {seekOffset} seconds":"seek back {seekOffset} seconds","seek forward {seekOffset} seconds":"seek forward {seekOffset} seconds","Network Error":"Network Error","Decode Error":"Decode Error","Source Not Supported":"Source Not Supported","Encryption Error":"Encryption Error","A network error caused the media download to fail.":"A network error caused the media download to fail.","A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.":"A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.","An unsupported error occurred. The server or network failed, or your browser does not support this format.":"An unsupported error occurred. The server or network failed, or your browser does not support this format.","The media is encrypted and there are no keys to decrypt it.":"The media is encrypted and there are no keys to decrypt it.",hour:"hour",hours:"hours",minute:"minute",minutes:"minutes",second:"second",seconds:"seconds","{time} remaining":"{time} remaining","{currentTime} of {totalTime}":"{currentTime} of {totalTime}","video not loaded, unknown time.":"video not loaded, unknown time."}},rO=(null==(uP=globalThis.navigator)?void 0:uP.language)||"en",rU=(e,t={})=>(e=>{var t,i,a;let[r]=rO.split("-");return(null==(t=rN[rO])?void 0:t[e])||(null==(i=rN[r])?void 0:i[e])||(null==(a=rN.en)?void 0:a[e])||e})(e).replace(/\{(\w+)\}/g,(e,i)=>i in t?String(t[i]):`{${i}}`),rB=[{singular:"hour",plural:"hours"},{singular:"minute",plural:"minutes"},{singular:"second",plural:"seconds"}],rH=e=>{if(!rD(e))return"";let t=Math.abs(e),i=t!==e,a=new Date(0,0,0,0,0,t,0),r=[a.getHours(),a.getMinutes(),a.getSeconds()].map((e,t)=>{let i;return e&&(i=1===e?rU(rB[t].singular):rU(rB[t].plural),`${e} ${i}`)}).filter(e=>e).join(", ");return i?rU("{time} remaining",{time:r}):r};function rW(e,t){let i=!1;e<0&&(i=!0,e=0-e);let a=Math.floor((e=e<0?0:e)%60),r=Math.floor(e/60%60),n=Math.floor(e/3600),s=Math.floor(t/60%60),o=Math.floor(t/3600);return(isNaN(e)||e===1/0)&&(n=r=a="0"),r=(((n=n>0||o>0?n+":":"")||s>=10)&&r<10?"0"+r:r)+":",(i?"-":"")+n+r+(a=a<10?"0"+a:a)}let r$=Object.freeze({length:0,start(e){let t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'start' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0},end(e){let t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'end' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0}});function rq(e=r$){return Array.from(e).map((t,i)=>[Number(e.start(i).toFixed(3)),Number(e.end(i).toFixed(3))].join(":")).join(" ")}e.s(["emptyTimeRanges",()=>r$,"formatAsTimePhrase",()=>rH,"formatTime",()=>rW,"serializeTimeRanges",()=>rq],38333),e.i(38333);class rV{addEventListener(){}removeEventListener(){}dispatchEvent(){return!0}}class rF extends rV{}class rK extends rF{constructor(){super(...arguments),this.role=null}}let rG={createElement:function(){return new rj.HTMLElement},createElementNS:function(){return new rj.HTMLElement},addEventListener(){},removeEventListener(){},dispatchEvent:e=>!1},rj={ResizeObserver:class{observe(){}unobserve(){}disconnect(){}},document:rG,Node:rF,Element:rK,HTMLElement:class extends rK{constructor(){super(...arguments),this.innerHTML=""}get content(){return new rj.DocumentFragment}},DocumentFragment:class extends rV{},customElements:{get:function(){},define:function(){},whenDefined:function(){}},localStorage:{getItem:e=>null,setItem(e,t){},removeItem(e){}},CustomEvent:function(){},getComputedStyle:function(){},navigator:{languages:[],get userAgent(){return""}},matchMedia:e=>({matches:!1,media:e}),DOMParser:class{parseFromString(e,t){return{body:{textContent:e}}}}},rY="global"in globalThis&&(null==globalThis?void 0:globalThis.global)===globalThis||"u"<typeof window||void 0===window.customElements,rQ=Object.keys(rj).every(e=>e in globalThis),rz=rY&&!rQ?rj:globalThis,rZ=rY&&!rQ?rG:globalThis.document,rX=new WeakMap,rJ=e=>{let t=rX.get(e);return t||rX.set(e,t=new Set),t},r0=new rz.ResizeObserver(e=>{for(let t of e)for(let e of rJ(t.target))e(t)});function r1(e,t){rJ(e).add(t),r0.observe(e)}function r2(e,t){let i=rJ(e);i.delete(t),i.size||r0.unobserve(e)}function r3(e){let t={};for(let i of e)t[i.name]=i.value;return t}function r4(e){var t;return null!=(t=r5(e))?t:r7(e,"media-controller")}function r5(e){var t;let{MEDIA_CONTROLLER:i}=rm,a=e.getAttribute(i);if(a)return null==(t=nt(e))?void 0:t.getElementById(a)}let r9=(e,t,i=".value")=>{let a=e.querySelector(i);a&&(a.textContent=t)},r8=(e,t)=>{let i,a;return(i=`slot[name="${t}"]`,!(a=e.shadowRoot.querySelector(i))?[]:a.children)[0]},r6=(e,t)=>!!e&&!!t&&(null!=e&&!!e.contains(t)||r6(e,t.getRootNode().host)),r7=(e,t)=>{if(!e)return null;let i=e.closest(t);return i||r7(e.getRootNode().host,t)};function ne(e=document){var t;let i=null==e?void 0:e.activeElement;return i?null!=(t=ne(i.shadowRoot))?t:i:null}function nt(e){var t;let i=null==(t=null==e?void 0:e.getRootNode)?void 0:t.call(e);return i instanceof ShadowRoot||i instanceof Document?i:null}function ni(e,{depth:t=3,checkOpacity:i=!0,checkVisibilityCSS:a=!0}={}){if(e.checkVisibility)return e.checkVisibility({checkOpacity:i,checkVisibilityCSS:a});let r=e;for(;r&&t>0;){let e=getComputedStyle(r);if(i&&"0"===e.opacity||a&&"hidden"===e.visibility||"none"===e.display)return!1;r=r.parentElement,t--}return!0}function na(e,t){let i=function(e,t){var i,a;let r;for(r of null!=(i=e.querySelectorAll("style:not([media])"))?i:[]){let e;try{e=null==(a=r.sheet)?void 0:a.cssRules}catch{continue}for(let i of null!=e?e:[])if(t(i.selectorText))return i}}(e,e=>e===t);return i||nr(e,t)}function nr(e,t){var i,a;let r=null!=(i=e.querySelectorAll("style:not([media])"))?i:[],n=null==r?void 0:r[r.length-1];if(!(null==n?void 0:n.sheet))return console.warn("Media Chrome: No style sheet found on style tag of",e),{style:{setProperty:()=>{},removeProperty:()=>"",getPropertyValue:()=>""}};let s=null==n?void 0:n.sheet.insertRule(`${t}{}`,n.sheet.cssRules.length);return null==(a=n.sheet.cssRules)?void 0:a[s]}function nn(e,t,i=NaN){let a=e.getAttribute(t);return null!=a?+a:i}function ns(e,t,i){let a=+i;if(null==i||Number.isNaN(a)){e.hasAttribute(t)&&e.removeAttribute(t);return}nn(e,t,void 0)!==a&&e.setAttribute(t,`${a}`)}function no(e,t){return e.hasAttribute(t)}function nl(e,t,i){if(null==i){e.hasAttribute(t)&&e.removeAttribute(t);return}no(e,t)!=i&&e.toggleAttribute(t,i)}function nd(e,t,i=null){var a;return null!=(a=e.getAttribute(t))?a:i}function nu(e,t,i){if(null==i){e.hasAttribute(t)&&e.removeAttribute(t);return}let a=`${i}`;nd(e,t,void 0)!==a&&e.setAttribute(t,a)}var nc=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},nh=(e,t,i)=>(nc(e,t,"read from private field"),i?i.call(e):t.get(e)),nm=(e,t,i,a)=>(nc(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);class np extends rz.HTMLElement{constructor(){if(super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,uN,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const e=r3(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[rm.MEDIA_CONTROLLER,rb.MEDIA_PAUSED]}attributeChangedCallback(e,t,i){var a,r,n,s,o;e===rm.MEDIA_CONTROLLER&&(t&&(null==(r=null==(a=nh(this,uN))?void 0:a.unassociateElement)||r.call(a,this),nm(this,uN,null)),i&&this.isConnected&&(nm(this,uN,null==(n=this.getRootNode())?void 0:n.getElementById(i)),null==(o=null==(s=nh(this,uN))?void 0:s.associateElement)||o.call(s,this)))}connectedCallback(){var e,t,i,a;let r;this.tabIndex=-1,this.setAttribute("aria-hidden","true"),nm(this,uN,(i=this,(r=i.getAttribute(rm.MEDIA_CONTROLLER))?null==(a=i.getRootNode())?void 0:a.getElementById(r):r7(i,"media-controller"))),this.getAttribute(rm.MEDIA_CONTROLLER)&&(null==(t=null==(e=nh(this,uN))?void 0:e.associateElement)||t.call(e,this)),nh(this,uN)&&(nh(this,uN).addEventListener("pointerdown",this),nh(this,uN).addEventListener("click",this),nh(this,uN).hasAttribute("tabindex")||(nh(this,uN).tabIndex=0))}disconnectedCallback(){var e,t,i,a;this.getAttribute(rm.MEDIA_CONTROLLER)&&(null==(t=null==(e=nh(this,uN))?void 0:e.unassociateElement)||t.call(e,this)),null==(i=nh(this,uN))||i.removeEventListener("pointerdown",this),null==(a=nh(this,uN))||a.removeEventListener("click",this),nm(this,uN,null)}handleEvent(e){var t;let i=null==(t=e.composedPath())?void 0:t[0];if(["video","media-controller"].includes(null==i?void 0:i.localName)){if("pointerdown"===e.type)this._pointerType=e.pointerType;else if("click"===e.type){let{clientX:t,clientY:i}=e,{left:a,top:r,width:n,height:s}=this.getBoundingClientRect(),o=t-a,l=i-r;if(o<0||l<0||o>n||l>s||0===n&&0===s)return;let d=this._pointerType||"mouse";if(this._pointerType=void 0,d===rA.TOUCH)return void this.handleTap(e);if(d===rA.MOUSE||d===rA.PEN)return void this.handleMouseClick(e)}}}get mediaPaused(){return no(this,rb.MEDIA_PAUSED)}set mediaPaused(e){nl(this,rb.MEDIA_PAUSED,e)}handleTap(e){}handleMouseClick(e){let t=this.mediaPaused?rh.MEDIA_PLAY_REQUEST:rh.MEDIA_PAUSE_REQUEST;this.dispatchEvent(new rz.CustomEvent(t,{composed:!0,bubbles:!0}))}}uN=new WeakMap,np.shadowRootOptions={mode:"open"},np.getTemplateHTML=function(e){return`
    <style>
      :host {
        display: var(--media-control-display, var(--media-gesture-receiver-display, inline-block));
        box-sizing: border-box;
      }
    </style>
  `},rz.customElements.get("media-gesture-receiver")||rz.customElements.define("media-gesture-receiver",np);var nv=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},nb=(e,t,i)=>(nv(e,t,"read from private field"),i?i.call(e):t.get(e)),ng=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},nf=(e,t,i,a)=>(nv(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),nE=(e,t,i)=>(nv(e,t,"access private method"),i);let ny="audio",n_="autohide",nT="breakpoints",nA="gesturesdisabled",nk="keyboardcontrol",nw="noautohide",nS="userinactive",nI="autohideovercontrols",nR=Object.values(rb);function nC(e,t){var i,a,r;if(!e.isConnected)return;let n=Object.fromEntries((null!=(i=e.getAttribute(nT))?i:"sm:384 md:576 lg:768 xl:960").split(/\s+/).map(e=>e.split(":"))),s=(a=n,r=t,Object.keys(a).filter(e=>r>=parseInt(a[e]))),o=!1;if(Object.keys(n).forEach(t=>{if(s.includes(t)){e.hasAttribute(`breakpoint${t}`)||(e.setAttribute(`breakpoint${t}`,""),o=!0);return}e.hasAttribute(`breakpoint${t}`)&&(e.removeAttribute(`breakpoint${t}`),o=!0)}),o){let t=new CustomEvent(rg.BREAKPOINTS_CHANGE,{detail:s});e.dispatchEvent(t)}e.breakpointsComputed||(e.breakpointsComputed=!0,e.dispatchEvent(new CustomEvent(rg.BREAKPOINTS_COMPUTED,{bubbles:!0,composed:!0})))}class nL extends rz.HTMLElement{constructor(){if(super(),ng(this,uF),ng(this,uG),ng(this,uY),ng(this,uz),ng(this,uX),ng(this,uO,void 0),ng(this,uU,0),ng(this,uB,null),ng(this,uH,null),ng(this,uW,void 0),this.breakpointsComputed=!1,ng(this,u$,e=>{let t=this.media;for(let i of e)if("childList"===i.type){for(let e of i.removedNodes){if("media"!=e.slot||i.target!=this)continue;let a=i.previousSibling&&i.previousSibling.previousElementSibling;if(a&&t){let t="media"!==a.slot;for(;null!==(a=a.previousSibling);)"media"==a.slot&&(t=!1);t&&this.mediaUnsetCallback(e)}else this.mediaUnsetCallback(e)}if(t)for(let e of i.addedNodes)e===t&&this.handleMediaUpdated(t)}}),ng(this,uq,!1),ng(this,uV,e=>{nb(this,uq)||(setTimeout(()=>{nC(e.target,e.contentRect.width),nf(this,uq,!1)},0),nf(this,uq,!0))}),ng(this,u0,void 0),ng(this,u1,()=>{if(!nb(this,u0).assignedElements({flatten:!0}).length){nb(this,uB)&&this.mediaUnsetCallback(nb(this,uB));return}this.handleMediaUpdated(this.media)}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const e=r3(this.attributes),t=this.constructor.getTemplateHTML(e);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(t):this.shadowRoot.innerHTML=t}nf(this,uO,new MutationObserver(nb(this,u$)))}static get observedAttributes(){return[n_,nA].concat(nR).filter(e=>![rb.MEDIA_RENDITION_LIST,rb.MEDIA_AUDIO_TRACK_LIST,rb.MEDIA_CHAPTERS_CUES,rb.MEDIA_WIDTH,rb.MEDIA_HEIGHT,rb.MEDIA_ERROR,rb.MEDIA_ERROR_MESSAGE].includes(e))}attributeChangedCallback(e,t,i){e.toLowerCase()==n_&&(this.autohide=i)}get media(){let e=this.querySelector(":scope > [slot=media]");return(null==e?void 0:e.nodeName)=="SLOT"&&(e=e.assignedElements({flatten:!0})[0]),e}async handleMediaUpdated(e){e&&(nf(this,uB,e),e.localName.includes("-")&&await rz.customElements.whenDefined(e.localName),this.mediaSetCallback(e))}connectedCallback(){var e;nb(this,uO).observe(this,{childList:!0,subtree:!0}),r1(this,nb(this,uV));let t=null!=this.getAttribute(ny)?rU("audio player"):rU("video player");this.setAttribute("role","region"),this.setAttribute("aria-label",t),this.handleMediaUpdated(this.media),this.setAttribute(nS,""),nC(this,this.getBoundingClientRect().width);let i=this.querySelector(":scope > slot[slot=media]");i&&(nf(this,u0,i),nb(this,u0).addEventListener("slotchange",nb(this,u1))),this.addEventListener("pointerdown",this),this.addEventListener("pointermove",this),this.addEventListener("pointerup",this),this.addEventListener("mouseleave",this),this.addEventListener("keyup",this),null==(e=rz.window)||e.addEventListener("mouseup",this)}disconnectedCallback(){var e;r2(this,nb(this,uV)),clearTimeout(nb(this,uH)),nb(this,uO).disconnect(),this.media&&this.mediaUnsetCallback(this.media),null==(e=rz.window)||e.removeEventListener("mouseup",this),this.removeEventListener("pointerdown",this),this.removeEventListener("pointermove",this),this.removeEventListener("pointerup",this),this.removeEventListener("mouseleave",this),this.removeEventListener("keyup",this),nb(this,u0)&&(nb(this,u0).removeEventListener("slotchange",nb(this,u1)),nf(this,u0,null)),nf(this,uq,!1)}mediaSetCallback(e){}mediaUnsetCallback(e){nf(this,uB,null)}handleEvent(e){switch(e.type){case"pointerdown":nf(this,uU,e.timeStamp);break;case"pointermove":nE(this,uF,uK).call(this,e);break;case"pointerup":nE(this,uG,uj).call(this,e);break;case"mouseleave":nE(this,uY,uQ).call(this);break;case"mouseup":this.removeAttribute(nk);break;case"keyup":nE(this,uX,uJ).call(this),this.setAttribute(nk,"")}}set autohide(e){let t=Number(e);nf(this,uW,isNaN(t)?0:t)}get autohide(){return(void 0===nb(this,uW)?2:nb(this,uW)).toString()}get breakpoints(){return nd(this,nT)}set breakpoints(e){nu(this,nT,e)}get audio(){return no(this,ny)}set audio(e){nl(this,ny,e)}get gesturesDisabled(){return no(this,nA)}set gesturesDisabled(e){nl(this,nA,e)}get keyboardControl(){return no(this,nk)}set keyboardControl(e){nl(this,nk,e)}get noAutohide(){return no(this,nw)}set noAutohide(e){nl(this,nw,e)}get autohideOverControls(){return no(this,nI)}set autohideOverControls(e){nl(this,nI,e)}get userInteractive(){return no(this,nS)}set userInteractive(e){nl(this,nS,e)}}uO=new WeakMap,uU=new WeakMap,uB=new WeakMap,uH=new WeakMap,uW=new WeakMap,u$=new WeakMap,uq=new WeakMap,uV=new WeakMap,uF=new WeakSet,uK=function(e){if("mouse"!==e.pointerType&&e.timeStamp-nb(this,uU)<250)return;nE(this,uz,uZ).call(this),clearTimeout(nb(this,uH));let t=this.hasAttribute(nI);([this,this.media].includes(e.target)||t)&&nE(this,uX,uJ).call(this)},uG=new WeakSet,uj=function(e){if("touch"===e.pointerType){let t=!this.hasAttribute(nS);[this,this.media].includes(e.target)&&t?nE(this,uY,uQ).call(this):nE(this,uX,uJ).call(this)}else e.composedPath().some(e=>["media-play-button","media-fullscreen-button"].includes(null==e?void 0:e.localName))&&nE(this,uX,uJ).call(this)},uY=new WeakSet,uQ=function(){if(0>nb(this,uW)||this.hasAttribute(nS))return;this.setAttribute(nS,"");let e=new rz.CustomEvent(rg.USER_INACTIVE_CHANGE,{composed:!0,bubbles:!0,detail:!0});this.dispatchEvent(e)},uz=new WeakSet,uZ=function(){if(!this.hasAttribute(nS))return;this.removeAttribute(nS);let e=new rz.CustomEvent(rg.USER_INACTIVE_CHANGE,{composed:!0,bubbles:!0,detail:!1});this.dispatchEvent(e)},uX=new WeakSet,uJ=function(){nE(this,uz,uZ).call(this),clearTimeout(nb(this,uH));let e=parseInt(this.autohide);e<0||nf(this,uH,setTimeout(()=>{nE(this,uY,uQ).call(this)},1e3*e))},u0=new WeakMap,u1=new WeakMap,nL.shadowRootOptions={mode:"open"},nL.getTemplateHTML=function(e){return`
    <style>
      
      :host([${rb.MEDIA_IS_FULLSCREEN}]) ::slotted([slot=media]) {
        outline: none;
      }

      :host {
        box-sizing: border-box;
        position: relative;
        display: inline-block;
        line-height: 0;
        background-color: var(--media-background-color, #000);
        overflow: hidden;
      }

      :host(:not([${ny}])) [part~=layer]:not([part~=media-layer]) {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: flex;
        flex-flow: column nowrap;
        align-items: start;
        pointer-events: none;
        background: none;
      }

      slot[name=media] {
        display: var(--media-slot-display, contents);
      }

      
      :host([${ny}]) slot[name=media] {
        display: var(--media-slot-display, none);
      }

      
      :host([${ny}]) [part~=layer][part~=gesture-layer] {
        height: 0;
        display: block;
      }

      
      :host(:not([${ny}])[${nA}]) ::slotted([slot=gestures-chrome]),
          :host(:not([${ny}])[${nA}]) media-gesture-receiver[slot=gestures-chrome] {
        display: none;
      }

      
      ::slotted(:not([slot=media]):not([slot=poster]):not(media-loading-indicator):not([role=dialog]):not([hidden])) {
        pointer-events: auto;
      }

      :host(:not([${ny}])) *[part~=layer][part~=centered-layer] {
        align-items: center;
        justify-content: center;
      }

      :host(:not([${ny}])) ::slotted(media-gesture-receiver[slot=gestures-chrome]),
      :host(:not([${ny}])) media-gesture-receiver[slot=gestures-chrome] {
        align-self: stretch;
        flex-grow: 1;
      }

      slot[name=middle-chrome] {
        display: inline;
        flex-grow: 1;
        pointer-events: none;
        background: none;
      }

      
      ::slotted([slot=media]),
      ::slotted([slot=poster]) {
        width: 100%;
        height: 100%;
      }

      
      :host(:not([${ny}])) .spacer {
        flex-grow: 1;
      }

      
      :host(:-webkit-full-screen) {
        
        width: 100% !important;
        height: 100% !important;
      }

      
      ::slotted(:not([slot=media]):not([slot=poster]):not([${nw}]):not([hidden]):not([role=dialog])) {
        opacity: 1;
        transition: var(--media-control-transition-in, opacity 0.25s);
      }

      
      :host([${nS}]:not([${rb.MEDIA_PAUSED}]):not([${rb.MEDIA_IS_AIRPLAYING}]):not([${rb.MEDIA_IS_CASTING}]):not([${ny}])) ::slotted(:not([slot=media]):not([slot=poster]):not([${nw}]):not([role=dialog])) {
        opacity: 0;
        transition: var(--media-control-transition-out, opacity 1s);
      }

      :host([${nS}]:not([${nw}]):not([${rb.MEDIA_PAUSED}]):not([${rb.MEDIA_IS_CASTING}]):not([${ny}])) ::slotted([slot=media]) {
        cursor: none;
      }

      :host([${nS}][${nI}]:not([${nw}]):not([${rb.MEDIA_PAUSED}]):not([${rb.MEDIA_IS_CASTING}]):not([${ny}])) * {
        --media-cursor: none;
        cursor: none;
      }


      ::slotted(media-control-bar)  {
        align-self: stretch;
      }

      
      :host(:not([${ny}])[${rb.MEDIA_HAS_PLAYED}]) slot[name=poster] {
        display: none;
      }

      ::slotted([role=dialog]) {
        width: 100%;
        height: 100%;
        align-self: center;
      }

      ::slotted([role=menu]) {
        align-self: end;
      }
    </style>

    <slot name="media" part="layer media-layer"></slot>
    <slot name="poster" part="layer poster-layer"></slot>
    <slot name="gestures-chrome" part="layer gesture-layer">
      <media-gesture-receiver slot="gestures-chrome">
        <template shadowrootmode="${np.shadowRootOptions.mode}">
          ${np.getTemplateHTML({})}
        </template>
      </media-gesture-receiver>
    </slot>
    <span part="layer vertical-layer">
      <slot name="top-chrome" part="top chrome"></slot>
      <slot name="middle-chrome" part="middle chrome"></slot>
      <slot name="centered-chrome" part="layer centered-layer center centered chrome"></slot>
      
      <slot part="bottom chrome"></slot>
    </span>
    <slot name="dialog" part="layer dialog-layer"></slot>
  `},rz.customElements.get("media-container")||rz.customElements.define("media-container",nL);var nM=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},nD=(e,t,i)=>(nM(e,t,"read from private field"),i?i.call(e):t.get(e)),nx=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},nP=(e,t,i,a)=>(nM(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);class nN{constructor(e,t,{defaultValue:i}={defaultValue:void 0}){nx(this,u9),nx(this,u2,void 0),nx(this,u3,void 0),nx(this,u4,void 0),nx(this,u5,new Set),nP(this,u2,e),nP(this,u3,t),nP(this,u4,new Set(i))}[Symbol.iterator](){return nD(this,u9,u8).values()}get length(){return nD(this,u9,u8).size}get value(){var e;return null!=(e=[...nD(this,u9,u8)].join(" "))?e:""}set value(e){var t;e!==this.value&&(nP(this,u5,new Set),this.add(...null!=(t=null==e?void 0:e.split(" "))?t:[]))}toString(){return this.value}item(e){return[...nD(this,u9,u8)][e]}values(){return nD(this,u9,u8).values()}forEach(e,t){nD(this,u9,u8).forEach(e,t)}add(...e){var t,i;e.forEach(e=>nD(this,u5).add(e)),(""!==this.value||(null==(t=nD(this,u2))?void 0:t.hasAttribute(`${nD(this,u3)}`)))&&(null==(i=nD(this,u2))||i.setAttribute(`${nD(this,u3)}`,`${this.value}`))}remove(...e){var t;e.forEach(e=>nD(this,u5).delete(e)),null==(t=nD(this,u2))||t.setAttribute(`${nD(this,u3)}`,`${this.value}`)}contains(e){return nD(this,u9,u8).has(e)}toggle(e,t){if(void 0!==t)if(t)return this.add(e),!0;else return this.remove(e),!1;return this.contains(e)?(this.remove(e),!1):(this.add(e),!0)}replace(e,t){return this.remove(e),this.add(t),e===t}}u2=new WeakMap,u3=new WeakMap,u4=new WeakMap,u5=new WeakMap,u9=new WeakSet,u8=function(){return nD(this,u5).size?nD(this,u5):nD(this,u4)};let nO=(e="")=>{let[t,i,a]=e.split(":"),r=a?decodeURIComponent(a):void 0;return{kind:"cc"===t?ry.CAPTIONS:ry.SUBTITLES,language:i,label:r}},nU=(e="",t={})=>((e="")=>e.split(/\s+/))(e).map(e=>{let i=nO(e);return{...t,...i}}),nB=e=>e?Array.isArray(e)?e.map(e=>"string"==typeof e?nO(e):e):"string"==typeof e?nU(e):[e]:[],nH=({kind:e,label:t,language:i}={kind:"subtitles"})=>t?`${"captions"===e?"cc":"sb"}:${i}:${encodeURIComponent(t)}`:i,nW=(e=[])=>Array.prototype.map.call(e,nH).join(" "),n$=e=>{let t=Object.entries(e).map(([e,t])=>i=>i[e]===t);return e=>t.every(t=>t(e))},nq=(e,t=[],i=[])=>{let a=nB(i).map(n$);Array.from(t).filter(e=>a.some(t=>t(e))).forEach(t=>{t.mode=e})},nV=(e,t=()=>!0)=>{if(!(null==e?void 0:e.textTracks))return[];let i="function"==typeof t?t:n$(t);return Array.from(e.textTracks).filter(i)},nF=e=>{var t;return!!(null==(t=e.mediaSubtitlesShowing)?void 0:t.length)||e.hasAttribute(rb.MEDIA_SUBTITLES_SHOWING)},nK="exitFullscreen"in rZ?"exitFullscreen":"webkitExitFullscreen"in rZ?"webkitExitFullscreen":"webkitCancelFullScreen"in rZ?"webkitCancelFullScreen":void 0,nG="fullscreenElement"in rZ?"fullscreenElement":"webkitFullscreenElement"in rZ?"webkitFullscreenElement":void 0,nj="fullscreenEnabled"in rZ?"fullscreenEnabled":"webkitFullscreenEnabled"in rZ?"webkitFullscreenEnabled":void 0,nY=()=>{var e;return i||(i=null==(e=null==rZ?void 0:rZ.createElement)?void 0:e.call(rZ,"video"))},nQ=async(e=nY())=>{if(!e)return!1;let t=e.volume;e.volume=t/2+.1;let i=new AbortController,a=await Promise.race([nz(e,i.signal),nZ(e,t)]);return i.abort(),a},nz=(e,t)=>new Promise(i=>{e.addEventListener("volumechange",()=>i(!0),{signal:t})}),nZ=async(e,t)=>{for(let i=0;i<10;i++){if(e.volume===t)return!1;await rP(10)}return e.volume!==t},nX=/.*Version\/.*Safari\/.*/.test(rz.navigator.userAgent),nJ=(e=nY())=>(!rz.matchMedia("(display-mode: standalone)").matches||!nX)&&"function"==typeof(null==e?void 0:e.requestPictureInPicture),n0=(e=nY())=>(e=>{let{documentElement:t,media:i}=e;return!!(null==t?void 0:t[nj])||i&&"webkitSupportsFullscreen"in i})({documentElement:rZ,media:e}),n1=n0(),n2=nJ(),n3=!!rz.WebKitPlaybackTargetAvailabilityEvent,n4=!!rz.chrome,n5=e=>nV(e.media,e=>[ry.SUBTITLES,ry.CAPTIONS].includes(e.kind)).sort((e,t)=>e.kind>=t.kind?1:-1),n9=e=>nV(e.media,e=>e.mode===r_.SHOWING&&[ry.SUBTITLES,ry.CAPTIONS].includes(e.kind)),n8=(e,t)=>{let i=n5(e),a=n9(e),r=!!a.length;if(i.length){if(!1===t||r&&!0!==t)nq(r_.DISABLED,i,a);else if(!0===t||!r&&!1!==t){let t=i[0],{options:r}=e;if(!(null==r?void 0:r.noSubtitlesLangPref)){let e=rz.localStorage.getItem("media-chrome-pref-subtitles-lang"),a=e?[e,...rz.navigator.languages]:rz.navigator.languages,r=i.filter(e=>a.some(t=>e.language.toLowerCase().startsWith(t.split("-")[0]))).sort((e,t)=>a.findIndex(t=>e.language.toLowerCase().startsWith(t.split("-")[0]))-a.findIndex(e=>t.language.toLowerCase().startsWith(e.split("-")[0])));r[0]&&(t=r[0])}let{language:n,label:s,kind:o}=t;nq(r_.DISABLED,i,a),nq(r_.SHOWING,i,[{language:n,label:s,kind:o}])}}},n6=(e,t)=>e===t||null!=e&&null!=t&&typeof e==typeof t&&(!!("number"==typeof e&&Number.isNaN(e)&&Number.isNaN(t))||"object"==typeof e&&(Array.isArray(e)?n7(e,t):Object.entries(e).every(([e,i])=>e in t&&n6(i,t[e])))),n7=(e,t)=>{let i=Array.isArray(e),a=Array.isArray(t);return i===a&&(!i&&!a||e.length===t.length&&e.every((e,i)=>n6(e,t[i])))},se=Object.values(rw),st=nQ().then(e=>a=e),si=async(...e)=>{await Promise.all(e.filter(e=>e).map(async e=>{if(!("localName"in e&&e instanceof rz.HTMLElement))return;let t=e.localName;if(!t.includes("-"))return;let i=rz.customElements.get(t);i&&e instanceof i||(await rz.customElements.whenDefined(t),rz.customElements.upgrade(e))}))},sa=new rz.DOMParser,sr={mediaError:{get(e,t){let{media:i}=e;if((null==t?void 0:t.type)!=="playing")return null==i?void 0:i.error},mediaEvents:["emptied","error","playing"]},mediaErrorCode:{get(e,t){var i;let{media:a}=e;if((null==t?void 0:t.type)!=="playing")return null==(i=null==a?void 0:a.error)?void 0:i.code},mediaEvents:["emptied","error","playing"]},mediaErrorMessage:{get(e,t){var i,a;let{media:r}=e;if((null==t?void 0:t.type)!=="playing")return null!=(a=null==(i=null==r?void 0:r.error)?void 0:i.message)?a:""},mediaEvents:["emptied","error","playing"]},mediaWidth:{get(e){var t;let{media:i}=e;return null!=(t=null==i?void 0:i.videoWidth)?t:0},mediaEvents:["resize"]},mediaHeight:{get(e){var t;let{media:i}=e;return null!=(t=null==i?void 0:i.videoHeight)?t:0},mediaEvents:["resize"]},mediaPaused:{get(e){var t;let{media:i}=e;return null==(t=null==i?void 0:i.paused)||t},set(e,t){var i;let{media:a}=t;a&&(e?a.pause():null==(i=a.play())||i.catch(()=>{}))},mediaEvents:["play","playing","pause","emptied"]},mediaHasPlayed:{get(e,t){let{media:i}=e;return!!i&&(t?"playing"===t.type:!i.paused)},mediaEvents:["playing","emptied"]},mediaEnded:{get(e){var t;let{media:i}=e;return null!=(t=null==i?void 0:i.ended)&&t},mediaEvents:["seeked","ended","emptied"]},mediaPlaybackRate:{get(e){var t;let{media:i}=e;return null!=(t=null==i?void 0:i.playbackRate)?t:1},set(e,t){let{media:i}=t;!i||Number.isFinite(+e)&&(i.playbackRate=+e)},mediaEvents:["ratechange","loadstart"]},mediaMuted:{get(e){var t;let{media:i}=e;return null!=(t=null==i?void 0:i.muted)&&t},set(e,t){let{media:i,options:{noMutedPref:a}={}}=t;if(i){i.muted=e;try{let t=null!==rz.localStorage.getItem("media-chrome-pref-muted"),r=i.hasAttribute("muted");if(a){t&&rz.localStorage.removeItem("media-chrome-pref-muted");return}if(r&&!t)return;rz.localStorage.setItem("media-chrome-pref-muted",e?"true":"false")}catch(e){console.debug("Error setting muted pref",e)}}},mediaEvents:["volumechange"],stateOwnersUpdateHandlers:[(e,t)=>{let{options:{noMutedPref:i}}=t,{media:a}=t;if(a&&!a.muted&&!i)try{let i="true"===rz.localStorage.getItem("media-chrome-pref-muted");sr.mediaMuted.set(i,t),e(i)}catch(e){console.debug("Error getting muted pref",e)}}]},mediaLoop:{get(e){let{media:t}=e;return null==t?void 0:t.loop},set(e,t){let{media:i}=t;i&&(i.loop=e)},mediaEvents:["medialooprequest"]},mediaVolume:{get(e){var t;let{media:i}=e;return null!=(t=null==i?void 0:i.volume)?t:1},set(e,t){let{media:i,options:{noVolumePref:a}={}}=t;if(i){try{null==e?rz.localStorage.removeItem("media-chrome-pref-volume"):i.hasAttribute("muted")||a||rz.localStorage.setItem("media-chrome-pref-volume",e.toString())}catch(e){console.debug("Error setting volume pref",e)}Number.isFinite(+e)&&(i.volume=+e)}},mediaEvents:["volumechange"],stateOwnersUpdateHandlers:[(e,t)=>{let{options:{noVolumePref:i}}=t;if(!i)try{let{media:i}=t;if(!i)return;let a=rz.localStorage.getItem("media-chrome-pref-volume");if(null==a)return;sr.mediaVolume.set(+a,t),e(+a)}catch(e){console.debug("Error getting volume pref",e)}}]},mediaVolumeLevel:{get(e){let{media:t}=e;return void 0===(null==t?void 0:t.volume)?"high":t.muted||0===t.volume?"off":t.volume<.5?"low":t.volume<.75?"medium":"high"},mediaEvents:["volumechange"]},mediaCurrentTime:{get(e){var t;let{media:i}=e;return null!=(t=null==i?void 0:i.currentTime)?t:0},set(e,t){let{media:i}=t;i&&rD(e)&&(i.currentTime=e)},mediaEvents:["timeupdate","loadedmetadata"]},mediaDuration:{get(e){let{media:t,options:{defaultDuration:i}={}}=e;return i&&(!t||!t.duration||Number.isNaN(t.duration)||!Number.isFinite(t.duration))?i:Number.isFinite(null==t?void 0:t.duration)?t.duration:NaN},mediaEvents:["durationchange","loadedmetadata","emptied"]},mediaLoading:{get(e){let{media:t}=e;return(null==t?void 0:t.readyState)<3},mediaEvents:["waiting","playing","emptied"]},mediaSeekable:{get(e){var t;let{media:i}=e;if(!(null==(t=null==i?void 0:i.seekable)?void 0:t.length))return;let a=i.seekable.start(0),r=i.seekable.end(i.seekable.length-1);if(a||r)return[Number(a.toFixed(3)),Number(r.toFixed(3))]},mediaEvents:["loadedmetadata","emptied","progress","seekablechange"]},mediaBuffered:{get(e){var t;let{media:i}=e,a=null!=(t=null==i?void 0:i.buffered)?t:[];return Array.from(a).map((e,t)=>[Number(a.start(t).toFixed(3)),Number(a.end(t).toFixed(3))])},mediaEvents:["progress","emptied"]},mediaStreamType:{get(e){let{media:t,options:{defaultStreamType:i}={}}=e,a=[rw.LIVE,rw.ON_DEMAND].includes(i)?i:void 0;if(!t)return a;let{streamType:r}=t;if(se.includes(r))return r===rw.UNKNOWN?a:r;let n=t.duration;return n===1/0?rw.LIVE:Number.isFinite(n)?rw.ON_DEMAND:a},mediaEvents:["emptied","durationchange","loadedmetadata","streamtypechange"]},mediaTargetLiveWindow:{get(e){let{media:t}=e;if(!t)return NaN;let{targetLiveWindow:i}=t,a=sr.mediaStreamType.get(e);return(null==i||Number.isNaN(i))&&a===rw.LIVE?0:i},mediaEvents:["emptied","durationchange","loadedmetadata","streamtypechange","targetlivewindowchange"]},mediaTimeIsLive:{get(e){let{media:t,options:{liveEdgeOffset:i=10}={}}=e;if(!t)return!1;if("number"==typeof t.liveEdgeStart)return!Number.isNaN(t.liveEdgeStart)&&t.currentTime>=t.liveEdgeStart;if(sr.mediaStreamType.get(e)!==rw.LIVE)return!1;let a=t.seekable;if(!a)return!0;if(!a.length)return!1;let r=a.end(a.length-1)-i;return t.currentTime>=r},mediaEvents:["playing","timeupdate","progress","waiting","emptied"]},mediaSubtitlesList:{get:e=>n5(e).map(({kind:e,label:t,language:i})=>({kind:e,label:t,language:i})),mediaEvents:["loadstart"],textTracksEvents:["addtrack","removetrack"]},mediaSubtitlesShowing:{get:e=>n9(e).map(({kind:e,label:t,language:i})=>({kind:e,label:t,language:i})),mediaEvents:["loadstart"],textTracksEvents:["addtrack","removetrack","change"],stateOwnersUpdateHandlers:[(e,t)=>{var i,a;let{media:r,options:n}=t;if(!r)return;let s=e=>{var i;n.defaultSubtitles&&(e&&![ry.CAPTIONS,ry.SUBTITLES].includes(null==(i=null==e?void 0:e.track)?void 0:i.kind)||n8(t,!0))};return r.addEventListener("loadstart",s),null==(i=r.textTracks)||i.addEventListener("addtrack",s),null==(a=r.textTracks)||a.addEventListener("removetrack",s),()=>{var e,t;r.removeEventListener("loadstart",s),null==(e=r.textTracks)||e.removeEventListener("addtrack",s),null==(t=r.textTracks)||t.removeEventListener("removetrack",s)}}]},mediaChaptersCues:{get(e){var t;let{media:i}=e;if(!i)return[];let[a]=nV(i,{kind:ry.CHAPTERS});return Array.from(null!=(t=null==a?void 0:a.cues)?t:[]).map(({text:e,startTime:t,endTime:i})=>({text:e&&sa.parseFromString(e,"text/html").body.textContent||e,startTime:t,endTime:i}))},mediaEvents:["loadstart","loadedmetadata"],textTracksEvents:["addtrack","removetrack","change"],stateOwnersUpdateHandlers:[(e,t)=>{var i;let{media:a}=t;if(!a)return;let r=a.querySelector('track[kind="chapters"][default][src]'),n=null==(i=a.shadowRoot)?void 0:i.querySelector(':is(video,audio) > track[kind="chapters"][default][src]');return null==r||r.addEventListener("load",e),null==n||n.addEventListener("load",e),()=>{null==r||r.removeEventListener("load",e),null==n||n.removeEventListener("load",e)}}]},mediaIsPip:{get(e){var t,i;let{media:a,documentElement:r}=e;if(!a||!r||!r.pictureInPictureElement)return!1;if(r.pictureInPictureElement===a)return!0;if(r.pictureInPictureElement instanceof HTMLMediaElement)return!!(null==(t=a.localName)?void 0:t.includes("-"))&&r6(a,r.pictureInPictureElement);if(r.pictureInPictureElement.localName.includes("-")){let e=r.pictureInPictureElement.shadowRoot;for(;null==e?void 0:e.pictureInPictureElement;){if(e.pictureInPictureElement===a)return!0;e=null==(i=e.pictureInPictureElement)?void 0:i.shadowRoot}}return!1},set(e,t){let{media:i}=t;if(i)if(e){if(!rZ.pictureInPictureEnabled)return void console.warn("MediaChrome: Picture-in-picture is not enabled");if(!i.requestPictureInPicture)return void console.warn("MediaChrome: The current media does not support picture-in-picture");let e=()=>{console.warn("MediaChrome: The media is not ready for picture-in-picture. It must have a readyState > 0.")};i.requestPictureInPicture().catch(t=>{if(11===t.code){if(!i.src)return void console.warn("MediaChrome: The media is not ready for picture-in-picture. It must have a src set.");if(0===i.readyState&&"none"===i.preload){let t=()=>{i.removeEventListener("loadedmetadata",a),i.preload="none"},a=()=>{i.requestPictureInPicture().catch(e),t()};i.addEventListener("loadedmetadata",a),i.preload="metadata",setTimeout(()=>{0===i.readyState&&e(),t()},1e3)}else throw t}else throw t})}else rZ.pictureInPictureElement&&rZ.exitPictureInPicture()},mediaEvents:["enterpictureinpicture","leavepictureinpicture"]},mediaRenditionList:{get(e){var t;let{media:i}=e;return[...null!=(t=null==i?void 0:i.videoRenditions)?t:[]].map(e=>({...e}))},mediaEvents:["emptied","loadstart"],videoRenditionsEvents:["addrendition","removerendition"]},mediaRenditionSelected:{get(e){var t,i,a;let{media:r}=e;return null==(a=null==(i=null==r?void 0:r.videoRenditions)?void 0:i[null==(t=r.videoRenditions)?void 0:t.selectedIndex])?void 0:a.id},set(e,t){let{media:i}=t;if(!(null==i?void 0:i.videoRenditions))return void console.warn("MediaController: Rendition selection not supported by this media.");let a=Array.prototype.findIndex.call(i.videoRenditions,t=>t.id==e);i.videoRenditions.selectedIndex!=a&&(i.videoRenditions.selectedIndex=a)},mediaEvents:["emptied"],videoRenditionsEvents:["addrendition","removerendition","change"]},mediaAudioTrackList:{get(e){var t;let{media:i}=e;return[...null!=(t=null==i?void 0:i.audioTracks)?t:[]]},mediaEvents:["emptied","loadstart"],audioTracksEvents:["addtrack","removetrack"]},mediaAudioTrackEnabled:{get(e){var t,i;let{media:a}=e;return null==(i=[...null!=(t=null==a?void 0:a.audioTracks)?t:[]].find(e=>e.enabled))?void 0:i.id},set(e,t){let{media:i}=t;if(!(null==i?void 0:i.audioTracks))return void console.warn("MediaChrome: Audio track selection not supported by this media.");for(let t of i.audioTracks)t.enabled=e==t.id},mediaEvents:["emptied"],audioTracksEvents:["addtrack","removetrack","change"]},mediaIsFullscreen:{get:e=>(e=>{var t;let{media:i,documentElement:a,fullscreenElement:r=i}=e;if(!i||!a)return!1;let n=(e=>{let{documentElement:t,media:i}=e,a=null==t?void 0:t[nG];return!a&&"webkitDisplayingFullscreen"in i&&"webkitPresentationMode"in i&&i.webkitDisplayingFullscreen&&i.webkitPresentationMode===rI.FULLSCREEN?i:a})(e);if(!n)return!1;if(n===r||n===i)return!0;if(n.localName.includes("-")){let e=n.shadowRoot;if(!(nG in e))return r6(n,r);for(;null==e?void 0:e[nG];){if(e[nG]===r)return!0;e=null==(t=e[nG])?void 0:t.shadowRoot}}return!1})(e),set(e,t,i){var a,r;e?((e=>{var t;let{media:i,fullscreenElement:a}=e;try{let e=a&&"requestFullscreen"in a?"requestFullscreen":a&&"webkitRequestFullScreen"in a?"webkitRequestFullScreen":void 0;if(e){let i=null==(t=a[e])?void 0:t.call(a);if(i instanceof Promise)return i.catch(()=>{})}else(null==i?void 0:i.webkitEnterFullscreen)?i.webkitEnterFullscreen():(null==i?void 0:i.requestFullscreen)&&i.requestFullscreen()}catch(e){console.error(e)}})(t),!i.detail||(null==(a=t.media)?void 0:a.inert)||null==(r=t.media)||r.focus()):(e=>{var t;let{documentElement:i}=e;if(nK){let e=null==(t=null==i?void 0:i[nK])?void 0:t.call(i);if(e instanceof Promise)return e.catch(()=>{})}})(t)},rootEvents:["fullscreenchange","webkitfullscreenchange"],mediaEvents:["webkitbeginfullscreen","webkitendfullscreen","webkitpresentationmodechanged"]},mediaIsCasting:{get(e){var t;let{media:i}=e;return!!(null==i?void 0:i.remote)&&(null==(t=i.remote)?void 0:t.state)!=="disconnected"&&!!i.remote.state},set(e,t){var i,a;let{media:r}=t;if(r&&(!e||(null==(i=r.remote)?void 0:i.state)==="disconnected")&&(e||(null==(a=r.remote)?void 0:a.state)==="connected")){if("function"!=typeof r.remote.prompt)return void console.warn("MediaChrome: Casting is not supported in this environment");r.remote.prompt().catch(()=>{})}},remoteEvents:["connect","connecting","disconnect"]},mediaIsAirplaying:{get:()=>!1,set(e,t){let{media:i}=t;if(i){if(!(i.webkitShowPlaybackTargetPicker&&rz.WebKitPlaybackTargetAvailabilityEvent))return void console.error("MediaChrome: received a request to select AirPlay but AirPlay is not supported in this environment");i.webkitShowPlaybackTargetPicker()}},mediaEvents:["webkitcurrentplaybacktargetiswirelesschanged"]},mediaFullscreenUnavailable:{get(e){let{media:t}=e;if(!n1||!n0(t))return rk.UNSUPPORTED}},mediaPipUnavailable:{get(e){let{media:t}=e;return n2&&nJ(t)?(null==t?void 0:t.disablePictureInPicture)?rk.UNAVAILABLE:void 0:rk.UNSUPPORTED}},mediaVolumeUnavailable:{get(e){let{media:t}=e;if(!1===a||(null==t?void 0:t.volume)==void 0)return rk.UNSUPPORTED},stateOwnersUpdateHandlers:[e=>{null==a&&st.then(t=>e(t?void 0:rk.UNSUPPORTED))}]},mediaCastUnavailable:{get(e,{availability:t="not-available"}={}){var i;let{media:a}=e;return n4&&(null==(i=null==a?void 0:a.remote)?void 0:i.state)?null!=t&&"available"!==t?rk.UNAVAILABLE:void 0:rk.UNSUPPORTED},stateOwnersUpdateHandlers:[(e,t)=>{var i;let{media:a}=t;if(a)return a.disableRemotePlayback||a.hasAttribute("disableremoteplayback")||null==(i=null==a?void 0:a.remote)||i.watchAvailability(t=>{e({availability:t?"available":"not-available"})}).catch(t=>{"NotSupportedError"===t.name?e({availability:null}):e({availability:"not-available"})}),()=>{var e;null==(e=null==a?void 0:a.remote)||e.cancelWatchAvailability().catch(()=>{})}}]},mediaAirplayUnavailable:{get:(e,t)=>n3?(null==t?void 0:t.availability)==="not-available"?rk.UNAVAILABLE:void 0:rk.UNSUPPORTED,mediaEvents:["webkitplaybacktargetavailabilitychanged"],stateOwnersUpdateHandlers:[(e,t)=>{var i;let{media:a}=t;if(a)return a.disableRemotePlayback||a.hasAttribute("disableremoteplayback")||null==(i=null==a?void 0:a.remote)||i.watchAvailability(t=>{e({availability:t?"available":"not-available"})}).catch(t=>{"NotSupportedError"===t.name?e({availability:null}):e({availability:"not-available"})}),()=>{var e;null==(e=null==a?void 0:a.remote)||e.cancelWatchAvailability().catch(()=>{})}}]},mediaRenditionUnavailable:{get(e){var t;let{media:i}=e;return(null==i?void 0:i.videoRenditions)?(null==(t=i.videoRenditions)?void 0:t.length)?void 0:rk.UNAVAILABLE:rk.UNSUPPORTED},mediaEvents:["emptied","loadstart"],videoRenditionsEvents:["addrendition","removerendition"]},mediaAudioTrackUnavailable:{get(e){var t,i;let{media:a}=e;return(null==a?void 0:a.audioTracks)?(null!=(i=null==(t=a.audioTracks)?void 0:t.length)?i:0)<=1?rk.UNAVAILABLE:void 0:rk.UNSUPPORTED},mediaEvents:["emptied","loadstart"],audioTracksEvents:["addtrack","removetrack"]},mediaLang:{get(e){let{options:{mediaLang:t}={}}=e;return null!=t?t:"en"}}},sn={[rh.MEDIA_PREVIEW_REQUEST](e,t,{detail:i}){var a,r,n;let s,o,{media:l}=t,d=null!=i?i:void 0;if(l&&null!=d){let[e]=nV(l,{kind:ry.METADATA,label:"thumbnails"}),t=Array.prototype.find.call(null!=(a=null==e?void 0:e.cues)?a:[],(e,t,i)=>0===t?e.endTime>d:t===i.length-1?e.startTime<=d:e.startTime<=d&&e.endTime>d);if(t){let e=/'^(?:[a-z]+:)?\/\//i.test(t.text)||null==(r=null==l?void 0:l.querySelector('track[label="thumbnails"]'))?void 0:r.src,i=new URL(t.text,e);o=new URLSearchParams(i.hash).get("#xywh").split(",").map(e=>+e),s=i.href}}let u=e.mediaDuration.get(t),c=null==(n=e.mediaChaptersCues.get(t).find((e,t,i)=>t===i.length-1&&u===e.endTime?e.startTime<=d&&e.endTime>=d:e.startTime<=d&&e.endTime>d))?void 0:n.text;return null!=i&&null==c&&(c=""),{mediaPreviewTime:d,mediaPreviewImage:s,mediaPreviewCoords:o,mediaPreviewChapter:c}},[rh.MEDIA_PAUSE_REQUEST](e,t){e.mediaPaused.set(!0,t)},[rh.MEDIA_PLAY_REQUEST](e,t){var i,a,r,n;let s=e.mediaStreamType.get(t)===rw.LIVE,o=!(null==(i=t.options)?void 0:i.noAutoSeekToLive),l=e.mediaTargetLiveWindow.get(t)>0;if(s&&o&&!l){let i=null==(a=e.mediaSeekable.get(t))?void 0:a[1];if(i){let a=null!=(n=null==(r=t.options)?void 0:r.seekToLiveOffset)?n:0;e.mediaCurrentTime.set(i-a,t)}}e.mediaPaused.set(!1,t)},[rh.MEDIA_PLAYBACK_RATE_REQUEST](e,t,{detail:i}){e.mediaPlaybackRate.set(i,t)},[rh.MEDIA_MUTE_REQUEST](e,t){e.mediaMuted.set(!0,t)},[rh.MEDIA_UNMUTE_REQUEST](e,t){e.mediaVolume.get(t)||e.mediaVolume.set(.25,t),e.mediaMuted.set(!1,t)},[rh.MEDIA_LOOP_REQUEST](e,t,{detail:i}){let a=!!i;return e.mediaLoop.set(a,t),{mediaLoop:a}},[rh.MEDIA_VOLUME_REQUEST](e,t,{detail:i}){i&&e.mediaMuted.get(t)&&e.mediaMuted.set(!1,t),e.mediaVolume.set(i,t)},[rh.MEDIA_SEEK_REQUEST](e,t,{detail:i}){e.mediaCurrentTime.set(i,t)},[rh.MEDIA_SEEK_TO_LIVE_REQUEST](e,t){var i,a,r;let n=null==(i=e.mediaSeekable.get(t))?void 0:i[1];if(Number.isNaN(Number(n)))return;let s=null!=(r=null==(a=t.options)?void 0:a.seekToLiveOffset)?r:0;e.mediaCurrentTime.set(n-s,t)},[rh.MEDIA_SHOW_SUBTITLES_REQUEST](e,t,{detail:i}){var a;let{options:r}=t,n=n5(t),s=nB(i),o=null==(a=s[0])?void 0:a.language;o&&!r.noSubtitlesLangPref&&rz.localStorage.setItem("media-chrome-pref-subtitles-lang",o),nq(r_.SHOWING,n,s)},[rh.MEDIA_DISABLE_SUBTITLES_REQUEST](e,t,{detail:i}){let a=n5(t);nq(r_.DISABLED,a,null!=i?i:[])},[rh.MEDIA_TOGGLE_SUBTITLES_REQUEST](e,t,{detail:i}){n8(t,i)},[rh.MEDIA_RENDITION_REQUEST](e,t,{detail:i}){e.mediaRenditionSelected.set(i,t)},[rh.MEDIA_AUDIO_TRACK_REQUEST](e,t,{detail:i}){e.mediaAudioTrackEnabled.set(i,t)},[rh.MEDIA_ENTER_PIP_REQUEST](e,t){e.mediaIsFullscreen.get(t)&&e.mediaIsFullscreen.set(!1,t),e.mediaIsPip.set(!0,t)},[rh.MEDIA_EXIT_PIP_REQUEST](e,t){e.mediaIsPip.set(!1,t)},[rh.MEDIA_ENTER_FULLSCREEN_REQUEST](e,t,i){e.mediaIsPip.get(t)&&e.mediaIsPip.set(!1,t),e.mediaIsFullscreen.set(!0,t,i)},[rh.MEDIA_EXIT_FULLSCREEN_REQUEST](e,t){e.mediaIsFullscreen.set(!1,t)},[rh.MEDIA_ENTER_CAST_REQUEST](e,t){e.mediaIsFullscreen.get(t)&&e.mediaIsFullscreen.set(!1,t),e.mediaIsCasting.set(!0,t)},[rh.MEDIA_EXIT_CAST_REQUEST](e,t){e.mediaIsCasting.set(!1,t)},[rh.MEDIA_AIRPLAY_REQUEST](e,t){e.mediaIsAirplaying.set(!0,t)}};var ss=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},so=(e,t,i)=>(ss(e,t,"read from private field"),i?i.call(e):t.get(e)),sl=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},sd=(e,t,i,a)=>(ss(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),su=(e,t,i)=>(ss(e,t,"access private method"),i);let sc=["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Enter"," ","f","m","k","c","l","j",">","<","p"],sh="defaultsubtitles",sm="defaultstreamtype",sp="defaultduration",sv="fullscreenelement",sb="hotkeys",sg="keyboardbackwardseekoffset",sf="keyboardforwardseekoffset",sE="keyboarddownvolumestep",sy="keyboardupvolumestep",s_="keysused",sT="lang",sA="loop",sk="liveedgeoffset",sw="noautoseektolive",sS="nodefaultstore",sI="nohotkeys",sR="nomutedpref",sC="nosubtitleslangpref",sL="novolumepref",sM="seektoliveoffset";class sD extends nL{constructor(){super(),sl(this,cs),sl(this,cd),sl(this,cc),this.mediaStateReceivers=[],this.associatedElementSubscriptions=new Map,sl(this,u6,new nN(this,sb)),sl(this,u7,void 0),sl(this,ce,void 0),sl(this,ct,null),sl(this,ci,void 0),sl(this,ca,void 0),sl(this,cr,e=>{var t;null==(t=so(this,ce))||t.dispatch(e)}),sl(this,cn,void 0),sl(this,cl,e=>{let{key:t,shiftKey:i}=e;i&&("/"===t||"?"===t)||sc.includes(t)?this.keyboardShortcutHandler(e):this.removeEventListener("keyup",so(this,cl))}),this.associateElement(this);let e={};sd(this,ci,t=>{Object.entries(t).forEach(([t,i])=>{if(t in e&&e[t]===i)return;this.propagateMediaState(t,i);let a=t.toLowerCase(),r=new rz.CustomEvent(rE[a],{composed:!0,detail:i});this.dispatchEvent(r)}),e=t})}static get observedAttributes(){return super.observedAttributes.concat(sI,sb,sm,sh,sp,sR,sL,sT,sA,sk,sM,sw)}get mediaStore(){return so(this,ce)}set mediaStore(e){var t,i;(so(this,ce)&&(null==(t=so(this,ca))||t.call(this),sd(this,ca,void 0)),sd(this,ce,e),so(this,ce)||this.hasAttribute(sS))?sd(this,ca,null==(i=so(this,ce))?void 0:i.subscribe(so(this,ci))):su(this,cs,co).call(this)}get fullscreenElement(){var e;return null!=(e=so(this,u7))?e:this}set fullscreenElement(e){var t;this.hasAttribute(sv)&&this.removeAttribute(sv),sd(this,u7,e),null==(t=so(this,ce))||t.dispatch({type:"fullscreenelementchangerequest",detail:this.fullscreenElement})}get defaultSubtitles(){return no(this,sh)}set defaultSubtitles(e){nl(this,sh,e)}get defaultStreamType(){return nd(this,sm)}set defaultStreamType(e){nu(this,sm,e)}get defaultDuration(){return nn(this,sp)}set defaultDuration(e){ns(this,sp,e)}get noHotkeys(){return no(this,sI)}set noHotkeys(e){nl(this,sI,e)}get keysUsed(){return nd(this,s_)}set keysUsed(e){nu(this,s_,e)}get liveEdgeOffset(){return nn(this,sk)}set liveEdgeOffset(e){ns(this,sk,e)}get noAutoSeekToLive(){return no(this,sw)}set noAutoSeekToLive(e){nl(this,sw,e)}get noVolumePref(){return no(this,sL)}set noVolumePref(e){nl(this,sL,e)}get noMutedPref(){return no(this,sR)}set noMutedPref(e){nl(this,sR,e)}get noSubtitlesLangPref(){return no(this,sC)}set noSubtitlesLangPref(e){nl(this,sC,e)}get noDefaultStore(){return no(this,sS)}set noDefaultStore(e){nl(this,sS,e)}attributeChangedCallback(e,t,i){var a,r,n,s,o,l,d,u,c,h,m,p;if(super.attributeChangedCallback(e,t,i),e===sI)i!==t&&""===i?(this.hasAttribute(sb)&&console.warn("Media Chrome: Both `hotkeys` and `nohotkeys` have been set. All hotkeys will be disabled."),this.disableHotkeys()):i!==t&&null===i&&this.enableHotkeys();else if(e===sb)so(this,u6).value=i;else if(e===sh&&i!==t)null==(a=so(this,ce))||a.dispatch({type:"optionschangerequest",detail:{defaultSubtitles:this.hasAttribute(sh)}});else if(e===sm)null==(n=so(this,ce))||n.dispatch({type:"optionschangerequest",detail:{defaultStreamType:null!=(r=this.getAttribute(sm))?r:void 0}});else if(e===sk&&i!==t)null==(s=so(this,ce))||s.dispatch({type:"optionschangerequest",detail:{liveEdgeOffset:this.hasAttribute(sk)?+this.getAttribute(sk):void 0,seekToLiveOffset:this.hasAttribute(sM)?+this.getAttribute(sM):this.hasAttribute(sk)?+this.getAttribute(sk):void 0}});else if(e===sM&&i!==t)null==(o=so(this,ce))||o.dispatch({type:"optionschangerequest",detail:{seekToLiveOffset:this.hasAttribute(sM)?+this.getAttribute(sM):this.hasAttribute(sk)?+this.getAttribute(sk):void 0}});else if(e===sw)null==(l=so(this,ce))||l.dispatch({type:"optionschangerequest",detail:{noAutoSeekToLive:this.hasAttribute(sw)}});else if(e===sv){let e=i?null==(d=this.getRootNode())?void 0:d.getElementById(i):void 0;sd(this,u7,e),null==(u=so(this,ce))||u.dispatch({type:"fullscreenelementchangerequest",detail:this.fullscreenElement})}else e===sT&&i!==t?(rO=i,null==(c=so(this,ce))||c.dispatch({type:"optionschangerequest",detail:{mediaLang:i}})):e===sA&&i!==t?null==(h=so(this,ce))||h.dispatch({type:rh.MEDIA_LOOP_REQUEST,detail:null!=i}):e===sL&&i!==t?null==(m=so(this,ce))||m.dispatch({type:"optionschangerequest",detail:{noVolumePref:this.hasAttribute(sL)}}):e===sR&&i!==t&&(null==(p=so(this,ce))||p.dispatch({type:"optionschangerequest",detail:{noMutedPref:this.hasAttribute(sR)}}))}connectedCallback(){var e,t,i;this.associateElement(this),so(this,ce)||this.hasAttribute(sS)||su(this,cs,co).call(this),null==(e=so(this,ce))||e.dispatch({type:"documentelementchangerequest",detail:rZ}),null==(t=so(this,ce))||t.dispatch({type:"fullscreenelementchangerequest",detail:this.fullscreenElement}),super.connectedCallback(),so(this,ce)&&!so(this,ca)&&sd(this,ca,null==(i=so(this,ce))?void 0:i.subscribe(so(this,ci))),void 0!==so(this,cn)&&so(this,ce)&&this.media&&setTimeout(()=>{var e,t,i;(null==(t=null==(e=this.media)?void 0:e.textTracks)?void 0:t.length)&&(null==(i=so(this,ce))||i.dispatch({type:rh.MEDIA_TOGGLE_SUBTITLES_REQUEST,detail:so(this,cn)}))},0),this.hasAttribute(sI)?this.disableHotkeys():this.enableHotkeys()}disconnectedCallback(){var e,t,i,a,r,n;if(null==(e=super.disconnectedCallback)||e.call(this),this.disableHotkeys(),so(this,ce)){let e=so(this,ce).getState();sd(this,cn,!!(null==(t=e.mediaSubtitlesShowing)?void 0:t.length)),null==(i=so(this,ce))||i.dispatch({type:"fullscreenelementchangerequest",detail:void 0}),null==(a=so(this,ce))||a.dispatch({type:"documentelementchangerequest",detail:void 0}),null==(r=so(this,ce))||r.dispatch({type:rh.MEDIA_TOGGLE_SUBTITLES_REQUEST,detail:!1})}so(this,ca)&&(null==(n=so(this,ca))||n.call(this),sd(this,ca,void 0)),this.unassociateElement(this),so(this,ct)&&(so(this,ct).remove(),sd(this,ct,null))}mediaSetCallback(e){var t;super.mediaSetCallback(e),null==(t=so(this,ce))||t.dispatch({type:"mediaelementchangerequest",detail:e}),e.hasAttribute("tabindex")||(e.tabIndex=-1)}mediaUnsetCallback(e){var t;super.mediaUnsetCallback(e),null==(t=so(this,ce))||t.dispatch({type:"mediaelementchangerequest",detail:void 0})}propagateMediaState(e,t){s$(this.mediaStateReceivers,e,t)}associateElement(e){if(!e)return;let{associatedElementSubscriptions:t}=this;if(t.has(e))return;let i=sq(e,this.registerMediaStateReceiver.bind(this),this.unregisterMediaStateReceiver.bind(this));Object.values(rh).forEach(t=>{e.addEventListener(t,so(this,cr))}),t.set(e,i)}unassociateElement(e){if(!e)return;let{associatedElementSubscriptions:t}=this;t.has(e)&&(t.get(e)(),t.delete(e),Object.values(rh).forEach(t=>{e.removeEventListener(t,so(this,cr))}))}registerMediaStateReceiver(e){if(!e)return;let t=this.mediaStateReceivers;!(t.indexOf(e)>-1)&&(t.push(e),so(this,ce)&&Object.entries(so(this,ce).getState()).forEach(([t,i])=>{s$([e],t,i)}))}unregisterMediaStateReceiver(e){let t=this.mediaStateReceivers,i=t.indexOf(e);i<0||t.splice(i,1)}enableHotkeys(){this.addEventListener("keydown",su(this,cd,cu))}disableHotkeys(){this.removeEventListener("keydown",su(this,cd,cu)),this.removeEventListener("keyup",so(this,cl))}get hotkeys(){return so(this,u6)}set hotkeys(e){nu(this,sb,e)}keyboardShortcutHandler(e){var t,i,a,r,n,s,o,l,d;let u,c,h,m=e.target;if(!((null!=(a=null!=(i=null==(t=m.getAttribute(s_))?void 0:t.split(" "))?i:null==m?void 0:m.keysUsed)?a:[]).map(e=>"Space"===e?" ":e).filter(Boolean).includes(e.key)||so(this,u6).contains(`no${e.key.toLowerCase()}`)||" "===e.key&&so(this,u6).contains("nospace"))&&!(e.shiftKey&&("/"===e.key||"?"===e.key)&&so(this,u6).contains("noshift+/")))switch(e.key){case" ":case"k":u=so(this,ce).getState().mediaPaused?rh.MEDIA_PLAY_REQUEST:rh.MEDIA_PAUSE_REQUEST,this.dispatchEvent(new rz.CustomEvent(u,{composed:!0,bubbles:!0}));break;case"m":u="off"===this.mediaStore.getState().mediaVolumeLevel?rh.MEDIA_UNMUTE_REQUEST:rh.MEDIA_MUTE_REQUEST,this.dispatchEvent(new rz.CustomEvent(u,{composed:!0,bubbles:!0}));break;case"f":u=this.mediaStore.getState().mediaIsFullscreen?rh.MEDIA_EXIT_FULLSCREEN_REQUEST:rh.MEDIA_ENTER_FULLSCREEN_REQUEST,this.dispatchEvent(new rz.CustomEvent(u,{composed:!0,bubbles:!0}));break;case"c":this.dispatchEvent(new rz.CustomEvent(rh.MEDIA_TOGGLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0}));break;case"ArrowLeft":case"j":{let e=this.hasAttribute(sg)?+this.getAttribute(sg):10;c=Math.max((null!=(r=this.mediaStore.getState().mediaCurrentTime)?r:0)-e,0),h=new rz.CustomEvent(rh.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:c}),this.dispatchEvent(h);break}case"ArrowRight":case"l":{let e=this.hasAttribute(sf)?+this.getAttribute(sf):10;c=Math.max((null!=(n=this.mediaStore.getState().mediaCurrentTime)?n:0)+e,0),h=new rz.CustomEvent(rh.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:c}),this.dispatchEvent(h);break}case"ArrowUp":{let e=this.hasAttribute(sy)?+this.getAttribute(sy):.025;c=Math.min((null!=(s=this.mediaStore.getState().mediaVolume)?s:1)+e,1),h=new rz.CustomEvent(rh.MEDIA_VOLUME_REQUEST,{composed:!0,bubbles:!0,detail:c}),this.dispatchEvent(h);break}case"ArrowDown":{let e=this.hasAttribute(sE)?+this.getAttribute(sE):.025;c=Math.max((null!=(o=this.mediaStore.getState().mediaVolume)?o:1)-e,0),h=new rz.CustomEvent(rh.MEDIA_VOLUME_REQUEST,{composed:!0,bubbles:!0,detail:c}),this.dispatchEvent(h);break}case"<":c=Math.max((null!=(l=this.mediaStore.getState().mediaPlaybackRate)?l:1)-.25,.25).toFixed(2),h=new rz.CustomEvent(rh.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:c}),this.dispatchEvent(h);break;case">":c=Math.min((null!=(d=this.mediaStore.getState().mediaPlaybackRate)?d:1)+.25,2).toFixed(2),h=new rz.CustomEvent(rh.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:c}),this.dispatchEvent(h);break;case"/":case"?":e.shiftKey&&su(this,cc,ch).call(this);break;case"p":u=this.mediaStore.getState().mediaIsPip?rh.MEDIA_EXIT_PIP_REQUEST:rh.MEDIA_ENTER_PIP_REQUEST,h=new rz.CustomEvent(u,{composed:!0,bubbles:!0}),this.dispatchEvent(h)}}}u6=new WeakMap,u7=new WeakMap,ce=new WeakMap,ct=new WeakMap,ci=new WeakMap,ca=new WeakMap,cr=new WeakMap,cn=new WeakMap,cs=new WeakSet,co=function(){var e;this.mediaStore=(({media:e,fullscreenElement:t,documentElement:i,stateMediator:a=sr,requestMap:r=sn,options:n={},monitorStateOwnersOnlyWithSubscriptions:s=!0})=>{let o,l=[],d={options:{...n}},u=Object.freeze({mediaPreviewTime:void 0,mediaPreviewImage:void 0,mediaPreviewCoords:void 0,mediaPreviewChapter:void 0}),c=e=>{void 0==e||n6(e,u)||(u=Object.freeze({...u,...e}),l.forEach(e=>e(u)))},h=()=>{c(Object.entries(a).reduce((e,[t,{get:i}])=>(e[t]=i(d),e),{}))},m={},p=async(e,t)=>{var i,r,n,u,p,v,b,g,f,E,y,T,A,k,w,S;let I=!!o;if(o={...d,...null!=o?o:{},...e},I)return;await si(...Object.values(e));let R=l.length>0&&0===t&&s,C=d.media!==o.media,L=(null==(i=d.media)?void 0:i.textTracks)!==(null==(r=o.media)?void 0:r.textTracks),M=(null==(n=d.media)?void 0:n.videoRenditions)!==(null==(u=o.media)?void 0:u.videoRenditions),D=(null==(p=d.media)?void 0:p.audioTracks)!==(null==(v=o.media)?void 0:v.audioTracks),x=(null==(b=d.media)?void 0:b.remote)!==(null==(g=o.media)?void 0:g.remote),P=d.documentElement!==o.documentElement,N=!!d.media&&(C||R),O=!!(null==(f=d.media)?void 0:f.textTracks)&&(L||R),U=!!(null==(E=d.media)?void 0:E.videoRenditions)&&(M||R),B=!!(null==(y=d.media)?void 0:y.audioTracks)&&(D||R),H=!!(null==(T=d.media)?void 0:T.remote)&&(x||R),W=!!d.documentElement&&(P||R),$=N||O||U||B||H||W,q=0===l.length&&1===t&&s,V=!!o.media&&(C||q),F=!!(null==(A=o.media)?void 0:A.textTracks)&&(L||q),K=!!(null==(k=o.media)?void 0:k.videoRenditions)&&(M||q),G=!!(null==(w=o.media)?void 0:w.audioTracks)&&(D||q),j=!!(null==(S=o.media)?void 0:S.remote)&&(x||q),Y=!!o.documentElement&&(P||q),Q=V||F||K||G||j||Y;if(!($||Q)){Object.entries(o).forEach(([e,t])=>{d[e]=t}),h(),o=void 0;return}Object.entries(a).forEach(([e,{get:t,mediaEvents:i=[],textTracksEvents:a=[],videoRenditionsEvents:r=[],audioTracksEvents:n=[],remoteEvents:s=[],rootEvents:l=[],stateOwnersUpdateHandlers:u=[]}])=>{let h;m[e]||(m[e]={});let p=i=>{c({[e]:t(d,i)})};h=m[e].mediaEvents,i.forEach(t=>{h&&N&&(d.media.removeEventListener(t,h),m[e].mediaEvents=void 0),V&&(o.media.addEventListener(t,p),m[e].mediaEvents=p)}),h=m[e].textTracksEvents,a.forEach(t=>{var i,a;h&&O&&(null==(i=d.media.textTracks)||i.removeEventListener(t,h),m[e].textTracksEvents=void 0),F&&(null==(a=o.media.textTracks)||a.addEventListener(t,p),m[e].textTracksEvents=p)}),h=m[e].videoRenditionsEvents,r.forEach(t=>{var i,a;h&&U&&(null==(i=d.media.videoRenditions)||i.removeEventListener(t,h),m[e].videoRenditionsEvents=void 0),K&&(null==(a=o.media.videoRenditions)||a.addEventListener(t,p),m[e].videoRenditionsEvents=p)}),h=m[e].audioTracksEvents,n.forEach(t=>{var i,a;h&&B&&(null==(i=d.media.audioTracks)||i.removeEventListener(t,h),m[e].audioTracksEvents=void 0),G&&(null==(a=o.media.audioTracks)||a.addEventListener(t,p),m[e].audioTracksEvents=p)}),h=m[e].remoteEvents,s.forEach(t=>{var i,a;h&&H&&(null==(i=d.media.remote)||i.removeEventListener(t,h),m[e].remoteEvents=void 0),j&&(null==(a=o.media.remote)||a.addEventListener(t,p),m[e].remoteEvents=p)}),h=m[e].rootEvents,l.forEach(t=>{h&&W&&(d.documentElement.removeEventListener(t,h),m[e].rootEvents=void 0),Y&&(o.documentElement.addEventListener(t,p),m[e].rootEvents=p)});let v=m[e].stateOwnersUpdateHandlers;if(v&&$&&(Array.isArray(v)?v:[v]).forEach(e=>{"function"==typeof e&&e()}),Q){let t=u.map(e=>e(p,o)).filter(e=>"function"==typeof e);m[e].stateOwnersUpdateHandlers=1===t.length?t[0]:t}else $&&(m[e].stateOwnersUpdateHandlers=void 0)}),Object.entries(o).forEach(([e,t])=>{d[e]=t}),h(),o=void 0};return p({media:e,fullscreenElement:t,documentElement:i,options:n}),{dispatch(e){let{type:t,detail:i}=e;r[t]&&null==u.mediaErrorCode?c(r[t](a,d,e)):"mediaelementchangerequest"===t?p({media:i}):"fullscreenelementchangerequest"===t?p({fullscreenElement:i}):"documentelementchangerequest"===t?p({documentElement:i}):"optionschangerequest"===t&&(Object.entries(null!=i?i:{}).forEach(([e,t])=>{d.options[e]=t}),h())},getState:()=>u,subscribe:e=>(p({},l.length+1),l.push(e),e(u),()=>{let t=l.indexOf(e);t>=0&&(p({},l.length-1),l.splice(t,1))})}})({media:this.media,fullscreenElement:this.fullscreenElement,options:{defaultSubtitles:this.hasAttribute(sh),defaultDuration:this.hasAttribute(sp)?+this.getAttribute(sp):void 0,defaultStreamType:null!=(e=this.getAttribute(sm))?e:void 0,liveEdgeOffset:this.hasAttribute(sk)?+this.getAttribute(sk):void 0,seekToLiveOffset:this.hasAttribute(sM)?+this.getAttribute(sM):this.hasAttribute(sk)?+this.getAttribute(sk):void 0,noAutoSeekToLive:this.hasAttribute(sw),noVolumePref:this.hasAttribute(sL),noMutedPref:this.hasAttribute(sR),noSubtitlesLangPref:this.hasAttribute(sC)}})},cl=new WeakMap,cd=new WeakSet,cu=function(e){var t;let{metaKey:i,altKey:a,key:r,shiftKey:n}=e,s=n&&("/"===r||"?"===r);if(s&&(null==(t=so(this,ct))?void 0:t.open)||i||a||!s&&!sc.includes(r))return void this.removeEventListener("keyup",so(this,cl));let o=e.target,l=o instanceof HTMLElement&&("media-volume-range"===o.tagName.toLowerCase()||"media-time-range"===o.tagName.toLowerCase());![" ","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(r)||so(this,u6).contains(`no${r.toLowerCase()}`)||" "===r&&so(this,u6).contains("nospace")||l||e.preventDefault(),this.addEventListener("keyup",so(this,cl),{once:!0})},cc=new WeakSet,ch=function(){so(this,ct)||(sd(this,ct,rZ.createElement("media-keyboard-shortcuts-dialog")),this.appendChild(so(this,ct))),so(this,ct).open=!0};let sx=Object.values(rb),sP=Object.values(rp),sN=e=>{var t,i,a,r;let{observedAttributes:n}=e.constructor;!n&&(null==(t=e.nodeName)?void 0:t.includes("-"))&&(rz.customElements.upgrade(e),{observedAttributes:n}=e.constructor);let s=null==(r=null==(a=null==(i=null==e?void 0:e.getAttribute)?void 0:i.call(e,rm.MEDIA_CHROME_ATTRIBUTES))?void 0:a.split)?void 0:r.call(a,/\s+/);return Array.isArray(n||s)?(n||s).filter(e=>sx.includes(e)):[]},sO=e=>{var t,i;return(null==(t=e.nodeName)?void 0:t.includes("-"))&&rz.customElements.get(null==(i=e.nodeName)?void 0:i.toLowerCase())&&!(e instanceof rz.customElements.get(e.nodeName.toLowerCase()))&&rz.customElements.upgrade(e),sP.some(t=>t in e)||!!sN(e).length},sU=e=>{var t;return null==(t=null==e?void 0:e.join)?void 0:t.call(e,":")},sB={[rb.MEDIA_SUBTITLES_LIST]:nW,[rb.MEDIA_SUBTITLES_SHOWING]:nW,[rb.MEDIA_SEEKABLE]:sU,[rb.MEDIA_BUFFERED]:e=>null==e?void 0:e.map(sU).join(" "),[rb.MEDIA_PREVIEW_COORDS]:e=>null==e?void 0:e.join(" "),[rb.MEDIA_RENDITION_LIST]:function(e){return null==e?void 0:e.map(rR).join(" ")},[rb.MEDIA_AUDIO_TRACK_LIST]:function(e){return null==e?void 0:e.map(rL).join(" ")}},sH=async(e,t,i)=>{var a,r;if(e.isConnected||await rP(0),"boolean"==typeof i||null==i)return nl(e,t,i);if("number"==typeof i)return ns(e,t,i);if("string"==typeof i)return nu(e,t,i);if(Array.isArray(i)&&!i.length)return e.removeAttribute(t);let n=null!=(r=null==(a=sB[t])?void 0:a.call(sB,i))?r:i;return e.setAttribute(t,n)},sW=(e,t)=>{var i;if(null==(i=e.closest)?void 0:i.call(e,'*[slot="media"]'))return;let a=(e,t)=>{var i,a;sO(e)&&t(e);let{children:r=[]}=null!=e?e:{};[...r,...null!=(a=null==(i=null==e?void 0:e.shadowRoot)?void 0:i.children)?a:[]].forEach(e=>sW(e,t))},r=null==e?void 0:e.nodeName.toLowerCase();r.includes("-")&&!sO(e)?rz.customElements.whenDefined(r).then(()=>{a(e,t)}):a(e,t)},s$=(e,t,i)=>{e.forEach(e=>{if(t in e){e[t]=i;return}let a=sN(e),r=t.toLowerCase();a.includes(r)&&sH(e,r,i)})},sq=(e,t,i)=>{sW(e,t);let a=e=>{var i;t(null!=(i=null==e?void 0:e.composedPath()[0])?i:e.target)},r=e=>{var t;i(null!=(t=null==e?void 0:e.composedPath()[0])?t:e.target)};e.addEventListener(rh.REGISTER_MEDIA_STATE_RECEIVER,a),e.addEventListener(rh.UNREGISTER_MEDIA_STATE_RECEIVER,r);let n=[],s=e=>{let a=e.target;"media"!==a.name&&(n.forEach(e=>sW(e,i)),(n=[...a.assignedElements({flatten:!0})]).forEach(e=>sW(e,t)))};e.addEventListener("slotchange",s);let o=new MutationObserver(e=>{e.forEach(e=>{let{addedNodes:a=[],removedNodes:r=[],type:n,target:s,attributeName:o}=e;"childList"===n?(Array.prototype.forEach.call(a,e=>sW(e,t)),Array.prototype.forEach.call(r,e=>sW(e,i))):"attributes"===n&&o===rm.MEDIA_CHROME_ATTRIBUTES&&(sO(s)?t(s):i(s))})});return o.observe(e,{childList:!0,attributes:!0,subtree:!0}),()=>{sW(e,i),e.removeEventListener("slotchange",s),o.disconnect(),e.removeEventListener(rh.REGISTER_MEDIA_STATE_RECEIVER,a),e.removeEventListener(rh.UNREGISTER_MEDIA_STATE_RECEIVER,r)}};rz.customElements.get("media-controller")||rz.customElements.define("media-controller",sD);let sV="placement",sF="bounds";class sK extends rz.HTMLElement{constructor(){if(super(),this.updateXOffset=()=>{var e;if(!ni(this,{checkOpacity:!1,checkVisibilityCSS:!1}))return;let t=this.placement;if("left"===t||"right"===t)return void this.style.removeProperty("--media-tooltip-offset-x");let i=getComputedStyle(this),a=null!=(e=r7(this,"#"+this.bounds))?e:r4(this);if(!a)return;let{x:r,width:n}=a.getBoundingClientRect(),{x:s,width:o}=this.getBoundingClientRect(),l=i.getPropertyValue("--media-tooltip-offset-x"),d=l?parseFloat(l.replace("px","")):0,u=i.getPropertyValue("--media-tooltip-container-margin"),c=u?parseFloat(u.replace("px","")):0,h=s-r+d-c,m=s+o-(r+n)+d+c;h<0?this.style.setProperty("--media-tooltip-offset-x",`${h}px`):m>0?this.style.setProperty("--media-tooltip-offset-x",`${m}px`):this.style.removeProperty("--media-tooltip-offset-x")},!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const e=r3(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}if(this.arrowEl=this.shadowRoot.querySelector("#arrow"),Object.prototype.hasOwnProperty.call(this,"placement")){const e=this.placement;delete this.placement,this.placement=e}}static get observedAttributes(){return[sV,sF]}get placement(){return nd(this,sV)}set placement(e){nu(this,sV,e)}get bounds(){return nd(this,sF)}set bounds(e){nu(this,sF,e)}}sK.shadowRootOptions={mode:"open"},sK.getTemplateHTML=function(e){return`
    <style>
      :host {
        --_tooltip-background-color: var(--media-tooltip-background-color, var(--media-secondary-color, rgba(20, 20, 30, .7)));
        --_tooltip-background: var(--media-tooltip-background, var(--_tooltip-background-color));
        --_tooltip-arrow-half-width: calc(var(--media-tooltip-arrow-width, 12px) / 2);
        --_tooltip-arrow-height: var(--media-tooltip-arrow-height, 5px);
        --_tooltip-arrow-background: var(--media-tooltip-arrow-color, var(--_tooltip-background-color));
        position: relative;
        pointer-events: none;
        display: var(--media-tooltip-display, inline-flex);
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        z-index: var(--media-tooltip-z-index, 1);
        background: var(--_tooltip-background);
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        font: var(--media-font,
          var(--media-font-weight, 400)
          var(--media-font-size, 13px) /
          var(--media-text-content-height, var(--media-control-height, 18px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        padding: var(--media-tooltip-padding, .35em .7em);
        border: var(--media-tooltip-border, none);
        border-radius: var(--media-tooltip-border-radius, 5px);
        filter: var(--media-tooltip-filter, drop-shadow(0 0 4px rgba(0, 0, 0, .2)));
        white-space: var(--media-tooltip-white-space, nowrap);
      }

      :host([hidden]) {
        display: none;
      }

      img, svg {
        display: inline-block;
      }

      #arrow {
        position: absolute;
        width: 0px;
        height: 0px;
        border-style: solid;
        display: var(--media-tooltip-arrow-display, block);
      }

      :host(:not([placement])),
      :host([placement="top"]) {
        position: absolute;
        bottom: calc(100% + var(--media-tooltip-distance, 12px));
        left: 50%;
        transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
      }
      :host(:not([placement])) #arrow,
      :host([placement="top"]) #arrow {
        top: 100%;
        left: 50%;
        border-width: var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width);
        border-color: var(--_tooltip-arrow-background) transparent transparent transparent;
        transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
      }

      :host([placement="right"]) {
        position: absolute;
        left: calc(100% + var(--media-tooltip-distance, 12px));
        top: 50%;
        transform: translate(0, -50%);
      }
      :host([placement="right"]) #arrow {
        top: 50%;
        right: 100%;
        border-width: var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0;
        border-color: transparent var(--_tooltip-arrow-background) transparent transparent;
        transform: translate(0, -50%);
      }

      :host([placement="bottom"]) {
        position: absolute;
        top: calc(100% + var(--media-tooltip-distance, 12px));
        left: 50%;
        transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
      }
      :host([placement="bottom"]) #arrow {
        bottom: 100%;
        left: 50%;
        border-width: 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width);
        border-color: transparent transparent var(--_tooltip-arrow-background) transparent;
        transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
      }

      :host([placement="left"]) {
        position: absolute;
        right: calc(100% + var(--media-tooltip-distance, 12px));
        top: 50%;
        transform: translate(0, -50%);
      }
      :host([placement="left"]) #arrow {
        top: 50%;
        left: 100%;
        border-width: var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height);
        border-color: transparent transparent transparent var(--_tooltip-arrow-background);
        transform: translate(0, -50%);
      }
      
      :host([placement="none"]) #arrow {
        display: none;
      }
    </style>
    <slot></slot>
    <div id="arrow"></div>
  `},rz.customElements.get("media-tooltip")||rz.customElements.define("media-tooltip",sK);var sG=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},sj=(e,t,i)=>(sG(e,t,"read from private field"),i?i.call(e):t.get(e)),sY=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},sQ=(e,t,i,a)=>(sG(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);let sz="tooltipplacement",sZ="disabled",sX="notooltip";class sJ extends rz.HTMLElement{constructor(){if(super(),sY(this,cf),sY(this,cm,void 0),this.preventClick=!1,this.tooltipEl=null,sY(this,cp,e=>{this.preventClick||this.handleClick(e),setTimeout(sj(this,cv),0)}),sY(this,cv,()=>{var e,t;null==(t=null==(e=this.tooltipEl)?void 0:e.updateXOffset)||t.call(e)}),sY(this,cb,e=>{let{key:t}=e;this.keysUsed.includes(t)?this.preventClick||this.handleClick(e):this.removeEventListener("keyup",sj(this,cb))}),sY(this,cg,e=>{let{metaKey:t,altKey:i,key:a}=e;t||i||!this.keysUsed.includes(a)?this.removeEventListener("keyup",sj(this,cb)):this.addEventListener("keyup",sj(this,cb),{once:!0})}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const e=r3(this.attributes),t=this.constructor.getTemplateHTML(e);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(t):this.shadowRoot.innerHTML=t}this.tooltipEl=this.shadowRoot.querySelector("media-tooltip")}static get observedAttributes(){return["disabled",sz,rm.MEDIA_CONTROLLER,rb.MEDIA_LANG]}enable(){this.addEventListener("click",sj(this,cp)),this.addEventListener("keydown",sj(this,cg)),this.tabIndex=0}disable(){this.removeEventListener("click",sj(this,cp)),this.removeEventListener("keydown",sj(this,cg)),this.removeEventListener("keyup",sj(this,cb)),this.tabIndex=-1}attributeChangedCallback(e,t,i){var a,r,n,s,o;e===rm.MEDIA_CONTROLLER?(t&&(null==(r=null==(a=sj(this,cm))?void 0:a.unassociateElement)||r.call(a,this),sQ(this,cm,null)),i&&this.isConnected&&(sQ(this,cm,null==(n=this.getRootNode())?void 0:n.getElementById(i)),null==(o=null==(s=sj(this,cm))?void 0:s.associateElement)||o.call(s,this))):"disabled"===e&&i!==t?null==i?this.enable():this.disable():e===sz&&this.tooltipEl&&i!==t?this.tooltipEl.placement=i:e===rb.MEDIA_LANG&&(this.shadowRoot.querySelector('slot[name="tooltip-content"]').innerHTML=this.constructor.getTooltipContentHTML()),sj(this,cv).call(this)}connectedCallback(){var e,t,i;let{style:a}=na(this.shadowRoot,":host");a.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`),this.hasAttribute("disabled")?this.disable():this.enable(),this.setAttribute("role","button");let r=this.getAttribute(rm.MEDIA_CONTROLLER);r&&(sQ(this,cm,null==(e=this.getRootNode())?void 0:e.getElementById(r)),null==(i=null==(t=sj(this,cm))?void 0:t.associateElement)||i.call(t,this)),rz.customElements.whenDefined("media-tooltip").then(()=>{var e,t;return(e=cf,t=cE,sG(this,e,"access private method"),t).call(this)})}disconnectedCallback(){var e,t;this.disable(),null==(t=null==(e=sj(this,cm))?void 0:e.unassociateElement)||t.call(e,this),sQ(this,cm,null),this.removeEventListener("mouseenter",sj(this,cv)),this.removeEventListener("focus",sj(this,cv)),this.removeEventListener("click",sj(this,cp))}get keysUsed(){return["Enter"," "]}get tooltipPlacement(){return nd(this,sz)}set tooltipPlacement(e){nu(this,sz,e)}get mediaController(){return nd(this,rm.MEDIA_CONTROLLER)}set mediaController(e){nu(this,rm.MEDIA_CONTROLLER,e)}get disabled(){return no(this,sZ)}set disabled(e){nl(this,sZ,e)}get noTooltip(){return no(this,sX)}set noTooltip(e){nl(this,sX,e)}handleClick(e){}}cm=new WeakMap,cp=new WeakMap,cv=new WeakMap,cb=new WeakMap,cg=new WeakMap,cf=new WeakSet,cE=function(){this.addEventListener("mouseenter",sj(this,cv)),this.addEventListener("focus",sj(this,cv)),this.addEventListener("click",sj(this,cp));let e=this.tooltipPlacement;e&&this.tooltipEl&&(this.tooltipEl.placement=e)},sJ.shadowRootOptions={mode:"open"},sJ.getTemplateHTML=function(e,t={}){return`
    <style>
      :host {
        position: relative;
        font: var(--media-font,
          var(--media-font-weight, bold)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        padding: var(--media-button-padding, var(--media-control-padding, 10px));
        justify-content: var(--media-button-justify-content, center);
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
        box-sizing: border-box;
        transition: background .15s linear;
        pointer-events: auto;
        cursor: var(--media-cursor, pointer);
        -webkit-tap-highlight-color: transparent;
      }

      
      :host(:focus-visible) {
        box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: 0;
      }
      
      :host(:where(:focus)) {
        box-shadow: none;
        outline: 0;
      }

      :host(:hover) {
        background: var(--media-control-hover-background, rgba(50 50 70 / .7));
      }

      svg, img, ::slotted(svg), ::slotted(img) {
        width: var(--media-button-icon-width);
        height: var(--media-button-icon-height, var(--media-control-height, 24px));
        transform: var(--media-button-icon-transform);
        transition: var(--media-button-icon-transition);
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        vertical-align: middle;
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
      }

      media-tooltip {
        
        max-width: 0;
        overflow-x: clip;
        opacity: 0;
        transition: opacity .3s, max-width 0s 9s;
      }

      :host(:hover) media-tooltip,
      :host(:focus-visible) media-tooltip {
        max-width: 100vw;
        opacity: 1;
        transition: opacity .3s;
      }

      :host([notooltip]) slot[name="tooltip"] {
        display: none;
      }
    </style>

    ${this.getSlotTemplateHTML(e,t)}

    <slot name="tooltip">
      <media-tooltip part="tooltip" aria-hidden="true">
        <template shadowrootmode="${sK.shadowRootOptions.mode}">
          ${sK.getTemplateHTML({})}
        </template>
        <slot name="tooltip-content">
          ${this.getTooltipContentHTML(e)}
        </slot>
      </media-tooltip>
    </slot>
  `},sJ.getSlotTemplateHTML=function(e,t){return`
    <slot></slot>
  `},sJ.getTooltipContentHTML=function(){return""},rz.customElements.get("media-chrome-button")||rz.customElements.define("media-chrome-button",sJ);let s0=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.13 3H3.87a.87.87 0 0 0-.87.87v13.26a.87.87 0 0 0 .87.87h3.4L9 16H5V5h16v11h-4l1.72 2h3.4a.87.87 0 0 0 .87-.87V3.87a.87.87 0 0 0-.86-.87Zm-8.75 11.44a.5.5 0 0 0-.76 0l-4.91 5.73a.5.5 0 0 0 .38.83h9.82a.501.501 0 0 0 .38-.83l-4.91-5.73Z"/>
</svg>
`,s1=e=>{let t=e.mediaIsAirplaying?rU("stop airplay"):rU("start airplay");e.setAttribute("aria-label",t)};class s2 extends sJ{static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_IS_AIRPLAYING,rb.MEDIA_AIRPLAY_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),s1(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===rb.MEDIA_IS_AIRPLAYING&&s1(this)}get mediaIsAirplaying(){return no(this,rb.MEDIA_IS_AIRPLAYING)}set mediaIsAirplaying(e){nl(this,rb.MEDIA_IS_AIRPLAYING,e)}get mediaAirplayUnavailable(){return nd(this,rb.MEDIA_AIRPLAY_UNAVAILABLE)}set mediaAirplayUnavailable(e){nu(this,rb.MEDIA_AIRPLAY_UNAVAILABLE,e)}handleClick(){let e=new rz.CustomEvent(rh.MEDIA_AIRPLAY_REQUEST,{composed:!0,bubbles:!0});this.dispatchEvent(e)}}s2.getSlotTemplateHTML=function(e){return`
    <style>
      :host([${rb.MEDIA_IS_AIRPLAYING}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${rb.MEDIA_IS_AIRPLAYING}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${rb.MEDIA_IS_AIRPLAYING}]) slot[name=tooltip-enter],
      :host(:not([${rb.MEDIA_IS_AIRPLAYING}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${s0}</slot>
      <slot name="exit">${s0}</slot>
    </slot>
  `},s2.getTooltipContentHTML=function(){return`
    <slot name="tooltip-enter">${rU("start airplay")}</slot>
    <slot name="tooltip-exit">${rU("stop airplay")}</slot>
  `},rz.customElements.get("media-airplay-button")||rz.customElements.define("media-airplay-button",s2);let s3=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
</svg>`,s4=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z"/>
</svg>`,s5=e=>{e.setAttribute("aria-checked",nF(e).toString())};class s9 extends sJ{static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_SUBTITLES_LIST,rb.MEDIA_SUBTITLES_SHOWING]}connectedCallback(){super.connectedCallback(),this.setAttribute("role","button"),this.setAttribute("aria-label",rU("closed captions")),s5(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===rb.MEDIA_SUBTITLES_SHOWING&&s5(this)}get mediaSubtitlesList(){return s8(this,rb.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(e){s6(this,rb.MEDIA_SUBTITLES_LIST,e)}get mediaSubtitlesShowing(){return s8(this,rb.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(e){s6(this,rb.MEDIA_SUBTITLES_SHOWING,e)}handleClick(){this.dispatchEvent(new rz.CustomEvent(rh.MEDIA_TOGGLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0}))}}s9.getSlotTemplateHTML=function(e){return`
    <style>
      :host([aria-checked="true"]) slot[name=off] {
        display: none !important;
      }

      
      :host(:not([aria-checked="true"])) slot[name=on] {
        display: none !important;
      }

      :host([aria-checked="true"]) slot[name=tooltip-enable],
      :host(:not([aria-checked="true"])) slot[name=tooltip-disable] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="on">${s3}</slot>
      <slot name="off">${s4}</slot>
    </slot>
  `},s9.getTooltipContentHTML=function(){return`
    <slot name="tooltip-enable">${rU("Enable captions")}</slot>
    <slot name="tooltip-disable">${rU("Disable captions")}</slot>
  `};let s8=(e,t)=>{let i=e.getAttribute(t);return i?nU(i):[]},s6=(e,t,i)=>{if(!(null==i?void 0:i.length))return void e.removeAttribute(t);let a=nW(i);e.getAttribute(t)!==a&&e.setAttribute(t,a)};rz.customElements.get("media-captions-button")||rz.customElements.define("media-captions-button",s9);let s7=e=>{let t=e.mediaIsCasting?rU("stop casting"):rU("start casting");e.setAttribute("aria-label",t)};class oe extends sJ{static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_IS_CASTING,rb.MEDIA_CAST_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),s7(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===rb.MEDIA_IS_CASTING&&s7(this)}get mediaIsCasting(){return no(this,rb.MEDIA_IS_CASTING)}set mediaIsCasting(e){nl(this,rb.MEDIA_IS_CASTING,e)}get mediaCastUnavailable(){return nd(this,rb.MEDIA_CAST_UNAVAILABLE)}set mediaCastUnavailable(e){nu(this,rb.MEDIA_CAST_UNAVAILABLE,e)}handleClick(){let e=this.mediaIsCasting?rh.MEDIA_EXIT_CAST_REQUEST:rh.MEDIA_ENTER_CAST_REQUEST;this.dispatchEvent(new rz.CustomEvent(e,{composed:!0,bubbles:!0}))}}oe.getSlotTemplateHTML=function(e){return`
    <style>
      :host([${rb.MEDIA_IS_CASTING}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${rb.MEDIA_IS_CASTING}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${rb.MEDIA_IS_CASTING}]) slot[name=tooltip-enter],
      :host(:not([${rb.MEDIA_IS_CASTING}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter"><svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/></g></svg></slot>
      <slot name="exit"><svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/><path class="cast_caf_icon_boxfill" d="M5,7 L5,8.63 C8,8.6 13.37,14 13.37,17 L19,17 L19,7 Z"/></g></svg></slot>
    </slot>
  `},oe.getTooltipContentHTML=function(){return`
    <slot name="tooltip-enter">${rU("Start casting")}</slot>
    <slot name="tooltip-exit">${rU("Stop casting")}</slot>
  `},rz.customElements.get("media-cast-button")||rz.customElements.define("media-cast-button",oe);var ot=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},oi=(e,t,i)=>(ot(e,t,"read from private field"),i?i.call(e):t.get(e)),oa=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},or=(e,t,i,a)=>(ot(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),on=(e,t,i)=>(ot(e,t,"access private method"),i);let os="open";class oo extends rz.HTMLElement{constructor(){super(),oa(this,cA),oa(this,cw),oa(this,cI),oa(this,cC),oa(this,cM),oa(this,cx),oa(this,cy,!1),oa(this,c_,null),oa(this,cT,null)}static get observedAttributes(){return[os,"anchor"]}get open(){return no(this,os)}set open(e){nl(this,os,e)}handleEvent(e){switch(e.type){case"invoke":on(this,cC,cL).call(this,e);break;case"focusout":on(this,cM,cD).call(this,e);break;case"keydown":on(this,cx,cP).call(this,e)}}connectedCallback(){on(this,cA,ck).call(this),this.role||(this.role="dialog"),this.addEventListener("invoke",this),this.addEventListener("focusout",this),this.addEventListener("keydown",this)}disconnectedCallback(){this.removeEventListener("invoke",this),this.removeEventListener("focusout",this),this.removeEventListener("keydown",this)}attributeChangedCallback(e,t,i){on(this,cA,ck).call(this),e===os&&i!==t&&(this.open?on(this,cw,cS).call(this):on(this,cI,cR).call(this))}focus(){or(this,c_,ne());let e=!this.dispatchEvent(new Event("focus",{composed:!0,cancelable:!0})),t=!this.dispatchEvent(new Event("focusin",{composed:!0,bubbles:!0,cancelable:!0}));if(e||t)return;let i=this.querySelector('[autofocus], [tabindex]:not([tabindex="-1"]), [role="menu"]');null==i||i.focus()}get keysUsed(){return["Escape","Tab"]}}cy=new WeakMap,c_=new WeakMap,cT=new WeakMap,cA=new WeakSet,ck=function(){if(!oi(this,cy)&&(or(this,cy,!0),!this.shadowRoot)){this.attachShadow(this.constructor.shadowRootOptions);let e=r3(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e),queueMicrotask(()=>{let{style:e}=na(this.shadowRoot,":host");e.setProperty("transition","display .15s, visibility .15s, opacity .15s ease-in, transform .15s ease-in")})}},cw=new WeakSet,cS=function(){var e;null==(e=oi(this,cT))||e.setAttribute("aria-expanded","true"),this.dispatchEvent(new Event("open",{composed:!0,bubbles:!0})),this.addEventListener("transitionend",()=>this.focus(),{once:!0})},cI=new WeakSet,cR=function(){var e;null==(e=oi(this,cT))||e.setAttribute("aria-expanded","false"),this.dispatchEvent(new Event("close",{composed:!0,bubbles:!0}))},cC=new WeakSet,cL=function(e){or(this,cT,e.relatedTarget),r6(this,e.relatedTarget)||(this.open=!this.open)},cM=new WeakSet,cD=function(e){var t;!r6(this,e.relatedTarget)&&(null==(t=oi(this,c_))||t.focus(),oi(this,cT)&&oi(this,cT)!==e.relatedTarget&&this.open&&(this.open=!1))},cx=new WeakSet,cP=function(e){var t,i,a,r,n;let{key:s,ctrlKey:o,altKey:l,metaKey:d}=e;o||l||d||this.keysUsed.includes(s)&&(e.preventDefault(),e.stopPropagation(),"Tab"===s?(e.shiftKey?null==(i=null==(t=this.previousElementSibling)?void 0:t.focus)||i.call(t):null==(r=null==(a=this.nextElementSibling)?void 0:a.focus)||r.call(a),this.blur()):"Escape"===s&&(null==(n=oi(this,c_))||n.focus(),this.open=!1))},oo.shadowRootOptions={mode:"open"},oo.getTemplateHTML=function(e){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        display: var(--media-dialog-display, inline-flex);
        justify-content: center;
        align-items: center;
        
        transition-behavior: allow-discrete;
        visibility: hidden;
        opacity: 0;
        transform: translateY(2px) scale(.99);
        pointer-events: none;
      }

      :host([open]) {
        transition: display .2s, visibility 0s, opacity .2s ease-out, transform .15s ease-out;
        visibility: visible;
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      #content {
        display: flex;
        position: relative;
        box-sizing: border-box;
        width: min(320px, 100%);
        word-wrap: break-word;
        max-height: 100%;
        overflow: auto;
        text-align: center;
        line-height: 1.4;
      }
    </style>
    ${this.getSlotTemplateHTML(e)}
  `},oo.getSlotTemplateHTML=function(e){return`
    <slot id="content"></slot>
  `},rz.customElements.get("media-chrome-dialog")||rz.customElements.define("media-chrome-dialog",oo);var ol=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},od=(e,t,i)=>(ol(e,t,"read from private field"),i?i.call(e):t.get(e)),ou=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},oc=(e,t,i,a)=>(ol(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),oh=(e,t,i)=>(ol(e,t,"access private method"),i);class om extends rz.HTMLElement{constructor(){if(super(),ou(this,cF),ou(this,cG),ou(this,cY),ou(this,cz),ou(this,cX),ou(this,c0),ou(this,c2),ou(this,c4),ou(this,cN,void 0),ou(this,cO,void 0),ou(this,cU,void 0),ou(this,cB,void 0),ou(this,cH,{}),ou(this,cW,[]),ou(this,c$,()=>{if(this.range.matches(":focus-visible")){let{style:e}=na(this.shadowRoot,":host");e.setProperty("--_focus-visible-box-shadow","var(--_focus-box-shadow)")}}),ou(this,cq,()=>{let{style:e}=na(this.shadowRoot,":host");e.removeProperty("--_focus-visible-box-shadow")}),ou(this,cV,()=>{let e=this.shadowRoot.querySelector("#segments-clipping");e&&e.parentNode.append(e)}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const e=r3(this.attributes),t=this.constructor.getTemplateHTML(e);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(t):this.shadowRoot.innerHTML=t}this.container=this.shadowRoot.querySelector("#container"),oc(this,cU,this.shadowRoot.querySelector("#startpoint")),oc(this,cB,this.shadowRoot.querySelector("#endpoint")),this.range=this.shadowRoot.querySelector("#range"),this.appearance=this.shadowRoot.querySelector("#appearance")}static get observedAttributes(){return["disabled","aria-disabled",rm.MEDIA_CONTROLLER]}attributeChangedCallback(e,t,i){var a,r,n,s,o;e===rm.MEDIA_CONTROLLER?(t&&(null==(r=null==(a=od(this,cN))?void 0:a.unassociateElement)||r.call(a,this),oc(this,cN,null)),i&&this.isConnected&&(oc(this,cN,null==(n=this.getRootNode())?void 0:n.getElementById(i)),null==(o=null==(s=od(this,cN))?void 0:s.associateElement)||o.call(s,this))):("disabled"===e||"aria-disabled"===e&&t!==i)&&(null==i?(this.range.removeAttribute(e),oh(this,cG,cj).call(this)):(this.range.setAttribute(e,i),oh(this,cY,cQ).call(this)))}connectedCallback(){var e,t,i;let{style:a}=na(this.shadowRoot,":host");a.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`),od(this,cH).pointer=na(this.shadowRoot,"#pointer"),od(this,cH).progress=na(this.shadowRoot,"#progress"),od(this,cH).thumb=na(this.shadowRoot,'#thumb, ::slotted([slot="thumb"])'),od(this,cH).activeSegment=na(this.shadowRoot,"#segments-clipping rect:nth-child(0)");let r=this.getAttribute(rm.MEDIA_CONTROLLER);r&&(oc(this,cN,null==(e=this.getRootNode())?void 0:e.getElementById(r)),null==(i=null==(t=od(this,cN))?void 0:t.associateElement)||i.call(t,this)),this.updateBar(),this.shadowRoot.addEventListener("focusin",od(this,c$)),this.shadowRoot.addEventListener("focusout",od(this,cq)),oh(this,cG,cj).call(this),r1(this.container,od(this,cV))}disconnectedCallback(){var e,t;oh(this,cY,cQ).call(this),null==(t=null==(e=od(this,cN))?void 0:e.unassociateElement)||t.call(e,this),oc(this,cN,null),this.shadowRoot.removeEventListener("focusin",od(this,c$)),this.shadowRoot.removeEventListener("focusout",od(this,cq)),r2(this.container,od(this,cV))}updatePointerBar(e){var t;null==(t=od(this,cH).pointer)||t.style.setProperty("width",`${100*this.getPointerRatio(e)}%`)}updateBar(){var e,t;let i=100*this.range.valueAsNumber;null==(e=od(this,cH).progress)||e.style.setProperty("width",`${i}%`),null==(t=od(this,cH).thumb)||t.style.setProperty("left",`${i}%`)}updateSegments(e){let t=this.shadowRoot.querySelector("#segments-clipping");if(t.textContent="",this.container.classList.toggle("segments",!!(null==e?void 0:e.length)),!(null==e?void 0:e.length))return;let i=[...new Set([+this.range.min,...e.flatMap(e=>[e.start,e.end]),+this.range.max])];oc(this,cW,[...i]);let a=i.pop();for(let[e,r]of i.entries()){let[n,s]=[0===e,e===i.length-1],o=n?"calc(var(--segments-gap) / -1)":`${100*r}%`,l=s?a:i[e+1],d=`calc(${(l-r)*100}%${n||s?"":" - var(--segments-gap)"})`,u=rZ.createElementNS("http://www.w3.org/2000/svg","rect"),c=nr(this.shadowRoot,`#segments-clipping rect:nth-child(${e+1})`);c.style.setProperty("x",o),c.style.setProperty("width",d),t.append(u)}}getPointerRatio(e){var t,i,a,r;let n,s,o;return t=e.clientX,i=e.clientY,a=od(this,cU).getBoundingClientRect(),n=(r=od(this,cB).getBoundingClientRect()).x-a.x,0==(o=n*n+(s=r.y-a.y)*s)?0:Math.max(0,Math.min(1,((t-a.x)*n+(i-a.y)*s)/o))}get dragging(){return this.hasAttribute("dragging")}handleEvent(e){switch(e.type){case"pointermove":oh(this,c4,c5).call(this,e);break;case"input":this.updateBar();break;case"pointerenter":oh(this,cX,cJ).call(this,e);break;case"pointerdown":oh(this,cz,cZ).call(this,e);break;case"pointerup":oh(this,c0,c1).call(this);break;case"pointerleave":oh(this,c2,c3).call(this)}}get keysUsed(){return["ArrowUp","ArrowRight","ArrowDown","ArrowLeft"]}}cN=new WeakMap,cO=new WeakMap,cU=new WeakMap,cB=new WeakMap,cH=new WeakMap,cW=new WeakMap,c$=new WeakMap,cq=new WeakMap,cV=new WeakMap,cF=new WeakSet,cK=function(e){let t=od(this,cH).activeSegment;if(!t)return;let i=this.getPointerRatio(e),a=od(this,cW).findIndex((e,t,a)=>{let r=a[t+1];return null!=r&&i>=e&&i<=r}),r=`#segments-clipping rect:nth-child(${a+1})`;t.selectorText==r&&t.style.transform||(t.selectorText=r,t.style.setProperty("transform","var(--media-range-segment-hover-transform, scaleY(2))"))},cG=new WeakSet,cj=function(){!this.hasAttribute("disabled")&&this.isConnected&&(this.addEventListener("input",this),this.addEventListener("pointerdown",this),this.addEventListener("pointerenter",this))},cY=new WeakSet,cQ=function(){var e,t;this.removeEventListener("input",this),this.removeEventListener("pointerdown",this),this.removeEventListener("pointerenter",this),this.removeEventListener("pointerleave",this),null==(e=rz.window)||e.removeEventListener("pointerup",this),null==(t=rz.window)||t.removeEventListener("pointermove",this)},cz=new WeakSet,cZ=function(e){var t;oc(this,cO,e.composedPath().includes(this.range)),null==(t=rz.window)||t.addEventListener("pointerup",this,{once:!0})},cX=new WeakSet,cJ=function(e){var t;"mouse"!==e.pointerType&&oh(this,cz,cZ).call(this,e),this.addEventListener("pointerleave",this,{once:!0}),null==(t=rz.window)||t.addEventListener("pointermove",this)},c0=new WeakSet,c1=function(){var e;null==(e=rz.window)||e.removeEventListener("pointerup",this),this.toggleAttribute("dragging",!1),this.range.disabled=this.hasAttribute("disabled")},c2=new WeakSet,c3=function(){var e,t;this.removeEventListener("pointerleave",this),null==(e=rz.window)||e.removeEventListener("pointermove",this),this.toggleAttribute("dragging",!1),this.range.disabled=this.hasAttribute("disabled"),null==(t=od(this,cH).activeSegment)||t.style.removeProperty("transform")},c4=new WeakSet,c5=function(e){("pen"!==e.pointerType||0!==e.buttons)&&(this.toggleAttribute("dragging",1===e.buttons||"mouse"!==e.pointerType),this.updatePointerBar(e),oh(this,cF,cK).call(this,e),this.dragging&&("mouse"!==e.pointerType||!od(this,cO))&&(this.range.disabled=!0,this.range.valueAsNumber=this.getPointerRatio(e),this.range.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))))},om.shadowRootOptions={mode:"open"},om.getTemplateHTML=function(e){return`
    <style>
      :host {
        --_focus-box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        --_media-range-padding: var(--media-range-padding, var(--media-control-padding, 10px));

        box-shadow: var(--_focus-visible-box-shadow, none);
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        height: calc(var(--media-control-height, 24px) + 2 * var(--_media-range-padding));
        display: inline-flex;
        align-items: center;
        
        vertical-align: middle;
        box-sizing: border-box;
        position: relative;
        width: 100px;
        transition: background .15s linear;
        cursor: var(--media-cursor, pointer);
        pointer-events: auto;
        touch-action: none; 
      }

      
      input[type=range]:focus {
        outline: 0;
      }
      input[type=range]:focus::-webkit-slider-runnable-track {
        outline: 0;
      }

      :host(:hover) {
        background: var(--media-control-hover-background, rgb(50 50 70 / .7));
      }

      #leftgap {
        padding-left: var(--media-range-padding-left, var(--_media-range-padding));
      }

      #rightgap {
        padding-right: var(--media-range-padding-right, var(--_media-range-padding));
      }

      #startpoint,
      #endpoint {
        position: absolute;
      }

      #endpoint {
        right: 0;
      }

      #container {
        
        width: var(--media-range-track-width, 100%);
        transform: translate(var(--media-range-track-translate-x, 0px), var(--media-range-track-translate-y, 0px));
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
        min-width: 40px;
      }

      #range {
        
        display: var(--media-time-range-hover-display, block);
        bottom: var(--media-time-range-hover-bottom, -7px);
        height: var(--media-time-range-hover-height, max(100% + 7px, 25px));
        width: 100%;
        position: absolute;
        cursor: var(--media-cursor, pointer);

        -webkit-appearance: none; 
        -webkit-tap-highlight-color: transparent;
        background: transparent; 
        margin: 0;
        z-index: 1;
      }

      @media (hover: hover) {
        #range {
          bottom: var(--media-time-range-hover-bottom, -5px);
          height: var(--media-time-range-hover-height, max(100% + 5px, 20px));
        }
      }

      
      
      #range::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: transparent;
        width: .1px;
        height: .1px;
      }

      
      #range::-moz-range-thumb {
        background: transparent;
        border: transparent;
        width: .1px;
        height: .1px;
      }

      #appearance {
        height: var(--media-range-track-height, 4px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        position: absolute;
        
        will-change: transform;
      }

      #track {
        background: var(--media-range-track-background, rgb(255 255 255 / .2));
        border-radius: var(--media-range-track-border-radius, 1px);
        border: var(--media-range-track-border, none);
        outline: var(--media-range-track-outline);
        outline-offset: var(--media-range-track-outline-offset);
        backdrop-filter: var(--media-range-track-backdrop-filter);
        -webkit-backdrop-filter: var(--media-range-track-backdrop-filter);
        box-shadow: var(--media-range-track-box-shadow, none);
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      #progress,
      #pointer {
        position: absolute;
        height: 100%;
        will-change: width;
      }

      #progress {
        background: var(--media-range-bar-color, var(--media-primary-color, rgb(238 238 238)));
        transition: var(--media-range-track-transition);
      }

      #pointer {
        background: var(--media-range-track-pointer-background);
        border-right: var(--media-range-track-pointer-border-right);
        transition: visibility .25s, opacity .25s;
        visibility: hidden;
        opacity: 0;
      }

      @media (hover: hover) {
        :host(:hover) #pointer {
          transition: visibility .5s, opacity .5s;
          visibility: visible;
          opacity: 1;
        }
      }

      #thumb,
      ::slotted([slot=thumb]) {
        width: var(--media-range-thumb-width, 10px);
        height: var(--media-range-thumb-height, 10px);
        transition: var(--media-range-thumb-transition);
        transform: var(--media-range-thumb-transform, none);
        opacity: var(--media-range-thumb-opacity, 1);
        translate: -50%;
        position: absolute;
        left: 0;
        cursor: var(--media-cursor, pointer);
      }

      #thumb {
        border-radius: var(--media-range-thumb-border-radius, 10px);
        background: var(--media-range-thumb-background, var(--media-primary-color, rgb(238 238 238)));
        box-shadow: var(--media-range-thumb-box-shadow, 1px 1px 1px transparent);
        border: var(--media-range-thumb-border, none);
      }

      :host([disabled]) #thumb {
        background-color: #777;
      }

      .segments #appearance {
        height: var(--media-range-segment-hover-height, 7px);
      }

      #track {
        clip-path: url(#segments-clipping);
      }

      #segments {
        --segments-gap: var(--media-range-segments-gap, 2px);
        position: absolute;
        width: 100%;
        height: 100%;
      }

      #segments-clipping {
        transform: translateX(calc(var(--segments-gap) / 2));
      }

      #segments-clipping:empty {
        display: none;
      }

      #segments-clipping rect {
        height: var(--media-range-track-height, 4px);
        y: calc((var(--media-range-segment-hover-height, 7px) - var(--media-range-track-height, 4px)) / 2);
        transition: var(--media-range-segment-transition, transform .1s ease-in-out);
        transform: var(--media-range-segment-transform, scaleY(1));
        transform-origin: center;
      }

      /* Visible label for accessibility - positioned off-screen but technically visible (Firefox requires visible labels) */
      #range-label {
        position: absolute;
        left: -10000px;
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        pointer-events: none;
      }
    </style>
    <div id="leftgap"></div>
    <div id="container">
      <div id="startpoint"></div>
      <div id="endpoint"></div>
      <div id="appearance">
        <div id="track" part="track">
          <div id="pointer"></div>
          <div id="progress" part="progress"></div>
        </div>
        <slot name="thumb">
          <div id="thumb" part="thumb"></div>
        </slot>
        <svg id="segments" aria-hidden="true"><clipPath id="segments-clipping"></clipPath></svg>
      </div>
        <input id="range" type="range" min="0" max="1" step="any" value="0">
        <label for="range" id="range-label"></label>

      ${this.getContainerTemplateHTML(e)}
    </div>
    <div id="rightgap"></div>
  `},om.getContainerTemplateHTML=function(e){return""},rz.customElements.get("media-chrome-range")||rz.customElements.define("media-chrome-range",om);var op=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},ov=(e,t,i)=>(op(e,t,"read from private field"),i?i.call(e):t.get(e)),ob=(e,t,i,a)=>(op(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);class og extends rz.HTMLElement{constructor(){if(super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,c9,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const e=r3(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[rm.MEDIA_CONTROLLER]}attributeChangedCallback(e,t,i){var a,r,n,s,o;e===rm.MEDIA_CONTROLLER&&(t&&(null==(r=null==(a=ov(this,c9))?void 0:a.unassociateElement)||r.call(a,this),ob(this,c9,null)),i&&this.isConnected&&(ob(this,c9,null==(n=this.getRootNode())?void 0:n.getElementById(i)),null==(o=null==(s=ov(this,c9))?void 0:s.associateElement)||o.call(s,this)))}connectedCallback(){var e,t,i;let a=this.getAttribute(rm.MEDIA_CONTROLLER);a&&(ob(this,c9,null==(e=this.getRootNode())?void 0:e.getElementById(a)),null==(i=null==(t=ov(this,c9))?void 0:t.associateElement)||i.call(t,this))}disconnectedCallback(){var e,t;null==(t=null==(e=ov(this,c9))?void 0:e.unassociateElement)||t.call(e,this),ob(this,c9,null)}}c9=new WeakMap,og.shadowRootOptions={mode:"open"},og.getTemplateHTML=function(e){return`
    <style>
      :host {
        
        box-sizing: border-box;
        display: var(--media-control-display, var(--media-control-bar-display, inline-flex));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        --media-loading-indicator-icon-height: 44px;
      }

      ::slotted(media-time-range),
      ::slotted(media-volume-range) {
        min-height: 100%;
      }

      ::slotted(media-time-range),
      ::slotted(media-clip-selector) {
        flex-grow: 1;
      }

      ::slotted([role="menu"]) {
        position: absolute;
      }
    </style>

    <slot></slot>
  `},rz.customElements.get("media-control-bar")||rz.customElements.define("media-control-bar",og);var of=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},oE=(e,t,i)=>(of(e,t,"read from private field"),i?i.call(e):t.get(e)),oy=(e,t,i,a)=>(of(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);class o_ extends rz.HTMLElement{constructor(){if(super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,c8,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const e=r3(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[rm.MEDIA_CONTROLLER]}attributeChangedCallback(e,t,i){var a,r,n,s,o;e===rm.MEDIA_CONTROLLER&&(t&&(null==(r=null==(a=oE(this,c8))?void 0:a.unassociateElement)||r.call(a,this),oy(this,c8,null)),i&&this.isConnected&&(oy(this,c8,null==(n=this.getRootNode())?void 0:n.getElementById(i)),null==(o=null==(s=oE(this,c8))?void 0:s.associateElement)||o.call(s,this)))}connectedCallback(){var e,t,i;let{style:a}=na(this.shadowRoot,":host");a.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`);let r=this.getAttribute(rm.MEDIA_CONTROLLER);r&&(oy(this,c8,null==(e=this.getRootNode())?void 0:e.getElementById(r)),null==(i=null==(t=oE(this,c8))?void 0:t.associateElement)||i.call(t,this))}disconnectedCallback(){var e,t;null==(t=null==(e=oE(this,c8))?void 0:e.unassociateElement)||t.call(e,this),oy(this,c8,null)}}c8=new WeakMap,o_.shadowRootOptions={mode:"open"},o_.getTemplateHTML=function(e,t={}){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        background: var(--media-text-background, var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7))));
        padding: var(--media-control-padding, 10px);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        vertical-align: middle;
        box-sizing: border-box;
        text-align: center;
        pointer-events: auto;
      }

      
      :host(:focus-visible) {
        box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: 0;
      }

      
      :host(:where(:focus)) {
        box-shadow: none;
        outline: 0;
      }
    </style>

    ${this.getSlotTemplateHTML(e,t)}
  `},o_.getSlotTemplateHTML=function(e,t){return`
    <slot></slot>
  `},rz.customElements.get("media-text-display")||rz.customElements.define("media-text-display",o_);var oT=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},oA=(e,t,i)=>(oT(e,t,"read from private field"),i?i.call(e):t.get(e));class ok extends o_{constructor(){var e;super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,c6,void 0),((e,t,i,a)=>(oT(e,t,"write to private field"),a?a.call(e,i):t.set(e,i)))(this,c6,this.shadowRoot.querySelector("slot")),oA(this,c6).textContent=rW(null!=(e=this.mediaDuration)?e:0)}static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_DURATION]}attributeChangedCallback(e,t,i){e===rb.MEDIA_DURATION&&(oA(this,c6).textContent=rW(+i)),super.attributeChangedCallback(e,t,i)}get mediaDuration(){return nn(this,rb.MEDIA_DURATION)}set mediaDuration(e){ns(this,rb.MEDIA_DURATION,e)}}c6=new WeakMap,ok.getSlotTemplateHTML=function(e,t){return`
    <slot>${rW(t.mediaDuration)}</slot>
  `},rz.customElements.get("media-duration-display")||rz.customElements.define("media-duration-display",ok);let ow={2:rU("Network Error"),3:rU("Decode Error"),4:rU("Source Not Supported"),5:rU("Encryption Error")},oS={2:rU("A network error caused the media download to fail."),3:rU("A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format."),4:rU("An unsupported error occurred. The server or network failed, or your browser does not support this format."),5:rU("The media is encrypted and there are no keys to decrypt it.")},oI=e=>{var t,i;return 1===e.code?null:{title:null!=(t=ow[e.code])?t:`Error ${e.code}`,message:null!=(i=oS[e.code])?i:e.message}};var oR=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)};function oC(e){var t;let{title:i,message:a}=null!=(t=oI(e))?t:{},r="";return i&&(r+=`<slot name="error-${e.code}-title"><h3>${i}</h3></slot>`),a&&(r+=`<slot name="error-${e.code}-message"><p>${a}</p></slot>`),r}let oL=[rb.MEDIA_ERROR_CODE,rb.MEDIA_ERROR_MESSAGE];class oM extends oo{constructor(){super(...arguments),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,c7,null)}static get observedAttributes(){return[...super.observedAttributes,...oL]}formatErrorMessage(e){return this.constructor.formatErrorMessage(e)}attributeChangedCallback(e,t,i){var a;if(super.attributeChangedCallback(e,t,i),!oL.includes(e))return;let r=null!=(a=this.mediaError)?a:{code:this.mediaErrorCode,message:this.mediaErrorMessage};if(this.open=r.code&&null!==oI(r),this.open&&(this.shadowRoot.querySelector("slot").name=`error-${this.mediaErrorCode}`,this.shadowRoot.querySelector("#content").innerHTML=this.formatErrorMessage(r),!this.hasAttribute("aria-label"))){let{title:e}=oI(r);e&&this.setAttribute("aria-label",e)}}get mediaError(){var e,t;return oR(this,e=c7,"read from private field"),t?t.call(this):e.get(this)}set mediaError(e){var t,i;oR(this,t=c7,"write to private field"),i?i.call(this,e):t.set(this,e)}get mediaErrorCode(){return nn(this,"mediaerrorcode")}set mediaErrorCode(e){ns(this,"mediaerrorcode",e)}get mediaErrorMessage(){return nd(this,"mediaerrormessage")}set mediaErrorMessage(e){nu(this,"mediaerrormessage",e)}}c7=new WeakMap,oM.getSlotTemplateHTML=function(e){return`
    <style>
      :host {
        background: rgb(20 20 30 / .8);
      }

      #content {
        display: block;
        padding: 1.2em 1.5em;
      }

      h3,
      p {
        margin-block: 0 .3em;
      }
    </style>
    <slot name="error-${e.mediaerrorcode}" id="content">
      ${oC({code:+e.mediaerrorcode,message:e.mediaerrormessage})}
    </slot>
  `},oM.formatErrorMessage=oC,rz.customElements.get("media-error-dialog")||rz.customElements.define("media-error-dialog",oM);var oD=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot read from private field");return i?i.call(e):t.get(e)},ox=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)};class oP extends oo{constructor(){super(...arguments),ox(this,he,e=>{var t;if(!this.open)return;let i=null==(t=this.shadowRoot)?void 0:t.querySelector("#content");if(!i)return;let a=e.composedPath(),r=a[0]===this||a.includes(this),n=a.includes(i);r&&!n&&(this.open=!1)}),ox(this,ht,e=>{if(!this.open)return;let t=e.shiftKey&&("/"===e.key||"?"===e.key);"Escape"!==e.key&&!t||e.ctrlKey||e.altKey||e.metaKey||(this.open=!1,e.preventDefault(),e.stopPropagation())})}connectedCallback(){super.connectedCallback(),this.open&&(this.addEventListener("click",oD(this,he)),document.addEventListener("keydown",oD(this,ht)))}disconnectedCallback(){this.removeEventListener("click",oD(this,he)),document.removeEventListener("keydown",oD(this,ht))}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),"open"===e&&(this.open?(this.addEventListener("click",oD(this,he)),document.addEventListener("keydown",oD(this,ht))):(this.removeEventListener("click",oD(this,he)),document.removeEventListener("keydown",oD(this,ht))))}}he=new WeakMap,ht=new WeakMap,oP.getSlotTemplateHTML=function(e){let t;return`
    <style>
      :host {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
        background: rgb(20 20 30 / .8);
        backdrop-filter: blur(10px);
      }

      #content {
        display: block;
        width: clamp(400px, 40vw, 700px);
        max-width: 90vw;
        text-align: left;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.5rem;
        font-weight: 500;
        text-align: center;
      }

      .shortcuts-table {
        width: 100%;
        border-collapse: collapse;
      }

      .shortcuts-table tr {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .shortcuts-table tr:last-child {
        border-bottom: none;
      }

      .shortcuts-table td {
        padding: 0.75rem 0.5rem;
      }

      .shortcuts-table td:first-child {
        text-align: right;
        padding-right: 1rem;
        width: 40%;
        min-width: 120px;
      }

      .shortcuts-table td:last-child {
        padding-left: 1rem;
      }

      .key {
        display: inline-block;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        font-weight: 500;
        min-width: 1.5rem;
        text-align: center;
        margin: 0 0.2rem;
      }

      .description {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.95rem;
      }

      .key-combo {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.3rem;
      }

      .key-separator {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
      }
    </style>
    <slot id="content">
      ${t=[{keys:["Space","k"],description:"Toggle Playback"},{keys:["m"],description:"Toggle mute"},{keys:["f"],description:"Toggle fullscreen"},{keys:["c"],description:"Toggle captions or subtitles, if available"},{keys:["p"],description:"Toggle Picture in Picture"},{keys:["←","j"],description:"Seek back 10s"},{keys:["→","l"],description:"Seek forward 10s"},{keys:["↑"],description:"Turn volume up"},{keys:["↓"],description:"Turn volume down"},{keys:["< (SHIFT+,)"],description:"Decrease playback rate"},{keys:["> (SHIFT+.)"],description:"Increase playback rate"}].map(({keys:e,description:t})=>{let i=e.map((e,t)=>t>0?`<span class="key-separator">or</span><span class="key">${e}</span>`:`<span class="key">${e}</span>`).join("");return`
      <tr>
        <td>
          <div class="key-combo">${i}</div>
        </td>
        <td class="description">${t}</td>
      </tr>
    `}).join(""),`
    <h2>Keyboard Shortcuts</h2>
    <table class="shortcuts-table">${t}</table>
  `}
    </slot>
  `},rz.customElements.get("media-keyboard-shortcuts-dialog")||rz.customElements.define("media-keyboard-shortcuts-dialog",oP);var oN=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)};let oO=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M16 3v2.5h3.5V9H22V3h-6ZM4 9h2.5V5.5H10V3H4v6Zm15.5 9.5H16V21h6v-6h-2.5v3.5ZM6.5 15H4v6h6v-2.5H6.5V15Z"/>
</svg>`,oU=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M18.5 6.5V3H16v6h6V6.5h-3.5ZM16 21h2.5v-3.5H22V15h-6v6ZM4 17.5h3.5V21H10v-6H4v2.5Zm3.5-11H4V9h6V3H7.5v3.5Z"/>
</svg>`,oB=e=>{let t=e.mediaIsFullscreen?rU("exit fullscreen mode"):rU("enter fullscreen mode");e.setAttribute("aria-label",t)};class oH extends sJ{constructor(){super(...arguments),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,hi,null)}static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_IS_FULLSCREEN,rb.MEDIA_FULLSCREEN_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),oB(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===rb.MEDIA_IS_FULLSCREEN&&oB(this)}get mediaFullscreenUnavailable(){return nd(this,rb.MEDIA_FULLSCREEN_UNAVAILABLE)}set mediaFullscreenUnavailable(e){nu(this,rb.MEDIA_FULLSCREEN_UNAVAILABLE,e)}get mediaIsFullscreen(){return no(this,rb.MEDIA_IS_FULLSCREEN)}set mediaIsFullscreen(e){nl(this,rb.MEDIA_IS_FULLSCREEN,e)}handleClick(e){var t,i,a,r;oN(this,t=hi,"write to private field"),i?i.call(this,e):t.set(this,e);let n=(oN(this,a=hi,"read from private field"),(r?r.call(this):a.get(this))instanceof PointerEvent),s=this.mediaIsFullscreen?new rz.CustomEvent(rh.MEDIA_EXIT_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0}):new rz.CustomEvent(rh.MEDIA_ENTER_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0,detail:n});this.dispatchEvent(s)}}hi=new WeakMap,oH.getSlotTemplateHTML=function(e){return`
    <style>
      :host([${rb.MEDIA_IS_FULLSCREEN}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${rb.MEDIA_IS_FULLSCREEN}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${rb.MEDIA_IS_FULLSCREEN}]) slot[name=tooltip-enter],
      :host(:not([${rb.MEDIA_IS_FULLSCREEN}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${oO}</slot>
      <slot name="exit">${oU}</slot>
    </slot>
  `},oH.getTooltipContentHTML=function(){return`
    <slot name="tooltip-enter">${rU("Enter fullscreen mode")}</slot>
    <slot name="tooltip-exit">${rU("Exit fullscreen mode")}</slot>
  `},rz.customElements.get("media-fullscreen-button")||rz.customElements.define("media-fullscreen-button",oH);let{MEDIA_TIME_IS_LIVE:oW,MEDIA_PAUSED:o$}=rb,{MEDIA_SEEK_TO_LIVE_REQUEST:oq,MEDIA_PLAY_REQUEST:oV}=rh,oF=e=>{var t;let i=e.mediaPaused||!e.mediaTimeIsLive,a=i?rU("seek to live"):rU("playing live");e.setAttribute("aria-label",a);let r=null==(t=e.shadowRoot)?void 0:t.querySelector('slot[name="text"]');r&&(r.textContent=rU("live")),i?e.removeAttribute("aria-disabled"):e.setAttribute("aria-disabled","true")};class oK extends sJ{static get observedAttributes(){return[...super.observedAttributes,oW,o$]}connectedCallback(){super.connectedCallback(),oF(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),oF(this)}get mediaPaused(){return no(this,rb.MEDIA_PAUSED)}set mediaPaused(e){nl(this,rb.MEDIA_PAUSED,e)}get mediaTimeIsLive(){return no(this,rb.MEDIA_TIME_IS_LIVE)}set mediaTimeIsLive(e){nl(this,rb.MEDIA_TIME_IS_LIVE,e)}handleClick(){(this.mediaPaused||!this.mediaTimeIsLive)&&(this.dispatchEvent(new rz.CustomEvent(oq,{composed:!0,bubbles:!0})),this.hasAttribute(o$)&&this.dispatchEvent(new rz.CustomEvent(oV,{composed:!0,bubbles:!0})))}}oK.getSlotTemplateHTML=function(e){return`
    <style>
      :host { --media-tooltip-display: none; }
      
      slot[name=indicator] > *,
      :host ::slotted([slot=indicator]) {
        
        min-width: auto;
        fill: var(--media-live-button-icon-color, rgb(140, 140, 140));
        color: var(--media-live-button-icon-color, rgb(140, 140, 140));
      }

      :host([${oW}]:not([${o$}])) slot[name=indicator] > *,
      :host([${oW}]:not([${o$}])) ::slotted([slot=indicator]) {
        fill: var(--media-live-button-indicator-color, rgb(255, 0, 0));
        color: var(--media-live-button-indicator-color, rgb(255, 0, 0));
      }

      :host([${oW}]:not([${o$}])) {
        cursor: var(--media-cursor, not-allowed);
      }

      slot[name=text]{
        text-transform: uppercase;
      }

    </style>

    <slot name="indicator"><svg viewBox="0 0 6 12" aria-hidden="true"><circle cx="3" cy="6" r="2"></circle></svg></slot>
    
    <slot name="spacer">&nbsp;</slot><slot name="text">${rU("live")}</slot>
  `},rz.customElements.get("media-live-button")||rz.customElements.define("media-live-button",oK);var oG=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},oj=(e,t,i)=>(oG(e,t,"read from private field"),i?i.call(e):t.get(e)),oY=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},oQ=(e,t,i,a)=>(oG(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);let oz="loadingdelay",oZ="noautohide",oX=`
<svg aria-hidden="true" viewBox="0 0 100 100">
  <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
    <animateTransform
       attributeName="transform"
       attributeType="XML"
       type="rotate"
       dur="1s"
       from="0 50 50"
       to="360 50 50"
       repeatCount="indefinite" />
  </path>
</svg>
`;class oJ extends rz.HTMLElement{constructor(){if(super(),oY(this,ha,void 0),oY(this,hr,500),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const e=r3(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[rm.MEDIA_CONTROLLER,rb.MEDIA_PAUSED,rb.MEDIA_LOADING,oz]}attributeChangedCallback(e,t,i){var a,r,n,s,o;e===oz&&t!==i?this.loadingDelay=Number(i):e===rm.MEDIA_CONTROLLER&&(t&&(null==(r=null==(a=oj(this,ha))?void 0:a.unassociateElement)||r.call(a,this),oQ(this,ha,null)),i&&this.isConnected&&(oQ(this,ha,null==(n=this.getRootNode())?void 0:n.getElementById(i)),null==(o=null==(s=oj(this,ha))?void 0:s.associateElement)||o.call(s,this)))}connectedCallback(){var e,t,i;let a=this.getAttribute(rm.MEDIA_CONTROLLER);a&&(oQ(this,ha,null==(e=this.getRootNode())?void 0:e.getElementById(a)),null==(i=null==(t=oj(this,ha))?void 0:t.associateElement)||i.call(t,this))}disconnectedCallback(){var e,t;null==(t=null==(e=oj(this,ha))?void 0:e.unassociateElement)||t.call(e,this),oQ(this,ha,null)}get loadingDelay(){return oj(this,hr)}set loadingDelay(e){oQ(this,hr,e);let{style:t}=na(this.shadowRoot,":host");t.setProperty("--_loading-indicator-delay",`var(--media-loading-indicator-transition-delay, ${e}ms)`)}get mediaPaused(){return no(this,rb.MEDIA_PAUSED)}set mediaPaused(e){nl(this,rb.MEDIA_PAUSED,e)}get mediaLoading(){return no(this,rb.MEDIA_LOADING)}set mediaLoading(e){nl(this,rb.MEDIA_LOADING,e)}get mediaController(){return nd(this,rm.MEDIA_CONTROLLER)}set mediaController(e){nu(this,rm.MEDIA_CONTROLLER,e)}get noAutohide(){return no(this,oZ)}set noAutohide(e){nl(this,oZ,e)}}ha=new WeakMap,hr=new WeakMap,oJ.shadowRootOptions={mode:"open"},oJ.getTemplateHTML=function(e){return`
    <style>
      :host {
        display: var(--media-control-display, var(--media-loading-indicator-display, inline-block));
        vertical-align: middle;
        box-sizing: border-box;
        --_loading-indicator-delay: var(--media-loading-indicator-transition-delay, 500ms);
      }

      #status {
        color: rgba(0,0,0,0);
        width: 0px;
        height: 0px;
      }

      :host slot[name=icon] > *,
      :host ::slotted([slot=icon]) {
        opacity: var(--media-loading-indicator-opacity, 0);
        transition: opacity 0.15s;
      }

      :host([${rb.MEDIA_LOADING}]:not([${rb.MEDIA_PAUSED}])) slot[name=icon] > *,
      :host([${rb.MEDIA_LOADING}]:not([${rb.MEDIA_PAUSED}])) ::slotted([slot=icon]) {
        opacity: var(--media-loading-indicator-opacity, 1);
        transition: opacity 0.15s var(--_loading-indicator-delay);
      }

      :host #status {
        visibility: var(--media-loading-indicator-opacity, hidden);
        transition: visibility 0.15s;
      }

      :host([${rb.MEDIA_LOADING}]:not([${rb.MEDIA_PAUSED}])) #status {
        visibility: var(--media-loading-indicator-opacity, visible);
        transition: visibility 0.15s var(--_loading-indicator-delay);
      }

      svg, img, ::slotted(svg), ::slotted(img) {
        width: var(--media-loading-indicator-icon-width);
        height: var(--media-loading-indicator-icon-height, 100px);
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        vertical-align: middle;
      }
    </style>

    <slot name="icon">${oX}</slot>
    <div id="status" role="status" aria-live="polite">${rU("media loading")}</div>
  `},rz.customElements.get("media-loading-indicator")||rz.customElements.define("media-loading-indicator",oJ);let o0=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.18l2.45 2.45a4.22 4.22 0 0 0 .05-.63Zm2.5 0a6.84 6.84 0 0 1-.54 2.64L20 16.15A8.8 8.8 0 0 0 21 12a9 9 0 0 0-7-8.77v2.06A7 7 0 0 1 19 12ZM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A6.92 6.92 0 0 1 14 18.7v2.06A9 9 0 0 0 17.69 19l2 2.05L21 19.73l-9-9L4.27 3ZM12 4 9.91 6.09 12 8.18V4Z"/>
</svg>`,o1=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4Z"/>
</svg>`,o2=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4ZM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54Z"/>
</svg>`,o3=e=>{let t="off"===e.mediaVolumeLevel?rU("unmute"):rU("mute");e.setAttribute("aria-label",t)};class o4 extends sJ{static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_VOLUME_LEVEL]}connectedCallback(){super.connectedCallback(),o3(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===rb.MEDIA_VOLUME_LEVEL&&o3(this)}get mediaVolumeLevel(){return nd(this,rb.MEDIA_VOLUME_LEVEL)}set mediaVolumeLevel(e){nu(this,rb.MEDIA_VOLUME_LEVEL,e)}handleClick(){let e="off"===this.mediaVolumeLevel?rh.MEDIA_UNMUTE_REQUEST:rh.MEDIA_MUTE_REQUEST;this.dispatchEvent(new rz.CustomEvent(e,{composed:!0,bubbles:!0}))}}o4.getSlotTemplateHTML=function(e){return`
    <style>
      :host(:not([${rb.MEDIA_VOLUME_LEVEL}])) slot[name=icon] slot:not([name=high]),
      :host([${rb.MEDIA_VOLUME_LEVEL}=high]) slot[name=icon] slot:not([name=high]) {
        display: none !important;
      }

      :host([${rb.MEDIA_VOLUME_LEVEL}=off]) slot[name=icon] slot:not([name=off]) {
        display: none !important;
      }

      :host([${rb.MEDIA_VOLUME_LEVEL}=low]) slot[name=icon] slot:not([name=low]) {
        display: none !important;
      }

      :host([${rb.MEDIA_VOLUME_LEVEL}=medium]) slot[name=icon] slot:not([name=medium]) {
        display: none !important;
      }

      :host(:not([${rb.MEDIA_VOLUME_LEVEL}=off])) slot[name=tooltip-unmute],
      :host([${rb.MEDIA_VOLUME_LEVEL}=off]) slot[name=tooltip-mute] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="off">${o0}</slot>
      <slot name="low">${o1}</slot>
      <slot name="medium">${o1}</slot>
      <slot name="high">${o2}</slot>
    </slot>
  `},o4.getTooltipContentHTML=function(){return`
    <slot name="tooltip-mute">${rU("Mute")}</slot>
    <slot name="tooltip-unmute">${rU("Unmute")}</slot>
  `},rz.customElements.get("media-mute-button")||rz.customElements.define("media-mute-button",o4);let o5=`<svg aria-hidden="true" viewBox="0 0 28 24">
  <path d="M24 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm-1 16H5V5h18v14Zm-3-8h-7v5h7v-5Z"/>
</svg>`,o9=e=>{let t=e.mediaIsPip?rU("exit picture in picture mode"):rU("enter picture in picture mode");e.setAttribute("aria-label",t)};class o8 extends sJ{static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_IS_PIP,rb.MEDIA_PIP_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),o9(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===rb.MEDIA_IS_PIP&&o9(this)}get mediaPipUnavailable(){return nd(this,rb.MEDIA_PIP_UNAVAILABLE)}set mediaPipUnavailable(e){nu(this,rb.MEDIA_PIP_UNAVAILABLE,e)}get mediaIsPip(){return no(this,rb.MEDIA_IS_PIP)}set mediaIsPip(e){nl(this,rb.MEDIA_IS_PIP,e)}handleClick(){let e=this.mediaIsPip?rh.MEDIA_EXIT_PIP_REQUEST:rh.MEDIA_ENTER_PIP_REQUEST;this.dispatchEvent(new rz.CustomEvent(e,{composed:!0,bubbles:!0}))}}o8.getSlotTemplateHTML=function(e){return`
    <style>
      :host([${rb.MEDIA_IS_PIP}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      :host(:not([${rb.MEDIA_IS_PIP}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${rb.MEDIA_IS_PIP}]) slot[name=tooltip-enter],
      :host(:not([${rb.MEDIA_IS_PIP}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${o5}</slot>
      <slot name="exit">${o5}</slot>
    </slot>
  `},o8.getTooltipContentHTML=function(){return`
    <slot name="tooltip-enter">${rU("Enter picture in picture mode")}</slot>
    <slot name="tooltip-exit">${rU("Exit picture in picture mode")}</slot>
  `},rz.customElements.get("media-pip-button")||rz.customElements.define("media-pip-button",o8);var o6=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot read from private field");return i?i.call(e):t.get(e)};let o7="rates",le=[1,1.2,1.5,1.7,2];class lt extends sJ{constructor(){var e;super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,hn,new nN(this,o7,{defaultValue:le})),this.container=this.shadowRoot.querySelector('slot[name="icon"]'),this.container.innerHTML=`${null!=(e=this.mediaPlaybackRate)?e:1}x`}static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_PLAYBACK_RATE,o7]}attributeChangedCallback(e,t,i){if(super.attributeChangedCallback(e,t,i),e===o7&&(o6(this,hn).value=i),e===rb.MEDIA_PLAYBACK_RATE){let e=i?+i:NaN,t=Number.isNaN(e)?1:e;this.container.innerHTML=`${t}x`,this.setAttribute("aria-label",rU("Playback rate {playbackRate}",{playbackRate:t}))}}get rates(){return o6(this,hn)}set rates(e){e?Array.isArray(e)?o6(this,hn).value=e.join(" "):"string"==typeof e&&(o6(this,hn).value=e):o6(this,hn).value=""}get mediaPlaybackRate(){return nn(this,rb.MEDIA_PLAYBACK_RATE,1)}set mediaPlaybackRate(e){ns(this,rb.MEDIA_PLAYBACK_RATE,e)}handleClick(){var e,t;let i=Array.from(o6(this,hn).values(),e=>+e).sort((e,t)=>e-t),a=null!=(t=null!=(e=i.find(e=>e>this.mediaPlaybackRate))?e:i[0])?t:1,r=new rz.CustomEvent(rh.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:a});this.dispatchEvent(r)}}hn=new WeakMap,lt.getSlotTemplateHTML=function(e){return`
    <style>
      :host {
        min-width: 5ch;
        padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
      }
    </style>
    <slot name="icon">${e.mediaplaybackrate||1}x</slot>
  `},lt.getTooltipContentHTML=function(){return rU("Playback rate")},rz.customElements.get("media-playback-rate-button")||rz.customElements.define("media-playback-rate-button",lt);let li=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="m6 21 15-9L6 3v18Z"/>
</svg>`,la=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M6 20h4V4H6v16Zm8-16v16h4V4h-4Z"/>
</svg>`,lr=e=>{let t=e.mediaPaused?rU("play"):rU("pause");e.setAttribute("aria-label",t)};class ln extends sJ{static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_PAUSED,rb.MEDIA_ENDED]}connectedCallback(){super.connectedCallback(),lr(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),(e===rb.MEDIA_PAUSED||e===rb.MEDIA_LANG)&&lr(this)}get mediaPaused(){return no(this,rb.MEDIA_PAUSED)}set mediaPaused(e){nl(this,rb.MEDIA_PAUSED,e)}handleClick(){let e=this.mediaPaused?rh.MEDIA_PLAY_REQUEST:rh.MEDIA_PAUSE_REQUEST;this.dispatchEvent(new rz.CustomEvent(e,{composed:!0,bubbles:!0}))}}ln.getSlotTemplateHTML=function(e){return`
    <style>
      :host([${rb.MEDIA_PAUSED}]) slot[name=pause],
      :host(:not([${rb.MEDIA_PAUSED}])) slot[name=play] {
        display: none !important;
      }

      :host([${rb.MEDIA_PAUSED}]) slot[name=tooltip-pause],
      :host(:not([${rb.MEDIA_PAUSED}])) slot[name=tooltip-play] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="play">${li}</slot>
      <slot name="pause">${la}</slot>
    </slot>
  `},ln.getTooltipContentHTML=function(){return`
    <slot name="tooltip-play">${rU("Play")}</slot>
    <slot name="tooltip-pause">${rU("Pause")}</slot>
  `},rz.customElements.get("media-play-button")||rz.customElements.define("media-play-button",ln);let ls="placeholdersrc";class lo extends rz.HTMLElement{static get observedAttributes(){return[ls,"src"]}constructor(){if(super(),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const e=r3(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}this.image=this.shadowRoot.querySelector("#image")}attributeChangedCallback(e,t,i){if("src"===e&&(null==i?this.image.removeAttribute("src"):this.image.setAttribute("src",i)),e===ls)if(null==i)this.image.style.removeProperty("background-image");else{var a;a=this.image,a.style["background-image"]=`url('${i}')`}}get placeholderSrc(){return nd(this,ls)}set placeholderSrc(e){nu(this,"src",e)}get src(){return nd(this,"src")}set src(e){nu(this,"src",e)}}lo.shadowRootOptions={mode:"open"},lo.getTemplateHTML=function(e){return`
    <style>
      :host {
        pointer-events: none;
        display: var(--media-poster-image-display, inline-block);
        box-sizing: border-box;
      }

      img {
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
        min-height: 100%;
        background-repeat: no-repeat;
        background-position: var(--media-poster-image-background-position, var(--media-object-position, center));
        background-size: var(--media-poster-image-background-size, var(--media-object-fit, contain));
        object-fit: var(--media-object-fit, contain);
        object-position: var(--media-object-position, center);
      }
    </style>

    <img part="poster img" aria-hidden="true" id="image"/>
  `},rz.customElements.get("media-poster-image")||rz.customElements.define("media-poster-image",lo);var ll=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)};hs=new WeakMap,rz.customElements.get("media-preview-chapter-display")||rz.customElements.define("media-preview-chapter-display",class extends o_{constructor(){super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,hs,void 0),((e,t,i,a)=>(ll(e,t,"write to private field"),a?a.call(e,i):t.set(e,i)))(this,hs,this.shadowRoot.querySelector("slot"))}static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_PREVIEW_CHAPTER,rb.MEDIA_LANG]}attributeChangedCallback(e,t,i){if(super.attributeChangedCallback(e,t,i),(e===rb.MEDIA_PREVIEW_CHAPTER||e===rb.MEDIA_LANG)&&i!==t&&null!=i){var a;if((ll(this,hs,"read from private field"),a?a.call(this):hs.get(this)).textContent=i,""!==i){let e=rU("chapter: {chapterName}",{chapterName:i});this.setAttribute("aria-valuetext",e)}else this.removeAttribute("aria-valuetext")}}get mediaPreviewChapter(){return nd(this,rb.MEDIA_PREVIEW_CHAPTER)}set mediaPreviewChapter(e){nu(this,rb.MEDIA_PREVIEW_CHAPTER,e)}});var ld=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},lu=(e,t,i)=>(ld(e,t,"read from private field"),i?i.call(e):t.get(e)),lc=(e,t,i,a)=>(ld(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);class lh extends rz.HTMLElement{constructor(){if(super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,ho,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const e=r3(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[rm.MEDIA_CONTROLLER,rb.MEDIA_PREVIEW_IMAGE,rb.MEDIA_PREVIEW_COORDS]}connectedCallback(){var e,t,i;let a=this.getAttribute(rm.MEDIA_CONTROLLER);a&&(lc(this,ho,null==(e=this.getRootNode())?void 0:e.getElementById(a)),null==(i=null==(t=lu(this,ho))?void 0:t.associateElement)||i.call(t,this))}disconnectedCallback(){var e,t;null==(t=null==(e=lu(this,ho))?void 0:e.unassociateElement)||t.call(e,this),lc(this,ho,null)}attributeChangedCallback(e,t,i){var a,r,n,s,o;[rb.MEDIA_PREVIEW_IMAGE,rb.MEDIA_PREVIEW_COORDS].includes(e)&&this.update(),e===rm.MEDIA_CONTROLLER&&(t&&(null==(r=null==(a=lu(this,ho))?void 0:a.unassociateElement)||r.call(a,this),lc(this,ho,null)),i&&this.isConnected&&(lc(this,ho,null==(n=this.getRootNode())?void 0:n.getElementById(i)),null==(o=null==(s=lu(this,ho))?void 0:s.associateElement)||o.call(s,this)))}get mediaPreviewImage(){return nd(this,rb.MEDIA_PREVIEW_IMAGE)}set mediaPreviewImage(e){nu(this,rb.MEDIA_PREVIEW_IMAGE,e)}get mediaPreviewCoords(){let e=this.getAttribute(rb.MEDIA_PREVIEW_COORDS);if(e)return e.split(/\s+/).map(e=>+e)}set mediaPreviewCoords(e){e?this.setAttribute(rb.MEDIA_PREVIEW_COORDS,e.join(" ")):this.removeAttribute(rb.MEDIA_PREVIEW_COORDS)}update(){let e,t,i=this.mediaPreviewCoords,a=this.mediaPreviewImage;if(!(i&&a))return;let[r,n,s,o]=i,l=a.split("#")[0],d=getComputedStyle(this),{maxWidth:u,maxHeight:c,minWidth:h,minHeight:m}=d;if("fill"===(d.getPropertyValue("--media-preview-thumbnail-object-fit").trim()||"contain")){let i=parseInt(u)/s,a=parseInt(c)/o,r=parseInt(h)/s,n=parseInt(m)/o;e=i<1?i:Math.max(i,r),t=a<1?a:Math.max(a,n)}else{let i=Math.min(parseInt(u)/s,parseInt(c)/o),a=Math.max(parseInt(h)/s,parseInt(m)/o),r=i<1?i:a>1?a:1;e=r,t=r}let{style:p}=na(this.shadowRoot,":host"),v=na(this.shadowRoot,"img").style,b=this.shadowRoot.querySelector("img"),g=1>Math.min(e,t)?"min":"max";p.setProperty(`${g}-width`,"initial","important"),p.setProperty(`${g}-height`,"initial","important"),p.width=`${s*e}px`,p.height=`${o*t}px`;let f=()=>{v.width=`${this.imgWidth*e}px`,v.height=`${this.imgHeight*t}px`,v.display="block"};b.src!==l&&(b.onload=()=>{this.imgWidth=b.naturalWidth,this.imgHeight=b.naturalHeight,f(),b.onload=null},b.src=l,f()),f(),v.transform=`translate(-${r*e}px, -${n*t}px)`}}ho=new WeakMap,lh.shadowRootOptions={mode:"open"},lh.getTemplateHTML=function(e){return`
    <style>
      :host {
        box-sizing: border-box;
        display: var(--media-control-display, var(--media-preview-thumbnail-display, inline-block));
        overflow: hidden;
      }

      img {
        display: none;
        position: relative;
      }
    </style>
    <img crossorigin loading="eager" decoding="async">
  `},rz.customElements.get("media-preview-thumbnail")||rz.customElements.define("media-preview-thumbnail",lh);var lm=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},lp=(e,t,i)=>(lm(e,t,"read from private field"),i?i.call(e):t.get(e));hl=new WeakMap,rz.customElements.get("media-preview-time-display")||rz.customElements.define("media-preview-time-display",class extends o_{constructor(){super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,hl,void 0),((e,t,i,a)=>(lm(e,t,"write to private field"),a?a.call(e,i):t.set(e,i)))(this,hl,this.shadowRoot.querySelector("slot")),lp(this,hl).textContent=rW(0)}static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_PREVIEW_TIME]}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===rb.MEDIA_PREVIEW_TIME&&null!=i&&(lp(this,hl).textContent=rW(parseFloat(i)))}get mediaPreviewTime(){return nn(this,rb.MEDIA_PREVIEW_TIME)}set mediaPreviewTime(e){ns(this,rb.MEDIA_PREVIEW_TIME,e)}});let lv="seekoffset";class lb extends sJ{static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_CURRENT_TIME,lv]}connectedCallback(){super.connectedCallback(),this.seekOffset=nn(this,lv,30)}attributeChangedCallback(e,t,i){var a;super.attributeChangedCallback(e,t,i),a=this.seekOffset,this.setAttribute("aria-label",rU("seek back {seekOffset} seconds",{seekOffset:a})),e===lv&&(this.seekOffset=nn(this,lv,30))}get seekOffset(){return nn(this,lv,30)}set seekOffset(e){ns(this,lv,e),this.setAttribute("aria-label",rU("seek back {seekOffset} seconds",{seekOffset:this.seekOffset})),r9(r8(this,"icon"),this.seekOffset)}get mediaCurrentTime(){return nn(this,rb.MEDIA_CURRENT_TIME,0)}set mediaCurrentTime(e){ns(this,rb.MEDIA_CURRENT_TIME,e)}handleClick(){let e=Math.max(this.mediaCurrentTime-this.seekOffset,0),t=new rz.CustomEvent(rh.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(t)}}lb.getSlotTemplateHTML=function(e,t){let i;return`
    <slot name="icon">${i=t.seekOffset,`
  <svg aria-hidden="true" viewBox="0 0 20 24">
    <defs>
      <style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style>
    </defs>
    <text class="text value" transform="translate(2.18 19.87)">${i}</text>
    <path d="M10 6V3L4.37 7 10 10.94V8a5.54 5.54 0 0 1 1.9 10.48v2.12A7.5 7.5 0 0 0 10 6Z"/>
  </svg>`}</slot>
  `},lb.getTooltipContentHTML=function(){return rU("Seek backward")},rz.customElements.get("media-seek-backward-button")||rz.customElements.define("media-seek-backward-button",lb);let lg="seekoffset";class lf extends sJ{static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_CURRENT_TIME,lg]}connectedCallback(){super.connectedCallback(),this.seekOffset=nn(this,lg,30)}attributeChangedCallback(e,t,i){var a;super.attributeChangedCallback(e,t,i),a=this.seekOffset,this.setAttribute("aria-label",rU("seek forward {seekOffset} seconds",{seekOffset:a})),e===lg&&(this.seekOffset=nn(this,lg,30))}get seekOffset(){return nn(this,lg,30)}set seekOffset(e){ns(this,lg,e),this.setAttribute("aria-label",rU("seek forward {seekOffset} seconds",{seekOffset:this.seekOffset})),r9(r8(this,"icon"),this.seekOffset)}get mediaCurrentTime(){return nn(this,rb.MEDIA_CURRENT_TIME,0)}set mediaCurrentTime(e){ns(this,rb.MEDIA_CURRENT_TIME,e)}handleClick(){let e=this.mediaCurrentTime+this.seekOffset,t=new rz.CustomEvent(rh.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(t)}}lf.getSlotTemplateHTML=function(e,t){let i;return`
    <slot name="icon">${i=t.seekOffset,`
  <svg aria-hidden="true" viewBox="0 0 20 24">
    <defs>
      <style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style>
    </defs>
    <text class="text value" transform="translate(8.9 19.87)">${i}</text>
    <path d="M10 6V3l5.61 4L10 10.94V8a5.54 5.54 0 0 0-1.9 10.48v2.12A7.5 7.5 0 0 1 10 6Z"/>
  </svg>`}</slot>
  `},lf.getTooltipContentHTML=function(){return rU("Seek forward")},rz.customElements.get("media-seek-forward-button")||rz.customElements.define("media-seek-forward-button",lf);var lE=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},ly=(e,t,i)=>(lE(e,t,"read from private field"),i?i.call(e):t.get(e)),l_=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},lT=(e,t,i,a)=>(lE(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),lA=(e,t,i)=>(lE(e,t,"access private method"),i);let lk={REMAINING:"remaining",SHOW_DURATION:"showduration",NO_TOGGLE:"notoggle"},lw=[...Object.values(lk),rb.MEDIA_CURRENT_TIME,rb.MEDIA_DURATION,rb.MEDIA_SEEKABLE],lS=["Enter"," "],lI="&nbsp;/&nbsp;",lR=(e,{timesSep:t=lI}={})=>{var i,a;let r=null!=(i=e.mediaCurrentTime)?i:0,[,n]=null!=(a=e.mediaSeekable)?a:[],s=0;Number.isFinite(e.mediaDuration)?s=e.mediaDuration:Number.isFinite(n)&&(s=n);let o=e.remaining?rW(0-(s-r)):rW(r);return e.showDuration?`${o}${t}${rW(s)}`:o};class lC extends o_{constructor(){super(),l_(this,hh),l_(this,hp),l_(this,hb),l_(this,hf),l_(this,hd,void 0),l_(this,hu,null),l_(this,hc,e=>{let{metaKey:t,altKey:i,key:a}=e;t||i||!lS.includes(a)?this.removeEventListener("keyup",ly(this,hu)):this.addEventListener("keyup",ly(this,hu))}),lT(this,hd,this.shadowRoot.querySelector("slot")),ly(this,hd).innerHTML=`${lR(this)}`}static get observedAttributes(){return[...super.observedAttributes,...lw,"disabled"]}connectedCallback(){let{style:e}=na(this.shadowRoot,":host(:hover:not([notoggle]))");e.setProperty("cursor","var(--media-cursor, pointer)"),e.setProperty("background","var(--media-control-hover-background, rgba(50 50 70 / .7))"),this.setAttribute("aria-label",rU("playback time")),lA(this,hb,hg).call(this),super.connectedCallback()}toggleTimeDisplay(){this.noToggle||(this.hasAttribute("remaining")?this.removeAttribute("remaining"):this.setAttribute("remaining",""))}disconnectedCallback(){this.disable(),lA(this,hp,hv).call(this),super.disconnectedCallback()}attributeChangedCallback(e,t,i){this.setAttribute("aria-label",rU("playback time")),lw.includes(e)?this.update():"disabled"===e&&i!==t?null==i?lA(this,hb,hg).call(this):lA(this,hf,hE).call(this):e===lk.NO_TOGGLE&&i!==t&&(this.noToggle?lA(this,hf,hE).call(this):lA(this,hb,hg).call(this)),super.attributeChangedCallback(e,t,i)}enable(){this.noToggle||(this.tabIndex=0)}disable(){this.tabIndex=-1}get remaining(){return no(this,lk.REMAINING)}set remaining(e){nl(this,lk.REMAINING,e)}get showDuration(){return no(this,lk.SHOW_DURATION)}set showDuration(e){nl(this,lk.SHOW_DURATION,e)}get noToggle(){return no(this,lk.NO_TOGGLE)}set noToggle(e){nl(this,lk.NO_TOGGLE,e)}get mediaDuration(){return nn(this,rb.MEDIA_DURATION)}set mediaDuration(e){ns(this,rb.MEDIA_DURATION,e)}get mediaCurrentTime(){return nn(this,rb.MEDIA_CURRENT_TIME)}set mediaCurrentTime(e){ns(this,rb.MEDIA_CURRENT_TIME,e)}get mediaSeekable(){let e=this.getAttribute(rb.MEDIA_SEEKABLE);if(e)return e.split(":").map(e=>+e)}set mediaSeekable(e){null==e?this.removeAttribute(rb.MEDIA_SEEKABLE):this.setAttribute(rb.MEDIA_SEEKABLE,e.join(":"))}update(){let e=lR(this);(e=>{var t;let i=e.mediaCurrentTime,[,a]=null!=(t=e.mediaSeekable)?t:[],r=null;if(Number.isFinite(e.mediaDuration)?r=e.mediaDuration:Number.isFinite(a)&&(r=a),null==i||null===r)return e.setAttribute("aria-description",rU("video not loaded, unknown time."));let n=e.remaining?rH(0-(r-i)):rH(i);if(!e.showDuration)return e.setAttribute("aria-description",n);let s=rU("{currentTime} of {totalTime}",{currentTime:n,totalTime:rH(r)});e.setAttribute("aria-description",s)})(this),e!==ly(this,hd).innerHTML&&(ly(this,hd).innerHTML=e)}}hd=new WeakMap,hu=new WeakMap,hc=new WeakMap,hh=new WeakSet,hm=function(){ly(this,hu)||(lT(this,hu,e=>{let{key:t}=e;lS.includes(t)?this.toggleTimeDisplay():this.removeEventListener("keyup",ly(this,hu))}),this.addEventListener("keydown",ly(this,hc)),this.addEventListener("click",this.toggleTimeDisplay))},hp=new WeakSet,hv=function(){ly(this,hu)&&(this.removeEventListener("keyup",ly(this,hu)),this.removeEventListener("keydown",ly(this,hc)),this.removeEventListener("click",this.toggleTimeDisplay),lT(this,hu,null))},hb=new WeakSet,hg=function(){this.noToggle||this.hasAttribute("disabled")||(this.setAttribute("role","button"),this.enable(),lA(this,hh,hm).call(this))},hf=new WeakSet,hE=function(){this.removeAttribute("role"),this.disable(),lA(this,hp,hv).call(this)},lC.getSlotTemplateHTML=function(e,t){return`
    <slot>${lR(t)}</slot>
  `},rz.customElements.get("media-time-display")||rz.customElements.define("media-time-display",lC);var lL=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},lM=(e,t,i)=>(lL(e,t,"read from private field"),i?i.call(e):t.get(e)),lD=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},lx=(e,t,i,a)=>(lL(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);class lP{constructor(e,t,i){lD(this,hy,void 0),lD(this,h_,void 0),lD(this,hT,void 0),lD(this,hA,void 0),lD(this,hk,void 0),lD(this,hw,void 0),lD(this,hS,void 0),lD(this,hI,void 0),lD(this,hR,0),lD(this,hC,(e=performance.now())=>{lx(this,hR,requestAnimationFrame(lM(this,hC))),lx(this,hA,performance.now()-lM(this,hT));let t=1e3/this.fps;if(lM(this,hA)>t){let i,a,r,n;lx(this,hT,e-lM(this,hA)%t);let s=1e3/((e-lM(this,h_))/++(i=this,a=hk,{set _(value){lx(i,a,value,r)},get _(){return lM(i,a,n)}})._),o=(e-lM(this,hw))/1e3/this.duration,l=lM(this,hS)+o*this.playbackRate;l-lM(this,hy).valueAsNumber>0?lx(this,hI,this.playbackRate/this.duration/s):(lx(this,hI,.995*lM(this,hI)),l=lM(this,hy).valueAsNumber+lM(this,hI)),this.callback(l)}}),lx(this,hy,e),this.callback=t,this.fps=i}start(){0===lM(this,hR)&&(lx(this,hT,performance.now()),lx(this,h_,lM(this,hT)),lx(this,hk,0),lM(this,hC).call(this))}stop(){0!==lM(this,hR)&&(cancelAnimationFrame(lM(this,hR)),lx(this,hR,0))}update({start:e,duration:t,playbackRate:i}){let a=e-lM(this,hy).valueAsNumber,r=Math.abs(t-this.duration);(a>0||a<-.03||r>=.5)&&this.callback(e),lx(this,hS,e),lx(this,hw,performance.now()),this.duration=t,this.playbackRate=i}}hy=new WeakMap,h_=new WeakMap,hT=new WeakMap,hA=new WeakMap,hk=new WeakMap,hw=new WeakMap,hS=new WeakMap,hI=new WeakMap,hR=new WeakMap,hC=new WeakMap;var lN=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},lO=(e,t,i)=>(lN(e,t,"read from private field"),i?i.call(e):t.get(e)),lU=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},lB=(e,t,i,a)=>(lN(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),lH=(e,t,i)=>(lN(e,t,"access private method"),i);let lW=(e,t=e.mediaCurrentTime)=>{let i=Number.isFinite(e.mediaSeekableStart)?e.mediaSeekableStart:0,a=Number.isFinite(e.mediaDuration)?e.mediaDuration:e.mediaSeekableEnd;return Number.isNaN(a)?0:Math.max(0,Math.min((t-i)/(a-i),1))},l$=(e,t=e.range.valueAsNumber)=>{let i=Number.isFinite(e.mediaSeekableStart)?e.mediaSeekableStart:0,a=Number.isFinite(e.mediaDuration)?e.mediaDuration:e.mediaSeekableEnd;return Number.isNaN(a)?0:t*(a-i)+i};class lq extends om{constructor(){super(),lU(this,h$),lU(this,hF),lU(this,hG),lU(this,hY),lU(this,hz),lU(this,hX),lU(this,h0),lU(this,hL,null),lU(this,hM,void 0),lU(this,hD,void 0),lU(this,hx,void 0),lU(this,hP,void 0),lU(this,hN,void 0),lU(this,hO,void 0),lU(this,hU,void 0),lU(this,hB,void 0),lU(this,hH,void 0),lU(this,hW,()=>{lH(this,h$,hq).call(this)?lO(this,hM).start():lO(this,hM).stop()}),lU(this,hV,e=>{!this.dragging&&(rD(e)&&(this.range.valueAsNumber=e),lO(this,hH)||this.updateBar())}),this.shadowRoot.querySelector("#track").insertAdjacentHTML("afterbegin",'<div id="buffered" part="buffered"></div>'),lB(this,hD,this.shadowRoot.querySelectorAll('[part~="box"]')),lB(this,hP,this.shadowRoot.querySelector('[part~="preview-box"]')),lB(this,hN,this.shadowRoot.querySelector('[part~="current-box"]'));const e=getComputedStyle(this);lB(this,hO,parseInt(e.getPropertyValue("--media-box-padding-left"))),lB(this,hU,parseInt(e.getPropertyValue("--media-box-padding-right"))),lB(this,hM,new lP(this.range,lO(this,hV),60))}static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_PAUSED,rb.MEDIA_DURATION,rb.MEDIA_SEEKABLE,rb.MEDIA_CURRENT_TIME,rb.MEDIA_PREVIEW_IMAGE,rb.MEDIA_PREVIEW_TIME,rb.MEDIA_PREVIEW_CHAPTER,rb.MEDIA_BUFFERED,rb.MEDIA_PLAYBACK_RATE,rb.MEDIA_LOADING,rb.MEDIA_ENDED]}connectedCallback(){var e;super.connectedCallback(),this.range.setAttribute("aria-label",rU("seek")),lO(this,hW).call(this),lB(this,hL,this.getRootNode()),null==(e=lO(this,hL))||e.addEventListener("transitionstart",this)}disconnectedCallback(){var e;super.disconnectedCallback(),lO(this,hM).stop(),null==(e=lO(this,hL))||e.removeEventListener("transitionstart",this),lB(this,hL,null)}attributeChangedCallback(e,t,i){if(super.attributeChangedCallback(e,t,i),t!=i){if(e===rb.MEDIA_CURRENT_TIME||e===rb.MEDIA_PAUSED||e===rb.MEDIA_ENDED||e===rb.MEDIA_LOADING||e===rb.MEDIA_DURATION||e===rb.MEDIA_SEEKABLE){let e,t,i,a;lO(this,hM).update({start:lW(this),duration:this.mediaSeekableEnd-this.mediaSeekableStart,playbackRate:this.mediaPlaybackRate}),lO(this,hW).call(this),e=this.range,t=rH(+l$(this)),i=rH(+this.mediaSeekableEnd),a=t&&i?rU("{currentTime} of {totalTime}",{currentTime:t,totalTime:i}):rU("video not loaded, unknown time."),e.setAttribute("aria-valuetext",a)}else e===rb.MEDIA_BUFFERED&&this.updateBufferedBar();(e===rb.MEDIA_DURATION||e===rb.MEDIA_SEEKABLE)&&(this.mediaChaptersCues=lO(this,hB),this.updateBar())}}get mediaChaptersCues(){return lO(this,hB)}set mediaChaptersCues(e){var t;lB(this,hB,e),this.updateSegments(null==(t=lO(this,hB))?void 0:t.map(e=>({start:lW(this,e.startTime),end:lW(this,e.endTime)})))}get mediaPaused(){return no(this,rb.MEDIA_PAUSED)}set mediaPaused(e){nl(this,rb.MEDIA_PAUSED,e)}get mediaLoading(){return no(this,rb.MEDIA_LOADING)}set mediaLoading(e){nl(this,rb.MEDIA_LOADING,e)}get mediaDuration(){return nn(this,rb.MEDIA_DURATION)}set mediaDuration(e){ns(this,rb.MEDIA_DURATION,e)}get mediaCurrentTime(){return nn(this,rb.MEDIA_CURRENT_TIME)}set mediaCurrentTime(e){ns(this,rb.MEDIA_CURRENT_TIME,e)}get mediaPlaybackRate(){return nn(this,rb.MEDIA_PLAYBACK_RATE,1)}set mediaPlaybackRate(e){ns(this,rb.MEDIA_PLAYBACK_RATE,e)}get mediaBuffered(){let e=this.getAttribute(rb.MEDIA_BUFFERED);return e?e.split(" ").map(e=>e.split(":").map(e=>+e)):[]}set mediaBuffered(e){if(!e)return void this.removeAttribute(rb.MEDIA_BUFFERED);let t=e.map(e=>e.join(":")).join(" ");this.setAttribute(rb.MEDIA_BUFFERED,t)}get mediaSeekable(){let e=this.getAttribute(rb.MEDIA_SEEKABLE);if(e)return e.split(":").map(e=>+e)}set mediaSeekable(e){null==e?this.removeAttribute(rb.MEDIA_SEEKABLE):this.setAttribute(rb.MEDIA_SEEKABLE,e.join(":"))}get mediaSeekableEnd(){var e;let[,t=this.mediaDuration]=null!=(e=this.mediaSeekable)?e:[];return t}get mediaSeekableStart(){var e;let[t=0]=null!=(e=this.mediaSeekable)?e:[];return t}get mediaPreviewImage(){return nd(this,rb.MEDIA_PREVIEW_IMAGE)}set mediaPreviewImage(e){nu(this,rb.MEDIA_PREVIEW_IMAGE,e)}get mediaPreviewTime(){return nn(this,rb.MEDIA_PREVIEW_TIME)}set mediaPreviewTime(e){ns(this,rb.MEDIA_PREVIEW_TIME,e)}get mediaEnded(){return no(this,rb.MEDIA_ENDED)}set mediaEnded(e){nl(this,rb.MEDIA_ENDED,e)}updateBar(){super.updateBar(),this.updateBufferedBar(),this.updateCurrentBox()}updateBufferedBar(){var e;let t,i=this.mediaBuffered;if(!i.length)return;if(this.mediaEnded)t=1;else{let a=this.mediaCurrentTime,[,r=this.mediaSeekableStart]=null!=(e=i.find(([e,t])=>e<=a&&a<=t))?e:[];t=lW(this,r)}let{style:a}=na(this.shadowRoot,"#buffered");a.setProperty("width",`${100*t}%`)}updateCurrentBox(){if(!this.shadowRoot.querySelector('slot[name="current"]').assignedElements().length)return;let e=na(this.shadowRoot,"#current-rail"),t=na(this.shadowRoot,'[part~="current-box"]'),i=lH(this,hF,hK).call(this,lO(this,hN)),a=lH(this,hG,hj).call(this,i,this.range.valueAsNumber),r=lH(this,hY,hQ).call(this,i,this.range.valueAsNumber);e.style.transform=`translateX(${a})`,e.style.setProperty("--_range-width",`${i.range.width}`),t.style.setProperty("--_box-shift",`${r}`),t.style.setProperty("--_box-width",`${i.box.width}px`),t.style.setProperty("visibility","initial")}handleEvent(e){switch(super.handleEvent(e),e.type){case"input":lH(this,h0,h1).call(this);break;case"pointermove":lH(this,hz,hZ).call(this,e);break;case"pointerup":lO(this,hH)&&lB(this,hH,!1);break;case"pointerdown":lB(this,hH,!0);break;case"pointerleave":lH(this,hX,hJ).call(this,null);break;case"transitionstart":r6(e.target,this)&&setTimeout(()=>lO(this,hW).call(this),0)}}}hL=new WeakMap,hM=new WeakMap,hD=new WeakMap,hx=new WeakMap,hP=new WeakMap,hN=new WeakMap,hO=new WeakMap,hU=new WeakMap,hB=new WeakMap,hH=new WeakMap,hW=new WeakMap,h$=new WeakSet,hq=function(){return this.isConnected&&!this.mediaPaused&&!this.mediaLoading&&!this.mediaEnded&&this.mediaSeekableEnd>0&&ni(this)},hV=new WeakMap,hF=new WeakSet,hK=function(e){var t;let i=(null!=(t=this.getAttribute("bounds")?r7(this,`#${this.getAttribute("bounds")}`):this.parentElement)?t:this).getBoundingClientRect(),a=this.range.getBoundingClientRect(),r=e.offsetWidth,n=-(a.left-i.left-r/2),s=i.right-a.left-r/2;return{box:{width:r,min:n,max:s},bounds:i,range:a}},hG=new WeakSet,hj=function(e,t){let i=`${100*t}%`,{width:a,min:r,max:n}=e.box;if(!a)return i;if(!Number.isNaN(r)){let e=`calc(1 / var(--_range-width) * 100 * ${r}% + var(--media-box-padding-left))`;i=`max(${e}, ${i})`}if(!Number.isNaN(n)){let e=`calc(1 / var(--_range-width) * 100 * ${n}% - var(--media-box-padding-right))`;i=`min(${i}, ${e})`}return i},hY=new WeakSet,hQ=function(e,t){let{width:i,min:a,max:r}=e.box,n=t*e.range.width;if(n<a+lO(this,hO)){let t=e.range.left-e.bounds.left-lO(this,hO);return`${n-i/2+t}px`}if(n>r-lO(this,hU)){let t=e.bounds.right-e.range.right-lO(this,hU);return`${n+i/2-t-e.range.width}px`}return 0},hz=new WeakSet,hZ=function(e){let t=[...lO(this,hD)].some(t=>e.composedPath().includes(t));if(!this.dragging&&(t||!e.composedPath().includes(this)))return void lH(this,hX,hJ).call(this,null);let i=this.mediaSeekableEnd;if(!i)return;let a=na(this.shadowRoot,"#preview-rail"),r=na(this.shadowRoot,'[part~="preview-box"]'),n=lH(this,hF,hK).call(this,lO(this,hP)),s=(e.clientX-n.range.left)/n.range.width;s=Math.max(0,Math.min(1,s));let o=lH(this,hG,hj).call(this,n,s),l=lH(this,hY,hQ).call(this,n,s);a.style.transform=`translateX(${o})`,a.style.setProperty("--_range-width",`${n.range.width}`),r.style.setProperty("--_box-shift",`${l}`),r.style.setProperty("--_box-width",`${n.box.width}px`),1>Math.abs(Math.round(lO(this,hx))-Math.round(s*i))&&s>.01&&s<.99||(lB(this,hx,s*i),lH(this,hX,hJ).call(this,lO(this,hx)))},hX=new WeakSet,hJ=function(e){this.dispatchEvent(new rz.CustomEvent(rh.MEDIA_PREVIEW_REQUEST,{composed:!0,bubbles:!0,detail:e}))},h0=new WeakSet,h1=function(){lO(this,hM).stop();let e=l$(this);this.dispatchEvent(new rz.CustomEvent(rh.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:e}))},lq.shadowRootOptions={mode:"open"},lq.getContainerTemplateHTML=function(e){return`
    <style>
      :host {
        --media-box-border-radius: 4px;
        --media-box-padding-left: 10px;
        --media-box-padding-right: 10px;
        --media-preview-border-radius: var(--media-box-border-radius);
        --media-box-arrow-offset: var(--media-box-border-radius);
        --_control-background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        --_preview-background: var(--media-preview-background, var(--_control-background));

        
        contain: layout;
      }

      #buffered {
        background: var(--media-time-range-buffered-color, rgb(255 255 255 / .4));
        position: absolute;
        height: 100%;
        will-change: width;
      }

      #preview-rail,
      #current-rail {
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 100%;
        pointer-events: none;
        will-change: transform;
      }

      [part~="box"] {
        width: min-content;
        
        position: absolute;
        bottom: 100%;
        flex-direction: column;
        align-items: center;
        transform: translateX(-50%);
      }

      [part~="current-box"] {
        display: var(--media-current-box-display, var(--media-box-display, flex));
        margin: var(--media-current-box-margin, var(--media-box-margin, 0 0 5px));
        visibility: hidden;
      }

      [part~="preview-box"] {
        display: var(--media-preview-box-display, var(--media-box-display, flex));
        margin: var(--media-preview-box-margin, var(--media-box-margin, 0 0 5px));
        transition-property: var(--media-preview-transition-property, visibility, opacity);
        transition-duration: var(--media-preview-transition-duration-out, .25s);
        transition-delay: var(--media-preview-transition-delay-out, 0s);
        visibility: hidden;
        opacity: 0;
      }

      :host(:is([${rb.MEDIA_PREVIEW_IMAGE}], [${rb.MEDIA_PREVIEW_TIME}])[dragging]) [part~="preview-box"] {
        transition-duration: var(--media-preview-transition-duration-in, .5s);
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
        opacity: 1;
      }

      @media (hover: hover) {
        :host(:is([${rb.MEDIA_PREVIEW_IMAGE}], [${rb.MEDIA_PREVIEW_TIME}]):hover) [part~="preview-box"] {
          transition-duration: var(--media-preview-transition-duration-in, .5s);
          transition-delay: var(--media-preview-transition-delay-in, .25s);
          visibility: visible;
          opacity: 1;
        }
      }

      media-preview-thumbnail,
      ::slotted(media-preview-thumbnail) {
        visibility: hidden;
        
        transition: visibility 0s .25s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-thumbnail-background, var(--_preview-background));
        box-shadow: var(--media-preview-thumbnail-box-shadow, 0 0 4px rgb(0 0 0 / .2));
        max-width: var(--media-preview-thumbnail-max-width, 180px);
        max-height: var(--media-preview-thumbnail-max-height, 160px);
        min-width: var(--media-preview-thumbnail-min-width, 120px);
        min-height: var(--media-preview-thumbnail-min-height, 80px);
        border: var(--media-preview-thumbnail-border);
        border-radius: var(--media-preview-thumbnail-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius) 0 0);
      }

      :host([${rb.MEDIA_PREVIEW_IMAGE}][dragging]) media-preview-thumbnail,
      :host([${rb.MEDIA_PREVIEW_IMAGE}][dragging]) ::slotted(media-preview-thumbnail) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
      }

      @media (hover: hover) {
        :host([${rb.MEDIA_PREVIEW_IMAGE}]:hover) media-preview-thumbnail,
        :host([${rb.MEDIA_PREVIEW_IMAGE}]:hover) ::slotted(media-preview-thumbnail) {
          transition-delay: var(--media-preview-transition-delay-in, .25s);
          visibility: visible;
        }

        :host([${rb.MEDIA_PREVIEW_TIME}]:hover) {
          --media-time-range-hover-display: block;
        }
      }

      media-preview-chapter-display,
      ::slotted(media-preview-chapter-display) {
        font-size: var(--media-font-size, 13px);
        line-height: 17px;
        min-width: 0;
        visibility: hidden;
        
        transition: min-width 0s, border-radius 0s, margin 0s, padding 0s, visibility 0s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-chapter-background, var(--_preview-background));
        border-radius: var(--media-preview-chapter-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius)
          var(--media-preview-border-radius) var(--media-preview-border-radius));
        padding: var(--media-preview-chapter-padding, 3.5px 9px);
        margin: var(--media-preview-chapter-margin, 0 0 5px);
        text-shadow: var(--media-preview-chapter-text-shadow, 0 0 4px rgb(0 0 0 / .75));
      }

      :host([${rb.MEDIA_PREVIEW_IMAGE}]) media-preview-chapter-display,
      :host([${rb.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-chapter-display) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        border-radius: var(--media-preview-chapter-border-radius, 0);
        padding: var(--media-preview-chapter-padding, 3.5px 9px 0);
        margin: var(--media-preview-chapter-margin, 0);
        min-width: 100%;
      }

      media-preview-chapter-display[${rb.MEDIA_PREVIEW_CHAPTER}],
      ::slotted(media-preview-chapter-display[${rb.MEDIA_PREVIEW_CHAPTER}]) {
        visibility: visible;
      }

      media-preview-chapter-display:not([aria-valuetext]),
      ::slotted(media-preview-chapter-display:not([aria-valuetext])) {
        display: none;
      }

      media-preview-time-display,
      ::slotted(media-preview-time-display),
      media-time-display,
      ::slotted(media-time-display) {
        font-size: var(--media-font-size, 13px);
        line-height: 17px;
        min-width: 0;
        
        transition: min-width 0s, border-radius 0s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-time-background, var(--_preview-background));
        border-radius: var(--media-preview-time-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius)
          var(--media-preview-border-radius) var(--media-preview-border-radius));
        padding: var(--media-preview-time-padding, 3.5px 9px);
        margin: var(--media-preview-time-margin, 0);
        text-shadow: var(--media-preview-time-text-shadow, 0 0 4px rgb(0 0 0 / .75));
        transform: translateX(min(
          max(calc(50% - var(--_box-width) / 2),
          calc(var(--_box-shift, 0))),
          calc(var(--_box-width) / 2 - 50%)
        ));
      }

      :host([${rb.MEDIA_PREVIEW_IMAGE}]) media-preview-time-display,
      :host([${rb.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-time-display) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        border-radius: var(--media-preview-time-border-radius,
          0 0 var(--media-preview-border-radius) var(--media-preview-border-radius));
        min-width: 100%;
      }

      :host([${rb.MEDIA_PREVIEW_TIME}]:hover) {
        --media-time-range-hover-display: block;
      }

      [part~="arrow"],
      ::slotted([part~="arrow"]) {
        display: var(--media-box-arrow-display, inline-block);
        transform: translateX(min(
          max(calc(50% - var(--_box-width) / 2 + var(--media-box-arrow-offset)),
          calc(var(--_box-shift, 0))),
          calc(var(--_box-width) / 2 - 50% - var(--media-box-arrow-offset))
        ));
        
        border-color: transparent;
        border-top-color: var(--media-box-arrow-background, var(--_control-background));
        border-width: var(--media-box-arrow-border-width,
          var(--media-box-arrow-height, 5px) var(--media-box-arrow-width, 6px) 0);
        border-style: solid;
        justify-content: center;
        height: 0;
      }
    </style>
    <div id="preview-rail">
      <slot name="preview" part="box preview-box">
        <media-preview-thumbnail>
          <template shadowrootmode="${lh.shadowRootOptions.mode}">
            ${lh.getTemplateHTML({})}
          </template>
        </media-preview-thumbnail>
        <media-preview-chapter-display></media-preview-chapter-display>
        <media-preview-time-display></media-preview-time-display>
        <slot name="preview-arrow"><div part="arrow"></div></slot>
      </slot>
    </div>
    <div id="current-rail">
      <slot name="current" part="box current-box">
        
      </slot>
    </div>
  `},rz.customElements.get("media-time-range")||rz.customElements.define("media-time-range",lq);var lV=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot read from private field");return i?i.call(e):t.get(e)};h2=new WeakMap,rz.customElements.get("media-volume-range")||rz.customElements.define("media-volume-range",class extends om{constructor(){super(...arguments),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,h2,()=>{let e=this.range.value,t=new rz.CustomEvent(rh.MEDIA_VOLUME_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(t)})}static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_VOLUME,rb.MEDIA_MUTED,rb.MEDIA_VOLUME_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),this.range.setAttribute("aria-label",rU("volume")),this.range.addEventListener("input",lV(this,h2))}disconnectedCallback(){this.range.removeEventListener("input",lV(this,h2)),super.disconnectedCallback()}attributeChangedCallback(e,t,i){if(super.attributeChangedCallback(e,t,i),e===rb.MEDIA_VOLUME||e===rb.MEDIA_MUTED){let e;this.range.valueAsNumber=this.mediaMuted?0:this.mediaVolume,this.range.setAttribute("aria-valuetext",(e=this.range.valueAsNumber,`${Math.round(100*e)}%`)),this.updateBar()}}get mediaVolume(){return nn(this,rb.MEDIA_VOLUME,1)}set mediaVolume(e){ns(this,rb.MEDIA_VOLUME,e)}get mediaMuted(){return no(this,rb.MEDIA_MUTED)}set mediaMuted(e){nl(this,rb.MEDIA_MUTED,e)}get mediaVolumeUnavailable(){return nd(this,rb.MEDIA_VOLUME_UNAVAILABLE)}set mediaVolumeUnavailable(e){nu(this,rb.MEDIA_VOLUME_UNAVAILABLE,e)}});class lF extends sJ{constructor(){super(...arguments),this.container=null}static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_LOOP]}connectedCallback(){var e;super.connectedCallback(),this.container=(null==(e=this.shadowRoot)?void 0:e.querySelector("#icon"))||null,this.container&&(this.container.textContent=rU("Loop"))}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===rb.MEDIA_LOOP&&this.container&&this.setAttribute("aria-checked",this.mediaLoop?"true":"false")}get mediaLoop(){return no(this,rb.MEDIA_LOOP)}set mediaLoop(e){nl(this,rb.MEDIA_LOOP,e)}handleClick(){let e=!this.mediaLoop,t=new rz.CustomEvent(rh.MEDIA_LOOP_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(t)}}lF.getSlotTemplateHTML=function(e){return`
      <style>
        :host {
          min-width: 4ch;
          padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
          width: 100%;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
          font-weight: var(--media-button-font-weight, normal);
        }

        #checked-indicator {
          display: none;
        }

        :host([${rb.MEDIA_LOOP}]) #checked-indicator {
          display: block;
        }
      </style>
      
      <span id="icon">
     </span>

      <div id="checked-indicator">
        <svg aria-hidden="true" viewBox="0 1 24 24" part="checked-indicator indicator">
          <path d="m10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z"/>
        </svg>
      </div>
    `},lF.getTooltipContentHTML=function(){return rU("Loop")},rz.customElements.get("media-loop-button")||rz.customElements.define("media-loop-button",lF);var lK=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},lG=(e,t,i)=>(lK(e,t,"read from private field"),i?i.call(e):t.get(e)),lj=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},lY=(e,t,i,a)=>(lK(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);let lQ={processCallback(e,t,i){if(i){for(let[e,a]of t)if(e in i){let t=i[e];"boolean"==typeof t&&a instanceof l3&&"boolean"==typeof a.element[a.attributeName]?a.booleanValue=t:"function"==typeof t&&a instanceof l3?a.element[a.attributeName]=t:a.value=t}}}};class lz extends rz.DocumentFragment{constructor(e,t,i=lQ){var a;super(),lj(this,h3,void 0),lj(this,h4,void 0),this.append(e.content.cloneNode(!0)),lY(this,h3,lZ(this)),lY(this,h4,i),null==(a=i.createCallback)||a.call(i,this,lG(this,h3),t),i.processCallback(this,lG(this,h3),t)}update(e){lG(this,h4).processCallback(this,lG(this,h3),e)}}h3=new WeakMap,h4=new WeakMap;let lZ=(e,t=[])=>{let i,a;for(let r of e.attributes||[])if(r.value.includes("{{")){let n=new l2;for([i,a]of lJ(r.value))if(i){let i=new l3(e,r.name,r.namespaceURI);n.append(i),t.push([a,i])}else n.append(a);r.value=n.toString()}for(let r of e.childNodes)if(1!==r.nodeType||r instanceof HTMLTemplateElement){let n=r.data;if(1===r.nodeType||n.includes("{{")){let s=[];if(n)for([i,a]of lJ(n))if(i){let i=new l4(e);s.push(i),t.push([a,i])}else s.push(new Text(a));else if(r instanceof HTMLTemplateElement){let i=new l5(e,r);s.push(i),t.push([i.expression,i])}r.replaceWith(...s.flatMap(e=>e.replacementNodes||[e]))}}else lZ(r,t);return t},lX={},lJ=e=>{let t="",i=0,a=lX[e],r=0,n;if(a)return a;for(a=[];n=e[r];r++)"{"===n&&"{"===e[r+1]&&"\\"!==e[r-1]&&e[r+2]&&1==++i?(t&&a.push([0,t]),t="",r++):"}"!==n||"}"!==e[r+1]||"\\"===e[r-1]||--i?t+=n||"":(a.push([1,t.trim()]),t="",r++);return t&&a.push([0,(i>0?"{{":"")+t]),lX[e]=a};class l0{get value(){return""}set value(e){}toString(){return this.value}}let l1=new WeakMap;class l2{constructor(){lj(this,h5,[])}[Symbol.iterator](){return lG(this,h5).values()}get length(){return lG(this,h5).length}item(e){return lG(this,h5)[e]}append(...e){for(let t of e)t instanceof l3&&l1.set(t,this),lG(this,h5).push(t)}toString(){return lG(this,h5).join("")}}h5=new WeakMap;class l3 extends l0{constructor(e,t,i){super(),lj(this,me),lj(this,h9,""),lj(this,h8,void 0),lj(this,h6,void 0),lj(this,h7,void 0),lY(this,h8,e),lY(this,h6,t),lY(this,h7,i)}get attributeName(){return lG(this,h6)}get attributeNamespace(){return lG(this,h7)}get element(){return lG(this,h8)}get value(){return lG(this,h9)}set value(e){lG(this,h9)!==e&&(lY(this,h9,e),lG(this,me,mt)&&1!==lG(this,me,mt).length?lG(this,h8).setAttributeNS(lG(this,h7),lG(this,h6),lG(this,me,mt).toString()):null==e?lG(this,h8).removeAttributeNS(lG(this,h7),lG(this,h6)):lG(this,h8).setAttributeNS(lG(this,h7),lG(this,h6),e))}get booleanValue(){return lG(this,h8).hasAttributeNS(lG(this,h7),lG(this,h6))}set booleanValue(e){if(lG(this,me,mt)&&1!==lG(this,me,mt).length)throw new DOMException("Value is not fully templatized");this.value=e?"":null}}h9=new WeakMap,h8=new WeakMap,h6=new WeakMap,h7=new WeakMap,me=new WeakSet,mt=function(){return l1.get(this)};class l4 extends l0{constructor(e,t){super(),lj(this,mi,void 0),lj(this,ma,void 0),lY(this,mi,e),lY(this,ma,t?[...t]:[new Text])}get replacementNodes(){return lG(this,ma)}get parentNode(){return lG(this,mi)}get nextSibling(){return lG(this,ma)[lG(this,ma).length-1].nextSibling}get previousSibling(){return lG(this,ma)[0].previousSibling}get value(){return lG(this,ma).map(e=>e.textContent).join("")}set value(e){this.replace(e)}replace(...e){let t=e.flat().flatMap(e=>null==e?[new Text]:e.forEach?[...e]:11===e.nodeType?[...e.childNodes]:e.nodeType?[e]:[new Text(e)]);t.length||t.push(new Text),lY(this,ma,function(e,t,i,a=null){let r=0,n,s,o,l=i.length,d=t.length;for(;r<l&&r<d&&t[r]==i[r];)r++;for(;r<l&&r<d&&i[l-1]==t[d-1];)a=i[--d,--l];if(r==d)for(;r<l;)e.insertBefore(i[r++],a);if(r==l)for(;r<d;)e.removeChild(t[r++]);else{for(n=t[r];r<l;)o=i[r++],s=n?n.nextSibling:a,n==o?n=s:r<l&&i[r]==s?(e.replaceChild(o,n),n=s):e.insertBefore(o,n);for(;n!=a;)s=n.nextSibling,e.removeChild(n),n=s}return i}(lG(this,ma)[0].parentNode,lG(this,ma),t,this.nextSibling))}}mi=new WeakMap,ma=new WeakMap;class l5 extends l4{constructor(e,t){const i=t.getAttribute("directive")||t.getAttribute("type");let a=t.getAttribute("expression")||t.getAttribute(i)||"";a.startsWith("{{")&&(a=a.trim().slice(2,-2).trim()),super(e),this.expression=a,this.template=t,this.directive=i}}let l9={string:e=>String(e)};class l8{constructor(e){this.template=e,this.state=void 0}}let l6=new WeakMap,l7=new WeakMap,de={partial:(e,t)=>{t[e.expression]=new l8(e.template)},if:(e,t)=>{var i;if(dr(e.expression,t))if(l6.get(e)!==e.template){l6.set(e,e.template);let i=new lz(e.template,t,di);e.replace(i),l7.set(e,i)}else null==(i=l7.get(e))||i.update(t);else e.replace(""),l6.delete(e),l7.delete(e)}},dt=Object.keys(de),di={processCallback(e,t,i){var a,r;if(i)for(let[e,n]of t){if(n instanceof l5){if(!n.directive){let e=dt.find(e=>n.template.hasAttribute(e));e&&(n.directive=e,n.expression=n.template.getAttribute(e))}null==(a=de[n.directive])||a.call(de,n,i);continue}let t=dr(e,i);if(t instanceof l8){l6.get(n)!==t.template?(l6.set(n,t.template),n.value=t=new lz(t.template,t.state,di),l7.set(n,t)):null==(r=l7.get(n))||r.update(t.state);continue}t?(n instanceof l3&&n.attributeName.startsWith("aria-")&&(t=String(t)),n instanceof l3?"boolean"==typeof t?n.booleanValue=t:"function"==typeof t?n.element[n.attributeName]=t:n.value=t:(n.value=t,l6.delete(n),l7.delete(n))):n instanceof l3?n.value=void 0:(n.value=void 0,l6.delete(n),l7.delete(n))}}},da={"!":e=>!e,"!!":e=>!!e,"==":(e,t)=>e==t,"!=":(e,t)=>e!=t,">":(e,t)=>e>t,">=":(e,t)=>e>=t,"<":(e,t)=>e<t,"<=":(e,t)=>e<=t,"??":(e,t)=>null!=e?e:t,"|":(e,t)=>{var i;return null==(i=l9[t])?void 0:i.call(l9,e)}};function dr(e,t={}){var i,a,r,n,s,o,l;let d=(function(e,t){let i,a,r,n=[];for(;e;){for(let n in r=null,i=e.length,t)(a=t[n].exec(e))&&a.index<i&&(r={token:a[0],type:n,matches:a.slice(1)},i=a.index);i&&n.push({token:e.substr(0,i),type:void 0}),r&&n.push(r),e=e.substr(i+(r?r.token.length:0))}return n})(e,{boolean:/true|false/,number:/-?\d+\.?\d*/,string:/(["'])((?:\\.|[^\\])*?)\1/,operator:/[!=><][=!]?|\?\?|\|/,ws:/\s+/,param:/[$a-z_][$\w]*/i}).filter(({type:e})=>"ws"!==e);if(0===d.length||d.some(({type:e})=>!e))return dn(e);if((null==(i=d[0])?void 0:i.token)===">"){let i=t[null==(a=d[1])?void 0:a.token];if(!i)return dn(e);let o={...t};i.state=o;let l=d.slice(2);for(let e=0;e<l.length;e+=3){let i=null==(r=l[e])?void 0:r.token,a=null==(n=l[e+1])?void 0:n.token,d=null==(s=l[e+2])?void 0:s.token;i&&"="===a&&(o[i]=dl(d,t))}return i}if(1===d.length)return ds(d[0])?dl(d[0].token,t):dn(e);if(2===d.length){let i=da[null==(o=d[0])?void 0:o.token];return i&&ds(d[1])?i(dl(d[1].token,t)):dn(e)}if(3===d.length){let i=null==(l=d[1])?void 0:l.token,a=da[i];if(!a||!ds(d[0])||!ds(d[2]))return dn(e);let r=dl(d[0].token,t);return a(r,"|"===i?d[2].token:dl(d[2].token,t))}}function dn(e){return console.warn(`Warning: invalid expression \`${e}\``),!1}function ds({type:e}){return["number","boolean","string","param"].includes(e)}function dl(e,t){let i=e[0],a=e.slice(-1);return"true"===e||"false"===e?"true"===e:i===a&&["'",'"'].includes(i)?e.slice(1,-1):rx(e)?parseFloat(e):t[e]}var dd=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},du=(e,t,i)=>(dd(e,t,"read from private field"),i?i.call(e):t.get(e)),dc=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},dh=(e,t,i,a)=>(dd(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),dm=(e,t,i)=>(dd(e,t,"access private method"),i);let dp={mediatargetlivewindow:"targetlivewindow",mediastreamtype:"streamtype"},dv=rZ.createElement("template");dv.innerHTML=`
  <style>
    :host {
      display: inline-block;
      line-height: 0;
    }

    media-controller {
      width: 100%;
      height: 100%;
    }

    media-captions-button:not([mediasubtitleslist]),
    media-captions-menu:not([mediasubtitleslist]),
    media-captions-menu-button:not([mediasubtitleslist]),
    media-audio-track-menu[mediaaudiotrackunavailable],
    media-audio-track-menu-button[mediaaudiotrackunavailable],
    media-rendition-menu[mediarenditionunavailable],
    media-rendition-menu-button[mediarenditionunavailable],
    media-volume-range[mediavolumeunavailable],
    media-airplay-button[mediaairplayunavailable],
    media-fullscreen-button[mediafullscreenunavailable],
    media-cast-button[mediacastunavailable],
    media-pip-button[mediapipunavailable] {
      display: none;
    }
  </style>
`;class db extends rz.HTMLElement{constructor(){super(),dc(this,ml),dc(this,mu),dc(this,mr,void 0),dc(this,mn,void 0),dc(this,ms,void 0),dc(this,mo,void 0),dc(this,mh,void 0),this.shadowRoot?this.renderRoot=this.shadowRoot:(this.renderRoot=this.attachShadow({mode:"open"}),this.createRenderer()),dh(this,mo,new MutationObserver(e=>{var t;(!this.mediaController||(null==(t=this.mediaController)?void 0:t.breakpointsComputed))&&e.some(e=>{let t=e.target;return t===this||"media-controller"===t.localName&&!!(dp[e.attributeName]||e.attributeName.startsWith("breakpoint"))})&&this.render()})),dh(this,mh,this.render.bind(this)),dm(this,ml,md).call(this,"template")}get mediaController(){return this.renderRoot.querySelector("media-controller")}get template(){var e;return null!=(e=du(this,mr))?e:this.constructor.template}set template(e){null===e?this.removeAttribute("template"):"string"==typeof e?this.setAttribute("template",e):e instanceof HTMLTemplateElement&&(dh(this,mr,e),dh(this,ms,null),this.createRenderer())}get props(){var e,t,i;let a=[...Array.from(null!=(t=null==(e=this.mediaController)?void 0:e.attributes)?t:[]).filter(({name:e})=>dp[e]||e.startsWith("breakpoint")),...Array.from(this.attributes)],r={};for(let e of a){let t=null!=(i=dp[e.name])?i:e.name.replace(/[-_]([a-z])/g,(e,t)=>t.toUpperCase()),{value:a}=e;null!=a?(rx(a)&&(a=parseFloat(a)),r[t]=""===a||a):r[t]=!1}return r}attributeChangedCallback(e,t,i){"template"===e&&t!=i&&dm(this,mu,mc).call(this)}connectedCallback(){this.addEventListener(rg.BREAKPOINTS_COMPUTED,du(this,mh)),du(this,mo).observe(this,{attributes:!0}),du(this,mo).observe(this.renderRoot,{attributes:!0,subtree:!0}),dm(this,mu,mc).call(this)}disconnectedCallback(){this.removeEventListener(rg.BREAKPOINTS_COMPUTED,du(this,mh)),du(this,mo).disconnect()}createRenderer(){this.template instanceof HTMLTemplateElement&&this.template!==du(this,mn)&&(dh(this,mn,this.template),this.renderer=new lz(this.template,this.props,this.constructor.processor),this.renderRoot.textContent="",this.renderRoot.append(dv.content.cloneNode(!0),this.renderer))}render(){var e;null==(e=this.renderer)||e.update(this.props)}}async function dg(e){let t=await fetch(e);if(200!==t.status)throw Error(`Failed to load resource: the server responded with a status of ${t.status}`);return t.text()}function df(e){return e.split("-")[0]}mr=new WeakMap,mn=new WeakMap,ms=new WeakMap,mo=new WeakMap,ml=new WeakSet,md=function(e){if(Object.prototype.hasOwnProperty.call(this,e)){let t=this[e];delete this[e],this[e]=t}},mu=new WeakSet,mc=function(){var e;let t=this.getAttribute("template");if(!t||t===du(this,ms))return;let i=this.getRootNode(),a=null==(e=null==i?void 0:i.getElementById)?void 0:e.call(i,t);if(a){dh(this,ms,t),dh(this,mr,a),this.createRenderer();return}(function(e){if(!/^(\/|\.\/|https?:\/\/)/.test(e))return!1;let t=/^https?:\/\//.test(e)?void 0:location.origin;try{new URL(e,t)}catch(e){return!1}return!0})(t)&&(dh(this,ms,t),dg(t).then(e=>{let t=rZ.createElement("template");t.innerHTML=e,dh(this,mr,t),this.createRenderer()}).catch(console.error))},mh=new WeakMap,db.observedAttributes=["template"],db.processor=di,rz.customElements.get("media-theme")||rz.customElements.define("media-theme",db);class dE extends Event{constructor({action:e="auto",relatedTarget:t,...i}){super("invoke",i),this.action=e,this.relatedTarget=t}}class dy extends Event{constructor({newState:e,oldState:t,...i}){super("toggle",i),this.newState=e,this.oldState=t}}var d_=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},dT=(e,t,i)=>(d_(e,t,"read from private field"),i?i.call(e):t.get(e)),dA=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},dk=(e,t,i,a)=>(d_(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),dw=(e,t,i)=>(d_(e,t,"access private method"),i);function dS({type:e,text:t,value:i,checked:a}){let r=rZ.createElement("media-chrome-menu-item");r.type=null!=e?e:"",r.part.add("menu-item"),e&&r.part.add(e),r.value=i,r.checked=a;let n=rZ.createElement("span");return n.textContent=t,r.append(n),r}function dI(e,t){let i=e.querySelector(`:scope > [slot="${t}"]`);if((null==i?void 0:i.nodeName)=="SLOT"&&(i=i.assignedElements({flatten:!0})[0]),i)return i.cloneNode(!0);let a=e.shadowRoot.querySelector(`[name="${t}"] > svg`);return a?a.cloneNode(!0):""}let dR="style",dC="hidden",dL="disabled";class dM extends rz.HTMLElement{constructor(){if(super(),dA(this,my),dA(this,mT),dA(this,mw),dA(this,mI),dA(this,mC),dA(this,mM),dA(this,mN),dA(this,mU),dA(this,mH),dA(this,m$),dA(this,mV),dA(this,mK),dA(this,mj),dA(this,mQ),dA(this,mZ),dA(this,mJ),dA(this,m1),dA(this,m3),dA(this,mm,null),dA(this,mp,null),dA(this,mv,null),dA(this,mb,new Set),dA(this,mg,void 0),dA(this,mf,!1),dA(this,mE,null),dA(this,mk,()=>{let e=dT(this,mb),t=new Set(this.items);for(let i of e)t.has(i)||this.dispatchEvent(new CustomEvent("removemenuitem",{detail:i}));for(let i of t)e.has(i)||this.dispatchEvent(new CustomEvent("addmenuitem",{detail:i}));dk(this,mb,t)}),dA(this,mx,()=>{dw(this,mN,mO).call(this),dw(this,mU,mB).call(this,!1)}),dA(this,mP,()=>{dw(this,mN,mO).call(this)}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const e=r3(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}this.container=this.shadowRoot.querySelector("#container"),this.defaultSlot=this.shadowRoot.querySelector("slot:not([name])"),dk(this,mg,new MutationObserver(dT(this,mk)))}static get observedAttributes(){return[dL,dC,dR,"anchor",rm.MEDIA_CONTROLLER]}static formatMenuItemText(e,t){return e}enable(){this.addEventListener("click",this),this.addEventListener("focusout",this),this.addEventListener("keydown",this),this.addEventListener("invoke",this),this.addEventListener("toggle",this)}disable(){this.removeEventListener("click",this),this.removeEventListener("focusout",this),this.removeEventListener("keyup",this),this.removeEventListener("invoke",this),this.removeEventListener("toggle",this)}handleEvent(e){switch(e.type){case"slotchange":dw(this,my,m_).call(this,e);break;case"invoke":dw(this,mI,mR).call(this,e);break;case"click":dw(this,mH,mW).call(this,e);break;case"toggle":dw(this,mV,mF).call(this,e);break;case"focusout":dw(this,mj,mY).call(this,e);break;case"keydown":dw(this,mQ,mz).call(this,e)}}connectedCallback(){var e,t;dT(this,mg).observe(this.defaultSlot,{childList:!0}),dk(this,mE,nr(this.shadowRoot,":host")),dw(this,mw,mS).call(this),this.hasAttribute("disabled")||this.enable(),this.role||(this.role="menu"),dk(this,mm,r5(this)),null==(t=null==(e=dT(this,mm))?void 0:e.associateElement)||t.call(e,this),this.hidden||(r1(dx(this),dT(this,mx)),r1(this,dT(this,mP))),dw(this,mT,mA).call(this),this.shadowRoot.addEventListener("slotchange",this)}disconnectedCallback(){var e,t;dT(this,mg).disconnect(),r2(dx(this),dT(this,mx)),r2(this,dT(this,mP)),this.disable(),null==(t=null==(e=dT(this,mm))?void 0:e.unassociateElement)||t.call(e,this),dk(this,mm,null),dk(this,mp,null),dk(this,mv,null),this.shadowRoot.removeEventListener("slotchange",this)}attributeChangedCallback(e,t,i){var a,r,n,s;e===dC&&i!==t?(dT(this,mf)||dk(this,mf,!0),this.hidden?dw(this,mM,mD).call(this):dw(this,mC,mL).call(this),this.dispatchEvent(new dy({oldState:this.hidden?"open":"closed",newState:this.hidden?"closed":"open",bubbles:!0}))):e===rm.MEDIA_CONTROLLER?(t&&(null==(r=null==(a=dT(this,mm))?void 0:a.unassociateElement)||r.call(a,this),dk(this,mm,null)),i&&this.isConnected&&(dk(this,mm,r5(this)),null==(s=null==(n=dT(this,mm))?void 0:n.associateElement)||s.call(n,this))):e===dL&&i!==t?null==i?this.enable():this.disable():e===dR&&i!==t&&dw(this,mw,mS).call(this)}formatMenuItemText(e,t){return this.constructor.formatMenuItemText(e,t)}get anchor(){return this.getAttribute("anchor")}set anchor(e){this.setAttribute("anchor",`${e}`)}get anchorElement(){var e;return this.anchor?null==(e=nt(this))?void 0:e.querySelector(`#${this.anchor}`):null}get items(){return this.defaultSlot.assignedElements({flatten:!0}).filter(dD)}get radioGroupItems(){return this.items.filter(e=>"menuitemradio"===e.role)}get checkedItems(){return this.items.filter(e=>e.checked)}get value(){var e,t;return null!=(t=null==(e=this.checkedItems[0])?void 0:e.value)?t:""}set value(e){let t=this.items.find(t=>t.value===e);t&&dw(this,m3,m4).call(this,t)}focus(){if(dk(this,mp,ne()),this.items.length){dw(this,m1,m2).call(this,this.items[0]),this.items[0].focus();return}let e=this.querySelector('[autofocus], [tabindex]:not([tabindex="-1"]), [role="menu"]');null==e||e.focus()}handleSelect(e){var t;let i=dw(this,mZ,mX).call(this,e);i&&(dw(this,m3,m4).call(this,i,"checkbox"===i.type),dT(this,mv)&&!this.hidden&&(null==(t=dT(this,mp))||t.focus(),this.hidden=!0))}get keysUsed(){return["Enter","Escape","Tab"," ","ArrowDown","ArrowUp","Home","End"]}handleMove(e){var t,i;let{key:a}=e,r=this.items,n=null!=(i=null!=(t=dw(this,mZ,mX).call(this,e))?t:dw(this,mJ,m0).call(this))?i:r[0],s=Math.max(0,r.indexOf(n));"ArrowDown"===a?s++:"ArrowUp"===a?s--:"Home"===e.key?s=0:"End"===e.key&&(s=r.length-1),s<0&&(s=r.length-1),s>r.length-1&&(s=0),dw(this,m1,m2).call(this,r[s]),r[s].focus()}}function dD(e){return["menuitem","menuitemradio","menuitemcheckbox"].includes(null==e?void 0:e.role)}function dx(e){var t;return null!=(t=e.getAttribute("bounds")?r7(e,`#${e.getAttribute("bounds")}`):r4(e)||e.parentElement)?t:e}mm=new WeakMap,mp=new WeakMap,mv=new WeakMap,mb=new WeakMap,mg=new WeakMap,mf=new WeakMap,mE=new WeakMap,my=new WeakSet,m_=function(e){let t=e.target;for(let e of t.assignedNodes({flatten:!0}))3===e.nodeType&&""===e.textContent.trim()&&e.remove();["header","title"].includes(t.name)&&dw(this,mT,mA).call(this),t.name||dT(this,mk).call(this)},mT=new WeakSet,mA=function(){let e=this.shadowRoot.querySelector('slot[name="header"]');e.hidden=0===this.shadowRoot.querySelector('slot[name="title"]').assignedNodes().length&&0===e.assignedNodes().length},mk=new WeakMap,mw=new WeakSet,mS=function(){var e;let t=this.shadowRoot.querySelector("#layout-row"),i=null==(e=getComputedStyle(this).getPropertyValue("--media-menu-layout"))?void 0:e.trim();t.setAttribute("media","row"===i?"":"width:0")},mI=new WeakSet,mR=function(e){dk(this,mv,e.relatedTarget),r6(this,e.relatedTarget)||(this.hidden=!this.hidden)},mC=new WeakSet,mL=function(){var e;null==(e=dT(this,mv))||e.setAttribute("aria-expanded","true"),this.addEventListener("transitionend",()=>this.focus(),{once:!0}),r1(dx(this),dT(this,mx)),r1(this,dT(this,mP))},mM=new WeakSet,mD=function(){var e;null==(e=dT(this,mv))||e.setAttribute("aria-expanded","false"),r2(dx(this),dT(this,mx)),r2(this,dT(this,mP))},mx=new WeakMap,mP=new WeakMap,mN=new WeakSet,mO=function(e){if(this.hasAttribute("mediacontroller")&&!this.anchor||this.hidden||!this.anchorElement)return;let{x:t,y:i}=function({anchor:e,floating:t,placement:i}){let{x:a,y:r}=function({anchor:e,floating:t},i){let a,r="x"==(["top","bottom"].includes(df(i))?"y":"x")?"y":"x",n="y"===r?"height":"width",s=df(i),o=e.x+e.width/2-t.width/2,l=e.y+e.height/2-t.height/2,d=e[n]/2-t[n]/2;switch(s){case"top":a={x:o,y:e.y-t.height};break;case"bottom":a={x:o,y:e.y+e.height};break;case"right":a={x:e.x+e.width,y:l};break;case"left":a={x:e.x-t.width,y:l};break;default:a={x:e.x,y:e.y}}switch(i.split("-")[1]){case"start":a[r]-=d;break;case"end":a[r]+=d}return a}(function({anchor:e,floating:t}){var i,a,r;let n,s;return{anchor:(i=e,a=t.offsetParent,n=i.getBoundingClientRect(),s=null!=(r=null==a?void 0:a.getBoundingClientRect())?r:{x:0,y:0},{x:n.x-s.x,y:n.y-s.y,width:n.width,height:n.height}),floating:{x:0,y:0,width:t.offsetWidth,height:t.offsetHeight}}}({anchor:e,floating:t}),i);return{x:a,y:r}}({anchor:this.anchorElement,floating:this,placement:"top-start"});null!=e||(e=this.offsetWidth);let a=dx(this).getBoundingClientRect(),r=a.width-t-e,n=a.height-i-this.offsetHeight,{style:s}=dT(this,mE);s.setProperty("position","absolute"),s.setProperty("right",`${Math.max(0,r)}px`),s.setProperty("--_menu-bottom",`${n}px`);let o=getComputedStyle(this),l=s.getPropertyValue("--_menu-bottom")===o.bottom?n:parseFloat(o.bottom),d=a.height-l-parseFloat(o.marginBottom);this.style.setProperty("--_menu-max-height",`${d}px`)},mU=new WeakSet,mB=function(e){let t=this.querySelector('[role="menuitem"][aria-haspopup][aria-expanded="true"]'),i=null==t?void 0:t.querySelector('[role="menu"]'),{style:a}=dT(this,mE);if(e||a.setProperty("--media-menu-transition-in","none"),i){let e=i.offsetHeight,a=Math.max(i.offsetWidth,t.offsetWidth);this.style.setProperty("min-width",`${a}px`),this.style.setProperty("min-height",`${e}px`),dw(this,mN,mO).call(this,a)}else this.style.removeProperty("min-width"),this.style.removeProperty("min-height"),dw(this,mN,mO).call(this);a.removeProperty("--media-menu-transition-in")},mH=new WeakSet,mW=function(e){var t;if(e.stopPropagation(),e.composedPath().includes(dT(this,m$,mq))){null==(t=dT(this,mp))||t.focus(),this.hidden=!0;return}let i=dw(this,mZ,mX).call(this,e);!i||i.hasAttribute("disabled")||(dw(this,m1,m2).call(this,i),this.handleSelect(e))},m$=new WeakSet,mq=function(){var e;return null==(e=this.shadowRoot.querySelector('slot[name="header"]').assignedElements({flatten:!0}))?void 0:e.find(e=>e.matches('button[part~="back"]'))},mV=new WeakSet,mF=function(e){if(e.target===this)return;dw(this,mK,mG).call(this);let t=Array.from(this.querySelectorAll('[role="menuitem"][aria-haspopup]'));for(let i of t)i.invokeTargetElement!=e.target&&("open"!=e.newState||"true"!=i.getAttribute("aria-expanded")||i.invokeTargetElement.hidden||i.invokeTargetElement.dispatchEvent(new dE({relatedTarget:i})));for(let e of t)e.setAttribute("aria-expanded",`${!e.submenuElement.hidden}`);dw(this,mU,mB).call(this,!0)},mK=new WeakSet,mG=function(){let e=this.querySelector('[role="menuitem"] > [role="menu"]:not([hidden])');this.container.classList.toggle("has-expanded",!!e)},mj=new WeakSet,mY=function(e){var t;r6(this,e.relatedTarget)||(dT(this,mf)&&(null==(t=dT(this,mp))||t.focus()),dT(this,mv)&&dT(this,mv)!==e.relatedTarget&&!this.hidden&&(this.hidden=!0))},mQ=new WeakSet,mz=function(e){var t,i,a,r,n;let{key:s,ctrlKey:o,altKey:l,metaKey:d}=e;if(!o&&!l&&!d&&this.keysUsed.includes(s))if(e.preventDefault(),e.stopPropagation(),"Tab"===s){if(dT(this,mf)){this.hidden=!0;return}e.shiftKey?null==(i=null==(t=this.previousElementSibling)?void 0:t.focus)||i.call(t):null==(r=null==(a=this.nextElementSibling)?void 0:a.focus)||r.call(a),this.blur()}else"Escape"===s?(null==(n=dT(this,mp))||n.focus(),dT(this,mf)&&(this.hidden=!0)):"Enter"===s||" "===s?this.handleSelect(e):this.handleMove(e)},mZ=new WeakSet,mX=function(e){return e.composedPath().find(e=>["menuitemradio","menuitemcheckbox"].includes(e.role))},mJ=new WeakSet,m0=function(){return this.items.find(e=>0===e.tabIndex)},m1=new WeakSet,m2=function(e){for(let t of this.items)t.tabIndex=t===e?0:-1},m3=new WeakSet,m4=function(e,t){let i=[...this.checkedItems];"radio"===e.type&&this.radioGroupItems.forEach(e=>e.checked=!1),t?e.checked=!e.checked:e.checked=!0,this.checkedItems.some((e,t)=>e!=i[t])&&this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))},dM.shadowRootOptions={mode:"open"},dM.getTemplateHTML=function(e){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        --_menu-bg: rgb(20 20 30 / .8);
        background: var(--media-menu-background, var(--media-control-background, var(--media-secondary-color, var(--_menu-bg))));
        border-radius: var(--media-menu-border-radius);
        border: var(--media-menu-border, none);
        display: var(--media-menu-display, inline-flex) !important;
        
        transition: var(--media-menu-transition-in,
          visibility 0s,
          opacity .2s ease-out,
          transform .15s ease-out,
          left .2s ease-in-out,
          min-width .2s ease-in-out,
          min-height .2s ease-in-out
        ) !important;
        
        visibility: var(--media-menu-visibility, visible);
        opacity: var(--media-menu-opacity, 1);
        max-height: var(--media-menu-max-height, var(--_menu-max-height, 300px));
        transform: var(--media-menu-transform-in, translateY(0) scale(1));
        flex-direction: column;
        
        min-height: 0;
        position: relative;
        bottom: var(--_menu-bottom);
        box-sizing: border-box;
      } 

      @-moz-document url-prefix() {
        :host{
          --_menu-bg: rgb(20 20 30);
        }
      }

      :host([hidden]) {
        transition: var(--media-menu-transition-out,
          visibility .15s ease-in,
          opacity .15s ease-in,
          transform .15s ease-in
        ) !important;
        visibility: var(--media-menu-hidden-visibility, hidden);
        opacity: var(--media-menu-hidden-opacity, 0);
        max-height: var(--media-menu-hidden-max-height,
          var(--media-menu-max-height, var(--_menu-max-height, 300px)));
        transform: var(--media-menu-transform-out, translateY(2px) scale(.99));
        pointer-events: none;
      }

      :host([slot="submenu"]) {
        background: none;
        width: 100%;
        min-height: 100%;
        position: absolute;
        bottom: 0;
        right: -100%;
      }

      #container {
        display: flex;
        flex-direction: column;
        min-height: 0;
        transition: transform .2s ease-out;
        transform: translate(0, 0);
      }

      #container.has-expanded {
        transition: transform .2s ease-in;
        transform: translate(-100%, 0);
      }

      button {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        outline: inherit;
        display: inline-flex;
        align-items: center;
      }

      slot[name="header"][hidden] {
        display: none;
      }

      slot[name="header"] > *,
      slot[name="header"]::slotted(*) {
        padding: .4em .7em;
        border-bottom: 1px solid rgb(255 255 255 / .25);
        cursor: var(--media-cursor, default);
      }

      slot[name="header"] > button[part~="back"],
      slot[name="header"]::slotted(button[part~="back"]) {
        cursor: var(--media-cursor, pointer);
      }

      svg[part~="back"] {
        height: var(--media-menu-icon-height, var(--media-control-height, 24px));
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        display: block;
        margin-right: .5ch;
      }

      slot:not([name]) {
        gap: var(--media-menu-gap);
        flex-direction: var(--media-menu-flex-direction, column);
        overflow: var(--media-menu-overflow, hidden auto);
        display: flex;
        min-height: 0;
      }

      :host([role="menu"]) slot:not([name]) {
        padding-block: .4em;
      }

      slot:not([name])::slotted([role="menu"]) {
        background: none;
      }

      media-chrome-menu-item > span {
        margin-right: .5ch;
        max-width: var(--media-menu-item-max-width);
        text-overflow: ellipsis;
        overflow: hidden;
      }
    </style>
    <style id="layout-row" media="width:0">

      slot[name="header"] > *,
      slot[name="header"]::slotted(*) {
        padding: .4em .5em;
      }

      slot:not([name]) {
        gap: var(--media-menu-gap, .25em);
        flex-direction: var(--media-menu-flex-direction, row);
        padding-inline: .5em;
      }

      media-chrome-menu-item {
        padding: .3em .5em;
      }

      media-chrome-menu-item[aria-checked="true"] {
        background: var(--media-menu-item-checked-background, rgb(255 255 255 / .2));
      }

      
      media-chrome-menu-item::part(checked-indicator) {
        display: var(--media-menu-item-checked-indicator-display, none);
      }
    </style>
    <div id="container" part="container">
      <slot name="header" hidden>
        <button part="back button" aria-label="Back to previous menu">
          <slot name="back-icon">
            <svg aria-hidden="true" viewBox="0 0 20 24" part="back indicator">
              <path d="m11.88 17.585.742-.669-4.2-4.665 4.2-4.666-.743-.669-4.803 5.335 4.803 5.334Z"/>
            </svg>
          </slot>
          <slot name="title"></slot>
        </button>
      </slot>
      <slot></slot>
    </div>
    <slot name="checked-indicator" hidden></slot>
  `},rz.customElements.get("media-chrome-menu")||rz.customElements.define("media-chrome-menu",dM);var dP=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},dN=(e,t,i)=>(dP(e,t,"read from private field"),i?i.call(e):t.get(e)),dO=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},dU=(e,t,i,a)=>(dP(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),dB=(e,t,i)=>(dP(e,t,"access private method"),i);let dH="type",dW="value",d$="checked",dq="disabled";class dV extends rz.HTMLElement{constructor(){if(super(),dO(this,m8),dO(this,m7),dO(this,pt),dO(this,ps),dO(this,m5,!1),dO(this,m9,void 0),dO(this,pa,()=>{var e,t;this.submenuElement.items&&this.setAttribute("submenusize",`${this.submenuElement.items.length}`);let i=this.shadowRoot.querySelector('slot[name="description"]'),a=null==(e=this.submenuElement.checkedItems)?void 0:e[0],r=null!=(t=null==a?void 0:a.dataset.description)?t:null==a?void 0:a.text,n=rZ.createElement("span");n.textContent=null!=r?r:"",i.replaceChildren(n)}),dO(this,pr,e=>{let{key:t}=e;this.keysUsed.includes(t)?this.handleClick(e):this.removeEventListener("keyup",dN(this,pr))}),dO(this,pn,e=>{let{metaKey:t,altKey:i,key:a}=e;t||i||!this.keysUsed.includes(a)?this.removeEventListener("keyup",dN(this,pr)):this.addEventListener("keyup",dN(this,pr),{once:!0})}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const e=r3(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[dH,dq,d$,dW]}enable(){this.hasAttribute("tabindex")||this.setAttribute("tabindex","-1"),dF(this)&&!this.hasAttribute("aria-checked")&&this.setAttribute("aria-checked","false"),this.addEventListener("click",this),this.addEventListener("keydown",this)}disable(){this.removeAttribute("tabindex"),this.removeEventListener("click",this),this.removeEventListener("keydown",this),this.removeEventListener("keyup",this)}handleEvent(e){switch(e.type){case"slotchange":dB(this,m8,m6).call(this,e);break;case"click":this.handleClick(e);break;case"keydown":dN(this,pn).call(this,e);break;case"keyup":dN(this,pr).call(this,e)}}attributeChangedCallback(e,t,i){e===d$&&dF(this)&&!dN(this,m5)?this.setAttribute("aria-checked",null!=i?"true":"false"):e===dH&&i!==t?this.role="menuitem"+i:e===dq&&i!==t&&(null==i?this.enable():this.disable())}connectedCallback(){this.hasAttribute(dq)||this.enable(),this.role="menuitem"+this.type,dU(this,m9,function e(t,i){if(!t)return null;let{host:a}=t.getRootNode();return!i&&a?e(t,a):(null==i?void 0:i.items)?i:e(i,null==i?void 0:i.parentNode)}(this,this.parentNode)),dB(this,ps,po).call(this),this.submenuElement&&dB(this,m7,pe).call(this),this.shadowRoot.addEventListener("slotchange",this)}disconnectedCallback(){this.disable(),dB(this,ps,po).call(this),dU(this,m9,null),this.shadowRoot.removeEventListener("slotchange",this)}get invokeTarget(){return this.getAttribute("invoketarget")}set invokeTarget(e){this.setAttribute("invoketarget",`${e}`)}get invokeTargetElement(){var e;return this.invokeTarget?null==(e=nt(this))?void 0:e.querySelector(`#${this.invokeTarget}`):this.submenuElement}get submenuElement(){return this.shadowRoot.querySelector('slot[name="submenu"]').assignedElements({flatten:!0})[0]}get type(){var e;return null!=(e=this.getAttribute(dH))?e:""}set type(e){this.setAttribute(dH,`${e}`)}get value(){var e;return null!=(e=this.getAttribute(dW))?e:this.text}set value(e){this.setAttribute(dW,e)}get text(){var e;return(null!=(e=this.textContent)?e:"").trim()}get checked(){if(dF(this))return"true"===this.getAttribute("aria-checked")}set checked(e){dF(this)&&(dU(this,m5,!0),this.setAttribute("aria-checked",e?"true":"false"),e?this.part.add("checked"):this.part.remove("checked"))}handleClick(e){!dF(this)&&this.invokeTargetElement&&r6(this,e.target)&&this.invokeTargetElement.dispatchEvent(new dE({relatedTarget:this}))}get keysUsed(){return["Enter"," "]}}function dF(e){return"radio"===e.type||"checkbox"===e.type}m5=new WeakMap,m9=new WeakMap,m8=new WeakSet,m6=function(e){let t=e.target;if(!(null==t?void 0:t.name))for(let e of t.assignedNodes({flatten:!0}))e instanceof Text&&""===e.textContent.trim()&&e.remove();"submenu"===t.name&&(this.submenuElement?dB(this,m7,pe).call(this):dB(this,pt,pi).call(this))},m7=new WeakSet,pe=async function(){this.setAttribute("aria-haspopup","menu"),this.setAttribute("aria-expanded",`${!this.submenuElement.hidden}`),this.submenuElement.addEventListener("change",dN(this,pa)),this.submenuElement.addEventListener("addmenuitem",dN(this,pa)),this.submenuElement.addEventListener("removemenuitem",dN(this,pa)),dN(this,pa).call(this)},pt=new WeakSet,pi=function(){this.removeAttribute("aria-haspopup"),this.removeAttribute("aria-expanded"),this.submenuElement.removeEventListener("change",dN(this,pa)),this.submenuElement.removeEventListener("addmenuitem",dN(this,pa)),this.submenuElement.removeEventListener("removemenuitem",dN(this,pa)),dN(this,pa).call(this)},pa=new WeakMap,pr=new WeakMap,pn=new WeakMap,ps=new WeakSet,po=function(){var e;let t=null==(e=dN(this,m9))?void 0:e.radioGroupItems;if(!t)return;let i=t.filter(e=>"true"===e.getAttribute("aria-checked")).pop();for(let e of(i||(i=t[0]),t))e.setAttribute("aria-checked","false");null==i||i.setAttribute("aria-checked","true")},dV.shadowRootOptions={mode:"open"},dV.getTemplateHTML=function(e){return`
    <style>
      :host {
        transition: var(--media-menu-item-transition,
          background .15s linear,
          opacity .2s ease-in-out
        );
        outline: var(--media-menu-item-outline, 0);
        outline-offset: var(--media-menu-item-outline-offset, -1px);
        cursor: var(--media-cursor, pointer);
        display: flex;
        align-items: center;
        align-self: stretch;
        justify-self: stretch;
        white-space: nowrap;
        white-space-collapse: collapse;
        text-wrap: nowrap;
        padding: .4em .8em .4em 1em;
      }

      :host(:focus-visible) {
        box-shadow: var(--media-menu-item-focus-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: var(--media-menu-item-hover-outline, 0);
        outline-offset: var(--media-menu-item-hover-outline-offset,  var(--media-menu-item-outline-offset, -1px));
      }

      :host(:hover) {
        cursor: var(--media-cursor, pointer);
        background: var(--media-menu-item-hover-background, rgb(92 92 102 / .5));
        outline: var(--media-menu-item-hover-outline);
        outline-offset: var(--media-menu-item-hover-outline-offset,  var(--media-menu-item-outline-offset, -1px));
      }

      :host([aria-checked="true"]) {
        background: var(--media-menu-item-checked-background);
      }

      :host([hidden]) {
        display: none;
      }

      :host([disabled]) {
        pointer-events: none;
        color: rgba(255, 255, 255, .3);
      }

      slot:not([name]) {
        width: 100%;
      }

      slot:not([name="submenu"]) {
        display: inline-flex;
        align-items: center;
        transition: inherit;
        opacity: var(--media-menu-item-opacity, 1);
      }

      slot[name="description"] {
        justify-content: end;
      }

      slot[name="description"] > span {
        display: inline-block;
        margin-inline: 1em .2em;
        max-width: var(--media-menu-item-description-max-width, 100px);
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: .8em;
        font-weight: 400;
        text-align: right;
        position: relative;
        top: .04em;
      }

      slot[name="checked-indicator"] {
        display: none;
      }

      :host(:is([role="menuitemradio"],[role="menuitemcheckbox"])) slot[name="checked-indicator"] {
        display: var(--media-menu-item-checked-indicator-display, inline-block);
      }

      
      svg, img, ::slotted(svg), ::slotted(img) {
        height: var(--media-menu-item-icon-height, var(--media-control-height, 24px));
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        display: block;
      }

      
      [part~="indicator"],
      ::slotted([part~="indicator"]) {
        fill: var(--media-menu-item-indicator-fill,
          var(--media-icon-color, var(--media-primary-color, rgb(238 238 238))));
        height: var(--media-menu-item-indicator-height, 1.25em);
        margin-right: .5ch;
      }

      [part~="checked-indicator"] {
        visibility: hidden;
      }

      :host([aria-checked="true"]) [part~="checked-indicator"] {
        visibility: visible;
      }
    </style>
    <slot name="checked-indicator">
      <svg aria-hidden="true" viewBox="0 1 24 24" part="checked-indicator indicator">
        <path d="m10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z"/>
      </svg>
    </slot>
    <slot name="prefix"></slot>
    <slot></slot>
    <slot name="description"></slot>
    <slot name="suffix">
      ${this.getSuffixSlotInnerHTML(e)}
    </slot>
    <slot name="submenu"></slot>
  `},dV.getSuffixSlotInnerHTML=function(e){return""},rz.customElements.get("media-chrome-menu-item")||rz.customElements.define("media-chrome-menu-item",dV);class dK extends dM{get anchorElement(){return"auto"!==this.anchor?super.anchorElement:r4(this).querySelector("media-settings-menu-button")}}dK.getTemplateHTML=function(e){return`
    ${dM.getTemplateHTML(e)}
    <style>
      :host {
        --_menu-bg: rgb(20 20 30 / .8);
        background: var(--media-settings-menu-background,
            var(--media-menu-background,
              var(--media-control-background,
                var(--media-secondary-color, var(--_menu-bg)))));
        min-width: var(--media-settings-menu-min-width, 170px);
        border-radius: 2px 2px 0 0;
        overflow: hidden;
      }

      @-moz-document url-prefix() {
        :host{
          --_menu-bg: rgb(20 20 30);
        }
      }

      :host([role="menu"]) {
        
        justify-content: end;
      }

      slot:not([name]) {
        justify-content: var(--media-settings-menu-justify-content);
        flex-direction: var(--media-settings-menu-flex-direction, column);
        overflow: visible;
      }

      #container.has-expanded {
        --media-settings-menu-item-opacity: 0;
      }
    </style>
  `},rz.customElements.get("media-settings-menu")||rz.customElements.define("media-settings-menu",dK);class dG extends dV{}dG.shadowRootOptions={mode:"open"},dG.getTemplateHTML=function(e){return`
    ${dV.getTemplateHTML.call(this,e)}
    <style>
      slot:not([name="submenu"]) {
        opacity: var(--media-settings-menu-item-opacity, var(--media-menu-item-opacity));
      }

      :host([aria-expanded="true"]:hover) {
        background: transparent;
      }
    </style>
  `},dG.getSuffixSlotInnerHTML=function(e){return`
    <svg aria-hidden="true" viewBox="0 0 20 24">
      <path d="m8.12 17.585-.742-.669 4.2-4.665-4.2-4.666.743-.669 4.803 5.335-4.803 5.334Z"/>
    </svg>
  `},rz.customElements.get("media-settings-menu-item")||rz.customElements.define("media-settings-menu-item",dG);class dj extends sJ{connectedCallback(){super.connectedCallback(),this.invokeTargetElement&&this.setAttribute("aria-haspopup","menu")}get invokeTarget(){return this.getAttribute("invoketarget")}set invokeTarget(e){this.setAttribute("invoketarget",`${e}`)}get invokeTargetElement(){var e;return this.invokeTarget?null==(e=nt(this))?void 0:e.querySelector(`#${this.invokeTarget}`):null}handleClick(){var e;null==(e=this.invokeTargetElement)||e.dispatchEvent(new dE({relatedTarget:this}))}}rz.customElements.get("media-chrome-menu-button")||rz.customElements.define("media-chrome-menu-button",dj);class dY extends dj{static get observedAttributes(){return[...super.observedAttributes,"target"]}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-label",rU("settings"))}get invokeTargetElement(){return void 0!=this.invokeTarget?super.invokeTargetElement:r4(this).querySelector("media-settings-menu")}}dY.getSlotTemplateHTML=function(){return`
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4.5 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7.5 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7.5 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
      </svg>
    </slot>
  `},dY.getTooltipContentHTML=function(){return rU("Settings")},rz.customElements.get("media-settings-menu-button")||rz.customElements.define("media-settings-menu-button",dY);var dQ=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},dz=(e,t,i)=>(dQ(e,t,"read from private field"),i?i.call(e):t.get(e)),dZ=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},dX=(e,t,i,a)=>(dQ(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),dJ=(e,t,i)=>(dQ(e,t,"access private method"),i);pl=new WeakMap,pd=new WeakMap,pu=new WeakSet,pc=function(){if(dz(this,pd)===JSON.stringify(this.mediaAudioTrackList))return;dX(this,pd,JSON.stringify(this.mediaAudioTrackList));let e=this.mediaAudioTrackList;for(let t of(this.defaultSlot.textContent="",e.sort((e,t)=>e.id.localeCompare(t.id,void 0,{numeric:!0})),e)){let e=dS({type:"radio",text:this.formatMenuItemText(t.label,t),value:`${t.id}`,checked:t.enabled});e.prepend(dI(this,"checked-indicator")),this.defaultSlot.append(e)}},ph=new WeakSet,pm=function(){if(null==this.value)return;let e=new rz.CustomEvent(rh.MEDIA_AUDIO_TRACK_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(e)},rz.customElements.get("media-audio-track-menu")||rz.customElements.define("media-audio-track-menu",class extends dM{constructor(){super(...arguments),dZ(this,pu),dZ(this,ph),dZ(this,pl,[]),dZ(this,pd,void 0)}static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_AUDIO_TRACK_LIST,rb.MEDIA_AUDIO_TRACK_ENABLED,rb.MEDIA_AUDIO_TRACK_UNAVAILABLE]}attributeChangedCallback(e,t,i){if(super.attributeChangedCallback(e,t,i),e===rb.MEDIA_AUDIO_TRACK_ENABLED&&t!==i)this.value=i;else if(e===rb.MEDIA_AUDIO_TRACK_LIST&&t!==i){var a;dX(this,pl,null==(a=null!=i?i:"")?void 0:a.split(/\s+/).map(rM)),dJ(this,pu,pc).call(this)}}connectedCallback(){super.connectedCallback(),this.addEventListener("change",dJ(this,ph,pm))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",dJ(this,ph,pm))}get anchorElement(){var e;return"auto"!==this.anchor?super.anchorElement:null==(e=r4(this))?void 0:e.querySelector("media-audio-track-menu-button")}get mediaAudioTrackList(){return dz(this,pl)}set mediaAudioTrackList(e){dX(this,pl,e),dJ(this,pu,pc).call(this)}get mediaAudioTrackEnabled(){var e;return null!=(e=nd(this,rb.MEDIA_AUDIO_TRACK_ENABLED))?e:""}set mediaAudioTrackEnabled(e){nu(this,rb.MEDIA_AUDIO_TRACK_ENABLED,e)}});let d0=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M11 17H9.5V7H11v10Zm-3-3H6.5v-4H8v4Zm6-5h-1.5v6H14V9Zm3 7h-1.5V8H17v8Z"/>
  <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Zm-2 0a8 8 0 1 0-16 0 8 8 0 0 0 16 0Z"/>
</svg>`,d1=e=>{let t=rU("Audio");e.setAttribute("aria-label",t)};class d2 extends dj{static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_AUDIO_TRACK_ENABLED,rb.MEDIA_AUDIO_TRACK_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),d1(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===rb.MEDIA_LANG&&d1(this)}get invokeTargetElement(){var e;return void 0!=this.invokeTarget?super.invokeTargetElement:null==(e=r4(this))?void 0:e.querySelector("media-audio-track-menu")}get mediaAudioTrackEnabled(){var e;return null!=(e=nd(this,rb.MEDIA_AUDIO_TRACK_ENABLED))?e:""}set mediaAudioTrackEnabled(e){nu(this,rb.MEDIA_AUDIO_TRACK_ENABLED,e)}}d2.getSlotTemplateHTML=function(){return`
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${d0}</slot>
  `},d2.getTooltipContentHTML=function(){return rU("Audio")},rz.customElements.get("media-audio-track-menu-button")||rz.customElements.define("media-audio-track-menu-button",d2);var d3=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},d4=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},d5=(e,t,i)=>(d3(e,t,"access private method"),i);let d9=`
  <svg aria-hidden="true" viewBox="0 0 26 24" part="captions-indicator indicator">
    <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
  </svg>`;class d8 extends dM{constructor(){super(...arguments),d4(this,pv),d4(this,pg),d4(this,pp,void 0)}static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_SUBTITLES_LIST,rb.MEDIA_SUBTITLES_SHOWING]}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===rb.MEDIA_SUBTITLES_LIST&&t!==i?d5(this,pv,pb).call(this):e===rb.MEDIA_SUBTITLES_SHOWING&&t!==i&&(this.value=i||"",d5(this,pv,pb).call(this))}connectedCallback(){super.connectedCallback(),this.addEventListener("change",d5(this,pg,pf))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",d5(this,pg,pf))}get anchorElement(){return"auto"!==this.anchor?super.anchorElement:r4(this).querySelector("media-captions-menu-button")}get mediaSubtitlesList(){return d6(this,rb.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(e){d7(this,rb.MEDIA_SUBTITLES_LIST,e)}get mediaSubtitlesShowing(){return d6(this,rb.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(e){d7(this,rb.MEDIA_SUBTITLES_SHOWING,e)}}pp=new WeakMap,pv=new WeakSet,pb=function(){var e,t,i,a,r,n;let s=(d3(this,t=pp,"read from private field"),(i?i.call(this):t.get(this))!==JSON.stringify(this.mediaSubtitlesList)),o=this.value!==this.getAttribute(rb.MEDIA_SUBTITLES_SHOWING);if(!s&&!o)return;a=pp,r=JSON.stringify(this.mediaSubtitlesList),d3(this,a,"write to private field"),n?n.call(this,r):a.set(this,r),this.defaultSlot.textContent="";let l=!this.value,d=dS({type:"radio",text:this.formatMenuItemText(rU("Off")),value:"off",checked:l});for(let t of(d.prepend(dI(this,"checked-indicator")),this.defaultSlot.append(d),this.mediaSubtitlesList)){let i=dS({type:"radio",text:this.formatMenuItemText(t.label,t),value:nH(t),checked:this.value==nH(t)});i.prepend(dI(this,"checked-indicator")),"captions"===(null!=(e=t.kind)?e:"subs")&&i.append(dI(this,"captions-indicator")),this.defaultSlot.append(i)}},pg=new WeakSet,pf=function(){let e=this.mediaSubtitlesShowing,t=this.getAttribute(rb.MEDIA_SUBTITLES_SHOWING),i=this.value!==t;if((null==e?void 0:e.length)&&i&&this.dispatchEvent(new rz.CustomEvent(rh.MEDIA_DISABLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0,detail:e})),!this.value||!i)return;let a=new rz.CustomEvent(rh.MEDIA_SHOW_SUBTITLES_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(a)},d8.getTemplateHTML=function(e){return`
    ${dM.getTemplateHTML(e)}
    <slot name="captions-indicator" hidden>${d9}</slot>
  `};let d6=(e,t)=>{let i=e.getAttribute(t);return i?nU(i):[]},d7=(e,t,i)=>{if(!(null==i?void 0:i.length))return void e.removeAttribute(t);let a=nW(i);e.getAttribute(t)!==a&&e.setAttribute(t,a)};rz.customElements.get("media-captions-menu")||rz.customElements.define("media-captions-menu",d8);let ue=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
</svg>`,ut=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z"/>
</svg>`,ui=e=>{e.setAttribute("data-captions-enabled",nF(e).toString())},ua=e=>{e.setAttribute("aria-label",rU("closed captions"))};class ur extends dj{static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_SUBTITLES_LIST,rb.MEDIA_SUBTITLES_SHOWING,rb.MEDIA_LANG]}connectedCallback(){super.connectedCallback(),ua(this),ui(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===rb.MEDIA_SUBTITLES_SHOWING?ui(this):e===rb.MEDIA_LANG&&ua(this)}get invokeTargetElement(){var e;return void 0!=this.invokeTarget?super.invokeTargetElement:null==(e=r4(this))?void 0:e.querySelector("media-captions-menu")}get mediaSubtitlesList(){return un(this,rb.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(e){us(this,rb.MEDIA_SUBTITLES_LIST,e)}get mediaSubtitlesShowing(){return un(this,rb.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(e){us(this,rb.MEDIA_SUBTITLES_SHOWING,e)}}ur.getSlotTemplateHTML=function(){return`
    <style>
      :host([data-captions-enabled="true"]) slot[name=off] {
        display: none !important;
      }

      
      :host(:not([data-captions-enabled="true"])) slot[name=on] {
        display: none !important;
      }

      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="on">${ue}</slot>
      <slot name="off">${ut}</slot>
    </slot>
  `},ur.getTooltipContentHTML=function(){return rU("Captions")};let un=(e,t)=>{let i=e.getAttribute(t);return i?nU(i):[]},us=(e,t,i)=>{if(!(null==i?void 0:i.length))return void e.removeAttribute(t);let a=nW(i);e.getAttribute(t)!==a&&e.setAttribute(t,a)};rz.customElements.get("media-captions-menu-button")||rz.customElements.define("media-captions-menu-button",ur);var uo=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},ul=(e,t,i)=>(uo(e,t,"read from private field"),i?i.call(e):t.get(e)),ud=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},uu=(e,t,i)=>(uo(e,t,"access private method"),i);let uc="rates";pE=new WeakMap,py=new WeakSet,p_=function(){this.defaultSlot.textContent="";let e=this.mediaPlaybackRate,t=new Set(Array.from(ul(this,pE)).map(e=>Number(e)));for(let i of(e>0&&!t.has(e)&&t.add(e),Array.from(t).sort((e,t)=>e-t))){let t=dS({type:"radio",text:this.formatMenuItemText(`${i}x`,i),value:i.toString(),checked:e===i});t.prepend(dI(this,"checked-indicator")),this.defaultSlot.append(t)}},pT=new WeakSet,pA=function(){if(!this.value)return;let e=new rz.CustomEvent(rh.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(e)},rz.customElements.get("media-playback-rate-menu")||rz.customElements.define("media-playback-rate-menu",class extends dM{constructor(){super(),ud(this,py),ud(this,pT),ud(this,pE,new nN(this,uc,{defaultValue:le})),uu(this,py,p_).call(this)}static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_PLAYBACK_RATE,uc]}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===rb.MEDIA_PLAYBACK_RATE&&t!=i?(this.value=i,uu(this,py,p_).call(this)):e===uc&&t!=i&&(ul(this,pE).value=i,uu(this,py,p_).call(this))}connectedCallback(){super.connectedCallback(),this.addEventListener("change",uu(this,pT,pA))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",uu(this,pT,pA))}get anchorElement(){return"auto"!==this.anchor?super.anchorElement:r4(this).querySelector("media-playback-rate-menu-button")}get rates(){return ul(this,pE)}set rates(e){e?Array.isArray(e)?ul(this,pE).value=e.join(" "):"string"==typeof e&&(ul(this,pE).value=e):ul(this,pE).value="",uu(this,py,p_).call(this)}get mediaPlaybackRate(){return nn(this,rb.MEDIA_PLAYBACK_RATE,1)}set mediaPlaybackRate(e){ns(this,rb.MEDIA_PLAYBACK_RATE,e)}});class uh extends dj{static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_PLAYBACK_RATE]}constructor(){var e;super(),this.container=this.shadowRoot.querySelector('slot[name="icon"]'),this.container.innerHTML=`${null!=(e=this.mediaPlaybackRate)?e:1}x`}attributeChangedCallback(e,t,i){if(super.attributeChangedCallback(e,t,i),e===rb.MEDIA_PLAYBACK_RATE){let e=i?+i:NaN,t=Number.isNaN(e)?1:e;this.container.innerHTML=`${t}x`,this.setAttribute("aria-label",rU("Playback rate {playbackRate}",{playbackRate:t}))}}get invokeTargetElement(){return void 0!=this.invokeTarget?super.invokeTargetElement:r4(this).querySelector("media-playback-rate-menu")}get mediaPlaybackRate(){return nn(this,rb.MEDIA_PLAYBACK_RATE,1)}set mediaPlaybackRate(e){ns(this,rb.MEDIA_PLAYBACK_RATE,e)}}uh.getSlotTemplateHTML=function(e){return`
    <style>
      :host {
        min-width: 5ch;
        padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
      }
      
      :host([aria-expanded="true"]) slot {
        display: block;
      }

      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${e.mediaplaybackrate||1}x</slot>
  `},uh.getTooltipContentHTML=function(){return rU("Playback rate")},rz.customElements.get("media-playback-rate-menu-button")||rz.customElements.define("media-playback-rate-menu-button",uh);var um=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},up=(e,t,i)=>(um(e,t,"read from private field"),i?i.call(e):t.get(e)),uv=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},ub=(e,t,i,a)=>(um(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),ug=(e,t,i)=>(um(e,t,"access private method"),i);pk=new WeakMap,pw=new WeakMap,pS=new WeakSet,pI=function(){let e,t=!this.mediaRenditionSelected;if(up(this,pw).mediaRenditionList===JSON.stringify(this.mediaRenditionList)&&up(this,pw).mediaHeight===this.mediaHeight&&up(this,pw).mediaWidth===this.mediaWidth&&up(this,pw).isAuto===t)return;up(this,pw).mediaRenditionList=JSON.stringify(this.mediaRenditionList),up(this,pw).mediaHeight=this.mediaHeight,up(this,pw).mediaWidth=this.mediaWidth,up(this,pw).isAuto=t;let i=this.mediaRenditionList.sort(this.compareRendition.bind(this)),a=i.find(e=>e.id===this.mediaRenditionSelected);for(let e of i)e.selected=e===a;for(let e of(this.defaultSlot.textContent="",i)){let i=dS({type:"radio",text:this.formatRendition(e,{showBitrate:this.showRenditionBitrate(e)}),value:`${e.id}`,checked:e.selected&&!t});i.prepend(dI(this,"checked-indicator")),this.defaultSlot.append(i)}let r=a&&this.showRenditionBitrate(a);t&&(a?e=this.formatMenuItemText(`${rU("Auto")} \u2022 ${this.formatRendition(a,{showBitrate:r})}`,a):this.mediaHeight>0&&this.mediaWidth>0&&(e=this.formatMenuItemText(`${rU("Auto")} (${Math.min(this.mediaWidth,this.mediaHeight)}p)`))),e||(e=this.formatMenuItemText(rU("Auto")));let n=dS({type:"radio",text:e,value:"auto",checked:t});n.dataset.description=e,n.prepend(dI(this,"checked-indicator")),this.defaultSlot.append(n)},pR=new WeakSet,pC=function(){if(null==this.value)return;let e=new rz.CustomEvent(rh.MEDIA_RENDITION_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(e)},rz.customElements.get("media-rendition-menu")||rz.customElements.define("media-rendition-menu",class extends dM{constructor(){super(...arguments),uv(this,pS),uv(this,pR),uv(this,pk,[]),uv(this,pw,{})}static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_RENDITION_LIST,rb.MEDIA_RENDITION_SELECTED,rb.MEDIA_RENDITION_UNAVAILABLE,rb.MEDIA_HEIGHT,rb.MEDIA_WIDTH]}static formatMenuItemText(e,t){return super.formatMenuItemText(e,t)}static formatRendition(e,{showBitrate:t=!1}={}){let i=`${Math.min(e.width,e.height)}p`;if(t&&e.bitrate){let t=e.bitrate/1e6,a=`${t.toFixed(+(t<1))} Mbps`;return`${i} (${a})`}return this.formatMenuItemText(i,e)}static compareRendition(e,t){var i,a;return t.height===e.height?(null!=(i=t.bitrate)?i:0)-(null!=(a=e.bitrate)?a:0):t.height-e.height}attributeChangedCallback(e,t,i){if(super.attributeChangedCallback(e,t,i),t!==i)switch(e){case rb.MEDIA_RENDITION_SELECTED:this.value=null!=i?i:"auto",ug(this,pS,pI).call(this);break;case rb.MEDIA_RENDITION_LIST:ub(this,pk,null==i?void 0:i.split(/\s+/).map(rC)),ug(this,pS,pI).call(this);break;case rb.MEDIA_HEIGHT:case rb.MEDIA_WIDTH:ug(this,pS,pI).call(this)}}connectedCallback(){super.connectedCallback(),this.addEventListener("change",ug(this,pR,pC))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",ug(this,pR,pC))}get anchorElement(){return"auto"!==this.anchor?super.anchorElement:r4(this).querySelector("media-rendition-menu-button")}get mediaRenditionList(){return up(this,pk)}set mediaRenditionList(e){ub(this,pk,e),ug(this,pS,pI).call(this)}get mediaRenditionSelected(){return nd(this,rb.MEDIA_RENDITION_SELECTED)}set mediaRenditionSelected(e){nu(this,rb.MEDIA_RENDITION_SELECTED,e)}get mediaHeight(){return nn(this,rb.MEDIA_HEIGHT)}set mediaHeight(e){ns(this,rb.MEDIA_HEIGHT,e)}get mediaWidth(){return nn(this,rb.MEDIA_WIDTH)}set mediaWidth(e){ns(this,rb.MEDIA_WIDTH,e)}compareRendition(e,t){return this.constructor.compareRendition(e,t)}formatMenuItemText(e,t){return this.constructor.formatMenuItemText(e,t)}formatRendition(e,t){return this.constructor.formatRendition(e,t)}showRenditionBitrate(e){return this.mediaRenditionList.some(t=>t!==e&&t.height===e.height&&t.bitrate!==e.bitrate)}});let uf=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M13.5 2.5h2v6h-2v-2h-11v-2h11v-2Zm4 2h4v2h-4v-2Zm-12 4h2v6h-2v-2h-3v-2h3v-2Zm4 2h12v2h-12v-2Zm1 4h2v6h-2v-2h-8v-2h8v-2Zm4 2h7v2h-7v-2Z" />
</svg>`;class uE extends dj{static get observedAttributes(){return[...super.observedAttributes,rb.MEDIA_RENDITION_SELECTED,rb.MEDIA_RENDITION_UNAVAILABLE,rb.MEDIA_HEIGHT]}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-label",rU("quality"))}get invokeTargetElement(){return void 0!=this.invokeTarget?super.invokeTargetElement:r4(this).querySelector("media-rendition-menu")}get mediaRenditionSelected(){return nd(this,rb.MEDIA_RENDITION_SELECTED)}set mediaRenditionSelected(e){nu(this,rb.MEDIA_RENDITION_SELECTED,e)}get mediaHeight(){return nn(this,rb.MEDIA_HEIGHT)}set mediaHeight(e){ns(this,rb.MEDIA_HEIGHT,e)}}uE.getSlotTemplateHTML=function(){return`
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${uf}</slot>
  `},uE.getTooltipContentHTML=function(){return rU("Quality")},rz.customElements.get("media-rendition-menu-button")||rz.customElements.define("media-rendition-menu-button",uE);var uy=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},u_=(e,t,i)=>(uy(e,t,"read from private field"),i?i.call(e):t.get(e)),uT=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},uA=(e,t,i,a)=>(uy(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),uk=(e,t,i)=>(uy(e,t,"access private method"),i);class uw extends dM{constructor(){super(),uT(this,pM),uT(this,px),uT(this,pN),uT(this,pU),uT(this,pW),uT(this,pL,!1),uT(this,pH,e=>{let t=e.target,i=(null==t?void 0:t.nodeName)==="VIDEO",a=uk(this,pU,pB).call(this,t);(i||a)&&(u_(this,pL)?uk(this,px,pP).call(this):uk(this,pW,p$).call(this,e))}),uT(this,pq,e=>{let t=e.target,i=this.contains(t),a=2===e.button,r=(null==t?void 0:t.nodeName)==="VIDEO",n=uk(this,pU,pB).call(this,t);i||a&&(r||n)||uk(this,px,pP).call(this)}),uT(this,pV,e=>{"Escape"===e.key&&uk(this,px,pP).call(this)}),uT(this,pF,e=>{var t,i;let a=e.target;if(null==(t=a.matches)?void 0:t.call(a,'button[invoke="copy"]')){let e=null==(i=a.closest("media-context-menu-item"))?void 0:i.querySelector('input[slot="copy"]');e&&navigator.clipboard.writeText(e.value)}uk(this,px,pP).call(this)}),this.setAttribute("noautohide",""),uk(this,pM,pD).call(this)}connectedCallback(){super.connectedCallback(),r4(this).addEventListener("contextmenu",u_(this,pH)),this.addEventListener("click",u_(this,pF))}disconnectedCallback(){super.disconnectedCallback(),r4(this).removeEventListener("contextmenu",u_(this,pH)),this.removeEventListener("click",u_(this,pF)),document.removeEventListener("mousedown",u_(this,pq)),document.removeEventListener("keydown",u_(this,pV))}}pL=new WeakMap,pM=new WeakSet,pD=function(){this.hidden=!u_(this,pL)},px=new WeakSet,pP=function(){uA(this,pL,!1),uk(this,pM,pD).call(this)},pN=new WeakSet,pO=function(){document.querySelectorAll("media-context-menu").forEach(e=>{e!==this&&uk(e,px,pP).call(e)})},pU=new WeakSet,pB=function(e){return!!e&&(!!e.hasAttribute("slot")&&"media"===e.getAttribute("slot")||!!(e.nodeName.includes("-")&&e.tagName.includes("-"))&&(e.hasAttribute("src")||e.hasAttribute("poster")||e.hasAttribute("preload")||e.hasAttribute("playsinline")))},pH=new WeakMap,pW=new WeakSet,p$=function(e){e.preventDefault(),uk(this,pN,pO).call(this),uA(this,pL,!0),this.style.position="fixed",this.style.left=`${e.clientX}px`,this.style.top=`${e.clientY}px`,uk(this,pM,pD).call(this),document.addEventListener("mousedown",u_(this,pq),{once:!0}),document.addEventListener("keydown",u_(this,pV),{once:!0})},pq=new WeakMap,pV=new WeakMap,pF=new WeakMap,uw.getTemplateHTML=function(e){return`
      ${dM.getTemplateHTML(e)}
      <style>
        :host {
          --_menu-bg: rgb(20 20 30 / .8);
          background: var(--media-settings-menu-background,
            var(--media-menu-background,
              var(--media-control-background,
                var(--media-secondary-color, var(--_menu-bg)))));
          min-width: var(--media-settings-menu-min-width, 170px);
          border-radius: 2px;
          overflow: hidden;
        }
      </style>
    `},rz.customElements.get("media-context-menu")||rz.customElements.define("media-context-menu",uw);class uS extends dV{}uS.shadowRootOptions={mode:"open"},uS.getTemplateHTML=function(e){return`
    ${dV.getTemplateHTML.call(this,e)}
    <style>
        ::slotted(*) {
            color: var(--media-text-color, white);
            text-decoration: none;
            border: none;
            background: none;
            cursor: pointer;
            padding: 0;
            min-height: var(--media-control-height, 24px);
        }
    </style>
  `},rz.customElements.get("media-context-menu-item")||rz.customElements.define("media-context-menu-item",uS);var uI=e=>{throw TypeError(e)},uR=(e,t,i)=>t.has(e)||uI("Cannot "+i),uC=(e,t,i)=>(uR(e,t,"read from private field"),i?i.call(e):t.get(e)),uL=(e,t,i)=>t.has(e)?uI("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,i),uM=(e,t,i,a)=>(uR(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),uD=(e,t,i)=>(uR(e,t,"access private method"),i),ux=class{addEventListener(){}removeEventListener(){}dispatchEvent(e){return!0}};"u"<typeof DocumentFragment&&(globalThis.DocumentFragment=class extends ux{});var uP,uN,uO,uU,uB,uH,uW,u$,uq,uV,uF,uK,uG,uj,uY,uQ,uz,uZ,uX,uJ,u0,u1,u2,u3,u4,u5,u9,u8,u6,u7,ce,ct,ci,ca,cr,cn,cs,co,cl,cd,cu,cc,ch,cm,cp,cv,cb,cg,cf,cE,cy,c_,cT,cA,ck,cw,cS,cI,cR,cC,cL,cM,cD,cx,cP,cN,cO,cU,cB,cH,cW,c$,cq,cV,cF,cK,cG,cj,cY,cQ,cz,cZ,cX,cJ,c0,c1,c2,c3,c4,c5,c9,c8,c6,c7,he,ht,hi,ha,hr,hn,hs,ho,hl,hd,hu,hc,hh,hm,hp,hv,hb,hg,hf,hE,hy,h_,hT,hA,hk,hw,hS,hI,hR,hC,hL,hM,hD,hx,hP,hN,hO,hU,hB,hH,hW,h$,hq,hV,hF,hK,hG,hj,hY,hQ,hz,hZ,hX,hJ,h0,h1,h2,h3,h4,h5,h9,h8,h6,h7,me,mt,mi,ma,mr,mn,ms,mo,ml,md,mu,mc,mh,mm,mp,mv,mb,mg,mf,mE,my,m_,mT,mA,mk,mw,mS,mI,mR,mC,mL,mM,mD,mx,mP,mN,mO,mU,mB,mH,mW,m$,mq,mV,mF,mK,mG,mj,mY,mQ,mz,mZ,mX,mJ,m0,m1,m2,m3,m4,m5,m9,m8,m6,m7,pe,pt,pi,pa,pr,pn,ps,po,pl,pd,pu,pc,ph,pm,pp,pv,pb,pg,pf,pE,py,p_,pT,pA,pk,pw,pS,pI,pR,pC,pL,pM,pD,px,pP,pN,pO,pU,pB,pH,pW,p$,pq,pV,pF,pK,pG=class extends ux{},pj=class{constructor(e,t={}){uL(this,pK),uM(this,pK,null==t?void 0:t.detail)}get detail(){return uC(this,pK)}initCustomEvent(){}};pK=new WeakMap;var pY={document:{createElement:function(e,t){return new pG}},DocumentFragment,customElements:{get(e){},define(e,t,i){},getName:e=>null,upgrade(e){},whenDefined:e=>Promise.resolve(pG)},CustomEvent:pj,EventTarget:ux,HTMLElement:pG,HTMLVideoElement:class extends ux{}},pQ="u"<typeof window||void 0===globalThis.customElements,pz=pQ?pY:globalThis,pZ=pQ?pY.document:globalThis.document;function pX(e){return e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()}function pJ(e){return e.replace(/[-_]([a-z])/g,(e,t)=>t.toUpperCase())}function p0(e){if(null==e)return;let t=+e;return Number.isNaN(t)?void 0:t}function p1(e){let t=(function(e){let t={};for(let i in e)null!=e[i]&&(t[i]=e[i]);return new URLSearchParams(t)})(e).toString();return t?"?"+t:""}var p2,p3,p4,p5=(e,t)=>!!e&&!!t&&(!!e.contains(t)||p5(e,t.getRootNode().host)),p9="mux.com",p8=(()=>{try{return"3.13.0"}catch{}return"UNKNOWN"})(),p6=e=>{if(e){if([tK,tF].includes(e))return e;if(null!=e&&e.includes("live"))return tK}},p7={crossorigin:"crossOrigin",playsinline:"playsInline"},ve=class{constructor(e,t){uL(this,p2),uL(this,p3),uL(this,p4,[]),uM(this,p2,e),uM(this,p3,t)}[Symbol.iterator](){return uC(this,p4).values()}get length(){return uC(this,p4).length}get value(){var e;return null!=(e=uC(this,p4).join(" "))?e:""}set value(e){var t;e!==this.value&&(uM(this,p4,[]),this.add(...null!=(t=null==e?void 0:e.split(" "))?t:[]))}toString(){return this.value}item(e){return uC(this,p4)[e]}values(){return uC(this,p4).values()}keys(){return uC(this,p4).keys()}forEach(e){uC(this,p4).forEach(e)}add(...e){var t,i;e.forEach(e=>{this.contains(e)||uC(this,p4).push(e)}),(""!==this.value||null!=(t=uC(this,p2))&&t.hasAttribute(`${uC(this,p3)}`))&&null!=(i=uC(this,p2))&&i.setAttribute(`${uC(this,p3)}`,`${this.value}`)}remove(...e){var t;e.forEach(e=>{uC(this,p4).splice(uC(this,p4).indexOf(e),1)}),null==(t=uC(this,p2))||t.setAttribute(`${uC(this,p3)}`,`${this.value}`)}contains(e){return uC(this,p4).includes(e)}toggle(e,t){return void 0!==t?t?(this.add(e),!0):(this.remove(e),!1):this.contains(e)?(this.remove(e),!1):(this.add(e),!0)}replace(e,t){this.remove(e),this.add(t)}};p2=new WeakMap,p3=new WeakMap,p4=new WeakMap;var vt=`[mux-player ${p8}]`;function vi(...e){console.warn(vt,...e)}function va(...e){console.error(vt,...e)}function vr(e){var t;let i=null!=(t=e.message)?t:"";e.context&&(i+=` ${e.context}`),e.file&&(i+=` ${ia("Read more: ")}
https://github.com/muxinc/elements/blob/main/errors/${e.file}`),vi(i)}var vn={AUTOPLAY:"autoplay",CROSSORIGIN:"crossorigin",LOOP:"loop",MUTED:"muted",PLAYSINLINE:"playsinline",PRELOAD:"preload"},vs={VOLUME:"volume",PLAYBACKRATE:"playbackrate",MUTED:"muted"},vo=Object.freeze({length:0,start(e){let t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'start' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0},end(e){let t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'end' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0}}),vl=[...Object.values(vn).filter(e=>vn.PLAYSINLINE!==e),...Object.values(vs)];function vd(e,t){return e.media?e.media.getAttribute(t):e.getAttribute(t)}var vu=class extends pz.HTMLElement{static get observedAttributes(){return vl}constructor(){super()}attributeChangedCallback(e,t,i){var a,r;switch(e){case vs.MUTED:this.media&&(this.media.muted=null!=i,this.media.defaultMuted=null!=i);return;case vs.VOLUME:{let e=null!=(a=p0(i))?a:1;this.media&&(this.media.volume=e);return}case vs.PLAYBACKRATE:{let e=null!=(r=p0(i))?r:1;this.media&&(this.media.playbackRate=e,this.media.defaultPlaybackRate=e);return}}}play(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.play())?t:Promise.reject()}pause(){var e;null==(e=this.media)||e.pause()}load(){var e;null==(e=this.media)||e.load()}get media(){var e;return null==(e=this.shadowRoot)?void 0:e.querySelector("mux-video")}get audioTracks(){return this.media.audioTracks}get videoTracks(){return this.media.videoTracks}get audioRenditions(){return this.media.audioRenditions}get videoRenditions(){return this.media.videoRenditions}get paused(){var e,t;return null==(t=null==(e=this.media)?void 0:e.paused)||t}get duration(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.duration)?t:NaN}get ended(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.ended)&&t}get buffered(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.buffered)?t:vo}get seekable(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.seekable)?t:vo}get readyState(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.readyState)?t:0}get videoWidth(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.videoWidth)?t:0}get videoHeight(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.videoHeight)?t:0}get currentSrc(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.currentSrc)?t:""}get currentTime(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.currentTime)?t:0}set currentTime(e){this.media&&(this.media.currentTime=Number(e))}get volume(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.volume)?t:1}set volume(e){this.media&&(this.media.volume=Number(e))}get playbackRate(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.playbackRate)?t:1}set playbackRate(e){this.media&&(this.media.playbackRate=Number(e))}get defaultPlaybackRate(){var e;return null!=(e=p0(this.getAttribute(vs.PLAYBACKRATE)))?e:1}set defaultPlaybackRate(e){null!=e?this.setAttribute(vs.PLAYBACKRATE,`${e}`):this.removeAttribute(vs.PLAYBACKRATE)}get crossOrigin(){return vd(this,vn.CROSSORIGIN)}set crossOrigin(e){this.setAttribute(vn.CROSSORIGIN,`${e}`)}get autoplay(){return null!=vd(this,vn.AUTOPLAY)}set autoplay(e){e?this.setAttribute(vn.AUTOPLAY,"string"==typeof e?e:""):this.removeAttribute(vn.AUTOPLAY)}get loop(){return null!=vd(this,vn.LOOP)}set loop(e){e?this.setAttribute(vn.LOOP,""):this.removeAttribute(vn.LOOP)}get muted(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.muted)&&t}set muted(e){this.media&&(this.media.muted=!!e)}get defaultMuted(){return null!=vd(this,vn.MUTED)}set defaultMuted(e){e?this.setAttribute(vn.MUTED,""):this.removeAttribute(vn.MUTED)}get playsInline(){return null!=vd(this,vn.PLAYSINLINE)}set playsInline(e){va("playsInline is set to true by default and is not currently supported as a setter.")}get preload(){return this.media?this.media.preload:this.getAttribute("preload")}set preload(e){["","none","metadata","auto"].includes(e)?this.setAttribute(vn.PRELOAD,e):this.removeAttribute(vn.PRELOAD)}},vc=`:host {
  --media-control-display: var(--controls);
  --media-loading-indicator-display: var(--loading-indicator);
  --media-dialog-display: var(--dialog);
  --media-play-button-display: var(--play-button);
  --media-live-button-display: var(--live-button);
  --media-seek-backward-button-display: var(--seek-backward-button);
  --media-seek-forward-button-display: var(--seek-forward-button);
  --media-mute-button-display: var(--mute-button);
  --media-captions-button-display: var(--captions-button);
  --media-captions-menu-button-display: var(--captions-menu-button, var(--media-captions-button-display));
  --media-rendition-menu-button-display: var(--rendition-menu-button);
  --media-audio-track-menu-button-display: var(--audio-track-menu-button);
  --media-airplay-button-display: var(--airplay-button);
  --media-pip-button-display: var(--pip-button);
  --media-fullscreen-button-display: var(--fullscreen-button);
  --media-cast-button-display: var(--cast-button, var(--_cast-button-drm-display));
  --media-playback-rate-button-display: var(--playback-rate-button);
  --media-playback-rate-menu-button-display: var(--playback-rate-menu-button);
  --media-volume-range-display: var(--volume-range);
  --media-time-range-display: var(--time-range);
  --media-time-display-display: var(--time-display);
  --media-duration-display-display: var(--duration-display);
  --media-title-display-display: var(--title-display);

  display: inline-block;
  line-height: 0;
  width: 100%;
}

a {
  color: #fff;
  font-size: 0.9em;
  text-decoration: underline;
}

media-theme {
  display: inline-block;
  line-height: 0;
  width: 100%;
  height: 100%;
  direction: ltr;
}

media-poster-image {
  display: inline-block;
  line-height: 0;
  width: 100%;
  height: 100%;
}

media-poster-image:not([src]):not([placeholdersrc]) {
  display: none;
}

::part(top),
[part~='top'] {
  --media-control-display: var(--controls, var(--top-controls));
  --media-play-button-display: var(--play-button, var(--top-play-button));
  --media-live-button-display: var(--live-button, var(--top-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--top-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--top-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--top-mute-button));
  --media-captions-button-display: var(--captions-button, var(--top-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--top-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--top-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--top-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--top-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--top-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--top-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--top-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--top-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --captions-menu-button,
    var(--media-playback-rate-button-display, var(--top-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--top-volume-range));
  --media-time-range-display: var(--time-range, var(--top-time-range));
  --media-time-display-display: var(--time-display, var(--top-time-display));
  --media-duration-display-display: var(--duration-display, var(--top-duration-display));
  --media-title-display-display: var(--title-display, var(--top-title-display));
}

::part(center),
[part~='center'] {
  --media-control-display: var(--controls, var(--center-controls));
  --media-play-button-display: var(--play-button, var(--center-play-button));
  --media-live-button-display: var(--live-button, var(--center-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--center-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--center-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--center-mute-button));
  --media-captions-button-display: var(--captions-button, var(--center-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--center-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--center-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--center-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--center-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--center-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--center-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--center-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--center-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --playback-rate-menu-button,
    var(--media-playback-rate-button-display, var(--center-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--center-volume-range));
  --media-time-range-display: var(--time-range, var(--center-time-range));
  --media-time-display-display: var(--time-display, var(--center-time-display));
  --media-duration-display-display: var(--duration-display, var(--center-duration-display));
}

::part(bottom),
[part~='bottom'] {
  --media-control-display: var(--controls, var(--bottom-controls));
  --media-play-button-display: var(--play-button, var(--bottom-play-button));
  --media-live-button-display: var(--live-button, var(--bottom-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--bottom-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--bottom-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--bottom-mute-button));
  --media-captions-button-display: var(--captions-button, var(--bottom-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--bottom-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--bottom-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--bottom-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--bottom-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--bottom-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--bottom-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--bottom-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--bottom-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --playback-rate-menu-button,
    var(--media-playback-rate-button-display, var(--bottom-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--bottom-volume-range));
  --media-time-range-display: var(--time-range, var(--bottom-time-range));
  --media-time-display-display: var(--time-display, var(--bottom-time-display));
  --media-duration-display-display: var(--duration-display, var(--bottom-duration-display));
  --media-title-display-display: var(--title-display, var(--bottom-title-display));
}

:host([no-tooltips]) {
  --media-tooltip-display: none;
}
`,vh=new WeakMap,vm=class e{constructor(e,t){this.element=e,this.type=t,this.element.addEventListener(this.type,this);let i=vh.get(this.element);i&&i.set(this.type,this)}set(e){if("function"==typeof e)this.handleEvent=e.bind(this.element);else if("object"==typeof e&&"function"==typeof e.handleEvent)this.handleEvent=e.handleEvent.bind(e);else{this.element.removeEventListener(this.type,this);let e=vh.get(this.element);e&&e.delete(this.type)}}static for(t){vh.has(t.element)||vh.set(t.element,new Map);let i=t.attributeName.slice(2),a=vh.get(t.element);return a&&a.has(i)?a.get(i):new e(t.element,i)}},vp=new Map,vv=new WeakMap,vb=new WeakMap,vg=class{constructor(e,t,i){this.strings=e,this.values=t,this.processor=i,this.stringsKey=this.strings.join("\x01")}get template(){if(vp.has(this.stringsKey))return vp.get(this.stringsKey);{let e=pZ.createElement("template"),t=this.strings.length-1;return e.innerHTML=this.strings.reduce((e,i,a)=>e+i+(a<t?`{{ ${a} }}`:""),""),vp.set(this.stringsKey,e),e}}renderInto(e){var t;let i=this.template;if(vv.get(e)!==i){vv.set(e,i);let t=new lz(i,this.values,this.processor);vb.set(e,t),e instanceof l4?e.replace(...t.children):e.appendChild(t);return}let a=vb.get(e);null==(t=null==a?void 0:a.update)||t.call(a,this.values)}},vf={processCallback(e,t,i){var a;if(i)for(let[e,r]of t)e in i&&function(e,t){(function(e,t){if(e instanceof l3&&t instanceof Element){let i=e.element;return i[e.attributeName]!==t&&(e.element.removeAttributeNS(e.attributeNamespace,e.attributeName),i[e.attributeName]=t),!0}return!1})(e,t)||function(e,t){if("boolean"==typeof t&&e instanceof l3){let i=e.attributeNamespace;return t!==e.element.hasAttributeNS(i,e.attributeName)&&(e.booleanValue=t),!0}return!1}(e,t)||e instanceof l3&&e.attributeName.startsWith("on")&&(vm.for(e).set(t),e.element.removeAttributeNS(e.attributeNamespace,e.attributeName),1)||!1===t&&e instanceof l4&&(e.replace(""),1)||t instanceof vg&&e instanceof l4&&(t.renderInto(e),1)||t instanceof DocumentFragment&&e instanceof l4&&(t.childNodes.length&&e.replace(...t.childNodes),1)||function(e,t){if(e instanceof l3){let i=e.attributeNamespace,a=e.element.getAttributeNS(i,e.attributeName);return String(t)!==a&&(e.value=String(t))}e.value=String(t)}(e,t)}(r,null!=(a=i[e])?a:"")}};function vE(e,...t){return new vg(e,t,vf)}var vy=Object.values({TOP:"top",CENTER:"center",BOTTOM:"bottom",LAYER:"layer",MEDIA_LAYER:"media-layer",POSTER_LAYER:"poster-layer",VERTICAL_LAYER:"vertical-layer",CENTERED_LAYER:"centered-layer",GESTURE_LAYER:"gesture-layer",CONTROLLER_LAYER:"controller",BUTTON:"button",RANGE:"range",THUMB:"thumb",DISPLAY:"display",CONTROL_BAR:"control-bar",MENU_BUTTON:"menu-button",MENU:"menu",MENU_ITEM:"menu-item",OPTION:"option",POSTER:"poster",LIVE:"live",PLAY:"play",PRE_PLAY:"pre-play",SEEK_BACKWARD:"seek-backward",SEEK_FORWARD:"seek-forward",MUTE:"mute",CAPTIONS:"captions",AIRPLAY:"airplay",PIP:"pip",FULLSCREEN:"fullscreen",CAST:"cast",PLAYBACK_RATE:"playback-rate",VOLUME:"volume",TIME:"time",TITLE:"title",AUDIO_TRACK:"audio-track",RENDITION:"rendition"}).join(", "),v_=e=>e.charAt(0).toUpperCase()+e.slice(1),vT=(e,t)=>{let i=(e=>{if(e.muxCode){if(2403210===e.muxCode)return"403-expired-token.md";if(2412202===e.muxCode)return"403-malformatted-token.md";if([2403222,2403221].includes(e.muxCode))return"403-incorrect-aud-value.md";if(2403232===e.muxCode)return"403-playback-id-mismatch.md";if(2403201===e.muxCode)return"missing-signed-tokens.md";if(2404e3===e.muxCode)return"404-not-found.md";if(2412e3===e.muxCode)return"412-not-playable.md"}if(e.code){if(e.code===t$.MEDIA_ERR_NETWORK)return"";if(e.code===t$.MEDIA_ERR_DECODE)return"media-decode-error.md";if(e.code===t$.MEDIA_ERR_SRC_NOT_SUPPORTED)return"media-src-not-supported.md"}return""})(e);return{message:e.message,context:e.context,file:i}},vA=`<template id="media-theme-gerwig">
  <style>
    @keyframes pre-play-hide {
      0% {
        transform: scale(1);
        opacity: 1;
      }

      30% {
        transform: scale(0.7);
      }

      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }

    :host {
      --_primary-color: var(--media-primary-color, #fff);
      --_secondary-color: var(--media-secondary-color, transparent);
      --_accent-color: var(--media-accent-color, #fa50b5);
      --_text-color: var(--media-text-color, #000);

      --media-icon-color: var(--_primary-color);
      --media-control-background: var(--_secondary-color);
      --media-control-hover-background: var(--_accent-color);
      --media-time-buffered-color: rgba(255, 255, 255, 0.4);
      --media-preview-time-text-shadow: none;
      --media-control-height: 14px;
      --media-control-padding: 6px;
      --media-tooltip-container-margin: 6px;
      --media-tooltip-distance: 18px;

      color: var(--_primary-color);
      display: inline-block;
      width: 100%;
      height: 100%;
    }

    :host([audio]) {
      --_secondary-color: var(--media-secondary-color, black);
      --media-preview-time-text-shadow: none;
    }

    :host([audio]) ::slotted([slot='media']) {
      height: 0px;
    }

    :host([audio]) media-loading-indicator {
      display: none;
    }

    :host([audio]) media-controller {
      background: transparent;
    }

    :host([audio]) media-controller::part(vertical-layer) {
      background: transparent;
    }

    :host([audio]) media-control-bar {
      width: 100%;
      background-color: var(--media-control-background);
    }

    /*
     * 0.433s is the transition duration for VTT Regions.
     * Borrowed here, so the captions don't move too fast.
     */
    media-controller {
      --media-webkit-text-track-transform: translateY(0) scale(0.98);
      --media-webkit-text-track-transition: transform 0.433s ease-out 0.3s;
    }
    media-controller:is([mediapaused], :not([userinactive])) {
      --media-webkit-text-track-transform: translateY(-50px) scale(0.98);
      --media-webkit-text-track-transition: transform 0.15s ease;
    }

    /*
     * CSS specific to iOS devices.
     * See: https://stackoverflow.com/questions/30102792/css-media-query-to-target-only-ios-devices/60220757#60220757
     */
    @supports (-webkit-touch-callout: none) {
      /* Disable subtitle adjusting for iOS Safari */
      media-controller[mediaisfullscreen] {
        --media-webkit-text-track-transform: unset;
        --media-webkit-text-track-transition: unset;
      }
    }

    media-time-range {
      --media-box-padding-left: 6px;
      --media-box-padding-right: 6px;
      --media-range-bar-color: var(--_accent-color);
      --media-time-range-buffered-color: var(--_primary-color);
      --media-range-track-color: transparent;
      --media-range-track-background: rgba(255, 255, 255, 0.4);
      --media-range-thumb-background: radial-gradient(
        circle,
        #000 0%,
        #000 25%,
        var(--_accent-color) 25%,
        var(--_accent-color)
      );
      --media-range-thumb-width: 12px;
      --media-range-thumb-height: 12px;
      --media-range-thumb-transform: scale(0);
      --media-range-thumb-transition: transform 0.3s;
      --media-range-thumb-opacity: 1;
      --media-preview-background: var(--_primary-color);
      --media-box-arrow-background: var(--_primary-color);
      --media-preview-thumbnail-border: 5px solid var(--_primary-color);
      --media-preview-border-radius: 5px;
      --media-text-color: var(--_text-color);
      --media-control-hover-background: transparent;
      --media-preview-chapter-text-shadow: none;
      color: var(--_accent-color);
      padding: 0 6px;
    }

    :host([audio]) media-time-range {
      --media-preview-time-padding: 1.5px 6px;
      --media-preview-box-margin: 0 0 -5px;
    }

    media-time-range:hover {
      --media-range-thumb-transform: scale(1);
    }

    media-preview-thumbnail {
      border-bottom-width: 0;
    }

    [part~='menu'] {
      border-radius: 2px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      bottom: 50px;
      padding: 2.5px 10px;
    }

    [part~='menu']::part(indicator) {
      fill: var(--_accent-color);
    }

    [part~='menu']::part(menu-item) {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding: 6px 10px;
      min-height: 34px;
    }

    [part~='menu']::part(checked) {
      font-weight: 700;
    }

    media-captions-menu,
    media-rendition-menu,
    media-audio-track-menu,
    media-playback-rate-menu {
      position: absolute; /* ensure they don't take up space in DOM on load */
      --media-menu-background: var(--_primary-color);
      --media-menu-item-checked-background: transparent;
      --media-text-color: var(--_text-color);
      --media-menu-item-hover-background: transparent;
      --media-menu-item-hover-outline: var(--_accent-color) solid 1px;
    }

    media-rendition-menu {
      min-width: 140px;
    }

    /* The icon is a circle so make it 16px high instead of 14px for more balance. */
    media-audio-track-menu-button {
      --media-control-padding: 5px;
      --media-control-height: 16px;
    }

    media-playback-rate-menu-button {
      --media-control-padding: 6px 3px;
      min-width: 4.4ch;
    }

    media-playback-rate-menu {
      --media-menu-flex-direction: row;
      --media-menu-item-checked-background: var(--_accent-color);
      --media-menu-item-checked-indicator-display: none;
      margin-right: 6px;
      padding: 0;
      --media-menu-gap: 0.25em;
    }

    media-playback-rate-menu[part~='menu']::part(menu-item) {
      padding: 6px 6px 6px 8px;
    }

    media-playback-rate-menu[part~='menu']::part(checked) {
      color: #fff;
    }

    :host(:not([audio])) media-time-range {
      /* Adding px is required here for calc() */
      --media-range-padding: 0px;
      background: transparent;
      z-index: 10;
      height: 10px;
      bottom: -3px;
      width: 100%;
    }

    media-control-bar :is([role='button'], [role='switch'], button) {
      line-height: 0;
    }

    media-control-bar :is([part*='button'], [part*='range'], [part*='display']) {
      border-radius: 3px;
    }

    .spacer {
      flex-grow: 1;
      background-color: var(--media-control-background, rgba(20, 20, 30, 0.7));
    }

    media-control-bar[slot~='top-chrome'] {
      min-height: 42px;
      pointer-events: none;
    }

    media-control-bar {
      --gradient-steps:
        hsl(0 0% 0% / 0) 0%, hsl(0 0% 0% / 0.013) 8.1%, hsl(0 0% 0% / 0.049) 15.5%, hsl(0 0% 0% / 0.104) 22.5%,
        hsl(0 0% 0% / 0.175) 29%, hsl(0 0% 0% / 0.259) 35.3%, hsl(0 0% 0% / 0.352) 41.2%, hsl(0 0% 0% / 0.45) 47.1%,
        hsl(0 0% 0% / 0.55) 52.9%, hsl(0 0% 0% / 0.648) 58.8%, hsl(0 0% 0% / 0.741) 64.7%, hsl(0 0% 0% / 0.825) 71%,
        hsl(0 0% 0% / 0.896) 77.5%, hsl(0 0% 0% / 0.951) 84.5%, hsl(0 0% 0% / 0.987) 91.9%, hsl(0 0% 0%) 100%;
    }

    :host([title]) media-control-bar[slot='top-chrome']::before,
    :host([videotitle]) media-control-bar[slot='top-chrome']::before {
      content: '';
      position: absolute;
      width: 100%;
      padding-bottom: min(100px, 25%);
      background: linear-gradient(to top, var(--gradient-steps));
      opacity: 0.8;
      pointer-events: none;
    }

    :host(:not([audio])) media-control-bar[part~='bottom']::before {
      content: '';
      position: absolute;
      width: 100%;
      bottom: 0;
      left: 0;
      padding-bottom: min(100px, 25%);
      background: linear-gradient(to bottom, var(--gradient-steps));
      opacity: 0.8;
      z-index: 1;
      pointer-events: none;
    }

    media-control-bar[part~='bottom'] > * {
      z-index: 20;
    }

    media-control-bar[part~='bottom'] {
      padding: 6px 6px;
    }

    media-control-bar[slot~='top-chrome'] > * {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      position: relative;
    }

    media-controller::part(vertical-layer) {
      transition: background-color 1s;
    }

    media-controller:is([mediapaused], :not([userinactive]))::part(vertical-layer) {
      background-color: var(--controls-backdrop-color, var(--controls, transparent));
      transition: background-color 0.25s;
    }

    .center-controls {
      --media-button-icon-width: 100%;
      --media-button-icon-height: auto;
      --media-tooltip-display: none;
      pointer-events: none;
      width: 100%;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: center;
      paint-order: stroke;
      stroke: rgba(102, 102, 102, 1);
      stroke-width: 0.3px;
      text-shadow:
        0 0 2px rgb(0 0 0 / 0.25),
        0 0 6px rgb(0 0 0 / 0.25);
    }

    .center-controls media-play-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      --media-control-padding: 0;
      width: 40px;
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
    }

    [breakpointsm] .center-controls media-play-button {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      transition: background 0.4s;
      padding: 24px;
      --media-control-background: #000;
      --media-control-hover-background: var(--_accent-color);
    }

    .center-controls media-seek-backward-button,
    .center-controls media-seek-forward-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      padding: 0;
      margin: 0 20px;
      width: max(33px, min(8%, 40px));
      text-shadow:
        0 0 2px rgb(0 0 0 / 0.25),
        0 0 6px rgb(0 0 0 / 0.25);
    }

    [breakpointsm]:not([audio]) .center-controls.pre-playback {
      display: grid;
      align-items: initial;
      justify-content: initial;
      height: 100%;
      overflow: hidden;
    }

    [breakpointsm]:not([audio]) .center-controls.pre-playback media-play-button {
      place-self: var(--_pre-playback-place, center);
      grid-area: 1 / 1;
      margin: 16px;
    }

    /* Show and hide controls or pre-playback state */

    [breakpointsm]:is([mediahasplayed], :not([mediapaused])):not([audio])
      .center-controls.pre-playback
      media-play-button {
      /* Using \`forwards\` would lead to a laggy UI after the animation got in the end state */
      animation: 0.3s linear pre-play-hide;
      opacity: 0;
      pointer-events: none;
    }

    .autoplay-unmute {
      --media-control-hover-background: transparent;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
    }

    .autoplay-unmute-btn {
      --media-control-height: 16px;
      border-radius: 8px;
      background: #000;
      color: var(--_primary-color);
      display: flex;
      align-items: center;
      padding: 8px 16px;
      font-size: 18px;
      font-weight: 500;
      cursor: pointer;
    }

    .autoplay-unmute-btn:hover {
      background: var(--_accent-color);
    }

    [breakpointsm] .autoplay-unmute-btn {
      --media-control-height: 30px;
      padding: 14px 24px;
      font-size: 26px;
    }

    .autoplay-unmute-btn svg {
      margin: 0 6px 0 0;
    }

    [breakpointsm] .autoplay-unmute-btn svg {
      margin: 0 10px 0 0;
    }

    media-controller:not([audio]):not([mediahasplayed]) *:is(media-control-bar, media-time-range) {
      display: none;
    }

    media-error-dialog:not([mediaerrorcode]) {
      opacity: 0;
    }

    media-loading-indicator {
      --media-loading-icon-width: 100%;
      --media-button-icon-height: auto;
      display: var(--media-control-display, var(--media-loading-indicator-display, flex));
      pointer-events: none;
      position: absolute;
      width: min(15%, 150px);
      flex-flow: row;
      align-items: center;
      justify-content: center;
    }

    /* Intentionally don't target the div for transition but the children
     of the div. Prevents messing with media-chrome's autohide feature. */
    media-loading-indicator + div * {
      transition: opacity 0.15s;
      opacity: 1;
    }

    media-loading-indicator[medialoading]:not([mediapaused]) ~ div > * {
      opacity: 0;
      transition-delay: 400ms;
    }

    media-volume-range {
      width: min(100%, 100px);
      --media-range-padding-left: 10px;
      --media-range-padding-right: 10px;
      --media-range-thumb-width: 12px;
      --media-range-thumb-height: 12px;
      --media-range-thumb-background: radial-gradient(
        circle,
        #000 0%,
        #000 25%,
        var(--_primary-color) 25%,
        var(--_primary-color)
      );
      --media-control-hover-background: none;
    }

    media-time-display {
      white-space: nowrap;
    }

    /* Generic style for explicitly disabled controls */
    media-control-bar[part~='bottom'] [disabled],
    media-control-bar[part~='bottom'] [aria-disabled='true'] {
      opacity: 60%;
      cursor: not-allowed;
    }

    media-text-display {
      --media-font-size: 16px;
      --media-control-padding: 14px;
      font-weight: 500;
    }

    media-play-button.animated *:is(g, path) {
      transition: all 0.3s;
    }

    media-play-button.animated[mediapaused] .pause-icon-pt1 {
      opacity: 0;
    }

    media-play-button.animated[mediapaused] .pause-icon-pt2 {
      transform-origin: center center;
      transform: scaleY(0);
    }

    media-play-button.animated[mediapaused] .play-icon {
      clip-path: inset(0 0 0 0);
    }

    media-play-button.animated:not([mediapaused]) .play-icon {
      clip-path: inset(0 0 0 100%);
    }

    media-seek-forward-button,
    media-seek-backward-button {
      --media-font-weight: 400;
    }

    .mute-icon {
      display: inline-block;
    }

    .mute-icon :is(path, g) {
      transition: opacity 0.5s;
    }

    .muted {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='low'] :is(.volume-medium, .volume-high),
    media-mute-button[mediavolumelevel='medium'] :is(.volume-high) {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='off'] .unmuted {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='off'] .muted {
      opacity: 1;
    }

    /**
     * Our defaults for these buttons are to hide them at small sizes
     * users can override this with CSS
     */
    media-controller:not([breakpointsm]):not([audio]) {
      --bottom-play-button: none;
      --bottom-seek-backward-button: none;
      --bottom-seek-forward-button: none;
      --bottom-time-display: none;
      --bottom-playback-rate-menu-button: none;
      --bottom-pip-button: none;
    }

    [part='mux-badge'] {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 2;
      opacity: 0.6;
      transition:
        opacity 0.2s ease-in-out,
        bottom 0.2s ease-in-out;
    }

    [part='mux-badge']:hover {
      opacity: 1;
    }

    [part='mux-badge'] a {
      font-size: 14px;
      font-family: var(--_font-family);
      color: var(--_primary-color);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    [part='mux-badge'] .mux-badge-text {
      transition: opacity 0.5s ease-in-out;
      opacity: 0;
    }

    [part='mux-badge'] .mux-badge-logo {
      width: 40px;
      height: auto;
      display: inline-block;
    }

    [part='mux-badge'] .mux-badge-logo svg {
      width: 100%;
      height: 100%;
      fill: white;
    }

    media-controller:not([userinactive]):not([mediahasplayed]) [part='mux-badge'],
    media-controller:not([userinactive]) [part='mux-badge'],
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] {
      transition: bottom 0.1s ease-in-out;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] {
      transition: bottom 0.2s ease-in-out 0.62s;
    }

    media-controller:not([userinactive]) [part='mux-badge'] .mux-badge-text,
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] .mux-badge-text {
      opacity: 1;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] .mux-badge-text {
      opacity: 0;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] {
      bottom: 10px;
    }

    media-controller:not([userinactive]):not([mediahasplayed]) [part='mux-badge'] {
      bottom: 10px;
    }

    media-controller:not([userinactive])[mediahasplayed] [part='mux-badge'],
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] {
      bottom: calc(28px + var(--media-control-height, 0px) + var(--media-control-padding, 0px) * 2);
    }
  </style>

  <template partial="TitleDisplay">
    <template if="videotitle">
      <template if="videotitle != true">
        <media-text-display part="top title display" class="title-display">{{videotitle}}</media-text-display>
      </template>
    </template>
    <template if="!videotitle">
      <template if="title">
        <media-text-display part="top title display" class="title-display">{{title}}</media-text-display>
      </template>
    </template>
  </template>

  <template partial="PlayButton">
    <media-play-button
      part="{{section ?? 'bottom'}} play button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      class="animated"
    >
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="icon">
        <g class="play-icon">
          <path
            d="M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z"
          />
        </g>
        <g class="pause-icon">
          <path
            class="pause-icon-pt1"
            d="M5.90709 0H2.96889C2.46857 0 2.06299 0.405585 2.06299 0.9059V13.0941C2.06299 13.5944 2.46857 14 2.96889 14H5.90709C6.4074 14 6.81299 13.5944 6.81299 13.0941V0.9059C6.81299 0.405585 6.4074 0 5.90709 0Z"
          />
          <path
            class="pause-icon-pt2"
            d="M15.1571 0H12.2189C11.7186 0 11.313 0.405585 11.313 0.9059V13.0941C11.313 13.5944 11.7186 14 12.2189 14H15.1571C15.6574 14 16.063 13.5944 16.063 13.0941V0.9059C16.063 0.405585 15.6574 0 15.1571 0Z"
          />
        </g>
      </svg>
    </media-play-button>
  </template>

  <template partial="PrePlayButton">
    <media-play-button
      part="{{section ?? 'center'}} play button pre-play"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="icon" style="transform: translate(3px, 0)">
        <path
          d="M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z"
        />
      </svg>
    </media-play-button>
  </template>

  <template partial="SeekBackwardButton">
    <media-seek-backward-button
      seekoffset="{{backwardseekoffset}}"
      part="{{section ?? 'bottom'}} seek-backward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg viewBox="0 0 22 14" aria-hidden="true" slot="icon">
        <path
          d="M3.65 2.07888L0.0864 6.7279C-0.0288 6.87812 -0.0288 7.12188 0.0864 7.2721L3.65 11.9211C3.7792 12.0896 4 11.9703 4 11.7321V2.26787C4 2.02968 3.7792 1.9104 3.65 2.07888Z"
        />
        <text transform="translate(6 12)" style="font-size: 14px; font-family: 'ArialMT', 'Arial'">
          {{backwardseekoffset}}
        </text>
      </svg>
    </media-seek-backward-button>
  </template>

  <template partial="SeekForwardButton">
    <media-seek-forward-button
      seekoffset="{{forwardseekoffset}}"
      part="{{section ?? 'bottom'}} seek-forward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg viewBox="0 0 22 14" aria-hidden="true" slot="icon">
        <g>
          <text transform="translate(-1 12)" style="font-size: 14px; font-family: 'ArialMT', 'Arial'">
            {{forwardseekoffset}}
          </text>
          <path
            d="M18.35 11.9211L21.9136 7.2721C22.0288 7.12188 22.0288 6.87812 21.9136 6.7279L18.35 2.07888C18.2208 1.91041 18 2.02968 18 2.26787V11.7321C18 11.9703 18.2208 12.0896 18.35 11.9211Z"
          />
        </g>
      </svg>
    </media-seek-forward-button>
  </template>

  <template partial="MuteButton">
    <media-mute-button part="bottom mute button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" slot="icon" class="mute-icon" aria-hidden="true">
        <g class="unmuted">
          <path
            d="M6.76786 1.21233L3.98606 3.98924H1.19937C0.593146 3.98924 0.101743 4.51375 0.101743 5.1607V6.96412L0 6.99998L0.101743 7.03583V8.83926C0.101743 9.48633 0.593146 10.0108 1.19937 10.0108H3.98606L6.76773 12.7877C7.23561 13.2547 8 12.9007 8 12.2171V1.78301C8 1.09925 7.23574 0.745258 6.76786 1.21233Z"
          />
          <path
            class="volume-low"
            d="M10 3.54781C10.7452 4.55141 11.1393 5.74511 11.1393 6.99991C11.1393 8.25471 10.7453 9.44791 10 10.4515L10.7988 11.0496C11.6734 9.87201 12.1356 8.47161 12.1356 6.99991C12.1356 5.52821 11.6735 4.12731 10.7988 2.94971L10 3.54781Z"
          />
          <path
            class="volume-medium"
            d="M12.3778 2.40086C13.2709 3.76756 13.7428 5.35806 13.7428 7.00026C13.7428 8.64246 13.2709 10.233 12.3778 11.5992L13.2106 12.1484C14.2107 10.6185 14.739 8.83796 14.739 7.00016C14.739 5.16236 14.2107 3.38236 13.2106 1.85156L12.3778 2.40086Z"
          />
          <path
            class="volume-high"
            d="M15.5981 0.75L14.7478 1.2719C15.7937 2.9919 16.3468 4.9723 16.3468 7C16.3468 9.0277 15.7937 11.0082 14.7478 12.7281L15.5981 13.25C16.7398 11.3722 17.343 9.211 17.343 7C17.343 4.789 16.7398 2.6268 15.5981 0.75Z"
          />
        </g>
        <g class="muted">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.39976 4.98924H1.19937C1.19429 4.98924 1.17777 4.98961 1.15296 5.01609C1.1271 5.04369 1.10174 5.09245 1.10174 5.1607V8.83926C1.10174 8.90761 1.12714 8.95641 1.15299 8.984C1.17779 9.01047 1.1943 9.01084 1.19937 9.01084H4.39977L7 11.6066V2.39357L4.39976 4.98924ZM7.47434 1.92006C7.4743 1.9201 7.47439 1.92002 7.47434 1.92006V1.92006ZM6.76773 12.7877L3.98606 10.0108H1.19937C0.593146 10.0108 0.101743 9.48633 0.101743 8.83926V7.03583L0 6.99998L0.101743 6.96412V5.1607C0.101743 4.51375 0.593146 3.98924 1.19937 3.98924H3.98606L6.76786 1.21233C7.23574 0.745258 8 1.09925 8 1.78301V12.2171C8 12.9007 7.23561 13.2547 6.76773 12.7877Z"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M15.2677 9.30323C15.463 9.49849 15.7796 9.49849 15.9749 9.30323C16.1701 9.10796 16.1701 8.79138 15.9749 8.59612L14.2071 6.82841L15.9749 5.06066C16.1702 4.8654 16.1702 4.54882 15.9749 4.35355C15.7796 4.15829 15.4631 4.15829 15.2678 4.35355L13.5 6.1213L11.7322 4.35348C11.537 4.15822 11.2204 4.15822 11.0251 4.35348C10.8298 4.54874 10.8298 4.86532 11.0251 5.06058L12.7929 6.82841L11.0251 8.59619C10.8299 8.79146 10.8299 9.10804 11.0251 9.3033C11.2204 9.49856 11.537 9.49856 11.7323 9.3033L13.5 7.53552L15.2677 9.30323Z"
          />
        </g>
      </svg>
    </media-mute-button>
  </template>

  <template partial="PipButton">
    <media-pip-button part="bottom pip button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="icon">
        <path
          d="M15.9891 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.989C0 13.0996 0.9004 14 2.011 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0ZM17 11.9891C17 12.5465 16.5465 13 15.9891 13H2.011C1.4536 13 1.0001 12.5465 1.0001 11.9891V2.0109C1.0001 1.4535 1.4536 0.9999 2.011 0.9999H15.9891C16.5465 0.9999 17 1.4535 17 2.0109V11.9891Z"
        />
        <path
          d="M15.356 5.67822H8.19523C8.03253 5.67822 7.90063 5.81012 7.90063 5.97282V11.3836C7.90063 11.5463 8.03253 11.6782 8.19523 11.6782H15.356C15.5187 11.6782 15.6506 11.5463 15.6506 11.3836V5.97282C15.6506 5.81012 15.5187 5.67822 15.356 5.67822Z"
        />
      </svg>
    </media-pip-button>
  </template>

  <template partial="CaptionsMenu">
    <media-captions-menu-button part="bottom captions button">
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="on">
        <path
          d="M15.989 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9004 14 2.011 14H15.989C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.989 0ZM4.2292 8.7639C4.5954 9.1902 5.0935 9.4031 5.7233 9.4031C6.1852 9.4031 6.5544 9.301 6.8302 9.0969C7.1061 8.8933 7.2863 8.614 7.3702 8.26H8.4322C8.3062 8.884 8.0093 9.3733 7.5411 9.7273C7.0733 10.0813 6.4703 10.2581 5.732 10.2581C5.108 10.2581 4.5699 10.1219 4.1168 9.8489C3.6637 9.5759 3.3141 9.1946 3.0685 8.7058C2.8224 8.2165 2.6994 7.6511 2.6994 7.009C2.6994 6.3611 2.8224 5.7927 3.0685 5.3034C3.3141 4.8146 3.6637 4.4323 4.1168 4.1559C4.5699 3.88 5.108 3.7418 5.732 3.7418C6.4703 3.7418 7.0733 3.922 7.5411 4.2818C8.0094 4.6422 8.3062 5.1461 8.4322 5.794H7.3702C7.2862 5.4283 7.106 5.1368 6.8302 4.921C6.5544 4.7052 6.1852 4.5968 5.7233 4.5968C5.0934 4.5968 4.5954 4.8116 4.2292 5.2404C3.8635 5.6696 3.6804 6.259 3.6804 7.009C3.6804 7.7531 3.8635 8.3381 4.2292 8.7639ZM11.0974 8.7639C11.4636 9.1902 11.9617 9.4031 12.5915 9.4031C13.0534 9.4031 13.4226 9.301 13.6984 9.0969C13.9743 8.8933 14.1545 8.614 14.2384 8.26H15.3004C15.1744 8.884 14.8775 9.3733 14.4093 9.7273C13.9415 10.0813 13.3385 10.2581 12.6002 10.2581C11.9762 10.2581 11.4381 10.1219 10.985 9.8489C10.5319 9.5759 10.1823 9.1946 9.9367 8.7058C9.6906 8.2165 9.5676 7.6511 9.5676 7.009C9.5676 6.3611 9.6906 5.7927 9.9367 5.3034C10.1823 4.8146 10.5319 4.4323 10.985 4.1559C11.4381 3.88 11.9762 3.7418 12.6002 3.7418C13.3385 3.7418 13.9415 3.922 14.4093 4.2818C14.8776 4.6422 15.1744 5.1461 15.3004 5.794H14.2384C14.1544 5.4283 13.9742 5.1368 13.6984 4.921C13.4226 4.7052 13.0534 4.5968 12.5915 4.5968C11.9616 4.5968 11.4636 4.8116 11.0974 5.2404C10.7317 5.6696 10.5486 6.259 10.5486 7.009C10.5486 7.7531 10.7317 8.3381 11.0974 8.7639Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="off">
        <path
          d="M5.73219 10.258C5.10819 10.258 4.57009 10.1218 4.11699 9.8488C3.66389 9.5758 3.31429 9.1945 3.06869 8.7057C2.82259 8.2164 2.69958 7.651 2.69958 7.0089C2.69958 6.361 2.82259 5.7926 3.06869 5.3033C3.31429 4.8145 3.66389 4.4322 4.11699 4.1558C4.57009 3.8799 5.10819 3.7417 5.73219 3.7417C6.47049 3.7417 7.07348 3.9219 7.54128 4.2817C8.00958 4.6421 8.30638 5.146 8.43238 5.7939H7.37039C7.28639 5.4282 7.10618 5.1367 6.83039 4.9209C6.55459 4.7051 6.18538 4.5967 5.72348 4.5967C5.09358 4.5967 4.59559 4.8115 4.22939 5.2403C3.86369 5.6695 3.68058 6.2589 3.68058 7.0089C3.68058 7.753 3.86369 8.338 4.22939 8.7638C4.59559 9.1901 5.09368 9.403 5.72348 9.403C6.18538 9.403 6.55459 9.3009 6.83039 9.0968C7.10629 8.8932 7.28649 8.6139 7.37039 8.2599H8.43238C8.30638 8.8839 8.00948 9.3732 7.54128 9.7272C7.07348 10.0812 6.47049 10.258 5.73219 10.258Z"
        />
        <path
          d="M12.6003 10.258C11.9763 10.258 11.4382 10.1218 10.9851 9.8488C10.532 9.5758 10.1824 9.1945 9.93685 8.7057C9.69075 8.2164 9.56775 7.651 9.56775 7.0089C9.56775 6.361 9.69075 5.7926 9.93685 5.3033C10.1824 4.8145 10.532 4.4322 10.9851 4.1558C11.4382 3.8799 11.9763 3.7417 12.6003 3.7417C13.3386 3.7417 13.9416 3.9219 14.4094 4.2817C14.8777 4.6421 15.1745 5.146 15.3005 5.7939H14.2385C14.1545 5.4282 13.9743 5.1367 13.6985 4.9209C13.4227 4.7051 13.0535 4.5967 12.5916 4.5967C11.9617 4.5967 11.4637 4.8115 11.0975 5.2403C10.7318 5.6695 10.5487 6.2589 10.5487 7.0089C10.5487 7.753 10.7318 8.338 11.0975 8.7638C11.4637 9.1901 11.9618 9.403 12.5916 9.403C13.0535 9.403 13.4227 9.3009 13.6985 9.0968C13.9744 8.8932 14.1546 8.6139 14.2385 8.2599H15.3005C15.1745 8.8839 14.8776 9.3732 14.4094 9.7272C13.9416 10.0812 13.3386 10.258 12.6003 10.258Z"
        />
        <path
          d="M15.9891 1C16.5465 1 17 1.4535 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H2.0109C1.4535 13 1 12.5465 1 11.9891V2.0109C1 1.4535 1.4535 0.9999 2.0109 0.9999L15.9891 1ZM15.9891 0H2.0109C0.9003 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9003 14 2.0109 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0Z"
        />
      </svg>
    </media-captions-menu-button>
    <media-captions-menu
      hidden
      anchor="auto"
      part="bottom captions menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      exportparts="menu-item"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            display: none;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg></div
    ></media-captions-menu>
  </template>

  <template partial="AirplayButton">
    <media-airplay-button part="bottom airplay button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="icon">
        <path
          d="M16.1383 0H1.8618C0.8335 0 0 0.8335 0 1.8617V10.1382C0 11.1664 0.8335 12 1.8618 12H3.076C3.1204 11.9433 3.1503 11.8785 3.2012 11.826L4.004 11H1.8618C1.3866 11 1 10.6134 1 10.1382V1.8617C1 1.3865 1.3866 0.9999 1.8618 0.9999H16.1383C16.6135 0.9999 17.0001 1.3865 17.0001 1.8617V10.1382C17.0001 10.6134 16.6135 11 16.1383 11H13.9961L14.7989 11.826C14.8499 11.8785 14.8798 11.9432 14.9241 12H16.1383C17.1665 12 18.0001 11.1664 18.0001 10.1382V1.8617C18 0.8335 17.1665 0 16.1383 0Z"
        />
        <path
          d="M9.55061 8.21903C9.39981 8.06383 9.20001 7.98633 9.00011 7.98633C8.80021 7.98633 8.60031 8.06383 8.44951 8.21903L4.09771 12.697C3.62471 13.1838 3.96961 13.9998 4.64831 13.9998H13.3518C14.0304 13.9998 14.3754 13.1838 13.9023 12.697L9.55061 8.21903Z"
        />
      </svg>
    </media-airplay-button>
  </template>

  <template partial="FullscreenButton">
    <media-fullscreen-button part="bottom fullscreen button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="enter">
        <path
          d="M1.00745 4.39539L1.01445 1.98789C1.01605 1.43049 1.47085 0.978289 2.02835 0.979989L6.39375 0.992589L6.39665 -0.007411L2.03125 -0.020011C0.920646 -0.023211 0.0176463 0.874489 0.0144463 1.98509L0.00744629 4.39539H1.00745Z"
        />
        <path
          d="M17.0144 2.03431L17.0076 4.39541H18.0076L18.0144 2.03721C18.0176 0.926712 17.1199 0.0237125 16.0093 0.0205125L11.6439 0.0078125L11.641 1.00781L16.0064 1.02041C16.5638 1.02201 17.016 1.47681 17.0144 2.03431Z"
        />
        <path
          d="M16.9925 9.60498L16.9855 12.0124C16.9839 12.5698 16.5291 13.022 15.9717 13.0204L11.6063 13.0078L11.6034 14.0078L15.9688 14.0204C17.0794 14.0236 17.9823 13.1259 17.9855 12.0153L17.9925 9.60498H16.9925Z"
        />
        <path
          d="M0.985626 11.9661L0.992426 9.60498H-0.0074737L-0.0142737 11.9632C-0.0174737 13.0738 0.880226 13.9767 1.99083 13.98L6.35623 13.9926L6.35913 12.9926L1.99373 12.98C1.43633 12.9784 0.983926 12.5236 0.985626 11.9661Z"
        />
      </svg>
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="exit">
        <path
          d="M5.39655 -0.0200195L5.38955 2.38748C5.38795 2.94488 4.93315 3.39708 4.37565 3.39538L0.0103463 3.38278L0.00744629 4.38278L4.37285 4.39538C5.48345 4.39858 6.38635 3.50088 6.38965 2.39028L6.39665 -0.0200195H5.39655Z"
        />
        <path
          d="M12.6411 2.36891L12.6479 0.0078125H11.6479L11.6411 2.36601C11.6379 3.47651 12.5356 4.37951 13.6462 4.38271L18.0116 4.39531L18.0145 3.39531L13.6491 3.38271C13.0917 3.38111 12.6395 2.92641 12.6411 2.36891Z"
        />
        <path
          d="M12.6034 14.0204L12.6104 11.613C12.612 11.0556 13.0668 10.6034 13.6242 10.605L17.9896 10.6176L17.9925 9.61759L13.6271 9.60499C12.5165 9.60179 11.6136 10.4995 11.6104 11.6101L11.6034 14.0204H12.6034Z"
        />
        <path
          d="M5.359 11.6315L5.3522 13.9926H6.3522L6.359 11.6344C6.3622 10.5238 5.4645 9.62088 4.3539 9.61758L-0.0115043 9.60498L-0.0144043 10.605L4.351 10.6176C4.9084 10.6192 5.3607 11.074 5.359 11.6315Z"
        />
      </svg>
    </media-fullscreen-button>
  </template>

  <template partial="CastButton">
    <media-cast-button part="bottom cast button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="enter">
        <path
          d="M16.0072 0H2.0291C0.9185 0 0.0181 0.9003 0.0181 2.011V5.5009C0.357 5.5016 0.6895 5.5275 1.0181 5.5669V2.011C1.0181 1.4536 1.4716 1 2.029 1H16.0072C16.5646 1 17.0181 1.4536 17.0181 2.011V11.9891C17.0181 12.5465 16.5646 13 16.0072 13H8.4358C8.4746 13.3286 8.4999 13.6611 8.4999 13.9999H16.0071C17.1177 13.9999 18.018 13.0996 18.018 11.989V2.011C18.0181 0.9003 17.1178 0 16.0072 0ZM0 6.4999V7.4999C3.584 7.4999 6.5 10.4159 6.5 13.9999H7.5C7.5 9.8642 4.1357 6.4999 0 6.4999ZM0 8.7499V9.7499C2.3433 9.7499 4.25 11.6566 4.25 13.9999H5.25C5.25 11.1049 2.895 8.7499 0 8.7499ZM0.0181 11V14H3.0181C3.0181 12.3431 1.675 11 0.0181 11Z"
        />
      </svg>
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="exit">
        <path
          d="M15.9891 0H2.01103C0.900434 0 3.35947e-05 0.9003 3.35947e-05 2.011V5.5009C0.338934 5.5016 0.671434 5.5275 1.00003 5.5669V2.011C1.00003 1.4536 1.45353 1 2.01093 1H15.9891C16.5465 1 17 1.4536 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H8.41773C8.45653 13.3286 8.48183 13.6611 8.48183 13.9999H15.989C17.0996 13.9999 17.9999 13.0996 17.9999 11.989V2.011C18 0.9003 17.0997 0 15.9891 0ZM-0.0180664 6.4999V7.4999C3.56593 7.4999 6.48193 10.4159 6.48193 13.9999H7.48193C7.48193 9.8642 4.11763 6.4999 -0.0180664 6.4999ZM-0.0180664 8.7499V9.7499C2.32523 9.7499 4.23193 11.6566 4.23193 13.9999H5.23193C5.23193 11.1049 2.87693 8.7499 -0.0180664 8.7499ZM3.35947e-05 11V14H3.00003C3.00003 12.3431 1.65693 11 3.35947e-05 11Z"
        />
        <path d="M2.15002 5.634C5.18352 6.4207 7.57252 8.8151 8.35282 11.8499H15.8501V2.1499H2.15002V5.634Z" />
      </svg>
    </media-cast-button>
  </template>

  <template partial="LiveButton">
    <media-live-button part="{{section ?? 'top'}} live button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <span slot="text">Live</span>
    </media-live-button>
  </template>

  <template partial="PlaybackRateMenu">
    <media-playback-rate-menu-button part="bottom playback-rate button"></media-playback-rate-menu-button>
    <media-playback-rate-menu
      hidden
      anchor="auto"
      rates="{{playbackrates}}"
      exportparts="menu-item"
      part="bottom playback-rate menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-playback-rate-menu>
  </template>

  <template partial="VolumeRange">
    <media-volume-range
      part="bottom volume range"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-volume-range>
  </template>

  <template partial="TimeDisplay">
    <media-time-display
      remaining="{{defaultshowremainingtime}}"
      showduration="{{!hideduration}}"
      part="bottom time display"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-time-display>
  </template>

  <template partial="TimeRange">
    <media-time-range part="bottom time range" disabled="{{disabled}}" aria-disabled="{{disabled}}" exportparts="thumb">
      <media-preview-thumbnail slot="preview"></media-preview-thumbnail>
      <media-preview-chapter-display slot="preview"></media-preview-chapter-display>
      <media-preview-time-display slot="preview"></media-preview-time-display>
      <div slot="preview" part="arrow"></div>
    </media-time-range>
  </template>

  <template partial="AudioTrackMenu">
    <media-audio-track-menu-button part="bottom audio-track button">
      <svg aria-hidden="true" slot="icon" viewBox="0 0 18 16">
        <path d="M9 15A7 7 0 1 1 9 1a7 7 0 0 1 0 14Zm0 1A8 8 0 1 0 9 0a8 8 0 0 0 0 16Z" />
        <path
          d="M5.2 6.3a.5.5 0 0 1 .5.5v2.4a.5.5 0 1 1-1 0V6.8a.5.5 0 0 1 .5-.5Zm2.4-2.4a.5.5 0 0 1 .5.5v7.2a.5.5 0 0 1-1 0V4.4a.5.5 0 0 1 .5-.5ZM10 5.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.4-.8a.5.5 0 0 1 .5.5v5.6a.5.5 0 0 1-1 0V5.2a.5.5 0 0 1 .5-.5Z"
        />
      </svg>
    </media-audio-track-menu-button>
    <media-audio-track-menu
      hidden
      anchor="auto"
      part="bottom audio-track menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      exportparts="menu-item"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            display: none;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg>
      </div>
    </media-audio-track-menu>
  </template>

  <template partial="RenditionMenu">
    <media-rendition-menu-button part="bottom rendition button">
      <svg aria-hidden="true" slot="icon" viewBox="0 0 18 14">
        <path
          d="M2.25 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6.75 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        />
      </svg>
    </media-rendition-menu-button>
    <media-rendition-menu
      hidden
      anchor="auto"
      part="bottom rendition menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            opacity: 0;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg>
      </div>
    </media-rendition-menu>
  </template>

  <template partial="MuxBadge">
    <div part="mux-badge">
      <a href="https://www.mux.com/player" target="_blank">
        <span class="mux-badge-text">Powered by</span>
        <div class="mux-badge-logo">
          <svg
            viewBox="0 0 1600 500"
            style="fill-rule: evenodd; clip-rule: evenodd; stroke-linejoin: round; stroke-miterlimit: 2"
          >
            <g>
              <path
                d="M994.287,93.486c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m0,-93.486c-34.509,-0 -62.484,27.976 -62.484,62.486l0,187.511c0,68.943 -56.09,125.033 -125.032,125.033c-68.942,-0 -125.03,-56.09 -125.03,-125.033l0,-187.511c0,-34.51 -27.976,-62.486 -62.485,-62.486c-34.509,-0 -62.484,27.976 -62.484,62.486l0,187.511c0,137.853 112.149,250.003 249.999,250.003c137.851,-0 250.001,-112.15 250.001,-250.003l0,-187.511c0,-34.51 -27.976,-62.486 -62.485,-62.486"
                style="fill-rule: nonzero"
              ></path>
              <path
                d="M1537.51,468.511c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m-275.883,-218.509l-143.33,143.329c-24.402,24.402 -24.402,63.966 0,88.368c24.402,24.402 63.967,24.402 88.369,-0l143.33,-143.329l143.328,143.329c24.402,24.4 63.967,24.402 88.369,-0c24.403,-24.402 24.403,-63.966 0.001,-88.368l-143.33,-143.329l0.001,-0.004l143.329,-143.329c24.402,-24.402 24.402,-63.965 0,-88.367c-24.402,-24.402 -63.967,-24.402 -88.369,-0l-143.329,143.328l-143.329,-143.328c-24.402,-24.401 -63.967,-24.402 -88.369,-0c-24.402,24.402 -24.402,63.965 0,88.367l143.329,143.329l0,0.004Z"
                style="fill-rule: nonzero"
              ></path>
              <path
                d="M437.511,468.521c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m23.915,-463.762c-23.348,-9.672 -50.226,-4.327 -68.096,13.544l-143.331,143.329l-143.33,-143.329c-17.871,-17.871 -44.747,-23.216 -68.096,-13.544c-23.349,9.671 -38.574,32.455 -38.574,57.729l0,375.026c0,34.51 27.977,62.486 62.487,62.486c34.51,-0 62.486,-27.976 62.486,-62.486l0,-224.173l80.843,80.844c24.404,24.402 63.965,24.402 88.369,-0l80.843,-80.844l0,224.173c0,34.51 27.976,62.486 62.486,62.486c34.51,-0 62.486,-27.976 62.486,-62.486l0,-375.026c0,-25.274 -15.224,-48.058 -38.573,-57.729"
                style="fill-rule: nonzero"
              ></path>
            </g>
          </svg>
        </div>
      </a>
    </div>
  </template>

  <media-controller
    part="controller"
    defaultstreamtype="{{defaultstreamtype ?? 'on-demand'}}"
    breakpoints="sm:470"
    gesturesdisabled="{{disabled}}"
    hotkeys="{{hotkeys}}"
    nohotkeys="{{nohotkeys}}"
    novolumepref="{{novolumepref}}"
    audio="{{audio}}"
    noautoseektolive="{{noautoseektolive}}"
    defaultsubtitles="{{defaultsubtitles}}"
    defaultduration="{{defaultduration ?? false}}"
    keyboardforwardseekoffset="{{forwardseekoffset}}"
    keyboardbackwardseekoffset="{{backwardseekoffset}}"
    exportparts="layer, media-layer, poster-layer, vertical-layer, centered-layer, gesture-layer"
    style="--_pre-playback-place:{{preplaybackplace ?? 'center'}}"
  >
    <slot name="media" slot="media"></slot>
    <slot name="poster" slot="poster"></slot>

    <media-loading-indicator slot="centered-chrome" noautohide></media-loading-indicator>

    <template if="!audio">
      <media-error-dialog slot="dialog" noautohide></media-error-dialog>
      <!-- Pre-playback UI -->
      <!-- same for both on-demand and live -->
      <div slot="centered-chrome" class="center-controls pre-playback">
        <template if="!breakpointsm">{{>PlayButton section="center"}}</template>
        <template if="breakpointsm">{{>PrePlayButton section="center"}}</template>
      </div>

      <!-- Mux Badge -->
      <template if="proudlydisplaymuxbadge"> {{>MuxBadge}} </template>

      <!-- Autoplay centered unmute button -->
      <!--
        todo: figure out how show this with available state variables
        needs to show when:
        - autoplay is enabled
        - playback has been successful
        - audio is muted
        - in place / instead of the pre-plaback play button
        - not to show again after user has interacted with this button
          - OR user has interacted with the mute button in the control bar
      -->
      <!--
        There should be a >MuteButton to the left of the "Unmute" text, but a templating bug
        makes it appear even if commented out in the markup, add it back when code is un-commented
      -->
      <!-- <div slot="centered-chrome" class="autoplay-unmute">
        <div role="button" class="autoplay-unmute-btn">Unmute</div>
      </div> -->

      <template if="streamtype == 'on-demand'">
        <template if="breakpointsm">
          <media-control-bar part="control-bar top" slot="top-chrome">{{>TitleDisplay}} </media-control-bar>
        </template>
        {{>TimeRange}}
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}} {{>SeekBackwardButton}} {{>SeekForwardButton}} {{>TimeDisplay}} {{>MuteButton}}
          {{>VolumeRange}}
          <div class="spacer"></div>
          {{>RenditionMenu}} {{>PlaybackRateMenu}} {{>AudioTrackMenu}} {{>CaptionsMenu}} {{>AirplayButton}}
          {{>CastButton}} {{>PipButton}} {{>FullscreenButton}}
        </media-control-bar>
      </template>

      <template if="streamtype == 'live'">
        <media-control-bar part="control-bar top" slot="top-chrome">
          {{>LiveButton}}
          <template if="breakpointsm"> {{>TitleDisplay}} </template>
        </media-control-bar>
        <template if="targetlivewindow > 0">{{>TimeRange}}</template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}}
          <template if="targetlivewindow > 0">{{>SeekBackwardButton}} {{>SeekForwardButton}}</template>
          {{>MuteButton}} {{>VolumeRange}}
          <div class="spacer"></div>
          {{>RenditionMenu}} {{>AudioTrackMenu}} {{>CaptionsMenu}} {{>AirplayButton}} {{>CastButton}} {{>PipButton}}
          {{>FullscreenButton}}
        </media-control-bar>
      </template>
    </template>

    <template if="audio">
      <template if="streamtype == 'on-demand'">
        <template if="title">
          <media-control-bar part="control-bar top">{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}}
          <template if="breakpointsm"> {{>SeekBackwardButton}} {{>SeekForwardButton}} </template>
          {{>MuteButton}}
          <template if="breakpointsm">{{>VolumeRange}}</template>
          {{>TimeDisplay}} {{>TimeRange}}
          <template if="breakpointsm">{{>PlaybackRateMenu}}</template>
          {{>AirplayButton}} {{>CastButton}}
        </media-control-bar>
      </template>

      <template if="streamtype == 'live'">
        <template if="title">
          <media-control-bar part="control-bar top">{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}} {{>LiveButton section="bottom"}} {{>MuteButton}}
          <template if="breakpointsm">
            {{>VolumeRange}}
            <template if="targetlivewindow > 0"> {{>SeekBackwardButton}} {{>SeekForwardButton}} </template>
          </template>
          <template if="targetlivewindow > 0"> {{>TimeDisplay}} {{>TimeRange}} </template>
          <template if="!targetlivewindow"><div class="spacer"></div></template>
          {{>AirplayButton}} {{>CastButton}}
        </media-control-bar>
      </template>
    </template>

    <slot></slot>
  </media-controller>
</template>
`,vk=pZ.createElement("template");"innerHTML"in vk&&(vk.innerHTML=vA);var vw,vS,vI=class extends db{};vI.template=null==(vS=null==(vw=vk.content)?void 0:vw.children)?void 0:vS[0],pz.customElements.get("media-theme-gerwig")||pz.customElements.define("media-theme-gerwig",vI);var vR={SRC:"src",POSTER:"poster"},vC={STYLE:"style",DEFAULT_HIDDEN_CAPTIONS:"default-hidden-captions",PRIMARY_COLOR:"primary-color",SECONDARY_COLOR:"secondary-color",ACCENT_COLOR:"accent-color",FORWARD_SEEK_OFFSET:"forward-seek-offset",BACKWARD_SEEK_OFFSET:"backward-seek-offset",PLAYBACK_TOKEN:"playback-token",THUMBNAIL_TOKEN:"thumbnail-token",STORYBOARD_TOKEN:"storyboard-token",FULLSCREEN_ELEMENT:"fullscreen-element",DRM_TOKEN:"drm-token",STORYBOARD_SRC:"storyboard-src",THUMBNAIL_TIME:"thumbnail-time",AUDIO:"audio",NOHOTKEYS:"nohotkeys",HOTKEYS:"hotkeys",PLAYBACK_RATES:"playbackrates",DEFAULT_SHOW_REMAINING_TIME:"default-show-remaining-time",DEFAULT_DURATION:"default-duration",TITLE:"title",VIDEO_TITLE:"video-title",PLACEHOLDER:"placeholder",THEME:"theme",DEFAULT_STREAM_TYPE:"default-stream-type",TARGET_LIVE_WINDOW:"target-live-window",EXTRA_SOURCE_PARAMS:"extra-source-params",NO_VOLUME_PREF:"no-volume-pref",NO_MUTED_PREF:"no-muted-pref",CAST_RECEIVER:"cast-receiver",NO_TOOLTIPS:"no-tooltips",PROUDLY_DISPLAY_MUX_BADGE:"proudly-display-mux-badge",DISABLE_PSEUDO_ENDED:"disable-pseudo-ended"},vL=["audio","backwardseekoffset","defaultduration","defaultshowremainingtime","defaultsubtitles","noautoseektolive","disabled","exportparts","forwardseekoffset","hideduration","hotkeys","nohotkeys","playbackrates","defaultstreamtype","streamtype","style","targetlivewindow","template","title","videotitle","novolumepref","nomutedpref","proudlydisplaymuxbadge"],vM=oM.formatErrorMessage;function vD(e){let t=e.videoTitle?{video_title:e.videoTitle}:{};return e.getAttributeNames().filter(e=>e.startsWith("metadata-")).reduce((t,i)=>{let a=e.getAttribute(i);return null!==a&&(t[i.replace(/^metadata-/,"").replace(/-/g,"_")]=a),t},t)}oM.formatErrorMessage=e=>{var t,i;if(e instanceof t$){let a=((e,t=!1)=>({title:((e,t=!1)=>{var i,a;if(e.muxCode){let r=v_(null!=(i=e.errorCategory)?i:"video"),n=tW(null!=(a=e.errorCategory)?a:tH);if(2000002===e.muxCode)return ia("Your device appears to be offline",t);if(2403210===e.muxCode)return ia("{category} URL has expired",t).format({category:r});if([2403232,2403222,2403221,2412202].includes(e.muxCode))return ia("{category} URL is formatted incorrectly",t).format({category:r});if(2403201===e.muxCode)return ia("Invalid {categoryName} URL",t).format({categoryName:n});if(2404e3===e.muxCode)return ia("{category} does not exist",t).format({category:r});if(2412e3===e.muxCode){let i="live"===e.streamType?"Live stream":"Video";return ia("{mediaType} is not currently available",t).format({mediaType:i})}}if(e.code){if(e.code===t$.MEDIA_ERR_NETWORK)return ia("Network Error",t);if(e.code===t$.MEDIA_ERR_DECODE)return ia("Media Error",t);if(e.code===t$.MEDIA_ERR_SRC_NOT_SUPPORTED)return ia("Source Not Supported",t)}return ia("Error",t)})(e,t).toString(),message:((e,t=!1)=>{var i,a;if(e.muxCode){let r=v_(null!=(i=e.errorCategory)?i:"video"),n=tW(null!=(a=e.errorCategory)?a:tH);return 2000002===e.muxCode?ia("Check your internet connection and try reloading this video.",t):2403210===e.muxCode?ia("The video’s secured {tokenNamePrefix}-token has expired.",t).format({tokenNamePrefix:n}):2403232===e.muxCode?ia("The video’s playback ID does not match the one encoded in the {tokenNamePrefix}-token.",t).format({tokenNamePrefix:n}):2412202===e.muxCode?ia("{category} URL is formatted incorrectly",t).format({category:r}):[2403222,2403221].includes(e.muxCode)?ia("The {tokenNamePrefix}-token is formatted with incorrect information.",t).format({tokenNamePrefix:n}):[2403201,24e5].includes(e.muxCode)?ia("The video URL or {tokenNamePrefix}-token are formatted with incorrect or incomplete information.",t).format({tokenNamePrefix:n}):2404e3===e.muxCode?"":e.message}return e.code&&(e.code===t$.MEDIA_ERR_NETWORK||e.code===t$.MEDIA_ERR_DECODE||e.code===t$.MEDIA_ERR_SRC_NOT_SUPPORTED),e.message})(e,t).toString()}))(e,!1);return`
      ${null!=a&&a.title?`<h3>${a.title}</h3>`:""}
      ${null!=a&&a.message||null!=a&&a.linkUrl?`<p>
        ${null==a?void 0:a.message}
        ${null!=a&&a.linkUrl?`<a
              href="${a.linkUrl}"
              target="_blank"
              rel="external noopener"
              aria-label="${null!=(t=a.linkText)?t:""} ${ia("(opens in a new window)")}"
              >${null!=(i=a.linkText)?i:a.linkUrl}</a
            >`:""}
      </p>`:""}
    `}return vM(e)};var vx,vP,vN,vO,vU,vB,vH,vW,v$,vq,vV,vF,vK,vG,vj,vY,vQ,vz,vZ,vX,vJ,v0=Object.values(aB),v1=Object.values(vR),v2=Object.values(vC),v3="mux-player",v4={isDialogOpen:!1},v5={redundant_streams:!0},v9=class extends vu{constructor(){super(),uL(this,vK),uL(this,vx),uL(this,vP,!1),uL(this,vN,{}),uL(this,vO,!0),uL(this,vU,new ve(this,"hotkeys")),uL(this,vB),uL(this,vH,()=>uD(this,vK,vQ).call(this)),uL(this,vW,()=>uD(this,vK,vQ).call(this)),uL(this,v$,()=>uD(this,vK,vQ).call(this)),uL(this,vq),uL(this,vV,{...v4,onCloseErrorDialog:e=>{var t;(null==(t=e.composedPath()[0])?void 0:t.localName)==="media-error-dialog"&&uD(this,vK,vY).call(this,{isDialogOpen:!1})},onFocusInErrorDialog:e=>{var t;(null==(t=e.composedPath()[0])?void 0:t.localName)==="media-error-dialog"&&(p5(this,pZ.activeElement)||e.preventDefault())}}),uL(this,vF,e=>{var t;let i=null==(t=this.media)?void 0:t.error;if(!(i instanceof t$)){let{message:e,code:t}=null!=i?i:{};i=new t$(e,t)}if(!(null!=i&&i.fatal)){vi(i),i.data&&vi(`${i.name} data:`,i.data);return}let a=vT(i,!1);a.message&&vr(a),va(i),i.data&&va(`${i.name} data:`,i.data),uD(this,vK,vY).call(this,{isDialogOpen:!0})}),uM(this,vx,iY()),this.attachShadow({mode:"open"}),uD(this,vK,vj).call(this),this.isConnected&&uD(this,vK,vG).call(this)}static get NAME(){return v3}static get VERSION(){return p8}static get observedAttributes(){var e;return[...null!=(e=vu.observedAttributes)?e:[],...v1,...v0,...v2]}get mediaTheme(){var e;return null==(e=this.shadowRoot)?void 0:e.querySelector("media-theme")}get mediaController(){var e,t;return null==(t=null==(e=this.mediaTheme)?void 0:e.shadowRoot)?void 0:t.querySelector("media-controller")}connectedCallback(){uD(this,vK,vG).call(this);let e=this.media;e&&(e.metadata=vD(this))}disconnectedCallback(){var e,t,i,a,r,n,s,o;null==(e=uC(this,vB))||e.disconnect(),null==(t=this.media)||t.removeEventListener("streamtypechange",uC(this,vH)),null==(i=this.media)||i.removeEventListener("loadstart",uC(this,vW)),this.removeEventListener("error",uC(this,vF)),this.media&&(this.media.errorTranslator=void 0),null==(r=null==(a=this.media)?void 0:a.textTracks)||r.removeEventListener("addtrack",uC(this,v$)),null==(s=null==(n=this.media)?void 0:n.textTracks)||s.removeEventListener("removetrack",uC(this,v$)),null==(o=uC(this,vq))||o.call(this),uM(this,vq,void 0),uM(this,vP,!1)}attributeChangedCallback(e,t,i){var a;switch(uD(this,vK,vG).call(this),super.attributeChangedCallback(e,t,i),e){case vC.HOTKEYS:uC(this,vU).value=i;break;case vC.THUMBNAIL_TIME:null!=i&&this.tokens.thumbnail&&vi(ia("Use of thumbnail-time with thumbnail-token is currently unsupported. Ignore thumbnail-time.").toString());break;case vC.THUMBNAIL_TOKEN:if(i){let e=ii(i);if(e){let{aud:t}=e;"t"!==t&&vi(ia("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:t,expectedAud:"t",tokenNamePrefix:"thumbnail"}))}}break;case vC.STORYBOARD_TOKEN:if(i){let e=ii(i);if(e){let{aud:t}=e;"s"!==t&&vi(ia("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:t,expectedAud:"s",tokenNamePrefix:"storyboard"}))}}break;case vC.DRM_TOKEN:if(i){let e=ii(i);if(e){let{aud:t}=e;"d"!==t&&vi(ia("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:t,expectedAud:"d",tokenNamePrefix:"drm"}))}}break;case aB.PLAYBACK_ID:null!=i&&i.includes("?token")&&va(ia("The specificed playback ID {playbackId} contains a token which must be provided via the playback-token attribute.").format({playbackId:i}));break;case aB.STREAM_TYPE:i&&![tK,tF,tG].includes(i)?["ll-live","live:dvr","ll-live:dvr"].includes(this.streamType)?this.targetLiveWindow=i.includes("dvr")?1/0:0:vr({file:"invalid-stream-type.md",message:ia("Invalid stream-type value supplied: `{streamType}`. Please provide stream-type as either: `on-demand` or `live`").format({streamType:this.streamType})}):i===tK?null==this.getAttribute(vC.TARGET_LIVE_WINDOW)&&(this.targetLiveWindow=0):this.targetLiveWindow=NaN;break;case vC.FULLSCREEN_ELEMENT:if(null!=i||i!==t){let e=pZ.getElementById(i),t=null==e?void 0:e.querySelector("mux-player");this.mediaController&&e&&t&&(this.mediaController.fullscreenElement=e)}break;case aB.CAP_RENDITION_TO_PLAYER_SIZE:(null==i||i!==t)&&(this.capRenditionToPlayerSize=null!=i||void 0)}[aB.PLAYBACK_ID,vR.SRC,vC.PLAYBACK_TOKEN].includes(e)&&t!==i&&uM(this,vV,{...uC(this,vV),...v4}),uD(this,vK,vQ).call(this,{[null!=(a=p7[e])?a:pJ(e)]:i})}async requestFullscreen(e){var t;if(!(!this.mediaController||this.mediaController.hasAttribute(rb.MEDIA_IS_FULLSCREEN)))return null==(t=this.mediaController)||t.dispatchEvent(new pz.CustomEvent(rh.MEDIA_ENTER_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0})),new Promise((e,t)=>{var i;null==(i=this.mediaController)||i.addEventListener(rg.MEDIA_IS_FULLSCREEN,()=>e(),{once:!0})})}async exitFullscreen(){var e;if(!(!this.mediaController||!this.mediaController.hasAttribute(rb.MEDIA_IS_FULLSCREEN)))return null==(e=this.mediaController)||e.dispatchEvent(new pz.CustomEvent(rh.MEDIA_EXIT_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0})),new Promise((e,t)=>{var i;null==(i=this.mediaController)||i.addEventListener(rg.MEDIA_IS_FULLSCREEN,()=>e(),{once:!0})})}get preferCmcd(){var e;return null!=(e=this.getAttribute(aB.PREFER_CMCD))?e:void 0}set preferCmcd(e){e!==this.preferCmcd&&(e?tQ.includes(e)?this.setAttribute(aB.PREFER_CMCD,e):vi(`Invalid value for preferCmcd. Must be one of ${tQ.join()}`):this.removeAttribute(aB.PREFER_CMCD))}get hasPlayed(){var e,t;return null!=(t=null==(e=this.mediaController)?void 0:e.hasAttribute(rb.MEDIA_HAS_PLAYED))&&t}get inLiveWindow(){var e;return null==(e=this.mediaController)?void 0:e.hasAttribute(rb.MEDIA_TIME_IS_LIVE)}get _hls(){var e;return null==(e=this.media)?void 0:e._hls}get mux(){var e;return null==(e=this.media)?void 0:e.mux}get theme(){var e;return null!=(e=this.getAttribute(vC.THEME))?e:"gerwig"}set theme(e){this.setAttribute(vC.THEME,`${e}`)}get themeProps(){let e=this.mediaTheme;if(!e)return;let t={};for(let i of e.getAttributeNames()){if(vL.includes(i))continue;let a=e.getAttribute(i);t[pJ(i)]=""===a||a}return t}set themeProps(e){var t,i;uD(this,vK,vG).call(this);let a={...this.themeProps,...e};for(let r in a){if(vL.includes(r))continue;let a=null==e?void 0:e[r];"boolean"==typeof a||null==a?null==(t=this.mediaTheme)||t.toggleAttribute(pX(r),!!a):null==(i=this.mediaTheme)||i.setAttribute(pX(r),a)}}get playbackId(){var e;return null!=(e=this.getAttribute(aB.PLAYBACK_ID))?e:void 0}set playbackId(e){e?this.setAttribute(aB.PLAYBACK_ID,e):this.removeAttribute(aB.PLAYBACK_ID)}get src(){var e,t;return this.playbackId?null!=(e=v8(this,vR.SRC))?e:void 0:null!=(t=this.getAttribute(vR.SRC))?t:void 0}set src(e){e?this.setAttribute(vR.SRC,e):this.removeAttribute(vR.SRC)}get poster(){var e;let t=this.getAttribute(vR.POSTER);if(null!=t)return t;let{tokens:i}=this;return i.playback&&!i.thumbnail?void vi("Missing expected thumbnail token. No poster image will be shown"):this.playbackId&&!this.audio?((e,{token:t,customDomain:i=p9,thumbnailTime:a,programTime:r}={})=>{var n;let s=null==t?a:void 0,{aud:o}=null!=(n=ii(t))?n:{};if(!(t&&"t"!==o))return`https://image.${i}/${e}/thumbnail.webp${p1({token:t,time:s,program_time:r})}`})(this.playbackId,{customDomain:this.customDomain,thumbnailTime:null!=(e=this.thumbnailTime)?e:this.startTime,programTime:this.programStartTime,token:i.thumbnail}):void 0}set poster(e){e||""===e?this.setAttribute(vR.POSTER,e):this.removeAttribute(vR.POSTER)}get storyboardSrc(){var e;return null!=(e=this.getAttribute(vC.STORYBOARD_SRC))?e:void 0}set storyboardSrc(e){e?this.setAttribute(vC.STORYBOARD_SRC,e):this.removeAttribute(vC.STORYBOARD_SRC)}get storyboard(){let{tokens:e}=this;return this.storyboardSrc&&!e.storyboard?this.storyboardSrc:this.audio||!this.playbackId||!this.streamType||[tK,tG].includes(this.streamType)||e.playback&&!e.storyboard?void 0:((e,{token:t,customDomain:i=p9,programStartTime:a,programEndTime:r}={})=>{var n;let{aud:s}=null!=(n=ii(t))?n:{};if(!(t&&"s"!==s))return`https://image.${i}/${e}/storyboard.vtt${p1({token:t,format:"webp",program_start_time:a,program_end_time:r})}`})(this.playbackId,{customDomain:this.customDomain,token:e.storyboard,programStartTime:this.programStartTime,programEndTime:this.programEndTime})}get audio(){return this.hasAttribute(vC.AUDIO)}set audio(e){e?this.setAttribute(vC.AUDIO,""):this.removeAttribute(vC.AUDIO)}get hotkeys(){return uC(this,vU)}get nohotkeys(){return this.hasAttribute(vC.NOHOTKEYS)}set nohotkeys(e){e?this.setAttribute(vC.NOHOTKEYS,""):this.removeAttribute(vC.NOHOTKEYS)}get thumbnailTime(){return p0(this.getAttribute(vC.THUMBNAIL_TIME))}set thumbnailTime(e){this.setAttribute(vC.THUMBNAIL_TIME,`${e}`)}get videoTitle(){var e,t;return null!=(t=null!=(e=this.getAttribute(vC.VIDEO_TITLE))?e:this.getAttribute(vC.TITLE))?t:""}set videoTitle(e){e!==this.videoTitle&&(e?this.setAttribute(vC.VIDEO_TITLE,e):this.removeAttribute(vC.VIDEO_TITLE))}get placeholder(){var e;return null!=(e=v8(this,vC.PLACEHOLDER))?e:""}set placeholder(e){this.setAttribute(vC.PLACEHOLDER,`${e}`)}get primaryColor(){var e,t;let i=this.getAttribute(vC.PRIMARY_COLOR);if(null!=i||this.mediaTheme&&(i=null==(t=null==(e=pz.getComputedStyle(this.mediaTheme))?void 0:e.getPropertyValue("--_primary-color"))?void 0:t.trim()))return i}set primaryColor(e){this.setAttribute(vC.PRIMARY_COLOR,`${e}`)}get secondaryColor(){var e,t;let i=this.getAttribute(vC.SECONDARY_COLOR);if(null!=i||this.mediaTheme&&(i=null==(t=null==(e=pz.getComputedStyle(this.mediaTheme))?void 0:e.getPropertyValue("--_secondary-color"))?void 0:t.trim()))return i}set secondaryColor(e){this.setAttribute(vC.SECONDARY_COLOR,`${e}`)}get accentColor(){var e,t;let i=this.getAttribute(vC.ACCENT_COLOR);if(null!=i||this.mediaTheme&&(i=null==(t=null==(e=pz.getComputedStyle(this.mediaTheme))?void 0:e.getPropertyValue("--_accent-color"))?void 0:t.trim()))return i}set accentColor(e){this.setAttribute(vC.ACCENT_COLOR,`${e}`)}get defaultShowRemainingTime(){return this.hasAttribute(vC.DEFAULT_SHOW_REMAINING_TIME)}set defaultShowRemainingTime(e){e?this.setAttribute(vC.DEFAULT_SHOW_REMAINING_TIME,""):this.removeAttribute(vC.DEFAULT_SHOW_REMAINING_TIME)}get playbackRates(){if(this.hasAttribute(vC.PLAYBACK_RATES))return this.getAttribute(vC.PLAYBACK_RATES).trim().split(/\s*,?\s+/).map(e=>Number(e)).filter(e=>!Number.isNaN(e)).sort((e,t)=>e-t)}set playbackRates(e){e?this.setAttribute(vC.PLAYBACK_RATES,e.join(" ")):this.removeAttribute(vC.PLAYBACK_RATES)}get forwardSeekOffset(){var e;return null!=(e=p0(this.getAttribute(vC.FORWARD_SEEK_OFFSET)))?e:10}set forwardSeekOffset(e){this.setAttribute(vC.FORWARD_SEEK_OFFSET,`${e}`)}get backwardSeekOffset(){var e;return null!=(e=p0(this.getAttribute(vC.BACKWARD_SEEK_OFFSET)))?e:10}set backwardSeekOffset(e){this.setAttribute(vC.BACKWARD_SEEK_OFFSET,`${e}`)}get defaultHiddenCaptions(){return this.hasAttribute(vC.DEFAULT_HIDDEN_CAPTIONS)}set defaultHiddenCaptions(e){e?this.setAttribute(vC.DEFAULT_HIDDEN_CAPTIONS,""):this.removeAttribute(vC.DEFAULT_HIDDEN_CAPTIONS)}get defaultDuration(){return p0(this.getAttribute(vC.DEFAULT_DURATION))}set defaultDuration(e){null==e?this.removeAttribute(vC.DEFAULT_DURATION):this.setAttribute(vC.DEFAULT_DURATION,`${e}`)}get playerInitTime(){return this.hasAttribute(aB.PLAYER_INIT_TIME)?p0(this.getAttribute(aB.PLAYER_INIT_TIME)):uC(this,vx)}set playerInitTime(e){e!=this.playerInitTime&&(null==e?this.removeAttribute(aB.PLAYER_INIT_TIME):this.setAttribute(aB.PLAYER_INIT_TIME,`${+e}`))}get playerSoftwareName(){var e;return null!=(e=this.getAttribute(aB.PLAYER_SOFTWARE_NAME))?e:v3}get playerSoftwareVersion(){var e;return null!=(e=this.getAttribute(aB.PLAYER_SOFTWARE_VERSION))?e:p8}get beaconCollectionDomain(){var e;return null!=(e=this.getAttribute(aB.BEACON_COLLECTION_DOMAIN))?e:void 0}set beaconCollectionDomain(e){e!==this.beaconCollectionDomain&&(e?this.setAttribute(aB.BEACON_COLLECTION_DOMAIN,e):this.removeAttribute(aB.BEACON_COLLECTION_DOMAIN))}get maxResolution(){var e;return null!=(e=this.getAttribute(aB.MAX_RESOLUTION))?e:void 0}set maxResolution(e){e!==this.maxResolution&&(e?this.setAttribute(aB.MAX_RESOLUTION,e):this.removeAttribute(aB.MAX_RESOLUTION))}get minResolution(){var e;return null!=(e=this.getAttribute(aB.MIN_RESOLUTION))?e:void 0}set minResolution(e){e!==this.minResolution&&(e?this.setAttribute(aB.MIN_RESOLUTION,e):this.removeAttribute(aB.MIN_RESOLUTION))}get maxAutoResolution(){var e;return null!=(e=this.getAttribute(aB.MAX_AUTO_RESOLUTION))?e:void 0}set maxAutoResolution(e){null==e?this.removeAttribute(aB.MAX_AUTO_RESOLUTION):this.setAttribute(aB.MAX_AUTO_RESOLUTION,e)}get renditionOrder(){var e;return null!=(e=this.getAttribute(aB.RENDITION_ORDER))?e:void 0}set renditionOrder(e){e!==this.renditionOrder&&(e?this.setAttribute(aB.RENDITION_ORDER,e):this.removeAttribute(aB.RENDITION_ORDER))}get programStartTime(){return p0(this.getAttribute(aB.PROGRAM_START_TIME))}set programStartTime(e){null==e?this.removeAttribute(aB.PROGRAM_START_TIME):this.setAttribute(aB.PROGRAM_START_TIME,`${e}`)}get programEndTime(){return p0(this.getAttribute(aB.PROGRAM_END_TIME))}set programEndTime(e){null==e?this.removeAttribute(aB.PROGRAM_END_TIME):this.setAttribute(aB.PROGRAM_END_TIME,`${e}`)}get assetStartTime(){return p0(this.getAttribute(aB.ASSET_START_TIME))}set assetStartTime(e){null==e?this.removeAttribute(aB.ASSET_START_TIME):this.setAttribute(aB.ASSET_START_TIME,`${e}`)}get assetEndTime(){return p0(this.getAttribute(aB.ASSET_END_TIME))}set assetEndTime(e){null==e?this.removeAttribute(aB.ASSET_END_TIME):this.setAttribute(aB.ASSET_END_TIME,`${e}`)}get extraSourceParams(){return this.hasAttribute(vC.EXTRA_SOURCE_PARAMS)?[...new URLSearchParams(this.getAttribute(vC.EXTRA_SOURCE_PARAMS)).entries()].reduce((e,[t,i])=>(e[t]=i,e),{}):v5}set extraSourceParams(e){null==e?this.removeAttribute(vC.EXTRA_SOURCE_PARAMS):this.setAttribute(vC.EXTRA_SOURCE_PARAMS,new URLSearchParams(e).toString())}get customDomain(){var e;return null!=(e=this.getAttribute(aB.CUSTOM_DOMAIN))?e:void 0}set customDomain(e){e!==this.customDomain&&(e?this.setAttribute(aB.CUSTOM_DOMAIN,e):this.removeAttribute(aB.CUSTOM_DOMAIN))}get envKey(){var e;return null!=(e=v8(this,aB.ENV_KEY))?e:void 0}set envKey(e){this.setAttribute(aB.ENV_KEY,`${e}`)}get noVolumePref(){return this.hasAttribute(vC.NO_VOLUME_PREF)}set noVolumePref(e){e?this.setAttribute(vC.NO_VOLUME_PREF,""):this.removeAttribute(vC.NO_VOLUME_PREF)}get noMutedPref(){return this.hasAttribute(vC.NO_MUTED_PREF)}set noMutedPref(e){e?this.setAttribute(vC.NO_MUTED_PREF,""):this.removeAttribute(vC.NO_MUTED_PREF)}get debug(){return null!=v8(this,aB.DEBUG)}set debug(e){e?this.setAttribute(aB.DEBUG,""):this.removeAttribute(aB.DEBUG)}get disableTracking(){return null!=v8(this,aB.DISABLE_TRACKING)}set disableTracking(e){this.toggleAttribute(aB.DISABLE_TRACKING,!!e)}get disableCookies(){return null!=v8(this,aB.DISABLE_COOKIES)}set disableCookies(e){e?this.setAttribute(aB.DISABLE_COOKIES,""):this.removeAttribute(aB.DISABLE_COOKIES)}get streamType(){var e,t,i;return null!=(i=null!=(t=this.getAttribute(aB.STREAM_TYPE))?t:null==(e=this.media)?void 0:e.streamType)?i:tG}set streamType(e){this.setAttribute(aB.STREAM_TYPE,`${e}`)}get defaultStreamType(){var e,t,i;return null!=(i=null!=(t=this.getAttribute(vC.DEFAULT_STREAM_TYPE))?t:null==(e=this.mediaController)?void 0:e.getAttribute(vC.DEFAULT_STREAM_TYPE))?i:tF}set defaultStreamType(e){e?this.setAttribute(vC.DEFAULT_STREAM_TYPE,e):this.removeAttribute(vC.DEFAULT_STREAM_TYPE)}get targetLiveWindow(){var e,t;return this.hasAttribute(vC.TARGET_LIVE_WINDOW)?+this.getAttribute(vC.TARGET_LIVE_WINDOW):null!=(t=null==(e=this.media)?void 0:e.targetLiveWindow)?t:NaN}set targetLiveWindow(e){e==this.targetLiveWindow||Number.isNaN(e)&&Number.isNaN(this.targetLiveWindow)||(null==e?this.removeAttribute(vC.TARGET_LIVE_WINDOW):this.setAttribute(vC.TARGET_LIVE_WINDOW,`${+e}`))}get liveEdgeStart(){var e;return null==(e=this.media)?void 0:e.liveEdgeStart}get startTime(){return p0(v8(this,aB.START_TIME))}set startTime(e){this.setAttribute(aB.START_TIME,`${e}`)}get initialBandwidthEstimateKbps(){return p0(v8(this,aB.INITIAL_BANDWIDTH_ESTIMATE_KBPS))}set initialBandwidthEstimateKbps(e){null==e?this.removeAttribute(aB.INITIAL_BANDWIDTH_ESTIMATE_KBPS):this.setAttribute(aB.INITIAL_BANDWIDTH_ESTIMATE_KBPS,`${e}`)}get initialEstimateSegments(){return p0(v8(this,aB.INITIAL_ESTIMATE_SEGMENTS))}set initialEstimateSegments(e){null==e?this.removeAttribute(aB.INITIAL_ESTIMATE_SEGMENTS):this.setAttribute(aB.INITIAL_ESTIMATE_SEGMENTS,`${e}`)}get minPreloadSegments(){return p0(v8(this,aB.MIN_PRELOAD_SEGMENTS))}set minPreloadSegments(e){null==e?this.removeAttribute(aB.MIN_PRELOAD_SEGMENTS):this.setAttribute(aB.MIN_PRELOAD_SEGMENTS,`${e}`)}get preferPlayback(){let e=this.getAttribute(aB.PREFER_PLAYBACK);if("mse"===e||e===tj)return e}set preferPlayback(e){e!==this.preferPlayback&&("mse"===e||e===tj?this.setAttribute(aB.PREFER_PLAYBACK,e):this.removeAttribute(aB.PREFER_PLAYBACK))}get metadata(){var e;return null==(e=this.media)?void 0:e.metadata}set metadata(e){(uD(this,vK,vG).call(this),this.media)?this.media.metadata={...vD(this),...e}:va("underlying media element missing when trying to set metadata. metadata will not be set.")}get _hlsConfig(){var e;return null==(e=this.media)?void 0:e._hlsConfig}set _hlsConfig(e){(uD(this,vK,vG).call(this),this.media)?this.media._hlsConfig=e:va("underlying media element missing when trying to set _hlsConfig. _hlsConfig will not be set.")}async addCuePoints(e){var t;return(uD(this,vK,vG).call(this),this.media)?null==(t=this.media)?void 0:t.addCuePoints(e):void va("underlying media element missing when trying to addCuePoints. cuePoints will not be added.")}get activeCuePoint(){var e;return null==(e=this.media)?void 0:e.activeCuePoint}get cuePoints(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.cuePoints)?t:[]}addChapters(e){var t;return(uD(this,vK,vG).call(this),this.media)?null==(t=this.media)?void 0:t.addChapters(e):void va("underlying media element missing when trying to addChapters. chapters will not be added.")}get activeChapter(){var e;return null==(e=this.media)?void 0:e.activeChapter}get chapters(){var e,t;return null!=(t=null==(e=this.media)?void 0:e.chapters)?t:[]}getStartDate(){var e;return null==(e=this.media)?void 0:e.getStartDate()}get currentPdt(){var e;return null==(e=this.media)?void 0:e.currentPdt}get tokens(){let e=this.getAttribute(vC.PLAYBACK_TOKEN),t=this.getAttribute(vC.DRM_TOKEN),i=this.getAttribute(vC.THUMBNAIL_TOKEN),a=this.getAttribute(vC.STORYBOARD_TOKEN);return{...uC(this,vN),...null!=e?{playback:e}:{},...null!=t?{drm:t}:{},...null!=i?{thumbnail:i}:{},...null!=a?{storyboard:a}:{}}}set tokens(e){uM(this,vN,null!=e?e:{})}get playbackToken(){var e;return null!=(e=this.getAttribute(vC.PLAYBACK_TOKEN))?e:void 0}set playbackToken(e){this.setAttribute(vC.PLAYBACK_TOKEN,`${e}`)}get drmToken(){var e;return null!=(e=this.getAttribute(vC.DRM_TOKEN))?e:void 0}set drmToken(e){this.setAttribute(vC.DRM_TOKEN,`${e}`)}get thumbnailToken(){var e;return null!=(e=this.getAttribute(vC.THUMBNAIL_TOKEN))?e:void 0}set thumbnailToken(e){this.setAttribute(vC.THUMBNAIL_TOKEN,`${e}`)}get storyboardToken(){var e;return null!=(e=this.getAttribute(vC.STORYBOARD_TOKEN))?e:void 0}set storyboardToken(e){this.setAttribute(vC.STORYBOARD_TOKEN,`${e}`)}addTextTrack(e,t,i,a){var r;let n=null==(r=this.media)?void 0:r.nativeEl;if(n)return iu(n,e,t,i,a)}removeTextTrack(e){var t;let i=null==(t=this.media)?void 0:t.nativeEl;if(i){let t;return void(null==(t=Array.prototype.find.call(i.querySelectorAll("track"),t=>t.track===e))||t.remove())}}get textTracks(){var e;return null==(e=this.media)?void 0:e.textTracks}get castReceiver(){var e;return null!=(e=this.getAttribute(vC.CAST_RECEIVER))?e:void 0}set castReceiver(e){e!==this.castReceiver&&(e?this.setAttribute(vC.CAST_RECEIVER,e):this.removeAttribute(vC.CAST_RECEIVER))}get castCustomData(){var e;return null==(e=this.media)?void 0:e.castCustomData}set castCustomData(e){this.media?this.media.castCustomData=e:va("underlying media element missing when trying to set castCustomData. castCustomData will not be set.")}get noTooltips(){return this.hasAttribute(vC.NO_TOOLTIPS)}set noTooltips(e){e?this.setAttribute(vC.NO_TOOLTIPS,""):this.removeAttribute(vC.NO_TOOLTIPS)}get proudlyDisplayMuxBadge(){return this.hasAttribute(vC.PROUDLY_DISPLAY_MUX_BADGE)}set proudlyDisplayMuxBadge(e){e?this.setAttribute(vC.PROUDLY_DISPLAY_MUX_BADGE,""):this.removeAttribute(vC.PROUDLY_DISPLAY_MUX_BADGE)}get capRenditionToPlayerSize(){var e;return null==(e=this.media)?void 0:e.capRenditionToPlayerSize}set capRenditionToPlayerSize(e){this.media?this.media.capRenditionToPlayerSize=e:va("underlying media element missing when trying to set capRenditionToPlayerSize")}};function v8(e,t){return e.media?e.media.getAttribute(t):e.getAttribute(t)}vx=new WeakMap,vP=new WeakMap,vN=new WeakMap,vO=new WeakMap,vU=new WeakMap,vB=new WeakMap,vH=new WeakMap,vW=new WeakMap,v$=new WeakMap,vq=new WeakMap,vV=new WeakMap,vF=new WeakMap,vK=new WeakSet,vG=function(){var e,t,i,a;if(!uC(this,vP)){uM(this,vP,!0),uD(this,vK,vQ).call(this);try{if(customElements.upgrade(this.mediaTheme),!(this.mediaTheme instanceof pz.HTMLElement))throw""}catch{va("<media-theme> failed to upgrade!")}try{customElements.upgrade(this.media)}catch{va("underlying media element failed to upgrade!")}try{if(customElements.upgrade(this.mediaController),!(this.mediaController instanceof sD))throw""}catch{va("<media-controller> failed to upgrade!")}uD(this,vK,vz).call(this),uD(this,vK,vZ).call(this),uD(this,vK,vX).call(this),uM(this,vO,null==(t=null==(e=this.mediaController)?void 0:e.hasAttribute(nS))||t),uD(this,vK,vJ).call(this),null==(i=this.media)||i.addEventListener("streamtypechange",uC(this,vH)),null==(a=this.media)||a.addEventListener("loadstart",uC(this,vW))}},vj=function(){var e,t;try{null==(e=null==window?void 0:window.CSS)||e.registerProperty({name:"--media-primary-color",syntax:"<color>",inherits:!0}),null==(t=null==window?void 0:window.CSS)||t.registerProperty({name:"--media-secondary-color",syntax:"<color>",inherits:!0})}catch{}},vY=function(e){Object.assign(uC(this,vV),e),uD(this,vK,vQ).call(this)},vQ=function(e={}){var t,i,a,r,n,s,o,l,d,u,c,h,m,p,v,b,g,f,E,y,T,A,k,w,S,I,R,C,L,M,D,x,P,N,O,U,B,H,W,$,q,V,F,K,G,j,Y,Q,z,Z;let X,J,ee,et;t={...uC(this,vV),...e},X={src:!this.playbackId&&this.src,playbackId:this.playbackId,hasSrc:!!this.playbackId||!!this.src||!!this.currentSrc,poster:this.poster,storyboard:(null==(i=this.media)?void 0:i.currentSrc)&&this.storyboard,storyboardSrc:this.getAttribute(vC.STORYBOARD_SRC),fullscreenElement:this.getAttribute(vC.FULLSCREEN_ELEMENT),placeholder:this.getAttribute("placeholder"),themeTemplate:function(e){var t,i;let a=e.theme;if(a){let r=null==(i=null==(t=e.getRootNode())?void 0:t.getElementById)?void 0:i.call(t,a);if(r&&r instanceof HTMLTemplateElement)return r;a.startsWith("media-theme-")||(a=`media-theme-${a}`);let n=pz.customElements.get(a);if(null!=n&&n.template)return n.template}}(this),thumbnailTime:!this.tokens.thumbnail&&this.thumbnailTime,autoplay:this.autoplay,crossOrigin:this.crossOrigin,loop:this.loop,noHotKeys:this.hasAttribute(vC.NOHOTKEYS),hotKeys:this.getAttribute(vC.HOTKEYS),muted:this.muted,paused:this.paused,preload:this.preload,envKey:this.envKey,preferCmcd:this.preferCmcd,debug:this.debug,disableTracking:this.disableTracking,disableCookies:this.disableCookies,tokens:this.tokens,beaconCollectionDomain:this.beaconCollectionDomain,maxResolution:this.maxResolution,minResolution:this.minResolution,maxAutoResolution:this.maxAutoResolution,programStartTime:this.programStartTime,programEndTime:this.programEndTime,assetStartTime:this.assetStartTime,assetEndTime:this.assetEndTime,renditionOrder:this.renditionOrder,metadata:this.metadata,playerInitTime:this.playerInitTime,playerSoftwareName:this.playerSoftwareName,playerSoftwareVersion:this.playerSoftwareVersion,startTime:this.startTime,initialBandwidthEstimateKbps:this.initialBandwidthEstimateKbps,initialEstimateSegments:this.initialEstimateSegments,minPreloadSegments:this.minPreloadSegments,preferPlayback:this.preferPlayback,audio:this.audio,defaultStreamType:this.defaultStreamType,targetLiveWindow:this.getAttribute(aB.TARGET_LIVE_WINDOW),streamType:p6(this.getAttribute(aB.STREAM_TYPE)),primaryColor:this.getAttribute(vC.PRIMARY_COLOR),secondaryColor:this.getAttribute(vC.SECONDARY_COLOR),accentColor:this.getAttribute(vC.ACCENT_COLOR),forwardSeekOffset:this.forwardSeekOffset,backwardSeekOffset:this.backwardSeekOffset,defaultHiddenCaptions:this.defaultHiddenCaptions,defaultDuration:this.defaultDuration,defaultShowRemainingTime:this.defaultShowRemainingTime,hideDuration:(J=null==(n=this.mediaController)?void 0:n.querySelector("media-time-display"))&&"none"===getComputedStyle(J).getPropertyValue("--media-duration-display-display").trim(),playbackRates:this.getAttribute(vC.PLAYBACK_RATES),customDomain:null!=(a=this.getAttribute(aB.CUSTOM_DOMAIN))?a:void 0,title:this.getAttribute(vC.TITLE),videoTitle:null!=(r=this.getAttribute(vC.VIDEO_TITLE))?r:this.getAttribute(vC.TITLE),novolumepref:this.hasAttribute(vC.NO_VOLUME_PREF),nomutedpref:this.hasAttribute(vC.NO_MUTED_PREF),proudlyDisplayMuxBadge:this.hasAttribute(vC.PROUDLY_DISPLAY_MUX_BADGE),castReceiver:this.castReceiver,disablePseudoEnded:this.hasAttribute(vC.DISABLE_PSEUDO_ENDED),capRenditionToPlayerSize:this.capRenditionToPlayerSize,...t,extraSourceParams:this.extraSourceParams},s=vE`
  <style>
    ${(e=>{let{tokens:t}=e;return t.drm?":host(:not([cast-receiver])) { --_cast-button-drm-display: none; }":""})(X)}
    ${vc}
  </style>
  ${l=X,vE`
  <media-theme
    template="${l.themeTemplate||!1}"
    defaultstreamtype="${null!=(d=l.defaultStreamType)&&d}"
    hotkeys="${ee=l.hotKeys?`${l.hotKeys}`:"","live"===p6(l.streamType)&&(ee+=" noarrowleft noarrowright"),ee||!1}"
    nohotkeys="${l.noHotKeys||!l.hasSrc||!1}"
    noautoseektolive="${!!(null!=(u=l.streamType)&&u.includes(tK))&&0!==l.targetLiveWindow}"
    novolumepref="${l.novolumepref||!1}"
    nomutedpref="${l.nomutedpref||!1}"
    disabled="${!l.hasSrc||l.isDialogOpen}"
    audio="${null!=(c=l.audio)&&c}"
    style="${null!=(Z={"--media-primary-color":l.primaryColor,"--media-secondary-color":l.secondaryColor,"--media-accent-color":l.accentColor},et="",Object.entries(Z).forEach(([e,t])=>{null!=t&&(et+=`${pX(e)}: ${t}; `)}),h=et?et.trim():void 0)&&h}"
    defaultsubtitles="${!l.defaultHiddenCaptions}"
    forwardseekoffset="${null!=(m=l.forwardSeekOffset)&&m}"
    backwardseekoffset="${null!=(p=l.backwardSeekOffset)&&p}"
    playbackrates="${null!=(v=l.playbackRates)&&v}"
    defaultshowremainingtime="${null!=(b=l.defaultShowRemainingTime)&&b}"
    defaultduration="${null!=(g=l.defaultDuration)&&g}"
    hideduration="${null!=(f=l.hideDuration)&&f}"
    title="${null!=(E=l.title)&&E}"
    videotitle="${null!=(y=l.videoTitle)&&y}"
    proudlydisplaymuxbadge="${null!=(T=l.proudlyDisplayMuxBadge)&&T}"
    exportparts="${vy}"
    onclose="${l.onCloseErrorDialog}"
    onfocusin="${l.onFocusInErrorDialog}"
  >
    <mux-video
      slot="media"
      inert="${null!=(A=l.noHotKeys)&&A}"
      target-live-window="${null!=(k=l.targetLiveWindow)&&k}"
      stream-type="${null!=(w=p6(l.streamType))&&w}"
      crossorigin="${null!=(S=l.crossOrigin)?S:""}"
      playsinline
      autoplay="${null!=(I=l.autoplay)&&I}"
      muted="${null!=(R=l.muted)&&R}"
      loop="${null!=(C=l.loop)&&C}"
      preload="${null!=(L=l.preload)&&L}"
      debug="${null!=(M=l.debug)&&M}"
      prefer-cmcd="${null!=(D=l.preferCmcd)&&D}"
      disable-tracking="${null!=(x=l.disableTracking)&&x}"
      disable-cookies="${null!=(P=l.disableCookies)&&P}"
      prefer-playback="${null!=(N=l.preferPlayback)&&N}"
      start-time="${null!=l.startTime&&l.startTime}"
      initial-bandwidth-estimate-kbps="${null!=l.initialBandwidthEstimateKbps&&l.initialBandwidthEstimateKbps}"
      initial-estimate-segments="${null!=l.initialEstimateSegments&&l.initialEstimateSegments}"
      min-preload-segments="${null!=l.minPreloadSegments&&l.minPreloadSegments}"
      beacon-collection-domain="${null!=(O=l.beaconCollectionDomain)&&O}"
      player-init-time="${null!=(U=l.playerInitTime)&&U}"
      player-software-name="${null!=(B=l.playerSoftwareName)&&B}"
      player-software-version="${null!=(H=l.playerSoftwareVersion)&&H}"
      env-key="${null!=(W=l.envKey)&&W}"
      custom-domain="${null!=($=l.customDomain)&&$}"
      src="${l.src?l.src:!!l.playbackId&&iz(l)}"
      cast-src="${l.src?l.src:!!l.playbackId&&iz(l)}"
      cast-receiver="${null!=(q=l.castReceiver)&&q}"
      drm-token="${null!=(F=null==(V=l.tokens)?void 0:V.drm)&&F}"
      playback-token="${null!=(G=null==(K=l.tokens)?void 0:K.playback)&&G}"
      exportparts="video"
      disable-pseudo-ended="${null!=(j=l.disablePseudoEnded)&&j}"
      max-auto-resolution="${null!=(Y=l.maxAutoResolution)&&Y}"
      cap-rendition-to-player-size="${null!=(Q=l.capRenditionToPlayerSize)&&Q}"
    >
      ${l.storyboard?vE`<track label="thumbnails" default kind="metadata" src="${l.storyboard}" />`:vE``}
      <slot></slot>
    </mux-video>
    <slot name="poster" slot="poster">
      <media-poster-image
        part="poster"
        exportparts="poster, img"
        src="${!!l.poster&&l.poster}"
        placeholdersrc="${null!=(z=l.placeholder)&&z}"
      ></media-poster-image>
    </slot>
  </media-theme>
`}
`,o=this.shadowRoot,s.renderInto(o)},vz=function(){let e=e=>{var t,i;if(!(null!=e&&e.startsWith("theme-")))return;let a=e.replace(/^theme-/,"");if(vL.includes(a))return;let r=this.getAttribute(e);null!=r?null==(t=this.mediaTheme)||t.setAttribute(a,r):null==(i=this.mediaTheme)||i.removeAttribute(a)};uM(this,vB,new MutationObserver(t=>{for(let{attributeName:i}of t)e(i)})),uC(this,vB).observe(this,{attributes:!0}),this.getAttributeNames().forEach(e)},vZ=function(){this.addEventListener("error",uC(this,vF)),this.media&&(this.media.errorTranslator=(e={})=>{var t,i,a;if(!((null==(t=this.media)?void 0:t.error)instanceof t$))return e;let r=vT(null==(i=this.media)?void 0:i.error,!1);return{player_error_code:null==(a=this.media)?void 0:a.error.code,player_error_message:r.message?String(r.message):e.player_error_message,player_error_context:r.context?String(r.context):e.player_error_context}})},vX=function(){var e,t,i,a;null==(t=null==(e=this.media)?void 0:e.textTracks)||t.addEventListener("addtrack",uC(this,v$)),null==(a=null==(i=this.media)?void 0:i.textTracks)||a.addEventListener("removetrack",uC(this,v$))},vJ=function(){var e,t;if(!/Firefox/i.test(navigator.userAgent))return;let i,a=new WeakMap,r=()=>this.streamType===tK&&!this.secondaryColor&&this.offsetWidth>=800,n=(e,t,i=!1)=>{r()||Array.from(e&&e.activeCues||[]).forEach(e=>{if(!(!e.snapToLines||e.line<-5||e.line>=0&&e.line<10))if(!t||this.paused){let t=e.text.split(`
`).length,r=-3;this.streamType===tK&&(r=-2);let n=r-t;if(e.line===n&&!i)return;a.has(e)||a.set(e,e.line),e.line=n}else setTimeout(()=>{e.line=a.get(e)||"auto"},500)})},s=()=>{var e,t;n(i,null!=(t=null==(e=this.mediaController)?void 0:e.hasAttribute(nS))&&t)},o=()=>{var e,t;let a=Array.from((null==(t=null==(e=this.mediaController)?void 0:e.media)?void 0:t.textTracks)||[]).filter(e=>["subtitles","captions"].includes(e.kind)&&"showing"===e.mode)[0];a!==i&&(null==i||i.removeEventListener("cuechange",s)),null==(i=a)||i.addEventListener("cuechange",s),n(i,uC(this,vO))};o(),null==(e=this.textTracks)||e.addEventListener("change",o),null==(t=this.textTracks)||t.addEventListener("addtrack",o);let l=()=>{var e,t;let a=null==(t=null==(e=this.mediaController)?void 0:e.hasAttribute(nS))||t;uC(this,vO)!==a&&(uM(this,vO,a),n(i,uC(this,vO)))};this.addEventListener("userinactivechange",l),uM(this,vq,()=>{var e,t;null==i||i.removeEventListener("cuechange",s),null==(e=this.textTracks)||e.removeEventListener("change",o),null==(t=this.textTracks)||t.removeEventListener("addtrack",o),this.removeEventListener("userinactivechange",l)})},e.s(["default",()=>v9,"getVideoAttribute",()=>v8,"playerSoftwareName",()=>v3,"playerSoftwareVersion",()=>p8],6552);var v6=e=>{throw TypeError(e)},v7=(e,t,i)=>t.has(e)||v6("Cannot "+i),be=class{addEventListener(){}removeEventListener(){}dispatchEvent(e){return!0}};"u"<typeof DocumentFragment&&(globalThis.DocumentFragment=class extends be{});var bt,bi=class extends be{},ba=class{constructor(e,t={}){((e,t,i)=>t.has(e)?v6("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,i))(this,bt),((e,t,i,a)=>(v7(e,t,"write to private field"),a?a.call(e,i):t.set(e,i)))(this,bt,null==t?void 0:t.detail)}get detail(){let e,t;return v7(this,e=bt,"read from private field"),t?t.call(this):e.get(this)}initCustomEvent(){}};bt=new WeakMap;var br={document:{createElement:function(e,t){return new bi}},DocumentFragment,customElements:{get(e){},define(e,t,i){},getName:e=>null,upgrade(e){},whenDefined:e=>Promise.resolve(bi)},CustomEvent:ba,EventTarget:be,HTMLElement:bi,HTMLVideoElement:class extends be{}},bn="u"<typeof window||void 0===globalThis.customElements,bs=bn?br:globalThis;bn&&br.document,bs.customElements.get("mux-player")||(bs.customElements.define("mux-player",v9),bs.MuxPlayerElement=v9),e.i(6552);var bo=parseInt(r.default.version)>=19,bl={className:"class",classname:"class",htmlFor:"for",crossOrigin:"crossorigin",viewBox:"viewBox",playsInline:"playsinline",autoPlay:"autoplay",playbackRate:"playbackrate"};function bd(e,t){if("function"==typeof e)return e(t);null!=e&&(e.current=t)}var bu=Object.prototype.hasOwnProperty,bc=(e,t,i)=>!((e,t)=>{if(Object.is(e,t))return!0;if("object"!=typeof e||null===e||"object"!=typeof t||null===t)return!1;if(Array.isArray(e))return!!Array.isArray(t)&&e.length===t.length&&e.some((e,i)=>t[i]===e);let i=Object.keys(e),a=Object.keys(t);if(i.length!==a.length)return!1;for(let a=0;a<i.length;a++)if(!bu.call(t,i[a])||!Object.is(e[i[a]],t[i[a]]))return!1;return!0})(t,e[i]),bh=(e,t,i)=>{e[i]=t},bm=(e,t,i,a=bh,n=bc)=>(0,r.useEffect)(()=>{let r=null==i?void 0:i.current;r&&n(r,t,e)&&a(r,t,e)},[null==i?void 0:i.current,t]),bp=(()=>{try{return"3.13.0"}catch{}return"UNKNOWN"})(),bv=(e,t,i)=>(0,r.useEffect)(()=>{let a=null==t?void 0:t.current;if(a&&i)return a.addEventListener(e,i),()=>{a.removeEventListener(e,i)}},[null==t?void 0:t.current,i,e]),bb=r.default.forwardRef(({children:e,...t},i)=>r.default.createElement("mux-player",{suppressHydrationWarning:!0,...((e={})=>{let{ref:t,...i}=e;return Object.entries(i).reduce((e,[t,i])=>{let a=((e,t)=>{if(!(!bo&&"boolean"==typeof t&&!t)){let i,a;if(i=e,null!=(a=bl)&&i in a)return bl[e];if(void 0!==t)return/[A-Z]/.test(e)?e.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`):e}})(t,i);if(!a)return e;let r=bo||"boolean"!=typeof i?i:"";return e[a]=r,e},{})})(t),ref:i},e)),bg="mux-player-react",bf=r.default.forwardRef((e,t)=>{var i;let a=(0,r.useRef)(null),n=function(...e){return r.useCallback(function(...e){return t=>{let i=!1,a=e.map(e=>{let a=bd(e,t);return i||"function"!=typeof a||(i=!0),a});if(i)return()=>{for(let t=0;t<a.length;t++){let i=a[t];"function"==typeof i?i():bd(e[t],null)}}}}(...e),e)}(a,t),[s]=((e,t)=>{let{onAbort:i,onCanPlay:a,onCanPlayThrough:r,onEmptied:n,onLoadStart:s,onLoadedData:o,onLoadedMetadata:l,onProgress:d,onDurationChange:u,onVolumeChange:c,onRateChange:h,onResize:m,onWaiting:p,onPlay:v,onPlaying:b,onTimeUpdate:g,onPause:f,onSeeking:E,onSeeked:y,onStalled:T,onSuspend:A,onEnded:k,onError:w,onCuePointChange:S,onChapterChange:I,metadata:R,tokens:C,paused:L,playbackId:M,playbackRates:D,currentTime:x,themeProps:P,extraSourceParams:N,castCustomData:O,_hlsConfig:U,...B}=t;return bm("tokens",C,e),bm("playbackId",M,e),bm("playbackRates",D,e),bm("metadata",R,e),bm("extraSourceParams",N,e),bm("_hlsConfig",U,e),bm("themeProps",P,e),bm("castCustomData",O,e),bm("paused",L,e,(e,t)=>{null!=t&&(t?e.pause():e.play())},(e,t,i)=>(!e.hasAttribute("autoplay")||!!e.hasPlayed)&&bc(e,t,i)),bm("currentTime",x,e,(e,t)=>{null!=t&&(e.currentTime=t)}),bv("abort",e,i),bv("canplay",e,a),bv("canplaythrough",e,r),bv("emptied",e,n),bv("loadstart",e,s),bv("loadeddata",e,o),bv("loadedmetadata",e,l),bv("progress",e,d),bv("durationchange",e,u),bv("volumechange",e,c),bv("ratechange",e,h),bv("resize",e,m),bv("waiting",e,p),bv("play",e,v),bv("playing",e,b),bv("timeupdate",e,g),bv("pause",e,f),bv("seeking",e,E),bv("seeked",e,y),bv("stalled",e,T),bv("suspend",e,A),bv("ended",e,k),bv("error",e,w),bv("cuepointchange",e,S),bv("chapterchange",e,I),[B]})(a,e),[o]=(0,r.useState)(null!=(i=e.playerInitTime)?i:iY());return r.default.createElement(bb,{ref:n,defaultHiddenCaptions:e.defaultHiddenCaptions,playerSoftwareName:bg,playerSoftwareVersion:bp,playerInitTime:o,...s})});e.s(["default",()=>bf,"playerSoftwareName",()=>bg,"playerSoftwareVersion",()=>bp],68399),e.i(68399),e.s(["MaxResolution",()=>tX,"MediaError",()=>t$,"MinResolution",()=>tJ,"RenditionOrder",()=>t0,"default",()=>bf,"generatePlayerInitTime",()=>iY,"playerSoftwareName",()=>bg,"playerSoftwareVersion",()=>bp],42033)}]);