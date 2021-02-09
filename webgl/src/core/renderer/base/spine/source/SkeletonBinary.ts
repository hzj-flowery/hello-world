import { Animation } from "./Animation"
import { RotateTimeline } from "./RotateTimeline"
import { TranslateTimeline } from "./TranslateTimeline"
import { ScaleTimeline } from "./ScaleTimeline"
import { ShearTimeline } from "./ShearTimeline"
import { ColorTimeline } from "./ColorTimeline"
import { TwoColorTimeline } from "./TwoColorTimeline"
import { AttachmentTimeline } from "./AttachmentTimeline"
import { DeformTimeline } from "./DeformTimeline"
import { EventTimeline } from "./EventTimeline"
import { DrawOrderTimeline } from "./DrawOrderTimeline"
import { IkConstraintTimeline } from "./IkConstraintTimeline"
import { TransformConstraintTimeline } from "./TransformConstraintTimeline"
import { PathConstraintPositionTimeline } from "./PathConstraintPositionTimeline"
import { PathConstraintSpacingTimeline } from "./PathConstraintSpacingTimeline"
import { PathConstraintMixTimeline } from "./PathConstraintMixTimeline"
import { BlendMode } from "./BlendMode"
import { Bone } from "./Bone"
import { BoneData } from "./BoneData"
import { TransformMode } from "./TransformMode"
import { ConstraintData } from "./ConstraintData"
import { Event } from "./Event"
import { EventData } from "./EventData"
import { IkConstraint } from "./IkConstraint"
import { IkConstraintData } from "./IkConstraintData"
import { PathConstraint } from "./PathConstraint"
import { PathConstraintData } from "./PathConstraintData"
import { PositionMode } from "./PositionMode"
import { SpacingMode } from "./SpacingMode"
import { RotateMode } from "./RotateMode"
import { Skeleton } from "./Skeleton"
import { SkeletonData } from "./SkeletonData"
import { Skin } from "./Skin"
import { Slot } from "./Slot"
import { SlotData } from "./SlotData"
import { TransformConstraint } from "./TransformConstraint"
import { TransformConstraintData } from "./TransformConstraintData"
import { Color } from "./Color"
import { Utils } from "./Utils"
import { Attachment } from "./Attachment"
import { AttachmentType } from "./AttachmentType"
import { BoundingBoxAttachment } from "./BoundingBoxAttachment"
import { ClippingAttachment } from "./ClippingAttachment"
import { MeshAttachment } from "./MeshAttachment"
import { PathAttachment } from "./PathAttachment"
import { PointAttachment } from "./PointAttachment"
import { RegionAttachment } from "./RegionAttachment"
export class SkeletonBinary{
public scale:number;
public linkedMeshes:Array<any>;
public attachmentLoader:any;

        constructor(attachmentLoader){
            this.scale = 1;
            this.linkedMeshes = new Array();
            this.attachmentLoader = attachmentLoader;
        }
        public readSkeletonData(binary) {
            var scale = this.scale;
            var skeletonData = new SkeletonData();
            skeletonData.name = "";
            var input = new BinaryInput(binary);
            skeletonData.hash = input.readString();
            skeletonData.version = input.readString();
            skeletonData.x = input.readFloat();
            skeletonData.y = input.readFloat();
            skeletonData.width = input.readFloat();
            skeletonData.height = input.readFloat();
            var nonessential = input.readBoolean();
            if (nonessential) {
                skeletonData.fps = input.readFloat();
                skeletonData.imagesPath = input.readString();
                skeletonData.audioPath = input.readString();
            }
            var n = 0;
            n = input.readInt(true);
            for (var i = 0; i < n; i++)
                input.strings.push(input.readString());
            n = input.readInt(true);
            for (var i = 0; i < n; i++) {
                var name_2 = input.readString();
                var parent_2 = i == 0 ? null : skeletonData.bones[input.readInt(true)];
                var data = new BoneData(i, name_2, parent_2);
                data.rotation = input.readFloat();
                data.x = input.readFloat() * scale;
                data.y = input.readFloat() * scale;
                data.scaleX = input.readFloat();
                data.scaleY = input.readFloat();
                data.shearX = input.readFloat();
                data.shearY = input.readFloat();
                data.length = input.readFloat() * scale;
                data.transformMode = SkeletonBinary.TransformModeValues[input.readInt(true)];
                data.skinRequired = input.readBoolean();
                if (nonessential)
                    Color.rgba8888ToColor(data.color, input.readInt32());
                skeletonData.bones.push(data);
            }
            n = input.readInt(true);
            for (var i = 0; i < n; i++) {
                var slotName = input.readString();
                var boneData = skeletonData.bones[input.readInt(true)];
                var data = new SlotData(i, slotName, boneData);
                Color.rgba8888ToColor(data.color, input.readInt32());
                var darkColor = input.readInt32();
                if (darkColor != -1)
                    Color.rgb888ToColor(data.darkColor = new Color(), darkColor);
                data.attachmentName = input.readStringRef();
                data.blendMode = SkeletonBinary.BlendModeValues[input.readInt(true)];
                skeletonData.slots.push(data);
            }
            n = input.readInt(true);
            for (var i = 0, nn = void 0; i < n; i++) {
                var data = new IkConstraintData(input.readString());
                data.order = input.readInt(true);
                data.skinRequired = input.readBoolean();
                nn = input.readInt(true);
                for (var ii = 0; ii < nn; ii++)
                    data.bones.push(skeletonData.bones[input.readInt(true)]);
                data.target = skeletonData.bones[input.readInt(true)];
                data.mix = input.readFloat();
                data.softness = input.readFloat() * scale;
                data.bendDirection = input.readByte();
                data.compress = input.readBoolean();
                data.stretch = input.readBoolean();
                data.uniform = input.readBoolean();
                skeletonData.ikConstraints.push(data);
            }
            n = input.readInt(true);
            for (var i = 0, nn = void 0; i < n; i++) {
                var data = new TransformConstraintData(input.readString());
                data.order = input.readInt(true);
                data.skinRequired = input.readBoolean();
                nn = input.readInt(true);
                for (var ii = 0; ii < nn; ii++)
                    data.bones.push(skeletonData.bones[input.readInt(true)]);
                data.target = skeletonData.bones[input.readInt(true)];
                data.local = input.readBoolean();
                data.relative = input.readBoolean();
                data.offsetRotation = input.readFloat();
                data.offsetX = input.readFloat() * scale;
                data.offsetY = input.readFloat() * scale;
                data.offsetScaleX = input.readFloat();
                data.offsetScaleY = input.readFloat();
                data.offsetShearY = input.readFloat();
                data.rotateMix = input.readFloat();
                data.translateMix = input.readFloat();
                data.scaleMix = input.readFloat();
                data.shearMix = input.readFloat();
                skeletonData.transformConstraints.push(data);
            }
            n = input.readInt(true);
            for (var i = 0, nn = void 0; i < n; i++) {
                var data = new PathConstraintData(input.readString());
                data.order = input.readInt(true);
                data.skinRequired = input.readBoolean();
                nn = input.readInt(true);
                for (var ii = 0; ii < nn; ii++)
                    data.bones.push(skeletonData.bones[input.readInt(true)]);
                data.target = skeletonData.slots[input.readInt(true)];
                data.positionMode = SkeletonBinary.PositionModeValues[input.readInt(true)];
                data.spacingMode = SkeletonBinary.SpacingModeValues[input.readInt(true)];
                data.rotateMode = SkeletonBinary.RotateModeValues[input.readInt(true)];
                data.offsetRotation = input.readFloat();
                data.position = input.readFloat();
                if (data.positionMode == PositionMode.Fixed)
                    data.position *= scale;
                data.spacing = input.readFloat();
                if (data.spacingMode == SpacingMode.Length || data.spacingMode == SpacingMode.Fixed)
                    data.spacing *= scale;
                data.rotateMix = input.readFloat();
                data.translateMix = input.readFloat();
                skeletonData.pathConstraints.push(data);
            }
            var defaultSkin = this.readSkin(input, skeletonData, true, nonessential);
            if (defaultSkin != null) {
                skeletonData.defaultSkin = defaultSkin;
                skeletonData.skins.push(defaultSkin);
            }
            {
                var i = skeletonData.skins.length;
                Utils.setArraySize(skeletonData.skins, n = i + input.readInt(true));
                for (; i < n; i++)
                    skeletonData.skins[i] = this.readSkin(input, skeletonData, false, nonessential);
            }
            n = this.linkedMeshes.length;
            for (var i = 0; i < n; i++) {
                var linkedMesh = this.linkedMeshes[i];
                var skin = linkedMesh.skin == null ? skeletonData.defaultSkin : skeletonData.findSkin(linkedMesh.skin);
                if (skin == null)
                    throw new Error("Skin not found: " + linkedMesh.skin);
                var parent_3 = skin.getAttachment(linkedMesh.slotIndex, linkedMesh.parent);
                if (parent_3 == null)
                    throw new Error("Parent mesh not found: " + linkedMesh.parent);
                linkedMesh.mesh.deformAttachment = linkedMesh.inheritDeform ? parent_3 : linkedMesh.mesh;
                linkedMesh.mesh.setParentMesh(parent_3);
                linkedMesh.mesh.updateUVs();
            }
            this.linkedMeshes.length = 0;
            n = input.readInt(true);
            for (var i = 0; i < n; i++) {
                var data = new EventData(input.readStringRef());
                data.intValue = input.readInt(false);
                data.floatValue = input.readFloat();
                data.stringValue = input.readString();
                data.audioPath = input.readString();
                if (data.audioPath != null) {
                    data.volume = input.readFloat();
                    data.balance = input.readFloat();
                }
                skeletonData.events.push(data);
            }
            n = input.readInt(true);
            for (var i = 0; i < n; i++)
                skeletonData.animations.push(this.readAnimation(input, input.readString(), skeletonData));
            return skeletonData;
        };
        public readSkin(input, skeletonData, defaultSkin, nonessential) {
            var skin = null;
            var slotCount = 0;
            if (defaultSkin) {
                slotCount = input.readInt(true);
                if (slotCount == 0)
                    return null;
                skin = new Skin("default");
            }
            else {
                skin = new Skin(input.readStringRef());
                skin.bones.length = input.readInt(true);
                for (var i = 0, n = skin.bones.length; i < n; i++)
                    skin.bones[i] = skeletonData.bones[input.readInt(true)];
                for (var i = 0, n = input.readInt(true); i < n; i++)
                    skin.constraints.push(skeletonData.ikConstraints[input.readInt(true)]);
                for (var i = 0, n = input.readInt(true); i < n; i++)
                    skin.constraints.push(skeletonData.transformConstraints[input.readInt(true)]);
                for (var i = 0, n = input.readInt(true); i < n; i++)
                    skin.constraints.push(skeletonData.pathConstraints[input.readInt(true)]);
                slotCount = input.readInt(true);
            }
            for (var i = 0; i < slotCount; i++) {
                var slotIndex = input.readInt(true);
                for (var ii = 0, nn = input.readInt(true); ii < nn; ii++) {
                    var name_3 = input.readStringRef();
                    var attachment = this.readAttachment(input, skeletonData, skin, slotIndex, name_3, nonessential);
                    if (attachment != null)
                        skin.setAttachment(slotIndex, name_3, attachment);
                }
            }
            return skin;
        };
        public readAttachment(input, skeletonData, skin, slotIndex, attachmentName, nonessential) {
            var scale = this.scale;
            var name = input.readStringRef();
            if (name == null)
                name = attachmentName;
            var typeIndex = input.readByte();
            var type = SkeletonBinary.AttachmentTypeValues[typeIndex];
            switch (type) {
                case AttachmentType.Region: {
                    var path = input.readStringRef();
                    var rotation = input.readFloat();
                    var x = input.readFloat();
                    var y = input.readFloat();
                    var scaleX = input.readFloat();
                    var scaleY = input.readFloat();
                    var width = input.readFloat();
                    var height = input.readFloat();
                    var color = input.readInt32();
                    if (path == null)
                        path = name;
                    var region = this.attachmentLoader.newRegionAttachment(skin, name, path);
                    if (region == null)
                        return null;
                    region.path = path;
                    region.x = x * scale;
                    region.y = y * scale;
                    region.scaleX = scaleX;
                    region.scaleY = scaleY;
                    region.rotation = rotation;
                    region.width = width * scale;
                    region.height = height * scale;
                    Color.rgba8888ToColor(region.color, color);
                    region.updateOffset();
                    return region;
                }
                case AttachmentType.BoundingBox: {
                    var vertexCount = input.readInt(true);
                    var vertices = this.readVertices(input, vertexCount);
                    var color = nonessential ? input.readInt32() : 0;
                    var box = this.attachmentLoader.newBoundingBoxAttachment(skin, name);
                    if (box == null)
                        return null;
                    box.worldVerticesLength = vertexCount << 1;
                    box.vertices = vertices.vertices;
                    box.bones = vertices.bones;
                    if (nonessential)
                        Color.rgba8888ToColor(box.color, color);
                    return box;
                }
                case AttachmentType.Mesh: {
                    var path = input.readStringRef();
                    var color = input.readInt32();
                    var vertexCount = input.readInt(true);
                    var uvs = this.readFloatArray(input, vertexCount << 1, 1);
                    var triangles = this.readShortArray(input);
                    var vertices = this.readVertices(input, vertexCount);
                    var hullLength = input.readInt(true);
                    var edges = null;
                    var width = 0, height = 0;
                    if (nonessential) {
                        edges = this.readShortArray(input);
                        width = input.readFloat();
                        height = input.readFloat();
                    }
                    if (path == null)
                        path = name;
                    var mesh = this.attachmentLoader.newMeshAttachment(skin, name, path);
                    if (mesh == null)
                        return null;
                    mesh.path = path;
                    Color.rgba8888ToColor(mesh.color, color);
                    mesh.bones = vertices.bones;
                    mesh.vertices = vertices.vertices;
                    mesh.worldVerticesLength = vertexCount << 1;
                    mesh.triangles = triangles;
                    mesh.regionUVs = uvs;
                    mesh.updateUVs();
                    mesh.hullLength = hullLength << 1;
                    if (nonessential) {
                        mesh.edges = edges;
                        mesh.width = width * scale;
                        mesh.height = height * scale;
                    }
                    return mesh;
                }
                case AttachmentType.LinkedMesh: {
                    var path = input.readStringRef();
                    var color = input.readInt32();
                    var skinName = input.readStringRef();
                    var parent_4 = input.readStringRef();
                    var inheritDeform = input.readBoolean();
                    var width = 0, height = 0;
                    if (nonessential) {
                        width = input.readFloat();
                        height = input.readFloat();
                    }
                    if (path == null)
                        path = name;
                    var mesh = this.attachmentLoader.newMeshAttachment(skin, name, path);
                    if (mesh == null)
                        return null;
                    mesh.path = path;
                    Color.rgba8888ToColor(mesh.color, color);
                    if (nonessential) {
                        mesh.width = width * scale;
                        mesh.height = height * scale;
                    }
                    this.linkedMeshes.push(new LinkedMesh(mesh, skinName, slotIndex, parent_4, inheritDeform));
                    return mesh;
                }
                case AttachmentType.Path: {
                    var closed_1 = input.readBoolean();
                    var constantSpeed = input.readBoolean();
                    var vertexCount = input.readInt(true);
                    var vertices = this.readVertices(input, vertexCount);
                    var lengths = Utils.newArray(vertexCount / 3, 0);
                    for (var i = 0, n = lengths.length; i < n; i++)
                        lengths[i] = input.readFloat() * scale;
                    var color = nonessential ? input.readInt32() : 0;
                    var path = this.attachmentLoader.newPathAttachment(skin, name);
                    if (path == null)
                        return null;
                    path.closed = closed_1;
                    path.constantSpeed = constantSpeed;
                    path.worldVerticesLength = vertexCount << 1;
                    path.vertices = vertices.vertices;
                    path.bones = vertices.bones;
                    path.lengths = lengths;
                    if (nonessential)
                        Color.rgba8888ToColor(path.color, color);
                    return path;
                }
                case AttachmentType.Point: {
                    var rotation = input.readFloat();
                    var x = input.readFloat();
                    var y = input.readFloat();
                    var color = nonessential ? input.readInt32() : 0;
                    var point = this.attachmentLoader.newPointAttachment(skin, name);
                    if (point == null)
                        return null;
                    point.x = x * scale;
                    point.y = y * scale;
                    point.rotation = rotation;
                    if (nonessential)
                        Color.rgba8888ToColor(point.color, color);
                    return point;
                }
                case AttachmentType.Clipping: {
                    var endSlotIndex = input.readInt(true);
                    var vertexCount = input.readInt(true);
                    var vertices = this.readVertices(input, vertexCount);
                    var color = nonessential ? input.readInt32() : 0;
                    var clip = this.attachmentLoader.newClippingAttachment(skin, name);
                    if (clip == null)
                        return null;
                    clip.endSlot = skeletonData.slots[endSlotIndex];
                    clip.worldVerticesLength = vertexCount << 1;
                    clip.vertices = vertices.vertices;
                    clip.bones = vertices.bones;
                    if (nonessential)
                        Color.rgba8888ToColor(clip.color, color);
                    return clip;
                }
            }
            return null;
        };
        public readVertices(input, vertexCount) {
            var verticesLength = vertexCount << 1;
            var vertices = new Vertices();
            var scale = this.scale;
            if (!input.readBoolean()) {
                vertices.vertices = this.readFloatArray(input, verticesLength, scale);
                return vertices;
            }
            var weights = new Array();
            var bonesArray = new Array();
            for (var i = 0; i < vertexCount; i++) {
                var boneCount = input.readInt(true);
                bonesArray.push(boneCount);
                for (var ii = 0; ii < boneCount; ii++) {
                    bonesArray.push(input.readInt(true));
                    weights.push(input.readFloat() * scale);
                    weights.push(input.readFloat() * scale);
                    weights.push(input.readFloat());
                }
            }
            vertices.vertices = Utils.toFloatArray(weights);
            vertices.bones = bonesArray;
            return vertices;
        };
        public readFloatArray(input, n, scale) {
            var array = new Array(n);
            if (scale == 1) {
                for (var i = 0; i < n; i++)
                    array[i] = input.readFloat();
            }
            else {
                for (var i = 0; i < n; i++)
                    array[i] = input.readFloat() * scale;
            }
            return array;
        };
        public readShortArray(input) {
            var n = input.readInt(true);
            var array = new Array(n);
            for (var i = 0; i < n; i++)
                array[i] = input.readShort();
            return array;
        };
        public readAnimation(input, name, skeletonData) {
            var timelines = new Array();
            var scale = this.scale;
            var duration = 0;
            var tempColor1 = new Color();
            var tempColor2 = new Color();
            for (var i = 0, n = input.readInt(true); i < n; i++) {
                var slotIndex = input.readInt(true);
                for (var ii = 0, nn = input.readInt(true); ii < nn; ii++) {
                    var timelineType = input.readByte();
                    var frameCount = input.readInt(true);
                    switch (timelineType) {
                        case SkeletonBinary.SLOT_ATTACHMENT: {
                            var timeline = new AttachmentTimeline(frameCount);
                            timeline.slotIndex = slotIndex;
                            for (var frameIndex = 0; frameIndex < frameCount; frameIndex++)
                                timeline.setFrame(frameIndex, input.readFloat(), input.readStringRef());
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[frameCount - 1]);
                            break;
                        }
                        case SkeletonBinary.SLOT_COLOR: {
                            var timeline = new ColorTimeline(frameCount);
                            timeline.slotIndex = slotIndex;
                            for (var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                                var time = input.readFloat();
                                Color.rgba8888ToColor(tempColor1, input.readInt32());
                                timeline.setFrame(frameIndex, time, tempColor1.r, tempColor1.g, tempColor1.b, tempColor1.a);
                                if (frameIndex < frameCount - 1)
                                    this.readCurve(input, frameIndex, timeline);
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(frameCount - 1) * ColorTimeline.ENTRIES]);
                            break;
                        }
                        case SkeletonBinary.SLOT_TWO_COLOR: {
                            var timeline = new TwoColorTimeline(frameCount);
                            timeline.slotIndex = slotIndex;
                            for (var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                                var time = input.readFloat();
                                Color.rgba8888ToColor(tempColor1, input.readInt32());
                                Color.rgb888ToColor(tempColor2, input.readInt32());
                                timeline.setFrame(frameIndex, time, tempColor1.r, tempColor1.g, tempColor1.b, tempColor1.a, tempColor2.r, tempColor2.g, tempColor2.b);
                                if (frameIndex < frameCount - 1)
                                    this.readCurve(input, frameIndex, timeline);
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(frameCount - 1) * TwoColorTimeline.ENTRIES]);
                            break;
                        }
                    }
                }
            }
            for (var i = 0, n = input.readInt(true); i < n; i++) {
                var boneIndex = input.readInt(true);
                for (var ii = 0, nn = input.readInt(true); ii < nn; ii++) {
                    var timelineType = input.readByte();
                    var frameCount = input.readInt(true);
                    switch (timelineType) {
                        case SkeletonBinary.BONE_ROTATE: {
                            var timeline = new RotateTimeline(frameCount);
                            timeline.boneIndex = boneIndex;
                            for (var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                                timeline.setFrame(frameIndex, input.readFloat(), input.readFloat());
                                if (frameIndex < frameCount - 1)
                                    this.readCurve(input, frameIndex, timeline);
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(frameCount - 1) * RotateTimeline.ENTRIES]);
                            break;
                        }
                        case SkeletonBinary.BONE_TRANSLATE:
                        case SkeletonBinary.BONE_SCALE:
                        case SkeletonBinary.BONE_SHEAR: {
                            var timeline = void 0;
                            var timelineScale = 1;
                            if (timelineType == SkeletonBinary.BONE_SCALE)
                                timeline = new ScaleTimeline(frameCount);
                            else if (timelineType == SkeletonBinary.BONE_SHEAR)
                                timeline = new ShearTimeline(frameCount);
                            else {
                                timeline = new TranslateTimeline(frameCount);
                                timelineScale = scale;
                            }
                            timeline.boneIndex = boneIndex;
                            for (var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                                timeline.setFrame(frameIndex, input.readFloat(), input.readFloat() * timelineScale, input.readFloat() * timelineScale);
                                if (frameIndex < frameCount - 1)
                                    this.readCurve(input, frameIndex, timeline);
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(frameCount - 1) * TranslateTimeline.ENTRIES]);
                            break;
                        }
                    }
                }
            }
            for (var i = 0, n = input.readInt(true); i < n; i++) {
                var index = input.readInt(true);
                var frameCount = input.readInt(true);
                var timeline = new IkConstraintTimeline(frameCount);
                timeline.ikConstraintIndex = index;
                for (var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                    timeline.setFrame(frameIndex, input.readFloat(), input.readFloat(), input.readFloat() * scale, input.readByte(), input.readBoolean(), input.readBoolean());
                    if (frameIndex < frameCount - 1)
                        this.readCurve(input, frameIndex, timeline);
                }
                timelines.push(timeline);
                duration = Math.max(duration, timeline.frames[(frameCount - 1) * IkConstraintTimeline.ENTRIES]);
            }
            for (var i = 0, n = input.readInt(true); i < n; i++) {
                var index = input.readInt(true);
                var frameCount = input.readInt(true);
                var timeline = new TransformConstraintTimeline(frameCount);
                timeline.transformConstraintIndex = index;
                for (var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                    timeline.setFrame(frameIndex, input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat());
                    if (frameIndex < frameCount - 1)
                        this.readCurve(input, frameIndex, timeline);
                }
                timelines.push(timeline);
                duration = Math.max(duration, timeline.frames[(frameCount - 1) * TransformConstraintTimeline.ENTRIES]);
            }
            for (var i = 0, n = input.readInt(true); i < n; i++) {
                var index = input.readInt(true);
                var data = skeletonData.pathConstraints[index];
                for (var ii = 0, nn = input.readInt(true); ii < nn; ii++) {
                    var timelineType = input.readByte();
                    var frameCount = input.readInt(true);
                    switch (timelineType) {
                        case SkeletonBinary.PATH_POSITION:
                        case SkeletonBinary.PATH_SPACING: {
                            var timeline = void 0;
                            var timelineScale = 1;
                            if (timelineType == SkeletonBinary.PATH_SPACING) {
                                timeline = new PathConstraintSpacingTimeline(frameCount);
                                if (data.spacingMode == SpacingMode.Length || data.spacingMode == SpacingMode.Fixed)
                                    timelineScale = scale;
                            }
                            else {
                                timeline = new PathConstraintPositionTimeline(frameCount);
                                if (data.positionMode == PositionMode.Fixed)
                                    timelineScale = scale;
                            }
                            timeline.pathConstraintIndex = index;
                            for (var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                                timeline.setFrame(frameIndex, input.readFloat(), input.readFloat() * timelineScale);
                                if (frameIndex < frameCount - 1)
                                    this.readCurve(input, frameIndex, timeline);
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(frameCount - 1) * PathConstraintPositionTimeline.ENTRIES]);
                            break;
                        }
                        case SkeletonBinary.PATH_MIX: {
                            var timeline = new PathConstraintMixTimeline(frameCount);
                            timeline.pathConstraintIndex = index;
                            for (var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                                timeline.setFrame(frameIndex, input.readFloat(), input.readFloat(), input.readFloat());
                                if (frameIndex < frameCount - 1)
                                    this.readCurve(input, frameIndex, timeline);
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(frameCount - 1) * PathConstraintMixTimeline.ENTRIES]);
                            break;
                        }
                    }
                }
            }
            for (var i = 0, n = input.readInt(true); i < n; i++) {
                var skin = skeletonData.skins[input.readInt(true)];
                for (var ii = 0, nn = input.readInt(true); ii < nn; ii++) {
                    var slotIndex = input.readInt(true);
                    for (var iii = 0, nnn = input.readInt(true); iii < nnn; iii++) {
                        var attachment = skin.getAttachment(slotIndex, input.readStringRef());
                        var weighted = attachment.bones != null;
                        var vertices = attachment.vertices;
                        var deformLength = weighted ? vertices.length / 3 * 2 : vertices.length;
                        var frameCount = input.readInt(true);
                        var timeline = new DeformTimeline(frameCount);
                        timeline.slotIndex = slotIndex;
                        timeline.attachment = attachment;
                        for (var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                            var time = input.readFloat();
                            var deform = void 0;
                            var end = input.readInt(true);
                            if (end == 0)
                                deform = weighted ? Utils.newFloatArray(deformLength) : vertices;
                            else {
                                deform = Utils.newFloatArray(deformLength);
                                var start = input.readInt(true);
                                end += start;
                                if (scale == 1) {
                                    for (var v = start; v < end; v++)
                                        deform[v] = input.readFloat();
                                }
                                else {
                                    for (var v = start; v < end; v++)
                                        deform[v] = input.readFloat() * scale;
                                }
                                if (!weighted) {
                                    for (var v = 0, vn = deform.length; v < vn; v++)
                                        deform[v] += vertices[v];
                                }
                            }
                            timeline.setFrame(frameIndex, time, deform);
                            if (frameIndex < frameCount - 1)
                                this.readCurve(input, frameIndex, timeline);
                        }
                        timelines.push(timeline);
                        duration = Math.max(duration, timeline.frames[frameCount - 1]);
                    }
                }
            }
            var drawOrderCount = input.readInt(true);
            if (drawOrderCount > 0) {
                var timeline = new DrawOrderTimeline(drawOrderCount);
                var slotCount = skeletonData.slots.length;
                for (var i = 0; i < drawOrderCount; i++) {
                    var time = input.readFloat();
                    var offsetCount = input.readInt(true);
                    var drawOrder = Utils.newArray(slotCount, 0);
                    for (var ii = slotCount - 1; ii >= 0; ii--)
                        drawOrder[ii] = -1;
                    var unchanged = Utils.newArray(slotCount - offsetCount, 0);
                    var originalIndex = 0, unchangedIndex = 0;
                    for (var ii = 0; ii < offsetCount; ii++) {
                        var slotIndex = input.readInt(true);
                        while (originalIndex != slotIndex)
                            unchanged[unchangedIndex++] = originalIndex++;
                        drawOrder[originalIndex + input.readInt(true)] = originalIndex++;
                    }
                    while (originalIndex < slotCount)
                        unchanged[unchangedIndex++] = originalIndex++;
                    for (var ii = slotCount - 1; ii >= 0; ii--)
                        if (drawOrder[ii] == -1)
                            drawOrder[ii] = unchanged[--unchangedIndex];
                    timeline.setFrame(i, time, drawOrder);
                }
                timelines.push(timeline);
                duration = Math.max(duration, timeline.frames[drawOrderCount - 1]);
            }
            var eventCount = input.readInt(true);
            if (eventCount > 0) {
                var timeline = new EventTimeline(eventCount);
                for (var i = 0; i < eventCount; i++) {
                    var time = input.readFloat();
                    var eventData = skeletonData.events[input.readInt(true)];
                    var event_4 = new Event(time, eventData);
                    event_4.intValue = input.readInt(false);
                    event_4.floatValue = input.readFloat();
                    event_4.stringValue = input.readBoolean() ? input.readString() : eventData.stringValue;
                    if (event_4.data.audioPath != null) {
                        event_4.volume = input.readFloat();
                        event_4.balance = input.readFloat();
                    }
                    timeline.setFrame(i, event_4);
                }
                timelines.push(timeline);
                duration = Math.max(duration, timeline.frames[eventCount - 1]);
            }
            return new Animation(name, timelines, duration);
        };
        public readCurve(input, frameIndex, timeline) {
            switch (input.readByte()) {
                case SkeletonBinary.CURVE_STEPPED:
                    timeline.setStepped(frameIndex);
                    break;
                case SkeletonBinary.CURVE_BEZIER:
                    this.setCurve(timeline, frameIndex, input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat());
                    break;
            }
        };
        public setCurve(timeline, frameIndex, cx1, cy1, cx2, cy2) {
            timeline.setCurve(frameIndex, cx1, cy1, cx2, cy2);
        };public static AttachmentTypeValues = [0, 1, 2, 3, 4, 5, 6];
public static TransformModeValues = [TransformMode.Normal, TransformMode.OnlyTranslation, TransformMode.NoRotationOrReflection, TransformMode.NoScale, TransformMode.NoScaleOrReflection];
public static PositionModeValues = [PositionMode.Fixed, PositionMode.Percent];
public static SpacingModeValues = [SpacingMode.Length, SpacingMode.Fixed, SpacingMode.Percent];
public static RotateModeValues = [RotateMode.Tangent, RotateMode.Chain, RotateMode.ChainScale];
public static BlendModeValues = [BlendMode.Normal, BlendMode.Additive, BlendMode.Multiply, BlendMode.Screen];
public static BONE_ROTATE = 0;
public static BONE_TRANSLATE = 1;
public static BONE_SCALE = 2;
public static BONE_SHEAR = 3;
public static SLOT_ATTACHMENT = 0;
public static SLOT_COLOR = 1;
public static SLOT_TWO_COLOR = 2;
public static PATH_POSITION = 0;
public static PATH_SPACING = 1;
public static PATH_MIX = 2;
public static CURVE_LINEAR = 0;
public static CURVE_STEPPED = 1;
public static CURVE_BEZIER = 2;

       
    }
