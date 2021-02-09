const { ccclass, property } = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import { Colors } from '../../../init';

@ccclass
export default class DailyChallengeNode extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _nodeBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _textLayer: cc.Sprite = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _res1: CommonResourceInfo = null;

    @property() _res3: cc.Node = null;

    @property({
        type: [cc.SpriteFrame],
        visible: true
    }) _layerSprite: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        visible: true
    }) _bgSprite: cc.SpriteFrame[] = [];

    private static HEIGHT_FIX = 0;
    private _reward;
    private _addRewards;
    private _title;
    private pass: any;
    _layer: any;
    public init(rewards, addRewards, pass, title, layer, index) {
        this._reward = rewards;
        this._addRewards = addRewards;
        this.pass = pass;
        this._title = title;
        this._layer = layer;
        this._res3.getChildByName('success').active = false;
        this._res3.getChildByName('fail').active = false;
        this._nodeBG.spriteFrame = this._bgSprite[index % 2];
    }
    onLoad() {
        var size = this._nodeBG.node.getContentSize();
        this.node.setContentSize(size.width, size.height + DailyChallengeNode.HEIGHT_FIX);
        this._textTitle.string = (this._title);
        this._textLayer.spriteFrame = this._layerSprite[this._layer];
        this._nodeBG.node.active = (true);
        let resInfos: CommonResourceInfo[] = [this._res1];
        if (this.pass) {
            for (let i = 0; i < this._reward.length; i++) {
                var reward = this._reward[i];
                resInfos[i].node.active = true;
                resInfos[i].onLoad();
                resInfos[i].updateUI(reward.type, reward.value, reward.size);
                resInfos[i].showResName(false);
                resInfos[i].setTextColor(Colors.BRIGHT_BG_ONE);
                if (this._addRewards) {
                    for (let _ in this._addRewards) {
                        var v = this._addRewards[_];
                        if (v.type == reward.type && v.value == reward.value) {
                            resInfos[i].updateCrit(v.index, v.size);
                            break;
                        }
                    }
                }
            }
            this._res3.getChildByName('success').active = true;
        }
        else {
            this._res1.node.active = false;
            this._res3.getChildByName('fail').active = true;
        }
    }
}