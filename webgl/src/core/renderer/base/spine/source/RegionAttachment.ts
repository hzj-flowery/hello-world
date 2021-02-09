import { Attachment } from "./Attachment"
import { Color } from "./Color"
import { Utils } from "./Utils"
import { Attachment } from "./Attachment"
export class RegionAttachment extends Attachment{
public region:any;

        
        constructor(name){
            super( name);
 var _this = this;

            _this.x = 0;
            _this.y = 0;
            _this.scaleX = 1;
            _this.scaleY = 1;
            _this.rotation = 0;
            _this.width = 0;
            _this.height = 0;
            _this.color = new Color(1, 1, 1, 1);
            _this.offset = Utils.newFloatArray(8);
            _this.uvs = Utils.newFloatArray(8);
            _this.tempColor = new Color(1, 1, 1, 1);
            return _this;
        }
        public updateOffset() {
            var regionScaleX = this.width / this.region.originalWidth * this.scaleX;
            var regionScaleY = this.height / this.region.originalHeight * this.scaleY;
            var localX = -this.width / 2 * this.scaleX + this.region.offsetX * regionScaleX;
            var localY = -this.height / 2 * this.scaleY + this.region.offsetY * regionScaleY;
            var localX2 = localX + this.region.width * regionScaleX;
            var localY2 = localY + this.region.height * regionScaleY;
            var radians = this.rotation * Math.PI / 180;
            var cos = Math.cos(radians);
            var sin = Math.sin(radians);
            var localXCos = localX * cos + this.x;
            var localXSin = localX * sin;
            var localYCos = localY * cos + this.y;
            var localYSin = localY * sin;
            var localX2Cos = localX2 * cos + this.x;
            var localX2Sin = localX2 * sin;
            var localY2Cos = localY2 * cos + this.y;
            var localY2Sin = localY2 * sin;
            var offset = this.offset;
            offset[RegionAttachment.OX1] = localXCos - localYSin;
            offset[RegionAttachment.OY1] = localYCos + localXSin;
            offset[RegionAttachment.OX2] = localXCos - localY2Sin;
            offset[RegionAttachment.OY2] = localY2Cos + localXSin;
            offset[RegionAttachment.OX3] = localX2Cos - localY2Sin;
            offset[RegionAttachment.OY3] = localY2Cos + localX2Sin;
            offset[RegionAttachment.OX4] = localX2Cos - localYSin;
            offset[RegionAttachment.OY4] = localYCos + localX2Sin;
        };
        public setRegion(region) {
            this.region = region;
            var uvs = this.uvs;
            if (region.rotate) {
                uvs[2] = region.u;
                uvs[3] = region.v2;
                uvs[4] = region.u;
                uvs[5] = region.v;
                uvs[6] = region.u2;
                uvs[7] = region.v;
                uvs[0] = region.u2;
                uvs[1] = region.v2;
            }
            else {
                uvs[0] = region.u;
                uvs[1] = region.v2;
                uvs[2] = region.u;
                uvs[3] = region.v;
                uvs[4] = region.u2;
                uvs[5] = region.v;
                uvs[6] = region.u2;
                uvs[7] = region.v2;
            }
        };
        public computeWorldVertices(bone, worldVertices, offset, stride) {
            var vertexOffset = this.offset;
            var x = bone.worldX, y = bone.worldY;
            var a = bone.a, b = bone.b, c = bone.c, d = bone.d;
            var offsetX = 0, offsetY = 0;
            offsetX = vertexOffset[RegionAttachment.OX1];
            offsetY = vertexOffset[RegionAttachment.OY1];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[RegionAttachment.OX2];
            offsetY = vertexOffset[RegionAttachment.OY2];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[RegionAttachment.OX3];
            offsetY = vertexOffset[RegionAttachment.OY3];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[RegionAttachment.OX4];
            offsetY = vertexOffset[RegionAttachment.OY4];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
        };
        public copy() {
            var copy = new RegionAttachment(name);
            copy.region = this.region;
            copy.rendererObject = this.rendererObject;
            copy.path = this.path;
            copy.x = this.x;
            copy.y = this.y;
            copy.scaleX = this.scaleX;
            copy.scaleY = this.scaleY;
            copy.rotation = this.rotation;
            copy.width = this.width;
            copy.height = this.height;
            Utils.arrayCopy(this.uvs, 0, copy.uvs, 0, 8);
            Utils.arrayCopy(this.offset, 0, copy.offset, 0, 8);
            copy.color.setFromColor(this.color);
            return copy;
        };public static OX1 = 0;
public static OY1 = 1;
public static OX2 = 2;
public static OY2 = 3;
public static OX3 = 4;
public static OY3 = 5;
public static OX4 = 6;
public static OY4 = 7;
public static X1 = 0;
public static Y1 = 1;
public static C1R = 2;
public static C1G = 3;
public static C1B = 4;
public static C1A = 5;
public static U1 = 6;
public static V1 = 7;
public static X2 = 8;
public static Y2 = 9;
public static C2R = 10;
public static C2G = 11;
public static C2B = 12;
public static C2A = 13;
public static U2 = 14;
public static V2 = 15;
public static X3 = 16;
public static Y3 = 17;
public static C3R = 18;
public static C3G = 19;
public static C3B = 20;
public static C3A = 21;
public static U3 = 22;
public static V3 = 23;
public static X4 = 24;
public static Y4 = 25;
public static C4R = 26;
public static C4G = 27;
public static C4B = 28;
public static C4A = 29;
public static U4 = 30;
public static V4 = 31;

       
    }
