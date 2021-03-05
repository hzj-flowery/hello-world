const {ccclass, property} = cc._decorator;

import CommonTabGroupHorizon4 from '../../../ui/component/CommonTabGroupHorizon4'
import { G_UserData, G_SignalManager, Colors, G_ServerTime } from '../../../init';
import GachaGoldenHeroHelper from './GachaGoldenHeroHelper';
import { GachaGoldenHeroConst } from '../../../const/GachaGoldenHeroConst';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { Lang } from '../../../lang/Lang';
import ViewBase from '../../ViewBase';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';

@ccclass
export default class PointRankView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resource: cc.Node = null;

    @property({
        type: CommonTabGroupHorizon4,
        visible: true
    })
    _tabNode: CommonTabGroupHorizon4 = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _rankRcrollView: CommonCustomListViewEx = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRankBack: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOwnRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOwnServerName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOwnName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOwnPoint: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRank: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnRank: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property(cc.Prefab)
    pointRankCell:cc.Prefab = null;

    _ladders: any[];
    _selectedTabIdx: number;
    _signalGachaLadder: any;
    _oriPosition: cc.Vec2;
    _oriBtnRankPosition: cc.Vec2;
    _oriSize: cc.Size;
    _newTargetPos: cc.Vec2;
    _newBtnRankPos: cc.Vec2;
    _poolData: any;

    ctor() {

        this._ladders = [];
        this._selectedTabIdx = 1;
        this.setSceneSize();
        UIHelper.addClickEventListenerEx(this._panelTouch, handler(this, this._onButtonArrow));
    }
    onCreate() {
        this.ctor();
        this._initPosition();
        this._initCommonTab();
        this._initScrollView();
    }
    onEnter() {
        this._signalGachaLadder = G_SignalManager.add(SignalConst.EVENT_GACHA_GOLDENHERO_JOYRANK, handler(this, this._onEventGachaLadder));
        this._updateTab();
        this._updateScrollView();
        this._updateOwnInfo(0, '0');
    }
    onExit() {
        this._signalGachaLadder.remove();
        this._signalGachaLadder = null;
    }
    _initPosition() {
        this._oriPosition = cc.v2(this._resource.getPosition());
        this._oriBtnRankPosition = cc.v2(this._btnRank.node.getPosition());
        this._oriSize = this._resource.getContentSize();
        this._newTargetPos = cc.v2(this._oriPosition.x - this._oriSize.width, this._oriPosition.y);
        this._newBtnRankPos = cc.v2(94, this._oriBtnRankPosition.y);
    }
    _onButtonArrow() {
        var bVisible = !this._resource.active;
        //this._btnRank.setFlippedX(!bVisible);
        if(!bVisible){
            this._btnRank.node.angle = -180;
        }else{
            this._btnRank.node.angle = 0;
        }
        if (bVisible) {
            this._resource.active = (true);
            this._resource.runAction(cc.sequence(cc.callFunc(function () {
                this._imageRank.node.active = (false);
            }, this), cc.moveBy(0.2, cc.v2(this._oriPosition.x - this._newTargetPos.x, this._oriPosition.y - this._newTargetPos.y))));
            var moveTarget = cc.v2(this._oriBtnRankPosition.x - this._newBtnRankPos.x, this._oriBtnRankPosition.y - this._newBtnRankPos.y)
            this._btnRank.node.runAction(cc.moveBy(0.2, moveTarget));
        } else {
            var targetPos = cc.v2(this._newTargetPos.x - this._oriPosition.x, this._newTargetPos.y - this._oriPosition.y);
            this._resource.runAction(cc.sequence(cc.moveBy(0.2, targetPos), cc.callFunc(function () {
                this._resource.active = (false);
                this._imageRank.node.active = (true);
            },this)));
            var targetPos1 = cc.v2(this._newBtnRankPos.x - this._oriBtnRankPosition.x, this._newBtnRankPos.y - this._oriBtnRankPosition.y);
            this._btnRank.node.runAction(cc.moveBy(0.2, targetPos1));
        }
    }
    _onEventGachaLadder(id, message) {
        if (this._selectedTabIdx == 2) {
            if (message.ladder_type == 0) {
                this._ladders = (message['ladders']) || {};
                this._updateScrollView();
                this._updateOwnRank();
            }
        } else if (this._selectedTabIdx == 1) {
            this._ladders = (message['ladders']) || {};
            this._updateScrollView();
            this._updateOwnRank();
        }
    }
    _updateOwnRank() {
        var ownRankData = G_UserData.getGachaGoldenHero().getOwnRankData();
        var curRank = ownRankData[GachaGoldenHeroConst.FLAG_OWNRANK + this._selectedTabIdx];
        if (curRank) {
            this._updateOwnInfo(curRank.rank, curRank.point);
        }
    }
    _initCommonTab() {
        var listTitle = [
            Lang.get('gacha_goldenhero_curpoint'),
            Lang.get('gacha_goldenhero_totalpoint')
        ];
        this._tabNode.setCustomColor([
            [
                Colors.GOLDENHERO_RANK_COLOR_NML,
                null
            ],
            [
                Colors.GOLDENHERO_RANK_COLOR_IMP,
                null
            ]
        ]);
        var param = {
            isVertical: 2,
            callback: handler(this, this._onTabSelect),
            textList: listTitle
        };
        this._tabNode.recreateTabs(param);
    }
    _onTabSelect(index, sender?) {
        this._ladders = [];
        this._selectedTabIdx = index+1;
        this._updateScrollView();
        if (index+1 == 2) {
            G_UserData.getGachaGoldenHero().c2sGachaLadder(0);
        } else if (index+1 == 1) {
            G_UserData.getGachaGoldenHero().c2sGachaLadder(1);
        }
    }
    _updateTab() {
        var index = 1;
        this._poolData = GachaGoldenHeroHelper.getGachaState();
        if (G_ServerTime.getLeftSeconds(this._poolData.countDowm) <= 0 || this._poolData.isCrossDay) {
            index = 2;
        }
        this._tabNode.setTabIndex(index-1);
        this._onTabSelect(index-1);
    }
    _initScrollView() {
        this._imageRank.node.active = (false);
        // var scrollViewParam = {
        //     template: PointRankCell,
        //     updateFunc: handler(this, this._onUpdate),
        //     selectFunc: c,
        //     touchFunc: handler(this, this._onCellTouch)
        // };
        // this._tabListView = new TabScrollView(this._rankRcrollView, scrollViewParam, 1);
        this._rankRcrollView.setCallback(handler(this, this._onUpdate), handler(this, this._onCellSelected));
        this._rankRcrollView.setTemplate(this.pointRankCell);

    }
    _onUpdate(cell, cellIndex) {
        if (this._ladders.length <= 0) {
            return;
        }
        var newIdx = cellIndex + 1;
        var cellData = {
            index: newIdx,
            cfg: this._ladders[newIdx-1]
        };
        cell.updateUI(cellData);
    }
    _onCellSelected(cell, cellIndex) {
    }
    _onCellUpdate(cellIndex, data) {
    }
    _updateScrollView() {
        //this._tabListView.updateListView(1, table.nums(this._ladders));
        this._rankRcrollView.resize(this._ladders.length);
    }
    _updateOwnInfo(index, point) {
        var rank = index == 0 && Lang.get('common_text_none') || index;
        if (parseInt(index) == 0 && parseInt(point) > 0) {
            rank = Lang.get('common_text_join');
        }
        var fontSize = typeof(rank) == 'number' && 20 || 18;
        this._textOwnRank.string = (rank);
        this._textOwnRank.fontSize = (fontSize);
        if (typeof(index) != 'number' || index == 0) {
            index = 4;
        }
        var serverName = G_UserData.getBase().getReal_server_name();
        var result = serverName.match('(%a+[%d+%-%,]+)');
        var result1 = serverName.match('([%d+%-%,]+)');
        if (result != null && result.length > 0) {
            serverName = result[0];
        } else if (result1 != null && result1.length > 0) {
            serverName = result1[0];
        }
        var newIdx = index <= 3 && index || 4;
        UIHelper.loadTexture(this._imageRankBack, Path.getComplexRankUI(GachaGoldenHeroConst.JOYBONUS_RANKINDEX_BG[newIdx-1]));
        this._textOwnServerName.string = (GachaGoldenHeroHelper.getFormatServerName(serverName, 5));
        this._textOwnName.string = (G_UserData.getBase().getName());
        this._textOwnPoint.string = (point);
    }    

}
