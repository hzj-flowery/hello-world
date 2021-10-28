import { Vector2 } from "../../../math/Vector2";
import { Vector3 } from "../../../math/Vector3";
import { G_BufferManager } from "../../base/buffer/BufferManager";
import { SY } from "../../base/Sprite";
import { Geometry } from "./Geometry";

export class CircleGeometry extends Geometry {

    private radius: number;
    private segments: number;
    private thetaStart: number;
    private thetaLength: number;

    constructor(radius = 1, segments = 8, thetaStart = 0, thetaLength = Math.PI * 2) {

        super();

        this.radius = radius;
        this.segments = segments;
        this.thetaStart = thetaStart;
        this.thetaLength = thetaLength;

        segments = Math.max(3, segments);


        // helper variables

        const vertex = new Vector3();
        const uv = new Vector2();

        // center point

        this.vertices.push(0, 0, 0);
        this.normals.push(0, 0, 1);
        this.uvs.push(0.5, 0.5);

        for (let s = 0, i = 3; s <= segments; s++, i += 3) {

            const segment = thetaStart + s / segments * thetaLength;

            // vertex

            vertex.x = radius * Math.cos(segment);
            vertex.y = radius * Math.sin(segment);

            this.vertices.push(vertex.x, vertex.y, vertex.z);

            // normal

            this.normals.push(0, 0, 1);

            // uvs

            uv.x = (this.vertices[i] / radius + 1) / 2;
            uv.y = (this.vertices[i + 1] / radius + 1) / 2;

            this.uvs.push(uv.x, uv.y);

        }

        // indices

        for (let i = 1; i <= segments; i++) {

            this.indices.push(i, i + 1, 0);

        }

        // build geometry
        super.build()

    }

    static fromJSON(data) {

        return new CircleGeometry(data.radius, data.segments, data.thetaStart, data.thetaLength);

    }
}