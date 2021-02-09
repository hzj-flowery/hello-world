import FlashPlayer from "./FlashPlayer";

export default class FlashElement {

    private _helper: FlashPlayer;
    private _layerInfo: any;
    private _frames: any[];
    private _name: string;
    private _entity: cc.Node
    private _lastFrame;
    private _towards: number;
    private _baseScale: number[];

    constructor(helper, towards, info, baseScaleX, baseScaleY) {
        this._helper = helper;
        this._layerInfo = info;
        this._frames = this._layerInfo.frames;
        this._name = this._layerInfo.name;
        this._entity = null;
        this._lastFrame = null;
        this._towards = towards == 1 && 1 || -1;
        this._baseScale = [
            baseScaleX,
            baseScaleY
        ];
    }
    update(f) {
        var frame = this._frames[parseInt(f)];
        if (frame != null) {
            if (this._entity == null) {
                this._entity = this._helper.createSymbol(this._name, this._layerInfo.extras);
            }
            var start = this._helper.getStartPosition();
            if (this._entity) {
                this._entity.setPosition(start.x + frame.x * this._towards, start.y + frame.y);
                if (this._name != 'shadow') {
                    // this._entity.y = (start.y + y + height);
                    this._entity.y = (start.y);
                    this._entity.angle = -(frame.rotation);
                    this._entity.setScale(frame.scaleX * this._baseScale[0], frame.scaleY * this._baseScale[1]);
                }
            }
            this._lastFrame = frame;
        }
        if (this._lastFrame != null) {
            if (this._lastFrame.isMotion == true) {
                let n: number = this._lastFrame.id + this._lastFrame.duration;
                let nextFrame = this._frames[n];
                if (nextFrame) {
                    let start = this._helper.getStartPosition();
                    let t = (f - this._lastFrame.id) / this._lastFrame.duration;
                    let x = this.lerpf(this._lastFrame.x, nextFrame.x, t);
                    let y = this.lerpf(this._lastFrame.y, nextFrame.y, t);
                    let height = this.lerpf(this._lastFrame.height, nextFrame.height, t);
                    let scaleX = this.lerpf(this._lastFrame.scaleX, nextFrame.scaleX, t);
                    let scaleY = this.lerpf(this._lastFrame.scaleY, nextFrame.scaleY, t);
                    let rotation = this.lerpf(this._lastFrame.rotation, nextFrame.rotation, t);
                    this._entity.setPosition(start.x + x * this._towards, start.y + y);
                    if (this._name != 'shadow') {
                        this._entity.y = (start.y + y + height);
                        this._entity.setRotation(rotation * this._towards);
                        this._entity.setScale(scaleX * this._baseScale[0], scaleY * this._baseScale[1]);
                    }
                }
            }
        }
    }

    private lerpf(src, target, t) {
        return (src + t * (target - src))
    }
}