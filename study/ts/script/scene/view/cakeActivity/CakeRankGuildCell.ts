import ListViewCellBase from "../../../ui/ListViewCellBase";
import { CakeActivityDataHelper } from "../../../utils/data/CakeActivityDataHelper";
import { Lang } from "../../../lang/Lang";
import { TextHelper } from "../../../utils/TextHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CakeRankGuildCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textServerName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textScore: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPercent: cc.Label = null;



    onCreate() {
        var size = this._panelBg.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(data) {
        this._textRank.string = (data.getRank());
        var serverName = TextHelper.cutText(data.getServer_name(), 5);
        this._textServerName.string = (serverName);
        this._textName.string = (data.getGuild_name());
        var level = data.getCake_level();
        this._textScore.string = (Lang.get('cake_activity_cake_level', { level: level }));
        var exp = data.getCake_exp();
        var totalExp = CakeActivityDataHelper.getCurCakeLevelConfig(level).exp;
        if (totalExp == 0) {
            totalExp = CakeActivityDataHelper.getCurCakeLevelConfig(level - 1).exp;
        }
        var percent = Math.floor(exp / totalExp * 100);
        this._textPercent.string = (percent + '%');
    }


}