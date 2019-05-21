/**
 * 日历控件
 * 1.初始化日历数据
 * 2.创建日历元素
 * 3.添加点击日历切换事件
 * */ 
;(function(undefined){
    "use strict"
    var _global;
    /**
     *
     *
     * @param {Object} o 原始对象
     * @param {Object} n 需要合并对象
     * @param {Boolean} flag flag 为true时覆盖原始对象
     * @returns 合并后的对象
     */
    function extend(o, n, flag) {
        for (var key in n) {
            if (n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || flag)) {
                o[key] = n[key];
            }
        }
        return o;
    }
    /**
     *
     *
     * @param {String} date 格式为时间字符串
     * @returns 格式化后的对象
     */
    function splitDate (date) {
        let _date = new Date(date.replace(/-/g, '/'));
        let y = _date.getFullYear();
        let m = _date.getMonth() + 1;
        let d = _date.getDate();
        let w = _date.getDay();
        return {y, m, d, w}
    }
    /**
     *
     *
     * @param {String} date 格式为时间字符串
     * @returns 当前月的天数
     */
    function getDays(date) {
        let {y, m} = splitDate(date);
        return new Date(y, m, 0).getDate(); // 当设置参数为0时返回上个月的最后一天，也就是天数，所以要获取当月的天数需要再获取的月份+1
    }
    function getFirstWeek(date) {
        let {y, m} = splitDate(date);
        return new Date(`${y}/${m}/1`).getDay(); // 返回某个月的第一天为周几
    }
    function fixZero(num) {
        return num < 10 ? '0' + num : num;
    }
    /**
     *
     *
     * @param {String} date 格式为时间字符串
     * @param {Number} interval 间隔的时间数
     * @param {string} [type='month'] 间隔时间的类型默认为month, 可选值有month, year
     * @returns
     */
    function getDate(date, interval, type= 'month') {
        let { y, m} = splitDate(date);
        switch(type) {
            case "month":
                if (m + interval < 1 && interval < 0) {
                    y = y - 1;
                    m = m + interval + 12;
                } else if ( m + interval > 12 && interval > 0) {
                    y = y + 1;
                    m = m + interval - 12;
                } else {
                    m = m + interval;
                }
                break;
            case "year":
                y = y + interval;
                break;
        }
        
        return { y, m}
    }
    const WEEK = ['一', '二', '三', '四', '五', '六', '日'];
    const DATE = new Date();
    const y = DATE.getFullYear(),
        m = fixZero(DATE.getMonth() + 1),
        d = fixZero(DATE.getDate()),
        w = DATE.getDay();
    let date = `${y}-${m}-${d}`;
    let jumpDate = date;
    function DatePicker(container, options) {
        this.$container = null;
        var mark = container.split('')[0];
        if (mark === '#') {
            this.$container = document.getElementById(container.replace(/^#/, ''));
        } else if (mark === '.') {
            this.$container = document.getElementsByClassName(container.replace(/^./, ''))[0]
        }
        
        this._init(options);
    }

    DatePicker.prototype = {
        constructor: this,
        _init: function(options) {
            const defaults = {
                defaultDate: date, // 默认日期
                callback: null, // 选择后的回调函数
                autoClose: false, // 是否自动关闭
                show: false, // 是否自动显示
                type: 'single', // 选择类型Sring, 可选值有 single(单选)， range(范围), multiple(多选)
                disabledDate: [false, date], // 不可选的日期 [Array] 类型 [date, date] 限制中间日期 [false, false] 不限制 [true, date] [date, false]// 限制当前日期之前 [date, true] [false, date]// 限制之后的日期
            }
            let opt = extend(defaults, options, true); 
            if (opt.defaultDate) {
                date = opt.defaultDate;
            }
            this.disabledDate = opt.disabledDate;
            this.type = opt.type;
            this.autoClose = opt.autoClose;
            this.callback = opt.callback;
            this._disabledType();
            this._initDom();
            this._initData(date);
            this._bindEvent();
            this.value = [];
            if (opt.show) {
                this.show();
            } else {
                this.hide();
            }
            return this;
        },
        _disabledType: function () { // 判断是那种不可选的类型
            var date = this.disabledDate;
            var firstType = typeof date[0];
            var secondType = typeof date[1];
            var disabled = '';
            var type = '';
            if (firstType ==='boolean' && date[0] && secondType === 'string' && date[1]) { // 限制之前的日期
                disabled = date[1];
                type = 'before';
            } else if ( firstType ==='string' && date[0] && secondType === 'boolean' && !date[1]) { // 限制之前的日期
                disabled = date[0];
                type = 'before';
            }else if (firstType ==='boolean' && !date[0] && secondType === 'string' && date[1]) { // 限制之前的日期
                disabled = date[1];
                type = 'after';
            }else if ( firstType ==='string' && date[0] && secondType === 'boolean' && date[1]) { // 限制之前的日期
                disabled = date[0];
                type = 'after';
            }else if (firstType ==='boolean'  && date[0] && secondType === 'boolean' && date[1]) { // 全部限制
                disabled = 'true';
                type = 'true';
            }else if (firstType ==='string'  && date[0] && secondType === 'string' && date[1]) { // 全部限制
                disabled = date[0];
                type = date[1];
            }else {
                disabled = 'false';
                type = 'false';
            }
            this.disabledType = {disabled, type}
            console.log(this.disabledType)
        },
        _checkDisabled: function (date) {
            let res = this.disabledType;
            if (res.type === 'before') {
                if (new Date(date).getTime() < new Date(res.disabled).getTime()) {
                    return true
                }
            } else if (res.type === 'after') {
                if (new Date(date).getTime() > new Date(res.disabled).getTime()) {
                    return true
                }
            } else if (res.type === 'true') {
                return true
            } else if (res.type === 'false') {
                return false
            } else {
                if (new Date(date).getTime() > new Date(res.disabled).getTime() && new Date(date).getTime() < new Date(res.type).getTime()) {
                    return true
                }
            }
        },
        _initDom: function () {
            this.$dateContainer = document.createElement('div');
            this.$dateContainer.className = 'r-date-container';
            this._initHeader();
            this._initBody();
            if (this.$container) {
                this.$container.appendChild(this.$dateContainer);
            } else {
                document.body.appendChild(this.$dateContainer);
            }
            return this;
        },
        _initHeader: function () {
            this.$dateHeader = document.createElement('div');
            this.$dateHeader.className = 'r-date-header';
            this.$dateHeader.innerHTML = `<span class="r-header-year-left"></span>
            <span class="r-header-month-left"></span>
            <span class="r-header-content">${y}-${m}</span>
            <span class="r-header-month-right"></span>
            <span class="r-header-year-right"></span>`;
            this.$dateContainer.appendChild(this.$dateHeader);
            return this;
        },
        _initBody: function () { // 初始化日历数据
            this.$dateBody = document.createElement('table');
            this.$dateBody.className = 'r-date-body';
            let _htmlWeek = [];
            this.$dateMain = document.createElement('tbody');
            for (var i = 0; i < WEEK.length; i += 1) {
                _htmlWeek.push(`<th>${WEEK[i]}</th>`)
            }
            let _html = `<thead><tr>${_htmlWeek.join('')}</tr></thead>`;
            this.$dateBody.innerHTML = _html;
            this.$dateBody.appendChild(this.$dateMain);
            this.$dateContainer.appendChild(this.$dateBody);
            return this;
        },
        _initData (date) {
            let data = [];
            let prev = getDate(date, -1);
            let next = getDate(date, 1);
            let prevY = prev.y,
                prevM = prev.m,
                nextY = next.y,
                nextM = next.m;
            let days = getDays(date);
            let prevMonthDays = getDays(`${prevY}/${prevM}/1`);
            let firstWeek = getFirstWeek(date) ? getFirstWeek(date) : 7;
            let {y, m} = splitDate(date);
            for (let i = 0; i < 42; i += 1) {
                if (i < firstWeek - 1) {
                    data.unshift(`${prevY}-${fixZero(prevM)}-${fixZero(prevMonthDays - i)}`);
                } else if (i < firstWeek + days - 1) {
                    data.push(`${y}-${fixZero(m)}-${fixZero(i - firstWeek + 2)}`)
                } else {
                    data.push(`${nextY}-${fixZero(nextM)}-${fixZero(i - firstWeek - days + 2)}`)
                }
            }
            this.data = data; // 日期数据
            this._initDate(data, firstWeek -1, firstWeek + days - 1);
            return this;
        },
        _initDate (data, min, max) {
            let _html = '';
            let disabled = false;
            for (let i = 1; i <= data.length / 7; i++) {
                _html += '<tr>';
                for (let j = 0; j < 7; j ++) {
                    let _class = (i-1)*7 + j < min || (i-1)*7 + j >= max || this._checkDisabled(data[(i-1)*7 + j])? 'disabled' : (data[(i-1)*7 + j] === date ? 'today': '');
                    _html += `<td data-date=${data[(i-1)*7 + j]} class=${_class}>
                    <span>${fixZero(splitDate(data[(i-1)*7 + j]).d)}</span></td>`
                }
                _html += '</tr>';
            }
            this.$dateMain.innerHTML = _html;
            return this;
        },
        _bindEvent () {
            let _this = this;
            let $prevYear = this.$dateHeader.getElementsByClassName('r-header-year-left')[0];
            let $nextYear = this.$dateHeader.getElementsByClassName('r-header-year-right')[0];
            let $prevMonth = this.$dateHeader.getElementsByClassName('r-header-month-left')[0];
            let $nextMonth = this.$dateHeader.getElementsByClassName('r-header-month-right')[0];
            let $conent = this.$dateHeader.getElementsByClassName('r-header-content')[0];
            $prevYear.onclick = function() {
                let __date = getDate(jumpDate, -1, 'year');
                jumpDate = `${__date.y}-${fixZero(__date.m)}`;
                _this._initData(jumpDate);
                $conent.innerText = jumpDate;
            }
            $nextYear.onclick = function() {
                let __date = getDate(jumpDate, 1, 'year');
                jumpDate = `${__date.y}-${fixZero(__date.m)}`;
                _this._initData(jumpDate);
                $conent.innerText = jumpDate;
            }
            $prevMonth.onclick = function() {
                let __date = getDate(jumpDate, -1);
                jumpDate = `${__date.y}-${fixZero(__date.m)}`;
                _this._initData(jumpDate);
                $conent.innerText = jumpDate;
            }
            $nextMonth.onclick = function() {
                let __date = getDate(jumpDate, 1);
                jumpDate = `${__date.y}-${fixZero(__date.m)}`;
                _this._initData(jumpDate);
                $conent.innerText = jumpDate;
            }
            this.$dateMain.onclick = function(ev) { // 日期点击事件
                let target = ev.target;
                if ( target.tagName.toUpperCase() === 'SPAN' && target.parentNode.getAttribute('class').indexOf('disabled') === -1) {
                    let { date } = target.parentNode.dataset;
                    if (_this.autoClose) {
                        _this.hide();
                    }
                    _this._selected(date); // 选中数据
                    _this._initStyle();
                }
            }
        },
        _selected (date) {
            const _this = this;
            switch (_this.type) {
                case "multiple": 
                    if (_this.value.indexOf(date) === -1) { 
                        _this.value.push(date);
                    } else {
                        _this.value.splice(_this.value.indexOf(date), 1);
                    }
                    break;
                case "range":
                    if (_this.value.length >= 2) {
                        _this.value = [date]
                    } else {
                        _this.value.push(date);
                    }
                    break;
                default:
                    _this.value = [date];
                    break;
            }
            _this.value.sort(function(a, b) {
                return new Date(a).getTime() - new Date(b).getTime()
            });
            if (_this.type === 'range') {
                if (_this.value.length == 2 && new Date(_this.value[0]).getTime() !== new Date(_this.value[1]).getTime()) {
                    let value = _this.data.filter(function(item, index){
                        return new Date(item).getTime() >= new Date(_this.value[0]).getTime() && new Date(item).getTime() <= new Date(_this.value[1]).getTime()
                    })
                    _this.value = value;
                }
            }
            if (_this.callback) {
                _this.callback(_this.value.join(','));
            }
        },
        _initStyle () {
            let _this = this;
            var $item = this.$dateMain.getElementsByTagName('td');
            [].forEach.call($item, function(item, index) {
                var itemKey = item.dataset.date;
                var __class = item.getAttribute('class');
                switch(_this.type) {
                    case "multiple":
                        if (_this.value.indexOf(itemKey) !== -1) {
                            item.className = __class + ' active'
                        } else {
                            item.className = __class.replace('active', '');
                        }
                        break;
                    case "range":
                        if (_this.value.indexOf(itemKey) !== -1) {
                            if (__class.indexOf('active') === -1) item.className = __class + ' active';
                        } else {
                            item.className = __class.replace('active', '');
                        }
                        if (_this.value.length === 2) {

                        }
                        break;
                    default:
                        if (_this.value.indexOf(itemKey) !== -1) {
                            if (__class.indexOf('active') === -1) item.className = __class + ' active';
                        } else {
                            item.className = __class.replace('active', '');
                        }
                        break;
                }
            })
            return this;
        },
        show () {
            this.$dateContainer.style.display = 'block';
            return this;
        },
        hide () {
            this.$dateContainer.style.display = 'none';
            return this;
        }
    }

    _global = (function(){
        return this || (0, eval)('this');
    })();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DatePicker
    } else if (typeof define === 'function' && define.amd) {
        define(function(){
            return DatePicker
        })
    } else {
        !('DatePicker' in _global) && (_global.DatePicker = DatePicker)
    }
})();