import { Vector2 } from "../../../math/Vector2";
import { Vector3 } from "../../../math/Vector3";
import { G_BufferManager } from "../../base/buffer/BufferManager";
import { SY } from "../../base/Sprite";
import { Geometry } from "./Geometry";

export class RingGeometry extends Geometry {

    private innerRadius: number;
    private outerRadius: number;
    private thetaSegments: number;
    private phiSegments: number;
    private thetaStart: number;
    private thetaLength: number;

    constructor(innerRadius = 0.5, outerRadius = 1, thetaSegments = 8, phiSegments = 1, thetaStart = 0, thetaLength = Math.PI * 2) {

        super();
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.thetaSegments = thetaSegments;
        this.phiSegments = phiSegments;
        this.thetaStart = thetaStart;
        this.thetaLength = thetaLength;

        thetaSegments = Math.max(3, thetaSegments);
        phiSegments = Math.max(1, phiSegments);


        // some helper variables

        let radius = innerRadius;
        const radiusStep = ((outerRadius - innerRadius) / phiSegments);
        const vertex = new Vector3();
        const uv = new Vector2();

        // generate vertices, normals and uvs

        for (let j = 0; j <= phiSegments; j++) {

            for (let i = 0; i <= thetaSegments; i++) {

                // values are generate from the inside of the ring to the outside

                const segment = thetaStart + i / thetaSegments * thetaLength;

                // vertex

                vertex.x = radius * Math.cos(segment);
                vertex.y = radius * Math.sin(segment);

                this.vertices.push(vertex.x, vertex.y, vertex.z);

                // normal

                this.normals.push(0, 0, 1);

                // uv

                uv.x = (vertex.x / outerRadius + 1) / 2;
                uv.y = (vertex.y / outerRadius + 1) / 2;

                this.uvs.push(uv.x, uv.y);

            }

            // increase the radius for next row of vertices

            radius += radiusStep;

        }

        // indices

        for (let j = 0; j < phiSegments; j++) {

            const thetaSegmentLevel = j * (thetaSegments + 1);

            for (let i = 0; i < thetaSegments; i++) {

                const segment = i + thetaSegmentLevel;

                const a = segment;
                const b = segment + thetaSegments + 1;
                const c = segment + thetaSegments + 2;
                const d = segment + 1;

                // faces

                this.indices.push(a, b, d);
                this.indices.push(b, c, d);

            }

        }

        // build geometry
       super.build();

    }

    static fromJSON(data) {

        return new RingGeometry(data.innerRadius, data.outerRadius, data.thetaSegments, data.phiSegments, data.thetaStart, data.thetaLength);

    }
}