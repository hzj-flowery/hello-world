import { CurveTimeline } from "./CurveTimeline"
import { Animation } from "./Animation"
import { MixBlend } from "./MixBlend"
import { TimelineType } from "./TimelineType"
import { Event } from "./Event"
import { Utils } from "./Utils"
import { Attachment } from "./Attachment"
import { VertexAttachment } from "./VertexAttachment"
export class DeformTimeline extends CurveTimeline{

        
        constructor(frameCount){
            super( frameCount);
 var _this = this;

            _this.frames = Utils.newFloatArray(frameCount);
            _this.frameVertices = new Array(frameCount);
            if (zeros == null)
                zeros = Utils.newFloatArray(64);
            return _this;
        }
        public getPropertyId() {
            return (TimelineType.deform << 27) + +this.attachment.id + this.slotIndex;
        };
        public setFrame(frameIndex, time, vertices) {
            this.frames[frameIndex] = time;
            this.frameVertices[frameIndex] = vertices;
        };
        public apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            var slot = skeleton.slots[this.slotIndex];
            if (!slot.bone.active)
                return;
            var slotAttachment = slot.getAttachment();
            if (!(slotAttachment instanceof VertexAttachment) || !(slotAttachment.deformAttachment == this.attachment))
                return;
            var deformArray = slot.deform;
            if (deformArray.length == 0)
                blend = MixBlend.setup;
            var frameVertices = this.frameVertices;
            var vertexCount = frameVertices[0].length;
            var frames = this.frames;
            if (time < frames[0]) {
                var vertexAttachment = slotAttachment;
                switch (blend) {
                    case MixBlend.setup:
                        deformArray.length = 0;
                        return;
                    case MixBlend.first:
                        if (alpha == 1) {
                            deformArray.length = 0;
                            break;
                        }
                        var deform_1 = Utils.setArraySize(deformArray, vertexCount);
                        if (vertexAttachment.bones == null) {
                            var setupVertices = vertexAttachment.vertices;
                            for (var i = 0; i < vertexCount; i++)
                                deform_1[i] += (setupVertices[i] - deform_1[i]) * alpha;
                        }
                        else {
                            alpha = 1 - alpha;
                            for (var i = 0; i < vertexCount; i++)
                                deform_1[i] *= alpha;
                        }
                }
                return;
            }
            var deform = Utils.setArraySize(deformArray, vertexCount);
            if (time >= frames[frames.length - 1]) {
                var lastVertices = frameVertices[frames.length - 1];
                if (alpha == 1) {
                    if (blend == MixBlend.add) {
                        var vertexAttachment = slotAttachment;
                        if (vertexAttachment.bones == null) {
                            var setupVertices = vertexAttachment.vertices;
                            for (var i_1 = 0; i_1 < vertexCount; i_1++) {
                                deform[i_1] += lastVertices[i_1] - setupVertices[i_1];
                            }
                        }
                        else {
                            for (var i_2 = 0; i_2 < vertexCount; i_2++)
                                deform[i_2] += lastVertices[i_2];
                        }
                    }
                    else {
                        Utils.arrayCopy(lastVertices, 0, deform, 0, vertexCount);
                    }
                }
                else {
                    switch (blend) {
                        case MixBlend.setup: {
                            var vertexAttachment_1 = slotAttachment;
                            if (vertexAttachment_1.bones == null) {
                                var setupVertices = vertexAttachment_1.vertices;
                                for (var i_3 = 0; i_3 < vertexCount; i_3++) {
                                    var setup = setupVertices[i_3];
                                    deform[i_3] = setup + (lastVertices[i_3] - setup) * alpha;
                                }
                            }
                            else {
                                for (var i_4 = 0; i_4 < vertexCount; i_4++)
                                    deform[i_4] = lastVertices[i_4] * alpha;
                            }
                            break;
                        }
                        case MixBlend.first:
                        case MixBlend.replace:
                            for (var i_5 = 0; i_5 < vertexCount; i_5++)
                                deform[i_5] += (lastVertices[i_5] - deform[i_5]) * alpha;
                        case MixBlend.add:
                            var vertexAttachment = slotAttachment;
                            if (vertexAttachment.bones == null) {
                                var setupVertices = vertexAttachment.vertices;
                                for (var i_6 = 0; i_6 < vertexCount; i_6++) {
                                    deform[i_6] += (lastVertices[i_6] - setupVertices[i_6]) * alpha;
                                }
                            }
                            else {
                                for (var i_7 = 0; i_7 < vertexCount; i_7++)
                                    deform[i_7] += lastVertices[i_7] * alpha;
                            }
                    }
                }
                return;
            }
            var frame = Animation.binarySearch(frames, time);
            var prevVertices = frameVertices[frame - 1];
            var nextVertices = frameVertices[frame];
            var frameTime = frames[frame];
            var percent = this.getCurvePercent(frame - 1, 1 - (time - frameTime) / (frames[frame - 1] - frameTime));
            if (alpha == 1) {
                if (blend == MixBlend.add) {
                    var vertexAttachment = slotAttachment;
                    if (vertexAttachment.bones == null) {
                        var setupVertices = vertexAttachment.vertices;
                        for (var i_8 = 0; i_8 < vertexCount; i_8++) {
                            var prev = prevVertices[i_8];
                            deform[i_8] += prev + (nextVertices[i_8] - prev) * percent - setupVertices[i_8];
                        }
                    }
                    else {
                        for (var i_9 = 0; i_9 < vertexCount; i_9++) {
                            var prev = prevVertices[i_9];
                            deform[i_9] += prev + (nextVertices[i_9] - prev) * percent;
                        }
                    }
                }
                else {
                    for (var i_10 = 0; i_10 < vertexCount; i_10++) {
                        var prev = prevVertices[i_10];
                        deform[i_10] = prev + (nextVertices[i_10] - prev) * percent;
                    }
                }
            }
            else {
                switch (blend) {
                    case MixBlend.setup: {
                        var vertexAttachment_2 = slotAttachment;
                        if (vertexAttachment_2.bones == null) {
                            var setupVertices = vertexAttachment_2.vertices;
                            for (var i_11 = 0; i_11 < vertexCount; i_11++) {
                                var prev = prevVertices[i_11], setup = setupVertices[i_11];
                                deform[i_11] = setup + (prev + (nextVertices[i_11] - prev) * percent - setup) * alpha;
                            }
                        }
                        else {
                            for (var i_12 = 0; i_12 < vertexCount; i_12++) {
                                var prev = prevVertices[i_12];
                                deform[i_12] = (prev + (nextVertices[i_12] - prev) * percent) * alpha;
                            }
                        }
                        break;
                    }
                    case MixBlend.first:
                    case MixBlend.replace:
                        for (var i_13 = 0; i_13 < vertexCount; i_13++) {
                            var prev = prevVertices[i_13];
                            deform[i_13] += (prev + (nextVertices[i_13] - prev) * percent - deform[i_13]) * alpha;
                        }
                        break;
                    case MixBlend.add:
                        var vertexAttachment = slotAttachment;
                        if (vertexAttachment.bones == null) {
                            var setupVertices = vertexAttachment.vertices;
                            for (var i_14 = 0; i_14 < vertexCount; i_14++) {
                                var prev = prevVertices[i_14];
                                deform[i_14] += (prev + (nextVertices[i_14] - prev) * percent - setupVertices[i_14]) * alpha;
                            }
                        }
                        else {
                            for (var i_15 = 0; i_15 < vertexCount; i_15++) {
                                var prev = prevVertices[i_15];
                                deform[i_15] += (prev + (nextVertices[i_15] - prev) * percent) * alpha;
                            }
                        }
                }
            }
        };
       
    }
