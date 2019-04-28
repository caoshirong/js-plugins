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
                container: '.carousel-container',
                showPoint: true, // 默认显示按钮 
                trigger: 'click', // 默认为点击按钮触发
                direction: 'horizontal', // 默认水平， 垂直vertical
                autoPlay: 3000,
                initIndex: 0, // 默认初始化显示的
            };
            var opt = extend(defaults, options, true);
            this.$container = null;
            var mark = opt.container.split('')[0];
            this.direction = opt.direction;
            this.autoPlay = opt.autoPlay;
            if (mark === '#') {
                this.$container = document.getElementById(opt.container.replace(/^#/, ''));
            } else if (mark === '.') {
                console.log(opt.container.replace(/^./, ''));
                this.$container = document.getElementsByClassName(opt.container.replace(/^./, ''))[0]
            }
            if (this.$container) {
                this.index = opt.initIndex;
                this.$container.className = this.$container.getAttribute('class') + ' carousel-container-' + opt.direction;
                this.$wrapper = this.$container.getElementsByClassName('carousel-wrapper')[0];
                var {width, height} = window.getComputedStyle(this.$container,null);
                this.slideWidth = width;
                this.slideHeight = height;
                this.timer = null;
                if (opt.showPoint) {
                    this._initPoint();
                }
                this._initSlide();
                this._initPlay(); // 初始化运行轮播
                this._bindEvent();
            } else {
                console.log('容器不存在');
                return false;
            }
            return this;
        },
        _initSlide: function() { // 初始化slide
            var $slide = this.$wrapper.getElementsByClassName('carousel-slide');
            var __this = this;
            [].forEach.call($slide, function(item, index) {
                item.style.width = __this.slideWidth;
            });
            return this;
        },
        _initPoint: function() { // 初始化指示点
            var __this = this;
            var $slide = this.$wrapper.getElementsByClassName('carousel-slide');
            this.$pointWrapper = document.createElement('div');
            this.$pointWrapper.className = 'carousel-point-wrapper';
            var __htmlArr = [];
            for (var i = 0; i < $slide.length; i += 1) {
                __htmlArr.push('<span class="carousel-point" data-index="'+ i +'"></span>')
            }
            this.$pointWrapper.onclick = function(e) {
                var ele = e.target;
                if (ele.tagName.toUpperCase() === 'SPAN') {
                    __this.index = Number.parseInt(ele.dataset.index);
                    __this._initPlay();
                }
            }
            this.$pointWrapper.innerHTML= __htmlArr.join('');
            this.$container.appendChild(this.$pointWrapper);
            return this;
        },
        _initPointStyle: function() {
            var __this = this;
            var $point = this.$pointWrapper.getElementsByClassName('carousel-point');
            [].forEach.call($point, function(item, index) {
                var className = item.getAttribute('class');
                var has = /\sactive/g.test(className);
                if (index === __this.index) {
                    if(!has) {
                        item.className = className + ' active';
                    }
                } else {
                    item.className = item.className.replace(/\sactive/g, '');
                }
            })
        },
        _play: function() { // 动画运行
            var $slide = this.$wrapper.getElementsByClassName('carousel-slide');
            if (this.index >= $slide.length) {
                this.index = 0;
            }
            if (this.direction === 'horizontal') {
                var translateX = Number.parseInt(this.slideWidth) * this.index;
                this.$wrapper.style.transform = 'translate3d(-'+translateX +'px, 0, 0)';
            } else {
                var translateY = Number.parseInt(this.slideHeight) * this.index;
                this.$wrapper.style.transform = 'translate3d(0, -'+translateY +'px, 0)';
            }
            this._initPointStyle();
        },
        _autoPlay: function() {
            var __this = this;
            this.timer = setInterval(function(){
                __this.index += 1;
                __this._play();
            }, this.autoPlay);
        },
        _bindEvent: function() { // 左右按钮添加事件
            var __this = this;
            var $prev = this.$container.getElementsByClassName('carousel-button-prev')[0];
            var $next = this.$container.getElementsByClassName('carousel-button-next')[0];
            $prev.onclick = function(ev) {
                __this.index -= 1;
                __this._initPlay();
                
            }
            $next.onclick = function(ev) {
                __this.index += 1;
                __this._initPlay();
            }
        },
        _initPlay: function() {
            clearInterval(this.timer);
            this._play();
            if (this.autoPlay) {
                this._autoPlay();
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