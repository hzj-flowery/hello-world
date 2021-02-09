const { ccclass, property } = cc._decorator;

import CommonMainMenu from '../../../ui/component/CommonMainMenu'

import CommonTalkNode from '../../../ui/component/CommonTalkNode'

import CommonPageViewIndicator3 from '../../../ui/component/CommonPageViewIndicator3'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'
import { G_Prompt, G_UserData, G_SceneManager, G_EffectGfxMgr, G_SignalManager, G_AudioManager, G_ConfigLoader, Colors } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { CustomActivityConst } from '../../../const/CustomActivityConst';
import { AudioConst } from '../../../const/AudioConst';
import { ActivityEquipDataHelper } from '../../../utils/data/ActivityEquipDataHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import { handler } from '../../../utils/handler';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import CommonUI from '../../../ui/component/CommonUI';
import { SignalConst } from '../../../const/SignalConst';
import { Path } from '../../../utils/Path';
import { CustomActivityUIHelper } from './CustomActivityUIHelper';
import HandBookHelper from '../handbook/HandBookHelper';
import { table } from '../../../utils/table';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import ViewBase from '../../ViewBase';
import GuildWarMoveSignNode from '../guildwarbattle/GuildWarMoveSignNode';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { DataConst } from '../../../const/DataConst';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class CustomActivityHorseConquerView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBg: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeViewer: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonLeft: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonRight: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnReadme: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTitle: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTimeTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTip: cc.Node = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _button1: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _button2: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCostBg1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCost1: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCost1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCostBg2: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCost2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCost2: cc.Sprite = null;

    @property({
        type: CommonPageViewIndicator3,
        visible: true
    })
    _nodeIndicator: CommonPageViewIndicator3 = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMoving: cc.Node = null;

    @property({
        type: CommonTalkNode,
        visible: true
    })
    _nodeTalk: CommonTalkNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEmoji: cc.Node = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _nodeBook: CommonMainMenu = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgLeftBottom: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOwnFragNum: cc.Label = null;





    private _shoutHandler: any;
    private _countDownHandler: any;
    private _parentView: any;
    private _batch: any;
    private _configInfo: any;
    private _picNames: Array<string>;
    private _titleNames: Array<string>;
    private _timeNames: Array<string>;
    private _maxIndex: number;
    private _curIndex: number;

    private _signalCustomActivityHorseConquerInfo: any;
    private _signalCustomActivityConquerHorseSuccess: any;

    private _hasLoaded: boolean = false;
    private _fragmentIds: any;
    setInitData(parentView) {
        this._parentView = parentView;
    }
    onCreate() {
        this._hasLoaded = false;
        this._initData();

    }
    _initData() {
        var actUnitData = G_UserData.getCustomActivity().getHorseConquerActivity();
        if (actUnitData) {
            this._batch = actUnitData.getBatch();
            this._configInfo = ActivityEquipDataHelper.getActiveConfig(this._batch);
            this._picNames = this._configInfo.pic_name.split('|');
            this._titleNames = this._configInfo.title_name.split('|');
            this._timeNames = this._configInfo.time_name.split('|');
            this._fragmentIds = this._configInfo.fragment.split('|');
            this._maxIndex = this._titleNames.length;
        }
        this._countDownHandler = null;
        this._shoutHandler = null;
        var recordIndex = G_UserData.getCustomActivityRecharge().getCurSelectedIndex2();
        if (recordIndex > 0 && recordIndex <= this._maxIndex) {
            this._curIndex = recordIndex;
        } else {
            var temp = this._maxIndex % 2;
            if (temp == 0) {
                this._curIndex = Math.floor(this._maxIndex / 2);
            } else {
                this._curIndex = Math.floor(this._maxIndex / 2) + 1;
            }
        }
    }
    _initView() {
        this._nodeBook.updateUI(FunctionConst.FUNC_HAND_BOOK);
        this._nodeBook.addClickEventListenerEx(handler(this, this._onClickBook));
        this._button1.setString(this._configInfo.name1);
        this._button2.setString(this._configInfo.name2);

        var effectLeft = G_EffectGfxMgr.createPlayGfx(this._buttonLeft.node, "effect_guanxing_jiantou");
        var effectRight = G_EffectGfxMgr.createPlayGfx(this._buttonRight.node, "effect_guanxing_jiantou");
        var size = this._buttonLeft.node.getContentSize();
        effectLeft.play();
        effectRight.play();
        var resParam = TypeConvertHelper.convert(this._configInfo.money_type, this._configInfo.money_value);
        var content = Lang.get('customactivity_pet_num_tip', {
            money: this._configInfo.money,
            count: this._configInfo.money_size,
            urlIcon: resParam.res_mini
        });
        var richText = RichTextExtend.createWithContent(content);
        richText.node.setAnchorPoint(cc.v2(0, 0));
        this._nodeTip.addChild(richText.node);
        this._initCostUI();
        this._initSpine();
    }
    _initCostUI() {
        var resParam = TypeConvertHelper.convert(this._configInfo.money_type, this._configInfo.money_value);
        var resNum = UserDataHelper.getNumByTypeAndValue(this._configInfo.money_type, this._configInfo.money_value);
        var yubiParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
        var yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
        var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var consume_time1 = parseInt(Paramter.get(887).content);
        var consume_time2 = parseInt(Paramter.get(887).content);
        if (resNum >= 10) {
            this._textCost1.string = (this._configInfo.consume_time1);
            this._imageCost1.node.addComponent(CommonUI).loadTexture(resParam.res_mini);
            this._textCost2.string = "" + (this._configInfo.consume_time2 * this._configInfo.hit_num);
            this._imageCost2.node.addComponent(CommonUI).loadTexture(resParam.res_mini);
        } else if (resNum > 0) {
            this._textCost1.string = (this._configInfo.consume_time1);
            this._imageCost1.node.addComponent(CommonUI).loadTexture(resParam.res_mini);
            this._textCost2.string = "" + (consume_time2 * this._configInfo.hit_num);
            this._imageCost2.node.addComponent(CommonUI).loadTexture(yubiParam.res_mini);
        } else {
            this._textCost1.string = "" + (consume_time1);
            this._imageCost1.node.addComponent(CommonUI).loadTexture(yubiParam.res_mini);
            this._textCost2.string = "" + (consume_time2 * this._configInfo.hit_num);
            this._imageCost2.node.addComponent(CommonUI).loadTexture( yubiParam.res_mini);
        }
        this._imgLeftBottom.node.active = (false);
        this._nodeTip.active = (false);

        this.scheduleOnce(()=>{
            this._imageCost1.node.x = this._textCost1.node.x + this._textCost1.node.width;
            this._imageCost2.node.x = this._textCost2.node.x + this._textCost2.node.width;
        })
    }

    _initSpine() {
        var curIndex = this._curIndex;
        this._nodeIndicator.refreshPageData(null, this._maxIndex, curIndex - 1,8);
        this._updateMoving();
        this._updateViewer();
        this._initBgMoving();
    }
    _initBgMoving() {
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeBg, 'moving_xunmachangjing', null, null, false);
    }
    onEnter() {
        if (this._hasLoaded == false) {
            this._initView();
            this._btnReadme.node.on(cc.Node.EventType.TOUCH_END, this._onBtnReadme, this);
            this._button1.addClickEventListenerEx(handler(this, this._onClickButton1));
            this._button2.addClickEventListenerEx(handler(this, this._onClickButton2));
            this._buttonLeft.node.on(cc.Node.EventType.TOUCH_END, this._onClickButtonLeft, this);
            this._buttonRight.node.on(cc.Node.EventType.TOUCH_END, this._onClickButtonRight, this);
            this._hasLoaded = true;
        }

        this._signalCustomActivityHorseConquerInfo = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_INFO, handler(this, this._customActivityHorseConquerInfo));
        this._signalCustomActivityConquerHorseSuccess = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_PLAY_SUCCESS, handler(this, this._customActivityConquerHorseSuccess));
        this._startCountDown();
        this._startShout();

    }
    onExit() {
        this._stopCountDown();
        this._stopShout();
        G_UserData.getCustomActivityRecharge().setCurSelectedIndex2(this._curIndex);
        this._signalCustomActivityHorseConquerInfo.remove();
        this._signalCustomActivityHorseConquerInfo = null;
        this._signalCustomActivityConquerHorseSuccess.remove();
        this._signalCustomActivityConquerHorseSuccess = null;
    }
    refreshView(customActUnitData, resetListData) {
        var rechargeUnit = G_UserData.getCustomActivityRecharge().getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER);
        if (rechargeUnit.isExpired()) {
            G_UserData.getCustomActivityRecharge().c2sSpecialActInfo(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER);
            return;
        }
        this._updateData();
        this._updateView();
    }
    _customActivityHorseConquerInfo(actType) {
        if (actType != CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER) {
            return;
        }
        this._updateData();
        this._updateView();
    }
    _updateData() {
    }
    _updateView() {
        this._updateTitle();
        this._updateFragmentCount();
        this._updateCost();
        this._updateArrowBtn();
        this._initCostUI();
    }
    _createProgressRichText(richText) {
        this._textOwnFragNum.node.removeAllChildren();
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(cc.v2(0, 0.5));
        this._textOwnFragNum.node.addChild(widget.node);
    }
    _updateFragmentCount() {
        var fragmentId = this._fragmentIds[this._curIndex-1];
        var fragmentConfig = G_ConfigLoader.getConfig(ConfigNameConst.FRAGMENT);
        var fragmentInfo = fragmentConfig.get(parseInt(fragmentId));
        var myCount = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, fragmentId);
        var needCount = fragmentInfo.fragment_num;
        var richText = Lang.get('pet_fragment_progress', {
            value: myCount,
            max: needCount,
            valueColor: Colors.colorToNumber(myCount >= needCount && Colors.DARK_BG_GREEN || Colors.DARK_BG_RED),
            maxColor: Colors.colorToNumber(Colors.DARK_BG_ONE)
        });
        this._createProgressRichText(richText);
    }
    _updateTitle() {
        var titleName = this._titleNames[this._curIndex - 1];
        var timeName = this._timeNames[this._curIndex - 1];
        this._imageTitle.node.addComponent(CommonUI).loadTexture(Path.getCustomActivityUI(titleName));
        this._textTimeTitle.string = (timeName);
    }
    _updateCost() {
        var rechargeUnit = G_UserData.getCustomActivityRecharge().getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER);
        var freeCount = rechargeUnit.getRestFreeCount(this._batch);
        if (freeCount > 0) {
            this._button1.setString(Lang.get('customactivity_pet_rest_free_count', { count: freeCount }));
            this._imageCostBg1.node.active = (false);
        } else {
            this._button1.setString(this._configInfo.name1);
            this._imageCostBg1.node.active = (true);
        }
    }
    _startCountDown() {
        this._stopCountDown();
        this._countDownHandler = handler(this, this._onCountDown);
        this.schedule(this._countDownHandler, 1);
        this._onCountDown();
    }
    _stopCountDown() {
        if (this._countDownHandler) {
            this.unschedule(this._countDownHandler);
            this._countDownHandler = null;
        }
    }
    _onCountDown() {
        var actUnitData = G_UserData.getCustomActivity().getHorseConquerActivity();
        if (actUnitData && actUnitData.isActInRunTime()) {
            var timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData.getEnd_time());
            this._textTime.string = (timeStr);
        } else {
            this._textTime.string = (Lang.get('customactivity_horse_conquer_act_end'));
            this._stopCountDown();
        }
    }
    _startShout() {
        this._stopShout();
        this._onShout();
        this._shoutHandler = handler(this, this._startShout);
        this.scheduleOnce(this._shoutHandler, 5);
    }
    _stopShout() {
        if (this._shoutHandler) {
            this.unschedule(this._shoutHandler);
            this._shoutHandler = null;
        }
    }
    _onShout() {
        var bubbleText = ActivityEquipDataHelper.randomCommonChat(this._batch);
        this._playTalk(bubbleText);
    }
    _playTalk(bubbleText) {
        this._nodeTalk.setText(bubbleText, 150, true);
        this._nodeTalk.node.active = (true);
        var func = function () {
            this._nodeTalk.node.active = (false);
        }.bind(this);
        var delay = cc.delayTime(3);
        var action = cc.sequence(delay, cc.callFunc(func));
        this._nodeTalk.node.stopAllActions();
        this._nodeTalk.node.runAction(action);
    }
    _onBtnReadme() {
        UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_HORSE_CONQUER_ACTIVITY);
    }
    _onClickButton1() {
        if (this._checkTime() == false) {
            return;
        }
        var [ret, costYuBi, itemCount] = this._checkCost(CustomActivityConst.HORSE_CONQUER_TYPE_1);
        if (ret == false) {
            return;
        }
        var params = {
            moduleName: 'COST_YUBI_MODULE_NAME_5',
            yubiCount: costYuBi,
            itemCount: itemCount
        };
        UIPopupHelper.popupCostYubiTip(params, handler(this, this._doPlaySpecialActivity), CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER, CustomActivityConst.HORSE_CONQUER_TYPE_1, this._curIndex);
    }
    _onClickButton2() {
        if (this._checkTime() == false) {
            return;
        }
        var [ret, costYuBi, itemCount] = this._checkCost(CustomActivityConst.HORSE_CONQUER_TYPE_2);
        if (ret == false) {
            return;
        }
        var params = {
            moduleName: 'COST_YUBI_MODULE_NAME_5',
            yubiCount: costYuBi,
            itemCount: itemCount
        };
        UIPopupHelper.popupCostYubiTip(params, handler(this, this._doPlaySpecialActivity), CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER, CustomActivityConst.HORSE_CONQUER_TYPE_2, this._curIndex);
    }
    _doPlaySpecialActivity(activityType, drawType, curIndex) {
        G_UserData.getCustomActivityRecharge().c2sPlaySpecialActivity(activityType, drawType, curIndex);
        this._setBtnEnabled(false);
    }
    _onClickButtonLeft() {
        if (this._curIndex <= 1) {
            return;
        }
        this._curIndex = this._curIndex - 1;
        this._updateTitle();
        this._updateFragmentCount();
        this._updateMoving();
        this._updateArrowBtn();
        this._nodeIndicator.setCurrentPageIndex(this._curIndex - 1);
    }
    _onClickButtonRight() {
        if (this._curIndex >= this._maxIndex) {
            return;
        }
        this._curIndex = this._curIndex + 1;
        this._updateTitle();
        this._updateFragmentCount();
        this._updateMoving();
        this._updateArrowBtn();
        this._nodeIndicator.setCurrentPageIndex(this._curIndex - 1);
    }
    _onClickBook() {
        G_SceneManager.showScene('handbook', FunctionConst.FUNC_HORSE_BOOK, HandBookHelper.TBA_HORSE);
    }
    _updateMoving() {
        this._nodeMoving.removeAllChildren();
        var movingName = 'moving_' + (this._picNames[this._curIndex - 1] + ('_' + 'idle'));
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeMoving, movingName, null, null, false);

    }
    _updateViewer() {
        this._nodeViewer.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeViewer, 'moving_xunma_guanzhongidle', null, null, false);
    }
    _updateArrowBtn() {
        this._buttonLeft.node.active = (this._curIndex > 1);
        this._buttonRight.node.active = (this._curIndex < this._maxIndex);
    }
    _setBtnEnabled(enabled) {
        this._button1.setEnabled(enabled);
        this._button2.setEnabled(enabled);
        this._buttonLeft.enabled = (enabled);
        this._buttonRight.enabled = (enabled);
    }
    _customActivityConquerHorseSuccess(eventName, actType, drawType, records, equips) {
        if (actType != CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER) {
            return;
        }
        var star = 0;
        for (var i in records) {
            var id = records[i];
            var info = ActivityEquipDataHelper.getActiveDropConfig(id);
            if (info.star > star) {
                star = info.star;
            }
        }
        if (star > 0) {
            this._playHorseAction(star, drawType, records);
        }
        this._updateData();
        this._updateCost();
        this._updateFragmentCount();
        this._initCostUI();
    }
    _playHorseAction(star, drawType, records) {
        var eventFunction = function (event) {
            if (event == 'finish') {
                this.node.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
                    this._updateMoving();
                    this._updateViewer();
                }.bind(this))));
                this._popupAward(records);
                this._setBtnEnabled(true);
                this._nodeEmoji.removeAllChildren();
                this._startShout();
            }
        }.bind(this);
        var moving = '';
        var viewMoving = '';
        var strTalk = '';
        var emojiName = '';
        var soundId = 0;
        if (star >= 7) {
            moving = 'moving_' + (this._picNames[this._curIndex - 1] + ('_' + 'win'));
            viewMoving = 'moving_xunma_guanzhongchenggong';
            strTalk = Lang.get('customactivity_horse_talk_win');
            emojiName = 'effect_xunma_aixin';
            soundId = AudioConst.SOUND_HORSE_CONQUER_WIN;
        } else if (star >= 4) {
            moving = 'moving_' + (this._picNames[this._curIndex - 1] + ('_' + 'good'));
            viewMoving = 'moving_xunma_guanzhongidle';
            strTalk = Lang.get('customactivity_horse_talk_lose');
            emojiName = 'effect_xunma_chenmo';
            soundId = AudioConst.SOUND_HORSE_CONQUER_GOOD;
        } else {
            moving = 'moving_' + (this._picNames[this._curIndex - 1] + ('_' + 'lose'));
            viewMoving = 'moving_xunma_guanzhongjiayou';
            strTalk = Lang.get('customactivity_horse_talk_lose');
            emojiName = 'effect_xunma_shengqi';
            soundId = AudioConst.SOUND_HORSE_CONQUER_LOSE;
        }
        this._stopShout();
        this._nodeTalk.node.active = (false);
        this.node.runAction(cc.sequence(cc.delayTime(1.3), cc.callFunc(function () {
            this._playTalk(strTalk);
        }.bind(this))));
        this._nodeEmoji.removeAllChildren();

        var emoji = G_EffectGfxMgr.createPlayGfx(this._nodeEmoji, emojiName);
        emoji.setAutoRelease(true);
        emoji.play();
        G_AudioManager.playSoundWithId(soundId);
        this._nodeMoving.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeMoving, moving, null, eventFunction, true);
        this._nodeViewer.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeViewer, viewMoving, null, null, false);
    }
    _popupAward(records) {
        var awards = [];
        for (var i in records) {
            var id = records[i];
            var info = ActivityEquipDataHelper.getActiveDropConfig(id);
            var award = {
                type: info.type,
                value: info.value,
                size: info.size
            };
            table.insert(awards, award);
        }

        PopupGetRewards.showRewards(awards)
    }
    _checkTime() {
        var isVisible = G_UserData.getCustomActivity().isHorseConquerActivityVisible();
        if (isVisible) {
            return true;
        } else {
            G_Prompt.showTip(Lang.get('customactivity_horse_conquer_act_end_tip'));
            return false;
        }
    }
    _checkCost(drawType) {
        var result = false;
        var costYuBi = null;
        var itemCount = null;
        var consume_time1 = parseInt(this._configInfo.consume_time1);
        var consume_time2 = parseInt(this._configInfo.consume_time2);
        var hit_num = this._configInfo.hit_num;
        var checkCostCoin = function (type, value) {
            var hitCount = UserDataHelper.getNumByTypeAndValue(type, value);
            if (drawType == CustomActivityConst.HORSE_CONQUER_TYPE_1) {
                var rechargeUnit = G_UserData.getCustomActivityRecharge().getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER);
                var freeCount = rechargeUnit.getRestFreeCount(this._batch);
                if (freeCount > 0) {
                    return [true, null, null];
                }
                var limitCount = consume_time1;
                if (hitCount >= limitCount) {
                    return [
                        true,
                        limitCount,
                        1
                    ];
                }
            } else if (drawType == CustomActivityConst.HORSE_CONQUER_TYPE_2) {
                var limitCount = consume_time2 * hit_num;
                if (hitCount >= limitCount) {
                    return [
                        true,
                        limitCount,
                        hit_num
                    ];
                }
            }
            return [false, null, null];
        }.bind(this);
        [result] = checkCostCoin(this._configInfo.money_type, this._configInfo.money_value);
        if (result) {
        } else {
            var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
            consume_time1 = parseInt(Paramter.get(887).content);
            consume_time2 = parseInt(Paramter.get(887).content);
            hit_num = this._configInfo.hit_num;
            [result, costYuBi, itemCount] = checkCostCoin(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
            if (!result) {
                var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
                G_Prompt.showTip(Lang.get('customactivity_horse_conquer_cost_not_enough', {
                    name1: param.name,
                    name2: param.name
                }));
            }
        }
        return [
            result,
            costYuBi,
            itemCount
        ];
    }


}