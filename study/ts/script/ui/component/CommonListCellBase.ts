const { ccclass, property } = cc._decorator;

import CommonIconTemplate from './CommonIconTemplate'
import UIHelper from '../../utils/UIHelper';
import { RichTextExtend } from '../../extends/RichTextExtend';

@ccclass
export default class CommonListCellBase extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _panel: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _background: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _fileNodeIcon: CommonIconTemplate = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLine: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageShadow_1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageShadow_2: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCount: cc.Node = null;

    _cellId;
    richText;

    updateUI(type, value, size?, param?) {
        //this._fileNodeIcon.unInitUI();
        var params = null;
        if (!param) {
            this._fileNodeIcon.initUI(type, value, size);
            params = this._fileNodeIcon.getItemParams();
        } else {
            params = param;
        }

        this._textName.string = (params.name);
        if (params.icon_color)
            this._textName.node.color = (params.icon_color);
        UIHelper.updateTextOutline(this._textName, params);
        this._cellId = value;
    }
    setUniqueId(id) {
        if (this._fileNodeIcon) {
            this._fileNodeIcon.setUniqueId(id);
        }
    }
    setName(name, color?, params?) {
        if (name == null) {
            name = '';
        }
        this._textName.string = (name);
        if (color) {
            this._textName.node.color = (color);
        }
        if (params) {
            UIHelper.updateTextOutline(this._textName, params)
        }
    }
    setCallBack(callback) {
        this._fileNodeIcon.setCallBack(callback);
    }
    setTouchEnabled(enabled) {
        this._fileNodeIcon.setTouchEnabled(enabled);
    }
    getCommonIcon() {
        return this._fileNodeIcon;
    }
    getIconId() {
        return this._cellId;
    }
    setIconCount(num) {
        this._fileNodeIcon.setCount(num);
    }
    setCountText(richText) {
        this._nodeCount.removeAllChildren();
        if (richText) {
            this._textName['_updateRenderData'](true);
            var posX = this._textName.node.x;
            var posY = this._textName.node.y;
            var width = this._textName.node.width;
            richText.setAnchorPoint(0, 0.5);
            this._nodeCount.setPosition(posX + width, posY);
            this._nodeCount.addChild(richText);
        }
    }

    setCountTextContent(content) {
        if (!this.richText) {
            var textCount = RichTextExtend.createWithContent(content);
            this.richText = textCount;
            this.setCountText(textCount.node);
        } else {
            RichTextExtend.udpateWithContent(this.richText, content);
            this._textName['_updateRenderData'](true);
            var posX = this._textName.node.x;
            var posY = this._textName.node.y;
            var width = this._textName.node.width;
            this._nodeCount.setPosition(posX + width, posY);
        }
    }

    getNameSizeWidth() {
        UIHelper.updateLabelSize(this._textName);
        var width = this._textName.node.getContentSize().width;
        return width;
    }
    setEquipBriefVisible(visible) {
        this._fileNodeIcon.setEquipBriefVisible(visible);
    }
    updateEquipBriefBg(horseLevel) {
        this._fileNodeIcon.updateEquipBriefBg(horseLevel);
    }
    updateEquipBriefIcon(stateList) {
        this._fileNodeIcon.updateEquipBriefIcon(stateList);
    }
    setVisible(visible) {
        this.node.active = visible;
    }

}
