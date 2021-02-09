import HeroTransformCommonInfo1 from "./HeroTransformCommonInfo1";
import { Colors } from "../../../init";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { Lang } from "../../../lang/Lang";
import { TextHelper } from "../../../utils/TextHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class HeroTransformCommonLevel extends HeroTransformCommonInfo1 {
    onLoad() {
        this._initView();
    }
    onEnter() {
    }
    onExit() {
    }
    _initView() {
        this._nodeDesValue.setFontSize(22);
        this._nodeDesValue.setDesColor(Colors.SYSTEM_TARGET_RED);
        this._nodeDesValue.setValueColor(Colors.SYSTEM_TARGET_RED);
        for (var i = 1; i <= 4; i++) {
            this['_nodeAttr' + i].setFontSize(22);
        }
    }
    updateUI(baseId, level) {
        var config = HeroDataHelper.getHeroConfig(baseId);
        this._updateDes(level, config);
        this._updateAttr(config, level);
    }
    _updateDes(level, config) {
        var des = Lang.get('hero_transform_preview_level_title');
        if (config.color == 7) {
            des = Lang.get('hero_transform_cell_title_gold');
        }
        var value = Lang.get('hero_transform_preview_level_value', { level: level });
        this._nodeDesValue.updateUI(des, value);
    }
    _updateAttr(config, level) {
        var info = HeroDataHelper.getBasicAttrWithLevel(config, level);
        var desInfo = TextHelper.getAttrInfoBySort(info);
        for (var i = 1; i <= 4; i++) {
            var attr = desInfo[i];
            if (attr) {
                this['_nodeAttr' + i].setVisible(true);
                this['_nodeAttr' + i].updateView(attr.id, attr.value);
            } else {
                this['_nodeAttr' + i].setVisible(false);
            }
        }
    }
}