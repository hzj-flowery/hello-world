import { Animation } from "./Animation";
import { CurveTimeline } from "./CurveTimeline"
import { MixBlend } from "./MixBlend";
import { TimelineType } from "./TimelineType";

export class ColorTimeline extends CurveTimeline {

    static ENTRIES = 5;
    static PREV_TIME = -5;
    static PREV_R = -4;
    static PREV_G = -3;
    static PREV_B = -2;
    static PREV_A = -1;
    static R = 1;
    static G = 2;
    static B = 3;
    static A = 4;

    public frames: Array<any>;
    public slotIndex: number;
    constructor(frameCount) {
        super(frameCount);
        this.frames = spine.Utils.newFloatArray(frameCount * ColorTimeline.ENTRIES);
    }
    public getPropertyId() {
        return (TimelineType.color << 24) + this.slotIndex;
    };
    public setFrame(frameIndex, time, r, g, b, a) {
        frameIndex *= ColorTimeline.ENTRIES;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + ColorTimeline.R] = r;
        this.frames[frameIndex + ColorTimeline.G] = g;
        this.frames[frameIndex + ColorTimeline.B] = b;
        this.frames[frameIndex + ColorTimeline.A] = a;
    };
    public apply(skeleton, lastTime, time, events, alpha, blend, direction) {
        var slot = skeleton.slots[this.slotIndex];
        if (!slot.bone.active)
            return;
        var frames = this.frames;
        if (time < frames[0]) {
            switch (blend) {
                case MixBlend.setup:
                    slot.color.setFromColor(slot.data.color);
                    return;
                case MixBlend.first:
                    var color = slot.color, setup = slot.data.color;
                    color.add((setup.r - color.r) * alpha, (setup.g - color.g) * alpha, (setup.b - color.b) * alpha, (setup.a - color.a) * alpha);
            }
            return;
        }
        var r = 0, g = 0, b = 0, a = 0;
        if (time >= frames[frames.length - ColorTimeline.ENTRIES]) {
            var i = frames.length;
            r = frames[i + ColorTimeline.PREV_R];
            g = frames[i + ColorTimeline.PREV_G];
            b = frames[i + ColorTimeline.PREV_B];
            a = frames[i + ColorTimeline.PREV_A];
        }
        else {
            var frame = Animation.binarySearch(frames, time, ColorTimeline.ENTRIES);
            r = frames[frame + ColorTimeline.PREV_R];
            g = frames[frame + ColorTimeline.PREV_G];
            b = frames[frame + ColorTimeline.PREV_B];
            a = frames[frame + ColorTimeline.PREV_A];
            var frameTime = frames[frame];
            var percent = this.getCurvePercent(frame / ColorTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + ColorTimeline.PREV_TIME] - frameTime));
            r += (frames[frame + ColorTimeline.R] - r) * percent;
            g += (frames[frame + ColorTimeline.G] - g) * percent;
            b += (frames[frame + ColorTimeline.B] - b) * percent;
            a += (frames[frame + ColorTimeline.A] - a) * percent;
        }
        if (alpha == 1)
            slot.color.set(r, g, b, a);
        else {
            var color = slot.color;
            if (blend == MixBlend.setup)
                color.setFromColor(slot.data.color);
            color.add((r - color.r) * alpha, (g - color.g) * alpha, (b - color.b) * alpha, (a - color.a) * alpha);
        }
    };

}