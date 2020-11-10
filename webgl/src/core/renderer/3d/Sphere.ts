import { SY } from "../base/Sprite";

var vertextBaseCode =
    'precision highp float;'+
    'attribute vec3 a_position;' +
    'uniform mat4 u_MVMatrix;' +
    'uniform mat4 u_PMatrix;' +
    'varying vec4 color;' +

    'void main() {' +
    'gl_Position = u_PMatrix * u_MVMatrix * vec4(a_position, 1.0);' +
    'color=vec4(gl_Position.x,gl_Position.y,gl_Position.z,0.8);' +
    '}'
//基础的shader的片段着色器
var fragBaseCode =
    'precision mediump float;' +
    'varying vec4 color;' +
    'void main() {' +
    'gl_FragColor = color;' +
    '}'


export default class Sphere extends SY.Sprite {

    private drawQiu02(r, m) {
        var arr = new Array();

        var bufR = -r;
        var getMaxY = function (a, z, r) {
            var angle = 0;
            var addAng = 360 / a;
            var d = new Array();

            for (var i = 0; i < a; i++) {
                d.push(Math.sin(Math.PI / 180 * angle) * r, Math.cos(Math.PI / 180 * angle) * r, z);
                angle += addAng;
            }
            return d;
        }
        var addAng = 360 / m;
        var angle = 0;
        bufR = r;


        for (var i = 0; i < m / 2; i++) {

            if (i >= m / 4) {
                var z = Math.sin(Math.PI / 180 * angle) * -r;
            } else {
                var z = Math.sin(Math.PI / 180 * angle) * -r;
            }
            console.log(z);
            angle += addAng;

            var arr1 = getMaxY(m, z, bufR);
            if (i >= m / 4) {
                z = Math.sin(Math.PI / 180 * angle) * -r
            } else {
                z = -Math.sin(Math.PI / 180 * angle) * -r;
            }
            bufR = Math.sqrt(r * r - r * Math.sin(Math.PI / 180 * angle) * r * Math.sin(Math.PI / 180 * angle));
            var arr2 = getMaxY(m, z, bufR);

            for (var q = 0; q < arr1.length; q += 3) {
                if (q == 0) {
                    arr.push(arr1[q], arr1[q + 1], arr1[q + 2]);
                    arr.push(arr2[q], arr2[q + 1], arr2[q + 2]);
                    arr.push(arr1[arr1.length - 3], arr1[arr1.length - 2], arr1[arr1.length - 1]);
                    arr.push(arr1[q], arr1[q + 1], arr1[q + 2]);
                    arr.push(arr2[q], arr2[q + 1], arr2[q + 2]);
                    arr.push(arr2[q + 3], arr2[q + 4], arr2[q + 5]);
                } else if (q == arr1.length - 3) {
                    arr.push(arr1[q], arr1[q + 1], arr1[q + 2]);
                    arr.push(arr2[q], arr2[q + 1], arr2[q + 2]);
                    arr.push(arr1[q - 3], arr1[q - 2], arr1[q - 1]);
                    arr.push(arr1[q], arr1[q + 1], arr1[q + 2]);
                    arr.push(arr2[q], arr2[q + 1], arr2[q + 2]);
                    arr.push(arr2[0], arr2[1], arr2[2]);
                } else {
                    arr.push(arr1[q], arr1[q + 1], arr1[q + 2]);
                    arr.push(arr2[q], arr2[q + 1], arr2[q + 2]);
                    arr.push(arr1[q - 3], arr1[q - 2], arr1[q - 1]);
                    arr.push(arr1[q], arr1[q + 1], arr1[q + 2]);
                    arr.push(arr2[q], arr2[q + 1], arr2[q + 2]);
                    arr.push(arr2[q + 3], arr2[q + 4], arr2[q + 5]);
                }

            }
        }
        return arr;
    }
    protected onInit() {


        var data = this.drawQiu02(1, 18);
        console.log("gagag-----",data);
        this.createVertexsBuffer(data,3);
        this.setShader(vertextBaseCode, fragBaseCode);
        this._glPrimitiveType = this.gl.LINE_STRIP;
        console.log("this._glPrimitiveType------",this._glPrimitiveType);
    }

    public readyDraw(time){
        // this.rotate(0.5,0.5,0.5);
        super.readyDraw(time);
    }

    
    //启动顶点着色器
    protected startVertexShader(): void {
        var indexglID = this.getGLID(SY.GLID_TYPE.INDEX);
        if (indexglID != -1) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexglID);
            this.gl.drawElements(this._glPrimitiveType, this.getBuffer(SY.GLID_TYPE.INDEX).itemNums, this.gl.UNSIGNED_SHORT, 0);
        }
        else {
            var points = this.getBuffer(SY.GLID_TYPE.VERTEX);
            this.gl.drawArrays(this._glPrimitiveType, 0, points.itemNums);
        }

    }
}