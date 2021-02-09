const { ccclass, property } = cc._decorator;

import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import CommonListItem from '../../../ui/component/CommonListItem';
import { Lang } from '../../../lang/Lang';
import { G_UserData } from '../../../init';
import { SilkbagConst } from '../../../const/SilkbagConst';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { SilkbagDataHelper } from '../../../utils/data/SilkbagDataHelper';
import UIHelper from '../../../utils/UIHelper';
import { handler } from '../../../utils/handler';

@ccclass
export default class SilkbagListCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _fileNodeIcon: CommonIconTemplate = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMark: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _button: CommonButtonSwitchLevel1 = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroName: cc.Label = null;

    onLoad() {
        this._button.setString(Lang.get('silkbag_btn_wear'));
        this._button.addClickEventListenerEx(handler(this, this._onButtonClicked));
    }
    updateUI(itemId, data) {
        var [silkbagId , heroBaseId , heroRank, isInstrumentMaxLevel, curPos, heroLimit, heroRedLimit] = data;
        var unitData = G_UserData.getSilkbag().getUnitDataWithId(silkbagId);
        var info = unitData.getConfig();
        var baseId = unitData.getBase_id();
        var nameStr = info.only == SilkbagConst.ONLY_TYPE_1 && Lang.get('silkbag_only_tip', { name: info.name }) || info.name;
        var btnStr = '';
        this._fileNodeIcon.unInitUI();
        this._fileNodeIcon.initUI(TypeConvertHelper.TYPE_SILKBAG, baseId);
        var [isEffect] = SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit);
        var isCanWear = unitData.isCanWearWithPos(curPos);
        var isShowMark = isEffect && isCanWear;
        this._imageMark.node.active = (isShowMark);
        var params = this._fileNodeIcon.getItemParams();
        this._textName.string = (nameStr);
        this._textName.node.color = (params.icon_color);
        UIHelper.updateTextOutline(this._textName, params);
        var heroUnitData = unitData.getHeroDataOfWeared();
        if (heroUnitData) {
            var baseId = heroUnitData.getBase_id();
            var limitLevel = heroUnitData.getLimit_level();
            var limitRedLevel = heroUnitData.getLimit_rtg();
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, null, null, limitLevel, limitRedLevel);
            this._textHeroName.node.active = (true);
            this._textHeroName.string = (heroParam.cfg.name);
            this._textHeroName.node.color = (heroParam.icon_color);
            UIHelper.updateTextOutline(this._textHeroName, heroParam);
            this._button.setString(Lang.get('silkbag_btn_grab'));
            this._button.switchToHightLight();
        } else {
            this._textHeroName.node.active = (false);
            this._button.setString(Lang.get('silkbag_btn_wear'));
            this._button.switchToNormal();
        }
    }
    _onButtonClicked() {
        this.dispatchCustomCallback(0);
    }
}