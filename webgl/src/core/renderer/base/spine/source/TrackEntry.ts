import { Animation } from "./Animation"
import { MixBlend } from "./MixBlend"
export class TrackEntry{
public mixBlend:any;
public timelineMode:Array<any>;
public timelineHoldMix:Array<any>;
public timelinesRotation:Array<any>;
public next:any;
public mixingFrom:any;
public mixingTo:any;
public animation:any;
public listener:any;
public animationLast:any;
public nextAnimationLast:any;

        constructor(){
            this.mixBlend = MixBlend.replace;
            this.timelineMode = new Array();
            this.timelineHoldMix = new Array();
            this.timelinesRotation = new Array();
        }
        public reset() {
            this.next = null;
            this.mixingFrom = null;
            this.mixingTo = null;
            this.animation = null;
            this.listener = null;
            this.timelineMode.length = 0;
            this.timelineHoldMix.length = 0;
            this.timelinesRotation.length = 0;
        };
        public getAnimationTime() {
            if (this.loop) {
                var duration = this.animationEnd - this.animationStart;
                if (duration == 0)
                    return this.animationStart;
                return (this.trackTime % duration) + this.animationStart;
            }
            return Math.min(this.trackTime + this.animationStart, this.animationEnd);
        };
        public setAnimationLast(animationLast) {
            this.animationLast = animationLast;
            this.nextAnimationLast = animationLast;
        };
        public isComplete() {
            return this.trackTime >= this.animationEnd - this.animationStart;
        };
        public resetRotationDirections() {
            this.timelinesRotation.length = 0;
        };
       
    }
