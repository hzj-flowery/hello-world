"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Scene_1 = require("./Scene");
var OrthoCamera_1 = require("../camera/OrthoCamera");
var Rectangle_1 = require("../2d/Rectangle");
var Device_1 = require("../../../Device");
var TwoSprite_1 = require("../2d/TwoSprite");
var Scene2D = /** @class */ (function (_super) {
    __extends(Scene2D, _super);
    function Scene2D() {
        return _super.call(this) || this;
    }
    Scene2D.prototype.init = function () {
        var gl = Device_1.default.Instance.gl;
        this._2dCamera = new OrthoCamera_1.default(60 * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.1, 100);
        this._2dCamera.lookAt([0, 0, -1]);
        this.addCamera(this._2dCamera);
        this._rectangle = new Rectangle_1.Rectangle(gl);
        this._rectangle.setPosition(0, 0, 0);
        this._rectangle.url = "res/wood.jpg";
        this.addChild(this._rectangle);
        // this._firstSprite = new FirstSprite(gl);
        // this._firstSprite.setPosition(0,1,0);
        // this.addChild(this._firstSprite);
        this._twoSprite = new TwoSprite_1.default(gl);
        this._twoSprite.setScale(0.2, 0.2, 0.2);
        this.addChild(this._twoSprite);
        // this._renderSprite = new RenderSprite(gl);
        // this._renderSprite.setPosition(0.5,0.8,0);
        // this.addChild(this._renderSprite);
        // this._label = new Label(this.gl);
        // this._label.setPosition(0.0,0.0,0);
        // this._label.url = "res/8x8-font.png";
        // this._label.content = "zm5"
        // this._2dScene.addChild(this._label);
    };
    Scene2D.prototype.getCamera = function () {
        return this._2dCamera;
    };
    Scene2D.prototype.getFrameBuffer = function () {
        return this._renderSprite.getFrameBuffer();
    };
    return Scene2D;
}(Scene_1.default));
exports.default = Scene2D;
//# sourceMappingURL=Scene2D.js.map