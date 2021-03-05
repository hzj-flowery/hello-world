import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { Lang } from "../../lang/Lang";
import { Colors } from "../../init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHeroName2 extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;
    private _convertType: number;
    onLoad(): void {
        this._convertType = TypeConvertHelper.TYPE_HERO;
    }
    setConvertType(type) {
        if (type && type > 0) {
            this._convertType = type;
        }
    }
    setName(baseId, rankLevel?, limitLevel?, outLine?) {
        if (baseId == null) {
            this.node.active = (false);
            return;
        }
        var heroParam = TypeConvertHelper.convert(this._convertType, baseId, null, null, limitLevel);
        var heroName = heroParam.name;
        if (rankLevel && rankLevel > 0) {
            if (heroParam.color == 7 && limitLevel == 0 && heroParam.type != 1) {
                heroName = heroName + (' ' + (Lang.get('goldenhero_train_text') + rankLevel));
            } else {
                heroName = heroName + ('+' + rankLevel);
            }
        }
        this._textName.string = (heroName);
        this._textName.node.color = (heroParam.icon_color);
        UIHelper.updateTextOutline(this._textName, heroParam);
        this.node.active = (true);
    }
    disableOutline() {
        this._textName.node.removeComponent(cc.LabelOutline);
    }
    setFontSize(size) {
        this._textName.fontSize = (size);
    }
    setFontName(fontName) {
        this._textName.fontFamily = (fontName);
        this._textName.useSystemFont = true;
    }
    setNameInUserDetail(name, officialLevel, rankLevel?) {
        var iconColor = Colors.getOfficialColor(officialLevel);
        if (rankLevel && rankLevel > 0) {
            name = name + ('+' + rankLevel);
        }
        this._textName.string = name;
        this._textName.node.color = (iconColor);
        UIHelper.updateTextOfficialOutline(this._textName.node, officialLevel);
        this.node.active = (true);
    }


}