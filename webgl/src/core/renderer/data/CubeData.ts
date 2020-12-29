
//立方体的面
export enum CubeFace {
    FRONT = 0,
    BACK = 1,
    LEFT,
    RIGHT,
    UP,
    DOWN
}
//立方体的面的数据
export class CubeFaceData {
    constructor(face, vArr: Array<number>, uvArr: Array<number>, indexArr: Array<number>, normals: Array<number>) {
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
    private face: CubeFace = CubeFace.FRONT;
    private normals: Array<number> = [];
    private uv: Array<number> = [];
    private vertex: Array<number> = [];
    private indexs: Array<number> = [];

    readonly vertex_item_size: number = 0;
    readonly vertex_item_nums: number = 4;
    readonly normal_item_size: number = 0;
    readonly normal_item_nums: number = 4;
    readonly uv_item_size: number = 0;
    readonly uv_item_nums: number = 4;
    readonly indexs_item_size: number = 0;
    readonly indexs_item_nums: number = 1;
    get Face() {
        return this.face;
    }
    //默认情况 一个面有四个点
    get Vertex() {
        return this.vertex;
    }
    get UV() {
        return this.uv;
    }
    get Indexs() {
        return this.indexs;
    }
    get Normals() {
        return this.normals;
    }


}
/**
 -1, -1, -1,     //左下后
-1, -1, 1,      //左下前      //左面下后三角形
-1, 1, -1,      //左上后
                    //左面是个矩形 面朝左右 斜角切开
-1, -1, 1,      //左下前
-1, 1, 1,       //左上前      //左面上前三角形
-1, 1, -1,      //左上后

1, -1, -1,      //右下后  
1, 1, -1,       //右上后      //右面下后三角形 
1, -1, 1,       //右下前
                    //右面是个矩形 面朝左右 斜角切开
1, -1, 1,       //右下前
1, 1, -1,       //右上后      //右面上前三角形
1, 1, 1,        //右上前
 */
export class CubeData {
    // 顶点数据
    private static verPos = [
        // Front face
        1.0, 1.0, 1.0, //v0 右上前
        -1.0, 1.0, 1.0, //v1 左上前
        -1.0, -1.0, 1.0, //v2 左下前
        1.0, -1.0, 1.0, //v3  右下前

        // Back face
        1.0, 1.0, -1.0, //v4  右上后
        -1.0, 1.0, -1.0, //v5 左上后
        -1.0, -1.0, -1.0, //v6 左下后
        1.0, -1.0, -1.0, //v7  右下后

        // Left face
        -1.0, 1.0, 1.0, //v8 左上前
        -1.0, 1.0, -1.0, //v9 左上后
        -1.0, -1.0, -1.0, //v10 左下后
        -1.0, -1.0, 1.0, //v11 左下前


        // Right face
        1.0, 1.0, 1.0, //12  右上前
        1.0, -1.0, 1.0, //13  右下前
        1.0, -1.0, -1.0, //14  右下后
        1.0, 1.0, -1.0, //15  右上后

        // Top face
        1.0, 1.0, 1.0, //v16  右上前
        1.0, 1.0, -1.0, //v17  右上后
        -1.0, 1.0, -1.0, //v18  左上后
        -1.0, 1.0, 1.0, //v19   左上前

        // Bottom face
        1.0, -1.0, 1.0, //v20   右下前
        1.0, -1.0, -1.0, //v21  右下后
        -1.0, -1.0, -1.0, //v22 左下后
        -1.0, -1.0, 1.0, //v23  左下前
    ];
    // uv 数据
    private static texUV = [
        //Front face
        0.0, 0.0, //v0
        1.0, 0.0, //v1
        1.0, 1.0, //v2
        0.0, 1.0, //v3

        // Back face
        0.0, 1.0, //v4
        1.0, 1.0, //v5
        1.0, 0.0, //v6
        0.0, 0.0, //v7

        // Left face
        0.0, 1.0, //v8
        1.0, 1.0, //v9
        1.0, 0.0, //v10
        0.0, 0.0, //v11

        // Right face
        0.0, 1.0, //v12
        1.0, 1.0, //v13
        1.0, 0.0, //v14
        0.0, 0.0, //v15

        // Top face
        0.0, 1.0, //v16
        1.0, 1.0, //v17
        1.0, 0.0, //v18
        0.0, 0.0, //v19

        // Bottom face
        0.0, 1.0, //v20
        1.0, 1.0, //v21
        1.0, 0.0, //v22
        0.0, 0.0, //v23
    ];
    // 索引数据
    private static verIndex = [
        0, 1, 2, 0, 3, 2, // Front face
        4, 5, 6, 4, 7, 6, // Back face
        8, 9, 10, 8, 11, 10, // Left face
        12, 13, 14, 12, 15, 14, // Right face
        16, 17, 18, 16, 19, 18, // Top face
        20, 21, 22, 20, 23, 22, // Bottom face
    ];
    private static normals = [
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
        0, -1, 0];
    public static getFaceData(face: CubeFace): CubeFaceData {
        var cFData = function (key: number) {
            return new CubeFaceData(face,
                CubeData.verPos.slice(3 * 4 * key, 3 * 4 * (key + 1)),
                CubeData.texUV.slice(2 * 4 * key, 2 * 4 * (key + 1)),
                CubeData.verIndex.slice(1 * 6 * key, 1 * 6 * (key + 1)),
                CubeData.normals.slice(3 * 4 * key, 3 * 4 * (key + 1)));

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
    }
    public static getData() {
        var faceFrontData = CubeData.getFaceData(CubeFace.FRONT);
        var faceBackData = CubeData.getFaceData(CubeFace.BACK);
        var faceLeftData = CubeData.getFaceData(CubeFace.LEFT);
        var faceRightData = CubeData.getFaceData(CubeFace.RIGHT);
        var faceUpData = CubeData.getFaceData(CubeFace.UP);
        var faceDownData = CubeData.getFaceData(CubeFace.DOWN);
        var concatData = function (key: string) {
            return [].concat(
                faceFrontData[key],
                faceBackData[key],
                faceLeftData[key],
                faceRightData[key],
                faceUpData[key],
                faceDownData[key]);
        }
        var vertex = concatData("Vertex");
        var uvData = concatData("UV");
        var indexs = concatData("Indexs");
        var normals = concatData("Normals");
        // return {
        //     vertex:vertex,
        //     uvData:uvData,
        //     indexs:indexs,
        //     normals:normals,
        //     dF:faceFrontData
        // }
        console.log("faceFrontData---", faceFrontData);
        return {
            vertex: CubeData.verPos,
            uvData: CubeData.texUV,
            indexs: CubeData.verIndex,
            normals: CubeData.normals,
            dF: faceFrontData
        }

    }
    public static getData2() {
        var faceFrontData = CubeData.getFaceData(CubeFace.FRONT);
        var faceBackData = CubeData.getFaceData(CubeFace.BACK);
        var faceLeftData = CubeData.getFaceData(CubeFace.LEFT);
        var faceRightData = CubeData.getFaceData(CubeFace.RIGHT);
        var faceUpData = CubeData.getFaceData(CubeFace.UP);
        var faceDownData = CubeData.getFaceData(CubeFace.DOWN);
        var concatData = function (key: string) {
            return [].concat(
                faceRightData[key],
                faceLeftData[key],
                faceUpData[key],
                faceDownData[key],
                faceBackData[key],
                faceFrontData[key])
        }
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
        }

    }
}