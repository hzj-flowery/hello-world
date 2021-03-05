import CommonButtonLevel2Highlight from "../../../ui/component/CommonButtonLevel2Highlight";
import { Lang } from "../../../lang/Lang";
import { handler } from "../../../utils/handler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HorseKarmaCellTitle extends cc.Component {

    @property({ type: CommonButtonLevel2Highlight, visible: true })
    _buttonActive: CommonButtonLevel2Highlight = null;
    @property({ type: cc.Sprite, visible: true })
    _imageActivated: cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    _textAttr_1: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textAttr_2: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textAttr_3: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textAttr_4: cc.Label = null;

    private COLOR_ATTR = [
        cc.color(182, 101, 17), cc.color(47, 159, 7)
    ]

    private POS_ATTR = [
        cc.v2(54, 219), cc.v2(170, 219), cc.v2(54, 198), cc.v2(170, 198)
    ]

    private MAX_ATTR_NUM = 4

    private _callback;
    private _textDes;
    private _attrLabelList: cc.Label[];
    public init(callback) {
        this._callback = callback;
        this._textDes = null;
        this._attrLabelList = [];
        this._init();
    }

    private _init() {
        this._buttonActive.setString(Lang.get('hero_karma_btn_active'));
        this._buttonActive.addClickEventListenerEx(handler(this, this._onClickButton));
        this._attrLabelList = [this._textAttr_1, this._textAttr_2, this._textAttr_3, this._textAttr_4];
        for (let i = 0; i < this._attrLabelList.length; i++) {
            this._attrLabelList[i].node.active = false;
        }
    }

    public setDes(desInfo, isActivated, isCanActivate, attrId?) {
        if (isActivated) {
            this._imageActivated.node.active = (true);
            this._buttonActive.setVisible(false);
        } else {
            this._imageActivated.node.active = (false);
            this._buttonActive.setVisible(true);
            this._buttonActive.setEnabled(isCanActivate);
            this.scheduleOnce(()=>{
                this._buttonActive.setEnabled(isCanActivate);
            });
        }
        this._setAttrColor(isActivated);
        this._setAttrDesc(desInfo);
    }

    private _setAttrColor(isActivated) {
        var color = this.COLOR_ATTR[0];
        if (isActivated) {
            color = this.COLOR_ATTR[1];
        }
        for (let i in this._attrLabelList) {
            var labelAttr = this._attrLabelList[i];
            labelAttr.node.color = (color);
        }
    }

    private _setAttrDesc(desInfo) {
        for (let i in this._attrLabelList) {
            var labelAttr = this._attrLabelList[i];
            labelAttr.node.active = false;
            if (desInfo[i]) {
                labelAttr.node.active =(true);
                labelAttr.string = (desInfo[i]);
            }
        }
    }

    private _onClickButton() {
        if (this._callback) {
            this._callback();
        }
    }
}