(function(global, undefined) {

    'use strict';
  
    var Math = global.Math;
    if (!Math.randInt) {
        Math.randInt = function(min, max) {
            if (typeof max != 'number') {
                if (typeof min != 'number') {
                    return Math.random();
                } else {
                    max = min;
                    min = 1;
                }
            }

            return Math.floor(Math.random() * (max - min + 1) + min);
            
        }
    }
  
}(window));