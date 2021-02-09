import { VertexAttachment } from "./VertexAttachment"
import { Texture } from "./Texture"
import { TextureAtlas } from "./TextureAtlas"
import { TextureAtlasRegion } from "./TextureAtlasRegion"
import { Color } from "./Color"
import { Utils } from "./Utils"
import { Attachment } from "./Attachment"
export class MeshAttachment extends VertexAttachment{
public uvs:any;
public parentMesh:any;
public bones:any;
public vertices:any;
public worldVerticesLength:any;
public regionUVs:any;
public triangles:any;
public hullLength:any;

        
        constructor(name){
            super( name);
 var _this = this;

            _this.color = new Color(1, 1, 1, 1);
            _this.tempColor = new Color(0, 0, 0, 0);
            return _this;
        }
        public updateUVs() {
            var regionUVs = this.regionUVs;
            if (this.uvs == null || this.uvs.length != regionUVs.length)
                this.uvs = Utils.newFloatArray(regionUVs.length);
            var uvs = this.uvs;
            var n = this.uvs.length;
            var u = this.region.u, v = this.region.v, width = 0, height = 0;
            if (this.region instanceof TextureAtlasRegion) {
                var region = this.region;
                var textureWidth = region.texture.getImage().width, textureHeight = region.texture.getImage().height;
                switch (region.degrees) {
                    case 90:
                        u -= (region.originalHeight - region.offsetY - region.height) / textureWidth;
                        v -= (region.originalWidth - region.offsetX - region.width) / textureHeight;
                        width = region.originalHeight / textureWidth;
                        height = region.originalWidth / textureHeight;
                        for (var i = 0; i < n; i += 2) {
                            uvs[i] = u + regionUVs[i + 1] * width;
                            uvs[i + 1] = v + (1 - regionUVs[i]) * height;
                        }
                        return;
                    case 180:
                        u -= (region.originalWidth - region.offsetX - region.width) / textureWidth;
                        v -= region.offsetY / textureHeight;
                        width = region.originalWidth / textureWidth;
                        height = region.originalHeight / textureHeight;
                        for (var i = 0; i < n; i += 2) {
                            uvs[i] = u + (1 - regionUVs[i]) * width;
                            uvs[i + 1] = v + (1 - regionUVs[i + 1]) * height;
                        }
                        return;
                    case 270:
                        u -= region.offsetY / textureWidth;
                        v -= region.offsetX / textureHeight;
                        width = region.originalHeight / textureWidth;
                        height = region.originalWidth / textureHeight;
                        for (var i = 0; i < n; i += 2) {
                            uvs[i] = u + (1 - regionUVs[i + 1]) * width;
                            uvs[i + 1] = v + regionUVs[i] * height;
                        }
                        return;
                }
                u -= region.offsetX / textureWidth;
                v -= (region.originalHeight - region.offsetY - region.height) / textureHeight;
                width = region.originalWidth / textureWidth;
                height = region.originalHeight / textureHeight;
            }
            else if (this.region == null) {
                u = v = 0;
                width = height = 1;
            }
            else {
                width = this.region.u2 - u;
                height = this.region.v2 - v;
            }
            for (var i = 0; i < n; i += 2) {
                uvs[i] = u + regionUVs[i] * width;
                uvs[i + 1] = v + regionUVs[i + 1] * height;
            }
        };
        public getParentMesh() {
            return this.parentMesh;
        };
        public setParentMesh(parentMesh) {
            this.parentMesh = parentMesh;
            if (parentMesh != null) {
                this.bones = parentMesh.bones;
                this.vertices = parentMesh.vertices;
                this.worldVerticesLength = parentMesh.worldVerticesLength;
                this.regionUVs = parentMesh.regionUVs;
                this.triangles = parentMesh.triangles;
                this.hullLength = parentMesh.hullLength;
                this.worldVerticesLength = parentMesh.worldVerticesLength;
            }
        };
        public copy() {
            if (this.parentMesh != null)
                return this.newLinkedMesh();
            var copy = new MeshAttachment(this.name);
            copy.region = this.region;
            copy.path = this.path;
            copy.color.setFromColor(this.color);
            this.copyTo(copy);
            copy.regionUVs = new Array(this.regionUVs.length);
            Utils.arrayCopy(this.regionUVs, 0, copy.regionUVs, 0, this.regionUVs.length);
            copy.uvs = new Array(this.uvs.length);
            Utils.arrayCopy(this.uvs, 0, copy.uvs, 0, this.uvs.length);
            copy.triangles = new Array(this.triangles.length);
            Utils.arrayCopy(this.triangles, 0, copy.triangles, 0, this.triangles.length);
            copy.hullLength = this.hullLength;
            if (this.edges != null) {
                copy.edges = new Array(this.edges.length);
                Utils.arrayCopy(this.edges, 0, copy.edges, 0, this.edges.length);
            }
            copy.width = this.width;
            copy.height = this.height;
            return copy;
        };
        public newLinkedMesh() {
            var copy = new MeshAttachment(this.name);
            copy.region = this.region;
            copy.path = this.path;
            copy.color.setFromColor(this.color);
            copy.deformAttachment = this.deformAttachment;
            copy.setParentMesh(this.parentMesh != null ? this.parentMesh : this);
            copy.updateUVs();
            return copy;
        };
       
    }
