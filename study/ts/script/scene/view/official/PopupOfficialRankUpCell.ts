import { G_UserData, G_ConfigLoader, Colors } from "../../../init";
import { UserBaseData } from "../../../data/UserBaseData";
import { Path } from "../../../utils/Path";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { Lang } from "../../../lang/Lang";
import PopupOfficialRankUpAttrNode from "./PopupOfficialRankUpAttrNode";
import { Util } from "../../../utils/Util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupOfficialRankUpCell extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTitle: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelCommon: cc.Node = null;

    private _officialRank;
    private _officialInfo;

    updateUI(officialRank, isCurrent) {
        this._officialRank = officialRank;
        this._officialInfo = G_UserData.getBase().getOfficialInfo(officialRank)[0];

        if (isCurrent) {
        } else {
        }
        
        Util.updateImageView(this._imageTitle, { texture: Path.getTextHero(this._officialInfo.picture) });
        var cfg = G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE);
        var valueList = {};
        valueList[1] = {
            name: Lang.get('official_all_all_combat'),
            value: this._officialInfo.all_combat || 0
        };
        for (var i = 1; i <= 4; i++) {
            var nameStr = cfg.get(this._officialInfo['attribute_type' + i]).cn_name;
            nameStr = Lang.get('official_all') + nameStr;
            valueList[i + 1] = {
                name: nameStr,
                value: this._officialInfo['attribute_value' + i] || 0
            };
        }
        for (var index in valueList) {
            var value = valueList[index];
            this._updateAttr(index, value.name, value.value, isCurrent);
        }
    }

    _updateAttr(index, name, value, isCurrent) {
        var panelAttr: PopupOfficialRankUpAttrNode = this._panelCommon.getChildByName('FileNode_attr' + index).getComponent(PopupOfficialRankUpAttrNode);
        if (panelAttr == null) return;
        var color = Colors.LIST_TEXT;
        if (!isCurrent) color = Colors.BRIGHT_BG_GREEN;
        Util.updateLabel(panelAttr._textName, { text: name + ':' });
        Util.updateLabel(panelAttr._textValue, {
            text: '+' + value,
            color: color
        });
        Util.updateImageView(panelAttr._imageBg, { visible: index % 2 != 0 });
    }
}