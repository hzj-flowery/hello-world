import FightScene from "./FightScene";
import { FightConfig } from "../FightConfig";
import { Path } from "../../utils/Path";
import { FightResourceManager } from "../FightResourceManager";

class ViewportElement {

    private _helper: FightViewport;
    private _layerInfo;
    private _frames;
    private _name;
    private _entity: any;
    private _lastFrame;

    constructor(helper: FightViewport, info) {
        this._helper = helper;
        this._layerInfo = info;
        this._frames = this._layerInfo.frames;
        this._name = this._layerInfo.name;
        this._entity = null;
        this._lastFrame = null;
    }

    public update(f, factor) {
        var frame = this._frames[f];
        if (frame != null) {
            if (this._entity == null) {
                this._entity = this._helper.createSymbol(this._name, this._layerInfo.extras);
            }
            var start = this._helper.getStartPosition();
            this._entity.setFlashPosition((start.x + parseInt(frame.x)) * factor, start.y + parseInt(frame.y) + parseInt(frame.height));
            this._entity.setFlashScale(frame.scaleX, frame.scaleY);
            if (frame.color) {
                this._entity.setFlashColor(frame.red_percent, frame.green_percent, frame.blue_percent, frame.alpha_percent);
            }
            this._lastFrame = frame;
        }
        if (this._lastFrame != null) {
            if (this._lastFrame.isMotion == true) {
                var n = this._lastFrame.id + this._lastFrame.duration;
                var nextFrame = this._frames[n];
                if (nextFrame) {
                    var start = this._helper.getStartPosition();
                    var t = (f - this._lastFrame.id) / this._lastFrame.duration;
                    var x = this.lerpf(this._lastFrame.x, nextFrame.x, t);
                    var y = this.lerpf(this._lastFrame.y, nextFrame.y, t);
                    var height = this.lerpf(this._lastFrame.height, nextFrame.height, t);
                    var scaleX = this.lerpf(this._lastFrame.scaleX, nextFrame.scaleX, t);
                    var scaleY = this.lerpf(this._lastFrame.scaleY, nextFrame.scaleY, t);
                    var rotation = this.lerpf(this._lastFrame.rotation, nextFrame.rotation, t);
                    this._entity.setFlashPosition((start.x + parseInt(x)) * factor, start.y + parseInt(y + height));
                    this._entity.setFlashScale(scaleX, scaleY);
                    if (this._lastFrame.color && nextFrame.color) {
                        var alpha = this.lerpf(this._lastFrame.alpha_percent, nextFrame.alpha_percent, t);
                        var red = this.lerpf(this._lastFrame.red_percent, nextFrame.red_percent, t);
                        var green = this.lerpf(this._lastFrame.green_percent, nextFrame.green_percent, t);
                        var blue = this.lerpf(this._lastFrame.blue_percent, nextFrame.blue_percent, t);
                        this._entity.setFlashColor(red, green, blue, alpha);
                    }
                }
            }
        }
    }

    public updateFrame(f) {
    }

    private lerpf(src, target, t) {
        return src + t * (target - src);
    }
}


export default class FightViewport {

    private _sceneView: FightScene;
    private _sceneWidth: number;
    private _sceneHeight: number;
    private _factor: number;
    private _towards: number;
    private _startPosition: cc.Vec2;


    private _finish: boolean;
    private _start: boolean;
    private _frame: number;
    private _data: any;
    private _layers: ViewportElement[];

    public init(sceneView: FightScene, sceneWidth: number, sceneHeight: number) {
        this._sceneView = sceneView;
        this._sceneWidth = sceneWidth;
        this._sceneHeight = sceneHeight;
        this._factor = 1;
        this._towards = FightConfig.campLeft;
    }

    public createSymbol(name: string, extras: string): any {
        if (name == 'scene') {
            return this._sceneView;
        } else if (name == 'flash') {
            return this._sceneView.getFlashGround();
        }
        if (extras && extras == 'flip') {
            return this._sceneView.createEffectBySceneFront(name);
        }
        return this._sceneView.createEffectBySceneFront(name, this._towards);
    }

    public getStartPosition() {
        return this._startPosition;
    }

    public setStart(id, towards) {
        this._towards = towards;
        this._factor = towards == FightConfig.campLeft && 1 || -1;
        var json = FightResourceManager.instance.getSkillJson(Path.getSceneAction(id));
        if (json != null) {
            this._finish = false;
            this._start = true;
            this._frame = 0;
            this._startPosition = new cc.Vec2(0, 0);
            this._data = json;
            this._layers = [];
            for (let i = 0; i < this._data.layers.length; i++) {
                var v = this._data.layers[i];
                var layer = new ViewportElement(this, v);
                this._layers.push(layer);
            }

            let pos: number[] = this._sceneView.getFlashPosition();
            this._startPosition = new cc.Vec2(pos[0], pos[1]);
        }
    }

    public stop() {
        if (this._start) {
            this._start = false;
            this._sceneView.setFlashPosition(this._startPosition.x, this._startPosition.y);
            this._sceneView.setFlashScale(1, 1);
            for (let i = 0; i < this._layers.length; i++) {
                var v = this._layers[i];
                // if (v.isFlashLayer) {
                //     v.setVisible(false);
                // }
            }
            this._layers = [];
            this._finish = true;
        }
    }

    public setUpdate() {
        if (this._finish == false && this._start == true) {
            for (let i = 0; i < this._layers.length; i++) {
                var v = this._layers[i];
                v.update(this._frame, this._factor);
            }
            this._frame = this._frame + 1;
            if (this._frame >= this._data.frameCount) {
                this.stop();
            }
        }
    }
}