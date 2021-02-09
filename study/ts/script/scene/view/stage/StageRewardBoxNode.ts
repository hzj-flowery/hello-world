import { G_EffectGfxMgr } from "../../../init";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StageRewardBoxNode extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnBox: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _boxName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _richName: cc.Node = null;

    private _data;
    private _btnBoxSprite: cc.Sprite;
    private _richTextNode: cc.Node;
    private _effect;

    public init(data) {
        this._data = data;
    }

    public onLoad() {
        this._btnBoxSprite = this._btnBox.node.getComponent(cc.Sprite);
        // this._btnBoxSprite.sizeMode = cc.Sprite.SizeMode.RAW;
    }

    public onBtnBox() {
        if (this._data.clickCallback) {
            this._data.clickCallback(this._data);
        }
    }

    public updateUI() {
        var data = this._data;
        if (data.isAlreadyGet(data)) {
            UIHelper.loadTexture(this._btnBoxSprite, data.emptyImagePath);
            this._removeEffect();
        } else {
            UIHelper.loadTexture(this._btnBoxSprite, data.fullImagePath);
            this._addEffect();
        }
        if (!this._richTextNode) {
            if (data.richNode) {
                this._richTextNode = data.richNode;
                this._richTextNode.setAnchorPoint(0.5, 0.5);
                this._richName.addChild(this._richTextNode);
                this._boxName.node.active = (false);
            }
        }
        if (data.name) {
            this._boxName.node.active = (true);
            this._boxName.string = (data.name);
        }
    }

    public _addEffect() {
        if (this._effect) {
            return;
        }
        this._effect = G_EffectGfxMgr.createPlayMovingGfx(this._btnBox.node, 'moving_boxflash', null, null, false);
    }

    public _removeEffect() {
        if (this._effect) {
            this._effect.destroy();
            this._effect = null;
        }
    }
}