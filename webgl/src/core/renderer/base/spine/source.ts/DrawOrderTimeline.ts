import { Animation } from "./Animation";
import { MixBlend } from "./MixBlend";
import { MixDirection } from "./MixDirection";
import { TimelineType } from "./TimelineType";

export class DrawOrderTimeline   {
    public frames:Array<any>;
    public drawOrders:Array<any>;
    constructor(frameCount) {
        this.frames = spine.Utils.newFloatArray(frameCount);
        this.drawOrders = new Array(frameCount);
    }
public getPropertyId () {
        return TimelineType.drawOrder << 24;
    };
public getFrameCount () {
        return this.frames.length;
    };
public setFrame (frameIndex, time, drawOrder) {
        this.frames[frameIndex] = time;
        this.drawOrders[frameIndex] = drawOrder;
    };
public apply (skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
        var drawOrder = skeleton.drawOrder;
        var slots = skeleton.slots;
        if (direction == MixDirection.mixOut && blend == MixBlend.setup) {
            spine.Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
            return;
        }
        var frames = this.frames;
        if (time < frames[0]) {
            if (blend == MixBlend.setup || blend == MixBlend.first)
                spine.Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
            return;
        }
        var frame = 0;
        if (time >= frames[frames.length - 1])
            frame = frames.length - 1;
        else
            frame = Animation.binarySearch(frames, time) - 1;
        var drawOrderToSetupIndex = this.drawOrders[frame];
        if (drawOrderToSetupIndex == null)
            spine.Utils.arrayCopy(slots, 0, drawOrder, 0, slots.length);
        else {
            for (var i = 0, n = drawOrderToSetupIndex.length; i < n; i++)
                drawOrder[i] = slots[drawOrderToSetupIndex[i]];
        }
    };
}