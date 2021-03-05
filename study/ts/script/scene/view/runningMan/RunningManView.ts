const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { HomelandConst } from '../../../const/HomelandConst';
import { RunningManConst } from '../../../const/RunningManConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { Colors, G_AudioManager, G_Prompt, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonCountdownAnimation from '../../../ui/component/CommonCountdownAnimation';
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import PopupItemUse from '../../../ui/PopupItemUse';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { ResourceData } from '../../../utils/resource/ResourceLoader';
import ViewBase from '../../ViewBase';
import { HomelandHelp } from '../homeland/HomelandHelp';
import ListView from '../recovery/ListView';
import PopupRunningManCell from './PopupRunningManCell';
import PopupRunningManResult from './PopupRunningManResult';
import { RunningManHelp } from './RunningManHelp';
import RunningManMiniMap from './RunningManMiniMap';
import RunningManScrollView from './RunningManScrollView';

@ccclass
export default class RunningManView extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _panelbk: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeScroll: cc.Node = null;

    @property({ type: CommonTopbarBase, visible: true })
    _topbarBase: CommonTopbarBase = null;

    @property({ type: cc.Node, visible: true })
    _panelTop: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _topDesc: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _topTime: cc.Label = null;

    @property({ type: CommonHelpBig, visible: true })
    _commonHelp: CommonHelpBig = null;

    @property({ type: CommonMiniChat, visible: true })
    _commonChat: CommonMiniChat = null;

    @property({ type: CommonMainMenu, visible: true })
    _betIcon: CommonMainMenu = null;

    @property({ type: cc.Node, visible: true })
    _nodeMiniMap: cc.Node = null;

    @property({ type: CommonCountdownAnimation, visible: true })
    _commonCountDown: CommonCountdownAnimation = null;

    @property({ type: RunningManScrollView, visible: true })
    _scrollView: RunningManScrollView = null;

    @property({ type: RunningManMiniMap, visible: true })
    _miniMap: RunningManMiniMap = null;

    @property({ type: ListView, visible: true })
    _listItemSource: ListView = null;

    @property({ type: cc.Prefab, visible: true })
    _runningManCellPrefab: cc.Prefab = null;

    private static MAX_TIME = 3;
    private _gfxEffect;
    private _popupResult: PopupRunningManResult;
    private _interVal = 0;
    private _runningEndEventTimes = 0;
    private _runningResult;

    private _signalPlayHorseResult;
    private _signalPlayHorseGfxEvent;
    private _signalPlayHorseRunningEnd;
    private _signalPlayHorseInfo;
    private _signalPlayHorseBetSuccess;
    private _popupResultSignal;
    private _currState;

    protected preloadResList: ResourceData[] = [
        { path: Path.getPrefab("PopupRunningManResult", "runningMan"), type: cc.Prefab }
    ];
    private _dataList: any[];

    public static waitEnterMsg(callBack) {
        function onMsgCallBack() {
            callBack();
            signal.remove();
            signal = null;
        }
        var currState = RunningManHelp.getRunningState();
        var signal;
        if (currState >= RunningManConst.RUNNING_STATE_WAIT) {
            G_UserData.getRunningMan().c2sPlayHorseInfo();
            signal = G_SignalManager.add(SignalConst.EVENT_PLAY_HORSE_RESULT_SUCCESS, onMsgCallBack);
            return signal;
        } else {
            G_UserData.getRunningMan().c2sPlayHorseInfo();
            signal = G_SignalManager.add(SignalConst.EVENT_PLAY_HORSE_INFO_SUCCESS, onMsgCallBack);
            return signal;
        }
    }

    public onCreate() {
        this.setSceneSize();

        G_UserData.getRunningMan().resetTalkList();

        this._topbarBase.setImageTitle('txt_sys_com_run');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_RUNNING_MAN);

        this._betIcon.updateUI(FunctionConst.FUNC_RUNNING_BET);
        this._betIcon.addClickEventListenerEx(handler(this, this._onClickIcon));

        this._nodeMiniMap.active = false;
        this._commonHelp.updateUI(FunctionConst.FUNC_RUNNING_MAN);
        this._runningResult = null;

        this._commonChat.setDanmuVisible(false);
    }

    public onExit() {
        this._signalPlayHorseResult.remove();
        this._signalPlayHorseResult = null;
        this._signalPlayHorseGfxEvent.remove();
        this._signalPlayHorseGfxEvent = null;
        this._signalPlayHorseRunningEnd.remove();
        this._signalPlayHorseRunningEnd = null;
        this._signalPlayHorseInfo.remove();
        this._signalPlayHorseInfo = null;
        this._signalPlayHorseBetSuccess.remove();
        this._signalPlayHorseBetSuccess = null;
    }

    public onEnter() {
        this._runningEndEventTimes = 0;
        this._interVal = 0;
        G_AudioManager.playMusicWithId(AudioConst.MUSIC_RUNNING);
        this._commonCountDown.node.active = false;
        this._listItemSource.node.active = true;
        this._signalPlayHorseInfo = G_SignalManager.add(SignalConst.EVENT_PLAY_HORSE_INFO_SUCCESS, handler(this, this._onEventPlayHorseInfo));
        this._signalPlayHorseResult = G_SignalManager.add(SignalConst.EVENT_PLAY_HORSE_RESULT_SUCCESS, handler(this, this._onEventPlayHorseResult));
        this._signalPlayHorseGfxEvent = G_SignalManager.add(SignalConst.EVENT_PLAY_HORSE_POST_RUNNING_START, handler(this, this._onEventGfxCountDown));
        this._signalPlayHorseRunningEnd = G_SignalManager.add(SignalConst.EVENT_PLAY_HORSE_HERO_RUNNING_END, handler(this, this._onEventRunningEnd));
        this._signalPlayHorseBetSuccess = G_SignalManager.add(SignalConst.EVENT_PLAY_HORSE_BET_SUCCESS, handler(this, this._onEventPlayHorseBetSuccess));
        this._procEnterState();
        this._updateTime(0);
        this._updateRedPoint();
    }

    public update(dt) {
        this._updateStateChange();
        this._updateTime(dt);
        if (this._currState == RunningManConst.RUNNING_STATE_RUNNING) {
            var list = G_UserData.getRunningMan().getMatch_info();
            this._scrollView.updateRunning(dt);
            this._miniMap.updateUI();
        }
        if (this._currState == RunningManConst.RUNNING_STATE_WAIT) {
            if (this._interVal > 1) {
                var matchList = G_UserData.getRunningMan().getMatch_info();
                if (matchList && matchList.length == 0) {
                }
                this._interVal = 0;
            }
            this._interVal = this._interVal + dt;
        }
    }

    private _onClickIcon(sender) {
        var runningState = RunningManHelp.getRunningState();
        if (runningState == RunningManConst.RUNNING_STATE_PRE_START) {
            G_Prompt.showTip(Lang.get('runningman_tip1'));
            return;
        }
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RUNNING_BET);
    }

    private _procEnterState() {
        var state = RunningManHelp.getRunningState();
        var oldState = 0;
        this._currState = state;
        var stateName = RunningManConst.getStateName(state);
        var stateFunc: Function = this['_' + stateName];
        if (stateFunc) {
            stateFunc.apply(this, [oldState, state]);
        }
        this._updateTimeStateChange();
    }

    private _updateTimeStateChange() {
        var state = this._currState;
        if (state == RunningManConst.RUNNING_STATE_PRE_START) {
            this._topDesc.string = (Lang.get('runningman_top_desc4'));
            this._topDesc.node.color = (Colors.DARK_BG_THREE);
            this._topTime.node.color = (Colors.DARK_BG_THREE);
        }
        if (state == RunningManConst.RUNNING_STATE_BET) {
            this._topDesc.string = (Lang.get('runningman_top_desc5'));
            this._topDesc.node.color = (Colors.DARK_BG_THREE);
            this._topTime.node.color = (Colors.DARK_BG_THREE);
        } else if (state == RunningManConst.RUNNING_STATE_WAIT) {
            this._topDesc.string = (Lang.get('runningman_top_desc1'));
            this._topDesc.node.color = (Colors.DARK_BG_THREE);
            this._topTime.node.color = (Colors.DARK_BG_THREE);
        } else if (state == RunningManConst.RUNNING_STATE_RUNNING) {
            this._topDesc.string = (Lang.get('runningman_top_desc2'));
            this._topDesc.node.color = (Colors.DARK_BG_THREE);
            this._topTime.node.color = (Colors.DARK_BG_GREEN);
        } else if (state == RunningManConst.RUNNING_STATE_END) {
            this._topDesc.string = (Lang.get('runningman_top_desc2'));
            this._topDesc.node.color = (Colors.DARK_BG_THREE);
            this._topTime.string = (Lang.get('runningman_top_desc3'));
            this._topTime.node.color = (Colors.DARK_BG_GREEN);
        }
    }

    private _updateStateChange() {
        var currState = RunningManHelp.getRunningState();
        if (this._currState != currState) {
            var stateName = RunningManConst.getStateName(currState);
            var stateFunc: Function = this['_' + stateName];
            var oldState = this._currState;
            if (stateFunc) {
                stateFunc.apply(this, [oldState, currState]);
            }
            this._currState = currState;
            this._updateTimeStateChange();
        }
    }

    private _updateTime(dt) {
        var state = this._currState;
        if (state == RunningManConst.RUNNING_STATE_PRE_START) {
            var startTime = G_UserData.getRunningMan().getStart_time();
            this._topTime.string = (G_ServerTime.getLeftSecondsString(startTime));
        }
        if (state == RunningManConst.RUNNING_STATE_BET) {
            var betEnd = G_UserData.getRunningMan().getBet_end();
            this._topTime.string = (G_ServerTime.getLeftSecondsString(betEnd));
            this._scrollView.updateWait();
        } else if (state == RunningManConst.RUNNING_STATE_WAIT) {
            var matchStart = G_UserData.getRunningMan().getMatch_start();
            this._postCountDownEvent();
            this._topTime.string = (G_ServerTime.getLeftSecondsString(matchStart));
            this._scrollView.updateWait();
        } else if (state == RunningManConst.RUNNING_STATE_RUNNING) {
            // var currTime = G_ServerTime.getTime(), elapsed;
            var runningTime = G_UserData.getRunningMan().getRunningTime();
            // this._topTime.string = ('%0.2f'.format(runningTime));
            this._topTime.string = runningTime.toFixed(2);
        } else if (state == RunningManConst.RUNNING_STATE_END) {
            this._topTime.string = (Lang.get('runningman_top_desc3'));
        }
    }

    private _RUNNING_STATE_PRE_START(oldState, currState) {
        if (!this.node || !this.node.isValid) {
            return;
        }
        this._runningEndEventTimes = 0;
        this._scrollView.reset();
        this._nodeMiniMap.active = false;
        var openTimes = G_UserData.getRunningMan().getOpen_times();
        if (openTimes > 1) {
            if (this._popupResult == null) {
                G_SceneManager.openPopup(Path.getPrefab("PopupRunningManResult", "runningMan"), (popupResult: PopupRunningManResult) => {
                    if (this.node == null || !this.node.isValid) {
                        popupResult.destroy();
                        return;
                    }
                    this._popupResult = popupResult;
                    this._popupResult.init();
                    this._popupResult.updateUI();
                    this._popupResult.open();
                })
            }
            else {
                this._popupResult.updateUI();
            }
        }
    }

    private _RUNNING_STATE_BET(oldState, currState) {
        this._updateRedPoint();
        if (this._popupResult) {
            this._popupResult.close();
            this._popupResult = null;
        }
        this._initListItemSource();
        var betEnd = G_UserData.getRunningMan().getBet_end();
        this._scrollView.buildAvatar();
        if (G_ServerTime.getLeftSeconds(betEnd) <= 2) {
            this._scrollView.resetAvatar();
            this._scrollView.playIdle();
        } else {
            this._scrollView.resetAvatar();
            this._scrollView.playRunningAndIdle();
        }
        this._miniMap.reset();
        this._nodeMiniMap.active = true;
    }

    private _RUNNING_STATE_WAIT(oldState, currState) {
        this._updateRedPoint();
        this._scrollView.buildAvatar();
        this._scrollView.resetAvatar();
        this._scrollView.playIdle();
        this._miniMap.reset();
        this._nodeMiniMap.active = true;
    }

    private _RUNNING_STATE_RUNNING() {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_RUNNING_STATE);
        this._nodeMiniMap.active = true;
        this._scrollView.buildAvatar();
        G_UserData.getRunningMan().resumeRunning();
        this._scrollView.playRunning();
        this._scrollView.syncRuningPos();
        this._procRunningEndDlg();
    }

    private _onPopupResultClose(event) {
        if (event == 'close') {
            this._popupResult = null;
            if (this._popupResultSignal) {
                this._popupResultSignal.remove();
                this._popupResultSignal = null;
            }
        }
    }

    private _procRunningEndDlg() {
        if (this._currState == RunningManConst.RUNNING_STATE_RUNNING || this._currState == RunningManConst.RUNNING_STATE_END) {
            var finishList = RunningManHelp.getRunningFinishList();
            if (finishList && finishList.length > 0) {
                if (this._popupResult == null) {
                    G_SceneManager.openPopup(Path.getPrefab("PopupRunningManResult", "runningMan"), (popupResult: PopupRunningManResult) => {
                        this._popupResult = popupResult;
                        this._popupResult.init();
                        this._popupResultSignal = this._popupResult.signal.add(handler(this, this._onPopupResultClose));
                        this._popupResult.updateUI();
                        this._popupResult.open();
                    })

                } else {
                    this._popupResult.updateUI();
                }
            }
        }
    }

    private _RUNNING_STATE_END() {
        this._nodeMiniMap.active = true;
        this._procRunningEndDlg();
        this._scrollView.reset();
        this._miniMap.reset();
    }

    private _updateRedPoint() {
        var redPoint = G_UserData.getRunningMan().hasRedPoint();
        this._betIcon.showRedPoint(redPoint);
    }

    private _postCountDownEvent() {
        if (this._currState != RunningManConst.RUNNING_STATE_WAIT) {
            return;
        }
        var matchStart = G_UserData.getRunningMan().getMatch_start();
        var leftTime = G_ServerTime.getLeftSeconds(matchStart);
        if (leftTime <= RunningManView.MAX_TIME && this._commonCountDown.node.active == false) {
            G_SignalManager.dispatch(SignalConst.EVENT_PLAY_HORSE_POST_RUNNING_START, leftTime);
        }
    }

    private _onEventPlayHorseInfo(id, message) {
    }

    private _onEventPlayHorseResult(id, message) {
    }

    private _onEventRunningEnd(id, heroId) {
        this._scrollView.stopRunningByHeroId(heroId);
        if (this._runningEndEventTimes == 0) {
            let callback = function () {
                this._procRunningEndDlg();
            }.bind(this);
            var delay = cc.delayTime(1);
            var sequence = cc.sequence(delay, cc.callFunc(callback));
            this._scrollView.node.runAction(sequence);
            this._scrollView.playOverRunning();
            G_AudioManager.playSoundWithId(AudioConst.SOUND_RUNNING_OVER);
        } else {
            this._procRunningEndDlg();
        }
        this._runningEndEventTimes = this._runningEndEventTimes + 1;
    }

    private _onEventPlayHorseBetSuccess(id, message) {
        this._updateRedPoint();
        this._dataList = G_UserData.getRunningMan().getBet_info();
        this._listItemSource.resize(this._dataList.length);
    }

    private _onEventGfxCountDown(id, leftTime) {
        if (this._commonCountDown.node.active == false && leftTime > 0) {
            this._commonCountDown.node.active = true;
            var textureList = [
                'img_runway_star',
                'img_runway_star1',
                'img_runway_star2',
                'img_runway_star3'
            ];
            G_AudioManager.playSoundWithId(AudioConst.SOUND_RUNNING_COUNTDOWN);
            this._commonCountDown.setTextureList(textureList);
            this._commonCountDown.playAnimation(leftTime + 1, 1, function () {
                this._commonCountDown.node.active = false;
            }.bind(this));
            this._listItemSource.node.active = false;
        }
    }

    private _initListItemSource() {
        var runningState = RunningManHelp.getRunningState();
        if (runningState == RunningManConst.RUNNING_STATE_PRE_START) {
            return;
        }
        this._listItemSource.node.active = true;
        this._listItemSource.setTemplate(this._runningManCellPrefab);
        this._listItemSource.setCallback(handler(this, this._onListItemSourceItemUpdate));
        this._dataList = G_UserData.getRunningMan().getBet_info();
        if (this._dataList) {
            this._listItemSource.resize(this._dataList.length);
            //this._nodeEmpty.node.active = false;
        }
    }
    private _onListItemSourceItemUpdate(node: cc.Node, index) {
        let item: PopupRunningManCell = node.getComponent(PopupRunningManCell);
        var data = this._dataList[index];
        if (data) {
            item.setCustomCallback(handler(this, this._onListItemSourceItemTouch))
            item.updateUI(data, index);
        }
    }

    private _onListItemSourceItemTouch(index) {
        var currState = RunningManHelp.getRunningState();
        var costValue = G_UserData.getRunningMan().getRunningCostValue();
        var heroId = this._dataList[index].heroId;
        var betNum = G_UserData.getRunningMan().getHeroBetNum(heroId);
        function callBackFunction(itemId, selectNum) {
            var itemNum = UserDataHelper.getNumByTypeAndValue(costValue.type, costValue.value);
            if (selectNum > 0 && selectNum <= itemNum) {
                G_UserData.getRunningMan().c2sPlayHorseBet(heroId, selectNum);
            }
        }
        if (currState == RunningManConst.RUNNING_STATE_BET) {
            if (heroId) {
                var itemNum = UserDataHelper.getNumByTypeAndValue(costValue.type, costValue.value);
                if (itemNum == 0) {
                    G_SceneManager.openPopup(Path.getPrefab("PopupItemGuider", "common"), (popupItemGuider: PopupItemGuider) => {
                        popupItemGuider.setTitle(Lang.get('way_type_get'));
                        popupItemGuider.updateUI(costValue.type, costValue.value);
                        popupItemGuider.openWithAction();
                    });
                    return;
                }
                var limitTotal = costValue.limitMax;
                var isHomelandBuff = false;
                var buffBaseId = HomelandConst.getBuffBaseId(costValue.type, costValue.value);
                if (buffBaseId) {
                    var [isCanUse, buffData] = HomelandHelp.checkBuffIsCanUse(buffBaseId);
                    if (isCanUse) {
                        var info = buffData.getConfig();
                        var value = HomelandHelp.getValueOfBuff(info.value, info.equation);
                        limitTotal = value;
                        isHomelandBuff = true;
                    }
                }
                var limitMax = limitTotal - betNum;
                var maxNum = itemNum;
                if (itemNum > limitMax) {
                    maxNum = limitMax;
                }
                if (maxNum == 0) {
                    G_Prompt.showTip(Lang.get('runningman_running_man_no2'));
                    return;
                }
                var tipString = Lang.get('runningman_dlg_tips', { num: maxNum });
                if (betNum == 0) {
                    tipString = Lang.get('runningman_dlg_tips_one', { num: maxNum });
                }

                G_SceneManager.openPopup(Path.getPrefab("PopupItemUse", "common"), (popupItemUse: PopupItemUse) => {
                    popupItemUse.ctor(Lang.get('runningman_dlg_title'), callBackFunction);
                    popupItemUse.updateUI(costValue.type, costValue.value);
                    popupItemUse.setMaxLimit(maxNum);
                    popupItemUse.setTextTips(tipString);
                    popupItemUse.setOwnerCount(itemNum);
                    popupItemUse.openWithAction();
                });
            }
        } else {
            this._dataList = G_UserData.getRunningMan().getBet_info();
            this._listItemSource.resize(this._dataList.length);
            G_Prompt.showTip(Lang.get('runningman_tip2'));
        }
    }

}