import { CurveTimeline } from "./CurveTimeline"
import { Animation } from "./Animation"
import { Event } from "./Event"
import { PathConstraint } from "./PathConstraint"
import { Utils } from "./Utils"
export class PathConstraintPositionTimeline extends CurveTimeline{

        
        constructor(frameCount){
            super( frameCount);
 var _this = this;

            _this.frames = Utils.newFloatArray(frameCount * PathConstraintPositionTimeline.ENTRIES);
            return _this;
        }
        public getPropertyId() {
            return (TimelineType.pathConstraintPosition << 24) + this.pathConstraintIndex;
        };
        public setFrame(frameIndex, time, value) {
            frameIndex *= PathConstraintPositionTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + PathConstraintPositionTimeline.VALUE] = value;
        };
        public apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            var frames = this.frames;
            var constraint = skeleton.pathConstraints[this.pathConstraintIndex];
            if (!constraint.active)
                return;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        constraint.position = constraint.data.position;
                        return;
                    case MixBlend.first:
                        constraint.position += (constraint.data.position - constraint.position) * alpha;
                }
                return;
            }
            var position = 0;
            if (time >= frames[frames.length - PathConstraintPositionTimeline.ENTRIES])
                position = frames[frames.length + PathConstraintPositionTimeline.PREV_VALUE];
            else {
                var frame = Animation.binarySearch(frames, time, PathConstraintPositionTimeline.ENTRIES);
                position = frames[frame + PathConstraintPositionTimeline.PREV_VALUE];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / PathConstraintPositionTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + PathConstraintPositionTimeline.PREV_TIME] - frameTime));
                position += (frames[frame + PathConstraintPositionTimeline.VALUE] - position) * percent;
            }
            if (blend == MixBlend.setup)
                constraint.position = constraint.data.position + (position - constraint.data.position) * alpha;
            else
                constraint.position += (position - constraint.position) * alpha;
        };public static ENTRIES = 2;
public static PREV_TIME = -2;
public static PREV_VALUE = -1;
public static VALUE = 1;

       
    }
