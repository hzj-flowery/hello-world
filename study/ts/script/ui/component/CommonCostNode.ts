const {ccclass, property} = cc._decorator;

import { RichTextExtend } from '../../extends/RichTextExtend';
import { Colors } from '../../init';
import { Lang } from '../../lang/Lang';
import { UserDataHelper } from '../../utils/data/UserDataHelper';
import { handler } from '../../utils/handler';
import { Path } from '../../utils/Path';
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';
import UIActionHelper from '../../utils/UIActionHelper';
import UIHelper from '../../utils/UIHelper';
import { UIPopupHelper } from '../../utils/UIPopupHelper';
import PopupItemGuider from '../PopupItemGuider';
import CommonIconTemplate from './CommonIconTemplate';
import CommonUI from './CommonUI';

@ccclass
export default class CommonCostNode extends cc.Component {

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _fileNodeIcon: CommonIconTemplate = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeNumPos: cc.Node = null;

   private _myCount:number;
   private _needCount:number;
   private _isReachCondition:boolean;
   private _addSprite:cc.Sprite;
   private _closeMode:boolean;
   _init() {
    // this._fileNodeIcon = ccui.Helper.seekNodeByName(this._target, 'FileNodeIcon');
    // cc.bind(this._fileNodeIcon, 'CommonIconTemplate');
    // this._textName = ccui.Helper.seekNodeByName(this._target, 'TextName');
    // this._nodeNumPos = ccui.Helper.seekNodeByName(this._target, 'NodeNumPos');
}
updateView(data?, filterId?) {
    this._fileNodeIcon.initUI(data.type, data.value, data.size);
    this._fileNodeIcon.showCount(false);
    this._fileNodeIcon.setTouchEnabled(true);
    this._fileNodeIcon.setCallBack(handler(this, this._onClickIcon));
    var param = TypeConvertHelper.convert(data.type, data.value);
    this._textName.string = (param.name);
    this._textName.node.color = (param.icon_color);
    UIHelper.updateTextOutline(this._textName, param);
    this._textName.fontSize = this._textName.fontSize-2;
    this._myCount = UserDataHelper.getSameCardCount(data.type, data.value, filterId);
    //cc.log(this._myCount);
    this._needCount = data.size;
    var color = this._myCount < this._needCount ? Colors.colorToNumber(Colors.uiColors.RED) : Colors.colorToNumber(Colors.uiColors.GREEN);
    this._isReachCondition = this._myCount >= this._needCount;
    this._fileNodeIcon.setIconMask(!this._isReachCondition);
    if (!this._isReachCondition) {
        if (this._addSprite == null) {
            var node= new cc.Node();
            this._addSprite = (node.addComponent(cc.Sprite) as cc.Sprite);
            this._addSprite.node.addComponent(CommonUI).loadTexture(Path.getUICommon('img_com_btn_add01'));
            this._fileNodeIcon.node.addChild(this._addSprite.node);
            UIActionHelper.playBlinkEffect(this._addSprite.node);
        }
    } else {
        if (this._addSprite) {
            this._addSprite.node.destroy()
            this._addSprite = null;
        }
    }
    var content = Lang.get('treasure_refine_cost_count', {
        value1: this._myCount,
        color: color,
        value2: this._needCount
    });

    let richText = RichTextExtend.createWithContent(content);
    if (this._closeMode) {
        richText.node.setAnchorPoint(new cc.Vec2(0.5, 1));
    } else {
        richText.node.setAnchorPoint(new cc.Vec2(0, 0.75));
    }
    this._nodeNumPos.removeAllChildren();
    this._nodeNumPos.addChild(richText.node);
}
isReachCondition() {
    return this._isReachCondition;
}
getNeedCount():number {
    return this._needCount;
}
getMyCount() {
    return this._myCount;
}
setCloseMode() {
    this._closeMode = true;
    this._textName.node.active = (false);
    this._nodeNumPos.setPosition(new cc.Vec2(0, -40));
}
_onClickIcon() {
    var itemParam = this._fileNodeIcon.getItemParams();
    UIPopupHelper.popupItemGuider(function(popupItemGuider:PopupItemGuider){
        popupItemGuider.updateUI(itemParam.item_type, itemParam.cfg.id);
        popupItemGuider.setTitle(Lang.get('way_type_get'));
    });
}
}