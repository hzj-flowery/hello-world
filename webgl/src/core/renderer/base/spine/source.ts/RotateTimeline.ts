import { Animation } from "./Animation";
import { CurveTimeline } from "./CurveTimeline";
import { MixBlend } from "./MixBlend";
import { TimelineType } from "./TimelineType";

export class RotateTimeline extends CurveTimeline{
    
    public frames:Array<any>;
    public boneIndex:number;
    constructor(frameCount) {
        super(frameCount);
        this.frames = spine.Utils.newFloatArray(frameCount << 1);
    }
    getPropertyId() {
        return (TimelineType.rotate << 24) + this.boneIndex;
    };
    setFrame(frameIndex, time, degrees) {
        frameIndex <<= 1;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + RotateTimeline.ROTATION] = degrees;
    };
    apply(skeleton, lastTime, time, events, alpha, blend, direction) {
        var frames = this.frames;
        var bone = skeleton.bones[this.boneIndex];
        if (!bone.active)
            return;
        if (time < frames[0]) {
            switch (blend) {
                case MixBlend.setup:
                    bone.rotation = bone.data.rotation;
                    return;
                case MixBlend.first:
                    var r_1 = bone.data.rotation - bone.rotation;
                    bone.rotation += (r_1 - (16384 - ((16384.499999999996 - r_1 / 360) | 0)) * 360) * alpha;
            }
            return;
        }
        if (time >= frames[frames.length - RotateTimeline.ENTRIES]) {
            var r_2 = frames[frames.length + RotateTimeline.PREV_ROTATION];
            switch (blend) {
                case MixBlend.setup:
                    bone.rotation = bone.data.rotation + r_2 * alpha;
                    break;
                case MixBlend.first:
                case MixBlend.replace:
                    r_2 += bone.data.rotation - bone.rotation;
                    r_2 -= (16384 - ((16384.499999999996 - r_2 / 360) | 0)) * 360;
                case MixBlend.add:
                    bone.rotation += r_2 * alpha;
            }
            return;
        }
        var frame = Animation.binarySearch(frames, time, RotateTimeline.ENTRIES);
        var prevRotation = frames[frame + RotateTimeline.PREV_ROTATION];
        var frameTime = frames[frame];
        var percent = this.getCurvePercent((frame >> 1) - 1, 1 - (time - frameTime) / (frames[frame + RotateTimeline.PREV_TIME] - frameTime));
        var r = frames[frame + RotateTimeline.ROTATION] - prevRotation;
        r = prevRotation + (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * percent;
        switch (blend) {
            case MixBlend.setup:
                bone.rotation = bone.data.rotation + (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * alpha;
                break;
            case MixBlend.first:
            case MixBlend.replace:
                r += bone.data.rotation - bone.rotation;
            case MixBlend.add:
                bone.rotation += (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * alpha;
        }
    };
    static ENTRIES = 2;
    static PREV_TIME = -2;
    static PREV_ROTATION = -1;
    static ROTATION = 1;
}