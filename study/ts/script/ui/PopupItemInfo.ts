import PopupBase from "./PopupBase";
import CommonNormalMiniPop from "./component/CommonNormalMiniPop";
import CommonIconTemplate from "./component/CommonIconTemplate";
import CommonButtonLevel0Highlight from "./component/CommonButtonLevel0Highlight";
import { Lang } from "../lang/Lang";
import { handler } from "../utils/handler";
import { assert } from "../utils/GlobleFunc";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { Path } from "../utils/Path";
import UIHelper from "../utils/UIHelper";
const { ccclass, property } = cc._decorator;

@ccclass
export class PopupItemInfo extends PopupBase {
    public static path = 'common/PopupItemInfo';

    private static ICON_NORMAL_X = 78.21;
    private static ICON_TITLE_X = 55;
    private static DESC_NORMAL_X = 143;
    private static DESC_TITLE_X = 163;

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMiniPop = null;
    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _itemIcon: CommonIconTemplate = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _itemDesc: cc.Label = null;
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
        type: cc.ScrollView,
        visible: true
    })
    _scrollView: cc.ScrollView = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnOk: CommonButtonLevel0Highlight = null;
    _title = Lang.get('common_title_item_info');;
    _callback: any;
    _itemId: any;
    _useNum: number;

    ctor(title, callback) {
        this._title = title;
        this._callback = callback;
        this._itemId = null;
        this._useNum = 1;
    }
    start() {
        this._isClickOtherClose = true;
        this._btnOk.setString(Lang.get('common_btn_sure'));
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._commonNodeBk.setTitle(this._title);
        this._commonNodeBk.hideCloseBtn();
        this._btnOk.addClickEventListenerEx(handler(this, this.onBtnOk));
    }
    updateUI(itemType, itemId) {
      //assert((itemId, 'PopupItemInfo\'s itemId can\'t be empty!!!');
        this._itemIcon.unInitUI();
        this._itemIcon.initUI(itemType, itemId);
        this._itemIcon.setTouchEnabled(false);
        this._itemIcon.setImageTemplateVisible(true);
        var itemParams = this._itemIcon.getItemParams();
        this._itemName.string = (itemParams.name);
        this._itemName.node.color = (itemParams.icon_color);
        if (itemParams.cfg.color == 7) {
            UIHelper.enableOutline(this._itemName, itemParams.icon_color_outline, 2);
        }
        if (itemType == TypeConvertHelper.TYPE_TITLE) {
            this._itemIcon.setImageTemplateVisible(false);
            this._itemIcon.node.x = (PopupItemInfo.ICON_TITLE_X);
            this._itemName.node.x = (PopupItemInfo.DESC_TITLE_X);
            this._scrollView.node.x = (PopupItemInfo.DESC_TITLE_X);
            this._itemOwnerDesc.node.active = (false);
            this._itemOwnerCount.node.active = (false);
        } else if (itemType == TypeConvertHelper.TYPE_FLAG) {
            this._itemIcon.setImageTemplateVisible(false);
        } else {
            this._itemIcon.setImageTemplateVisible(true);
            this._itemIcon.node.x = (PopupItemInfo.ICON_NORMAL_X);
            this._itemName.node.x = (PopupItemInfo.DESC_NORMAL_X);
            this._scrollView.node.x = (PopupItemInfo.DESC_NORMAL_X);
            this._itemOwnerDesc.node.active = (true);
            this._itemOwnerCount.node.active = (true);
        }
        this._itemDesc.string = (itemParams.cfg.description);
        this._itemId = itemId;
        var itemOwnerNum = UserDataHelper.getNumByTypeAndValue(itemType, itemId);
        this.setOwnerCount(itemOwnerNum);
    }
    setOwnerCount(count) {
        this._itemOwnerCount.string = ('' + count);
    }
    _onInit() {
    }
    onEnter() {
    }
    onExit() {
    }
    onBtnOk() {
        var isBreak = null;
        if (this._callback) {
            isBreak = this._callback(this._itemId);
        }
        if (!isBreak) {
            this.close();
        }
    }
    onBtnCancel() {
        this.close();
    }
    setSecretUI() {
        this._itemIcon.loadIcon(Path.getActivityRes('secretIcon'));
        this._itemOwnerDesc.node.active = (false);
        this._itemOwnerCount.node.active = (false);
        this._itemName.string = (Lang.get('lang_activity_beta_appointment_secret'));
        this._itemDesc.string = (Lang.get('lang_activity_beta_appointment_secret_info'));
    }
}