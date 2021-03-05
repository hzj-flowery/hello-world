const {ccclass, property} = cc._decorator;

import CommonTabGroupHorizonClassify4 from '../../../ui/component/CommonTabGroupHorizonClassify4'

import CommonHelp from '../../../ui/component/CommonHelp'

import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { FunctionConst } from '../../../const/FunctionConst';
import { G_UserData, G_ServerTime } from '../../../init';
import GachaGoldenHeroHelper from './GachaGoldenHeroHelper';
import { GachaGoldenHeroConst } from '../../../const/GachaGoldenHeroConst';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';

@ccclass
export default class PopupGachaAwardsRank extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _nodeEmpty: CommonEmptyListNode = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBanner: cc.Sprite = null;

    @property({
        type: CommonHelp,
        visible: true
    })
    _commonHelp: CommonHelp = null;

    @property({
        type: CommonTabGroupHorizonClassify4,
        visible: true
    })
    _commonTab: CommonTabGroupHorizonClassify4 = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _scrollView: CommonCustomListViewEx = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDown: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDesc: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDes: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRankTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _ownRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPointTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOwnPoint: cc.Label = null;

    @property(cc.Prefab)
    bonusAwardCell:cc.Prefab = null;

    public static path:string = 'gachaGoldHero/PopupGachaAwardsRank';


    _rankData: any[];
    _selectTabIdx: number = 1;
    _rankConfig: any;
    _countDownScheduler: any;

    onCreate() {
        this._commonNodeBk.setTitle(Lang.get('gacha_goldenhero_shoptitle'));
        this._commonNodeBk.addCloseEventListener(handler(this, this._onBtnClose));
        this._commonHelp.updateUI(FunctionConst.FUNC_GACHA_GOLDENHERO_JOY);
        this._initCommonTab();
        this._initScrollView();
    }
    onEnter() {
        this._rankConfig = G_UserData.getGachaGoldenHero().getGoldenHeroRankCfg();
        this._onTabSelect(0);
        this._updateOwnView();
        this._countDownScheduler = handler(this, this._update);
        this.schedule(this._countDownScheduler, 0.5);
    }
    onExit() {
        if (this._countDownScheduler) {
            this.unschedule(this._countDownScheduler);
            this._countDownScheduler = null;
        }
    }
    _onBtnClose() {
        this.close();
    }
    _initCommonTab() {
        var tabNameList = [
            Lang.get('gacha_goldenhero_awardjoy'),
            Lang.get('gacha_goldenhero_awardtotal')
        ];
        var param = {
            isVertical: 2,
            callback: handler(this, this._onTabSelect),
            textList: tabNameList
        };
        this._commonTab.recreateTabs(param);
        //this._commonTab.setTabIndex(0);
    }
    _onTabSelect(index, sender?) {
        var rankType = 3-index;
        this._rankData = this._rankConfig[rankType-1] || [];
        this._selectTabIdx = index+1;
        this._updateDesc();
        this._updateOwnView();
        this._updateScrollView();
    }
    _updateDesc() {
        this._textCountDown.string = (Lang.get('gacha_goldenhero_awardtitle' + this._selectTabIdx));
        this._textCountDown['_updateRenderData'](true);
        var targetPosX = this._textCountDown.node.x + this._textCountDown.node.getContentSize().width + 5;
        this._textCountTime.node.x = (targetPosX);
        if (this._selectTabIdx == 1) {
            this._updateCountDown();
        } else {
            this._textCountDesc.string = (Lang.get('gacha_goldenhero_awardcontent2'));
            var endTime = G_UserData.getGachaGoldenHero().getEnd_time();
            if (G_ServerTime.getLeftSeconds(endTime) <= 0) {
                this._textCountTime.string = (Lang.get('gacha_goldenhero_recharging'));
            } else {
                this._textCountTime.string = ((G_ServerTime.getLeftDHMSFormatEx(G_UserData.getGachaGoldenHero().getEnd_time())).toString());
            }
        }
    }
    _updateCountDown() {
        this._textCountDesc.string = (Lang.get('gacha_goldenhero_awardcontent1'));
        var poolData = GachaGoldenHeroHelper.getGachaState();
        if (poolData && poolData.stage <= 0) {
            this._textCountTime.string = (Lang.get('gacha_goldenhero_recharging'));
            this._textCountTime.fontSize = (20);
            return;
        }
        var leftTime = G_ServerTime.getLeftSeconds(poolData.countDowm);
        if (leftTime <= 0) {
            poolData = GachaGoldenHeroHelper.getGachaState();
        }
        if (poolData.isLottery) {
            this._textCountTime.string = (Lang.get('gacha_goldenhero_awarding'));
        } else {
            if (poolData.isCrossDay) {
                if (poolData.isOver) {
                    this._textCountTime.string = (Lang.get('gacha_goldenhero_joy_overjoy'));
                } else {
                    this._textCountTime.string = (Lang.get('gacha_goldenhero_awarding2'));
                }
            } else {
                this._textCountTime.string = (G_ServerTime.getLeftDHMSFormatEx(poolData.countDowm)).toString();
            }
        }
    }
    _initScrollView() {
        this._scrollView.setCallback(handler(this, this._onCellUpdate), handler(this, this._onCellSelected));
        this._scrollView.setCustomCallback(handler(this, this._onCellTouch));
        this._scrollView.setTemplate(this.bonusAwardCell);
    }
    _updateOwnView() {
        var ownRankData = G_UserData.getGachaGoldenHero().getOwnRankData();
        var curRank = ownRankData[GachaGoldenHeroConst.FLAG_OWNRANK + this._selectTabIdx];
        if (curRank) {
            var str = curRank.rank == 0 && Lang.get('common_text_no_rank') || (curRank.rank).toString();
            if (curRank.rank == 0 && curRank.point > 0) {
                str = Lang.get('gacha_goldenhero_awardsjoin');
            }
            this._ownRank.string = (str);
            this._textOwnPoint.string = (curRank.point);
        }
    }
    _updateScrollView() {
        //this._rankView.updateListView(1, table.nums(this._rankData));
        this._scrollView.resize(this._rankData.length);
    }
    _onCellUpdate(cell, index) {
        var idx = index + 1;
        var cellData = {
            index: idx,
            cfg: this._rankData[idx-1]
        };
        cell.updateUI(cellData);
    }
    _onCellSelected(cell, index) {
    }
    _onCellTouch(index, data) {
    }
    _update(dt) {
        this._updateDesc();
    }

}
