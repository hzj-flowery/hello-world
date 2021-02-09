import PopupChooseCellBase from "./PopupChooseCellBase";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { Lang } from "../../lang/Lang";
import CommonDesValue from "../component/CommonDesValue";
import CommonHeroStarBig from "../component/CommonHeroStarBig";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChoosePetCell extends PopupChooseCellBase {
    @property({ type: CommonDesValue, visible: true })
    _nodeLevel: CommonDesValue = null;
    @property({ type: CommonHeroStarBig, visible: true })
    _nodeStar: CommonHeroStarBig = null;

    public updateUI(index: number, data): void {
        if (data == null) {
            this.node.active = false;
            return;
        }
        super.updateUI(index, data, TypeConvertHelper.TYPE_PET);

        var baseId = data.getBase_id();
        var starLevel = data.getStar();

        var commonIcon = this._item.getCommonIcon();
        if (data.topImagePath && data.topImagePath != '') {
            commonIcon.setTopImage(data.topImagePath);
        }

        var params = commonIcon.getItemParams();
        this._item.setName(params.name);

        this._nodeLevel.updateUI(Lang.get("pet_list_cell_level_des"), Lang.get("pet_txt_level", { level: data.getLevel() }))

        this._nodeStar.setCount(starLevel);

        this._buttonChoose.setString(data.btnDesc);
        if (data.btnIsHightLight == false) {
            this._buttonChoose.switchToNormal();
        } else {
            this._buttonChoose.switchToHightLight();
        }
        this._buttonChoose.setEnabled(data.btnEnable);
        this._buttonChoose.showRedPoint(data.btnShowRP);
    }
}