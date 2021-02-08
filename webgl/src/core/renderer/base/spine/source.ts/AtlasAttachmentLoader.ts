export class AtlasAttachmentLoader {
    public atlas:any;
    constructor(atlas) {
    this.atlas = atlas;
}
public newRegionAttachment(skin, name, path) {
    var region = this.atlas.findRegion(path);
    if (region == null) {
        // throw new Error("Region not found in atlas: " + path + " (region attachment: " + name + ")");
        return null;
    }
    region.renderObject = region;
    var attachment = new spine.RegionAttachment(name);
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
    var attachment = new spine.MeshAttachment(name);
    attachment.region = region;
    return attachment;
};
public newBoundingBoxAttachment(skin, name) {
    return new spine.BoundingBoxAttachment(name);
};
public newPathAttachment(skin, name) {
    return new spine.PathAttachment(name);
};
public newPointAttachment(skin, name) {
    return new spine.PointAttachment(name);
};
public newClippingAttachment(skin, name) {
    return new spine.ClippingAttachment(name);
};
}