import { FunctionCheck } from "../../utils/logic/FunctionCheck";
import { FunctionConst } from "../../const/FunctionConst";
import { G_UserData } from "../../init";
import UIHelper from "../../utils/UIHelper";
import { Path } from "../../utils/Path";
import PopupNextFunction from "../popup/PopupNextFunction";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonNextFunctionOpen extends cc.Component {

    @property({
        type: cc.Button,
        visible: true
    })
    _btnBg: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnFunction: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _functionImageName: cc.Sprite = null;

    private _nextFunctionInfo;
    onLoad() {
        this._functionImageName.sizeMode = cc.Sprite.SizeMode.RAW;
        this._btnFunction.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.RAW;
        this.updateUI();
    }

    public onBtnFunction() {
        if (this._nextFunctionInfo) {
            let popupNextFunction: PopupNextFunction = new cc.Node("PopupNextFunction").addComponent(PopupNextFunction);
            popupNextFunction.node.addChild(new cc.Node());
            popupNextFunction.init(this._nextFunctionInfo);
            popupNextFunction.openWithAction();
        }
    }

    public updateUI() {
        var isFunctionOpen = FunctionCheck.funcIsShow(FunctionConst.FUNC_NEXT_FUNCTION_SHOW);
        if (!isFunctionOpen) {
            this.node.active = (false);
            return;
        }
        this._nextFunctionInfo = G_UserData.getNextFunctionOpen().getNextFunctionOpenInfo();
        if (this._nextFunctionInfo) {
            this.node.active = (true);
            UIHelper.loadTexture(this._btnFunction.getComponent(cc.Sprite), Path.getCommonIcon('main', this._nextFunctionInfo.icon))
            UIHelper.loadTexture(this._functionImageName, Path.getNextFunctionOpen(this._nextFunctionInfo.nameImage));
        } else {
            this.node.active = (false);
        }
    }
}