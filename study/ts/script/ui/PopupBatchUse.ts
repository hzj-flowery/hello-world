import PopupItemUse from "./PopupItemUse";
import { Lang } from "../lang/Lang";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupBatchUse extends PopupItemUse {

    public static path:string = "common/PopupBatchUse";
    ctor(title, callback) {
        this._title = title || Lang.get('common_title_fragment_merage');
        this._callback = callback;
        super.ctor(this._title, this._callback);
    }
    onCreate() {
        super.onCreate();
        this._btnOk.setString(Lang.get('common_btn_merage'));
    }
    updateUI(itemId) {
        var itemType = TypeConvertHelper.TYPE_FRAGMENT;
        super.updateUI(itemType, itemId);
    }
}

