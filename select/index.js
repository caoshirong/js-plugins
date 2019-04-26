/**
 * 1.确定容器
 * 2.确定下拉数据
 * 3.确定默认选中的值
 * 4.返回选中的值
 * new Selector({defaultsText: '2', list: [{key: key, value: value}],search: true, callback: function(item) {
                    console.log(item);
                }});
 * 未实现键盘事件
 */

 ;(function(undefined) {
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
     // 构建插件的构造函数
     function Selector(options) {
        this._init(options);
     }

     Selector.prototype = {
        constructor: this,
        _init: function(options) {
            var __this = this;
            var defaults = {
                defaultsText: '1',
                list: [
                    {
                        key: '1',
                        value: '数据1'
                    },
                    {
                        key: '2',
                        value: '数据2'
                    },
                    {
                        key: '3',
                        value: '数据3'
                    },
                    {
                        key: '4',
                        value: '数据4'
                    },
                    {
                        key: '5',
                        value: '数据5'
                    },
                    {
                        key: '6',
                        value: '数据6'
                    },
                    {
                        key: '7',
                        value: '数据7'
                    },
                    {
                        key: '8',
                        value: '数据8'
                    }
                ],
                container: 'select_container',
                search: false, // 是否支持搜索
                callback: null
            };
            var opt = extend(defaults, options, true);
            this.container = document.getElementById(opt.container);
            this.defaultsText = opt.defaultsText;
            this.list = [].concat(opt.list);
            this.showFlag = false; // 是否显示下拉框的标志
            this.callback = opt.callback;
            this.search = opt.search;
            this.filterList = [].concat(opt.list);
            this._initInput()._initList();
            document.addEventListener('click', function() {
                __this._hideList();
            }, false)
            this.container.onkeyup = function(ev) {
                var e = ev || window.event;
                var key = e.keyCode || e.which;
                if (key === '38') { // 向上
                    console.log('向上');
                }
                if (key === '40') {
                    console.log('向下');
                }
                __this._initStyle()
            }
            return this;
        },
        _initInput: function() { // 生成input框
            var __this = this;
            this.$input = document.createElement('input');
            this.$input.type = 'text';
            this.$input.placeholder = '请选择';
            this.$input.className = 'select-input';
            this.$input.setAttribute('readonly', true);
            this.$input.onclick = function(ev) {
                __this._operateList(ev);
            }
            this.container.appendChild(this.$input);
            this._setDefault();
            return this;
        },
        _initSearchInput: function() { // 支持搜索
            var __this = this;
            this.$search = document.createElement('div');
            this.$search.className = 'selector-search';
            this.$searchInput = document.createElement('input');
            this.$searchInput.className = 'selector-search-input';
            this.$search.onclick = function(ev) {
                var e = ev || window.event;
                e.stopPropagation();
            }
            this.$searchInput.oninput = function (ev) {
                var e = ev || window.event;
                var val = e.currentTarget.value;
                var arr = [];
                var __html = '';
                for(var i = 0; i < __this.list.length; i += 1) {
                    if (__this.list[i].value.indexOf(val) !== -1) { // 模糊匹配数据
                        arr.push(__this.list[i]);
                    }
                }
                __this.filterList = arr;
                if (arr.length > 0 ) {
                    for (var i = 0; i < arr.length; i += 1) {
                        __html += '<li data-key="'+ arr[i].key +'" data-value="'+ arr[i].value +'"  class="selector-list-item">'+ arr[i].value +'</li>';
                    }
                } else {
                    __html = '<p class="no-result">暂无数据</p>';
                }
                __this.$list.innerHTML = __html;
                __this._initStyle(__this.selectItem ? __this.selectItem.key : __this.defaultsText);
            }
            this.$search.appendChild(this.$searchInput)
            this.$containerList.appendChild(this.$search);
            return this;
        },
        _setDefault: function() { // 赋默认值
            var __item = {};
            for(var i = 0; i < this.list.length; i += 1) {
                if (this.list[i].key === this.defaultsText) {
                    __item = this.list[i];
                    this.index = i;
                }
            }
            this.$input.setAttribute('data-key', this.defaultsText)
            this.$input.value = __item.value;
            return this;
        },
        _initList: function() { // 生成下拉列表
            var __this = this;
            var __html = '';
            this.$containerList = document.createElement('div');
            this.$containerList.className = 'selector-container';
            this.$list = document.createElement('ul');
            this.$list.className = 'selector-list';
            for (var i = 0; i < this.filterList.length; i += 1) {
                __html += '<li data-key="'+ this.list[i].key +'" data-value="'+ this.list[i].value +'"  class="selector-list-item">'+ this.list[i].value +'</li>';
            }
            this.$list.innerHTML = __html;
            this.$list.onclick = function(ev) {
                if (ev.target.tagName.toUpperCase() === 'LI') {
                    __this._choose(ev.target);
                }
            }
            if (this.search) {
                this._initSearchInput();
            }
            this.$containerList.appendChild(this.$list)
            this.container.appendChild(this.$containerList);
            this._initStyle(this.defaultsText);
            return this;
        },
        _operateList: function(ev) { // 是否显示下拉框
            var e = ev || window.event;
            this.$containerList.style.display = this.showFlag ? 'none' : 'block';
            this.showFlag = !this.showFlag;
            e.stopPropagation();
        },
        _hideList: function() { // 点击空白处关闭下拉框
            this.$containerList.style.display = 'none';
            this.showFlag = false;
        },
        _choose: function(ev) { // 选择某项内容
            var __data = ev.dataset;
            var __key = __data.key,
                __value = __data.value;
            this.$input.value = __value;
            this.$input.setAttribute('key', __key);
            this.selectItem = {key: __key, value: __value};
            this._initStyle(__key);
            if (this.callback) {
                this.callback(this.selectItem);
            }
            return this;
        },
        _initStyle: function(key) { // 设置样式
            var $liList = this.$list.getElementsByTagName('li');
            [].forEach.call($liList, function(item, index) {
                var itemKey = item.dataset.key;
                var __class = item.getAttribute('class');
                if (itemKey === key) {
                    if (__class.indexOf('active') === -1) item.className = __class + ' active';
                } else {
                    if (__class.indexOf('active') !== -1) {
                        var __index = __class.split(' ').indexOf('active');
                        var __classArr = __class.split(' ');
                        var __className = __classArr.splice(__index, 1);
                        item.className = __classArr.join(' ');
                    }
                }
            })
            return this;
        }
     }

     _global = (function() {
         return this || (0, eval)('this');
     }());
     if (typeof module !== "undefined" && module.exports) {
         module.exports = Selector;
     } else if (typeof define === "function" && define.amd) {
         define(function(){
             return Selector;
         })
     } else {
         !('Selector' in _global) && (_global.Selector = Selector)
     }

 })();
