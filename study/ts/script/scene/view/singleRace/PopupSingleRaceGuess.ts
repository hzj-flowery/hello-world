const { ccclass, property } = cc._decorator;

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { SingleRaceConst } from '../../../const/SingleRaceConst';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import SingleRaceGuessTabNode from './SingleRaceGuessTabNode';
import { G_SignalManager, G_UserData, G_ServerTime, Colors } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { SingleRaceDataHelper } from '../../../utils/data/SingleRaceDataHelper';
import { Path } from '../../../utils/Path';
import CommonHelp from '../../../ui/component/CommonHelp';
import CommonListView from '../../../ui/component/CommonListView';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import PopupAlert from '../../../ui/PopupAlert';
import { SingleRaceUserData } from '../../../data/SingleRaceUserData';
import { SingleRaceGuessServerData } from '../../../data/SingleRaceGuessServerData';

@ccclass
export default class PopupSingleRaceGuess extends PopupBase {
    public static path = 'singleRace/PopupSingleRaceGuess';

    @property({ type: CommonNormalLargePop, visible: true })
    _popBG: CommonNormalLargePop = null;
    @property({ type: CommonHelp, visible: true })
    _nodeHelp: CommonHelp = null;
    @property({ type: cc.Label, visible: true })
    _textCountDown: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textCountDownTitle: cc.Label = null;
    @property({ type: cc.Node, visible: true })
    _nodeTip: cc.Node = null;
    @property({ type: cc.Sprite, visible: true })
    _imageBar1: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _imageBar2: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _imageBar3: cc.Sprite = null;
    @property({ type: SingleRaceGuessTabNode, visible: true })
    _tab1: SingleRaceGuessTabNode = null;
    @property({ type: SingleRaceGuessTabNode, visible: true })
    _tab2: SingleRaceGuessTabNode = null;
    @property({ type: SingleRaceGuessTabNode, visible: true })
    _tab3: SingleRaceGuessTabNode = null;
    @property({ type: CommonListView, visible: true })
    _listView1: CommonListView = null;
    @property({ type: CommonListView, visible: true })
    _listView2: CommonListView = null;
    @property({ type: CommonListView, visible: true })
    _listView3: CommonListView = null;
    @property(cc.Prefab)
    singleRaceGuessPlayerCell: cc.Prefab = null;
    @property(cc.Prefab)
    singleRaceGuessServerCell: cc.Prefab = null;

    _selectedTab: any;
    _curGuessUnitData: any;
    _signalSingleRaceGuessSuccess: any;
    _signalSingleRaceGuessUpdate: any;
    _signalSingleRaceStatusChange: any;
    _targetTime: any;
    _scheduleHandler: any;
    _listData: any[];

    onCreate() {
        this._initData();
        this._initView();
    }
    _initData() {

        this._selectedTab = SingleRaceConst.GUESS_TAB_TYPE_1;
        this._curGuessUnitData = null;
        this._listData = [];
    }
    _initView() {
        this._popBG.setTitle(Lang.get('single_race_guess_title'));
        this._popBG.addCloseEventListener(handler(this, this.close));
        this._nodeHelp.updateLangName('single_race_guess_rule');
        for (var i = 1; i <= 3; i++) {
            this['_tab' + i].ctor(i, handler(this, this._onClickTab));
        }
        var TAB2CELL = [
            this.singleRaceGuessPlayerCell,
            this.singleRaceGuessServerCell,
            this.singleRaceGuessServerCell
        ]
        for (var i = 1; i <= 3; i++) {
            this['_listView' + i].init(TAB2CELL[i - 1], handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
        }
    }
    onEnter() {
        this._signalSingleRaceGuessSuccess = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_GUESS_SUCCESS, handler(this, this._onEventGuessSuccess));
        this._signalSingleRaceGuessUpdate = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_GUESS_UPDATE, handler(this, this._onEventGuessUpdate));
        this._signalSingleRaceStatusChange = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_STATUS_CHANGE, handler(this, this._onEventRaceStatusChange));
        this._targetTime = SingleRaceDataHelper.getStartTime();
        this._startCountDown();
        this._updateGuessData();
        this._updateView();
    }
    onExit() {
        this._stopCountDown();
        this._signalSingleRaceGuessSuccess.remove();
        this._signalSingleRaceGuessSuccess = null;
        this._signalSingleRaceGuessUpdate.remove();
        this._signalSingleRaceGuessUpdate = null;
        this._signalSingleRaceStatusChange.remove();
        this._signalSingleRaceStatusChange = null;
    }
    _startCountDown() {
        this._stopCountDown();
        this._scheduleHandler = handler(this, this._updateCountDown);
        this.schedule(this._scheduleHandler, 1);
        this._updateCountDown();
    }
    _stopCountDown() {
        if (this._scheduleHandler != null) {
            this.unschedule(this._scheduleHandler);
            this._scheduleHandler = null;
        }
    }
    _updateCountDown() {
        var status = G_UserData.getSingleRace().getStatus();
        var [isIn] = SingleRaceDataHelper.isInGuessTime();
        var countDown = this._targetTime - G_ServerTime.getTime();
        if (status == SingleRaceConst.RACE_STATE_PRE && isIn && countDown > 0) {
            this._textCountDown.node.active = (true);
            this._textCountDownTitle.node.active = (true);
            var timeString = G_ServerTime.getLeftDHMSFormatEx(this._targetTime);
            this._textCountDown.string = (timeString);
        } else {
            this._textCountDown.node.active = (false);
            this._textCountDownTitle.node.active = (false);
        }
        if (isIn) {
            this._updateTips();
        }
    }
    _updateGuessData() {
        this._curGuessUnitData = G_UserData.getSingleRace().getGuessUnitDataWithId(this._selectedTab);
    }
    _updateView() {
        this._updateTips();
        this._updateTabs();
        this._updateBar();
        this._updateList();
    }
    _updateTips() {
        this._nodeTip.removeAllChildren();
        var [isIn, wday, hour] = SingleRaceDataHelper.isInGuessTime();
        var status = G_UserData.getSingleRace().getStatus();
        if (isIn == false && status == SingleRaceConst.RACE_STATE_PRE) {
            var strWday = Lang.get('common_wday')[Number(wday) - 1];
            var textTip = RichTextExtend.createWithContent(Lang.get('single_race_guess_open_tip', {
                wday: strWday,
                hour: hour
            }));
            this._nodeTip.addChild(textTip.node);
        }
    }
    _updateTabs() {
        for (var i = 1; i <= 3; i++) {
            var selected = i == this._selectedTab;
            var unitData = G_UserData.getSingleRace().getGuessUnitDataWithId(i);
            var voted = unitData.isVoted();
            var showRp = G_UserData.getSingleRace().hasRedPointOfGuessWithType(i);
            this['_tab' + i].setSelected(selected);
            this['_tab' + i].setVoted(voted);
            this['_tab' + i].showRP(showRp);
        }
    }
    _updateBar() {
        for (var i = 1; i <= 3; i++) {
            this['_imageBar' + i].node.active = (i == this._selectedTab);
        }
    }
    _updateList() {
        if (this._selectedTab == SingleRaceConst.GUESS_TAB_TYPE_1) {
            this._listData = G_UserData.getSingleRace().getGuessPlayerList();
        } else if (this._selectedTab == SingleRaceConst.GUESS_TAB_TYPE_2) {
            this._listData = G_UserData.getSingleRace().getGuessServerList(true);
        } else if (this._selectedTab == SingleRaceConst.GUESS_TAB_TYPE_3) {
            this._listData = G_UserData.getSingleRace().getGuessServerList(false);
        }
        //to do
        // for (var i = 1; i <= 3; i++) {
        //     this['_listView' + i].stopAutoScroll();
        // }
        //    this['_listView' + this._selectedTab].clearAll();
        this['_listView' + this._selectedTab].resize(this._listData.length);
    }
    _onItemUpdate(item, index, type) {
        var index = index;
        var data = this._listData[index];
        if (data) {
            var mySupportId = this._curGuessUnitData.getMy_support();
            var [id] = this._getIdAndNameWithData(data);
            var supportNum = this._curGuessUnitData.getSupportNumWithId(id);
            var markRes = Path.getIndividualCompetitiveImg('img_guessing_04');
            var textButton = Lang.get('single_race_guess_btn_text_support');
            if (this._selectedTab == SingleRaceConst.GUESS_TAB_TYPE_3) {
                markRes = Path.getIndividualCompetitiveImg('img_guessing_05');
                textButton = Lang.get('single_race_guess_btn_text_step');
            }
            item.updateItem(index, [data, mySupportId, supportNum, markRes, textButton], type);
        } else {
            item.updateItem(index, null, type);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
        if (SingleRaceDataHelper.checkCanGuess() == false) {
            return;
        }
        index = index + t - 1;
        var data = this._listData[index];
        var answerId = this._curGuessUnitData.getAnswer_id();
        var [supportId, name] = this._getIdAndNameWithData(data);
        var content = '';
        if (answerId == SingleRaceConst.GUESS_TAB_TYPE_1) {
            var official = data.getOfficer_level();
            var color = Colors.colorToNumber(Colors.getOfficialColor(official));
            var outlineColor = Colors.getOfficialColorOutline(official)
            content = Lang.get('single_race_guess_confirm_desc' + answerId, {
                name: name,
                color: color,
                outlineColor: Colors.colorToNumber(outlineColor)
            });
        } else {
            content = Lang.get('single_race_guess_confirm_desc' + answerId, { name: name });
        }

        UIPopupHelper.popupSystemAlert('', content, () => {
            G_UserData.getSingleRace().c2sSingleRaceAnswerSupport(answerId, supportId);
        }, null, (p) => {
            p.setCheckBoxVisible(false);
        })
        // UIPopupHelper.popupCommonView(PopupAlert, function (popup: PopupAlert) {
        //     popup.init(null, content, () => {
        //         G_UserData.getSingleRace().c2sSingleRaceAnswerSupport(answerId, supportId);
        //     });
        //     popup.openWithAction();
        // });
    }
    _getIdAndNameWithData(data) {
        var id = 0;
        var name = '';
        if (data instanceof SingleRaceUserData) {
            id = data.getUser_id();
            name = data.getUser_name();
        } else if (data instanceof SingleRaceGuessServerData) {
            id = data.getServer_id();
            name = data.getServer_name();
        }
        return [
            id,
            name
        ];
    }
    _onClickTab(index) {
        if (index == this._selectedTab) {
            return;
        }
        this._selectedTab = index;
        this._updateGuessData();
        this._updateView();
    }
    // _getItemWithId(id) {
    //     var items = this['_listView' + this._selectedTab].getItems();
    //     for (i in items) {
    //         var item = items[i];
    //         if (item.getDataId() == id) {
    //             return item;
    //         }
    //     }
    //     return null;
    // }
    _onEventGuessSuccess(eventName, answerId, supportId) {
        if (answerId == this._selectedTab) {
            this._updateGuessData();
            this._updateTabs();
            this._updateList();
        }
    }
    _onEventGuessUpdate(eventName, answerId, supportId, supportNum) {
        if (answerId == this._selectedTab) {
            this._updateGuessData();
            this['_listView' + this._selectedTab].refreshItems();
            //todo
            // var item = this._getItemWithId(supportId);
            // if (item) {
            //     item.updateCount(supportNum);
            // }
        }
    }
    _onEventRaceStatusChange(eventName, status) {
        if (status == SingleRaceConst.RACE_STATE_ING) {
            this._updateList();
        }
    }
}