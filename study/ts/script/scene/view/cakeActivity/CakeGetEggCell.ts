const { ccclass, property } = cc._decorator;

import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Colors } from '../../../init';
import { CakeActivityDataHelper } from '../../../utils/data/CakeActivityDataHelper';
import { CakeActivityConst } from '../../../const/CakeActivityConst';
import { Lang } from '../../../lang/Lang';
import { RichTextExtend } from '../../../extends/RichTextExtend';

@ccclass
export default class CakeGetEggCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _icon: CommonIconTemplate = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeDes: cc.Node = null;

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
    _state: number;

    onCreate() {
        this._state = 0;
        var size = this._panelBg.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(data) {
        var id = data.getCurShowId();
        var info = CakeActivityDataHelper.getCurCakeTaskConfig(id);
        this._icon.unInitUI();
        this._icon.initUI(info.award_type, info.award_value, info.award_size);
        this._state = 0;
        var strProcess = '';
        if (data.isFinish()) {
            this._state = CakeActivityConst.TASK_STATE_3;
            strProcess = '$c103_' + (Lang.get('cake_activity_task_finish') + '$');
            this._button.setVisible(false);
            this._imageReceived.node.active = (true);
        } else if (data.getValue() >= info.times) {
            this._state = CakeActivityConst.TASK_STATE_2;
            strProcess = '$c103_' + (Lang.get('cake_activity_task_finish') + '$');
            this._button.setVisible(true);
            this._imageReceived.node.active = (false);
            this._button.switchToNormal();
            this._button.setString(Lang.get('cake_activity_task_btn_2'));
        } else {
            this._state = CakeActivityConst.TASK_STATE_1;
            strProcess = '$c103_' + (data.getValue() + ('$/' + info.times));
            this._button.setVisible(true);
            this._imageReceived.node.active = (false);
            this._button.switchToHightLight();
            this._button.setString(Lang.get('cake_activity_task_btn_1'));
        }
        var formatStr = Lang.get('cake_activity_task_des', {
            des: info.desc,
            process: strProcess
        });
        var params = {
            defaultColor: Colors.BRIGHT_BG_ONE,
            defaultSize: 20
        };
        var richText = RichTextExtend.createRichTextByFormatString(formatStr, params);
        richText.node.setAnchorPoint(cc.v2(0, 0.5));
        this._nodeDes.removeAllChildren();
        this._nodeDes.addChild(richText.node);
    }
    onClick() {
        this.dispatchCustomCallback(this._state);
    }

}