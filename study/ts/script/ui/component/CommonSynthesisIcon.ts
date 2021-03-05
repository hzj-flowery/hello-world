const { ccclass, property } = cc._decorator;

import { RichTextExtend } from '../../extends/RichTextExtend';
import { Colors, G_SceneManager } from '../../init';
import { Lang } from '../../lang/Lang';
import { handler } from '../../utils/handler';
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';
import UIHelper from '../../utils/UIHelper';
import { PopupItemInfo } from '../PopupItemInfo';
import CommonItemIcon from './CommonItemIcon';

@ccclass
export default class CommonSynthesisIcon extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: CommonItemIcon,
        visible: true
    })
    _fileNodeIcon: CommonItemIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _textCountParent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectNode: cc.Node = null;
    _richTextCount: any;
    _materialType: number;
    _materialValue: number;

    _init() {
        this._materialType = TypeConvertHelper.TYPE_ITEM;
        this._materialValue = 0;
    }

    setType(type) {
        this._materialType = type || TypeConvertHelper.TYPE_ITEM;
    }
    getType() {
        return this._materialValue;
    }
    updateUI(materialType, materialValue, needNum, ownNum) {
        this._materialType = materialType;
        this._materialValue = materialValue;
        this.setType(this._materialType);
        this._fileNodeIcon.updateUI(this._materialValue);
        var param = TypeConvertHelper.convert(this._materialType, this._materialValue);
        this._textName.string = (param.name);
        this._textName.node.color = (param.icon_color);
        UIHelper.enableOutline(this._textName, param.icon_color_outline, 2);
        this.updateCount(needNum, ownNum);
        this._fileNodeIcon.setCallBack(handler(this,this.onClickIcon));
    }
    updateCount(needNum, ownNum) {
        if (this._richTextCount) {
            this._richTextCount.node.destroy();
            this._richTextCount = null;
        }
        var value1Color = new cc.Color(255, 0, 0);
        if (needNum <= ownNum) {
            value1Color = new cc.Color(255, 255, 255);
        }
        var param = {
            value1: ownNum,
            value2: needNum,
            color: Colors.colorToHexStr(value1Color)
        };
        this._richTextCount = RichTextExtend.createWithContent(Lang.get('synthesis_icon_count', param));
        this._textCountParent.addChild(this._richTextCount.node);
    }
    onClickIcon(sender, state) {
        var itemParam = this._fileNodeIcon.getItemParams();
        G_SceneManager.openPopup("prefab/common/PopupItemInfo",(popup:PopupItemInfo)=>{
            popup.updateUI(itemParam.item_type, itemParam.cfg.id);
            popup.openWithAction();
        });
    }
    getEffectNode() {
        return this._effectNode;
    }

}