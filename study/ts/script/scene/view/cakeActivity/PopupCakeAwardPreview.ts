const { ccclass, property } = cc._decorator;

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { CakeActivityConst } from '../../../const/CakeActivityConst';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { G_ServerTime, G_UserData } from '../../../init';
import { CakeActivityDataHelper } from '../../../utils/data/CakeActivityDataHelper';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import CommonHelp from '../../../ui/component/CommonHelp';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import { Util } from '../../../utils/Util';
import CakeAwardPreviewCell from './CakeAwardPreviewCell';

@ccclass
export default class PopupCakeAwardPreview extends PopupBase {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBanner: cc.Sprite = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRankTitile: cc.Label = null;


    @property({
        type: CommonHelp,
        visible: true
    })
    _commonHelp: CommonHelp = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPointTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDown: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDesc: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _ownRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOwnPoint: cc.Label = null;

    @property({
        type: CommonTabGroup,
        visible: true
    })
    _commonTab: CommonTabGroup = null;

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonNodeBk: CommonNormalLargePop = null;

    _selectTabIndex: any;
    _actStage: number;
    _targetTime: number;
    _datas: [];

    ctor(index) {
        this._selectTabIndex = index || -1;
    }
    onCreate() {
        this._actStage = CakeActivityConst.ACT_STAGE_0;
        this._targetTime = 0;
        this._datas = [];
        this._commonNodeBk.setTitle(Lang.get('cake_activity_award_preview_title'));
        this._commonNodeBk.addCloseEventListener(handler(this, this._onBtnClose));
        this._commonHelp.node.active = (false);
        this._textRankTitile.string = (Lang.get('cake_activity_rank_guild_title'));
        var name = CakeActivityDataHelper.getFoodName();
        this._textPointTitle.string = (Lang.get('cake_activity_award_preview_cake_level_des', { name: name }));
        this._textCountTime.node.x = (260);
        this._initCommonTab();
    }
    _initCommonTab() {
        var tabNameList = [
            Lang.get('cake_activity_award_preview_tab_1'),
            Lang.get('cake_activity_award_preview_tab_2')
        ];
        var param = {
            isVertical: 2,
            callback: handler(this, this._onTabSelect),
            textList: tabNameList
        };
        this._commonTab.recreateTabs(param);
    }
    _onTabSelect(index, sender) {
        if (index == this._selectTabIndex) {
            return;
        }
        this._selectTabIndex = index;
        this._updateView();
        this._updateCountDown();
    }
    onEnter() {
        this._updateView();
        this._updateRankDesc();
        this._startCountDown();
    }
    onExit() {
        this._stopCountDown();
    }
    _updateView() {
        this._updateActivityStage();
        this._updateBanner();
        this._updateList();
        this._updateDesc();
    }
    _startCountDown() {
        this._stopCountDown();
        this.schedule(this._updateCountDown, 1);
        this._updateCountDown();
    }
    _stopCountDown() {
        this.unschedule(this._updateCountDown);
    }
    _updateCountDown() {
        var countDown = this._targetTime - G_ServerTime.getTime();
        if (countDown >= 0) {
            var timeString = G_ServerTime.getLeftDHMSFormatEx(this._targetTime);
            this._textCountTime.string = (timeString);
        } else {
            this._textCountTime.string = ('');
            if (this._targetTime != 0) {
                this._updateActivityStage();
            }
        }
    }
    _updateActivityStage() {
        var [actStage, startTime, endTime] = CakeActivityDataHelper.getActStage();
        this._actStage = actStage;
        if (this._selectTabIndex == 0) {
            if (actStage == CakeActivityConst.ACT_STAGE_1) {
                this._textCountDown.string = (Lang.get('cake_activity_award_preview_countdown_title_1'));
                this._targetTime = endTime;
            } else {
                this._textCountDown.string = (Lang.get('cake_activity_award_preview_countdown_title_2'));
                this._targetTime = 0;
            }
        } else {
            if (actStage == CakeActivityConst.ACT_STAGE_1 || actStage == CakeActivityConst.ACT_STAGE_2) {
                this._textCountDown.string = (Lang.get('cake_activity_award_preview_countdown_title_3'));
                this._targetTime = CakeActivityDataHelper.getAllServerStageStartTime();
            } else if (actStage == CakeActivityConst.ACT_STAGE_3) {
                this._textCountDown.string = (Lang.get('cake_activity_award_preview_countdown_title_4'));
                this._targetTime = endTime;
            } else {
                this._textCountDown.string = (Lang.get('cake_activity_award_preview_countdown_title_5'));
                this._targetTime = 0;
            }
        }
        this._textCountDown['_updateRenderData'](true);
        var targetPosX = this._textCountDown.node.x + this._textCountDown.node.getContentSize().width + 5;
        this._textCountTime.node.x = (targetPosX);
    }
    _updateBanner() {
        if (this._selectTabIndex == 0) {
            UIHelper.loadTexture(this._imageBanner, Path.getTextAnniversaryImg('img_gold_bg08', '.jpg'));
        } else {
            UIHelper.loadTexture(this._imageBanner, Path.getTextAnniversaryImg('img_gold_bg09', '.jpg'));
        }
    }
    _updateList() {
        var batch = G_UserData.getCakeActivity().getBatchId();
        var type = 0;
        if (this._selectTabIndex == 0 || this._selectTabIndex == -1) {
            type = CakeActivityConst.RANK_AWARD_TYPE_2;
            this._commonTab.setTabIndex(0);
        } else {
            type = CakeActivityConst.RANK_AWARD_TYPE_4;
            this._commonTab.setTabIndex(1);
        }
        this._datas = G_UserData.getCakeActivity().getRankInfo(batch, type);

        this._listView.content.removeAllChildren();
        this._listView.content.height = 344;
        for (let i = 0; i < this._datas.length; i++) {
            let cell = Util.getNode("prefab/cakeActivity/CakeAwardPreviewCell", CakeAwardPreviewCell) as CakeAwardPreviewCell;
            this._listView.content.addChild(cell.node);
            var cellData = {
                index: i + 1,
                cfg: this._datas[i]
            };
            cell.updateUI(cellData);
            cell.node.x = 0;
            cell.node.y = (i + 1) * -96;
            if (Math.abs(cell.node.y) > 344) {
                this._listView.content.height = Math.abs(cell.node.y);
            }
        }
    }
    _onItemUpdate(item, index) {
        var idx = index + 1;
        var cellData = {
            index: idx,
            cfg: this._datas[idx]
        };
        item.updateUI(cellData);
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
    }
    _updateDesc() {
        if (this._selectTabIndex == 0) {
            this._textCountDesc.string = (Lang.get('cake_activity_award_preview_des_1'));
        } else {
            this._textCountDesc.string = (Lang.get('cake_activity_award_preview_des_2'));
        }
    }
    _updateRankDesc() {
        var rankData = G_UserData.getCakeActivity().getSelfGuildRank();
        var rankDes = rankData ? rankData.getRank() : Lang.get('cake_activity_no_rank');
        var levelDes = rankData ? rankData.getCake_level() : Lang.get('cake_activity_no_level');
        this._ownRank.string = (rankDes);
        this._textOwnPoint.string = (levelDes);
    }
    _onBtnClose() {
        this.close();
    }

}