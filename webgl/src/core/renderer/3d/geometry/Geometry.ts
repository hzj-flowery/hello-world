import { Vector3 } from "../../../math/Vector3";
import { G_BufferManager } from "../../base/buffer/BufferManager";
import { SY } from "../../base/Sprite";

const _vector = /*@__PURE__*/ new Vector3();

export class Geometry extends SY.SpriteBase {
    protected indices: Array<number> = [];
    protected vertices: Array<number> = [];
    protected normals: Array<number> = [];
    protected uvs: Array<number> = [];

    constructor() {
        super();
        // buffers

        this.indices = [];
        this.vertices = [];
        this.normals = [];
        this.uvs = [];
    }

    protected build(): void {
        if (this.vertices.length > 0)
            G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX, this.attributeId, this.vertices, 3)
        if (this.uvs.length > 0)
            G_BufferManager.createBuffer(SY.GLID_TYPE.UV, this.attributeId, this.uvs, 2);
        if (this.normals.length > 0)
            G_BufferManager.createBuffer(SY.GLID_TYPE.NORMAL, this.attributeId, this.normals, 3)
        if (this.indices.length > 0)
            G_BufferManager.createBuffer(SY.GLID_TYPE.INDEX, this.attributeId, this.indices, 1);
    }

    // protected computeVertexNormals() {

	// 	const index = this.index;
	// 	const positionAttribute = this.getAttribute( 'position' );

	// 	if ( positionAttribute !== undefined ) {

	// 		let normalAttribute = this.getAttribute( 'normal' );

	// 		if ( normalAttribute === undefined ) {

	// 			normalAttribute = new BufferAttribute( new Float32Array( positionAttribute.count * 3 ), 3 );
	// 			this.setAttribute( 'normal', normalAttribute );

	// 		} else {

	// 			// reset existing normals to zero

	// 			for ( let i = 0, il = normalAttribute.count; i < il; i ++ ) {

	// 				normalAttribute.setXYZ( i, 0, 0, 0 );

	// 			}

	// 		}

	// 		const pA = new Vector3(), pB = new Vector3(), pC = new Vector3();
	// 		const nA = new Vector3(), nB = new Vector3(), nC = new Vector3();
	// 		const cb = new Vector3(), ab = new Vector3();

	// 		// indexed elements

	// 		if ( index ) {

	// 			for ( let i = 0, il = index.count; i < il; i += 3 ) {

	// 				const vA = index.getX( i + 0 );
	// 				const vB = index.getX( i + 1 );
	// 				const vC = index.getX( i + 2 );

	// 				pA.fromBufferAttribute( positionAttribute, vA );
	// 				pB.fromBufferAttribute( positionAttribute, vB );
	// 				pC.fromBufferAttribute( positionAttribute, vC );

	// 				cb.subVectors( pC, pB );
	// 				ab.subVectors( pA, pB );
	// 				cb.cross( ab );

	// 				nA.fromBufferAttribute( normalAttribute, vA );
	// 				nB.fromBufferAttribute( normalAttribute, vB );
	// 				nC.fromBufferAttribute( normalAttribute, vC );

	// 				nA.add( cb );
	// 				nB.add( cb );
	// 				nC.add( cb );

	// 				normalAttribute.setXYZ( vA, nA.x, nA.y, nA.z );
	// 				normalAttribute.setXYZ( vB, nB.x, nB.y, nB.z );
	// 				normalAttribute.setXYZ( vC, nC.x, nC.y, nC.z );

	// 			}

	// 		} else {

	// 			// non-indexed elements (unconnected triangle soup)

	// 			for ( let i = 0, il = positionAttribute.count; i < il; i += 3 ) {

	// 				pA.fromBufferAttribute( positionAttribute, i + 0 );
	// 				pB.fromBufferAttribute( positionAttribute, i + 1 );
	// 				pC.fromBufferAttribute( positionAttribute, i + 2 );

	// 				cb.subVectors( pC, pB );
	// 				ab.subVectors( pA, pB );
	// 				cb.cross( ab );

	// 				normalAttribute.setXYZ( i + 0, cb.x, cb.y, cb.z );
	// 				normalAttribute.setXYZ( i + 1, cb.x, cb.y, cb.z );
	// 				normalAttribute.setXYZ( i + 2, cb.x, cb.y, cb.z );

	// 			}

	// 		}

	// 		this.normalizeNormals();

	// 		normalAttribute.needsUpdate = true;

	// 	}

	// }

    // protected normalizeNormals() {

	// 	const normals = this.attributes.normal;

	// 	for ( let i = 0, il = normals.count; i < il; i ++ ) {

	// 		_vector.fromBufferAttribute( normals, i );

	// 		_vector.normalize();

	// 		normals.setXYZ( i, _vector.x, _vector.y, _vector.z );

	// 	}

	// }

}