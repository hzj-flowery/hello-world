import CommonInstrumentName from "../../../ui/component/CommonInstrumentName";
import CommonInstrumentIcon from "../../../ui/component/CommonInstrumentIcon";
import { handler } from "../../../utils/handler";
import { FunctionConst } from "../../../const/FunctionConst";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { Lang } from "../../../lang/Lang";
import { G_UserData, G_SceneManager, G_ConfigLoader } from "../../../init";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import InstrumentConst from "../../../const/InstrumentConst";
import { assert } from "../../../utils/GlobleFunc";
import UIActionHelper from "../../../utils/UIActionHelper";
import PopupItemGuider from "../../../ui/PopupItemGuider";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import PopupChooseInstrument from "../../../ui/popup/PopupChooseInstrument";
import PopupChooseInstrumentHelper from "../../../ui/popup/PopupChooseInstrumentHelper";
import UIHelper from "../../../utils/UIHelper";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TeamInstrumentIcon extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLock: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTip: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _spriteAdd: cc.Sprite = null;

    @property({
        type: CommonInstrumentName,
        visible: true
    })
    _fileNodeName: CommonInstrumentName = null;

    @property({
        type: CommonInstrumentIcon,
        visible: true
    })
    _fileNodeCommon: CommonInstrumentIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRedPoint: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    private _isOpen:boolean;
    private _pos:number;
    private _heroBaseId:number;
    private _instrumentId:number;
    private _treasureId:number;
    private _totalList:Array<any>;
    private _noWearList:Array<any>;
    _isOnlyShow: boolean;


    onLoad() {
        this._isOpen = false;
        this._pos = null;
        this._treasureId = null;
        this._totalList = null;
        this._noWearList = null;
        this._panelTouch.on(cc.Node.EventType.TOUCH_END,handler(this, this._onPanelTouch));
        UIHelper.enableOutline(this._textTip,new cc.Color(119,41,9),2)
        this._initUnlock();
    }
    _initUI() {
        this._imageLock.node.active = (false);
        this._textTip.node.active = (false);
        this._spriteAdd.node.active = (false);
        this._fileNodeCommon.node.active = (false);
        this._fileNodeName.node.active = (false);
        this._imageRedPoint.node.active = (false);
        this._imageArrow.node.active = (false);
    }
    _initUnlock (){
        var [isOpen, __, info] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT);
        if (!isOpen) {
            this._textTip.fontSize = (14);
            this._textTip.node.setPosition(0,0);
            this._textTip.node.active = (true);
            this._textTip.string = (Lang.get('instrument_txt_open', { level: info.level }));
        }
    }
    updateIcon(pos, heroBaseId) {
        this._isOnlyShow = false;
        this._initUI();
        var ret = FunctionCheck.funcIsOpened(FunctionConst.FUNC_INSTRUMENT);
        var isOpen = ret[0];
        var des = ret[1]; 
        var info = ret[2];
        this._isOpen = isOpen;
        if (!isOpen) {
            this._imageLock.node.active = (true);
            this._textTip.node.active = (true);
            this._textTip.node.setPosition(cc.v2(36, 42));
            this._textTip.fontSize = (14);
            this._textTip.string = (Lang.get('instrument_txt_open', { level: info.level }));
            return;
        }
        this._pos = pos;
        this._heroBaseId = heroBaseId;
        this._instrumentId = G_UserData.getBattleResource().getResourceId(pos, 3, 1);
        if (this._instrumentId) {
            var data = G_UserData.getInstrument().getInstrumentDataWithId(this._instrumentId);
            var baseId = data.getBase_id();
            var limitLevel = data.getLimit_level();
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, null, null, limitLevel);
            this._fileNodeCommon.node.active = (true);
            this._fileNodeCommon.updateUI(baseId, null, limitLevel);
            this._fileNodeCommon.setRlevel(data.getLevel());
            this._fileNodeName.node.active = (true);
            this._fileNodeName.setName(baseId, null, limitLevel);
            this._fileNodeCommon.hideBg();
        } else {
            var ret:any[] = G_UserData.getInstrument().getReplaceInstrumentListWithSlot(this._pos, this._heroBaseId);
            this._totalList = ret[0], 
            this._noWearList = ret[1];
            if (this._noWearList&&this._noWearList.length > 0) {
                this._spriteAdd.node.active = (true);
                this._textTip.node.active = (true);
                this._textTip.node.setPosition(cc.v2(36, -9));
                this._textTip.fontSize = (18);
                this._textTip.node.setPosition(0,-51);
                this._textTip.string = (Lang.get('instrument_add_tip'));
                UIActionHelper.playBlinkEffect(this._spriteAdd.node);
            }
        }
    }
    _onPanelTouch() {
        if (!this._isOpen) {
            return;
        }
        if (this._instrumentId) {
            G_SceneManager.showScene('instrumentDetail', this._instrumentId, InstrumentConst.INSTRUMENT_RANGE_TYPE_2);
        } else {
            if (this._noWearList.length == 0) {
                var configInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(this._heroBaseId);
              //assert((configInfo, cc.js.formatStr('hero config can not find id = %d', this._heroBaseId));
                var instrumentId = configInfo.instrument_id;
                if (instrumentId > 0) {
                    UIPopupHelper.popupItemGuider(function(popupItemGuider:PopupItemGuider){
                        popupItemGuider.updateUI(TypeConvertHelper.TYPE_INSTRUMENT, instrumentId);
                        popupItemGuider.setTitle(Lang.get('way_type_get'));
                    }.bind(this))
                }
            } else {
                var callBack = handler(this, this._onChooseInstrument);
                var totalList = this._totalList;
                UIPopupHelper.popupChooseInstrument(function(popup:PopupChooseInstrument){
                    popup.openWithAction();
                    popup.setTitle(Lang.get('instrument_wear_title'));
                    popup.updateUI(PopupChooseInstrumentHelper.FROM_TYPE1, callBack, totalList);
                });
            }
        }
    }
    _onChooseInstrument(instrumentId) {
        G_UserData.getInstrument().c2sAddFightInstrument(this._pos, instrumentId);
    }
    showRedPoint(visible) {
        this._imageRedPoint.node.active = (visible);
    }
    showUpArrow(visible) {
        this._imageArrow.node.active = (visible);
        if (visible) {
            UIActionHelper.playFloatEffect(this._imageArrow.node);
        }
    }
    onlyShow(data) {
        this._initUI();
        //this._panelTouch.setEnabled(false);
        if (data) {
            var baseId = data.getBase_id();
            var limitLevel = data.getLimit_level();
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, null, null, limitLevel);
            this._fileNodeCommon.node.active = (true);
            this._fileNodeCommon.updateUI(baseId, null, limitLevel);
            this._fileNodeCommon.setRlevel(data.getLevel());
            this._fileNodeName.node.active = (true);
            this._fileNodeCommon.hideBg();
            this._fileNodeName.setName(baseId, null, limitLevel);
        }
    }
    setVisible(visible) {
        this.node.active = (visible);
    }
    showTextBg(bShow) {
        this._fileNodeName.showTextBg(bShow);
        this._fileNodeName.setFontSize(18);
    }

    showUnlockView(isVisible) {
        this._imageLock.node.active = (!isVisible);
        this._spriteAdd.node.active = (!isVisible);
        this._fileNodeCommon.node.active = (!isVisible);
        this._imageRedPoint.node.active = (!isVisible);
        this._fileNodeName.node.active = (!isVisible);
        this._imageArrow.node.active = (!isVisible);
    }
}