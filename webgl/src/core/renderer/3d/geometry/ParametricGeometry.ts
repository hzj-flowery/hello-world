import { Vector3 } from "../../../math/Vector3";
import { Geometry } from "./Geometry";

export class ParametricGeometry extends Geometry {

    public slices: number;
    public stacks: number;
    public func: any;
    constructor(func, slices: number, stacks: number) {

        super();

        this.func = func;
        this.slices = slices;
        this.stacks = stacks;

        // buffers

        const EPS = 0.00001;

        const normal = new Vector3();

        const p0 = new Vector3(), p1 = new Vector3();
        const pu = new Vector3(), pv = new Vector3();

        if (func.length < 3) {

            console.error('THREE.ParametricGeometry: Function must now modify a Vector3 as third parameter.');

        }

        // generate vertices, normals and uvs

        const sliceCount = slices + 1;

        for (let i = 0; i <= stacks; i++) {

            const v = i / stacks;

            for (let j = 0; j <= slices; j++) {

                const u = j / slices;

                // vertex

                func(u, v, p0);
                this.vertices.push(p0.x, p0.y, p0.z);

                // normal

                // approximate tangent vectors via finite differences

                if (u - EPS >= 0) {

                    func(u - EPS, v, p1);
                    pu.subVectors(p0, p1);

                } else {

                    func(u + EPS, v, p1);
                    pu.subVectors(p1, p0);

                }

                if (v - EPS >= 0) {

                    func(u, v - EPS, p1);
                    pv.subVectors(p0, p1);

                } else {

                    func(u, v + EPS, p1);
                    pv.subVectors(p1, p0);

                }

                // cross product of tangent vectors returns surface normal

                normal.crossVectors(pu, pv).normalize();
                this.normals.push(normal.x, normal.y, normal.z);

                // uv

                this.uvs.push(u, v);

            }

        }

        // generate indices

        for (let i = 0; i < stacks; i++) {

            for (let j = 0; j < slices; j++) {

                const a = i * sliceCount + j;
                const b = i * sliceCount + j + 1;
                const c = (i + 1) * sliceCount + j + 1;
                const d = (i + 1) * sliceCount + j;

                // faces one and two

                this.indices.push(a, b, d);
                this.indices.push(b, c, d);

            }

        }

        // build geometry

        super.build();

    }

}