export class SkeletonJson{

        constructor(attachmentLoader){
            this.scale = 1;
            this.linkedMeshes = new Array();
            this.attachmentLoader = attachmentLoader;
        }
        public readSkeletonData(json) {
            var scale = this.scale;
            var skeletonData = new spine.SkeletonData();
            var root = typeof (json) === "string" ? JSON.parse(json) : json;
            var skeletonMap = root.skeleton;
            if (skeletonMap != null) {
                skeletonData.hash = skeletonMap.hash;
                skeletonData.version = skeletonMap.spine;
                skeletonData.x = skeletonMap.x;
                skeletonData.y = skeletonMap.y;
                skeletonData.width = skeletonMap.width;
                skeletonData.height = skeletonMap.height;
                skeletonData.fps = skeletonMap.fps;
                skeletonData.imagesPath = skeletonMap.images;
            }
            if (root.bones) {
                for (var i = 0; i < root.bones.length; i++) {
                    var boneMap = root.bones[i];
                    var parent_5 = null;
                    var parentName = this.getValue(boneMap, "parent", null);
                    if (parentName != null) {
                        parent_5 = skeletonData.findBone(parentName);
                        if (parent_5 == null)
                            throw new Error("Parent bone not found: " + parentName);
                    }
                    var data = new spine.BoneData(skeletonData.bones.length, boneMap.name, parent_5);
                    data.length = this.getValue(boneMap, "length", 0) * scale;
                    data.x = this.getValue(boneMap, "x", 0) * scale;
                    data.y = this.getValue(boneMap, "y", 0) * scale;
                    data.rotation = this.getValue(boneMap, "rotation", 0);
                    data.scaleX = this.getValue(boneMap, "scaleX", 1);
                    data.scaleY = this.getValue(boneMap, "scaleY", 1);
                    data.shearX = this.getValue(boneMap, "shearX", 0);
                    data.shearY = this.getValue(boneMap, "shearY", 0);
                    data.transformMode = SkeletonJson.transformModeFromString(this.getValue(boneMap, "transform", "normal"));
                    data.skinRequired = this.getValue(boneMap, "skin", false);
                    skeletonData.bones.push(data);
                }
            }
            if (root.slots) {
                for (var i = 0; i < root.slots.length; i++) {
                    var slotMap = root.slots[i];
                    var slotName = slotMap.name;
                    var boneName = slotMap.bone;
                    var boneData = skeletonData.findBone(boneName);
                    if (boneData == null)
                        throw new Error("Slot bone not found: " + boneName);
                    var data = new spine.SlotData(skeletonData.slots.length, slotName, boneData);
                    var color = this.getValue(slotMap, "color", null);
                    if (color != null)
                        data.color.setFromString(color);
                    var dark = this.getValue(slotMap, "dark", null);
                    if (dark != null) {
                        data.darkColor = new spine.Color(1, 1, 1, 1);
                        data.darkColor.setFromString(dark);
                    }
                    data.attachmentName = this.getValue(slotMap, "attachment", null);
                    data.blendMode = SkeletonJson.blendModeFromString(this.getValue(slotMap, "blend", "normal"));
                    skeletonData.slots.push(data);
                }
            }
            if (root.ik) {
                for (var i = 0; i < root.ik.length; i++) {
                    var constraintMap = root.ik[i];
                    var data = new spine.IkConstraintData(constraintMap.name);
                    data.order = this.getValue(constraintMap, "order", 0);
                    data.skinRequired = this.getValue(constraintMap, "skin", false);
                    for (var j = 0; j < constraintMap.bones.length; j++) {
                        var boneName = constraintMap.bones[j];
                        var bone = skeletonData.findBone(boneName);
                        if (bone == null)
                            throw new Error("IK bone not found: " + boneName);
                        data.bones.push(bone);
                    }
                    var targetName = constraintMap.target;
                    data.target = skeletonData.findBone(targetName);
                    if (data.target == null)
                        throw new Error("IK target bone not found: " + targetName);
                    data.mix = this.getValue(constraintMap, "mix", 1);
                    data.softness = this.getValue(constraintMap, "softness", 0) * scale;
                    data.bendDirection = this.getValue(constraintMap, "bendPositive", true) ? 1 : -1;
                    data.compress = this.getValue(constraintMap, "compress", false);
                    data.stretch = this.getValue(constraintMap, "stretch", false);
                    data.uniform = this.getValue(constraintMap, "uniform", false);
                    skeletonData.ikConstraints.push(data);
                }
            }
            if (root.transform) {
                for (var i = 0; i < root.transform.length; i++) {
                    var constraintMap = root.transform[i];
                    var data = new spine.TransformConstraintData(constraintMap.name);
                    data.order = this.getValue(constraintMap, "order", 0);
                    data.skinRequired = this.getValue(constraintMap, "skin", false);
                    for (var j = 0; j < constraintMap.bones.length; j++) {
                        var boneName = constraintMap.bones[j];
                        var bone = skeletonData.findBone(boneName);
                        if (bone == null)
                            throw new Error("Transform constraint bone not found: " + boneName);
                        data.bones.push(bone);
                    }
                    var targetName = constraintMap.target;
                    data.target = skeletonData.findBone(targetName);
                    if (data.target == null)
                        throw new Error("Transform constraint target bone not found: " + targetName);
                    data.local = this.getValue(constraintMap, "local", false);
                    data.relative = this.getValue(constraintMap, "relative", false);
                    data.offsetRotation = this.getValue(constraintMap, "rotation", 0);
                    data.offsetX = this.getValue(constraintMap, "x", 0) * scale;
                    data.offsetY = this.getValue(constraintMap, "y", 0) * scale;
                    data.offsetScaleX = this.getValue(constraintMap, "scaleX", 0);
                    data.offsetScaleY = this.getValue(constraintMap, "scaleY", 0);
                    data.offsetShearY = this.getValue(constraintMap, "shearY", 0);
                    data.rotateMix = this.getValue(constraintMap, "rotateMix", 1);
                    data.translateMix = this.getValue(constraintMap, "translateMix", 1);
                    data.scaleMix = this.getValue(constraintMap, "scaleMix", 1);
                    data.shearMix = this.getValue(constraintMap, "shearMix", 1);
                    skeletonData.transformConstraints.push(data);
                }
            }
            if (root.path) {
                for (var i = 0; i < root.path.length; i++) {
                    var constraintMap = root.path[i];
                    var data = new spine.PathConstraintData(constraintMap.name);
                    data.order = this.getValue(constraintMap, "order", 0);
                    data.skinRequired = this.getValue(constraintMap, "skin", false);
                    for (var j = 0; j < constraintMap.bones.length; j++) {
                        var boneName = constraintMap.bones[j];
                        var bone = skeletonData.findBone(boneName);
                        if (bone == null)
                            throw new Error("Transform constraint bone not found: " + boneName);
                        data.bones.push(bone);
                    }
                    var targetName = constraintMap.target;
                    data.target = skeletonData.findSlot(targetName);
                    if (data.target == null)
                        throw new Error("Path target slot not found: " + targetName);
                    data.positionMode = SkeletonJson.positionModeFromString(this.getValue(constraintMap, "positionMode", "percent"));
                    data.spacingMode = SkeletonJson.spacingModeFromString(this.getValue(constraintMap, "spacingMode", "length"));
                    data.rotateMode = SkeletonJson.rotateModeFromString(this.getValue(constraintMap, "rotateMode", "tangent"));
                    data.offsetRotation = this.getValue(constraintMap, "rotation", 0);
                    data.position = this.getValue(constraintMap, "position", 0);
                    if (data.positionMode == spine.PositionMode.Fixed)
                        data.position *= scale;
                    data.spacing = this.getValue(constraintMap, "spacing", 0);
                    if (data.spacingMode == spine.SpacingMode.Length || data.spacingMode == spine.SpacingMode.Fixed)
                        data.spacing *= scale;
                    data.rotateMix = this.getValue(constraintMap, "rotateMix", 1);
                    data.translateMix = this.getValue(constraintMap, "translateMix", 1);
                    skeletonData.pathConstraints.push(data);
                }
            }
            if (root.skins) {
                var skins = root.skins;
                var isArray = skins instanceof Array;
                if (!isArray) {
                    var skinArr = [];
                    for (var skinName in skins) {
                        skinArr.push({name: skinName, attachments: skins[skinName]});
                    }
                    skins = skinArr;
                }
                for (var i = 0; i < skins.length; i++) {
                    var skinMap = skins[i];
                    var skin = new spine.Skin(skinMap.name);
                    if (skinMap.bones) {
                        for (var ii = 0; ii < skinMap.bones.length; ii++) {
                            var bone = skeletonData.findBone(skinMap.bones[ii]);
                            if (bone == null)
                                throw new Error("Skin bone not found: " + skinMap.bones[i]);
                            skin.bones.push(bone);
                        }
                    }
                    if (skinMap.ik) {
                        for (var ii = 0; ii < skinMap.ik.length; ii++) {
                            var constraint = skeletonData.findIkConstraint(skinMap.ik[ii]);
                            if (constraint == null)
                                throw new Error("Skin IK constraint not found: " + skinMap.ik[i]);
                            skin.constraints.push(constraint);
                        }
                    }
                    if (skinMap.transform) {
                        for (var ii = 0; ii < skinMap.transform.length; ii++) {
                            var constraint = skeletonData.findTransformConstraint(skinMap.transform[ii]);
                            if (constraint == null)
                                throw new Error("Skin transform constraint not found: " + skinMap.transform[i]);
                            skin.constraints.push(constraint);
                        }
                    }
                    if (skinMap.path) {
                        for (var ii = 0; ii < skinMap.path.length; ii++) {
                            var constraint = skeletonData.findPathConstraint(skinMap.path[ii]);
                            if (constraint == null)
                                throw new Error("Skin path constraint not found: " + skinMap.path[i]);
                            skin.constraints.push(constraint);
                        }
                    }
                    for (var slotName in skinMap.attachments) {
                        var slot = skeletonData.findSlot(slotName);
                        if (slot == null)
                            throw new Error("Slot not found: " + slotName);
                        var slotMap = skinMap.attachments[slotName];
                        for (var entryName in slotMap) {
                            var attachment = this.readAttachment(slotMap[entryName], skin, slot.index, entryName, skeletonData);
                            if (attachment != null)
                                skin.setAttachment(slot.index, entryName, attachment);
                        }
                    }
                    skeletonData.skins.push(skin);
                    if (skin.name == "default")
                        skeletonData.defaultSkin = skin;
                }
            }
            for (var i = 0, n = this.linkedMeshes.length; i < n; i++) {
                var linkedMesh = this.linkedMeshes[i];
                var skin = linkedMesh.skin == null ? skeletonData.defaultSkin : skeletonData.findSkin(linkedMesh.skin);
                if (skin == null)
                    throw new Error("Skin not found: " + linkedMesh.skin);
                var parent_6 = skin.getAttachment(linkedMesh.slotIndex, linkedMesh.parent);
                if (parent_6 == null)
                    throw new Error("Parent mesh not found: " + linkedMesh.parent);
                linkedMesh.mesh.deformAttachment = linkedMesh.inheritDeform ? parent_6 : linkedMesh.mesh;
                linkedMesh.mesh.setParentMesh(parent_6);
                linkedMesh.mesh.updateUVs();
            }
            this.linkedMeshes.length = 0;
            if (root.events) {
                for (var eventName in root.events) {
                    var eventMap = root.events[eventName];
                    var data = new spine.EventData(eventName);
                    data.intValue = this.getValue(eventMap, "int", 0);
                    data.floatValue = this.getValue(eventMap, "float", 0);
                    data.stringValue = this.getValue(eventMap, "string", "");
                    data.audioPath = this.getValue(eventMap, "audio", null);
                    if (data.audioPath != null) {
                        data.volume = this.getValue(eventMap, "volume", 1);
                        data.balance = this.getValue(eventMap, "balance", 0);
                    }
                    skeletonData.events.push(data);
                }
            }
            if (root.animations) {
                for (var animationName in root.animations) {
                    var animationMap = root.animations[animationName];
                    this.readAnimation(animationMap, animationName, skeletonData);
                }
            }
            return skeletonData;
        };
        public readAttachment(map, skin, slotIndex, name, skeletonData) {
            var scale = this.scale;
            name = this.getValue(map, "name", name);
            var type = this.getValue(map, "type", "region");
            switch (type) {
                case "region": {
                    var path = this.getValue(map, "path", name);
                    var region = this.attachmentLoader.newRegionAttachment(skin, name, path);
                    if (region == null)
                        return null;
                    region.path = path;
                    region.x = this.getValue(map, "x", 0) * scale;
                    region.y = this.getValue(map, "y", 0) * scale;
                    region.scaleX = this.getValue(map, "scaleX", 1);
                    region.scaleY = this.getValue(map, "scaleY", 1);
                    region.rotation = this.getValue(map, "rotation", 0);
                    region.width = map.width * scale;
                    region.height = map.height * scale;
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        region.color.setFromString(color);
                    region.updateOffset();
                    return region;
                }
                case "boundingbox": {
                    var box = this.attachmentLoader.newBoundingBoxAttachment(skin, name);
                    if (box == null)
                        return null;
                    this.readVertices(map, box, map.vertexCount << 1);
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        box.color.setFromString(color);
                    return box;
                }
                case "mesh":
                case "linkedmesh": {
                    var path = this.getValue(map, "path", name);
                    var mesh = this.attachmentLoader.newMeshAttachment(skin, name, path);
                    if (mesh == null)
                        return null;
                    mesh.path = path;
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        mesh.color.setFromString(color);
                    mesh.width = this.getValue(map, "width", 0) * scale;
                    mesh.height = this.getValue(map, "height", 0) * scale;
                    var parent_7 = this.getValue(map, "parent", null);
                    if (parent_7 != null) {
                        this.linkedMeshes.push(new LinkedMesh(mesh, this.getValue(map, "skin", null), slotIndex, parent_7, this.getValue(map, "deform", true)));
                        return mesh;
                    }
                    var uvs = map.uvs;
                    this.readVertices(map, mesh, uvs.length);
                    mesh.triangles = map.triangles;
                    mesh.regionUVs = uvs;
                    mesh.updateUVs();
                    mesh.edges = this.getValue(map, "edges", null);
                    mesh.hullLength = this.getValue(map, "hull", 0) * 2;
                    return mesh;
                }
                case "path": {
                    var path = this.attachmentLoader.newPathAttachment(skin, name);
                    if (path == null)
                        return null;
                    path.closed = this.getValue(map, "closed", false);
                    path.constantSpeed = this.getValue(map, "constantSpeed", true);
                    var vertexCount = map.vertexCount;
                    this.readVertices(map, path, vertexCount << 1);
                    var lengths = spine.Utils.newArray(vertexCount / 3, 0);
                    for (var i = 0; i < map.lengths.length; i++)
                        lengths[i] = map.lengths[i] * scale;
                    path.lengths = lengths;
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        path.color.setFromString(color);
                    return path;
                }
                case "point": {
                    var point = this.attachmentLoader.newPointAttachment(skin, name);
                    if (point == null)
                        return null;
                    point.x = this.getValue(map, "x", 0) * scale;
                    point.y = this.getValue(map, "y", 0) * scale;
                    point.rotation = this.getValue(map, "rotation", 0);
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        point.color.setFromString(color);
                    return point;
                }
                case "clipping": {
                    var clip = this.attachmentLoader.newClippingAttachment(skin, name);
                    if (clip == null)
                        return null;
                    var end = this.getValue(map, "end", null);
                    if (end != null) {
                        var slot = skeletonData.findSlot(end);
                        if (slot == null)
                            throw new Error("Clipping end slot not found: " + end);
                        clip.endSlot = slot;
                    }
                    var vertexCount = map.vertexCount;
                    this.readVertices(map, clip, vertexCount << 1);
                    var color = this.getValue(map, "color", null);
                    if (color != null)
                        clip.color.setFromString(color);
                    return clip;
                }
            }
            return null;
        };
        public readVertices(map, attachment, verticesLength) {
            var scale = this.scale;
            attachment.worldVerticesLength = verticesLength;
            var vertices = map.vertices;
            if (verticesLength == vertices.length) {
                var scaledVertices = spine.Utils.toFloatArray(vertices);
                if (scale != 1) {
                    for (var i = 0, n = vertices.length; i < n; i++)
                        scaledVertices[i] *= scale;
                }
                attachment.vertices = scaledVertices;
                return;
            }
            var weights = new Array();
            var bones = new Array();
            for (var i = 0, n = vertices.length; i < n;) {
                var boneCount = vertices[i++];
                bones.push(boneCount);
                for (var nn = i + boneCount * 4; i < nn; i += 4) {
                    bones.push(vertices[i]);
                    weights.push(vertices[i + 1] * scale);
                    weights.push(vertices[i + 2] * scale);
                    weights.push(vertices[i + 3]);
                }
            }
            attachment.bones = bones;
            attachment.vertices = spine.Utils.toFloatArray(weights);
        };
        public readAnimation(map, name, skeletonData) {
            var scale = this.scale;
            var timelines = new Array();
            var duration = 0;
            if (map.slots) {
                for (var slotName in map.slots) {
                    var slotMap = map.slots[slotName];
                    var slotIndex = skeletonData.findSlotIndex(slotName);
                    if (slotIndex == -1)
                        throw new Error("Slot not found: " + slotName);
                    for (var timelineName in slotMap) {
                        var timelineMap = slotMap[timelineName];
                        if (timelineName == "attachment") {
                            var timeline = new spine.AttachmentTimeline(timelineMap.length);
                            timeline.slotIndex = slotIndex;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                timeline.setFrame(frameIndex++, this.getValue(valueMap, "time", 0), valueMap.name);
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                        }
                        else if (timelineName == "color") {
                            var timeline = new spine.ColorTimeline(timelineMap.length);
                            timeline.slotIndex = slotIndex;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                var color = new spine.Color();
                                color.setFromString(valueMap.color);
                                timeline.setFrame(frameIndex, this.getValue(valueMap, "time", 0), color.r, color.g, color.b, color.a);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.ColorTimeline.ENTRIES]);
                        }
                        else if (timelineName == "twoColor") {
                            var timeline = new spine.TwoColorTimeline(timelineMap.length);
                            timeline.slotIndex = slotIndex;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                var light = new spine.Color();
                                var dark = new spine.Color();
                                light.setFromString(valueMap.light);
                                dark.setFromString(valueMap.dark);
                                timeline.setFrame(frameIndex, this.getValue(valueMap, "time", 0), light.r, light.g, light.b, light.a, dark.r, dark.g, dark.b);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.TwoColorTimeline.ENTRIES]);
                        }
                        else
                            throw new Error("Invalid timeline type for a slot: " + timelineName + " (" + slotName + ")");
                    }
                }
            }
            if (map.bones) {
                for (var boneName in map.bones) {
                    var boneMap = map.bones[boneName];
                    var boneIndex = skeletonData.findBoneIndex(boneName);
                    if (boneIndex == -1)
                        throw new Error("Bone not found: " + boneName);
                    for (var timelineName in boneMap) {
                        var timelineMap = boneMap[timelineName];
                        if (timelineName === "rotate") {
                            var timeline = new spine.RotateTimeline(timelineMap.length);
                            timeline.boneIndex = boneIndex;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                timeline.setFrame(frameIndex, this.getValue(valueMap, "time", 0), this.getValue(valueMap, "angle", 0));
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.RotateTimeline.ENTRIES]);
                        }
                        else if (timelineName === "translate" || timelineName === "scale" || timelineName === "shear") {
                            var timeline = null;
                            var timelineScale = 1, defaultValue = 0;
                            if (timelineName === "scale") {
                                timeline = new spine.ScaleTimeline(timelineMap.length);
                                defaultValue = 1;
                            }
                            else if (timelineName === "shear")
                                timeline = new spine.ShearTimeline(timelineMap.length);
                            else {
                                timeline = new spine.TranslateTimeline(timelineMap.length);
                                timelineScale = scale;
                            }
                            timeline.boneIndex = boneIndex;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                var x = this.getValue(valueMap, "x", defaultValue), y = this.getValue(valueMap, "y", defaultValue);
                                timeline.setFrame(frameIndex, this.getValue(valueMap, "time", 0), x * timelineScale, y * timelineScale);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.TranslateTimeline.ENTRIES]);
                        }
                        else
                            throw new Error("Invalid timeline type for a bone: " + timelineName + " (" + boneName + ")");
                    }
                }
            }
            if (map.ik) {
                for (var constraintName in map.ik) {
                    var constraintMap = map.ik[constraintName];
                    var constraint = skeletonData.findIkConstraint(constraintName);
                    var timeline = new spine.IkConstraintTimeline(constraintMap.length);
                    timeline.ikConstraintIndex = skeletonData.ikConstraints.indexOf(constraint);
                    var frameIndex = 0;
                    for (var i = 0; i < constraintMap.length; i++) {
                        var valueMap = constraintMap[i];
                        timeline.setFrame(frameIndex, this.getValue(valueMap, "time", 0), this.getValue(valueMap, "mix", 1), this.getValue(valueMap, "softness", 0) * scale, this.getValue(valueMap, "bendPositive", true) ? 1 : -1, this.getValue(valueMap, "compress", false), this.getValue(valueMap, "stretch", false));
                        this.readCurve(valueMap, timeline, frameIndex);
                        frameIndex++;
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.IkConstraintTimeline.ENTRIES]);
                }
            }
            if (map.transform) {
                for (var constraintName in map.transform) {
                    var constraintMap = map.transform[constraintName];
                    var constraint = skeletonData.findTransformConstraint(constraintName);
                    var timeline = new spine.TransformConstraintTimeline(constraintMap.length);
                    timeline.transformConstraintIndex = skeletonData.transformConstraints.indexOf(constraint);
                    var frameIndex = 0;
                    for (var i = 0; i < constraintMap.length; i++) {
                        var valueMap = constraintMap[i];
                        timeline.setFrame(frameIndex, this.getValue(valueMap, "time", 0), this.getValue(valueMap, "rotateMix", 1), this.getValue(valueMap, "translateMix", 1), this.getValue(valueMap, "scaleMix", 1), this.getValue(valueMap, "shearMix", 1));
                        this.readCurve(valueMap, timeline, frameIndex);
                        frameIndex++;
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.TransformConstraintTimeline.ENTRIES]);
                }
            }
            let mapPath = map.path || map.paths;
            if (mapPath) {
                for (var constraintName in mapPath) {
                    var constraintMap = mapPath[constraintName];
                    var index = skeletonData.findPathConstraintIndex(constraintName);
                    if (index == -1)
                        throw new Error("Path constraint not found: " + constraintName);
                    var data = skeletonData.pathConstraints[index];
                    for (var timelineName in constraintMap) {
                        var timelineMap = constraintMap[timelineName];
                        if (timelineName === "position" || timelineName === "spacing") {
                            var timeline = null;
                            var timelineScale = 1;
                            if (timelineName === "spacing") {
                                timeline = new spine.PathConstraintSpacingTimeline(timelineMap.length);
                                if (data.spacingMode == spine.SpacingMode.Length || data.spacingMode == spine.SpacingMode.Fixed)
                                    timelineScale = scale;
                            }
                            else {
                                timeline = new spine.PathConstraintPositionTimeline(timelineMap.length);
                                if (data.positionMode == spine.PositionMode.Fixed)
                                    timelineScale = scale;
                            }
                            timeline.pathConstraintIndex = index;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                timeline.setFrame(frameIndex, this.getValue(valueMap, "time", 0), this.getValue(valueMap, timelineName, 0) * timelineScale);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.PathConstraintPositionTimeline.ENTRIES]);
                        }
                        else if (timelineName === "mix") {
                            var timeline = new spine.PathConstraintMixTimeline(timelineMap.length);
                            timeline.pathConstraintIndex = index;
                            var frameIndex = 0;
                            for (var i = 0; i < timelineMap.length; i++) {
                                var valueMap = timelineMap[i];
                                timeline.setFrame(frameIndex, this.getValue(valueMap, "time", 0), this.getValue(valueMap, "rotateMix", 1), this.getValue(valueMap, "translateMix", 1));
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.PathConstraintMixTimeline.ENTRIES]);
                        }
                    }
                }
            }
            if (map.deform) {
                for (var deformName in map.deform) {
                    var deformMap = map.deform[deformName];
                    var skin = skeletonData.findSkin(deformName);
                    if (skin == null)
                        throw new Error("Skin not found: " + deformName);
                    for (var slotName in deformMap) {
                        var slotMap = deformMap[slotName];
                        var slotIndex = skeletonData.findSlotIndex(slotName);
                        if (slotIndex == -1)
                            throw new Error("Slot not found: " + slotMap.name);
                        for (var timelineName in slotMap) {
                            var timelineMap = slotMap[timelineName];
                            var attachment = skin.getAttachment(slotIndex, timelineName);
                            if (attachment == null) {
                                // throw new Error("Deform attachment not found: " + timelineMap.name);
                                continue;
                            }
                            var weighted = attachment.bones != null;
                            var vertices = attachment.vertices;
                            var deformLength = weighted ? vertices.length / 3 * 2 : vertices.length;
                            var timeline = new spine.DeformTimeline(timelineMap.length);
                            timeline.slotIndex = slotIndex;
                            timeline.attachment = attachment;
                            var frameIndex = 0;
                            for (var j = 0; j < timelineMap.length; j++) {
                                var valueMap = timelineMap[j];
                                var deform = void 0;
                                var verticesValue = this.getValue(valueMap, "vertices", null);
                                if (verticesValue == null)
                                    deform = weighted ? spine.Utils.newFloatArray(deformLength) : vertices;
                                else {
                                    deform = spine.Utils.newFloatArray(deformLength);
                                    var start = this.getValue(valueMap, "offset", 0);
                                    spine.Utils.arrayCopy(verticesValue, 0, deform, start, verticesValue.length);
                                    if (scale != 1) {
                                        for (var i = start, n = i + verticesValue.length; i < n; i++)
                                            deform[i] *= scale;
                                    }
                                    if (!weighted) {
                                        for (var i = 0; i < deformLength; i++)
                                            deform[i] += vertices[i];
                                    }
                                }
                                timeline.setFrame(frameIndex, this.getValue(valueMap, "time", 0), deform);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                        }
                    }
                }
            }
            var drawOrderNode = map.drawOrder;
            if (drawOrderNode == null)
                drawOrderNode = map.draworder;
            if (drawOrderNode != null) {
                var timeline = new spine.DrawOrderTimeline(drawOrderNode.length);
                var slotCount = skeletonData.slots.length;
                var frameIndex = 0;
                for (var j = 0; j < drawOrderNode.length; j++) {
                    var drawOrderMap = drawOrderNode[j];
                    var drawOrder = null;
                    var offsets = this.getValue(drawOrderMap, "offsets", null);
                    if (offsets != null) {
                        drawOrder = spine.Utils.newArray(slotCount, -1);
                        var unchanged = spine.Utils.newArray(slotCount - offsets.length, 0);
                        var originalIndex = 0, unchangedIndex = 0;
                        for (var i = 0; i < offsets.length; i++) {
                            var offsetMap = offsets[i];
                            var slotIndex = skeletonData.findSlotIndex(offsetMap.slot);
                            if (slotIndex == -1)
                                throw new Error("Slot not found: " + offsetMap.slot);
                            while (originalIndex != slotIndex)
                                unchanged[unchangedIndex++] = originalIndex++;
                            drawOrder[originalIndex + offsetMap.offset] = originalIndex++;
                        }
                        while (originalIndex < slotCount)
                            unchanged[unchangedIndex++] = originalIndex++;
                        for (var i = slotCount - 1; i >= 0; i--)
                            if (drawOrder[i] == -1)
                                drawOrder[i] = unchanged[--unchangedIndex];
                    }
                    timeline.setFrame(frameIndex++, this.getValue(drawOrderMap, "time", 0), drawOrder);
                }
                timelines.push(timeline);
                duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
            }
            if (map.events) {
                var timeline = new spine.EventTimeline(map.events.length);
                var frameIndex = 0;
                for (var i = 0; i < map.events.length; i++) {
                    var eventMap = map.events[i];
                    var eventData = skeletonData.findEvent(eventMap.name);
                    if (eventData == null)
                        throw new Error("Event not found: " + eventMap.name);
                    var event_6 = new spine.Event(spine.Utils.toSinglePrecision(this.getValue(eventMap, "time", 0)), eventData);
                    event_6.intValue = this.getValue(eventMap, "int", eventData.intValue);
                    event_6.floatValue = this.getValue(eventMap, "float", eventData.floatValue);
                    event_6.stringValue = this.getValue(eventMap, "string", eventData.stringValue);
                    if (event_6.data.audioPath != null) {
                        event_6.volume = this.getValue(eventMap, "volume", 1);
                        event_6.balance = this.getValue(eventMap, "balance", 0);
                    }
                    timeline.setFrame(frameIndex++, event_6);
                }
                timelines.push(timeline);
                duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
            }
            if (isNaN(duration)) {
                throw new Error("Error while parsing animation, duration is NaN");
            }
            skeletonData.animations.push(new spine.Animation(name, timelines, duration));
        };
        public readCurve(map, timeline, frameIndex) {
            var curve = map.curve;
            if (!curve)
                return;
            if (curve == "stepped") {
                timeline.setStepped(frameIndex);
            } else if (Object.prototype.toString.call(curve) === '[object Array]') {
                timeline.setCurve(frameIndex, curve[0], curve[1], curve[2], curve[3]);
            } else {
                timeline.setCurve(frameIndex, curve, this.getValue(map, "c2", 0), this.getValue(map, "c3", 1), this.getValue(map, "c4", 1));
            }
        };
        public getValue(map, prop, defaultValue) {
            return map[prop] !== undefined ? map[prop] : defaultValue;
        };
        SkeletonJson.blendModeFromString = function (str) {
            str = str.toLowerCase();
            if (str == "normal")
                return spine.BlendMode.Normal;
            if (str == "additive")
                return spine.BlendMode.Additive;
            if (str == "multiply")
                return spine.BlendMode.Multiply;
            if (str == "screen")
                return spine.BlendMode.Screen;
            throw new Error("Unknown blend mode: " + str);
        };
        SkeletonJson.positionModeFromString = function (str) {
            str = str.toLowerCase();
            if (str == "fixed")
                return spine.PositionMode.Fixed;
            if (str == "percent")
                return spine.PositionMode.Percent;
            throw new Error("Unknown position mode: " + str);
        };
        SkeletonJson.spacingModeFromString = function (str) {
            str = str.toLowerCase();
            if (str == "length")
                return spine.SpacingMode.Length;
            if (str == "fixed")
                return spine.SpacingMode.Fixed;
            if (str == "percent")
                return spine.SpacingMode.Percent;
            throw new Error("Unknown position mode: " + str);
        };
        SkeletonJson.rotateModeFromString = function (str) {
            str = str.toLowerCase();
            if (str == "tangent")
                return spine.RotateMode.Tangent;
            if (str == "chain")
                return spine.RotateMode.Chain;
            if (str == "chainscale")
                return spine.RotateMode.ChainScale;
            throw new Error("Unknown rotate mode: " + str);
        };
        SkeletonJson.transformModeFromString = function (str) {
            str = str.toLowerCase();
            if (str == "normal")
                return spine.TransformMode.Normal;
            if (str == "onlytranslation")
                return spine.TransformMode.OnlyTranslation;
            if (str == "norotationorreflection")
                return spine.TransformMode.NoRotationOrReflection;
            if (str == "noscale")
                return spine.TransformMode.NoScale;
            if (str == "noscaleorreflection")
                return spine.TransformMode.NoScaleOrReflection;
            throw new Error("Unknown transform mode: " + str);
        };
        return SkeletonJson;
    }