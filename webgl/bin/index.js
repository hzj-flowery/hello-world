window.screenOrientation = "sensor_landscape";
loadLib("./libs/three.js")
loadLib("./libs/WebGLDebugUtils.js")

loadLib("./libs/webgl-lessons-ui.js")
loadLib("./libs/twgl-full.min.js")
loadLib("./libs/promise.js")
loadLib("./libs/binary.js")
loadLib("./libs/m4.js");
loadLib("./libs/webgl-utils.js");
loadLib("./libs/primitives.js");


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



loadLib("./js/bundle.js")
