import { Attachment } from "./Attachment"
import { BoundingBoxAttachment } from "./BoundingBoxAttachment"
import { ClippingAttachment } from "./ClippingAttachment"
import { MeshAttachment } from "./MeshAttachment"
import { PathAttachment } from "./PathAttachment"
import { PointAttachment } from "./PointAttachment"
import { RegionAttachment } from "./RegionAttachment"
export class AtlasAttachmentLoader{
public atlas:any;

        constructor(atlas){
            this.atlas = atlas;
        }
        public newRegionAttachment(skin, name, path) {
            var region = this.atlas.findRegion(path);
            if (region == null) {
                // throw new Error("Region not found in atlas: " + path + " (region attachment: " + name + ")");
                return null;
            }
            region.renderObject = region;
            var attachment = new RegionAttachment(name);
            attachment.setRegion(region);
            return attachment;
        };
        public newMeshAttachment(skin, name, path) {
            var region = this.atlas.findRegion(path);
            if (region == null) {
                // throw new Error("Region not found in atlas: " + path + " (mesh attachment: " + name + ")");
                return null;
            }
            region.renderObject = region;
            var attachment = new MeshAttachment(name);
            attachment.region = region;
            return attachment;
        };
        public newBoundingBoxAttachment(skin, name) {
            return new BoundingBoxAttachment(name);
        };
        public newPathAttachment(skin, name) {
            return new PathAttachment(name);
        };
        public newPointAttachment(skin, name) {
            return new PointAttachment(name);
        };
        public newClippingAttachment(skin, name) {
            return new ClippingAttachment(name);
        };
       
    }
