/**
 * 
 */
;(function(undifined) {
    "use strict"
     var _global;
     function extend(o, n, flag) {
         for (var key in n) {
             if (n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || flag)) {
                 o[key] = n[key];
             }
         }
         return o;
     }

     function Carousel(options) {
         this._init(options);
     }

     Carousel.prototype = {
         constructor: this,
         _init: function(options) {
             var defaults = {
                 showBtn: true,
                 showPoint: true,
                 trigger: 'click',
                 auto: false
             }
         }
     }

     _global = (function() {
        return this || (0, eval)('this');
    }());
    if (typeof module !== "undefined" && module.exports) {
        module.exports = Carousel;
    } else if (typeof define === "function" && define.amd) {
        define(function(){
            return Carousel;
        })
    } else {
        !('Carousel' in _global) && (_global.Carousel = Carousel)
    }
})();