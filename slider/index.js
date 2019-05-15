
;(function(undefined) {
    'use strict'
    var _global;
    var PLUGIN_NAME = Slider;
    function extend(o, n, flag) {
        for (var key in n) {
            if (n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || flag)) {
                o[key] = n[key];
            }
        }
        return o;
    }

    function sortNumber (a, b) {
        return a - b;
    }

    function handleDecimal(pos,step){
        if(step<1){
            let sl = step.toString(),
                multiple = 1,
                m;
            try {
                m = sl.split('.')[1].length;
            } catch (e){
                m = 0;
            }
            multiple = Math.pow(10,m);
            return (pos * multiple) % (step * multiple) / multiple;
        }else return  pos % step;
    }

    function exportValue(nr, step){
        const decimalCases = (String(step).split('.')[1] || '').length;
        return Number(nr).toFixed(decimalCases)
    }

    const DISABLED_SLIDE_NAME = 'c-slider-disabled';

    function Slider(el, options) {
        this.$container = null;
        var mark = el.split('')[0];
        if (mark === '#') {
            this.$container = document.getElementById(el.replace(/^#/, ''));
        } else if (mark === '.') {
            this.$container = document.getElementsByClassName(el.replace(/^./, ''))[0]
        }
        this._init(options);
    }

    Slider.prototype = {
        constructor: this,
        _init(options) {
            const defaults = {
                value: 10, // 类型Number/Array, 当range 为true时则为Array, 否则为Number
                min: 0, //最小值
                max: 100, // 最大值
                step: 1, // 拖动的间隔
                disabled: false, // 是否启用禁用状态
                range: false, // boolean 是否支持范围选择当支持时value的值为数组[]
                callback: null,
                tooltip: true
            }
            let opt = extend(defaults, options, true);
            let { value, min, max, step, disabled, range, callback, tooltip } = opt;
            this.min = min;
            this.max = max;
            this.disabled = disabled;
            this.range = range;
            this.callback = callback;
            this.tooltip = tooltip;
            this.real = [];
            // 将所有数值转化为百分比存值方便计算运行的距离
            if (opt.range) {
                this.value = (value[1] - value[0])/(max-min) * 100;
                this.left = (value[0]-min)/(max-min) * 100;
                this.real = value;
            } else {
                this.value = (value-min)/(max-min) * 100;
                this.left = 0;
                this.real = [min, value];
            }
            this.step = step;
            this._initDom();
            this._bindEvent();
        },
        _initDom() {
            this.$box = document.createElement('div');
            this.$box.className = 'c-slider-container' + (this.disabled ? ' ' + DISABLED_SLIDE_NAME : '');
            let html = `<div class="c-slider-bar"  style="width: ${this.value}%;left: ${this.left}%"></div><div class="c-slider-button-wrapper" data-value="${this.range ? this.real[0]: this.real[1]}" style="left: ${this.range ? this.left: this.value}%"><div class="c-slider-button"></div></div>` + (this.range ? `<div class="c-slider-button-wrapper" data-value="${this.real[1]}" style="left: ${this.left + this.value}%"><div class="c-slider-button"></div></div>`: '') + (this.tooltip ? `<div class="c-silder-tooltip"></div>` : '') ;
            this.$box.innerHTML = html;
            this.$container.appendChild(this.$box);
            this.boxWidth = parseInt(window.getComputedStyle(this.$box, null).width, 10);
        },
        _bindEvent() {
            const _this = this;
            this.$sliderBar = this.$box.getElementsByClassName('c-slider-bar')[0];
            this.$sliderButton = this.$box.getElementsByClassName('c-slider-button-wrapper');
            this.$sldierTooltip = this.$box.getElementsByClassName('c-silder-tooltip')[0];
            [].forEach.call(this.$sliderButton, function(item, index) {
                item.addEventListener("mousedown", _this._mouseDown.bind(_this, item), false);
                item.addEventListener("mouseover", _this._mouseOver.bind(_this, item), false);
                item.addEventListener("mouseout", _this._mouseOut.bind(_this, item), false);
            });
        },
        _mouseMove(item, ev) { // 鼠标拖拽事件
            let _this = this;
            const sliderOffsetLeft = this.$box.getBoundingClientRect().left;
            let endX = ev.clientX;
            let newPos = exportValue(((endX - sliderOffsetLeft) / this.boxWidth * (this.max-this.min)) + this.min, this.step);
            let moudles = handleDecimal(newPos, this.step); // 判断是否需要移动
            if (moudles) return false;
            newPos = newPos > this.max ? this.max : (newPos < this.min ? this.min : newPos);
            item.dataset.value = newPos;
            let regularNewPos = (newPos - this.min) / (this.max-this.min) * 100 ;
            this.realVal = [].map.call(this.$sliderButton, function(item, index) {
                return exportValue(item.dataset.value, _this.step);
            }).sort(sortNumber);
            if (!this.range) this.realVal.unshift(this.min);
            let positionValue = this.realVal.map(function(item, index) {
                return (item - _this.min)/(_this.max - _this.min) * 100
            })
            let sliderBarWidth = positionValue[1] - positionValue[0];
            this.$sliderBar.style.width = sliderBarWidth + '%';
            this.$sliderBar.style.left = positionValue[0] + '%';
            this.$sldierTooltip.innerText = newPos;
            this.$sldierTooltip.style.left = regularNewPos + '%';
            this.$sldierTooltip.style.display = 'block';
            item.style.left = regularNewPos + '%';
        },
        _mouseDown(item, ev) { // 鼠标按下事件
            const _this = this;
            let { clientX, clientY } = ev; // 记录鼠标按下的位置
            this.position = {
                x: clientX,
                y: clientY,
                left: item.style.left, // 移动元素的left值
                value: item.dataset.value
            }
            document.onmousemove = function(event) {
                _this._mouseMove(item, event);
            }
            document.onmouseup = this._mouseUp.bind(_this);
        },
        _mouseOver(item, ev) {
            let left = item.dataset.value;
            this.$sldierTooltip.innerText = left;
            this.$sldierTooltip.style.display = 'block';
            this.$sldierTooltip.style.left = item.style.left;
        },
        _mouseOut() {
            this.$sldierTooltip.style.display = 'none';
        },
        _mouseUp() { // 鼠标移开事件清除事件
            document.onmousemove = null;
            document.onmouseup = null;
            this.$sldierTooltip.style.display = 'none';
            let value = this.range ? this.realVal : this.realVal[1];
            if (this.callback) this.callback(value);
        }
    }

    _global = (function(){
        return this || (0, eval)('this');
    })();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Slider
    } else if (typeof define === 'function' && define.amd) {
        define(function(){
            return Slider
        })
    } else {
        !('Slider' in _global) && (_global.Slider = Slider)
    }
})();