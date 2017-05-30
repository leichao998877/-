/**
 * Created by leichao on 2015/12/16.
 */
/**
 *
 * @param attr 字符串类型
 * 注意：不能复合属性不能去掉单位
 * @returns {Number}
 */
Element.prototype.getCss = function (attr) {
    var val = null, reg = null;
    if (window.getComputedStyle) {
        val = window.getComputedStyle(this, null)[attr];
    } else {//有可能在IE6-8获取opacity属性值，这个时候我们要获取它的filter属性的值
        if (attr === "opacity") {
            //写一个正则把
            val = this.currentStyle["filter"];
            reg = /^alpha\(opacity=(\d+(?:\.\d+)?)\)$/;
            val = reg.test(val) ? reg.exec(val)[1] / 100 : 1;
        } else {
            val = this.currentStyle[attr];
        }
        //-90px去掉单位
    }
    reg = /^(-?\d+(\.\d+)?)(px|pt|em|rem|deg)?$/;
    return reg.test(val) ? parseFloat(val) : val;
}
/**
 *
 * @param attr 字符串类型
 * @param value 上下左右宽高可以忽略传入单位值
 * @returns {Element} 当前元素 实现链式操作
 */
Element.prototype.setCss = function (attr, value) {
    if (attr === "float") {
        this.style["cssFloat"] = value;
        this.style["styleFloat"] = value;
        return this;//实现链式操作
    }
    if (attr === "opacity") {
        this.style.opacity = value;
        this.style.filter = "alpha(opacity=" + value * 100 + ")";
        return this;
    }
    var reg = /^(width|height|top|bottom|left|right|((margin|padding)(Top|Bottom|Left|Right)?))$/;
    if (reg.test(attr)) {
        if (!isNaN(value)) {
            value += "px";
        }
    }
    this.style[attr] = value;
    return this;
}
/**
 * @param options 传入一个对象 里面是属性和属性值键值对
 */
Element.prototype.setGroupCss = function (options) {
    //->通过检测options的数据类型,如果不是一个对象,则不能进行批量的设置
    options = options || 0;
    if (options.toString() !== "[object Object]") {
        return;
    }
    //->遍历对象中的每一项,调取setCss方法一个个的进行设置即可
    for (var key in options) {
        this.setCss.call(this, key, options[key]);
    }
    return this;
}
/**
 *
 传参数的三种情形:
 // 1: css({width:500,height:400}); 设置一组属性值
 //2: css("width");//获取属性
 //3:css("height",300);//设置一个属性值
 * @param opt
 * @returns {*}
 */
Element.prototype.css = function (opt) {
    if (typeof  arguments[0] === "string") {
        if (typeof arguments[1] === "undefined") {//判断第三个参数不存在
            return this.getCss.apply(this, arguments);
        }
        //第二个参数存在
        this.setCss.apply(this, arguments);// "300"
    }
    if (arguments[0].toString() == "[object Object]") {
        this.setGroupCss.apply(this, arguments);
    }
    return this;
}
/**
 * @param opt :包含了下面参数，是一个对象
 * @param target 要运动的dom元素属性集合    (必填)
 * @param duration 动画执行的时间    [可选] 默认1000毫秒 正整数
 * @param effect  要执行那种动画 如匀速，减速等   [可选] 默认匀速运动 传入一个正整数或者一个只有两项的数组[1,4]
 * @param callBack  回调函数 动画执行完成之后要执行的函数  [可选] 传入一个函数
 *
 */
Element.prototype.animate = function (opt) {//封装一个对象来传参数
    var duration = opt.duration || 1000;//给参数一个默认值
    var begin = {};
    var change = {};
    var time = 0;
    var ele = this;
    var target = opt.target;
    var callback = opt.callback;
    var effect = opt.effect;
    var Effect = {
        Linear: {
            linear: function (t, b, c, d) {
                return b + t / d * c;
            }
        },
        //指数衰减的反弹缓动
        Bounce: {//[1/2/3/4]
            easeIn: function (t, b, c, d) {
                return c - Effect.Bounce.easeOut(d - t, 0, c, d) + b;
            },
            easeOut: function (t, b, c, d) {
                if ((t /= d) < (1 / 2.75)) {
                    return c * (7.5625 * t * t) + b;
                } else if (t < (2 / 2.75)) {
                    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                } else if (t < (2.5 / 2.75)) {
                    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                } else {
                    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                }
            },
            easeInOut: function (t, b, c, d) {
                if (t < d / 2) {
                    return Effect.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
                }
                return Effect.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
            }
        },
        //二次方的缓动
        Quad: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            easeOut: function (t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t + b;
                }
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            }
        },
        //三次方的缓动
        Cubic: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return c * ((t = t / d - 1) * t * t + 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t * t + b;
                }
                return c / 2 * ((t -= 2) * t * t + 2) + b;
            }
        },
        //四次方的缓动
        Quart: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t * t * t + b;
                }
                return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
            }
        },
        //五次方的缓动
        Quint: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t * t * t * t + b;
                }
                return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
            }
        },
        //正弦曲线的缓动
        Sine: {
            easeIn: function (t, b, c, d) {
                return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
            },
            easeOut: function (t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b;
            },
            easeInOut: function (t, b, c, d) {
                return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
            }
        },
        //指数曲线的缓动
        Expo: {
            easeIn: function (t, b, c, d) {
                return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
            },
            easeOut: function (t, b, c, d) {
                return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if (t == 0) return b;
                if (t == d) return b + c;
                if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
            }
        },
        //圆形曲线的缓动
        Circ: {
            easeIn: function (t, b, c, d) {
                return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
            },
            easeOut: function (t, b, c, d) {
                return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                }
                return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
            }
        },
        //超过范围的三次方缓动
        Back: {
            easeIn: function (t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * (t /= d) * t * ((s + 1) * t - s) + b;
            },
            easeOut: function (t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            },
            easeInOut: function (t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                if ((t /= d / 2) < 1) {
                    return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                }
                return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
            }
        },
        //指数衰减的正弦曲线缓动
        Elastic: {
            easeIn: function (t, b, c, d, a, p) {
                if (t == 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                var s;
                !a || a < Math.abs(c) ? (a = c, s = p / 4) : s = p / (2 * Math.PI) * Math.asin(c / a);
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            },
            easeOut: function (t, b, c, d, a, p) {
                if (t == 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                var s;
                !a || a < Math.abs(c) ? (a = c, s = p / 4) : s = p / (2 * Math.PI) * Math.asin(c / a);
                return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
            },
            easeInOut: function (t, b, c, d, a, p) {
                if (t == 0) return b;
                if ((t /= d / 2) == 2) return b + c;
                if (!p) p = d * (.3 * 1.5);
                var s;
                !a || a < Math.abs(c) ? (a = c, s = p / 4) : s = p / (2 * Math.PI) * Math.asin(c / a);
                if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
            }
        }
    };
    var flag = true;
    var tempEffect = null;//是一个函数
    var arr = ["Bounce", "Quad", "Cubic", "Quart", "Quint", "Sine", "Expo", "Circ", "Back", "Elastic"];
    var arr1 = ["easeIn", "easeOut", "easeInOut"];
    if (typeof effect === "number") {
        switch (effect) {
            case 0:
                tempEffect = Effect.Linear.linear;
                break;
            case 1:
                tempEffect = Effect.Circ.easeInOut;
                break;
            case 2:
                tempEffect = Effect.Elastic.easeOut;
                break;
            case 3:
                tempEffect = Effect.Back.easeOut;
                break;
            case 4:
                tempEffect = Effect.Bounce.easeOut;
                break;
            case 5:
                tempEffect = Effect.Expo.easeIn;
        }
    } else if (effect instanceof Array && effect.length == 2) {
        tempEffect = Effect[arr[effect[0]]][arr1[effect[1]]];
    } else {//effect什么也没传入
        tempEffect = Effect.Linear.linear;
    }
    // if(ele.count==="undefined"){
    //     ele.count=1;
    // }
    ele.timer && clearInterval(ele.timer); //要再加一个标记位判断是否要运动完成
    for (var key in target) {
        // if(ele.count==1){
        begin[key] = this.css(key);
        change[key] = target[key] - begin[key];
        // }
    }
    //清空上一个定时器
    ele.timer = setInterval(function () {
        // ele.count=2;
        //定时器中的this是window 非严格模式下
        time += 10;
        if (time >= duration) {
            clearInterval(ele.timer);
            ele.css(target);
            //到达终点之后我们可以做什么  回调函数执行
            //判断是否是函数
            if (typeof callback == "function") {
                //把回调函数中的this换成ele/obj
                callback.call(ele); //终止条件
            }
            // ele.count="undefined";
            return;
        }
        for (var key in change) {
            var value = tempEffect(time, begin[key], change[key], duration);
            ele.css(key, value);
        }
    }, 20);

}
//->offset:获取页面中任意元素距离BODY的偏移
Element.prototype.offset = function () {
    var disLeft = this.offsetLeft,
        disTop = this.offsetTop,
        par = this.offsetParent;
    while (par) {
        if (navigator.userAgent.indexOf("MSIE 8") === -1) {
            disLeft += par.clientLeft;
            disTop += par.clientTop;
        }
        disLeft += par.offsetLeft;
        disTop += par.offsetTop;
        par = par.offsetParent;
    }
    return {left: disLeft, top: disTop};
}
//->children:获取所有的元素子节点 返回值是一个数组
/**
 *
 * @param tagName 标签名字符串
 * @returns {Array}
 */
Element.prototype.myChildren = function (tagName) {
    var ary = [];
    //
    if (/MSIE 6|7|8/.test(window.navigator.userAgent)) {//ie 6/7/8
        var nodeList = this.childNodes;
        for (var i = 0, len = nodeList.length; i < len; i++) {
            var curNode = nodeList[i];
            curNode.nodeType === 1 ? ary[ary.length] = curNode : null;
        }
        nodeList = null;
    } else {
        ary = utils.listToArray(this.children);
    }
    if (typeof tagName === "string") {
        for (var k = 0; k < ary.length; k++) {
            var curEleNode = ary[k];
            if (curEleNode.nodeName.toLowerCase() !== tagName.toLowerCase()) {
                ary.splice(k, 1);
                k--;
            }
        }
    }
    return ary;
}
//->prev:获取上一个哥哥元素节点
//->首先获取当前元素的上一个哥哥节点,判断是否为元素节点,不是的话基于当前的继续找上面的哥哥节点...一直到找到哥哥元素节点为止,
// 如果没有哥哥元素节点,返回null即可
Element.prototype.prev = function () {
    if (this.previousElementSibling) {
        return this.previousElementSibling;
    }
    var pre = this.previousSibling;
    while (pre && pre.nodeType !== 1) {
        pre = pre.previousSibling;
    }
    return pre;
}
//->next:获取下一个弟弟元素节点
Element.prototype.next = function () {
    if (this.nextElementSibling) {
        return this.nextElementSibling;
    }
    var nex = this.nextSibling;
    while (nex && nex.nodeType !== 1) {   //while循环的条件是  继续向上查找的条件
        nex = nex.nextSibling;
    }
    return nex;
}
//->prevAll:获取当前元素的上的所有的哥哥元素节点
Element.prototype.prevAll = function () {
    var ary = [];
    var pre = this.prev(this);
    while (pre) {
        ary.unshift(pre);
        pre = this.prev(pre);
    }
    return ary;
}

//->nextAll:获取当前元素下的所有的弟弟元素节点
Element.prototype.nextAll = function () {
    var ary = [];
    var nex = this.next(this);
    while (nex) {
        ary.push(nex);
        nex = this.next(nex);
    }
    return ary;
}

//->sibling:获取相邻的两个元素节点
Element.prototype.sibling = function () {
    var pre = this.prev(this);
    var nex = this.next(this);
    var ary = [];
    pre ? ary.push(pre) : null;
    nex ? ary.push(nex) : null;
    return ary;
}

//->siblings:获取当前元素的所有的兄弟元素节点
Element.prototype.siblings = function () {
    return this.prevAll(this).concat(this.nextAll(this));
}

//->index:获取当前元素的索引
function index() {
    return this.prevAll(this).length;
}

//->firstChild:获取第一个元素子节点
Element.prototype.firstChild = function () {
    var chs = this.children(this);
    return chs.length > 0 ? chs[0] : null;
}

//->lastChild:获取最后一个元素子节点
Element.prototype.lastChild = function () {
    var chs = this.children(this);
    return chs.length > 0 ? chs[chs.length - 1] : null;
}

//->append:向当前容器的末尾追加新元素
Element.prototype.append = function (newEle) {
    this.appendChild(newEle);
    return this;
}
/**
 * 向当前容器的开头添加新元素
 * @param newEle
 */
Element.prototype.prepend = function (newEle) {
    var fir = this.firstChild(this);
    if (fir) {
        this.insertBefore(newEle, fir);
        return;
    }
    this.appendChild(newEle);
}
/**
 * 把新元素插入到当前元素的前面
 * @param newEle
 */
Element.prototype.insertBefore = function (newEle) {
    this.parentNode.insertBefore(newEle, this);
}

/**
 * 把新元素插入到当前元素的后面
 * @param newEle
 */
Element.prototype.insertAfter = function (newEle) {
    var nex = this.next(this);
    if (nex) {
        this.parentNode.insertBefore(newEle, nex);
        return;
    }
    this.parentNode.appendChild(newEle);
}
//->hasClass:验证当前元素中是否包含className这个样式类名
Element.prototype.hasClass = function (className) {
    var reg = new RegExp("(^| +)" + className + "( +|$)");
    var reg = new RegExp("(^| +)" + className + "( +|$)");
    return reg.test(this.className);
}

//->addClass:给元素增加样式类名
Element.prototype.addClass = function (className) {
    //" c1 c2 c3 "
    // /(^ +| +$)/g是去掉收尾空格
    var ary = className.replace(/(^ +| +$)/g, "").split(/ +/);
    for (var i = 0, len = ary.length; i < len; i++) {
        var curName = ary[i];
        if (!this
                .hasClass(curName)) {
            this.className += " " + curName;
        }
    }
    return this;
}

//->removeClass:给元素移除样式类名
Element.prototype.removeClass = function (className) {
    //首先要取出首尾空格，然后拆分 判断数组中的每一个字符串是否符合要求
    var ary = className.replace(/(^ +| +$)/g, "").split(/ +/);
    for (var i = 0, len = ary.length; i < len; i++) {
        var curName = ary[i];
        if (this.hasClass(curName)) {
            //核心代码:
            var reg = new RegExp("(^| +)" + curName + "( +|$)", "g");
            this.className = this.className.replace(reg, " ");
        }
    }
    return this;
}
var utils = (function () {
    //->listToArray:把类数组集合转换为数组
    function listToArray(likeAry) {
        if (flag) {
            return [].slice.call(likeAry);
        }
        var ary = [];
        for (var i = 0; i < likeAry.length; i++) {
            ary.push(likeAry[i]);
        }
        return ary;
    }

    //->parseJSON:把JSON格式字符串转换为JSON格式对象
    function parseJSON(jsonStr) {
        return "JSON" in window ? JSON.parse(jsonStr) : eval("(" + jsonStr + ")");
    }

    /**
     * 获取n到m之间的随机数
     * @param n
     * @param m
     * @returns {number}
     */
    function getRandom(n, m) {//获取n-m之间的随机数
        n = Number(n);
        m = Number(m);
        if (isNaN(n) || isNaN(m)) {
            return Math.random();
        }
        if (n > m) {
            var temp = n;
            n = m;
            m = temp;
            temp = null;
        }
        return Math.round(Math.random() * (m - n) + n);
    }

    function getSel() {
        if (window.getSelection)  // 获取我们选中的文字
        {
            return window.getSelection().toString();   // 转换为字符串
        }
        else {
            return document.selection.createRange().text;   // ie 的写法
        }
    }

    //->win:操作浏览器的盒子模型信息,但是只能设置scrollTop/scrollLeft的值
    //也可以获取clientX,clientY等值
    function win(attr, value) {
        if (typeof value === "undefined") {
            return document.body[attr] || document.documentElement[attr];
        }
        document.documentElement[attr] = value;
        document.body[attr] = value;
    }
    //->getElementsByClass:通过元素的样式类名获取一组元素集合
    function getElementsByClass(strClass, context) {
        context = context || document;
        if (flag) {
            return this.listToArray(context.getElementsByClassName(strClass));
        }
        //->IE6~8
        var ary = [], strClassAry = strClass.replace(/(^ +| +$)/g, "").split(/ +/g);
        var nodeList = context.getElementsByTagName("*");
        for (var i = 0, len = nodeList.length; i < len; i++) {
            var curNode = nodeList[i];
            var isOk = true;
            for (var k = 0; k < strClassAry.length; k++) {
                var reg = new RegExp("(^| +)" + strClassAry[k] + "( +|$)");
                if (!reg.test(curNode.className)) {
                    isOk = false;
                    break;
                }
            }
            if (isOk) {
                ary[ary.length] = curNode;
            }
        }
        return ary;
    }
    /**
     *
     * @param ele
     * @param type
     * @param fn
     * @returns {ele}
     */
    function on(ele, type, fn) {
        //1:在对应的事件类型上添加一个自定义属性数组
        //2:在数组中添加绑定的函数
        //3:需要绑定的run函数 ，负责执行数组中的函数，这个run只能绑定一次.
        // debugger;
        if (ele.addEventListener) {
            ele.addEventListener(type, fn, false);
            return ele;
        } else {
            //处理IE6-8
            if (!ele['zw' + type]) {
                //如果这个自定义属性不存在那么我就创建一个数组
                ele['zw' + type] = [];//同一个ele的同一个事件只执行一次

                ele.attachEvent('on' + type, function () {
                    run.call(ele);//把run中的this修改成this
                });
            }
            var a = ele['zw' + type];//让代码看起来更加简单
            for (var i = 0; i < a.length; i++) {
                //这个循环处理的就是重复绑定的问题，在给自定义属性数组添加fn之前，要循环判断数组中是否存在这个函数，如果不存在push进去了
                if (a[i] === fn) {
                    return ele;
                }
            }
            a.push(fn);//吧fn这个函数添加到对应事件类型的数组中去
            // ele.'zwonclick'=[fn1,fn2,fn3];
            return ele;
        }
    }
    function run(e) {
        //run先去找到对应的事件类型的数组，比如：div1.zeclick :[fn1,fn2]
        //this 应该是ele=> window
        //run中的this已经修改成ele了
        e=window.event;
        e.target = e.srcElement;
        e.pageX = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
        e.pageY = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
        e.stopPropagation = function () {
            event.cancelBubble = true;
        };
        e.preventDefault = function () {
            event.returnValue = false;
        }
        var a = this['zw' + e.type];//this.zwclick
        //按照顺序执行a数组中的所有的函数
        if (a && a.length) {
            for (var i = 0; i < a.length; i++) {
                //要把事件执行函数中的this换成  =>绑定的元素ele
                if(typeof a[i]=='function'){
                    //由于off移除事件的过程中，我们为了避免数组的塌陷问题，我们直接赋值null.
                    // 那么在这个数组中就会出现不是函数的null项，那么就需要判断是不是函数。
                    a[i].call(this, e);
                }else{//如果不是函数
                    //[null,null,fn2,fn3] 在执行的顺序的过程中，
                    // 可能会遇到null的项目，那么就可以删除，然后这次删除需要处理数组的塌陷问题，不处理就会漏掉执行.
                    a.splice(i,1);
                    i--;
                }
            }
        }
    }
    //移除事件 type有一个
    /**
     * @param ele
     * @param type
     * @param fn
     * @returns {ele}
     */
    function off(ele, type, fn) {
        if (ele.removeEventListener) {
            ele.removeEventListener(type,fn, false);
            return ele;
        }
        var ar= ele['zw' + type];
        if(ar&&ar.length){
            for (var i = 0; i < ar.length; i++) {
                if (ar[i] === fn) {
                    //如果单纯的移除事件没有问题，但是如果在run方法在按照顺序执行这些函数的过程中，
                    // 如果off移除事件就会形成数组塌陷，导致漏掉数组项
                    ar[i]=null;
                    break;
                }
            }
        }
        return ele;
    }
    return {
        on:on,
        off:off,
        listToArray: listToArray,
        parseJSON: parseJSON,
        getRandom: getRandom,
        getSel: getSel,
        win: win
    }

})();
//1：数组去重：
Array.prototype.unique = function () {
    for (var i = 0; i < this.length - 1; i++) {
        for (var j = i + 1; j < this.length; j++) {
            if (this[i] === this[j]) {
                this.splice(j, 1);
                j--;
            }
        }
    }
    return this;
}
/**
 * 传入你要获取的字符串类型  "{0}年{1}月{2}日 {3}时:{4}分:{5}秒"
 * console.log("2015-6-10 14:53:00".myFormatTime("{0}年{1}月{2}日 {3}时:{4}分:{5}秒"));
 * @returns {string}
 */0
String.prototype.myFormatTime = function () {
    //  1993:02:13  12:34:45
    var reg = /^(\d{4})(?:-|\/|\.|:)(\d{1,2})(?:-|\/|\.|:)(\d{1,2})(?:\s+)(\d{1,2})(?:-|\/|\.|:)(\d{1,2})(?:-|\/|\.|:)(\d{1,2})$/g;
    var ary = [];
    this.replace(reg, function () {
        //
        ary = ([].slice.call(arguments)).slice(1, 7);
    });
    var format = arguments[0] || "{0}年{1}月{2}日 {3}时:{4}分:{5}秒";
    return format.replace(/{(\d+)}/g, function () {
        var val = ary[arguments[1]];
        return val.length === 1 ? "0" + val : val;
    });
}
//原生的forEach方法并不修改原数组，
/**
 *
 * @param callback function(item,index){}
 * @param context 你要遍历的数组，你可以修改它
 */
//    arr.myforEach(function (item, index, input) {
//        console.log(item, index, input);
//        return input[index]=item+10;
//    });
//    console.log(arr);
Array.prototype.myforEach = function myforEach(callback, context) {
    context = context || window;
    if ('forEach'in Array.prototype) {
//            console.log("标准浏览器");
        this.forEach(callback, context);
    } else {
        for (var i = 0; i < this.length; i++) {
            if (typeof callback === 'function') {
                callback && callback.call(context, this[i], i, this);
            }
        }
    }
}
/**
 * @param callback
 * @param context
 * @returns {Array} 返回修改后的数组
 */
Array.prototype.myMap = function myMap(callback, context) {
    context = context || window;
    if ('map' in Array.prototype) {
        return this.map(callback, context);
    } else {
        var ary = [];
        for (var i = 0; i < this.length; i++) {
            if (typeof callback === 'function') {
                var item = callback.call(context, this[i], i, this);
                ary[ary.length] = item;
            }
        }
        return ary;
    }
}
String.prototype.qianFen= function () {
    var reg = /\d(?!$)/g;
    var that=this;
    that = this.replace(reg, function (item, index) {
        //item    1 2 3 4 5 6 7
        //index   0 1 2 3 4 5 6 7
        //str,length  =8;
        if ((str.length - 1 - index) % 3 === 0) {
            return item + ",";
        } else {
            return item;
        }
    });
    return that;
}
/*
var arr = [12, 23, 45, 56];
var res = arr.myMap(function (item, index) {
    return item + 10;
});
console.log(res);//[22,33,55,66]
console.log(arr);//原数组不会发生改变*/
