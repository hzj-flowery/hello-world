import { Animation } from "./Animation";
import { MixBlend } from "./MixBlend";
import { TimelineType } from "./TimelineType";
import { TranslateTimeline } from "./TranslateTimeline";

export class ShearTimeline extends TranslateTimeline {
    constructor(frameCount) {
        super(frameCount);
    }
    public getPropertyId() {
        return (TimelineType.shear << 24) + this.boneIndex;
    };
    public apply(skeleton, lastTime, time, events, alpha, blend, direction) {
        var frames = this.frames;
        var bone = skeleton.bones[this.boneIndex];
        if (!bone.active)
            return;
        if (time < frames[0]) {
            switch (blend) {
                case MixBlend.setup:
                    bone.shearX = bone.data.shearX;
                    bone.shearY = bone.data.shearY;
                    return;
                case MixBlend.first:
                    bone.shearX += (bone.data.shearX - bone.shearX) * alpha;
                    bone.shearY += (bone.data.shearY - bone.shearY) * alpha;
            }
            return;
        }
        var x = 0, y = 0;
        if (time >= frames[frames.length - ShearTimeline.ENTRIES]) {
            x = frames[frames.length + ShearTimeline.PREV_X];
            y = frames[frames.length + ShearTimeline.PREV_Y];
        }
        else {
            var frame = Animation.binarySearch(frames, time, ShearTimeline.ENTRIES);
            x = frames[frame + ShearTimeline.PREV_X];
            y = frames[frame + ShearTimeline.PREV_Y];
            var frameTime = frames[frame];
            var percent = this.getCurvePercent(frame / ShearTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + ShearTimeline.PREV_TIME] - frameTime));
            x = x + (frames[frame + ShearTimeline.X] - x) * percent;
            y = y + (frames[frame + ShearTimeline.Y] - y) * percent;
        }
        switch (blend) {
            case MixBlend.setup:
                bone.shearX = bone.data.shearX + x * alpha;
                bone.shearY = bone.data.shearY + y * alpha;
                break;
            case MixBlend.first:
            case MixBlend.replace:
                bone.shearX += (bone.data.shearX + x - bone.shearX) * alpha;
                bone.shearY += (bone.data.shearY + y - bone.shearY) * alpha;
                break;
            case MixBlend.add:
                bone.shearX += x * alpha;
                bone.shearY += y * alpha;
        }
    };
}