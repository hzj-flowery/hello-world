const { ccclass, property } = cc._decorator;
import TeamYokeConditionNode from "../team/TeamYokeConditionNode";
import { Colors } from "../../../init";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

@ccclass
export default class TreasureDetailYokeNode extends TeamYokeConditionNode {

    setImageBgLength(length) {
        var size = this._imageBg.node.getContentSize();
        this._imageBg.node.setContentSize(length, size.height);
    }
    updateViewEx(info, heroId, isActivated) {
        this._textName.string = (info.name);
        var color = isActivated && Colors.COLOR_ATTR_DES_ACTIVE || Colors.COLOR_ATTR_UNACTIVE;
        this._textName.node.color = (color);
        var heroIds = [heroId];
        for (var i = 1; i<=4; i++) {
            var heroId = heroIds[i-1];
            if (heroId) {
                this['_fileNodeIcon' + i].node.active = (true);
                this['_fileNodeIcon' + i].initUI(TypeConvertHelper.TYPE_HERO, heroId);
                this['_fileNodeIcon' + i].setIconMask(!isActivated);
            } else {
                this['_fileNodeIcon' + i].node.active = (false);
            }
        }
    }
}
