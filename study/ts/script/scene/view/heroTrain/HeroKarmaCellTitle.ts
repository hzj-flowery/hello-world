import UIHelper from "../../../utils/UIHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import { handler } from "../../../utils/handler";
import CommonButtonLevel2Highlight from "../../../ui/component/CommonButtonLevel2Highlight";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HeroKarmaCellTitle extends cc.Component {

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonActive: CommonButtonLevel1Highlight= null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDes: cc.Label= null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageActivated: cc.Sprite= null;

    private _callback:any;

    public setInitData(callback):void{
         this._callback = callback;
    }
    onLoad() {
        this._buttonActive.setBtnType(2);
        this._init();
    }
    _init() {
        this._buttonActive.setString (Lang.get('hero_karma_btn_active'));
        this._buttonActive.addClickEventListenerEx(handler(this, this.onClickButton));
    }
    setDes(des, isActivated, isCanActivate, attrId) {
        this._textDes.string = (des);
        if (isActivated) {
            this._imageActivated.node.active = (true);
            this._buttonActive.node.active = (false);
        } else {
            this._imageActivated.node.active = (false);
            this._buttonActive.node.active = (true);
            this._buttonActive.setEnabled(isCanActivate);
        }
    }
    private onClickButton() {
        if (this._callback) {
            this._callback();
        }
    }
}