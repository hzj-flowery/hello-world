const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { CustomActivityConst } from '../../../const/CustomActivityConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { G_AudioManager, G_EffectGfxMgr, G_Prompt, G_SignalManager, G_UserData, G_ConfigLoader, Colors } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonPageViewIndicator3 from '../../../ui/component/CommonPageViewIndicator3';
import CommonUI from '../../../ui/component/CommonUI';
import { SpineNode } from '../../../ui/node/SpineNode';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { ActivityEquipDataHelper } from '../../../utils/data/ActivityEquipDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import { CustomActivityUIHelper } from './CustomActivityUIHelper';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { DataConst } from '../../../const/DataConst';
import UIHelper from '../../../utils/UIHelper';




var SPINE_INFO = {
    ['mid']: {
        pos: new cc.Vec2(355, 290),
        scale: 0.8,
        opacity: 1 * 255,
        opacityBall: 1 * 255,
        order: 3
    },
    ['left']: {
        pos: new cc.Vec2(30, 290),
        scale: 0.4,
        opacity: 0.3 * 255,
        opacityBall: 0.1 * 255,
        order: 2
    },
    ['right']: {
        pos: new cc.Vec2(780, 290),
        scale: 0.4,
        opacity: 0.3 * 255,
        opacityBall: 0.1 * 255,
        order: 2
    },
    ['leftOut']: {
        pos: new cc.Vec2(-58, 290),
        scale: 0.2,
        opacity: 0.3 * 255,
        opacityBall: 0.1 * 255,
        order: 1
    },
    ['rightOut']: {
        pos: new cc.Vec2(918, 290),
        scale: 0.2,
        opacity: 0.3 * 255,
        opacityBall: 0.1 * 255,
        order: 1
    }
};
var MOVE_TIME = 0.5;

@ccclass
export default class CustomActivityPetView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelSpine: cc.Node = null;

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
        type: CommonMainMenu,
        visible: true
    })
    _btnShop: CommonMainMenu = null;

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
        type: cc.PageView,
        visible: true
    })
    _pageView: cc.PageView = null;

    @property({
        type: CommonPageViewIndicator3,
        visible: true
    })
    _nodeIndicator: CommonPageViewIndicator3 = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOwnFragNum: cc.Label = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgLeftBottom: cc.Sprite = null;




    private _parentView: any;
    private _batch: any;
    private _configInfo: any;
    private _backNames: string;
    private _picNames: string;
    private _titleNames: string;
    private _timeNames: string;
    private _maxIndex: number;
    private _curIndex: number;
    private _spineNodes: any;
    private _spines: any;
    private _curSpine: any;

    private _countDownHandler: any;
    private _signalCustomActivityPetInfo: any;
    private _signalCustomActivityDrawPetSuccess: any;


    public setInitData(parentView) {
        this._parentView = parentView;
        // var resource = {
        //     size: G_ResolutionManager.getDesignSize(),
        //     file: Path.getCSB('CustomActivityPetView', 'customactivity'),
        //     binding: {
        //         _btnReadme: {
        //             events: [{
        //                     event: 'touch',
        //                     method: '_onBtnReadme'
        //                 }]
        //         }
        //         _btnShop: {
        //             events: [{
        //                     event: 'touch',
        //                     method: '_onBtnShop'
        //                 }]
        //         }
        //         _button1: {
        //             events: [{
        //                     event: 'touch',
        //                     method: '_onClickButton1'
        //                 }]
        //         }
        //         _button2: {
        //             events: [{
        //                     event: 'touch',
        //                     method: '_onClickButton2'
        //                 }]
        //         }
        //         _buttonLeft: {
        //             events: [{
        //                     event: 'touch',
        //                     method: '_onClickButtonLeft'
        //                 }]
        //         }
        //         _buttonRight: {
        //             events: [{
        //                     event: 'touch',
        //                     method: '_onClickButtonRight'
        //                 }]
        //         }
        //     }
        // };
    }
    onCreate() {
        this._initData();
        this._btnShop.addClickEventListenerEx(handler(this, this._onBtnShop));
        this._initView();
    }
    private _fragmentIds;
    _initData() {
        var actUnitData = G_UserData.getCustomActivity().getPetActivity();
        if (actUnitData) {
            this._batch = actUnitData.getBatch();
            this._configInfo = ActivityEquipDataHelper.getActiveConfig(this._batch);
            this._backNames = this._configInfo.back_name.split('|');
            this._picNames = this._configInfo.pic_name.split('|');
            this._titleNames = this._configInfo.title_name.split('|');
            this._timeNames = this._configInfo.time_name.split('|');
            this._fragmentIds = this._configInfo.fragment.split('|');

            this._maxIndex = this._backNames.length;
        }
        this._countDownHandler = null;
        var recordIndex = G_UserData.getCustomActivityRecharge().getCurSelectedIndex();

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
        this._btnShop.updateUI(FunctionConst.FUNC_PET_ACTIVITY_SHOP);
        this._button1.setString(this._configInfo.name1);
        this._button2.setString(this._configInfo.name2);

        var effectLeft = G_EffectGfxMgr.createPlayGfx(this._buttonLeft.node, "effect_guanxing_jiantou")
        var effectRight = G_EffectGfxMgr.createPlayGfx(this._buttonRight.node, "effect_guanxing_jiantou")
        var size = this._buttonLeft.node.getContentSize();
        // effectLeft.node.setPosition(new cc.Vec2(size.width / 2, size.height / 2));
        // effectRight.node.setPosition(new cc.Vec2(size.width / 2, size.height / 2));
        effectLeft.play();
        effectRight.play();
        // effectLeft.node.active = true;
        // effectRight.node.active = true;
        // this._buttonLeft.node.addChild(effectLeft.node);
        // this._buttonRight.node.addChild(effectRight.node);
        var resParam = TypeConvertHelper.convert(this._configInfo.money_type, this._configInfo.money_value);
        var content = Lang.get('customactivity_pet_num_tip', {
            money: this._configInfo.money,
            count: this._configInfo.money_size,
            urlIcon: resParam.res_mini
        });
        var richText = RichTextExtend.createWithContent(content);
        richText.node.setAnchorPoint(new cc.Vec2(0, 0));
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
        var consume_time1 = parseInt(Paramter.get(886).content);
        var consume_time2 = parseInt(Paramter.get(886).content);
        if (resNum >= 10) {
            this._textCost1.string = (this._configInfo.consume_time1);
            this._imageCost1.node.addComponent(CommonUI).loadTexture(resParam.res_mini);
            this._textCost2.string = "" + (this._configInfo.consume_time2 * this._configInfo.hit_num);
            this._imageCost2.node.addComponent(CommonUI).loadTexture(resParam.res_mini);
        } else if (resNum > 0) {
            this._textCost1.string = (this._configInfo.consume_time1);
            this._imageCost1.node.addComponent(CommonUI).loadTexture(resParam.res_mini);
            this._textCost2.string = "" + (consume_time2 * this._configInfo.hit_num);
            this._imageCost2.node.addComponent(CommonUI).loadTexture(yubiParam.res_mini);;
        } else {
            this._textCost1.string = "" + (consume_time1);
            this._imageCost1.node.addComponent(CommonUI).loadTexture(yubiParam.res_mini);
            this._textCost2.string = "" + (consume_time2 * this._configInfo.hit_num);
            this._imageCost2.node.addComponent(CommonUI).loadTexture(yubiParam.res_mini);;
        }
        this._imgLeftBottom.node.active = (false);

        this.scheduleOnce(()=>{
            this._imageCost1.node.x = this._textCost1.node.x + this._textCost1.node.width;
            this._imageCost2.node.x = this._textCost2.node.x + this._textCost2.node.width;
        })
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
    _updateView() {
        this._updateTitle();
        this._updateCost();
        this._updateArrowBtn();
        this._updateFragmentCount();
        this._initCostUI();
    }

    _initSpine() {
        var setSpineNode = function (node: cc.Node, key) {
            var info = SPINE_INFO[key];
            node.setPosition(info.pos);
            node.setScale(info.scale);
            var pic = node.getChildByName('nodePic') as cc.Node;
            if (pic) {
                pic.opacity = (info.opacity);
            }
            var ball = node.getChildByName('spine') as cc.Node;
            if (ball) {
                ball.opacity = (info.opacityBall);
            }
            node.zIndex = (info.order);
        }.bind(this)
        this._spineNodes = {};
        this._spines = {};
        for (var i = 1; i <= this._maxIndex; i++) {
            var picName = this._picNames[i - 1];
            var backName = this._backNames[i - 1];
            var node = new cc.Node();
            var nodePic = new cc.Node();
            nodePic.name = ('nodePic');
            node.addChild(nodePic);
            G_EffectGfxMgr.createPlayMovingGfx(nodePic, picName, null, null, false);
            var spine = SpineNode.create();
            spine.node.name = ('spine');
            node.addChild(spine.node);
            this._panelSpine.addChild(node);
            var resJson = Path.getEffectSpine(backName);
            spine.setAsset(resJson);
            spine.setAnimation('idle', true);
            this._spines[i] = spine;
            this._spineNodes[i] = node;
        }
        var curIndex = this._curIndex;
        var midSpine = this._spineNodes[curIndex];
        this._curSpine = this._spines[curIndex];
        setSpineNode(midSpine, 'mid');
        var leftIndex = curIndex - 1;
        var leftSpine = this._spineNodes[leftIndex];
        if (leftSpine) {
            setSpineNode(leftSpine, 'left');
            var index = leftIndex - 1;
            while (this._spineNodes[index]) {
                setSpineNode(this._spineNodes[index], 'leftOut');
                index = index - 1;
            }
        }
        var rightIndex = curIndex + 1;
        var rightSpine = this._spineNodes[rightIndex];
        if (rightSpine) {
            setSpineNode(rightSpine, 'right');
            var index = rightIndex + 1;
            while (this._spineNodes[index]) {
                setSpineNode(this._spineNodes[index], 'rightOut');
                index = index + 1;
            }
        }

    }
    onEnter() {
        this._nodeIndicator.refreshPageData(this._pageView, this._maxIndex, this._curIndex - 1, 16);
        this._signalCustomActivityPetInfo = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_INFO, handler(this, this._customActivityPetInfo));
        this._signalCustomActivityDrawPetSuccess = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_PLAY_SUCCESS, handler(this, this._customActivityDrawPetSuccess));
        this._startCountDown();
        this._updateShopRP();
    }
    onExit() {
        this._stopCountDown();
        G_UserData.getCustomActivityRecharge().setCurSelectedIndex(this._curIndex);
        this._signalCustomActivityPetInfo.remove();
        this._signalCustomActivityPetInfo = null;
        this._signalCustomActivityDrawPetSuccess.remove();
        this._signalCustomActivityDrawPetSuccess = null;
    }
    refreshView(customActUnitData, resetListData) {
        var rechargeUnit = G_UserData.getCustomActivityRecharge().getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET);
        if (rechargeUnit.isExpired()) {
            G_UserData.getCustomActivityRecharge().c2sSpecialActInfo(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET);
            return;
        }
        this._updateData();
        this._updateView();
    }
    _customActivityPetInfo(actType) {
        if (actType != CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET) {
            return;
        }
        this._updateData();
        this._updateView();
    }
    _updateData() {
    }
    _updateTitle() {
        var titleName = this._titleNames[this._curIndex - 1];
        var timeName = this._timeNames[this._curIndex - 1];
        this._imageTitle.node.addComponent(CommonUI).loadTexture(Path.getCustomActivityUI(titleName));
        this._textTimeTitle.string = (timeName);
    }
    _updateCost() {
        var rechargeUnit = G_UserData.getCustomActivityRecharge().getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET);
        var freeCount = rechargeUnit.getRestFreeCount(this._batch);
        if (freeCount > 0) {
            this._button1.setString(Lang.get('customactivity_pet_rest_free_count', { count: freeCount }));
            this._imageCostBg1.node.active = (false);
        } else {
            this._button1.setString(this._configInfo.name1);
            this._imageCostBg1.node.active = (true);
        }
        this._initCostUI();
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
        var actUnitData = G_UserData.getCustomActivity().getPetActivity();
        if (actUnitData && actUnitData.isActInRunTime()) {
            var timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData.getEnd_time());
            this._textTime.string = (timeStr);
        } else {
            this._textTime.string = (Lang.get('customactivity_pet_act_end'));
            this._stopCountDown();
        }
    }
    _onBtnReadme() {
        UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_PET_ACTIVITY);
    }
    private _onBtnShop() {
        if (!G_UserData.getCustomActivity().isPetActivityVisible()) {
            G_Prompt.showTip(Lang.get('customactivity_pet_act_end_tip'));
            return;
        }
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_PET_ACTIVITY_SHOP);
    }
    private onClickButton1() {
        if (this._checkTime() == false) {
            return;
        }
        var [ret, costYuBi, itemCount] = this._checkCost(CustomActivityConst.PET_DRAW_TYPE_1);
        if (ret == false) {
            return;
        }
        var params = {
            moduleName: 'COST_YUBI_MODULE_NAME_3',
            yubiCount: costYuBi,
            itemCount: itemCount
        };
        UIPopupHelper.popupCostYubiTip(params, handler(this, this._doPlaySpecialActivity), CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET, CustomActivityConst.PET_DRAW_TYPE_1, this._curIndex);
    }
    private onClickButton2() {
        if (this._checkTime() == false) {
            return;
        }
        var [ret, costYuBi, itemCount] = this._checkCost(CustomActivityConst.PET_DRAW_TYPE_2);
        if (ret == false) {
            return;
        }
        var params = {
            moduleName: 'COST_YUBI_MODULE_NAME_3',
            yubiCount: costYuBi,
            itemCount: itemCount
        };
        UIPopupHelper.popupCostYubiTip(params, handler(this, this._doPlaySpecialActivity), CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET, CustomActivityConst.PET_DRAW_TYPE_2, this._curIndex);
    }
    _doPlaySpecialActivity(activityType, drawType, curIndex) {
        G_UserData.getCustomActivityRecharge().c2sPlaySpecialActivity(activityType, drawType, curIndex);
        this._setBtnEnabled(false);
    }
    private onClickButtonLeft() {
        if (this._curIndex <= 1) {
            return;
        }
        this._setBtnEnabled(false);
        this._moveToRight();
    }
    private onClickButtonRight() {
        if (this._curIndex >= this._maxIndex) {
            return;
        }
        this._setBtnEnabled(false);
        this._moveToLeft();
    }
    _updateArrowBtn() {
        this._buttonLeft.node.active = (this._curIndex > 1);
        this._buttonRight.node.active = (this._curIndex < this._maxIndex);
    }
    _setBtnEnabled(enabled) {
        this._button1.setEnabled(enabled);
        this._button2.setEnabled(enabled);
        this._buttonLeft.interactable = (enabled);
        this._buttonRight.interactable = (enabled);
    }
    _moveToLeft() {
        var curNode = this._spineNodes[this._curIndex];
        var leftNode = this._spineNodes[this._curIndex - 1];
        var rightNode = this._spineNodes[this._curIndex + 1];
        var rightOutNode = this._spineNodes[this._curIndex + 2];
        if (curNode) {
            this._moveNode(curNode, SPINE_INFO['left'], function () {
                this._curIndex = this._curIndex + 1;
                this._curSpine = this._spines[this._curIndex];
                this._updateTitle();
                this._updateFragmentCount();
                this._updateArrowBtn();
                this._setBtnEnabled(true);
                this._nodeIndicator.setCurrentPageIndex(this._curIndex - 1);
            }.bind(this));
        }
        if (leftNode) {
            this._moveNode(leftNode, SPINE_INFO['leftOut']);
        }
        if (rightNode) {
            this._moveNode(rightNode, SPINE_INFO['mid']);
        }
        if (rightOutNode) {
            this._moveNode(rightOutNode, SPINE_INFO['right']);
        }
    }
    _moveToRight() {
        var curNode = this._spineNodes[this._curIndex];
        var rightNode = this._spineNodes[this._curIndex + 1];
        var leftNode = this._spineNodes[this._curIndex - 1];
        var leftOutNode = this._spineNodes[this._curIndex - 2];
        if (curNode) {
            this._moveNode(curNode, SPINE_INFO['right'], function () {
                this._curIndex = this._curIndex - 1;
                this._curSpine = this._spines[this._curIndex];
                this._updateTitle();
                this._updateFragmentCount();
                this._updateArrowBtn();
                this._setBtnEnabled(true);
                this._nodeIndicator.setCurrentPageIndex(this._curIndex - 1);
            }.bind(this));
        }
        if (rightNode) {
            this._moveNode(rightNode, SPINE_INFO['rightOut']);
        }
        if (leftNode) {
            this._moveNode(leftNode, SPINE_INFO['mid']);
        }
        if (leftOutNode) {
            this._moveNode(leftOutNode, SPINE_INFO['left']);
        }
    }
    _moveNode(node: cc.Node, tarInfo, callback?) {
        var moveTo = cc.moveTo(MOVE_TIME, tarInfo.pos);
        var scaleTo = cc.scaleTo(MOVE_TIME, tarInfo.scale);
        var fadePicFunc = cc.callFunc(function () {
            var pic = node.getChildByName('nodePic') as cc.Node;
            pic.runAction(cc.fadeTo(MOVE_TIME, tarInfo.opacity));
        });
        var fadeSpineFunc = cc.callFunc(function () {
            var ball = node.getChildByName('spine') as cc.Node;
            ball.runAction(cc.fadeTo(MOVE_TIME, tarInfo.opacityBall));
        });
        var spawn = cc.spawn(moveTo, scaleTo, fadePicFunc, fadeSpineFunc);
        node.runAction(cc.sequence(spawn, cc.callFunc(function () {
            node.zIndex = (tarInfo.order);
            if (callback) {
                callback();
            }
        })));
    }
    _customActivityDrawPetSuccess(eventName, actType, drawType, records, equips) {
        if (actType != CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET) {
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
            this._playStarBlink(star, drawType, records);
            this._playStarSound(star);
        }
        this._updateData();
        this._updateCost();
        this._updateShopRP();
        this._updateFragmentCount();
    }
    _playStarSound(star) {
        var actions = [];
        var play = cc.callFunc(function () {
            G_AudioManager.playSoundWithId(AudioConst.SOUND_STAR_BLINK);
        });
        var delay = cc.delayTime(0.3);
        for (var i = 1; i <= star; i++) {
            actions.push(play);
            actions.push(delay);
        }
        var action = cc.sequence(actions);
        this.node.runAction(action);
    }
    _playStarBlink(star, index, records) {
        this._curSpine.setAnimation('effect' + star, false);
        this._curSpine.signalComplet.addOnce(function () {
            this._popupAward(records);
            this._curSpine.setAnimation('idle', true);
            this._setBtnEnabled(true);
        }.bind(this));
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
            awards.push(award);
        }
        PopupGetRewards.showRewards(awards);
    }
    _checkTime() {
        var isVisible = G_UserData.getCustomActivity().isPetActivityVisible();
        if (isVisible) {
            return true;
        } else {
            G_Prompt.showTip(Lang.get('customactivity_pet_act_end_tip'));
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
            if (drawType == CustomActivityConst.PET_DRAW_TYPE_1) {
                var rechargeUnit = G_UserData.getCustomActivityRecharge().getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET);
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
            } else if (drawType == CustomActivityConst.PET_DRAW_TYPE_2) {
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
            consume_time1 = parseInt(Paramter.get(886).content);
            consume_time2 = parseInt(Paramter.get(886).content);
            hit_num = this._configInfo.hit_num;
            [result, costYuBi, itemCount] = checkCostCoin(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
            if (!result) {
                var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
                G_Prompt.showTip(Lang.get('customactivity_pet_cost_not_enough', {
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

    _updateShopRP() {
        var shopRP = G_UserData.getShopActive().isShowPetRedPoint();
        this._btnShop.showRedPoint(shopRP);
    }


}