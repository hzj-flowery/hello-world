import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { Path } from "../../../utils/Path";
import { table } from "../../../utils/table";
import UIHelper from "../../../utils/UIHelper";
import { GrainCarDataHelper } from "./GrainCarDataHelper";
const { ccclass, property } = cc._decorator;
@ccclass
export default class GrainCarCorpseName extends cc.Component{
    
    _carList:Array<any>;
    onLoad() {
        this._carList = [];
    }
    onCreate() {
    }
    onEnter() {
    }
    onExit() {
    }
    updateUI() {
    }
    addName(carUnit) {
        var count = this._carList.length;
        var name = carUnit.getGuild_name() + (Lang.get('grain_car_guild_de') + carUnit.getConfig().name);
        var labelName = UIHelper.createWithTTF(name, Path.getCommonFont(), 20);
        labelName.node.setAnchorPoint(cc.v2(0.5, 0));
        labelName.node.setPosition(cc.v2(0, count * 25));
        this.node.addChild(labelName.node);
        if (GrainCarDataHelper.isMyGuild(carUnit.getGuild_id())) {
            labelName.node.color = (Colors.BRIGHT_BG_GREEN);
            UIHelper.enableOutline(labelName,Colors.COLOR_QUALITY_OUTLINE[1], 1)
        } else {
            labelName.node.color = (Colors.BRIGHT_BG_RED);
            UIHelper.enableOutline(labelName,Colors.COLOR_QUALITY_OUTLINE[5], 1)
        }
        table.insert(this._carList, carUnit);
    }
}