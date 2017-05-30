/**
 * Created by Administrator on 2016/12/7.
 *
 *
 * 1、 t b c d 准备
 * 2、 根据target 来给change 和begin 添加属性
 * 3、 清除定时器（上一次的）
 * 4、 情定定时器
 *     time+=10;
 *     到达终点的时候判断
 *     for in
 *     由于增加time需要重新计算位置
 *     赋值位置生效
 *
 *
 *     如何把ele的参数化成是this的方式
 *     //  div.animate.(target:{left:100})==> ele用this来替代
 *
 *     animate必须是div1的家族上有这个方法
 *
 *
 *
 */
//
;
(function () {

    function listToArray(ary) {
        try {
            return Array.prototype.slice.call(ary, 0);
        } catch (e) {
            //IE8以下
            var newAry = [];
            for (var i = 0; i < ary.lentgh; i++) {
                newAry[newAry.length] = ary[i];
            }
            return newAry;
        }
    }

    //依赖三个方法  setCss getCss  setGroupCss   这几个方法是服务animate这个函数的，我们可以不调用utils的时候，那么直接把这个函数定义在这个闭包里面
    function getCss(attr) {
        var val = null;
        if (window.getComputedStyle) {
            //标准的浏览器
            val = window.getComputedStyle(this, null)[attr];
        } else {
            //for ie
            if (attr == "opacity") {
                //alpha(opacity=30)
                val = this.currentStyle.filter;
                var reg = /alpha\(opacity=(\d+(?:\.\d+)?)\)/;
                val = reg.test(val) ? reg.exec(val)[1] / 100 : 1;
            } else {
                val = this.currentStyle(attr);
            }
        }
        //去除单位
        //200px -0.55 block deg rem pt px
        reg = /^-?\d+(\.\d+)?(px|pt|rem|em|deg)?$/;//
        if (reg.test(val)) {
            val = parseFloat(val);
        }
        return val;
    }

    function css(ele) {
        var secondParam = arguments[1];
        var thirdParam = arguments[2];
        var argumentsAry = listToArray(arguments).slice(1);//从第二项开始截取
        if (typeof secondParam == "string") {
            if (typeof thirdParam == 'undefined') {
                //[ele,"width"]  这是获取width的值
                return getCss.apply(ele, argumentsAry);
            }
            //有三个的参数的情况下    //[ele,"width"，100]  设置width的值
            setCss.apply(ele, argumentsAry);
            return;
        }
        secondParam = secondParam || [];//保证tiString不报错
        if (secondParam.toString() == '[object Object]') {
            //批量的设置属性的值
            setGroupCss.apply(ele, argumentsAry);
        }
    }


    function setCss(attr, val) {
        if (attr == "opacity") {
            this.style.opacity = val;
            this.style.filter = "alpha(opacity=" + val * 100 + ")";
        }
        if (attr == "float") {
            this.style.cssFloat = val;//标准
            this.style.styleFloat = val;
        }
        //处理单位
        var reg = /^(width|height|top|left|right|bottom|(margin|padding)(Top|Left|Right|Bottom)?)$/
        if (reg.test(attr)) {
            if (!isNaN(val)) {
                val += 'px';
            }
        }
        this.style[attr] = val;
    }


    function setGroupCss(obj) {
        obj = obj || [];//保证obj.toString()不出错
        // Object.prototype.toString.call(obj) == '[object Object]'
        if (obj.toString() == "[object Object]") {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    setCss.call(this, key, obj[key]);//方法之间的调用
                }
            }
        }
    }

    function animate(opt) {
        //ele target duration callback effect
        //需要用到的参数
        var time = 0;//花费的时间
        var duration = opt.duration || 1000;
        var begin = {};
        var change = {};
        var target = opt.target;
        var ele = opt.ele;
        var effect = opt.effect;
        var sportsEffect = {
            //匀速
            Linear: function (t, b, c, d) {
                return c * t / d + b;
            },
            //指数衰减的反弹缓动
            Bounce: {
                easeIn: function (t, b, c, d) {
                    return c - sportsEffect.Bounce.easeOut(d - t, 0, c, d) + b;
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
                        return sportsEffect.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
                    }
                    return sportsEffect.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
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
        var defaultEffect = sportsEffect.Linear;
        if (effect) {
            if (typeof  effect === "number") {
                switch (effect) {
                    case 1:
                        defaultEffect = sportsEffect.Back.easeIn;
                        break;
                    case 2:
                        defaultEffect = sportsEffect.Bounce.easeInOut;
                        break;
                    case 3:
                        defaultEffect = sportsEffect.Elastic.easeOut;
                        break;
                }

            } else if (effect instanceof  Array) {
                defaultEffect = sportsEffect[effect[0]][effect[1]];
            }
        }
        var callback = opt.callback;
        for (var key in target) {
            begin[key] = css(ele, key);
            change[key] = target[key] - begin[key];
        }

        window.clearInterval(ele.timer);
        ele.timer = window.setInterval(function () {
            time += 10;
            if (time >= duration) {
                window.clearInterval(ele.timer);
                css(ele, target);
                if (typeof callback == "function") {
                    callback.call(ele);
                }
                return;
            }
            for (var key in change) {
                var value = defaultEffect(time, begin[key], change[key], duration);
                css(ele, key, value);
            }
        }, 10);
    }

    window.animate = animate;//暴露出去的参数

})();