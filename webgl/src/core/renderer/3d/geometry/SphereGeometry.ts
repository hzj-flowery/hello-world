import { Vector3 } from "../../../math/Vector3";
import { G_BufferManager } from "../../base/buffer/BufferManager";
import { SY } from "../../base/Sprite";
import { Geometry } from "./Geometry";

export class SphereGeometry extends Geometry {

    private radius: number;
    private widthSegments: number;
    private heightSegments: number;
    private phiStart: number;
    private phiLength: number;
    private thetaStart: number;
    private thetaLength: number;

    constructor(radius = 1, widthSegments = 32, heightSegments = 16, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) {

        super();

        this.radius = radius;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
        this.phiStart = phiStart;
        this.phiLength = phiLength;
        this.thetaStart = thetaStart;
        this.thetaLength = thetaLength;

        widthSegments = Math.max(3, Math.floor(widthSegments));
        heightSegments = Math.max(2, Math.floor(heightSegments));

        const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);

        let index = 0;
        const grid = [];

        const vertex = new Vector3();
        const normal = new Vector3();

        // generate vertices, normals and uvs

        for (let iy = 0; iy <= heightSegments; iy++) {

            const verticesRow = [];

            const v = iy / heightSegments;

            // special case for the poles

            let uOffset = 0;

            if (iy == 0 && thetaStart == 0) {

                uOffset = 0.5 / widthSegments;

            } else if (iy == heightSegments && thetaEnd == Math.PI) {

                uOffset = - 0.5 / widthSegments;

            }

            for (let ix = 0; ix <= widthSegments; ix++) {

                const u = ix / widthSegments;

                // vertex

                vertex.x = - radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
                vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
                vertex.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

                this.vertices.push(vertex.x, vertex.y, vertex.z);

                // normal

                normal.copy(vertex).normalize();
                this.normals.push(normal.x, normal.y, normal.z);

                // uv

                this.uvs.push(u + uOffset, 1 - v);

                verticesRow.push(index++);

            }

            grid.push(verticesRow);

        }

        // indices

        for (let iy = 0; iy < heightSegments; iy++) {

            for (let ix = 0; ix < widthSegments; ix++) {

                const a = grid[iy][ix + 1];
                const b = grid[iy][ix];
                const c = grid[iy + 1][ix];
                const d = grid[iy + 1][ix + 1];

                if (iy !== 0 || thetaStart > 0) this.indices.push(a, b, d);
                if (iy !== heightSegments - 1 || thetaEnd < Math.PI) this.indices.push(b, c, d);

            }

        }

        // build geometry
        super.build();

    }

    static fromJSON(data) {

        return new SphereGeometry(data.radius, data.widthSegments, data.heightSegments, data.phiStart, data.phiLength, data.thetaStart, data.thetaLength);

    }
}