import { Animation } from "./Animation";
import { CurveTimeline } from "./CurveTimeline";
import { MixBlend } from "./MixBlend";
import { TimelineType } from "./TimelineType";

export class TranslateTimeline extends CurveTimeline{
    static ENTRIES = 3;
    static PREV_TIME = -3;
    static PREV_X = -2;
    static PREV_Y = -1;
    static X = 1;
    static Y = 2;
    public frames:Array<any>;
    public boneIndex:number;
    constructor(frameCount) {
        super(frameCount);
        this.frames = spine.Utils.newFloatArray(frameCount * TranslateTimeline.ENTRIES);
    }
    public getPropertyId () {
        return (TimelineType.translate << 24) + this.boneIndex;
    };
    public setFrame (frameIndex, time, x, y) {
        frameIndex *= TranslateTimeline.ENTRIES;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + TranslateTimeline.X] = x;
        this.frames[frameIndex + TranslateTimeline.Y] = y;
    };
    public apply (skeleton, lastTime, time, events, alpha, blend, direction) {
        var frames = this.frames;
        var bone = skeleton.bones[this.boneIndex];
        if (!bone.active)
            return;
        if (time < frames[0]) {
            switch (blend) {
                case MixBlend.setup:
                    bone.x = bone.data.x;
                    bone.y = bone.data.y;
                    return;
                case MixBlend.first:
                    bone.x += (bone.data.x - bone.x) * alpha;
                    bone.y += (bone.data.y - bone.y) * alpha;
            }
            return;
        }
        var x = 0, y = 0;
        if (time >= frames[frames.length - TranslateTimeline.ENTRIES]) {
            x = frames[frames.length + TranslateTimeline.PREV_X];
            y = frames[frames.length + TranslateTimeline.PREV_Y];
        }
        else {
            var frame = Animation.binarySearch(frames, time, TranslateTimeline.ENTRIES);
            x = frames[frame + TranslateTimeline.PREV_X];
            y = frames[frame + TranslateTimeline.PREV_Y];
            var frameTime = frames[frame];
            var percent = this.getCurvePercent(frame / TranslateTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + TranslateTimeline.PREV_TIME] - frameTime));
            x += (frames[frame + TranslateTimeline.X] - x) * percent;
            y += (frames[frame + TranslateTimeline.Y] - y) * percent;
        }
        switch (blend) {
            case MixBlend.setup:
                bone.x = bone.data.x + x * alpha;
                bone.y = bone.data.y + y * alpha;
                break;
            case MixBlend.first:
            case MixBlend.replace:
                bone.x += (bone.data.x + x - bone.x) * alpha;
                bone.y += (bone.data.y + y - bone.y) * alpha;
                break;
            case MixBlend.add:
                bone.x += x * alpha;
                bone.y += y * alpha;
        }
    };
    
}