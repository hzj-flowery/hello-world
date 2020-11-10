"use strict";
/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.js = void 0;
var CCDebug_1 = require("../../CCDebug");
var id_generater_1 = require("./id-generater");
var mutable_forward_iterator_1 = require("../utils/mutable-forward-iterator");
var tempCIDGenerater = new id_generater_1.default("TmpCId.");
function _getPropertyDescriptor(obj, name) {
    while (obj) {
        var pd = Object.getOwnPropertyDescriptor(obj, name);
        if (pd) {
            return pd;
        }
        obj = Object.getPrototypeOf(obj);
    }
    return null;
}
function _copyprop(name, source, target) {
    var pd = _getPropertyDescriptor(source, name);
    Object.defineProperty(target, name, pd);
}
/**
 * !#en This module provides some JavaScript utilities. All members can be accessed with `cc.js`.
 * !#zh 这个模块封装了 JavaScript 相关的一些实用函数，你可以通过 `cc.js` 来访问这个模块。
 * @submodule js
 * @module js
 */
var js;
(function (js) {
    /**
     * Check the obj whether is number or not
     * If a number is created by using 'new Number(10086)', the typeof it will be "object"...
     * Then you can use this function if you care about this case.
     * @method isNumber
     * @param {*} obj
     * @returns {Boolean}
     */
    function isNumber(obj) {
        return typeof obj === 'number' || obj instanceof Number;
    }
    js.isNumber = isNumber;
    /**
     * Check the obj whether is string or not.
     * If a string is created by using 'new String("blabla")', the typeof it will be "object"...
     * Then you can use this function if you care about this case.
     * @method isString
     * @param {*} obj
     * @returns {Boolean}
     */
    function isString(obj) {
        return typeof obj === 'string' || obj instanceof String;
    }
    js.isString = isString;
    /**
     * Copy all properties not defined in obj from arguments[1...n]
     * @method addon
     * @param {Object} obj object to extend its properties
     * @param {Object} ...sourceObj source object to copy properties from
     * @return {Object} the result obj
     */
    function addon(obj) {
        'use strict';
        obj = obj || {};
        for (var i = 1, length = arguments.length; i < length; i++) {
            var source = arguments[i];
            if (source) {
                if (typeof source !== 'object') {
                    CCDebug_1.cc.errorID(5402, source);
                    continue;
                }
                for (var name in source) {
                    if (!(name in obj)) {
                        _copyprop(name, source, obj);
                    }
                }
            }
        }
        return obj;
    }
    js.addon = addon;
    /**
     * copy all properties from arguments[1...n] to obj
     * @method mixin
     * @param {Object} obj
     * @param {Object} ...sourceObj
     * @return {Object} the result obj
     */
    function mixin(obj) {
        'use strict';
        obj = obj || {};
        for (var i = 1, length = arguments.length; i < length; i++) {
            var source = arguments[i];
            if (source) {
                if (typeof source !== 'object') {
                    CCDebug_1.cc.errorID(5403, source);
                    continue;
                }
                for (var name in source) {
                    _copyprop(name, source, obj);
                }
            }
        }
        return obj;
    }
    js.mixin = mixin;
    /**
     * Derive the class from the supplied base class.
     * Both classes are just native javascript constructors, not created by cc.Class, so
     * usually you will want to inherit using {{#crossLink "cc/Class:method"}}cc.Class {{/crossLink}} instead.
     * @method extend
     * @param {Function} cls
     * @param {Function} base - the baseclass to inherit
     * @return {Function} the result class
     */
    function extend(cls, base) {
        for (var p in base)
            if (base.hasOwnProperty(p))
                cls[p] = base[p];
        cls.prototype = Object.create(base.prototype, {
            constructor: {
                value: cls,
                writable: true,
                configurable: true
            }
        });
        return cls;
    }
    js.extend = extend;
    /**
     * Get super class
     * @method getSuper
     * @param {Function} ctor - the constructor of subclass
     * @return {Function}
     */
    function getSuper(ctor) {
        var proto = ctor.prototype; // binded function do not have prototype
        var dunderProto = proto && Object.getPrototypeOf(proto);
        return dunderProto && dunderProto.constructor;
    }
    js.getSuper = getSuper;
    /**
     * Checks whether subclass is child of superclass or equals to superclass
     *
     * @method isChildClassOf
     * @param {Function} subclass
     * @param {Function} superclass
     * @return {Boolean}
     */
    function isChildClassOf(subclass, superclass) {
        if (subclass && superclass) {
            if (typeof subclass !== 'function') {
                return false;
            }
            if (typeof superclass !== 'function') {
                return false;
            }
            if (subclass === superclass) {
                return true;
            }
            for (;;) {
                subclass = js.getSuper(subclass);
                if (!subclass) {
                    return false;
                }
                if (subclass === superclass) {
                    return true;
                }
            }
        }
        return false;
    }
    js.isChildClassOf = isChildClassOf;
    /**
     * Removes all enumerable properties from object
     * @method clear
     * @param {any} obj
     */
    function clear(obj) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            delete obj[keys[i]];
        }
    }
    js.clear = clear;
    /**
     * Checks whether obj is an empty object
     * @method isEmptyObject
     * @param {any} obj
     * @returns {Boolean}
     */
    function isEmptyObject(obj) {
        for (var key in obj) {
            return false;
        }
        return true;
    }
    js.isEmptyObject = isEmptyObject;
    /**
     * Get property descriptor in object and all its ancestors
     * @method getPropertyDescriptor
     * @param {Object} obj
     * @param {String} name
     * @return {Object}
     */
    function getPropertyDescriptor(obj, name) {
        _getPropertyDescriptor(obj, name);
    }
    js.getPropertyDescriptor = getPropertyDescriptor;
    var tmpValueDesc = {
        value: undefined,
        enumerable: false,
        writable: false,
        configurable: true
    };
    /**
     * Define value, just help to call Object.defineProperty.<br>
     * The configurable will be true.
     * @method value
     * @param {Object} obj
     * @param {String} prop
     * @param {any} value
     * @param {Boolean} [writable=false]
     * @param {Boolean} [enumerable=false]
     */
    function value(obj, prop, value, writable, enumerable) {
        tmpValueDesc.value = value;
        tmpValueDesc.writable = writable;
        tmpValueDesc.enumerable = enumerable;
        Object.defineProperty(obj, prop, tmpValueDesc);
        tmpValueDesc.value = undefined;
    }
    js.value = value;
    ;
    var tmpGetSetDesc = {
        get: null,
        set: null,
        enumerable: false,
        configurable: false
    };
    /**
     * Define get set accessor, just help to call Object.defineProperty(...)
     * @method getset
     * @param {Object} obj
     * @param {String} prop
     * @param {Function} getter
     * @param {Function} [setter=null]
     * @param {Boolean} [enumerable=false]
     * @param {Boolean} [configurable=false]
     */
    function getset(obj, prop, getter, setter, enumerable, configurable) {
        if (typeof setter !== 'function') {
            enumerable = setter;
            setter = undefined;
        }
        tmpGetSetDesc.get = getter;
        tmpGetSetDesc.set = setter;
        tmpGetSetDesc.enumerable = enumerable;
        tmpGetSetDesc.configurable = configurable;
        Object.defineProperty(obj, prop, tmpGetSetDesc);
        tmpGetSetDesc.get = null;
        tmpGetSetDesc.set = null;
    }
    js.getset = getset;
    ;
    var tmpGetDesc = {
        get: null,
        enumerable: false,
        configurable: false
    };
    /**
     * Define get accessor, just help to call Object.defineProperty(...)
     * @method get
     * @param {Object} obj
     * @param {String} prop
     * @param {Function} getter
     * @param {Boolean} [enumerable=false]
     * @param {Boolean} [configurable=false]
     */
    function get(obj, prop, getter, enumerable, configurable) {
        tmpGetDesc.get = getter;
        tmpGetDesc.enumerable = enumerable;
        tmpGetDesc.configurable = configurable;
        Object.defineProperty(obj, prop, tmpGetDesc);
        tmpGetDesc.get = null;
    }
    js.get = get;
    ;
    var tmpSetDesc = {
        set: null,
        enumerable: false,
        configurable: false
    };
    /**
     * Define set accessor, just help to call Object.defineProperty(...)
     * @method set
     * @param {Object} obj
     * @param {String} prop
     * @param {Function} setter
     * @param {Boolean} [enumerable=false]
     * @param {Boolean} [configurable=false]
     */
    function set(obj, prop, setter, enumerable, configurable) {
        tmpSetDesc.set = setter;
        tmpSetDesc.enumerable = enumerable;
        tmpSetDesc.configurable = configurable;
        Object.defineProperty(obj, prop, tmpSetDesc);
        tmpSetDesc.set = null;
    }
    js.set = set;
    ;
    /**
     * Get class name of the object, if object is just a {} (and which class named 'Object'), it will return "".
     * (modified from <a href="http://stackoverflow.com/questions/1249531/how-to-get-a-javascript-objects-class">the code from this stackoverflow post</a>)
     * @method getClassName
     * @param {Object|Function} objOrCtor - instance or constructor
     * @return {String}
     */
    function getClassName(objOrCtor) {
        if (typeof objOrCtor === 'function') {
            var prototype = objOrCtor.prototype;
            if (prototype && prototype.hasOwnProperty('__classname__') && prototype.__classname__) {
                return prototype.__classname__;
            }
            var retval = '';
            //  for browsers which have name property in the constructor of the object, such as chrome
            if (objOrCtor.name) {
                retval = objOrCtor.name;
            }
            if (objOrCtor.toString) {
                var arr, str = objOrCtor.toString();
                if (str.charAt(0) === '[') {
                    // str is "[object objectClass]"
                    arr = str.match(/\[\w+\s*(\w+)\]/);
                }
                else {
                    // str is function objectClass () {} for IE Firefox
                    arr = str.match(/function\s*(\w+)/);
                }
                if (arr && arr.length === 2) {
                    retval = arr[1];
                }
            }
            return retval !== 'Object' ? retval : '';
        }
        else if (objOrCtor && objOrCtor.constructor) {
            return js.getClassName(objOrCtor.constructor);
        }
        return '';
    }
    js.getClassName = getClassName;
    ;
    var REGEXP_NUM_OR_STR = /(%d)|(%s)/;
    var REGEXP_STR = /%s/;
    /**
 * A string tool to construct a string with format string.
 * @method formatStr
 * @param {String|any} msg - A JavaScript string containing zero or more substitution strings (%s).
 * @param {any} ...subst - JavaScript objects with which to replace substitution strings within msg. This gives you additional control over the format of the output.
 * @returns {String}
 * @example
 * cc.js.formatStr("a: %s, b: %s", a, b);
 * cc.js.formatStr(a, b, c);
 */
    function formatStr() {
        var argLen = arguments.length;
        if (argLen === 0) {
            return '';
        }
        var msg = arguments[0];
        if (argLen === 1) {
            return '' + msg;
        }
        var hasSubstitution = typeof msg === 'string' && REGEXP_NUM_OR_STR.test(msg);
        if (hasSubstitution) {
            for (var i = 1; i < argLen; ++i) {
                var arg = arguments[i];
                var regExpToTest = typeof arg === 'number' ? REGEXP_NUM_OR_STR : REGEXP_STR;
                if (regExpToTest.test(msg))
                    msg = msg.replace(regExpToTest, arg);
                else
                    msg += ' ' + arg;
            }
        }
        else {
            for (var i = 1; i < argLen; ++i) {
                msg += ' ' + arguments[i];
            }
        }
        return msg;
    }
    js.formatStr = formatStr;
    ;
})(js = exports.js || (exports.js = {}));
;
function isTempClassId(id) {
    return typeof id !== 'string' || id.startsWith(tempCIDGenerater.prefix);
}
// id 注册
(function () {
    var _idToClass = {};
    var _nameToClass = {};
    function setup(key, publicName, table) {
        js.getset(js, publicName, function () {
            return Object.assign({}, table);
        }, function (value) {
            js.clear(table);
            Object.assign(table, value);
        });
        return function (id, constructor) {
            // deregister old
            if (constructor.prototype.hasOwnProperty(key)) {
                delete table[constructor.prototype[key]];
            }
            js.value(constructor.prototype, key, id);
            // register class
            if (id) {
                var registered = table[id];
                if (registered && registered !== constructor) {
                    var error = 'A Class already exists with the same ' + key + ' : "' + id + '".';
                    CCDebug_1.cc.error(error);
                }
                else {
                    table[id] = constructor;
                }
            }
        };
    }
    /**
     * Register the class by specified id, if its classname is not defined, the class name will also be set.
     * @method _setClassId
     * @param {String} classId
     * @param {Function} constructor
     * @private
     */
    /**
     * !#en All classes registered in the engine, indexed by ID.
     * !#zh 引擎中已注册的所有类型，通过 ID 进行索引。
     * @property _registeredClassIds
     * @example
     * // save all registered classes before loading scripts
     * let builtinClassIds = cc.js._registeredClassIds;
     * let builtinClassNames = cc.js._registeredClassNames;
     * // load some scripts that contain CCClass
     * ...
     * // clear all loaded classes
     * cc.js._registeredClassIds = builtinClassIds;
     * cc.js._registeredClassNames = builtinClassNames;
     */
    js._setClassId = setup('__cid__', '_registeredClassIds', _idToClass);
    /**
     * !#en All classes registered in the engine, indexed by name.
     * !#zh 引擎中已注册的所有类型，通过名称进行索引。
     * @property _registeredClassNames
     * @example
     * // save all registered classes before loading scripts
     * let builtinClassIds = cc.js._registeredClassIds;
     * let builtinClassNames = cc.js._registeredClassNames;
     * // load some scripts that contain CCClass
     * ...
     * // clear all loaded classes
     * cc.js._registeredClassIds = builtinClassIds;
     * cc.js._registeredClassNames = builtinClassNames;
     */
    var doSetClassName = setup('__classname__', '_registeredClassNames', _nameToClass);
    /**
     * Register the class by specified name manually
     * @method setClassName
     * @param {String} className
     * @param {Function} constructor
     */
    js.setClassName = function (className, constructor) {
        doSetClassName(className, constructor);
        // auto set class id
        if (!constructor.prototype.hasOwnProperty('__cid__')) {
            var id = className || tempCIDGenerater.getNewId();
            if (id) {
                js._setClassId(id, constructor);
            }
        }
    };
    /**
     * Unregister a class from fireball.
     *
     * If you dont need a registered class anymore, you should unregister the class so that Fireball will not keep its reference anymore.
     * Please note that its still your responsibility to free other references to the class.
     *
     * @method unregisterClass
     * @param {Function} ...constructor - the class you will want to unregister, any number of classes can be added
     */
    js.unregisterClass = function () {
        for (var i = 0; i < arguments.length; i++) {
            var p = arguments[i].prototype;
            var classId = p.__cid__;
            if (classId) {
                delete _idToClass[classId];
            }
            var classname = p.__classname__;
            if (classname) {
                delete _nameToClass[classname];
            }
        }
    };
    /**
     * Get the registered class by id
     * @method _getClassById
     * @param {String} classId
     * @return {Function} constructor
     * @private
     */
    js._getClassById = function (classId) {
        return _idToClass[classId];
    };
    /**
     * Get the registered class by name
     * @method getClassByName
     * @param {String} classname
     * @return {Function} constructor
     */
    js.getClassByName = function (classname) {
        return _nameToClass[classname];
    };
    /**
     * Get class id of the object
     * @method _getClassId
     * @param {Object|Function} obj - instance or constructor
     * @param {Boolean} [allowTempId=true] - can return temp id in editor
     * @return {String}
     * @private
     */
    js._getClassId = function (obj, allowTempId) {
        allowTempId = (typeof allowTempId !== 'undefined' ? allowTempId : true);
        var res;
        if (typeof obj === 'function' && obj.prototype.hasOwnProperty('__cid__')) {
            res = obj.prototype.__cid__;
            if (!allowTempId && isTempClassId(res)) {
                return '';
            }
            return res;
        }
        if (obj && obj.constructor) {
            var prototype = obj.constructor.prototype;
            if (prototype && prototype.hasOwnProperty('__cid__')) {
                res = obj.__cid__;
                if (!allowTempId && isTempClassId(res)) {
                    return '';
                }
                return res;
            }
        }
        return '';
    };
})();
/**
 * Defines a polyfill field for deprecated codes.
 * @method obsolete
 * @param {any} obj - YourObject or YourClass.prototype
 * @param {String} obsoleted - "OldParam" or "YourClass.OldParam"
 * @param {String} newExpr - "NewParam" or "YourClass.NewParam"
 * @param {Boolean} [writable=false]
 */
js.obsolete = function (obj, obsoleted, newExpr, writable) {
    var extractPropName = /([^.]+)$/;
    var oldProp = extractPropName.exec(obsoleted)[0];
    var newProp = extractPropName.exec(newExpr)[0];
    function get() {
        return this[newProp];
    }
    if (writable) {
        js.getset(obj, oldProp, get, function (value) {
            this[newProp] = value;
        });
    }
    else {
        js.get(obj, oldProp, get);
    }
};
/**
 * Defines all polyfill fields for obsoleted codes corresponding to the enumerable properties of props.
 * @method obsoletes
 * @param {any} obj - YourObject or YourClass.prototype
 * @param {any} objName - "YourObject" or "YourClass"
 * @param {Object} props
 * @param {Boolean} [writable=false]
 */
js.obsoletes = function (obj, objName, props, writable) {
    for (var obsoleted in props) {
        var newName = props[obsoleted];
        js.obsolete(obj, objName + '.' + obsoleted, newName, writable);
    }
};
// see https://github.com/petkaantonov/bluebird/issues/1389
js.shiftArguments = function () {
    var len = arguments.length - 1;
    var args = new Array(len);
    for (var i = 0; i < len; ++i) {
        args[i] = arguments[i + 1];
    }
    return args;
};
/**
 * !#en
 * A simple wrapper of `Object.create(null)` which ensures the return object have no prototype (and thus no inherited members). So we can skip `hasOwnProperty` calls on property lookups. It is a worthwhile optimization than the `{}` literal when `hasOwnProperty` calls are necessary.
 * !#zh
 * 该方法是对 `Object.create(null)` 的简单封装。`Object.create(null)` 用于创建无 prototype （也就无继承）的空对象。这样我们在该对象上查找属性时，就不用进行 `hasOwnProperty` 判断。在需要频繁判断 `hasOwnProperty` 时，使用这个方法性能会比 `{}` 更高。
 *
 * @method createMap
 * @param {Boolean} [forceDictMode=false] - Apply the delete operator to newly created map object. This causes V8 to put the object in "dictionary mode" and disables creation of hidden classes which are very expensive for objects that are constantly changing shape.
 * @return {Object}
 */
js.createMap = function (forceDictMode) {
    var map = Object.create(null);
    if (forceDictMode) {
        var INVALID_IDENTIFIER_1 = '.';
        var INVALID_IDENTIFIER_2 = '/';
        map[INVALID_IDENTIFIER_1] = true;
        map[INVALID_IDENTIFIER_2] = true;
        delete map[INVALID_IDENTIFIER_1];
        delete map[INVALID_IDENTIFIER_2];
    }
    return map;
};
var array = /** @class */ (function () {
    function array() {
    }
    /**
     * @class array
     * @static
     */
    /**
     * Removes the array item at the specified index.
     * @method removeAt
     * @param {any[]} array
     * @param {Number} index
     */
    array.removeAt = function (array, index) {
        array.splice(index, 1);
    };
    /**
     * Removes the array item at the specified index.
     * It's faster but the order of the array will be changed.
     * @method fastRemoveAt
     * @param {any[]} array
     * @param {Number} index
     */
    array.fastRemoveAt = function (array, index) {
        var length = array.length;
        if (index < 0 || index >= length) {
            return;
        }
        array[index] = array[length - 1];
        array.length = length - 1;
    };
    /**
     * Removes the first occurrence of a specific object from the array.
     * @method remove
     * @param {any[]} array
     * @param {any} value
     * @return {Boolean}
     */
    array.remove = function (array, value) {
        var index = array.indexOf(value);
        if (index >= 0) {
            array.removeAt(array, index);
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Removes the first occurrence of a specific object from the array.
     * It's faster but the order of the array will be changed.
     * @method fastRemove
     * @param {any[]} array
     * @param {Number} value
     */
    array.fastRemove = function (array, value) {
        var index = array.indexOf(value);
        if (index >= 0) {
            array[index] = array[array.length - 1];
            --array.length;
        }
    };
    /**
     * Verify array's Type
     * @method verifyType
     * @param {array} array
     * @param {Function} type
     * @return {Boolean}
     */
    array.verifyType = function (array, type) {
        if (array && array.length > 0) {
            for (var i = 0; i < array.length; i++) {
                if (!(array[i] instanceof type)) {
                    CCDebug_1.cc.logID(1300);
                    return false;
                }
            }
        }
        return true;
    };
    /**
     * Removes from array all values in minusArr. For each Value in minusArr, the first matching instance in array will be removed.
     * @method removeArray
     * @param {Array} array Source Array
     * @param {Array} minusArr minus Array
     */
    array.removeArray = function (array, minusArr) {
        for (var i = 0, l = minusArr.length; i < l; i++) {
            array.remove(array, minusArr[i]);
        }
    };
    /**
     * Inserts some objects at index
     * @method appendObjectsAt
     * @param {Array} array
     * @param {Array} addObjs
     * @param {Number} index
     * @return {Array}
     */
    array.appendObjectsAt = function (array, addObjs, index) {
        array.splice.apply(array, [index, 0].concat(addObjs));
        return array;
    };
    /**
     * Determines whether the array contains a specific value.
     * @method contains
     * @param {any[]} array
     * @param {any} value
     * @return {Boolean}
     */
    array.contains = function (array, value) {
        return array.indexOf(value) >= 0;
    };
    /**
     * Copy an array's item to a new array (its performance is better than Array.slice)
     * @method copy
     * @param {Array} array
     * @return {Array}
     */
    array.copy = function (array) {
        var i, len = array.length, arr_clone = new Array(len);
        for (i = 0; i < len; i += 1)
            arr_clone[i] = array[i];
        return arr_clone;
    };
    /**
     * Exact same function as Array.prototype.indexOf.<br>
     * HACK: ugliy hack for Baidu mobile browser compatibility, stupid Baidu guys modify Array.prototype.indexOf for all pages loaded, their version changes strict comparison to non-strict comparison, it also ignores the second parameter of the original API, and this will cause event handler enter infinite loop.<br>
     * Baidu developers, if you ever see this documentation, here is the standard: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf, Seriously!
     *
     * @method indexOf
     * @param {any} searchElement - Element to locate in the array.
     * @param {Number} [fromIndex=0] - The index to start the search at
     * @return {Number} - the first index at which a given element can be found in the array, or -1 if it is not present.
     */
    array.indexOf = Array.prototype.indexOf;
    array.MutableForwardIterator = mutable_forward_iterator_1.MutableForwardIterator;
    return array;
}());
js.array = array;
// OBJECT POOL
/**
 * !#en
 * A fixed-length object pool designed for general type.<br>
 * The implementation of this object pool is very simple,
 * it can helps you to improve your game performance for objects which need frequent release and recreate operations<br/>
 * !#zh
 * 长度固定的对象缓存池，可以用来缓存各种对象类型。<br/>
 * 这个对象池的实现非常精简，它可以帮助您提高游戏性能，适用于优化对象的反复创建和销毁。
 * @class Pool
 * @example
 *
 *Example 1:
 *
 *function Details () {
 *    this.uuidList = [];
 *};
 *Details.prototype.reset = function () {
 *    this.uuidList.length = 0;
 *};
 *Details.pool = new js.Pool(function (obj) {
 *    obj.reset();
 *}, 5);
 *Details.pool.get = function () {
 *    return this._get() || new Details();
 *};
 *
 *var detail = Details.pool.get();
 *...
 *Details.pool.put(detail);
 *
 *Example 2:
 *
 *function Details (buffer) {
 *    this.uuidList = buffer;
 *};
 *...
 *Details.pool.get = function (buffer) {
 *    var cached = this._get();
 *    if (cached) {
 *        cached.uuidList = buffer;
 *        return cached;
 *    }
 *    else {
 *        return new Details(buffer);
 *    }
 *};
 *
 *var detail = Details.pool.get( [] );
 *...
 */
/**
 * !#en
 * Constructor for creating an object pool for the specific object type.
 * You can pass a callback argument for process the cleanup logic when the object is recycled.
 * !#zh
 * 使用构造函数来创建一个指定对象类型的对象池，您可以传递一个回调函数，用于处理对象回收时的清理逻辑。
 * @method constructor
 * @param {Function} [cleanupFunc] - the callback method used to process the cleanup logic when the object is recycled.
 * @param {Object} cleanupFunc.obj
 * @param {Number} size - initializes the length of the array
 * @typescript
 * constructor(cleanupFunc: (obj: any) => void, size: number)
 * constructor(size: number)
 */
var Pool = /** @class */ (function () {
    function Pool(cleanupFunc, size) {
        /**
         * !#en
         * Get and initialize an object from pool. This method defaults to null and requires the user to implement it.
         * !#zh
         * 获取并初始化对象池中的对象。这个方法默认为空，需要用户自己实现。
         * @method get
         * @param {any} ...params - parameters to used to initialize the object
         * @returns {Object}
         */
        /**
         * !#en
         * The current number of available objects, the default is 0, it will gradually increase with the recycle of the object,
         * the maximum will not exceed the size specified when the constructor is called.
         * !#zh
         * 当前可用对象数量，一开始默认是 0，随着对象的回收会逐渐增大，最大不会超过调用构造函数时指定的 size。
         * @property {Number} count
         * @default 0
         */
        /**
         * !#en
         * Get an object from pool, if no available object in the pool, null will be returned.
         * !#zh
         * 获取对象池中的对象，如果对象池没有可用对象，则返回空。
         * @method _get
         * @returns {Object|null}
         */
        this._get = function () {
            if (this.count > 0) {
                --this.count;
                var cache = this._pool[this.count];
                this._pool[this.count] = null;
                return cache;
            }
            return null;
        };
        /**
         * !#en Put an object into the pool.
         * !#zh 向对象池返还一个不再需要的对象。
         * @method put
         */
        this.put = function (obj) {
            var pool = this._pool;
            if (this.count < pool.length) {
                if (this._cleanup && this._cleanup(obj) === false) {
                    return;
                }
                pool[this.count] = obj;
                ++this.count;
            }
        };
        /**
         * !#en Resize the pool.
         * !#zh 设置对象池容量。
         * @method resize
         */
        this.resize = function (length) {
            if (length >= 0) {
                this._pool.length = length;
                if (this.count > length) {
                    this.count = length;
                }
            }
        };
        if (size === undefined) {
            size = cleanupFunc;
            cleanupFunc = null;
        }
        this.get = null;
        this.count = 0;
        this._pool = new Array(size);
        this._cleanup = cleanupFunc;
    }
    return Pool;
}());
js.Pool = Pool;
//# sourceMappingURL=js.js.map