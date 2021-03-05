import { FunctionConst } from "../../const/FunctionConst";
import { RichTextExtend } from "../../extends/RichTextExtend";
import { Colors } from "../../init";
import { Lang } from "../../lang/Lang";
import { TacticsDataHelper } from "../../utils/data/TacticsDataHelper";
import { handler } from "../../utils/handler";
import { LogicCheckHelper } from "../../utils/LogicCheckHelper";
import UIHelper from "../../utils/UIHelper";
import CommonButtonLevel0Highlight from "../component/CommonButtonLevel0Highlight";
import CommonNormalMiniPop from "../component/CommonNormalMiniPop";
import PopupBase from "../PopupBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupTacticsPositionUnlockInfo extends PopupBase {
    private _info: any;
    private _callbackOK: any;
    @property({
        type: CommonNormalMiniPop,
        visible: true
    }) _popBG: CommonNormalMiniPop = null;
    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    }) _btnOk: CommonButtonLevel0Highlight = null;
    @property({
        type: cc.Label,
        visible: true
    }) _txt2: cc.Label = null;
    @property({
        type: cc.Node,
        visible: true
    }) _panelContent: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    }) _txt3: cc.Node = null;

    ctor(info, callbackOK, isClickOtherClose, isNotCreateShade) {
        this._info = info;
        this._callbackOK = callbackOK;
    }
    onCreate() {
        this._popBG.setTitle(Lang.get('tactics_unlock_position_popup_title'));
        UIHelper.addClickEventListenerEx(this._popBG.node, handler(this, this.onButtonClose));
        UIHelper.addClickEventListenerEx(this._btnOk.node, handler(this, this.onButtonOK));
        this._btnOk.setString(Lang.get('common_btn_sure'));
        this._initDesc();
    }
    onButtonClose() {
        this.close();
    }
    onButtonOK() {
        if (this._callbackOK) {
            this._callbackOK();
        }
        this.close();
    }
    _initDesc() {
        var slot = this._info.slot;
        var isOpen = LogicCheckHelper.funcIsOpened(FunctionConst['FUNC_TACTICS_POS' + slot]), _, funcLevelInfo;
        var level = funcLevelInfo.level;
        this._txt2.string = (Lang.get('tactics_unlock_pos_popup_content1', { level: level }));
        var [needColor, needNum] = TacticsDataHelper.getTacticsPosUnlockParam(slot);
        var colorTip = Lang.get('lang_sellfragmentselect_quality_' + needColor);
        var color = Colors.COLOR_QUALITY[needColor];
        var colorStr = Colors.toHexStr(color);
        var outlineColor = Colors.COLOR_QUALITY_OUTLINE[needColor];
        var outlineColorStr = Colors.toHexStr(outlineColor);
        var outlineSize = 0;
        if (needColor == 7) {
            outlineSize = 2;
        }
        var content = Lang.get('tactics_unlock_pos_popup_content2', {
            num: needNum,
            colorTip: colorTip,
            colorStr: colorStr,
            outlineColorStr: outlineColorStr,
            outlineSize: outlineSize
        });
        var richText = UIHelper.newRichText();
        RichTextExtend.setRichTextWithJson(richText.getComponent(cc.RichText), content);
        var size = this._panelContent.getContentSize();
        var sizeTemp = cc.size(size.width, 0);
        richText.setAnchorPoint(cc.v2(0, 0.5));
        richText.setContentSize(sizeTemp);
        this._txt3.getParent().addChild(richText);
        this._txt3.active = (false);
        var pos = cc.v2(this._txt3.getPosition());
        richText.setPosition(pos);
    }
}