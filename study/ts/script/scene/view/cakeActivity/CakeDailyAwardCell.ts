const { ccclass, property } = cc._decorator;

import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Lang } from '../../../lang/Lang';
import { CakeActivityConst } from '../../../const/CakeActivityConst';
import { G_UserData } from '../../../init';

@ccclass
export default class CakeDailyAwardCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

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
        type: CommonIconTemplate,
        visible: true
    })
    _icon5: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDay: cc.Label = null;

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
    _imageTimeOut: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLock: cc.Sprite = null;

    _state: number;


    onCreate() {
        this._state = 0;
        var size = this._panelBg.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(data) {
        var awards = data.awards;
        var strDay = Lang.get('cake_activity_daily_award_day_text', { day: Lang.get('common_days')[data.day - 1] });
        var state = data.state;
        for (var i = 0; i < 5; i++) {
            var award = awards[i];
            if (award) {
                this['_icon' + (i + 1)].node.active = (true);
                this['_icon' + (i + 1)].unInitUI();
                this['_icon' + (i + 1)].initUI(award.type, award.value, award.size);
            } else {
                this['_icon' + (i + 1)].node.active = (false);
            }
        }
        this._textDay.string = (strDay);
        this._button.setVisible(false);
        this._imageReceived.node.active = (false);
        this._imageTimeOut.node.active = (false);
        if (state == CakeActivityConst.DAILY_AWARD_STATE_1) {
            this._imageTimeOut.node.active = (true);
        } else if (state == CakeActivityConst.DAILY_AWARD_STATE_2) {
            this._button.setVisible(true);
            this._button.setString(Lang.get('common_receive'));
            this._button.switchToHightLight();
            this._imageLock.node.active = (false);
        } else if (state == CakeActivityConst.DAILY_AWARD_STATE_3) {
            this._imageReceived.node.active = (true);
        } else if (state == CakeActivityConst.DAILY_AWARD_STATE_4) {
            this._button.setVisible(true);
            this._button.setString('');
            this._button.switchToNormal();
            this._imageLock.node.active = (true);
        } else if (state == CakeActivityConst.DAILY_AWARD_STATE_0) {
            G_UserData.getCakeActivity().c2sEnterCakeActivity();
        }
    }
    onClick() {
        this.dispatchCustomCallback(1);
    }

}