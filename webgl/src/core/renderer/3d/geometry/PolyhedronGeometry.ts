import { Vector2 } from "../../../math/Vector2";
import { Vector3 } from "../../../math/Vector3";
import { Geometry } from "./Geometry";

export class PolyhedronGeometry extends Geometry {
    private radius: number;
    private detail: number;
    private vertexBuffer:Array<number>;
    private uvBuffer:Array<number>;
    constructor(vertices: Array<number>, indices: Array<number>, radius = 1, detail = 0) {

        super();

        this.vertices = vertices;
        this.indices = indices;
        this.radius = radius;
        this.detail = detail;

        // default buffer data

        this.vertexBuffer = [];
        this.uvBuffer = [];

        // the subdivision creates the vertex buffer data

        this.subdivide(detail);

        // all vertices should lie on a conceptual sphere with a given radius

        this.applyRadius(radius);

        // finally, create the uv data

        this.generateUVs();

        // build non-indexed geometry

       super.build();

        // if (detail === 0) {

        //     this.computeVertexNormals(); // flat normals

        // } else {

        //     this.normalizeNormals(); // smooth normals

        // }
    }

    // helper functions

    private subdivide(detail) {

        const a = new Vector3();
        const b = new Vector3();
        const c = new Vector3();

        // iterate over all faces and apply a subdivison with the given detail value

        for (let i = 0; i < this.indices.length; i += 3) {

            // get the vertices of the face

            this.getVertexByIndex(this.indices[i + 0], a);
            this.getVertexByIndex(this.indices[i + 1], b);
            this.getVertexByIndex(this.indices[i + 2], c);

            // perform subdivision

            this.subdivideFace(a, b, c, detail);

        }

    }

    private subdivideFace(a, b, c, detail) {

        const cols = detail + 1;

        // we use this multidimensional array as a data structure for creating the subdivision

        const v = [];

        // construct all of the vertices for this subdivision

        for (let i = 0; i <= cols; i++) {

            v[i] = [];

            const aj = a.clone().lerp(c, i / cols);
            const bj = b.clone().lerp(c, i / cols);

            const rows = cols - i;

            for (let j = 0; j <= rows; j++) {

                if (j === 0 && i === cols) {

                    v[i][j] = aj;

                } else {

                    v[i][j] = aj.clone().lerp(bj, j / rows);

                }

            }

        }

        // construct all of the faces

        for (let i = 0; i < cols; i++) {

            for (let j = 0; j < 2 * (cols - i) - 1; j++) {

                const k = Math.floor(j / 2);

                if (j % 2 === 0) {

                    this.pushVertex(v[i][k + 1]);
                    this.pushVertex(v[i + 1][k]);
                    this.pushVertex(v[i][k]);

                } else {

                    this.pushVertex(v[i][k + 1]);
                    this.pushVertex(v[i + 1][k + 1]);
                    this.pushVertex(v[i + 1][k]);

                }

            }

        }

    }

    private applyRadius(radius) {

        const vertex = new Vector3();

        // iterate over the entire buffer and apply the radius to each vertex

        for (let i = 0; i < this.vertexBuffer.length; i += 3) {

            vertex.x = this.vertexBuffer[i + 0];
            vertex.y = this.vertexBuffer[i + 1];
            vertex.z = this.vertexBuffer[i + 2];

            vertex.normalize().multiplyScalar(radius);

            this.vertexBuffer[i + 0] = vertex.x;
            this.vertexBuffer[i + 1] = vertex.y;
            this.vertexBuffer[i + 2] = vertex.z;

        }

    }

    private generateUVs() {

        const vertex = new Vector3();

        for (let i = 0; i < this.vertexBuffer.length; i += 3) {

            vertex.x = this.vertexBuffer[i + 0];
            vertex.y = this.vertexBuffer[i + 1];
            vertex.z = this.vertexBuffer[i + 2];

            const u = this.azimuth(vertex) / 2 / Math.PI + 0.5;
            const v = this.inclination(vertex) / Math.PI + 0.5;
            this.uvBuffer.push(u, 1 - v);

        }

        this.correctUVs();

        this.correctSeam();

    }

    private correctSeam() {

        // handle case when face straddles the seam, see #3269

        for (let i = 0; i < this.uvBuffer.length; i += 6) {

            // uv data of a single face

            const x0 = this.uvBuffer[i + 0];
            const x1 = this.uvBuffer[i + 2];
            const x2 = this.uvBuffer[i + 4];

            const max = Math.max(x0, x1, x2);
            const min = Math.min(x0, x1, x2);

            // 0.9 is somewhat arbitrary

            if (max > 0.9 && min < 0.1) {

                if (x0 < 0.2) this.uvBuffer[i + 0] += 1;
                if (x1 < 0.2) this.uvBuffer[i + 2] += 1;
                if (x2 < 0.2) this.uvBuffer[i + 4] += 1;

            }

        }

    }

    private pushVertex(vertex) {

        this.vertexBuffer.push(vertex.x, vertex.y, vertex.z);

    }

    private getVertexByIndex(index, vertex) {

        const stride = index * 3;

        vertex.x = this.vertices[stride + 0];
        vertex.y = this.vertices[stride + 1];
        vertex.z = this.vertices[stride + 2];

    }

    private correctUVs() {

        const a = new Vector3();
        const b = new Vector3();
        const c = new Vector3();

        const centroid = new Vector3();

        const uvA = new Vector2();
        const uvB = new Vector2();
        const uvC = new Vector2();

        for (let i = 0, j = 0; i < this.vertexBuffer.length; i += 9, j += 6) {

            a.set(this.vertexBuffer[i + 0], this.vertexBuffer[i + 1], this.vertexBuffer[i + 2]);
            b.set(this.vertexBuffer[i + 3], this.vertexBuffer[i + 4], this.vertexBuffer[i + 5]);
            c.set(this.vertexBuffer[i + 6], this.vertexBuffer[i + 7], this.vertexBuffer[i + 8]);

            uvA.set(this.uvBuffer[j + 0], this.uvBuffer[j + 1]);
            uvB.set(this.uvBuffer[j + 2], this.uvBuffer[j + 3]);
            uvC.set(this.uvBuffer[j + 4], this.uvBuffer[j + 5]);

            centroid.copy(a).add(b).add(c).divideScalar(3);

            const azi = this.azimuth(centroid);

            this.correctUV(uvA, j + 0, a, azi);
            this.correctUV(uvB, j + 2, b, azi);
            this.correctUV(uvC, j + 4, c, azi);

        }

    }

    private correctUV(uv, stride, vector, azimuth) {

        if ((azimuth < 0) && (uv.x === 1)) {

            this.uvBuffer[stride] = uv.x - 1;

        }

        if ((vector.x === 0) && (vector.z === 0)) {

            this.uvBuffer[stride] = azimuth / 2 / Math.PI + 0.5;

        }

    }

    // Angle around the Y axis, counter-clockwise when looking from above.

    private azimuth(vector) {

        return Math.atan2(vector.z, - vector.x);

    }


    // Angle above the XZ plane.

    private inclination(vector) {

        return Math.atan2(- vector.y, Math.sqrt((vector.x * vector.x) + (vector.z * vector.z)));

    }


    static fromJSON(data) {

        return new PolyhedronGeometry(data.vertices, data.indices, data.radius, data.details);

    }
}