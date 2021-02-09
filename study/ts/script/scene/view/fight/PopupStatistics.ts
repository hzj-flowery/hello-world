const { ccclass, property } = cc._decorator;

import CommonTabGroupHorizon from '../../../ui/component/CommonTabGroupHorizon'
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { StatisticsTotal } from '../../../fight/report/StatisticsTotal';
import PopupStatisticsCell from './PopupStatisticsCell';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import PopupBase from '../../../ui/PopupBase';

@ccclass
export default class PopupStatistics extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _panelBase: CommonNormalLargePop = null;

    @property({
        type: CommonTabGroupHorizon,
        visible: true
    })
    _tabPage: CommonTabGroupHorizon = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listViewPet: CommonCustomListViewEx = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _popupStatisticsCellPrefab: cc.Prefab = null;

    private _statisticsData: StatisticsTotal;
    private _selectTabIndex;
    private _cells: PopupStatisticsCell[];
    private _petCells: PopupStatisticsCell[];
    init(statisticsData) {
        this._statisticsData = statisticsData;
        this._selectTabIndex = null;
        this._cells = [];
        this._petCells = [];
    }
    onCreate() {
        this._panelBase.addCloseEventListener(handler(this, this._onCloseClick));
        this._panelBase.setTitle(Lang.get('fight_statistics_title'));
        this._initTab();
    }
    onEnter() {
        var list1 = this._statisticsData.getDataListByCamp(1);
        var list2 = this._statisticsData.getDataListByCamp(2);
        var maxDamage1 = this._statisticsData.getMaxDamage();
        var maxDamage2 = this._statisticsData.getMaxDamage();
        for (var i = 1; i <= 6; i++) {
            var cell = cc.instantiate(this._popupStatisticsCellPrefab).getComponent(PopupStatisticsCell);
            cell.init(list1[i - 1], list2[i - 1], maxDamage1, maxDamage2, false);
            this._listView.pushBackCustomItem(cell.node);
            this._cells.push(cell);
        }
    }
    _initTab() {
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            offset: 3,
            textList: [
                Lang.get('fight_statistics_damage'),
                Lang.get('fight_statistics_features'),
                Lang.get('fight_statistics_pet')
            ]
        };
        this._tabPage.recreateTabs(param);
    }
    _onCloseClick() {
        this.closeWithAction();
    }
    _onTabSelect(index) {
        index += 1;
        if (this._selectTabIndex == index) {
            return;
        }
        this._selectTabIndex = index;
        var isPetPage = false;
        if (index == 1) {
            for (let i in this._cells) {
                var v = this._cells[i];
                v.refreshData(PopupStatisticsCell.TYPE_DAMAGE);
            }
        } else if (index == 2) {
            for (let i in this._cells) {
                var v = this._cells[i];
                v.refreshData(PopupStatisticsCell.TYPE_FEATURE);
            }
        } else if (index == 3) {
            this._createPetList();
            isPetPage = true;
        }
        this._listView.setVisible(!isPetPage);
        this._listViewPet.setVisible(isPetPage);
    }
    _createPetList() {
        if (this._petCells.length != 0) {
            return;
        }
        var list1 = this._statisticsData.getPetDataListByCamp(1);
        var list2 = this._statisticsData.getPetDataListByCamp(2);
        var listCount = list1.length > list2.length && list1.length || list2.length;
        for (var i = 1; i <= listCount; i++) {
            var cell = cc.instantiate(this._popupStatisticsCellPrefab).getComponent(PopupStatisticsCell);
            cell.init(list1[i - 1], list2[i - 1], null, null, true);
            this._listViewPet.pushBackCustomItem(cell.node);
            this._petCells.push(cell);
        }
    }

}