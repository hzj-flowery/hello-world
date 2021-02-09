import { Animation } from "./Animation"
import { Utils } from "./Utils"
import { Attachment } from "./Attachment"
export class AttachmentTimeline{
public frames:any;
public attachmentNames:Array<any>;

        constructor(frameCount){
            this.frames = Utils.newFloatArray(frameCount);
            this.attachmentNames = new Array(frameCount);
        }
        public getPropertyId() {
            return (TimelineType.attachment << 24) + this.slotIndex;
        };
        public getFrameCount() {
            return this.frames.length;
        };
        public setFrame(frameIndex, time, attachmentName) {
            this.frames[frameIndex] = time;
            this.attachmentNames[frameIndex] = attachmentName;
        };
        public apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            var slot = skeleton.slots[this.slotIndex];
            if (!slot.bone.active)
                return;
            if (direction == MixDirection.mixOut && blend == MixBlend.setup) {
                var attachmentName_1 = slot.data.attachmentName;
                slot.setAttachment(attachmentName_1 == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName_1));
                return;
            }
            var frames = this.frames;
            if (time < frames[0]) {
                if (blend == MixBlend.setup || blend == MixBlend.first) {
                    var attachmentName_2 = slot.data.attachmentName;
                    slot.setAttachment(attachmentName_2 == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName_2));
                }
                return;
            }
            var frameIndex = 0;
            if (time >= frames[frames.length - 1])
                frameIndex = frames.length - 1;
            else
                frameIndex = Animation.binarySearch(frames, time, 1) - 1;
            var attachmentName = this.attachmentNames[frameIndex];
            skeleton.slots[this.slotIndex]
                .setAttachment(attachmentName == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName));
        };
       
    }
