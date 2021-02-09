const { ccclass, property } = cc._decorator;

import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Lang } from '../../../lang/Lang';
import { CakeActivityConst } from '../../../const/CakeActivityConst';

@ccclass
export default class CakeLevelAwardCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel: cc.Label = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _icon1: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _icon2: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _icon3: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _icon4: CommonIconTemplate = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _button: CommonButtonSwitchLevel1 = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageReceived: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLock: cc.Sprite = null;

    _state: number;
    
    private _data;
    onCreate() {
        this._state = 0;
        var size = this._panelBg.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(data, index) {
        var awards = data.awards;
        this._data = data;
        var strLevel = Lang.get('cake_activity_level_award_level_text', { level: data.level });
        var state = data.state;
        this._imageBg.node.active = (index % 2 == 0);
        for (var i = 1; i <= 4; i++) {
            var award = awards[i - 1];
            if (award) {
                this['_icon' + i].node.active = (true);
                this['_icon' + i].unInitUI();
                this['_icon' + i].initUI(award.type, award.value, award.size);
            } else {
                this['_icon' + i].node.active = (false);
            }
        }
        this._textLevel.string = (strLevel);
        this._button.setVisible(false);
        this._imageReceived.node.active = (false);
        if (state == CakeActivityConst.AWARD_STATE_1) {
            this._button.setVisible(true);
            this._button.setString('');
            this._imageLock.node.active = (true);
            this._button.switchToNormal();
        } else if (state == CakeActivityConst.AWARD_STATE_2) {
            this._button.setVisible(true);
            this._button.setString(Lang.get('common_receive'));
            this._imageLock.node.active = (false);
            this._button.switchToHightLight();
        } else if (state == CakeActivityConst.AWARD_STATE_3) {
            this._imageReceived.node.active = (true);
        }
    }
    onClick() {
        this.dispatchCustomCallback(1);
    }
    getData() {
        return this._data;
    }

}