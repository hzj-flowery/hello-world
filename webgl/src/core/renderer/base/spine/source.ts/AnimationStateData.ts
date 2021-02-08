export class AnimationStateData {
    public animationToMixTime: any;
    public defaultMix: number;
    public skeletonData: any;
    constructor(skeletonData) {
        this.animationToMixTime = {};
        this.defaultMix = 0;
        if (skeletonData == null)
            throw new Error("skeletonData cannot be null.");
        this.skeletonData = skeletonData;
    }
    public setMix(fromName, toName, duration) {
        var from = this.skeletonData.findAnimation(fromName);
        if (from == null)
            throw new Error("Animation not found: " + fromName);
        var to = this.skeletonData.findAnimation(toName);
        if (to == null)
            throw new Error("Animation not found: " + toName);
        this.setMixWith(from, to, duration);
    };
    public setMixWith(from, to, duration) {
        if (from == null)
            throw new Error("from cannot be null.");
        if (to == null)
            throw new Error("to cannot be null.");
        var key = from.name + "." + to.name;
        this.animationToMixTime[key] = duration;
    };
    public getMix(from, to) {
        var key = from.name + "." + to.name;
        var value = this.animationToMixTime[key];
        return value === undefined ? this.defaultMix : value;
    };
}