const { ccclass, property } = cc._decorator;

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import PopupBase from '../../../ui/PopupBase';
import CommonListView from '../../../ui/component/CommonListView';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import SilkbagDetailCell from './SilkbagDetailCell';
import { G_UserData } from '../../../init';
import { SilkbagDataHelper } from '../../../utils/data/SilkbagDataHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';

@ccclass
export default class PopupSilkbagDetail extends PopupBase {
    public static path = 'silkbag/PopupSilkbagDetail';

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _nodeBg: CommonNormalMidPop = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listView: CommonListView = null;
    _datas = [];

    _isSeasonSilk: boolean = true;
    _callBack: any;
    _pos: any;

    onCreate() {
        this._nodeBg.setTitle(Lang.get('silkbag_detail_title'));
        this._nodeBg.addCloseEventListener(handler(this, this._onButtonClose));
    }

    onEnter() {
        this._listView.init(null, handler(this, this._onItemUpdate));
    }
    onExit() {
        if (this._callBack) {
            this._callBack();
        }
    }
    setCloseCallBack(callback) {
        this._callBack = callback;
    }
    updateUI(silkbagIds, pos) {
        this._isSeasonSilk = false;
        this._pos = pos;
        this._datas = this._getDatas(silkbagIds);
        this._listView.setData(this._datas.length);
    }
    _getDatas(silkbagIds) {
        function sortFunc(a, b) {
            var effectiveA = a.isEffective ? 1 : 0;
            var effectiveB = b.isEffective ? 1 : 0;
            if (effectiveA != effectiveB) {
                return effectiveB - effectiveA;
            } else if (a.color != b.color) {
                return b.color - a.color;
            } else {
                return a.baseId - b.baseId;
            }
        }
        var heroId = G_UserData.getTeam().getHeroIdWithPos(this._pos);
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        var heroBaseId = heroUnitData.getAvatarToHeroBaseId();
        var heroRank = heroUnitData.getRank_lv();
        var isInstrumentMaxLevel = G_UserData.getInstrument().isInstrumentLevelMaxWithPos(this._pos);
        var heroLimit = heroUnitData.getLeaderLimitLevel();
        var heroRedLimit = heroUnitData.getLeaderLimitRedLevel();
        var result = [];
        for (var i in silkbagIds) {
            var silkbagId = silkbagIds[i];
            var unitData = G_UserData.getSilkbag().getUnitDataWithId(silkbagId);
            var baseId = unitData.getBase_id();
            var isEffective = SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit)[0];
            var color = SilkbagDataHelper.getSilkbagConfig(baseId).color;
            var unit = {
                silkbagId: silkbagId,
                baseId: baseId,
                isEffective: isEffective,
                color: color
            };
            result.push(unit);
        }
        result.sort(sortFunc);
        return result;
    }
    updateUI2(silkbagIds) {
        this._datas = this._getDatas2(silkbagIds);
        this._listView.setData(this._datas.length);
    }
    _getDatas2(silkbagIds) {
        function sortFunc(a, b) {
            if (a.color != b.color) {
                return b.color - a.color;
            } else {
                return a.baseId - b.baseId;
            }
        }
        var result = [];
        for (var i in silkbagIds) {
            var silkbagId = silkbagIds[i];
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, silkbagId);
            var unit = {
                baseId: silkbagId,
                isEffective: true,
                color: param.color
            };
            result.push(unit);
        }
        result.sort(sortFunc);
        return result;
    }
    _onItemUpdate(item, index, type) {
        var index = index;
        var data = this._datas[index];
        if (data) {
            item.updateItem(index, [data, this._isSeasonSilk], type);
        } else {
            item.updateItem(index, null, type);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
    }
    _onButtonClose() {
        this.close();
    }
}