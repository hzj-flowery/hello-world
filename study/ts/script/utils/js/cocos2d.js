(function(global, undefined) {

    'use strict';
  
    var cc = global.cc;
    // Object.defineProperty(cc, 'pAdd', {
    //     get: function() {
    //         return function(pt1, pt2) {
    //             return {x: pt1.x + pt2.x, y: pt1.y + pt2.y}
    //         }
    //     }
    // })
    // cc.pAdd = function(pt1, pt2) {
    //     return {x: pt1.x + pt2.x, y: pt1.y + pt2.y}
    // }

    cc.pGetDistance = function(startP, endP) {
        return cc.pGetLength(startP.sub(endP))
    }

    cc.pGetLength = function(pt) {
        return Math.sqrt( pt.x * pt.x + pt.y * pt.y )
    }

    cc.pMul = function(pt1, factor) {
        return { x: pt1.x * factor , y: pt1.y * factor }
    }

    // cc.pSub = function(pt1, pt2) {
    //     return {x: pt1.x - pt2.x , y: pt1.y - pt2.y }
    // }
  
}(window));