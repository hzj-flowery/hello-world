import { Vector3 } from "../../../math/Vector3";
import { G_BufferManager } from "../../base/buffer/BufferManager";
import { SY } from "../../base/Sprite";
import { Geometry } from "./Geometry";

export class BoxGeometry extends Geometry {
    constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
        super();
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
        this.depthSegments = depthSegments;
        this.build();
    }

    // buffers

    public depth: number;
    public widthSegments: number;
    public heightSegments: number;
    public depthSegments: number;



    private numberOfVertices: number = 0;
    private groupStart: number = 0;
    protected build() {
        this.numberOfVertices = 0;
        this.groupStart = 0;
        // segments
        this.widthSegments = Math.floor(this.widthSegments);
        this.heightSegments = Math.floor(this.heightSegments);
        this.depthSegments = Math.floor(this.depthSegments);

        this.buildPlane('z', 'y', 'x', - 1, - 1, this.depth, this.height, this.width, this.depthSegments, this.heightSegments, 0); // px
        this.buildPlane('z', 'y', 'x', 1, - 1, this.depth, this.height, - this.width, this.depthSegments, this.heightSegments, 1); // nx
        this.buildPlane('x', 'z', 'y', 1, 1, this.width, this.depth, this.height, this.widthSegments, this.depthSegments, 2); // py
        this.buildPlane('x', 'z', 'y', 1, - 1, this.width, this.depth, - this.height, this.widthSegments, this.depthSegments, 3); // ny
        this.buildPlane('x', 'y', 'z', 1, - 1, this.width, this.height, this.depth, this.widthSegments, this.heightSegments, 4); // pz
        this.buildPlane('x', 'y', 'z', - 1, - 1, this.width, this.height, - this.depth, this.widthSegments, this.heightSegments, 5); // nz

        super.build();
    }

    private buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex) {

        const segmentWidth = width / gridX;
        const segmentHeight = height / gridY;

        const widthHalf = width / 2;
        const heightHalf = height / 2;
        const depthHalf = depth / 2;

        const gridX1 = gridX + 1;
        const gridY1 = gridY + 1;

        let vertexCounter = 0;
        let groupCount = 0;

        const vector = new Vector3();

        // generate vertices, normals and uvs

        for (let iy = 0; iy < gridY1; iy++) {

            const y = iy * segmentHeight - heightHalf;

            for (let ix = 0; ix < gridX1; ix++) {

                const x = ix * segmentWidth - widthHalf;

                // set values to correct vector component

                vector[u] = x * udir;
                vector[v] = y * vdir;
                vector[w] = depthHalf;

                // now apply vector to vertex buffer

                this.vertices.push(vector.x, vector.y, vector.z);

                // set values to correct vector component

                vector[u] = 0;
                vector[v] = 0;
                vector[w] = depth > 0 ? 1 : - 1;

                // now apply vector to normal buffer

                this.normals.push(vector.x, vector.y, vector.z);

                // uvs

                this.uvs.push(ix / gridX);
                this.uvs.push(1 - (iy / gridY));

                // counters

                vertexCounter += 1;

            }

        }

        // indices

        // 1. you need three indices to draw a single face
        // 2. a single segment consists of two faces
        // 3. so we need to generate six (2*3) indices per segment

        for (let iy = 0; iy < gridY; iy++) {

            for (let ix = 0; ix < gridX; ix++) {

                const a = this.numberOfVertices + ix + gridX1 * iy;
                const b = this.numberOfVertices + ix + gridX1 * (iy + 1);
                const c = this.numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
                const d = this.numberOfVertices + (ix + 1) + gridX1 * iy;

                // faces

                this.indices.push(a, b, d);
                this.indices.push(b, c, d);

                // increase counter

                groupCount += 6;

            }

        }

        // add a group to the geometry. this will ensure multi material support
        // scope.addGroup( groupStart, groupCount, materialIndex );

        // calculate new start value for groups

        this.groupStart += groupCount;

        // update total number of vertices

        this.numberOfVertices += vertexCounter;

    }

}