import { G_ResolutionManager, G_UserData, G_ServerTime } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { QinTombConst } from "../../../const/QinTombConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class QinTombRebornCDNode extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _panelShadow: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textTime: cc.Label = null;

    public onLoad() {
        var size = G_ResolutionManager.getDesignCCSize();
        this._panelShadow.setContentSize(size);
    }

    public startCD() {
        this.node.active = (true);
    }

    public refreshCdTimeView(finishCall) {
        var selfTeam = G_UserData.getQinTomb().getSelfTeam();
        if (selfTeam) {
            var rebornTime = selfTeam.getReborn_time();
            var curTime = G_ServerTime.getTime();
            if (curTime <= rebornTime) {
                var leftTime = rebornTime - curTime;
                this._textTime.string = (Lang.get('qin_tomb_reborn', { num: leftTime }));
            } else {
                this._textTime.string = (' ');
                this.node.active = (false);
                if (finishCall) {
                    finishCall();
                }
            }
        }
        return true;
    }

    public updateVisible() {
        var selfTeam = G_UserData.getQinTomb().getSelfTeam();
        if (selfTeam) {
            var isInBorn = selfTeam.getCurrState() == QinTombConst.TEAM_STATE_DEATH;
            this.node.active = (isInBorn);
        }
    }
}