const { ccclass, property } = cc._decorator;

import CommonTabGroupVertical2 from '../../../ui/component/CommonTabGroupVertical2'
import PopupBase from '../../../ui/PopupBase';
import { CakeActivityConst } from '../../../const/CakeActivityConst';
import { G_UserData, G_SignalManager, G_ServerTime, G_Prompt } from '../../../init';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { SignalConst } from '../../../const/SignalConst';
import { TimeConst } from '../../../const/TimeConst';
import { FunctionConst } from '../../../const/FunctionConst';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { CakeActivityDataHelper } from '../../../utils/data/CakeActivityDataHelper';
import { GuildServerAnswerHelper } from '../guildServerAnswer/GuildServerAnswerHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import { Util } from '../../../utils/Util';
import CakeGetEggCell from './CakeGetEggCell';
import CakeGetCreamCell from './CakeGetCreamCell';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';

@ccclass
export default class PopupCakeGet extends PopupBase {

    @property({
        type: CommonTabGroup,
        visible: true
    })
    _nodeTabRoot: CommonTabGroup = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDownTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDown: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDes: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTip: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView1: cc.ScrollView = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView2: cc.ScrollView = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    

    @property({
        type: cc.Sprite,
        visible: true
    })
    _textImagePayTip: cc.Sprite = null;
    _selectTabIndex: number = -1;
    _datas1: any[];
    _datas2: any[];
    _targetTime: number;
    _signalGetTaskReward: any;
    _signalUpdateTaskInfo: any;
    _signalGetRechargeReward: any;
    _signalEnterSuccess: any;
    _signalRechargeReward:any;

    initData(index) {
        this._selectTabIndex = index || (CakeActivityConst.MATERIAL_TYPE_1 - 1);
    }
    onCreate() {
        this._datas1 = [];
        this._datas2 = [];
        this._targetTime = 0;
        this._initTabGroup();
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_MAIN, true);
        this._topbarBase.setBGType(2);
        this._topbarBase.hideBack();
        this._topbarBase.updateUIByResList([
            {
                type: 0,
                value: 0
            },
            {
                type: 0,
                value: 0
            },
            {
                type: 0,
                value: 0
            },
            {
                type: TypeConvertHelper.TYPE_RESOURCE,
                value: DataConst.RES_JADE2
            }
        ], true);
        this.setSceneSize();
    }
    _initTabGroup() {
        // this._listView1.setTemplate(CakeGetEggCell);
        // this._listView1.setCallback(handler(this, this._onItemUpdate1), handler(this, this._onItemSelected1));
        // this._listView1.setCustomCallback(handler(this, this._onItemTouch1));
        // this._listView2.setTemplate(CakeGetCreamCell);
        // this._listView2.setCallback(handler(this, this._onItemUpdate2), handler(this, this._onItemSelected2));
        // this._listView2.setCustomCallback(handler(this, this._onItemTouch2));
        this._textImagePayTip.node.active = (false);
        var tabNameList = CakeActivityDataHelper.getTabTitleNames();
        var param = {
            callback: handler(this, this._onTabSelect),
            textList: tabNameList
        };
        this._nodeTabRoot.setCustomColor([
            [new cc.Color(93, 112, 164)],
            [new cc.Color(206, 104, 36)]
        ]);
        this._nodeTabRoot.recreateTabs(param);
    }
    onEnter() {
        this._signalGetTaskReward = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_GET_TASK_REWARD, handler(this, this._onEventGetTaskReward));
        this._signalUpdateTaskInfo = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_TASK_INFO, handler(this, this._onEventUpdateTaskInfo));
        this._signalGetRechargeReward = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_GET_RECHARGE_REWARD, handler(this, this._onEventGetRechargeReward));
        this._signalEnterSuccess = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_ENTER_SUCCESS, handler(this, this._onEventEnterSuccess));
        this._signalRechargeReward = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_RECHARGE_REWARD, handler(this, this._onEventRechargeReward));
        if (G_UserData.getCakeActivity().isExpired(TimeConst.RESET_TIME_24)) {
            G_UserData.getCakeActivity().c2sEnterCakeActivity();
        }
        if (this._selectTabIndex == -1) {
            this._nodeTabRoot.setTabIndex(0);
        }
        else {
            this._nodeTabRoot.setTabIndex(this._selectTabIndex);
        }
        this._updateList();
        var startTime1 = G_UserData.getCakeActivity().getActivityStartTime();
        var endTime1 = startTime1 + CakeActivityConst.CAKE_LOCAL_TIME;
        var startTime2 = endTime1 + CakeActivityConst.CAKE_TIME_GAP;
        var endTime2 = startTime2 + CakeActivityConst.CAKE_CROSS_TIME;
        this._targetTime = endTime2;
        this._startCountDown();
        this._updateRp();
    }
    onExit() {
        this._stopCountDown();
        this._signalGetTaskReward.remove();
        this._signalGetTaskReward = null;
        this._signalUpdateTaskInfo.remove();
        this._signalUpdateTaskInfo = null;
        this._signalGetRechargeReward.remove();
        this._signalGetRechargeReward = null;
        this._signalEnterSuccess.remove();
        this._signalEnterSuccess = null;
        this._signalRechargeReward.remove();
        this._signalRechargeReward = null;
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
            this._textCountDownTitle.string = (Lang.get('cake_activity_countdown_common_title'));
            this._textCountDownTitle.node.x = (58 - 100);
            var timeString = G_ServerTime.getLeftDHMSFormatEx(this._targetTime);
            this._textCountDown.string = (timeString);
        } else {
            this._textCountDownTitle.string = (Lang.get('cake_activity_countdown_finish'));
            this._textCountDownTitle.node.x = (100 - 100);
            this._textCountDown.string = ('');
            this._stopCountDown();
        }
    }
    _onTabSelect(index, sender) {
        if (index == this._selectTabIndex) {
            return;
        }
        this._selectTabIndex = index;
        this._updateList();
        if (this._selectTabIndex == CakeActivityConst.MATERIAL_TYPE_2 - 1) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_CAKE_ACTIVITY_GET_MATERIAL, { index: CakeActivityConst.MATERIAL_TYPE_2 });
            this._nodeTabRoot.setRedPointByTabIndex(index, false);
        }
        this._updateRp();
    }
    _updateList() {
        if (this._selectTabIndex == CakeActivityConst.MATERIAL_TYPE_1 - 1) {
            this._updateList1();
        } else {
            this._updateList2();
        }
    }
    _updateList1() {
        this._listView1.node.active = (true);
        this._listView2.node.active = (false);
        this._textImagePayTip.node.active = (false);
        UIHelper.loadTexture(this._imageDes, Path.getTextAnniversaryImg('txt_anniversary04', null))
        this._imageTip.node.active = (true);
        this._datas1 = G_UserData.getCakeActivity().getTaskList();
        this._listView1.content.removeAllChildren();
        this._listView1.content.height = 370;
        for (let i = 0; i < this._datas1.length; i++) {
            let cell = Util.getNode("prefab/cakeActivity/CakeGetEggCell", CakeGetEggCell) as CakeGetEggCell;
            this._listView1.content.addChild(cell.node);
            cell.setIdx(i);
            cell.updateUI(this._datas1[i]);
            cell.setCustomCallback(handler(this,this._onItemTouch1));
            cell.node.x = 0;
            cell.node.y = (-i - 1) * 86
            if (Math.abs(cell.node.y) > 370) {
                this._listView1.content.height = Math.abs(cell.node.y);
            }
        }
    }
    _updateList2() {
        this._listView1.node.active = (false);
        this._listView2.node.active = (true);
        this._textImagePayTip.node.active = (true);
        UIHelper.loadTexture(this._imageDes, Path.getTextAnniversaryImg('txt_anniversary05', null))
        this._imageTip.node.active = (false);
        this._datas2 = G_UserData.getCakeActivity().getChargeList();
        this._listView2.content.removeAllChildren();
        this._listView2.content.width = 702;
        for (let i = 0; i < this._datas2.length; i++) {
            let cell = Util.getNode("prefab/cakeActivity/CakeGetCreamCell", CakeGetCreamCell) as CakeGetCreamCell;
            this._listView2.content.addChild(cell.node);
            cell.setIdx(i);
            cell.updateUI(this._datas2[i]);
            cell.setCustomCallback(handler(this,this._onItemTouch2));
            cell.node.x = 200 * i;
            cell.node.y = -370
            if (cell.node.x + 200 > 702) {
                this._listView2.content.width = cell.node.x + 200;
            }
        }
    }
    _onItemUpdate1(item, index) {
        var data = this._datas1[index];
        if (data) {
            item.update(data);
        }
    }
    _onItemSelected1(item, index) {
    }
    _onItemTouch1(index, state) {
        var index = index;
        var data = this._datas1[index];
        var taskId = data.getCurShowId();
        if (state == CakeActivityConst.TASK_STATE_1) {
            var actStage = CakeActivityDataHelper.getActStage()[0];
            if (actStage == CakeActivityConst.ACT_STAGE_0 || actStage == CakeActivityConst.ACT_STAGE_4) {
                G_Prompt.showTip(Lang.get('cake_activity_act_end_tip'));
                return;
            }
            var info = CakeActivityDataHelper.getCurCakeTaskConfig(taskId);
            var functionId = 0;
            if (taskId == 600) {
                var ids = info.function_id.split('|');
                var isToday = GuildServerAnswerHelper.isTodayOpen();
                if (isToday) {
                    functionId = parseInt(ids[1]);
                } else {
                    functionId = parseInt(ids[0]);
                }
            } else {
                functionId = parseInt(info.function_id);
            }
            WayFuncDataHelper.gotoModuleByFuncId(functionId);
        } else if (state == CakeActivityConst.TASK_STATE_2) {
            G_UserData.getCakeActivity().c2sGetCakeActivityTaskReward(taskId);
        }
    }
    _onItemUpdate2(item, index) {
        var data = this._datas2[index + 1];
        if (data) {
            item.update(data);
        }
    }
    _onItemSelected2(item, index) {
    }
    _onItemTouch2(index, t) {
        var index = index + t;
        var id = this._datas2[index-1];
        G_UserData.getCakeActivity().c2sExchargeReward(id);
    }
    onClickClose() {
        this.close();
    }
    _onEventGetTaskReward(eventName, taskId, awards) {
        G_Prompt.showAwards(awards);
        if (this._selectTabIndex == CakeActivityConst.MATERIAL_TYPE_1 - 1) {
            this._updateList1();
        }
        this._updateRp();
    }
    _onEventUpdateTaskInfo(eventName) {
        if (this._selectTabIndex == CakeActivityConst.MATERIAL_TYPE_1 - 1) {
            this._updateList1();
        }
    }
    _onEventGetRechargeReward(eventName, awards) {
        G_Prompt.showAwards(awards);
    }
    _onEventEnterSuccess() {
        this._updateList();
    }
    _updateRp() {
        var show1 = G_UserData.getCakeActivity().isHaveCanGetMaterial();
        this._nodeTabRoot.setRedPointByTabIndex(CakeActivityConst.MATERIAL_TYPE_1, show1, cc.v2(0.82, 0.8));
        var show2 = G_UserData.getCakeActivity().isPromptRecharge();
        this._nodeTabRoot.setRedPointByTabIndex(CakeActivityConst.MATERIAL_TYPE_2, show2, cc.v2(0.82, 0.8));
    }
    _onEventRechargeReward(eventName, awards) {
        G_Prompt.showAwards(awards);
    }

}