import { HistoryHeroConst } from "../../../const/HistoryHeroConst";
import { Colors } from "../../../init";
import CommonHistoryHeroIcon from "../../../ui/component/CommonHistoryHeroIcon";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryWeaponDetailHeroNode extends cc.Component {
    @property({type: CommonHistoryHeroIcon,visible: true})
    fileNodeEquip: CommonHistoryHeroIcon = null;
    @property({type: cc.Label,visible: true})
    textName: cc.Label = null;
    @property({type: cc.Label,visible: true})
    labelDes: cc.Label = null;

    updateIcon(heroConfig, heroId, param) {
        this.fileNodeEquip.onLoad();
        this.fileNodeEquip.updateUI(heroId, 1);
        this.fileNodeEquip.setRoundType(false);
       // fileNodeEquip.setTouchEnabled(false);
        if (heroConfig.color == HistoryHeroConst.QUALITY_PURPLE) {
            this.fileNodeEquip.updateUIBreakThrough(2);
        } else if (heroConfig.color == HistoryHeroConst.QUALITY_ORANGE) {
            this.fileNodeEquip.updateUIBreakThrough(3);
        }
        this.textName.string = (param.name);
        this.textName.node.color = (param.icon_color);
        UIHelper.updateTextOutline(this.textName, param);
        var color = Colors.BRIGHT_BG_TWO;
        this.labelDes.string =(heroConfig.short_description);
        this.labelDes.node.color =(color);
    }
}