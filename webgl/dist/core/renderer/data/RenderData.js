"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderDataPool = exports.SpineRenderData = exports.NormalRenderData = exports.RenderData = exports.RenderDataType = void 0;
var Matrix_1 = require("../../Matrix");
var renderDataId = 0;
var RenderDataType;
(function (RenderDataType) {
    RenderDataType[RenderDataType["Base"] = 1] = "Base";
    RenderDataType[RenderDataType["Normal"] = 2] = "Normal";
    RenderDataType[RenderDataType["Spine"] = 3] = "Spine";
})(RenderDataType = exports.RenderDataType || (exports.RenderDataType = {}));
/**
 * 定义渲染数据
 */
var RenderData = /** @class */ (function () {
    function RenderData() {
        this._isUse = false; //使用状态
        this.id = renderDataId++;
        this._type = RenderDataType.Base;
        this.reset();
    }
    RenderData.prototype.reset = function () {
        this._cameraType = 0; //默认情况下是透视投影
        this._shader = null;
        this._vertGLID = null;
        this._vertItemSize = -1;
        this._indexGLID = null;
        this._indexItemSize = -1;
        this._uvGLID = null;
        this._uvItemSize = -1;
        this._normalGLID = null;
        this._normalItemSize = -1;
        this._lightColor = [];
        this._lightDirection = [];
        this._textureGLIDArray = [];
        this._modelMatrix = null;
        this._u_pvm_matrix_inverse = null;
        this._time = 0;
        this._glPrimitiveType = 6 /* TRIANGLE_FAN */;
        this._isUse = false;
    };
    return RenderData;
}());
exports.RenderData = RenderData;
var NormalRenderData = /** @class */ (function (_super) {
    __extends(NormalRenderData, _super);
    function NormalRenderData() {
        var _this = _super.call(this) || this;
        _this._extraViewLeftMatrix = Matrix_1.glMatrix.mat4.identity(null);
        _this._tempMatrix1 = Matrix_1.glMatrix.mat4.identity(null);
        _this._type = RenderDataType.Normal;
        return _this;
    }
    NormalRenderData.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this._uniformData = [];
        this._shaderData = null;
        this._attrbufferData = null;
        this._projKey = "";
        this._viewKey = "";
        this._glPrimitiveType = 4 /* TRIANGLES */;
        Matrix_1.glMatrix.mat4.identity(this._extraViewLeftMatrix);
        Matrix_1.glMatrix.mat4.identity(this._tempMatrix1);
    };
    return NormalRenderData;
}(RenderData));
exports.NormalRenderData = NormalRenderData;
var SpineRenderData = /** @class */ (function (_super) {
    __extends(SpineRenderData, _super);
    function SpineRenderData() {
        var _this = _super.call(this) || this;
        _this._type = RenderDataType.Spine;
        return _this;
    }
    return SpineRenderData;
}(NormalRenderData));
exports.SpineRenderData = SpineRenderData;
/**
 * 渲染数据缓存池
 */
var RenderDataPool = /** @class */ (function () {
    function RenderDataPool() {
    }
    RenderDataPool.get = function (type) {
        var pool = RenderDataPool._pool;
        var retItem;
        for (var j = 0; j < pool.length; j++) {
            var item = pool[j];
            if (item._type == type && item._isUse == false) {
                retItem = item;
                break;
            }
        }
        switch (type) {
            case RenderDataType.Base:
                retItem = new RenderData();
                pool.push(retItem);
                break;
            case RenderDataType.Normal:
                retItem = new NormalRenderData();
                pool.push(retItem);
                break;
            case RenderDataType.Spine:
                retItem = new SpineRenderData();
                pool.push(retItem);
                break;
        }
        retItem._isUse = true;
        return retItem;
    };
    RenderDataPool.return = function (retData) {
        if (retData instanceof Array) {
            var arr = retData;
            for (var j = 0; j < arr.length; j++) {
                arr[j].reset();
            }
        }
        else {
            retData.reset();
        }
    };
    RenderDataPool._pool = [];
    return RenderDataPool;
}());
exports.RenderDataPool = RenderDataPool;
//# sourceMappingURL=RenderData.js.map