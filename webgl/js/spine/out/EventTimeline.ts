export class EventTimeline{

        constructor(frameCount){
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.events = new Array(frameCount);
        }
        public getPropertyId() {
            return TimelineType.event << 24;
        };
        public getFrameCount() {
            return this.frames.length;
        };
        public setFrame(frameIndex, event) {
            this.frames[frameIndex] = event.time;
            this.events[frameIndex] = event;
        };
        public apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            if (firedEvents == null)
                return;
            var frames = this.frames;
            var frameCount = this.frames.length;
            if (lastTime > time) {
                this.apply(skeleton, lastTime, Number.MAX_VALUE, firedEvents, alpha, blend, direction);
                lastTime = -1;
            }
            else if (lastTime >= frames[frameCount - 1])
                return;
            if (time < frames[0])
                return;
            var frame = 0;
            if (lastTime < frames[0])
                frame = 0;
            else {
                frame = Animation.binarySearch(frames, lastTime);
                var frameTime = frames[frame];
                while (frame > 0) {
                    if (frames[frame - 1] != frameTime)
                        break;
                    frame--;
                }
            }
            for (; frame < frameCount && time >= frames[frame]; frame++)
                firedEvents.push(this.events[frame]);
        };
        return EventTimeline;
    }