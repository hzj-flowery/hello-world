const { ccclass, property } = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import { Colors } from '../../../init';

@ccclass
export default class TowerChallengeNode extends cc.Component {

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
        type: CommonResourceInfo,
        visible: true
    })
    _res2: CommonResourceInfo = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _res1: CommonResourceInfo = null;

    @property({
        type: cc.Node,
        visible: true
    }) _res3: cc.Node = null;

    @property(cc.Node) stars: cc.Node = null;

    private static HEIGHT_FIX = 0;
    private _reward;
    private _addRewards;
    private _title;
    private pass: any;
    public init(rewards, addRewards, pass, title) {
        this._reward = rewards;
        this._addRewards = addRewards;
        this.pass = pass;
        this._title = title;
        this._res3.getChildByName('success').active = false;
        this._res3.getChildByName('fail').active = false;
    }
    onLoad() {
        var size = this._nodeBG.node.getContentSize();
        this.node.setContentSize(size.width, size.height + TowerChallengeNode.HEIGHT_FIX);
        this._textTitle.string = (this._title);
        this._nodeBG.node.active = (true);
        let resInfos: CommonResourceInfo[] = [this._res1, this._res2];
        if (this._reward.length > 0) {
            for (let i = 0; i < this._reward.length; i++) {
                var reward = this._reward[i];
                resInfos[i].node.active = true;
                resInfos[i].onLoad();
                resInfos[i].updateUI(reward.type, reward.value, reward.size);
                resInfos[i].showResName(true);
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
            this.stars.getChildByName('star').active = true;
            this._res3.getChildByName('success').active = true;
        }
        else {
            this._res1.node.active = false;
            this._res2.node.active = false;
            this.stars.getChildByName('star').active = false;
            this._res3.getChildByName('fail').active = true;
        }
    }
}