
import { glMatrix } from "../../math/Matrix";
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import { syGL } from "../gfx/syGLEnums";
import { G_LightCenter } from "../light/LightCenter";
import { syPrimitives } from "../shader/Primitives";

export default class Sphere extends SY.ShadowSprite {
    
    public drawQiu1(SPHERE_DIV:number){
        let position:Array<number> = [];
        let indices:Array<number> = [];
        let uvs:Array<number> = [];
        for (let j = 0; j <= SPHERE_DIV; j++){//SPHERE_DIV为经纬线数
            let aj = j * Math.PI/SPHERE_DIV;
            let sj = Math.sin(aj);
            let cj = Math.cos(aj);
            for(let i = 0; i <= SPHERE_DIV; i++){
                let ai = i * 2 * Math.PI/SPHERE_DIV;
                let si = Math.sin(ai);
                let ci = Math.cos(ai);
                position.push(si * sj);//point为顶点坐标
                position.push(cj);
                position.push(ci * sj);
            }
        }
        for(let j = 0; j < SPHERE_DIV; j++){
            for(let i = 0; i < SPHERE_DIV; i++){
                let p1 = j * (SPHERE_DIV+1) + i;
                let p2 = p1 + (SPHERE_DIV+1);
                indices.push(p1);//indices为顶点的索引
                indices.push(p2);
                indices.push(p1 + 1);
                indices.push(p1 + 1);
                indices.push(p2);
                indices.push(p2 + 1);
            }
        }
        for(let j = 0; j < SPHERE_DIV; j++){
            for(let i = 0; i < SPHERE_DIV; i++){
               uvs.push(0);
               uvs.push(1);
            }
        }
        return {position:position,indices:indices,uvs:uvs}
    }
    private drawQiu2(r, m) {
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
        let vertexData = syPrimitives.createSphereVertices(1, 24, 24);
        this.createIndexsBuffer(vertexData.indices);
        this.createNormalsBuffer(vertexData.normal, 3);
        this.createUVsBuffer(vertexData.texcoord, 2);
        this.createVertexsBuffer(vertexData.position, 3);

        this._glPrimitiveType = syGL.PrimitiveType.TRIANGLE_STRIP;


        this.color = [1, 0.5, 0.5, 1];
    }

}