import { Vector2 } from "../../../math/Vector2";
import { Vector3 } from "../../../math/Vector3";
import { G_BufferManager } from "../../base/buffer/BufferManager";
import { SY } from "../../base/Sprite";
import { Geometry } from "./Geometry";

export class CylinderGeometry extends Geometry {
   
    private index: number;
    private indexArray: Array<Array<number>>;
    private halfHeight: number;

    public radiusTop: number;
    public radiusBottom: number;
    public height: number;
    public radialSegments: number;
    public heightSegments: number;
    public openEnded: boolean;
    public thetaStart: number;
    public thetaLength: number;

    private groupStart: number;

    constructor(radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 8, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2) {
        super()

        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.height = height;
        this.radialSegments = radialSegments;
        this.heightSegments = heightSegments;
        this.openEnded = openEnded;
        this.thetaStart = thetaStart;
        this.thetaLength = thetaLength;
        this.build()
    }

    protected build(): void {
        this.radialSegments = Math.floor(this.radialSegments);
        this.heightSegments = Math.floor(this.heightSegments);

        // helper variables
        this.index = 0;
        this.indexArray = [];
        this.halfHeight = this.height / 2;
        this.groupStart = 0;

        // generate geometry

        this.generateTorso();

        if (this.openEnded === false) {

            if (this.radiusTop > 0) this.generateCap(true);
            if (this.radiusBottom > 0) this.generateCap(false);

        }

        // build geometry
       super.build();
    }

    private generateTorso() {

        const normal = new Vector3();
        const vertex = new Vector3();

        let groupCount = 0;

        // this will be used to calculate the normal
        const slope = (this.radiusBottom - this.radiusTop) / this.height;

        // generate vertices, normals and uvs

        for (let y = 0; y <= this.heightSegments; y++) {

            const indexRow = [];

            const v = y / this.heightSegments;

            // calculate the radius of the current row

            const radius = v * (this.radiusBottom - this.radiusTop) + this.radiusTop;

            for (let x = 0; x <= this.radialSegments; x++) {

                const u = x / this.radialSegments;

                const theta = u * this.thetaLength + this.thetaStart;

                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);

                // vertex

                vertex.x = radius * sinTheta;
                vertex.y = - v * this.height + this.halfHeight;
                vertex.z = radius * cosTheta;
                this.vertices.push(vertex.x, vertex.y, vertex.z);

                // normal

                normal.set(sinTheta, slope, cosTheta).normalize();
                this.normals.push(normal.x, normal.y, normal.z);

                // uv

                this.uvs.push(u, 1 - v);

                // save index of vertex in respective row

                indexRow.push(this.index++);

            }

            // now save vertices of the row in our index array

            this.indexArray.push(indexRow);

        }

        // generate indices

        for (let x = 0; x < this.radialSegments; x++) {

            for (let y = 0; y < this.heightSegments; y++) {

                // we use the index array to access the correct indices

                const a = this.indexArray[y][x];
                const b = this.indexArray[y + 1][x];
                const c = this.indexArray[y + 1][x + 1];
                const d = this.indexArray[y][x + 1];

                // faces

                this.indices.push(a, b, d);
                this.indices.push(b, c, d);

                // update group counter

                groupCount += 6;

            }

        }

        // add a group to the geometry. this will ensure multi material support

        // scope.addGroup( groupStart, groupCount, 0 );

        // calculate new start value for groups

        this.groupStart += groupCount;

    }

    private generateCap(top) {

        // save the index of the first center vertex
        const centerIndexStart = this.index;

        const uv = new Vector2();
        const vertex = new Vector3();

        let groupCount = 0;

        const radius = (top === true) ? this.radiusTop : this.radiusBottom;
        const sign = (top === true) ? 1 : - 1;

        // first we generate the center vertex data of the cap.
        // because the geometry needs one set of uvs per face,
        // we must generate a center vertex per face/segment

        for (let x = 1; x <= this.radialSegments; x++) {

            // vertex

            this.vertices.push(0, this.halfHeight * sign, 0);

            // normal

            this.normals.push(0, sign, 0);

            // uv

            this.uvs.push(0.5, 0.5);

            // increase index

            this.index++;

        }

        // save the index of the last center vertex
        const centerIndexEnd = this.index;

        // now we generate the surrounding vertices, normals and uvs

        for (let x = 0; x <= this.radialSegments; x++) {

            const u = x / this.radialSegments;
            const theta = u * this.thetaLength + this.thetaStart;

            const cosTheta = Math.cos(theta);
            const sinTheta = Math.sin(theta);

            // vertex

            vertex.x = radius * sinTheta;
            vertex.y = this.halfHeight * sign;
            vertex.z = radius * cosTheta;
            this.vertices.push(vertex.x, vertex.y, vertex.z);

            // normal

            this.normals.push(0, sign, 0);

            // uv

            uv.x = (cosTheta * 0.5) + 0.5;
            uv.y = (sinTheta * 0.5 * sign) + 0.5;
            this.uvs.push(uv.x, uv.y);

            // increase index

            this.index++;

        }

        // generate indices

        for (let x = 0; x < this.radialSegments; x++) {

            const c = centerIndexStart + x;
            const i = centerIndexEnd + x;

            if (top === true) {

                // face top

                this.indices.push(i, i + 1, c);

            } else {

                // face bottom

                this.indices.push(i + 1, i, c);

            }

            groupCount += 3;

        }

        // add a group to the geometry. this will ensure multi material support

        // scope.addGroup( groupStart, groupCount, top === true ? 1 : 2 );

        // calculate new start value for groups

        this.groupStart += groupCount;

    }

    static fromJSON(data) {

        return new CylinderGeometry(data.radiusTop, data.radiusBottom, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength);

    }

}