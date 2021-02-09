import PopupBase from "../PopupBase";
import CommonNormalMiniPop from "../component/CommonNormalMiniPop";
import CommonIconTemplateWithBg from "../component/CommonIconTemplateWithBg";
import CommonDesValue from "../component/CommonDesValue";
import { Lang } from "../../lang/Lang";
import CommonButtonLevel0Highlight from "../component/CommonButtonLevel0Highlight";
import { handler } from "../../utils/handler";
import { Colors, G_ConfigLoader, G_UserData, G_SignalManager } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { assert } from "../../utils/GlobleFunc";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { UserDataHelper } from "../../utils/data/UserDataHelper";
import { TextHelper } from "../../utils/TextHelper";
import { SignalConst } from "../../const/SignalConst";
const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupComposeFragment extends PopupBase{
    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _nodeBg: CommonNormalMiniPop = null;
    @property({
        type: CommonIconTemplateWithBg,
        visible: true
    })
    _itemIcon: CommonIconTemplateWithBg = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _fileNodeFrag: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _fileNodeAttr1: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _fileNodeAttr2: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _fileNodeAttr3: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _fileNodeAttr4: CommonDesValue = null;
    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnCompose: CommonButtonLevel0Highlight = null;

    

    
    
    
    private _parentView:any;
    private _fragmentId:number;
    private _callback:any;
    private _signalMerageItemMsg:any;

    setInitData(parentView, fragmentId, callback) {
        this._parentView = parentView;
        this._fragmentId = fragmentId;
        this._callback = callback;
    }
    onCreate() {
        this._btnCompose.addTouchEventListenerEx(handler(this,this._onBtnCompose),false);
        this._nodeBg.setTitle(Lang.get('common_compose_prop_title'));
        this._fileNodeFrag.setValueColor(Colors.BRIGHT_BG_GREEN);
        this._fileNodeFrag.setFontSize(22);
        this._btnCompose.setString(Lang.get('common_compose_prop_btn'));
        this._nodeBg.addCloseEventListener(handler(this,this.close));
        this._isClickOtherClose = true;
        for (var i = 1; i <= 4; i++) {
            this['_fileNodeAttr' + i].setValueColor(Colors.BRIGHT_BG_GREEN);
            this['_fileNodeAttr' + i].setFontSize(22);
        }
    }
    _updateView() {
        var fragmentInfo = G_ConfigLoader.getConfig(ConfigNameConst.FRAGMENT).get(this._fragmentId);
      //assert((fragmentInfo, cc.js.formatStr('fragment config can not find id = %d', this._fragmentId));
        var compType = fragmentInfo.comp_type;
        var compValue = fragmentInfo.comp_value;
        this._itemIcon.initUI(compType, compValue);
        this._itemIcon.setTouchEnabled(false);
        this._itemIcon.setImageTemplateVisible(true);
        var itemParams = this._itemIcon.getItemParams();
        this._textName.string = (itemParams.name);
        this._textName.node.color = (itemParams.icon_color);
        var count = G_UserData.getFragments().getFragNumByID(this._fragmentId);
        this._fileNodeFrag.updateUI(Lang.get('common_compose_fragment'), count, fragmentInfo.fragment_num);
        var attrInfo = {};
        if (compType == TypeConvertHelper.TYPE_GEMSTONE) {
            attrInfo = UserDataHelper.getGemstoneAttr(compValue);
        }
        var desInfo = TextHelper.getAttrInfoBySort(attrInfo);
        for (var i = 1; i <= 4; i++) {
            var one = desInfo[i-1];
            if (one) {
                var [attrName, attrValue] = TextHelper.getAttrBasicText(one.id, one.value);
                this['_fileNodeAttr' + i].updateUI(attrName, '+' + attrValue);
                this['_fileNodeAttr' + i].setValueColor(Colors.BRIGHT_BG_GREEN);
                this['_fileNodeAttr' + i].node.active = (true);
            } else {
                this['_fileNodeAttr' + i].node.active = (false);
            }
        }
    }
    onEnter() {
        this._signalMerageItemMsg = G_SignalManager.add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(this, this._onSyntheticFragments));
        this._updateView();
    }
    onExit() {
        this._signalMerageItemMsg.remove();
        this._signalMerageItemMsg = null;
    }
    _onBtnCompose() {
        G_UserData.getFragments().c2sSyntheticFragments(this._fragmentId, 1);
    }
    _onSyntheticFragments() {
        if (this._callback) {
            this._callback();
        }
        this.close();
    }
}