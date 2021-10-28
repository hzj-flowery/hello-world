import { Shape } from "../../../math/core/Shape";
import { ShapeUtils } from "../../../math/extra/ShapeUtils";
import { Vector2 } from "../../../math/Vector2";
import { Geometry } from "./Geometry";

export class ShapeGeometry extends Geometry{
    public shapes:Shape|Array<Shape>;
    public curveSegments:number;
    public groupStart = 0;
	public groupCount = 0;
    constructor( shapes:Shape|Array<Shape> = new Shape( [ new Vector2( 0, 0.5 ), new Vector2( - 0.5, - 0.5 ), new Vector2( 0.5, - 0.5 ) ] ), curveSegments = 12 ) {

		super();

		this.shapes = shapes;
		this.curveSegments = curveSegments;

		// helper variables

		this.groupStart = 0;
		this.groupCount = 0;

		// allow single and array values for "shapes" parameter 

		if ( Array.isArray( shapes ) === false ) {

			this.addShape( shapes );

		} else {

			for ( let i = 0; i < (shapes as Array<Shape>) .length; i ++ ) {

				this.addShape( shapes[ i ] );

				this.addGroup(this.groupStart,this.groupCount, i ); // enables MultiMaterial support

				this.groupStart += this.groupCount;
				this.groupCount = 0;

			}

		}

		// build geometry

		super.build()
    }


		// helper functions

		public addShape( shape ) {

			const indexOffset = this.vertices.length / 3;
			const points = shape.extractPoints(this.curveSegments );

			let shapeVertices = points.shape;
			const shapeHoles = points.holes;

			// check direction of vertices

			if ( ShapeUtils.isClockWise( shapeVertices ) === false ) {

				shapeVertices = shapeVertices.reverse();

			}

			for ( let i = 0, l = shapeHoles.length; i < l; i ++ ) {

				const shapeHole = shapeHoles[ i ];

				if ( ShapeUtils.isClockWise( shapeHole ) === true ) {

					shapeHoles[ i ] = shapeHole.reverse();

				}

			}

			const faces = ShapeUtils.triangulateShape( shapeVertices, shapeHoles );

			// join vertices of inner and outer paths to a single array

			for ( let i = 0, l = shapeHoles.length; i < l; i ++ ) {

				const shapeHole = shapeHoles[ i ];
				shapeVertices = shapeVertices.concat( shapeHole );

			}

			// vertices, normals, uvs

			for ( let i = 0, l = shapeVertices.length; i < l; i ++ ) {

				const vertex = shapeVertices[ i ];

				this.vertices.push( vertex.x, vertex.y, 0 );
				this.normals.push( 0, 0, 1 );
				this.uvs.push( vertex.x, vertex.y ); // world uvs

			}

			// incides

			for ( let i = 0, l = faces.length; i < l; i ++ ) {

				const face = faces[ i ];

				const a = face[ 0 ] + indexOffset;
				const b = face[ 1 ] + indexOffset;
				const c = face[ 2 ] + indexOffset;

				this.indices.push( a, b, c );
				this.groupCount += 3;

			}

		}

	public toJSON() {

		// const data = super.toJSON();

		// const shapes = this.parameters.shapes;

		// return toJSON( shapes, data );

	}

	static fromJSON( data, shapes ) {

		const geometryShapes = [];

		for ( let j = 0, jl = data.shapes.length; j < jl; j ++ ) {

			const shape = shapes[ data.shapes[ j ] ];

			geometryShapes.push( shape );

		}

		return new ShapeGeometry( geometryShapes, data.curveSegments );

	}

}

function toJSON( shapes, data ) {

	data.shapes = [];

	if ( Array.isArray( shapes ) ) {

		for ( let i = 0, l = shapes.length; i < l; i ++ ) {

			const shape = shapes[ i ];

			data.shapes.push( shape.uuid );

		}

	} else {

		data.shapes.push( shapes.uuid );

	}

	return data;

}