import PopupInput from "./PopupInput";
import { handler } from "../utils/handler";
import { Lang } from "../lang/Lang";
import ServerConst from "../const/ServerConst";
import { G_Prompt } from "../init";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupInputSecretKey extends PopupInput {
    _successCallBack;

    ctor(successCallBack,cancelCallback) {
        this._successCallBack = successCallBack;
        super.ctor(handler(this, this._onVerfySecretKey),cancelCallback, Lang.get("login_input_secret_key_title"),Lang.get("login_input_secret_key_content"),
        Lang.get("login_input_secret_key_null_tip"),Lang.get("login_input_secret_key_placeholder"),8)
    }

    _onVerfySecretKey(txt) {
        if (ServerConst.hasMatchedSecretKey(txt)){
            this._successCallBack && this._successCallBack();
            return false;
        }
        G_Prompt.showTip(Lang.get('login_input_secret_key_wrong_tip'));
        return true;
    }
}