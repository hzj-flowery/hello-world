import UIHelper from "../../utils/UIHelper";
import { Path } from "../../utils/Path";
import { G_EffectGfxMgr } from "../../init";
import { handler } from "../../utils/handler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonCountdownAnimation extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _countdownSprite: cc.Sprite = null;

    private _isPlay = false;
    private _textureList;
    private _countdownSprites: cc.Node[];
    private _startIndex;
    private _endIndex;
    private _callback;
    private _curIndex;

    public isPlaying() {
        return this._isPlay;
    }

    public onLoad() {
        this._countdownSprite.node.active = false;
    }

    public setTextureList(textureList: any[]) {
        this._countdownSprite.node.active = false;
        if (!textureList && textureList.length <= 0) {
            return;
        }
        this._textureList = textureList;
        this._countdownSprites = [];
        for (let index = 0; index < this._textureList.length; index++) {
            var sprite = UIHelper.newSprite(Path.getImgRunway(this._textureList[index])).node;
            sprite.active = (false);
            this.node.addChild(sprite);
            this._countdownSprites.push(sprite);
        }
    }

    public playAnimation(startIndex, endIndex, callback) {
        if (this._textureList.length < (startIndex - endIndex - 1)) {
            return;
        }
        this._startIndex = startIndex;
        this._endIndex = endIndex;
        this._callback = callback;
        this._stopAllActios();
        if (this._startIndex >= this._endIndex) {
            this._curIndex = startIndex - endIndex + 1;
            if (this._textureList[this._curIndex - 1]) {
                this._isPlay = true;
                this._countdownSprites[this._curIndex - 1].active = (true);
                G_EffectGfxMgr.applySingleGfx(this._countdownSprites[this._curIndex - 1], 'smoving_saipaojishi', handler(this, this._timesUpdate), null, null);
            }
        } else {
            this._callEnd();
        }
    }

    private _timesUpdate(eventName) {
        if (eventName == 'finish') {
            this._changeSpriteVisible();
            if (this._startIndex >= this._endIndex) {
                this._stopAllActios();
                G_EffectGfxMgr.applySingleGfx(this._countdownSprites[this._curIndex - 1], 'smoving_saipaojishi', handler(this, this._timesUpdate), null, null);
            } else {
                this._stopAllActios();
                this._callEnd();
            }
        }
    }

    private _changeSpriteVisible() {
        if (this._curIndex == 0) {
            return;
        }
        this._countdownSprites[this._curIndex - 1].active = (false);
        this._startIndex = this._startIndex - 1;
        this._curIndex = this._curIndex - 1;
        if (this._curIndex > 0 && this._textureList[this._curIndex - 1]) {
            this._countdownSprites[this._curIndex - 1].active = (true);
        }
    }

    private _stopAllActios() {
        for (let index = 0; index < this._textureList.length; index++) {
            if (this._countdownSprites[index]) {
                this._countdownSprites[index].stopAllActions();
                this._countdownSprites[index].setScale(1);
            }
        }
    }

    private _callEnd() {
        if (this._callback) {
            this._callback();
        }
        this._isPlay = false;
    }
}