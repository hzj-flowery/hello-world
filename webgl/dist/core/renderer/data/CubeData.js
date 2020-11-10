"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CubeData = exports.CubeFaceData = exports.CubeFace = void 0;
//立方体的面
var CubeFace;
(function (CubeFace) {
    CubeFace[CubeFace["FRONT"] = 0] = "FRONT";
    CubeFace[CubeFace["BACK"] = 1] = "BACK";
    CubeFace[CubeFace["LEFT"] = 2] = "LEFT";
    CubeFace[CubeFace["RIGHT"] = 3] = "RIGHT";
    CubeFace[CubeFace["UP"] = 4] = "UP";
    CubeFace[CubeFace["DOWN"] = 5] = "DOWN";
})(CubeFace = exports.CubeFace || (exports.CubeFace = {}));
//立方体的面的数据
var CubeFaceData = /** @class */ (function () {
    function CubeFaceData(face, vArr, uvArr, indexArr, normals) {
        this.face = CubeFace.FRONT;
        this.normals = [];
        this.uv = [];
        this.vertex = [];
        this.indexs = [];
        this.vertex_item_size = 0;
        this.vertex_item_nums = 4;
        this.normal_item_size = 0;
        this.normal_item_nums = 4;
        this.uv_item_size = 0;
        this.uv_item_nums = 4;
        this.indexs_item_size = 0;
        this.indexs_item_nums = 1;
        this.face = face;
        this.vertex = vArr;
        this.vertex_item_size = vArr.length / this.vertex_item_nums;
        this.uv = uvArr;
        this.uv_item_size = uvArr.length / this.uv_item_nums;
        this.indexs = indexArr;
        this.indexs_item_size = indexArr.length / this.indexs_item_nums;
        this.normals = normals;
        this.normal_item_size = normals.length / this.normal_item_nums;
    }
    Object.defineProperty(CubeFaceData.prototype, "Face", {
        get: function () {
            return this.face;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CubeFaceData.prototype, "Vertex", {
        //默认情况 一个面有四个点
        get: function () {
            return this.vertex;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CubeFaceData.prototype, "UV", {
        get: function () {
            return this.uv;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CubeFaceData.prototype, "Indexs", {
        get: function () {
            return this.indexs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CubeFaceData.prototype, "Normals", {
        get: function () {
            return this.normals;
        },
        enumerable: false,
        configurable: true
    });
    return CubeFaceData;
}());
exports.CubeFaceData = CubeFaceData;
var CubeData = /** @class */ (function () {
    function CubeData() {
    }
    CubeData.getFaceData = function (face) {
        var cFData = function (key) {
            return new CubeFaceData(CubeFace.FRONT, CubeData.verPos.slice(3 * 4 * key, 3 * 4 * (key + 1)), CubeData.texUV.slice(2 * 4 * key, 2 * 4 * (key + 1)), CubeData.verIndex.slice(1 * 6 * key, 1 * 6 * (key + 1)), CubeData.normals.slice(3 * 4 * key, 3 * 4 * (key + 1)));
        };
        switch (face) {
            case CubeFace.FRONT:
                return cFData(CubeFace.FRONT);
            case CubeFace.BACK:
                return cFData(CubeFace.BACK);
            case CubeFace.LEFT:
                return cFData(CubeFace.LEFT);
            case CubeFace.RIGHT:
                return cFData(CubeFace.RIGHT);
            case CubeFace.UP:
                return cFData(CubeFace.UP);
            case CubeFace.DOWN:
                return cFData(CubeFace.DOWN);
        }
    };
    CubeData.getData = function () {
        var faceFrontData = CubeData.getFaceData(CubeFace.FRONT);
        var faceBackData = CubeData.getFaceData(CubeFace.BACK);
        var faceLeftData = CubeData.getFaceData(CubeFace.LEFT);
        var faceRightData = CubeData.getFaceData(CubeFace.RIGHT);
        var faceUpData = CubeData.getFaceData(CubeFace.UP);
        var faceDownData = CubeData.getFaceData(CubeFace.DOWN);
        var concatData = function (key) {
            return [].concat(faceFrontData[key], faceBackData[key], faceLeftData[key], faceRightData[key], faceUpData[key], faceDownData[key]);
        };
        var vertex = concatData("Vertex");
        var uvData = concatData("UV");
        var indexs = concatData("Indexs");
        var normals = concatData("Normals");
        return {
            vertex: vertex,
            uvData: uvData,
            indexs: indexs,
            normals: normals,
            dF: faceFrontData
        };
    };
    CubeData.getData2 = function () {
        var faceFrontData = CubeData.getFaceData(CubeFace.FRONT);
        var faceBackData = CubeData.getFaceData(CubeFace.BACK);
        var faceLeftData = CubeData.getFaceData(CubeFace.LEFT);
        var faceRightData = CubeData.getFaceData(CubeFace.RIGHT);
        var faceUpData = CubeData.getFaceData(CubeFace.UP);
        var faceDownData = CubeData.getFaceData(CubeFace.DOWN);
        var concatData = function (key) {
            return [].concat(faceRightData[key], faceLeftData[key], faceUpData[key], faceDownData[key], faceBackData[key], faceFrontData[key]);
        };
        var vertex = concatData("Vertex");
        var uvData = concatData("UV");
        var indexs = concatData("Indexs");
        var normals = concatData("Normals");
        return {
            vertex: vertex,
            uvData: uvData,
            indexs: indexs,
            normals: normals,
            dF: faceFrontData
        };
    };
    // 顶点数据
    CubeData.verPos = [
        // Front face
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        // Back face
        1.0, 1.0, -1.0,
        -1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        // Left face
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        // Right face
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        // Top face
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        // Bottom face
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
    ];
    // uv 数据
    CubeData.texUV = [
        //Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Back face
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
        // Left face
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
        // Right face
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
        // Top face
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
        // Bottom face
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
    ];
    // 索引数据
    CubeData.verIndex = [
        0, 1, 2, 0, 2, 3,
        4, 6, 5, 4, 7, 6,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 22, 21, 20, 23, 22 // Bottom face
    ];
    CubeData.normals = [
        // front face
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        // back face
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        // left face
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        // right face
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        // top face
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        // bottom face
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0
    ];
    return CubeData;
}());
exports.CubeData = CubeData;
//# sourceMappingURL=CubeData.js.map