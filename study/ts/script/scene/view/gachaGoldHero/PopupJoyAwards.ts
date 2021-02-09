const {ccclass, property} = cc._decorator;

import CommonTabGroupHorizon5 from '../../../ui/component/CommonTabGroupHorizon5'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { Colors, G_UserData } from '../../../init';
import { handler } from '../../../utils/handler';
import GachaGoldenHeroHelper from './GachaGoldenHeroHelper';
import { table } from '../../../utils/table';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';

@ccclass
export default class PopupJoyAwards extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonBack: CommonNormalLargePop = null;

    @property({
        type: CommonTabGroupHorizon5,
        visible: true
    })
    _commonTab: CommonTabGroupHorizon5 = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _scrollView: CommonCustomListViewEx = null;

    @property(cc.Prefab)
    joyAwardsCell:cc.Prefab = null;


    _curTabIndex: number;
    _awardsData: any[];

    public static path:string = 'gachaGoldHero/PopupJoyAwards';

    ctor() {
        this._curTabIndex = 1;
        this._awardsData = [];
        this.setSceneSize();
    }
    onCreate() {
        this.ctor();
        this._initCommonTab();
        this._initCommonBack();
        this._initScrollView();
    }
    onEnter() {
        this._updateTab();
    }
    onExit() {
    }
    _initCommonBack() {
        this._commonBack.setTitle(Lang.get('gacha_goldenjoy_daily'));
        this._commonBack.addCloseEventListener(function () {
            this.close();
        }.bind(this));
    }
    _initCommonTab() {
        var tabNameList = [
            Lang.get('gacha_goldenjoy_firstday'),
            Lang.get('gacha_goldenjoy_secondtday')
        ];
        this._commonTab.setCustomColor([
            [
                Colors.GOLDENHERO_TAB_COLOR_NML,
                null
            ],
            [
                Colors.GOLDENHERO_TAB_COLOR_IMP,
                null
            ]
        ]);
        var param = {
            isVertical: 2,
            callback: handler(this, this._onTabSelect),
            textList: tabNameList
        };
        this._commonTab.recreateTabs(param);
    }
    _onTabSelect(index) {
        if (this._curTabIndex == index+1) {
            return;
        }
        this._curTabIndex = index+1;
        this._updateScrollView();
    }
    _initScrollView() {
        var scrollViewParam = {
            //template: JoyAwardsCell,
            updateFunc: handler(this, this._onCellUpdate),
            selectFunc: handler(this, this._onCellSelected),
            touchFunc: handler(this, this._onCellTouch)
        };
        this._scrollView.setCallback(handler(this, this._onCellUpdate), handler(this, this._onCellSelected));
        this._scrollView.setCustomCallback(handler(this, this._onCellTouch));
        this._scrollView.setTemplate(this.joyAwardsCell);
        //this._listView = new TabScrollView(this._scrollView, scrollViewParam);
    }
    _updateTab() {
        var awardData = G_UserData.getGachaGoldenHero().getGoldenJoyDraw()[1] || [];
        var dropId = awardData.length > 0 && awardData[awardData.length-1].drop_id || 0;
        if (dropId > 0 && G_UserData.getGachaGoldenHero().getDrop_id() > dropId) {
            this._commonTab.setTabIndex(1);
            this._onTabSelect(2);
        } else {
            this._updateScrollView();
        }
    }
    _updateScrollView() {
        this._awardsData = G_UserData.getGachaGoldenHero().getGoldenJoyDraw()[this._curTabIndex] || [];
        var awards = this._awardsData.length;
        var lineCount = Math.ceil(awards / 7);
        this._scrollView.resize(lineCount);
        //this._listView.updateListView(this._scrollView, lineCount);
    }
    _onCellUpdate(cell, cellIdx) {
        if (!this._awardsData) {
            return;
        }
        var cellData = [];
        var firstIdx = cellIdx * 7 + 1;
        var lastIdx = cellIdx * 7 + 7;
        var poolData = GachaGoldenHeroHelper.getGachaState();
        var dropId = G_UserData.getGachaGoldenHero().getDrop_id();
        for (var i = firstIdx; i<=lastIdx; i++) {
            if (this._awardsData[i-1]) {
                table.insert(cellData, {
                    index: i,
                    cfg: this._awardsData[i-1],
                    dropId: dropId
                });
            }
        }
        cell.updateUI(cellData);
    }
    _onCellSelected(cell, cellIdx) {
    }
    _onCellTouch(cellIdx, callBackData) {
    }
}
