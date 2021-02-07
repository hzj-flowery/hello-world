import { Animation } from "./Animation";
import { CurveTimeline } from "./CurveTimeline";
import { MixBlend } from "./MixBlend";
import { TimelineType } from "./TimelineType";

export class PathConstraintMixTimeline extends CurveTimeline {

    static ENTRIES = 3;
    static PREV_TIME = -3;
    static PREV_ROTATE = -2;
    static PREV_TRANSLATE = -1;
    static ROTATE = 1;
    static TRANSLATE = 2;
    public frames: Array<any>;
    public pathConstraintIndex: number;

    constructor(frameCount) {
        super(frameCount);
        this.frames = spine.Utils.newFloatArray(frameCount * PathConstraintMixTimeline.ENTRIES);
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

}