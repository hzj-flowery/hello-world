const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { FunctionConst } from '../../../const/FunctionConst';
import { Lang } from '../../../lang/Lang';
import { GuildDataHelper } from '../../../utils/data/GuildDataHelper';
import { Colors, G_ConfigLoader } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';

@ccclass
export default class GuildTaskItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTaskName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTaskDesc2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textReputationValue: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageComplete: cc.Sprite = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonOK: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTaskDesc1: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeProgress: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTips: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageIcon: cc.Sprite = null;
    _data: any;

    onCreate() {
        var x = this._resourceNode.getPosition().x;
        var y = this._resourceNode.getPosition().y;
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height + y);
        this._buttonOK.setString(Lang.get('common_btn_goto'));
    }

    updateUI(data): void {
        this.updateData(data);
    }

    updateData(data) {
        this._data = data;
        var config = data.getConfig();
        var people = data.getPeople();
        var exp = data.getExp();
        var maxPeople = config.max_active;
        var isHasComplete = GuildDataHelper.isGuildTaskHasComplete(config.type);
        var isProgressFull = people >= maxPeople;
        this._textTaskName.string = (config.name);
        this._textTaskDesc2.string = (Lang.get('guild_task_reputation_desc', { value: config.name }));
        this._textReputationValue.string = (exp.toString());
        var richText = Lang.get('guild_task_people_progress', {
            value: people,
            max: maxPeople,
            valueColor: Colors.colorToHexStr(Colors.BRIGHT_BG_GREEN),
            maxColor: Colors.colorToHexStr(isProgressFull ? Colors.BRIGHT_BG_GREEN : Colors.BRIGHT_BG_ONE)
        });
        this._createProgressRichText(richText);
        if (config.function_id > 0) {
            var funInfo = G_ConfigLoader.getConfig('function_level').get(config.function_id);
            // assert(funInfo, 'function_level can not find id ' + tostring(config.function_id));
            UIHelper.loadTexture(this._imageIcon, Path.getCommonIcon('main', funInfo.icon))
            // this._imageIcon.ignoreContentAdaptWithSize(true);
        }
        this._openTask(data.getConfig().is_open == 1);
        if (data.getConfig().is_open != 1) {
            return;
        }
        var showSkip = config.function_id > 0 && !isHasComplete;
        this._buttonOK.setVisible(showSkip);
        this._imageComplete.node.active = (isHasComplete);
        // this._panelTouch.setTouchEnabled(showSkip);
    }
    _openTask(visible) {
        this._nodeProgress.active = (visible);
        this._textTaskDesc2.node.active = (visible);
        this._textReputationValue.node.active = (visible);
        this._textTips.node.active = (!visible);
        this._buttonOK.node.active = (visible);
        this._imageComplete.node.active = (false);
    }
    _onGoHandler(sender, state) {
    }
    onClickCallBack(sender) {
        // var offsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        // var offsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        // if (offsetX < 20 && offsetY < 20) {
        var config = this._data.getConfig();
        this._gotoFunc(config.function_id);
        // }
    }
    _createProgressRichText(richText) {
        this._nodeProgress.removeAllChildren();
        let node1 = new cc.Node();
        node1.addComponent(cc.RichText);
        let rich = node1.getComponent(cc.RichText);
        rich.string = UIHelper.getRichTextContent(richText);
        rich.node.setAnchorPoint(cc.v2(0, 0.5));
        this._nodeProgress.addChild(rich.node);
    }
    _gotoFunc(funcId) {
        if (funcId > 0) {
            if (funcId == FunctionConst.FUNC_GUILD_HELP) {
                WayFuncDataHelper.gotoModuleByFuncId(funcId, true);
            } else {
                // if (funcId == FunctionConst.FUNC_GUILD_ANSWER) {
                //     WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_GUILD_WAR);
                //     // WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_GUILD_SERVER_ANSWER);
                // }
                WayFuncDataHelper.gotoModuleByFuncId(funcId);
            }
        }
    }

}