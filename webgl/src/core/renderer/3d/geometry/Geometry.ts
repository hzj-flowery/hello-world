import { Box3 } from "../../../math/Box3";
import { Matrix3 } from "../../../math/Matrix3";
import { Matrix4 } from "../../../math/Matrix4";
import { Sphere } from "../../../math/Sphere";
import { Vector2 } from "../../../math/Vector2";
import { Vector3 } from "../../../math/Vector3";
import { BufferAttribute, G_BufferManager } from "../../base/buffer/BufferManager";
import { SY } from "../../base/Sprite";
import { syGL } from "../../gfx/syGLEnums";
import { Object3D } from "../Object3D";
const _m1 = /*@__PURE__*/ new Matrix4();
const _offset = /*@__PURE__*/ new Vector3();
const _box = /*@__PURE__*/ new Box3();
const _boxMorphTargets = /*@__PURE__*/ new Box3();
const _vector = /*@__PURE__*/ new Vector3();
interface Groups {
	start: number;
	count: number;
	materialIndex: number;
}
interface Attribute {
	indices: BufferAttribute;
	vertices: BufferAttribute;
	normals: BufferAttribute;
	tangents: BufferAttribute;
	binormals: BufferAttribute;
	uvs: BufferAttribute;
}
interface MorphAttribute {
	positions: Array<BufferAttribute>;
	morphTargetInfluences: Array<number>;
}
export class Geometry extends SY.SpriteBase {
	protected indices: Array<number>;
	protected vertices: Array<number>;
	protected normals: Array<number>;
	protected tangents: Array<number>;
	protected binormals: Array<number>;
	protected uvs: Array<number>;
	public groups: Array<Groups>;
	public attributes: Attribute;//属性
	protected boundingSphere: Sphere;
	protected boundingBox: Box3;
	protected morphAttributes: MorphAttribute;//曲线属性
	protected morphTargetsRelative: boolean;
	constructor() {
		super();
		// buffers
		this.indices = [];
		this.vertices = [];
		this.normals = [];
		this.uvs = [];
		this.tangents = [];
		this.binormals = [];
		this.groups = [];
		this.attributes = { indices: null, vertices: null, normals: null, tangents: null, binormals: null, uvs: null };
		this.morphAttributes = { positions: [], morphTargetInfluences: [] };
		this.morphTargetsRelative = false;
	}
	protected build(): void {
		if (this.vertices.length > 0)
			this.attributes.vertices = G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX, this.attributeId, this.vertices, 3)
		if (this.uvs.length > 0)
			this.attributes.uvs = G_BufferManager.createBuffer(SY.GLID_TYPE.UV, this.attributeId, this.uvs, 2);
		if (this.normals.length > 0)
			this.attributes.normals = G_BufferManager.createBuffer(SY.GLID_TYPE.NORMAL, this.attributeId, this.normals, 3)
		if (this.indices.length > 0)
			this.attributes.indices = G_BufferManager.createBuffer(SY.GLID_TYPE.INDEX, this.attributeId, this.indices, 1);
		if (this.tangents.length > 0)
			this.attributes.tangents = G_BufferManager.createBuffer(SY.GLID_TYPE.TANGENT, this.attributeId, this.tangents, 4)
	}

	protected onUpdate(): void {
		// this.trigerMorph();
		super.onUpdate()
	}
    
	/**
	 * 触发变形
	 */
	public trigerMorph():void{
		var len = this.morphAttributes.positions.length;
		var len1 = this.morphAttributes.morphTargetInfluences.length;

		if (len > 0 && len1 > 0 && len == len1) {
			const positions = this.attributes.vertices.sourceData;
			var isNeedUpdate = false;
			var renderMorphPosition = []
			for (let i = 0, l = positions.length; i < l; i += 3) {
				let x = positions[i];
				let y = positions[i + 1];
				let z = positions[i + 2];
				for (let t = 0; t < len; t++) {
					var influence = this.morphAttributes.morphTargetInfluences[t];
					if (influence === 0) continue;
					isNeedUpdate = true;
					const target = this.morphAttributes.positions[t];

					if (this.morphTargetsRelative) {
						x += target.getX(i / 3) * influence;
						y += target.getY(i / 3) * influence;
						z += target.getZ(i / 3) * influence;
					} else {
						x += (target.getX(i / 3) - positions[i]) * influence;
						y += (target.getY(i / 3) - positions[i + 1]) * influence;
						z += (target.getZ(i / 3) - positions[i + 2]) * influence;
					}

				}
				renderMorphPosition.push(x,y,z);
			}
			this.attributes.vertices.needsMorphUpdate = true;
			this.attributes.vertices.updateMorph(renderMorphPosition)
		}
	}

	public addGeometry() {

		// create an empty array to  hold targets for the attribute we want to morph
		// morphing positions and normals is supported
		this.morphAttributes.positions = [];

		// the original positions of the cube's vertices
		const positionAttribute = this.attributes.vertices;

		// for the first morph target we'll move the cube's vertices onto the surface of a sphere
		const spherePositions = [];

		// for the second morph target, we'll twist the cubes vertices
		const twistPositions = [];
		const direction = new Vector3(1, 0, 0);
		const vertex = new Vector3();

		for (let i = 0; i < positionAttribute.count; i++) {
			const x = positionAttribute.getX(i);
			const y = positionAttribute.getY(i);
			const z = positionAttribute.getZ(i);
			spherePositions.push(
				x * Math.sqrt(1 - (y * y / 2) - (z * z / 2) + (y * y * z * z / 3)),
				y * Math.sqrt(1 - (z * z / 2) - (x * x / 2) + (z * z * x * x / 3)),
				z * Math.sqrt(1 - (x * x / 2) - (y * y / 2) + (x * x * y * y / 3))
			);
			// stretch along the x-axis so we can see the twist better
			vertex.set(x * 2, y, z);
			vertex.applyAxisAngle(direction, Math.PI * x / 2).toArray(twistPositions, twistPositions.length);
		}

		// add the spherical positions as the first morph target
		this.morphAttributes.positions[0] = G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX, (this.attributeId + "spherePositions"), spherePositions, 3);
		this.morphAttributes.morphTargetInfluences[0] = 0;
		// add the twisted positions as the second morph target
		this.morphAttributes.positions[1] = G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX, (this.attributeId + "twistPositions"), twistPositions, 3);
		this.morphAttributes.morphTargetInfluences[1] = 0;
	}

	public setMorphTargetInfluences(index: number, value: number): void {
		this.morphAttributes.morphTargetInfluences[index] = value;
	}

	/**
	 * 
	 * @param name 
	 * @returns 
	 */
	public getAttribute(name: string): BufferAttribute {
		switch (name) {
			case "position": return G_BufferManager.getBuffer(SY.GLID_TYPE.VERTEX, this.attributeId);
			case "uv": return G_BufferManager.getBuffer(SY.GLID_TYPE.UV, this.attributeId);
			case "normal": return G_BufferManager.getBuffer(SY.GLID_TYPE.NORMAL, this.attributeId);
			case "index": return G_BufferManager.getBuffer(SY.GLID_TYPE.INDEX, this.attributeId);
		}
		console.error("无法获取属性------", name)
		return null;
	}
	/**
	 * 计算包围盒
	 * @returns 
	 */
	computeBoundingBox() {
		if (this.boundingBox === null) {
			this.boundingBox = new Box3();
		}
		const position = G_BufferManager.getBuffer(SY.GLID_TYPE.VERTEX, this.attributeId);
		const morphAttributesPosition = this.morphAttributes.positions;
		if (position && position.isGLBufferAttribute) {
			console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".', this);
			this.boundingBox.set(
				new Vector3(- Infinity, - Infinity, - Infinity),
				new Vector3(+ Infinity, + Infinity, + Infinity)
			);
			return;
		}
		if (position !== null) {
			this.boundingBox.setFromBufferAttribute(position);
			// process morph attributes if present
			if (morphAttributesPosition) {
				for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
					const morphAttribute = morphAttributesPosition[i];
					_box.setFromBufferAttribute(morphAttribute);
					if (this.morphTargetsRelative) {
						_vector.addVectors(this.boundingBox.min, _box.min);
						this.boundingBox.expandByPoint(_vector);
						_vector.addVectors(this.boundingBox.max, _box.max);
						this.boundingBox.expandByPoint(_vector);
					} else {
						this.boundingBox.expandByPoint(_box.min);
						this.boundingBox.expandByPoint(_box.max);
					}
				}
			}
		} else {
			this.boundingBox.makeEmpty();
		}
		if (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) {
			console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
		}
	}
	computeBoundingSphere() {
		if (!this.boundingSphere) {
			this.boundingSphere = new Sphere();
		}
		const position = G_BufferManager.getBuffer(SY.GLID_TYPE.VERTEX, this.attributeId);
		const morphAttributesPosition = this.morphAttributes.positions;
		if (position && position.isGLBufferAttribute) {
			console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".', this);
			this.boundingSphere.set(new Vector3(), Infinity);
			return;
		}
		if (position) {
			// first, find the center of the bounding sphere
			const center = this.boundingSphere.center;
			_box.setFromBufferAttribute(position);
			// process morph attributes if present
			if (morphAttributesPosition) {
				for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
					const morphAttribute = morphAttributesPosition[i];
					_boxMorphTargets.setFromBufferAttribute(morphAttribute);
					if (this.morphTargetsRelative) {
						_vector.addVectors(_box.min, _boxMorphTargets.min);
						_box.expandByPoint(_vector);
						_vector.addVectors(_box.max, _boxMorphTargets.max);
						_box.expandByPoint(_vector);
					} else {
						_box.expandByPoint(_boxMorphTargets.min);
						_box.expandByPoint(_boxMorphTargets.max);
					}
				}
			}
			_box.getCenter(center);
			// second, try to find a boundingSphere with a radius smaller than the
			// boundingSphere of the boundingBox: sqrt(3) smaller in the best case
			let maxRadiusSq = 0;
			for (let i = 0, il = position.count; i < il; i++) {
				_vector.fromBufferAttribute(position, i);
				maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector));
			}
			// process morph attributes if present
			if (morphAttributesPosition) {
				for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
					const morphAttribute = morphAttributesPosition[i];
					const morphTargetsRelative = this.morphTargetsRelative;
					for (let j = 0, jl = morphAttribute.count; j < jl; j++) {
						_vector.fromBufferAttribute(morphAttribute, j);
						if (morphTargetsRelative) {
							_offset.fromBufferAttribute(position, j);
							_vector.add(_offset);
						}
						maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector));
					}
				}
			}
			this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
			if (isNaN(this.boundingSphere.radius)) {
				console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
			}
		}
	}
	/**
	 * 计算切线
	 * @returns 
	 */
	computeTangents() {
		const index = G_BufferManager.getBuffer(SY.GLID_TYPE.INDEX, this.attributeId);
		const attributes = {
			position: G_BufferManager.getBuffer(SY.GLID_TYPE.VERTEX, this.attributeId),
			normal: G_BufferManager.getBuffer(SY.GLID_TYPE.NORMAL, this.attributeId),
			uv: G_BufferManager.getBuffer(SY.GLID_TYPE.UV, this.attributeId),
			tangent: G_BufferManager.getBuffer(SY.GLID_TYPE.UV, this.attributeId)
		};
		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)
		if (index === null ||
			attributes.position === null ||
			attributes.normal === null ||
			attributes.uv === null) {
			console.error('THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)');
			return;
		}
		const indices = index.sourceData;
		const positions = attributes.position.sourceData;
		const normals = attributes.normal.sourceData;
		const uvs = attributes.uv.sourceData;
		const nVertices = positions.length / 3;
		if (!attributes.tangent) {
			var tempTangents = []
			for (let k = 0; k < nVertices; k++) {
				tempTangents.push(0);
				tempTangents.push(0);
				tempTangents.push(0);
				tempTangents.push(0);
			}
			attributes.tangent = G_BufferManager.createBuffer(SY.GLID_TYPE.TANGENT, this.attributeId, tempTangents, 4)
		}
		const tangents = attributes.tangent.sourceData;
		const tan1 = [], tan2 = [];
		for (let i = 0; i < nVertices; i++) {
			tan1[i] = new Vector3();
			tan2[i] = new Vector3();
		}
		const vA = new Vector3(),
			vB = new Vector3(),
			vC = new Vector3(),
			uvA = new Vector2(),
			uvB = new Vector2(),
			uvC = new Vector2(),
			sdir = new Vector3(),
			tdir = new Vector3();
		function handleTriangle(a, b, c) {
			vA.fromArray(positions, a * 3);
			vB.fromArray(positions, b * 3);
			vC.fromArray(positions, c * 3);
			uvA.fromArray(uvs, a * 2);
			uvB.fromArray(uvs, b * 2);
			uvC.fromArray(uvs, c * 2);
			vB.sub(vA);
			vC.sub(vA);
			uvB.sub(uvA);
			uvC.sub(uvA);
			const r = 1.0 / (uvB.x * uvC.y - uvC.x * uvB.y);
			// silently ignore degenerate uv triangles having coincident or colinear vertices
			if (!isFinite(r)) return;
			sdir.copy(vB).multiplyScalar(uvC.y).addScaledVector(vC, - uvB.y).multiplyScalar(r);
			tdir.copy(vC).multiplyScalar(uvB.x).addScaledVector(vB, - uvC.x).multiplyScalar(r);
			tan1[a].add(sdir);
			tan1[b].add(sdir);
			tan1[c].add(sdir);
			tan2[a].add(tdir);
			tan2[b].add(tdir);
			tan2[c].add(tdir);
		}
		let groups = this.groups;
		if (groups.length === 0) {
			groups.push({
				start: 0,
				count: indices.length,
				materialIndex: 0
			});
		}
		for (let i = 0, il = groups.length; i < il; ++i) {
			const group = groups[i];
			const start = group.start;
			const count = group.count;
			for (let j = start, jl = start + count; j < jl; j += 3) {
				handleTriangle(
					indices[j + 0],
					indices[j + 1],
					indices[j + 2]
				);
			}
		}
		const tmp = new Vector3(), tmp2 = new Vector3();
		const n = new Vector3(), n2 = new Vector3();
		function handleVertex(v) {
			n.fromArray(normals, v * 3);
			n2.copy(n);
			const t = tan1[v];
			// Gram-Schmidt orthogonalize
			tmp.copy(t);
			tmp.sub(n.multiplyScalar(n.dot(t))).normalize();
			// Calculate handedness
			tmp2.crossVectors(n2, t);
			const test = tmp2.dot(tan2[v]);
			const w = (test < 0.0) ? - 1.0 : 1.0;
			tangents[v * 4] = tmp.x;
			tangents[v * 4 + 1] = tmp.y;
			tangents[v * 4 + 2] = tmp.z;
			tangents[v * 4 + 3] = w;
		}
		for (let i = 0, il = groups.length; i < il; ++i) {
			const group = groups[i];
			const start = group.start;
			const count = group.count;
			for (let j = start, jl = start + count; j < jl; j += 3) {
				handleVertex(indices[j + 0]);
				handleVertex(indices[j + 1]);
				handleVertex(indices[j + 2]);
			}
		}
	}
	/**
	 * 计算顶点法线
	 */
	protected computeVertexNormals() {
		const index = G_BufferManager.getBuffer(SY.GLID_TYPE.INDEX, this.attributeId);
		const positionAttribute = G_BufferManager.getBuffer(SY.GLID_TYPE.VERTEX, this.attributeId);
		if (positionAttribute !== null) {
			let normalAttribute = G_BufferManager.getBuffer(SY.GLID_TYPE.NORMAL, this.attributeId);
			if (normalAttribute === null) {
				var tempNormals = []
				for (let k = 0; k < positionAttribute.count; k++) {
					tempNormals.push(0);
					tempNormals.push(0);
					tempNormals.push(0);
				}
				normalAttribute = G_BufferManager.createBuffer(SY.GLID_TYPE.NORMAL, this.attributeId, tempNormals, 3)
			} else {
				// reset existing normals to zero
				//先将法线全部初始化为0
				for (let i = 0, il = normalAttribute.count; i < il; i++) {
					normalAttribute.setXYZ(i, 0, 0, 0);
				}
			}
			const pA = new Vector3(), pB = new Vector3(), pC = new Vector3();
			const nA = new Vector3(), nB = new Vector3(), nC = new Vector3();
			const cb = new Vector3(), ab = new Vector3();
			// indexed elements
			if (index) {
				for (let i = 0, il = index.count; i < il; i += 3) {
					const vA = index.getX(i + 0);
					const vB = index.getX(i + 1);
					const vC = index.getX(i + 2);
					pA.fromBufferAttribute(positionAttribute, vA);
					pB.fromBufferAttribute(positionAttribute, vB);
					pC.fromBufferAttribute(positionAttribute, vC);
					cb.subVectors(pC, pB);
					ab.subVectors(pA, pB);
					cb.cross(ab);
					nA.fromBufferAttribute(normalAttribute, vA);
					nB.fromBufferAttribute(normalAttribute, vB);
					nC.fromBufferAttribute(normalAttribute, vC);
					nA.add(cb);
					nB.add(cb);
					nC.add(cb);
					normalAttribute.setXYZ(vA, nA.x, nA.y, nA.z);
					normalAttribute.setXYZ(vB, nB.x, nB.y, nB.z);
					normalAttribute.setXYZ(vC, nC.x, nC.y, nC.z);
				}
			} else {
				// non-indexed elements (unconnected triangle soup)
				for (let i = 0, il = positionAttribute.count; i < il; i += 3) {
					pA.fromBufferAttribute(positionAttribute, i + 0);
					pB.fromBufferAttribute(positionAttribute, i + 1);
					pC.fromBufferAttribute(positionAttribute, i + 2);
					cb.subVectors(pC, pB);
					ab.subVectors(pA, pB);
					cb.cross(ab);
					normalAttribute.setXYZ(i + 0, cb.x, cb.y, cb.z);
					normalAttribute.setXYZ(i + 1, cb.x, cb.y, cb.z);
					normalAttribute.setXYZ(i + 2, cb.x, cb.y, cb.z);
				}
			}
			this.normalizeNormals();
			normalAttribute.needsUpdate = true;
		}
	}
	/**
	 * 归一化法线
	 */
	protected normalizeNormals() {
		const normals = G_BufferManager.getBuffer(SY.GLID_TYPE.NORMAL, this.attributeId);
		for (let i = 0, il = normals.count; i < il; i++) {
			_vector.fromBufferAttribute(normals, i);
			_vector.normalize();
			normals.setXYZ(i, _vector.x, _vector.y, _vector.z);
		}
	}
	public center() {
		this.computeBoundingBox();
		this.boundingBox.getCenter(_offset).negate();
		this.translate(_offset.x, _offset.y, _offset.z);
		return this;
	}
	translate(x, y, z) {
		// translate geometry
		_m1.makeTranslation(x, y, z);
		this.applyMatrix4(_m1);
		return this;
	}
	applyMatrix4(matrix: Matrix4) {
		const position = this.attributes.vertices;
		if (position !== null) {
			position.applyMatrix4(matrix);
			position.needsUpdate = true;
		}
		const normal = this.attributes.normals;
		if (normal !== null) {
			const normalMatrix = new Matrix3().getNormalMatrix(matrix);
			normal.applyNormalMatrix(normalMatrix);
			normal.needsUpdate = true;
		}
		const tangent = this.attributes.tangents;
		if (tangent !== null) {
			tangent.transformDirection(matrix);
			tangent.needsUpdate = true;
		}
		if (this.boundingBox !== null) {
			this.computeBoundingBox();
		}
		if (this.boundingSphere !== null) {
			this.computeBoundingSphere();
		}
		return this;
	}
	addGroup(start, count, materialIndex = 0) {
		this.groups.push({
			start: start,
			count: count,
			materialIndex: materialIndex
		});
	}
	clearGroups() {
		this.groups = [];
	}
	toNonIndexed() {
		// function convertBufferAttribute( attribute:BufferAttribute, indices ) {
		// 	const array = attribute.sourceData;
		// 	const itemSize = attribute.itemSize;
		// 	const normalized = attribute.normalized;
		// 	const array2 = new array( indices.length * itemSize );
		// 	let index = 0, index2 = 0;
		// 	for ( let i = 0, l = indices.length; i < l; i ++ ) {
		// 		if ( attribute.isInterleavedBufferAttribute ) {
		// 			index = indices[ i ] * attribute.data.stride + attribute.offset;
		// 		} else {
		// 			index = indices[ i ] * itemSize;
		// 		}
		// 		for ( let j = 0; j < itemSize; j ++ ) {
		// 			array2[ index2 ++ ] = array[ index ++ ];
		// 		}
		// 	}
		// 	return new BufferAttribute( array2, itemSize, normalized );
		// }
		// //
		// if ( this.index === null ) {
		// 	console.warn( 'THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.' );
		// 	return this;
		// }
		// const geometry2 = new Geometry();
		// const indices = G_BufferManager.getBuffer(SY.GLID_TYPE.INDEX,this.attributeId);
		// const attributes = this.attributes;
		// // attributes
		// for ( const name in attributes ) {
		// 	const attribute = attributes[ name ];
		// 	const newAttribute = convertBufferAttribute( attribute, indices );
		// 	geometry2.setAttribute( name, newAttribute );
		// }
		// // morph attributes
		// const morphAttributes = this.morphAttributes;
		// for ( const name in morphAttributes ) {
		// 	const morphArray = [];
		// 	const morphAttribute = morphAttributes[ name ]; // morphAttribute: array of Float32BufferAttributes
		// 	for ( let i = 0, il = morphAttribute.length; i < il; i ++ ) {
		// 		const attribute = morphAttribute[ i ];
		// 		const newAttribute = convertBufferAttribute( attribute, indices );
		// 		morphArray.push( newAttribute );
		// 	}
		// 	geometry2.morphAttributes[ name ] = morphArray;
		// }
		// geometry2.morphTargetsRelative = this.morphTargetsRelative;
		// // groups
		// const groups = this.groups;
		// for ( let i = 0, l = groups.length; i < l; i ++ ) {
		// 	const group = groups[ i ];
		// 	geometry2.addGroup( group.start, group.count, group.materialIndex );
		// }
		// return geometry2;
	}
}