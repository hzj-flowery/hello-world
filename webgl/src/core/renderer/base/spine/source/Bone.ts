import { TransformMode } from "./TransformMode"
import { MathUtils } from "./MathUtils"
import { Utils } from "./Utils"
export class Bone{
public children:Array<any>;
public x:number;
public y:number;
public rotation:number;
public scaleX:number;
public scaleY:number;
public shearX:number;
public shearY:number;
public ax:number;
public ay:number;
public arotation:number;
public ascaleX:number;
public ascaleY:number;
public ashearX:number;
public ashearY:number;
public appliedValid:boolean;
public a:number;
public b:number;
public c:number;
public d:number;
public worldY:number;
public worldX:number;
public sorted:boolean;
public active:boolean;
public data:any;
public skeleton:any;
public parent:any;

        constructor(data, skeleton, parent){
            this.children = new Array();
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.scaleX = 0;
            this.scaleY = 0;
            this.shearX = 0;
            this.shearY = 0;
            this.ax = 0;
            this.ay = 0;
            this.arotation = 0;
            this.ascaleX = 0;
            this.ascaleY = 0;
            this.ashearX = 0;
            this.ashearY = 0;
            this.appliedValid = false;
            this.a = 0;
            this.b = 0;
            this.c = 0;
            this.d = 0;
            this.worldY = 0;
            this.worldX = 0;
            this.sorted = false;
            this.active = false;
            if (data == null)
                throw new Error("data cannot be null.");
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.skeleton = skeleton;
            this.parent = parent;
            this.setToSetupPose();
        }
        public isActive() {
            return this.active;
        };
        public update() {
            this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
        };
        public updateWorldTransform() {
            this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
        };
        public updateWorldTransformWith(x, y, rotation, scaleX, scaleY, shearX, shearY) {
            this.ax = x;
            this.ay = y;
            this.arotation = rotation;
            this.ascaleX = scaleX;
            this.ascaleY = scaleY;
            this.ashearX = shearX;
            this.ashearY = shearY;
            this.appliedValid = true;
            var parent = this.parent;
            if (parent == null) {
                var skeleton = this.skeleton;
                var rotationY = rotation + 90 + shearY;
                var sx = skeleton.scaleX;
                var sy = skeleton.scaleY;
                this.a = MathUtils.cosDeg(rotation + shearX) * scaleX * sx;
                this.b = MathUtils.cosDeg(rotationY) * scaleY * sx;
                this.c = MathUtils.sinDeg(rotation + shearX) * scaleX * sy;
                this.d = MathUtils.sinDeg(rotationY) * scaleY * sy;
                this.worldX = x * sx + skeleton.x;
                this.worldY = y * sy + skeleton.y;
                return;
            }
            var pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
            this.worldX = pa * x + pb * y + parent.worldX;
            this.worldY = pc * x + pd * y + parent.worldY;
            switch (this.data.transformMode) {
                case TransformMode.Normal: {
                    var rotationY = rotation + 90 + shearY;
                    var la = MathUtils.cosDeg(rotation + shearX) * scaleX;
                    var lb = MathUtils.cosDeg(rotationY) * scaleY;
                    var lc = MathUtils.sinDeg(rotation + shearX) * scaleX;
                    var ld = MathUtils.sinDeg(rotationY) * scaleY;
                    this.a = pa * la + pb * lc;
                    this.b = pa * lb + pb * ld;
                    this.c = pc * la + pd * lc;
                    this.d = pc * lb + pd * ld;
                    return;
                }
                case TransformMode.OnlyTranslation: {
                    var rotationY = rotation + 90 + shearY;
                    this.a = MathUtils.cosDeg(rotation + shearX) * scaleX;
                    this.b = MathUtils.cosDeg(rotationY) * scaleY;
                    this.c = MathUtils.sinDeg(rotation + shearX) * scaleX;
                    this.d = MathUtils.sinDeg(rotationY) * scaleY;
                    break;
                }
                case TransformMode.NoRotationOrReflection: {
                    var s = pa * pa + pc * pc;
                    var prx = 0;
                    if (s > 0.0001) {
                        s = Math.abs(pa * pd - pb * pc) / s;
                        pb = pc * s;
                        pd = pa * s;
                        prx = Math.atan2(pc, pa) * MathUtils.radDeg;
                    }
                    else {
                        pa = 0;
                        pc = 0;
                        prx = 90 - Math.atan2(pd, pb) * MathUtils.radDeg;
                    }
                    var rx = rotation + shearX - prx;
                    var ry = rotation + shearY - prx + 90;
                    var la = MathUtils.cosDeg(rx) * scaleX;
                    var lb = MathUtils.cosDeg(ry) * scaleY;
                    var lc = MathUtils.sinDeg(rx) * scaleX;
                    var ld = MathUtils.sinDeg(ry) * scaleY;
                    this.a = pa * la - pb * lc;
                    this.b = pa * lb - pb * ld;
                    this.c = pc * la + pd * lc;
                    this.d = pc * lb + pd * ld;
                    break;
                }
                case TransformMode.NoScale:
                case TransformMode.NoScaleOrReflection: {
                    var cos = MathUtils.cosDeg(rotation);
                    var sin = MathUtils.sinDeg(rotation);
                    var za = (pa * cos + pb * sin) / this.skeleton.scaleX;
                    var zc = (pc * cos + pd * sin) / this.skeleton.scaleY;
                    var s = Math.sqrt(za * za + zc * zc);
                    if (s > 0.00001)
                        s = 1 / s;
                    za *= s;
                    zc *= s;
                    s = Math.sqrt(za * za + zc * zc);
                    if (this.data.transformMode == TransformMode.NoScale
                        && (pa * pd - pb * pc < 0) != (this.skeleton.scaleX < 0 != this.skeleton.scaleY < 0))
                        s = -s;
                    var r = Math.PI / 2 + Math.atan2(zc, za);
                    var zb = Math.cos(r) * s;
                    var zd = Math.sin(r) * s;
                    var la = MathUtils.cosDeg(shearX) * scaleX;
                    var lb = MathUtils.cosDeg(90 + shearY) * scaleY;
                    var lc = MathUtils.sinDeg(shearX) * scaleX;
                    var ld = MathUtils.sinDeg(90 + shearY) * scaleY;
                    this.a = za * la + zb * lc;
                    this.b = za * lb + zb * ld;
                    this.c = zc * la + zd * lc;
                    this.d = zc * lb + zd * ld;
                    break;
                }
            }
            this.a *= this.skeleton.scaleX;
            this.b *= this.skeleton.scaleX;
            this.c *= this.skeleton.scaleY;
            this.d *= this.skeleton.scaleY;
        };
        public setToSetupPose() {
            var data = this.data;
            this.x = data.x;
            this.y = data.y;
            this.rotation = data.rotation;
            this.scaleX = data.scaleX;
            this.scaleY = data.scaleY;
            this.shearX = data.shearX;
            this.shearY = data.shearY;
        };
        public getWorldRotationX() {
            return Math.atan2(this.c, this.a) * MathUtils.radDeg;
        };
        public getWorldRotationY() {
            return Math.atan2(this.d, this.b) * MathUtils.radDeg;
        };
        public getWorldScaleX() {
            return Math.sqrt(this.a * this.a + this.c * this.c);
        };
        public getWorldScaleY() {
            return Math.sqrt(this.b * this.b + this.d * this.d);
        };
        public updateAppliedTransform() {
            this.appliedValid = true;
            var parent = this.parent;
            if (parent == null) {
                this.ax = this.worldX;
                this.ay = this.worldY;
                this.arotation = Math.atan2(this.c, this.a) * MathUtils.radDeg;
                this.ascaleX = Math.sqrt(this.a * this.a + this.c * this.c);
                this.ascaleY = Math.sqrt(this.b * this.b + this.d * this.d);
                this.ashearX = 0;
                this.ashearY = Math.atan2(this.a * this.b + this.c * this.d, this.a * this.d - this.b * this.c) * MathUtils.radDeg;
                return;
            }
            var pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
            var pid = 1 / (pa * pd - pb * pc);
            var dx = this.worldX - parent.worldX, dy = this.worldY - parent.worldY;
            this.ax = (dx * pd * pid - dy * pb * pid);
            this.ay = (dy * pa * pid - dx * pc * pid);
            var ia = pid * pd;
            var id = pid * pa;
            var ib = pid * pb;
            var ic = pid * pc;
            var ra = ia * this.a - ib * this.c;
            var rb = ia * this.b - ib * this.d;
            var rc = id * this.c - ic * this.a;
            var rd = id * this.d - ic * this.b;
            this.ashearX = 0;
            this.ascaleX = Math.sqrt(ra * ra + rc * rc);
            if (this.ascaleX > 0.0001) {
                var det = ra * rd - rb * rc;
                this.ascaleY = det / this.ascaleX;
                this.ashearY = Math.atan2(ra * rb + rc * rd, det) * MathUtils.radDeg;
                this.arotation = Math.atan2(rc, ra) * MathUtils.radDeg;
            }
            else {
                this.ascaleX = 0;
                this.ascaleY = Math.sqrt(rb * rb + rd * rd);
                this.ashearY = 0;
                this.arotation = 90 - Math.atan2(rd, rb) * MathUtils.radDeg;
            }
        };
        public worldToLocal(world) {
            var a = this.a, b = this.b, c = this.c, d = this.d;
            var invDet = 1 / (a * d - b * c);
            var x = world.x - this.worldX, y = world.y - this.worldY;
            world.x = (x * d * invDet - y * b * invDet);
            world.y = (y * a * invDet - x * c * invDet);
            return world;
        };
        public localToWorld(local) {
            var x = local.x, y = local.y;
            local.x = x * this.a + y * this.b + this.worldX;
            local.y = x * this.c + y * this.d + this.worldY;
            return local;
        };
        public worldToLocalRotation(worldRotation) {
            var sin = MathUtils.sinDeg(worldRotation), cos = MathUtils.cosDeg(worldRotation);
            return Math.atan2(this.a * sin - this.c * cos, this.d * cos - this.b * sin) * MathUtils.radDeg + this.rotation - this.shearX;
        };
        public localToWorldRotation(localRotation) {
            localRotation -= this.rotation - this.shearX;
            var sin = MathUtils.sinDeg(localRotation), cos = MathUtils.cosDeg(localRotation);
            return Math.atan2(cos * this.c + sin * this.d, cos * this.a + sin * this.b) * MathUtils.radDeg;
        };
        public rotateWorld(degrees) {
            var a = this.a, b = this.b, c = this.c, d = this.d;
            var cos = MathUtils.cosDeg(degrees), sin = MathUtils.sinDeg(degrees);
            this.a = cos * a - sin * c;
            this.b = cos * b - sin * d;
            this.c = sin * a + cos * c;
            this.d = sin * b + cos * d;
            this.appliedValid = false;
        };
       
    }
