import ListViewCellBase from "../../../ui/ListViewCellBase";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Lang } from "../../../lang/Lang";
import { G_UserData, Colors } from "../../../init";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import UIHelper from "../../../utils/UIHelper";
import { TextHelper } from "../../../utils/TextHelper";
import { InstrumentUnitData } from "../../../data/InstrumentUnitData";
import { InstrumentDataHelper } from "../../../utils/data/InstrumentDataHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class InstrumentDetailYokeNode extends ListViewCellBase {
    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg:cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle:CommonDetailTitleWithBg = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _nodeIcon:CommonHeroIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName:cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDes:cc.Label = null;

    private _instrumentData:InstrumentUnitData;
    init(instrumentData){
        this._instrumentData = instrumentData;
    }
    onCreate(){
        var contentSize = this._panelBg.getContentSize();
        this.node.setContentSize(contentSize);
        this._nodeTitle.setFontSize(24);
    }
    onEnter() {
        this._nodeTitle.setTitle(Lang.get('instrument_detail_title_yoke'));
        var baseId = this._instrumentData.getBase_id();
        var heroBaseId = G_UserData.getInstrument().getHeroBaseId(baseId);
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
        this._nodeIcon.updateUI(heroBaseId);
        var heroName = HeroDataHelper.getHeroConfig(heroBaseId).name;
        this._textName.string = (heroName);
        this._textName.node.color = (heroParam.icon_color);
        UIHelper.updateTextOutline(this._textName, heroParam);
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId);
        var des = this._createYokeDes(param.name);
        this._textDes.string = (des);
        var isActive = G_UserData.getBattleResource().isInstrumentInBattleWithBaseId(baseId);
        var color = isActive && Colors.SYSTEM_TARGET_RED || Colors.BRIGHT_BG_TWO;
        this._textDes.node.color = (color);
    }
    _createYokeDes(name) {
        var des = Lang.get('instrument_detail_yoke_des', { name: name });
        var instrumentId = this._instrumentData.getBase_id();
        var attrInfo = InstrumentDataHelper.getYokeAttrWithInstrumentId(instrumentId);
        for (var i = 1; i <= attrInfo.length; i++) {
            var one = attrInfo[i-1];
            var attrBasicText = TextHelper.getAttrBasicText(one.attrId, one.attrValue);
            var name = attrBasicText[0], value = attrBasicText[1];
            var txt = name + ('+' + value);
            if (i != attrInfo.length) {
                txt = txt + '\uFF0C';
            }
            des = des + txt;
        }
        return des;
    }
}
