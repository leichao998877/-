
//处理事件IE6-8中的DOM2事件绑定的兼容性问题
// div1.attachEvent('onclick',fn,ele)
;(function () {
    function on(ele, type, fn) {
        //处理自定义事件，你可以根据自己的项目需求修改
        if(/^self/.test(type)){
            if(!ele[type]){
                ele[type]=[];
            }
            var a=ele[type];
            for (var i = 0; i < a.length; i++) {
                if(a[i]===fn){
                    return ele;
                }
            }
            a.push(fn);
            return ele;
        }
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
    //处理自定义事件的运行
    function selfrun(ele,type,e) {
        var arr=ele[type];
        if(arr&&arr.length){
            for (var i = 0; i < arr.length; i++) {
                if(typeof a[i]==="function"){
                    arr[i].call(ele,e);
                }else{
                    arr.splice(i,1);
                    i--;
                }
            }
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
    function off(ele, type, fn) {
        //处理自定义事件的解绑事件
        if(/^self/.test(type)){
            var arr=ele[type];
            if(arr&&arr.length){
                for (var i = 0; i < arr.length; i++) {
                    if(arr[i]===fn){
                        arr[i]=null;
                        break;
                    }
                }
            }
            return ele;
        }
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
            return ele;
        }
    }
    window.off = off;
    window.on = on;
})();
function processThis(callback,that){ // 把run函数中的this处理成ele
    return function (e){
        callback.call(that,e);
    }
}