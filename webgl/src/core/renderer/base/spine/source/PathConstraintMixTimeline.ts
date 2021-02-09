import { CurveTimeline } from "./CurveTimeline"
import { Animation } from "./Animation"
import { MixBlend } from "./MixBlend"
import { TimelineType } from "./TimelineType"
import { Event } from "./Event"
import { PathConstraint } from "./PathConstraint"
import { Utils } from "./Utils"
export class PathConstraintMixTimeline extends CurveTimeline {


    constructor(frameCount) {
        super(frameCount);
        var _this = this;

        _this.frames = Utils.newFloatArray(frameCount * PathConstraintMixTimeline.ENTRIES);
        return _this;
    }
    public getPropertyId() {
        return (TimelineType.pathConstraintMix << 24) + this.pathConstraintIndex;
    };
    public setFrame(frameIndex, time, rotateMix, translateMix) {
        frameIndex *= PathConstraintMixTimeline.ENTRIES;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + PathConstraintMixTimeline.ROTATE] = rotateMix;
        this.frames[frameIndex + PathConstraintMixTimeline.TRANSLATE] = translateMix;
    };
    public apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
        var frames = this.frames;
        var constraint = skeleton.pathConstraints[this.pathConstraintIndex];
        if (!constraint.active)
            return;
        if (time < frames[0]) {
            switch (blend) {
                case MixBlend.setup:
                    constraint.rotateMix = constraint.data.rotateMix;
                    constraint.translateMix = constraint.data.translateMix;
                    return;
                case MixBlend.first:
                    constraint.rotateMix += (constraint.data.rotateMix - constraint.rotateMix) * alpha;
                    constraint.translateMix += (constraint.data.translateMix - constraint.translateMix) * alpha;
            }
            return;
        }
        var rotate = 0, translate = 0;
        if (time >= frames[frames.length - PathConstraintMixTimeline.ENTRIES]) {
            rotate = frames[frames.length + PathConstraintMixTimeline.PREV_ROTATE];
            translate = frames[frames.length + PathConstraintMixTimeline.PREV_TRANSLATE];
        }
        else {
            var frame = Animation.binarySearch(frames, time, PathConstraintMixTimeline.ENTRIES);
            rotate = frames[frame + PathConstraintMixTimeline.PREV_ROTATE];
            translate = frames[frame + PathConstraintMixTimeline.PREV_TRANSLATE];
            var frameTime = frames[frame];
            var percent = this.getCurvePercent(frame / PathConstraintMixTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + PathConstraintMixTimeline.PREV_TIME] - frameTime));
            rotate += (frames[frame + PathConstraintMixTimeline.ROTATE] - rotate) * percent;
            translate += (frames[frame + PathConstraintMixTimeline.TRANSLATE] - translate) * percent;
        }
        if (blend == MixBlend.setup) {
            constraint.rotateMix = constraint.data.rotateMix + (rotate - constraint.data.rotateMix) * alpha;
            constraint.translateMix = constraint.data.translateMix + (translate - constraint.data.translateMix) * alpha;
        }
        else {
            constraint.rotateMix += (rotate - constraint.rotateMix) * alpha;
            constraint.translateMix += (translate - constraint.translateMix) * alpha;
        }
    };
    public static ENTRIES = 3;
    public static PREV_TIME = -3;
    public static PREV_ROTATE = -2;
    public static PREV_TRANSLATE = -1;
    public static ROTATE = 1;
    public static TRANSLATE = 2;


}
