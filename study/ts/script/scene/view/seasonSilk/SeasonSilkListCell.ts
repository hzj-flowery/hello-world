const { ccclass, property } = cc._decorator;

import CommonButtonSwitchLevel2 from '../../../ui/component/CommonButtonSwitchLevel2'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { handler } from '../../../utils/handler';
import { G_Prompt } from '../../../init';

@ccclass
export default class SeasonSilkListCell extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodeIcon: CommonIconTemplate = null;

    @property({ type: cc.Label, visible: true })
    _textName: cc.Label = null;

    @property({ type: CommonButtonSwitchLevel2, visible: true })
    _wearButton: CommonButtonSwitchLevel2 = null;

    private _customCallback;
    private _data;
    
    public onLoad() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        if(!this._data)
        this._wearButton.setString(Lang.get('season_silk_wear'));
        this._wearButton.addClickEventListenerEx(handler(this, this._onWear));
        this._wearButton.switchToHightLight();
    }

    public updateUI(data) {
        this._data = data;
        this._fileNodeIcon.unInitUI();
        this._fileNodeIcon.initUI(TypeConvertHelper.TYPE_SILKBAG, data.id);
        var params = this._fileNodeIcon.getItemParams();
        var nameStr = data.name;
        this._textName.string = nameStr;
        this._textName.node.color = (params.icon_color);
        if (params.cfg.color == 7) {
            UIHelper.enableOutline(this._textName, params.icon_color_outline, 2);
        }
        if (data.isWeared) {
            this._wearButton.setString(Lang.get('season_silk_weared'));
            this._wearButton.switchToHightLight();
        } else {
            this._wearButton.setString(Lang.get('season_silk_wear'))
            this._wearButton.switchToHightLight();
        }
    }

    private _onWear(sender: cc.Touch) {
        if (this._data.isWeared == true) {
            G_Prompt.showTip(Lang.get('season_silk_alreadyweared', { name: this._data.name }));
        } else {
            if (this._customCallback) {
                this._customCallback(this._data);
            }
        }
    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }
}