import { GuildWarDataHelper } from "../../../utils/data/GuildWarDataHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarPopulationNode extends cc.Component {
    _target: cc.Node;
    _imageSelfState: cc.Sprite;
    _imageOtherState: cc.Sprite;
    _textOtherCount: cc.Label;
    _textSelfCount: cc.Label;
    initData(target) {
        this._target = target;
        this._init();
    }
    _init() {
        this._imageSelfState = this._target.getChildByName('ImageSelfState').getComponent(cc.Sprite) as cc.Sprite;
        this._imageOtherState = this._target.getChildByName('ImageOtherState').getComponent(cc.Sprite) as cc.Sprite;
        this._textOtherCount = this._target.getChildByName('TextOtherCount').getComponent(cc.Label) as cc.Label;
        this._textSelfCount = this._target.getChildByName('TextSelfCount').getComponent(cc.Label) as cc.Label;
    }
    updateInfo(cityId, pointId) {
        var [num1, num2] = GuildWarDataHelper.calculatePopulation(cityId, pointId);
        this._textSelfCount.string = (num1) + "";
        this._textOtherCount.string = (num2) + "";
    }
}