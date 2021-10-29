import { Path } from "../../../math/core/Path";
import { Vector2 } from "../../../math/Vector2";
import { Vector3 } from "../../../math/Vector3";
import { Geometry } from "./Geometry";

export class TubeGeometry extends Geometry {
    
    public closed:boolean;
    public radialSegments:number;
    public radius:number;
    public tubularSegments:number;
    public path:Path;
	constructor(path:Path, tubularSegments:number = 64, radius:number = 1, radialSegments:number = 8, closed:boolean = false ) {

		super();

        this.path = path;
        this.tubularSegments = tubularSegments;
        this.radius = radius;
        this.radialSegments = radialSegments;
        this.closed = closed;

		const frames = path.computeFrenetFrames( tubularSegments, closed );

		// expose internals

		this.tangents = frames.tangents;
        for(let k = 0;k<frames.normals.length;k++)
		{
            this.normals.push(frames.normals[k].x);
            this.normals.push(frames.normals[k].y);
            this.normals.push(frames.normals[k].z);
        }
		this.binormals = frames.binormals;

		// helper variables

		const vertex = new Vector3();
		const normal = new Vector3();
		const uv = new Vector2();
		let P = new Vector3();


		// create buffer data

		generateBufferData();

		// build geometry

		super.build();

		// functions

		function generateBufferData() {

			for ( let i = 0; i < tubularSegments; i ++ ) {

				generateSegment( i );

			}

			// if the geometry is not closed, generate the last row of vertices and normals
			// at the regular position on the given path
			//
			// if the geometry is closed, duplicate the first row of vertices and normals (uvs will differ)

			generateSegment( ( closed === false ) ? tubularSegments : 0 );

			// uvs are generated in a separate function.
			// this makes it easy compute correct values for closed geometries

			generateUVs();

			// finally create faces

			generateIndices();

		}

		function generateSegment( i ) {

			// we use getPointAt to sample evenly distributed points from the given path

			P = path.getPointAt( i / tubularSegments, P );

			// retrieve corresponding normal and binormal

			const N = frames.normals[ i ];
			const B = frames.binormals[ i ];

			// generate normals and vertices for the current segment

			for ( let j = 0; j <= radialSegments; j ++ ) {

				const v = j / radialSegments * Math.PI * 2;

				const sin = Math.sin( v );
				const cos = - Math.cos( v );

				// normal

				normal.x = ( cos * N.x + sin * B.x );
				normal.y = ( cos * N.y + sin * B.y );
				normal.z = ( cos * N.z + sin * B.z );
				normal.normalize();

				this.normals.push( normal.x, normal.y, normal.z );

				// vertex

				vertex.x = P.x + radius * normal.x;
				vertex.y = P.y + radius * normal.y;
				vertex.z = P.z + radius * normal.z;

				this.vertices.push( vertex.x, vertex.y, vertex.z );

			}

		}

		function generateIndices() {

			for ( let j = 1; j <= tubularSegments; j ++ ) {

				for ( let i = 1; i <= radialSegments; i ++ ) {

					const a = ( radialSegments + 1 ) * ( j - 1 ) + ( i - 1 );
					const b = ( radialSegments + 1 ) * j + ( i - 1 );
					const c = ( radialSegments + 1 ) * j + i;
					const d = ( radialSegments + 1 ) * ( j - 1 ) + i;

					// faces

					this.indices.push( a, b, d );
					this.indices.push( b, c, d );

				}

			}

		}

		function generateUVs() {

			for ( let i = 0; i <= tubularSegments; i ++ ) {

				for ( let j = 0; j <= radialSegments; j ++ ) {

					uv.x = i / tubularSegments;
					uv.y = j / radialSegments;

					this.uvs.push( uv.x, uv.y );

				}

			}

		}

	}

	toJSON() {

		// const data = super.toJSON();

		// data.path = this.parameters.path.toJSON();

		// return data;

	}

	static fromJSON( data ) {

		// // This only works for built-in curves (e.g. CatmullRomCurve3).
		// // User defined curves or instances of CurvePath will not be deserialized.
		// return new TubeGeometry(
		// 	new Curves[ data.path.type ]().fromJSON( data.path ),
		// 	data.tubularSegments,
		// 	data.radius,
		// 	data.radialSegments,
		// 	data.closed
		// );

	}

}