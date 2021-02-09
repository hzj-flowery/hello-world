import { HistoryHeroConst } from "../../../const/HistoryHeroConst";
import { HistoryHeroUnit } from "../../../data/HistoryHeroUnit";
import { G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonHistoryHeroIcon from "../../../ui/component/CommonHistoryHeroIcon";
import PopupChooseCellBase from "../../../ui/popup/PopupChooseCellBase";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoricalItemCell extends PopupChooseCellBase {

    static BTN_TYPE_ADD_FORMATION = 1;
    static BTN_TYPE_REPLACE_FORMATION = 2;
    static BTN_TYPE_REBORN = 3;
    @property({ type: cc.Label, visible: true })
    _desc: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _equipedName: cc.Label = null;
    @property({ type: CommonHistoryHeroIcon, visible: true })
    _historyHeroIcon: CommonHistoryHeroIcon = null;

    updateUI(index, itemData, _type) {
        if (itemData == null) {
            this.node.active = false;
            return;
        }
        this._index = index;
        _type = HistoryHeroConst.TAB_TYPE_HERO;
        var type = HistoryHeroConst.TAB_TYPE_BREAK;
        var baseId = 0;
        if (_type == HistoryHeroConst.TAB_TYPE_HERO) {
            type = TypeConvertHelper.TYPE_HISTORY_HERO;
            baseId = itemData.getSystem_id();
        } else if (_type == HistoryHeroConst.TAB_TYPE_BREAK) {
            type = TypeConvertHelper.TYPE_HISTORY_HERO;
            baseId = itemData.getSystem_id();
        } else if (_type == HistoryHeroConst.TAB_TYPE_AWAKE) {
            type = TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON;
            baseId = itemData.getId();
        } else if (_type == HistoryHeroConst.TAB_TYPE_REBORN) {
            type = TypeConvertHelper.TYPE_HISTORY_HERO;
            baseId = itemData.getSystem_id();
        }
        this._updateDesc(index, itemData);
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HISTORY_HERO, baseId);
        this['_item'].updateUI(type, baseId, 1, heroParam);
        this._historyHeroIcon.onLoad();
        this['_historyHeroIcon'].updateUIWithUnitData(itemData, 1);
        this['_historyHeroIcon'].setRoundType(false);
        this.setBtnType(itemData.btnType);
        var [isOnFormation, pos] = G_UserData.getHistoryHero().isStarEquiped(itemData.getId());
        if (itemData.isDown) {
            this['_buttonChoose'].setString(Lang.get('historyhero_replace_down_formation'));
            this['_buttonChoose'].switchToHightLight();
        } else {
            if (isOnFormation) {
                this['_buttonChoose'].setString(Lang.get('historyhero_replace_rob'));
                this['_buttonChoose'].switchToHightLight();
            } else {
                this['_buttonChoose'].switchToNormal();
            }
        }
        var heroParam = this._getEquipedHeroParam(pos);
        if (heroParam) {
            this['_equipedName'].string = (heroParam.name);
            this['_equipedName'].node.color = (heroParam.icon_color);
            UIHelper.updateTextOutline(this['_equipedName'], heroParam);
        } else {
            this['_equipedName'].string = ('');
        }
    }

    setBtnType(btnType) {
        if (btnType == HistoricalItemCell.BTN_TYPE_REPLACE_FORMATION) {
            this['_buttonChoose'].setString(Lang.get('historyhero_replace'));
        } else if (btnType == HistoricalItemCell.BTN_TYPE_REBORN) {
            this['_buttonChoose'].setString(Lang.get('historyhero_btn_type_reborn'));
        }else {
            this['_buttonChoose'].setString(Lang.get('historyhero_awake_popstate1'));
        }
    }
    _updateDesc(index, itemData) {
        this['_desc'].string = (itemData.getConfig().short_description);
    }
    _getEquipedHeroParam(pos) {
        if (pos) {
            var curHeroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            var curHeroData = G_UserData.getHero().getUnitDataWithId(curHeroId);
            var baseId = curHeroData.getBase_id();
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, null, null, curHeroData.getLimit_level(), curHeroData.getLimit_rtg());
            return heroParam;
        }
        return null;
    }
}