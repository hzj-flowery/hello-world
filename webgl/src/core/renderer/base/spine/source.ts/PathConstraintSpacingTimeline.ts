import { Animation } from "./Animation";
import { MixBlend } from "./MixBlend";
import { PathConstraintPositionTimeline } from "./PathConstraintPositionTimeline";
import { TimelineType } from "./TimelineType";

export class PathConstraintSpacingTimeline extends PathConstraintPositionTimeline {

    constructor(frameCount) {
        super(frameCount);
    }
    public getPropertyId() {
        return (TimelineType.pathConstraintSpacing << 24) + this.pathConstraintIndex;
    };
    public apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
        var frames = this.frames;
        var constraint = skeleton.pathConstraints[this.pathConstraintIndex];
        if (!constraint.active)
            return;
        if (time < frames[0]) {
            switch (blend) {
                case MixBlend.setup:
                    constraint.spacing = constraint.data.spacing;
                    return;
                case MixBlend.first:
                    constraint.spacing += (constraint.data.spacing - constraint.spacing) * alpha;
            }
            return;
        }
        var spacing = 0;
        if (time >= frames[frames.length - PathConstraintSpacingTimeline.ENTRIES])
            spacing = frames[frames.length + PathConstraintSpacingTimeline.PREV_VALUE];
        else {
            var frame = Animation.binarySearch(frames, time, PathConstraintSpacingTimeline.ENTRIES);
            spacing = frames[frame + PathConstraintSpacingTimeline.PREV_VALUE];
            var frameTime = frames[frame];
            var percent = this.getCurvePercent(frame / PathConstraintSpacingTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + PathConstraintSpacingTimeline.PREV_TIME] - frameTime));
            spacing += (frames[frame + PathConstraintSpacingTimeline.VALUE] - spacing) * percent;
        }
        if (blend == MixBlend.setup)
            constraint.spacing = constraint.data.spacing + (spacing - constraint.data.spacing) * alpha;
        else
            constraint.spacing += (spacing - constraint.spacing) * alpha;
    };
}