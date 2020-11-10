/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

// TODO - merge with misc.js

export default class {
    contains(refNode, otherNode) {
        if (typeof refNode.contains == 'function') {
            return refNode.contains(otherNode);
        } else if (typeof refNode.compareDocumentPosition == 'function') {
            return !!(refNode.compareDocumentPosition(otherNode) & 16);
        } else {
            var node = otherNode.parentNode;
            if (node) {
                do {
                    if (node === refNode) {
                        return true;
                    } else {
                        node = node.parentNode;
                    }
                } while (node !== null);
            }
            return false;
        }
    }


    callInNextTick(callback, p1, p2) {
        if (callback) {
            setTimeout(function () {
                callback(p1, p2);
            }, 0);
        }
    }

    isDomNode(obj) {
        if (typeof window === 'object' && typeof obj == 'function') {
            return obj instanceof Node;
        }
        else if (typeof window === 'object') {
            return obj &&
                typeof obj === 'object' &&
                typeof obj.nodeType === 'number' &&
                typeof obj.nodeName === 'string';
        }
        return false;
    }
}







