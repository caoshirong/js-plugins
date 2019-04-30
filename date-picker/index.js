/**
 * 日历控件
 * 1.初始化日历数据
 * 2.创建日历元素
 * 3.添加点击日历切换事件
 * 4.
 * */ 
;(function(undefined){
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
    function formateData(date) {
        // var d = 
    }
    function splitDate (date) {
        let _date = new Date(date.replace(/-/g, '/'));
        let y = _date.getFullYear();
        let m = _date.getMonth();
        let d = _date.getDate();
        let w = _date.getDay();
        return {y, m, d, w}
    }
    function getDays(date) {
        let {y, m} = splitDate(date);
        return new Date(y, m + 1, 0).getDate(); // 当设置参数为0时返回上个月的最后一天，也就是天数，所以要获取当月的天数需要再获取的月份+1
    }
    function getFirstWeek(date) {
        let {y, m} = splitDate(date);
        return new Date(y, m, 1).getDay();
    }
    function fixZero(num) {
        return num < 10 ? '0' + num : num;
    }
    const WEEK = ['一', '二', '三', '四', '五', '六', '日'];
    const DATE = new Date();
    const y = DATE.getFullYear(),
        m = fixZero(DATE.getMonth() + 1),
        d = fixZero(DATE.getDate()),
        w = DATE.getDay();
    let date = `${y}-${m}-${d}`;
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
                defaultDate: '',
            }
            let opt = extend(defaults, options, true); 
            if (opt.defaultDate) {
                date = opt.defaultDate;
            }
            this._initDom();
        },
        _initDom: function () {
            this.$dateContainer = document.createElement('div');
            this.$dateContainer.className = 'r-date-container';
            this._initHeader();
            this._initBody(date);
            if (this.$container) {
                this.$container.appendChild(this.$dateContainer);
            } else {
                document.body.appendChild(this.$dateContainer);
            }
        },
        _initHeader: function () {
            this.$dateHeader = document.createElement('div');
            this.$dateHeader.className = 'r-date-header';
            this.$dateHeader.innerHTML = `<span class="r-header-year-left"></span>
            <span class="r-header-month-left"></span>
            <span class="r-header-content">${date}</span>
            <span class="r-header-month-right"></span>
            <span class="r-header-year-right"></span>`;
            this.$dateContainer.appendChild(this.$dateHeader);
        },
        _initData (date) {
            let data = [];
            let {y, m} = splitDate(date);
            let days = getDays(date);
            let prevMonthDays = getDays(`${y}-${m}-1`);
            let nextMonthDays = getDays(`${y}-${m+2}-1`);
            let firstWeek = getFirstWeek(date);
            for (let i = 0; i < 42; i += 1) {
                if (i < firstWeek) {
                    data.shift(prevMonthDays - i);
                } else if (i < firstWeek + days) {
                    data.push(`${y}-${m}-${i}`)
                } else {
                    data.push(prevMonthDays)
                }
            }
            console.log(data);
        },
        _initBody: function (date) { // 初始化日历数据
            this.$dateBody = document.createElement('table');
            this.$dateBody.className = 'r-date-body';
            let _html = '';
            let _htmlWeek = [];
            let _htmlBody = [];
            this._initData(date);
            for (var i = 0; i < WEEK.length; i += 1) {
                _htmlWeek.push(`<td>${WEEK[i]}</td>`)
            }
            _html += `<tr>${_htmlWeek.join('')}</tr>`;
            /* for(let i = 0; i < days; i += 1) {
                _htmlBody.push(`<li data-date=${y}-${m}-${i + 1}>${i + 1}</li>`)
            } */
            this.$dateBody.innerHTML = _htmlBody.join('');
            this.$dateContainer.appendChild(this.$dateBody);
        },
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