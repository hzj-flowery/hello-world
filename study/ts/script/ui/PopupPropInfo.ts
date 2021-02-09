import PopupBase from "./PopupBase";
import CommonNormalMiniPop from "./component/CommonNormalMiniPop";
import CommonIconTemplate from "./component/CommonIconTemplate";
import CommonButtonLevel0Highlight from "./component/CommonButtonLevel0Highlight";
import CommonDesValue from "./component/CommonDesValue";
import { Lang } from "../lang/Lang";
import { Colors, G_ConfigLoader, G_UserData } from "../init";
import { handler } from "../utils/handler";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { HeroDataHelper } from "../utils/data/HeroDataHelper";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { TextHelper } from "../utils/TextHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export class PopupPropInfo extends PopupBase {
    public static path = 'common/PopupPropInfo';

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _nodeBg: CommonNormalMiniPop = null;
    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _itemIcon: CommonIconTemplate = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;
    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnOk: CommonButtonLevel0Highlight = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _fileNodeOwn: CommonDesValue = null;
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

    _isFragment: any;
    _id: any;
    _callback: any;

    ctor(id, isFragment?) {
        this._isFragment = isFragment;
        this._id = id;
    }
    start() {
        this._nodeBg.setTitle(Lang.get('hero_awake_prop_title'));
        this._btnOk.setString(Lang.get('common_btn_name_confirm'));
        this._fileNodeOwn.setValueColor(Colors.BRIGHT_BG_GREEN);
        this._fileNodeOwn.setFontSize(22);
        for (var i = 1; i <= 4; i++) {
            this['_fileNodeAttr' + i].setValueColor(Colors.BRIGHT_BG_GREEN);
            this['_fileNodeAttr' + i].setFontSize(22);
        }
        this._initUI();
        this._nodeBg.setCloseVisible(false);
        this._btnOk.addClickEventListenerEx(handler(this, this._onBtnOk));
    }
    _initUI() {
        var attrInfo, param;
        if (this._isFragment) {
            var Fragment = G_ConfigLoader.getConfig(ConfigNameConst.FRAGMENT);
            var fragmentData = Fragment.get(this._id);
            attrInfo = HeroDataHelper.getGemstoneAttr(fragmentData.comp_value);
            param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_GEMSTONE, fragmentData.comp_value);
            this._itemIcon.initUI(TypeConvertHelper.TYPE_FRAGMENT, this._id);
            var count = G_UserData.getFragments().getFragNumByID(this._id);
            this._fileNodeOwn.updateUI(Lang.get('hero_awake_prop_own_des'), count, fragmentData.fragment_num);
        } else {
            var unitData = G_UserData.getGemstone().getUnitDataWithId(this._id);
            var count = 0;
            if (unitData) {
                count = unitData.getNum();
            }
            this._fileNodeOwn.updateUI(Lang.get('hero_awake_prop_own_des'), count);
            attrInfo = HeroDataHelper.getGemstoneAttr(this._id);
            param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_GEMSTONE, this._id);
            this._itemIcon.initUI(TypeConvertHelper.TYPE_GEMSTONE, this._id);
        }
        this._itemIcon.setTouchEnabled(false);
        this._itemIcon.setImageTemplateVisible(true);
        var itemParams = this._itemIcon.getItemParams();
        this._textName.string = (itemParams.name);
        this._textName.node.color = (itemParams.icon_color);
        var desInfo = TextHelper.getAttrInfoBySort(attrInfo);
        for (var i = 1; i<=4; i++) {
            var one = desInfo[i-1];
            if (one) {
                var arr = TextHelper.getAttrBasicText(one.id, one.value);
                var attrName = arr[0], attrValue = arr[1];
                this['_fileNodeAttr' + i].updateUI(attrName, '+' + attrValue);
                this['_fileNodeAttr' + i].setValueColor(Colors.BRIGHT_BG_GREEN);
                this['_fileNodeAttr' + i].setVisible(true);
            } else {
                this['_fileNodeAttr' + i].setVisible(false);
            }
        }
    }
    setCallback(callback) {
        this._callback = callback;
    }
    setBtnDes(btnDes) {
        this._btnOk.setString(btnDes);
    }
    _onBtnOk() {
        if (this._callback) {
            this._callback();
        }
        this.close();
    }
}