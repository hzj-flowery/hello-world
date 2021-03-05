import PopupCheckCellBase from "./PopupCheckCellBase";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { Lang } from "../../../lang/Lang";
import CommonDesValue from "../../../ui/component/CommonDesValue";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupCheckHeroCell extends PopupCheckCellBase {

    @property({ type: cc.Node, visible: true })
    _imageMark1: cc.Node = null;

    public updateUI(index: number, data, isAdded) {
        if (data == null) {
            this.node.active = false;
            return;
        }
        super.updateUI(index, data, isAdded, TypeConvertHelper.TYPE_HERO);
        var heroBaseId = data.getBase_id();
        var limitLevel = data.getLimit_level();
        var icon = this._item.getCommonIcon();
        icon.getIconTemplate().updateUI(heroBaseId, null, limitLevel);
        var params = icon.getItemParams();
        var rank = data.getRank_lv();
        var heroName = params.name;
        if (rank > 0) {
            if (params.color == 7 && limitLevel == 0 && params.type != 1) {
                heroName = heroName + (' ' + (Lang.get('goldenhero_train_text') + rank));
            } else {
                heroName = heroName + ('+' + rank);
            }
        }
        this._item.setName(heroName, params.icon_color);
        this._imageMark1.active = (data.isYoke);
        
        let nodesDes: CommonDesValue[] = [this._nodeDes1, this._nodeDes2];
        for (let i = 0; i < nodesDes.length; i++) {
            var info = data.desValue[i];
            if (info) {
                var des = info.des;
                var value = info.value;
                if (params.color == 7 && limitLevel == 0) {
                    des = Lang.get('hero_transform_cell_title_gold');
                    value = rank;
                    if (i == 1) {
                        nodesDes[i].setVisible(false);
                        break;
                    }
                }
                nodesDes[i].updateUI(des, value);
                nodesDes[i].setValueColor(info.colorValue);
                nodesDes[i].setVisible(true);
            }
        }
    }
}