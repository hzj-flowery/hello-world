import HeroTransformCommonInfo1 from "./HeroTransformCommonInfo1";
import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { TextHelper } from "../../../utils/TextHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class HeroTransformCommonBreak extends HeroTransformCommonInfo1 {
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
    updateUI(baseId, rank) {
        this._updateDes(rank);
        this._updateAttr(baseId, rank);
    }
    _updateDes(rank) {
        var des = Lang.get('hero_transform_preview_break_title');
        this._nodeDesValue.updateUI(des, rank);
    }
    _updateAttr(baseId, rank) {
        var info = HeroDataHelper.getBreakAttrWithBaseIdAndRank(baseId, rank, 0);
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