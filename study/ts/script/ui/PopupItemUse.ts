import CommonNormalSmallPop from "./component/CommonNormalSmallPop";
import PopupBase from "./PopupBase";
import CommonIconTemplate from "./component/CommonIconTemplate";
import CommonSelectNumNode from "./component/CommonSelectNumNode";
import CommonButtonLevel0Normal from "./component/CommonButtonLevel0Normal";
import CommonButtonLevel0Highlight from "./component/CommonButtonLevel0Highlight";
import { Lang } from "../lang/Lang";
import { handler } from "../utils/handler";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { G_Prompt } from "../init";
import { FunctionConst } from "../const/FunctionConst";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { DataConst } from "../const/DataConst";
import { assert } from "../utils/GlobleFunc";
import UIHelper from "../utils/UIHelper";
import { ShopConst } from "../const/ShopConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupItemUse extends PopupBase {

    public static path = 'common/PopupItemUse';

    @property({
        type: CommonNormalSmallPop,
        visible: true
    })
    _commonNodeBk: CommonNormalSmallPop = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTips: cc.Label = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _itemIcon: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _itemName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _itemOwnerDesc: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _itemOwnerCount: cc.Label = null;

    @property({
        type: CommonSelectNumNode,
        visible: true
    })
    _selectNumNode: CommonSelectNumNode = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnCancel: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnOk: CommonButtonLevel0Highlight = null;


    _title = Lang.get('common_title_batch_use_item');
    _callback: any;
    _itemId: any = -1;
    _useNum: number = 1;
    _shopConst: number = 0;
    _itemNameStr: any;
    _itemType: number;

    ctor(title, callback) {
        this._title = title;
        this._callback = callback;
        this.setMaxLimit(99);
    }
    start() {

    }
    checkSlectNum(isClose) {
        var maxValue = UserDataHelper.getResItemMaxUseNum(this._itemId);
        isClose = isClose || false;
        if (isClose && this._selectNumNode.getMaxLimit() == 0) {
            G_Prompt.showTip(Lang.get('common_tip_enough', { name: this._itemNameStr }));
            return false;
        }
        if (this._itemNameStr && this._selectNumNode.getMaxLimit() == 0) {
            G_Prompt.showTip(Lang.get('common_tip_enough', { name: this._itemNameStr }));
            return false;
        }
        if (this._useNum == this._selectNumNode.getMaxLimit()) {
            if (this._shopConst == FunctionConst.FUNC_GACHA_GOLDENHERO_SHOP) {
                G_Prompt.showTip(Lang.get('common_use_dragpeace_no_have'));
            } else if (this._shopConst == ShopConst.SHOP_FIX_LIMIT_RICE || this._shopConst == ShopConst.SHOP_FIX_LIMIT_ATKCMD) {
                G_Prompt.showTip(Lang.get('common_tip_enough', { name: this._itemNameStr }));
            }
        }
        return true;
    }
    _onNumSelect(num) {
        this._useNum = num;
        if (this._useNum == this._selectNumNode.getMaxLimit()) {
            if (this._itemType == TypeConvertHelper.TYPE_ITEM) {
                var maxValue = UserDataHelper.getResItemMaxUseNum(this._itemId);
                if (this._useNum == maxValue) {
                    if (this._itemId == DataConst.ITEM_VIT) {
                        G_Prompt.showTip(Lang.get('common_use_vit_max'));
                    }
                    if (this._itemId == DataConst.ITEM_SPIRIT) {
                        G_Prompt.showTip(Lang.get('common_use_spirit_max'));
                    }
                    if (this._itemId == DataConst.ITEM_ARMY_FOOD) {
                        G_Prompt.showTip(Lang.get('common_use_armyfood_max'));
                    }
                }
            }
        }
    }
    setShopConst(type) {
        this._shopConst = type;
    }
    updateUI(itemType, itemId, itemSize?) {
        itemType = itemType || TypeConvertHelper.TYPE_ITEM;
      //assert((itemId, 'PopupItemUse\'s itemId can\'t be empty!!!');
        this._itemIcon.unInitUI();
        this._itemIcon.initUI(itemType, itemId, itemSize);
        this._itemIcon.setImageTemplateVisible(true);
        var itemParams = this._itemIcon.getItemParams();
        this._itemName.string = (itemParams.name);
        this._itemName.node.color = (itemParams.icon_color);
        if (itemParams.cfg.color == 7) {
            UIHelper.enableOutline(this._itemName, itemParams.icon_color_outline, 2);
        }
        this._itemId = itemId;
        this._itemType = itemType;
        this._itemNameStr = itemParams.name;
    }
    setMaxLimit(max) {
        if (max == null) {
          //assert((false, 'PopupItemUse:setMaxLimit max can not be 0');
            return;
        }
        this._selectNumNode.setMaxLimit(max);
    }
    setTextTips(s) {
        if (this._textTips) {
            this._textTips.string = (s);
            this._textTips.node.active = (true);
        }
    }
    setOwnerCount(count) {
        this._itemOwnerCount.string = ('' + count);
    }
    setOwnerDesc(desc) {
        this._itemOwnerDesc.string = (desc);
    }
    _onInit() {
    }
    onCreate() {
        this._btnOk.setString(Lang.get('common_btn_sure'));
        this._btnCancel.setString(Lang.get('common_btn_cancel'));
        this._commonNodeBk.setTitle(this._title);
        this._selectNumNode.setCallBack(handler(this, this._onNumSelect));
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._btnOk.addClickEventListenerEx(handler(this, this.onBtnOk));
        this._btnCancel.addClickEventListenerEx(handler(this, this.onBtnCancel));
    }
    onExit() {
    }
    onBtnOk() {
        var isBreak;
        if (this._callback) {
            isBreak = this._callback(this._itemId, this._useNum);
        }
        if (!isBreak) {
            this.close();
        }
    }
    onBtnCancel() {
        //if (!isBreak) {
        this.close();
        //   }
    }

}
