import GemstoneConst from "../../../const/GemstoneConst";
import { Colors, G_ConfigLoader, G_EffectGfxMgr, G_SceneManager } from "../../../init";
import CommonGemstoneIcon from "../../../ui/component/CommonGemstoneIcon";
import UIActionHelper from "../../../utils/UIActionHelper";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { assert } from "../../../utils/GlobleFunc";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import EffectGfxNode from "../../../effect/EffectGfxNode";
import { PopupPropInfo } from "../../../ui/PopupPropInfo";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import { Path } from "../../../utils/Path";
import PopupComposeFragment from "../../../ui/popup/PopupComposeFragment";

var STATE2COLOR = {
    [GemstoneConst.EQUIP_STATE_1]: {
        color: Colors.CLASS_GREEN,
        outline: Colors.CLASS_GREEN_OUTLINE
    },
    [GemstoneConst.EQUIP_STATE_3]: {
        color: Colors.CLASS_GREEN,
        outline: Colors.CLASS_GREEN_OUTLINE
    },
    [GemstoneConst.EQUIP_STATE_4]: {
        color: Colors.CLASS_WHITE,
        outline: Colors.CLASS_WHITE_OUTLINE
    }
};

const {ccclass, property} = cc._decorator;

@ccclass
export default class TeamGemstoneIcon extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _spriteAdd: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textState: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLock: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRedPoint: cc.Sprite = null;

    @property({
        type: CommonGemstoneIcon,
        visible: true
    })
    _fileNodeCommon: CommonGemstoneIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;


    private _slot:number;;
    private _callback:number;
    private _baseId:number;
    private _state;
    public setInitData(slot:number,callback:any):void{
        this._slot = slot;
        this._callback = callback;
    }

    onLoad():void{
        this._panelTouch.on(cc.Node.EventType.TOUCH_END,this._onPanelTouch,this)
    }

    onDisable():void{
        // this._panelTouch.off(cc.Node.EventType.TOUCH_END,this._onPanelTouch,this)
    }
    _initUI() {
        this._spriteAdd.node.active = (false);
        this._textState.node.active = (false);
        this._imageLock.node.active = (false);
        this._imageRedPoint.node.active = (false);
        this._fileNodeCommon.node.active = (false);
    }
    updateIcon(state, baseId) {
        this._state = state;
        this._baseId = baseId;
        this._initUI();
        if (state == GemstoneConst.EQUIP_STATE_2) {
            this._fileNodeCommon.node.active = (true);
            this._fileNodeCommon.updateUI(baseId);
            this._fileNodeCommon.setIconMask(false);
        }else if (state == GemstoneConst.EQUIP_STATE_5) {
            this._imageLock.node.active = (true);
        }  
        else {
            this._fileNodeCommon.node.active = (true);
            this._fileNodeCommon.updateUI(baseId);
            this._fileNodeCommon.setIconMask(true);
            this._spriteAdd.node.active = (true);
            this._textState.node.active = (true);
            UIActionHelper.playBlinkEffect(this._spriteAdd.node);
            this._textState.node.color = (STATE2COLOR[state].color);
            UIHelper.enableOutline(this._textState,STATE2COLOR[state].outline, 2)
            if (state == GemstoneConst.EQUIP_STATE_4) {
                var [myNum, needNum] = this._getFragmentNum();
                this._textState.string = (myNum + ('/' + needNum));
            } else {
                this._textState.string = (Lang.get('hero_awake_gemstone_state_' + state));
            }
        }
    }
    _getFragmentNum():Array<number> {
        
        var gemstoneConfig = G_ConfigLoader.getConfig(ConfigNameConst.GEMSTONE).get(this._baseId);
      //assert((gemstoneConfig, cc.js.formatStr('gemstone config can not find id = %d', this._baseId));
        var fragmentId = gemstoneConfig.fragment_id;
        var itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragmentId);
        var config = itemParam.cfg;
        var myNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, fragmentId);
        var needNum = config.fragment_num;
        return [
            myNum,
            needNum
        ];
    }
    getState() {
        return this._state;
    }
    _onPanelTouch() {
        var func = this['_onClickCallback' + this._state];
        if (func) {
            this['_onClickCallback' + this._state]();
        }
    }
    _onClickCallback1() {
        var callback = function () {
            if (this._callback) {
                this._callback(this._slot);
            }
        }.bind(this);
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupPropInfo"),function(p:PopupPropInfo) {
            p.ctor(this._baseId);
            p.setCallback(callback);
            p.setBtnDes(Lang.get('hero_awake_equip_btn'));
            p.openWithAction();
        }.bind(this))



    }
    _onClickCallback2() {
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupPropInfo"),function(p:PopupPropInfo) {
            p.ctor(this._baseId);
            p.openWithAction();
        }.bind(this))
    }
    _onClickCallback3() {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.GEMSTONE).get(this._baseId);
      //assert((info, cc.js.formatStr('gemstone config can not find id = %d', this._baseId));
        var fragmentId = info.fragment_id;
        var callback = function () {
            if (this._callback) {
                this._callback(this._slot, true);
            }
        }.bind(this);
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupComposeFragment"),function(pop:PopupComposeFragment){
            pop.setInitData(this, fragmentId, callback);
            pop.openWithAction();
        }.bind(this))

    }
    _onClickCallback4() {
        var gemstoneConfig = G_ConfigLoader.getConfig(ConfigNameConst.GEMSTONE).get(this._baseId);
      //assert((gemstoneConfig, cc.js.formatStr('gemstone config can not find id = %d', this._baseId));
        var fragmentId = gemstoneConfig.fragment_id;
        UIPopupHelper.popupItemGuiderByType(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
    }
    showRedPoint(show) {
        this._imageRedPoint.node.active = (show);
    }
    playEffect() {
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect,"effect_juexing_xx",null,true)
    }
    getCommonIcon() {
        return this._fileNodeCommon;
    }

}