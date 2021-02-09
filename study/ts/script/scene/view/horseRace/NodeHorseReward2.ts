import { HorseRaceHelper } from "./HorseRaceHelper";
import { Lang } from "../../../lang/Lang";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NodeHorseReward2 extends cc.Component {
    @property({ type: cc.Label, visible: true })
    _textTitle: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textFull: cc.Label = null;
    @property({ type: cc.Prefab, visible: true })
    _commonResourceInfoPrefab: cc.Prefab = null;


    public updateUI(text, awards)
    {
        this._textTitle.string = (text);
        this._textFull.node.active = (false);
        var posX = 0;
        var isFull = HorseRaceHelper.isRewardFull();
        if (awards.length == 0) {
            this._textTitle.string =(Lang.get('horse_race_no_reward'));
            this._textFull.node.x = (0);
            this._textFull.node.active = (false);
            this._textTitle.node.active = (true);
        } else {
            for (let i in awards) {
                var v = awards[i];
                if (v.type != 0) {
                    var icon = cc.instantiate(this._commonResourceInfoPrefab).getComponent(CommonResourceInfo);
                    icon.updateUI(v.type, v.value, v.size);
                    icon.setCountColorBeige();
                    this.node.addChild(icon.node);
                    posX = 105 + (parseInt(i)) * 90;
                    icon.node.setPosition(posX, -20);
                }
            }
            this._textFull.node.active = (isFull);
            this._textFull.string =(Lang.get('horse_reward_full2'));
            this._textFull.node.x =(posX + 90);
        }
    }
}