import { Vector3 } from "../../../math/Vector3";
import { Geometry } from "./Geometry";

export class TorusGeometry extends Geometry {
    private radius: number;
    private tube: number;
    private radialSegments: number;
    private tubularSegments: number;
    private arc: number;
    constructor(radius = 1, tube = 0.4, radialSegments = 8, tubularSegments = 6, arc = Math.PI * 2) {

        super();

        this.radius = radius;
        this.tube = tube;
        this.radialSegments = radialSegments;
        this.tubularSegments = tubularSegments;
        this.arc = arc;

        radialSegments = Math.floor(radialSegments);
        tubularSegments = Math.floor(tubularSegments);

        // helper variables

        const center = new Vector3();
        const vertex = new Vector3();
        const normal = new Vector3();

        // generate vertices, normals and uvs

        for (let j = 0; j <= radialSegments; j++) {

            for (let i = 0; i <= tubularSegments; i++) {

                const u = i / tubularSegments * arc;
                const v = j / radialSegments * Math.PI * 2;

                // vertex

                vertex.x = (radius + tube * Math.cos(v)) * Math.cos(u);
                vertex.y = (radius + tube * Math.cos(v)) * Math.sin(u);
                vertex.z = tube * Math.sin(v);

                this.vertices.push(vertex.x, vertex.y, vertex.z);

                // normal

                center.x = radius * Math.cos(u);
                center.y = radius * Math.sin(u);
                normal.subVectors(vertex, center).normalize();

                this.normals.push(normal.x, normal.y, normal.z);

                // uv

                this.uvs.push(i / tubularSegments);
                this.uvs.push(j / radialSegments);

            }

        }

        // generate indices

        for (let j = 1; j <= radialSegments; j++) {

            for (let i = 1; i <= tubularSegments; i++) {

                // indices

                const a = (tubularSegments + 1) * j + i - 1;
                const b = (tubularSegments + 1) * (j - 1) + i - 1;
                const c = (tubularSegments + 1) * (j - 1) + i;
                const d = (tubularSegments + 1) * j + i;

                // faces

                this.indices.push(a, b, d);
                this.indices.push(b, c, d);

            }

        }

        // build geometry
        super.build()

    }

    static fromJSON(data) {

        return new TorusGeometry(data.radius, data.tube, data.radialSegments, data.tubularSegments, data.arc);

    }
}