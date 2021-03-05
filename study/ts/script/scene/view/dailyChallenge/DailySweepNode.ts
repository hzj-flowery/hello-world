const { ccclass, property } = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import { Colors } from '../../../init';

@ccclass
export default class DailySweepNode extends cc.Component {

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

    private static HEIGHT_FIX = 0;
    private _reward;
    private _addRewards;
    private _title;
    public init(rewards, addRewards, title) {
        this._reward = rewards;
        this._addRewards = addRewards;
        this._title = title;
    }
    onLoad() {
        var size = this._nodeBG.node.getContentSize();
        this.node.setContentSize(size.width, size.height + DailySweepNode.HEIGHT_FIX);
        this._textTitle.string = (this._title);
        this._nodeBG.node.active = (true);
        let resInfos: CommonResourceInfo[] = [this._res1, this._res2];
        for (let i = 0; i < this._reward.length; i++) {
            var reward = this._reward[i];
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
    }
}