
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
                this.left = value[0]/(max-min) * 100;
                this.real = value;
            } else {
                this.value = value/(max-min) * 100;
                this.left = 0;
                this.real = [0, value];
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
            this.boxWidth = window.getComputedStyle(this.$box, null).width;
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
            let endX = ev.clientX;
            let startX = this.position.x;
            let moudles = handleDecimal(endX, this.step); // 判断是否需要移动
            let value = this.position.value;
            this.prev = item.dataset.value;
            if (moudles) return false;
            let dis = this.step / (this.max - this.min) * parseFloat(this.boxWidth); // 移动的距离是该倍数时
            let distance = Math.ceil((endX - startX) / dis) * dis; // 移动距离
            let distancePer = Number.parseFloat(distance / parseFloat(this.boxWidth) * 100); // 移动百分比
            let left = this.position.left;
            let formatPer = distancePer;
            let m = formatPer + Number.parseFloat(left) > 100 ? 100 : (formatPer + Number.parseFloat(left));
                m = m < 0 ? 0 : m;
            item.style.left = m + '%';
            item.dataset.value = Number.parseFloat(Number.parseFloat(item.style.left) / 100 * _this.max);
            let leftValue = [].map.call(this.$sliderButton, function(item, index) {
                return Number.parseFloat(item.style.left);
            }).sort(sortNumber);
            if (!this.range) leftValue.unshift(0);
            let sliderBarWidth = leftValue[1] - leftValue[0];
            this.$sliderBar.style.left = leftValue[0] + '%';
            this.$sliderBar.style.width = sliderBarWidth + '%';
            this.$sldierTooltip.style.left = item.style.left;
            this.$sldierTooltip.innerText = Number.parseInt(Number.parseFloat(item.style.left) / 100 * _this.max);
            this.realVal = leftValue.map(function(item, index) {
                return Number.parseInt(item / 100 * _this.max);
            })
            this.$sldierTooltip.style.display = 'block';
            // this.position.x = endX;
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