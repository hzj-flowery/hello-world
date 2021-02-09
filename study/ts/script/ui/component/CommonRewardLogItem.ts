import { Colors } from "../../init";
import UIHelper from "../../utils/UIHelper";
import GachaGoldenHeroHelper from "../../scene/view/gachaGoldHero/GachaGoldenHeroHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonRewardLogItem extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _text_105: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_106: cc.Label = null;


    setUserName(heroName, officialLevel) {
        this._text_106.string = (heroName);
        officialLevel = officialLevel || 0;
        this._text_106.node.color = (Colors.getOfficialColor(officialLevel));
        UIHelper.updateTextOfficialOutline(this._text_106.node, officialLevel);
    }
    setUserNameColor(color) {
        this._text_106.node.color = (color);
    }
    setServerName(heroName) {
        var name = GachaGoldenHeroHelper.getFormatServerName(heroName, 6);
        this._text_105.string = (name);
    }
    setServerNameColor(color) {
        this._text_105.node.color = (color);
    }


}