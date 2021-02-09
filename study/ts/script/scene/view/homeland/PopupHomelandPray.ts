const { ccclass, property } = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import UIHelper from '../../../utils/UIHelper';
import { G_UserData, G_SignalManager, G_Prompt, G_AudioManager } from '../../../init';
import { HomelandHelp } from './HomelandHelp';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import HomelandPraySignNode from './HomelandPraySignNode';
import { Lang } from '../../../lang/Lang';
import { AudioConst } from '../../../const/AudioConst';
import PopupBase from '../../../ui/PopupBase';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';

var LOW_ZORDER = 1;
var MIDDLE_ZORDER = 10;
var HIGH_ZORDER = 100;

@ccclass
export default class PopupHomelandPray extends PopupBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _nodeResource: CommonResourceInfo = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCount: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSignBg: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node4: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node5: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelSign: cc.Node = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    homelandPraySignNode: cc.Prefab = null;

    _nodeSignPos: {};
    _canClickPanelSign: boolean;
    _selectPos: number;
    _resType: any;
    _resValue: any;
    _resSize: any;
    _signalBlessSuccess: any;


    onCreate() {
        UIHelper.addEventListenerToNode(this.node, this._imageBg.node, 'PopupHomelandPray', '_onClickImageBg');
        UIHelper.addEventListenerToNode(this.node, this._panelSign, 'PopupHomelandPray', '_onClickPanelSign');
        this._nodeSignPos = {};
        for (var i = 1; i <= 5; i++) {
            var pos = cc.v2(this['_node' + i].getPosition());
            this._nodeSignPos[i] = pos;
            this['_node' + i].zIndex = (LOW_ZORDER);
        }
        this._canClickPanelSign = false;
        this._selectPos = 0;
        var mainTreeLevel = G_UserData.getHomeland().getMainTreeLevel();
        var info = HomelandHelp.getTreeInfoConfig(mainTreeLevel);
        this._resType = info.prayer_cost_type;
        this._resValue = info.prayer_cost_value;
        this._resSize = info.prayer_cost_size;
        this._panelSign.active = (false);
        this._panelSign.zIndex = (MIDDLE_ZORDER);
    }
    onEnter() {
        this._signalBlessSuccess = G_SignalManager.add(SignalConst.EVENT_HOME_TREE_BLESS_SUCCESS, handler(this, this._onEventBlessSuccess));
        this._updataSigns();
        this._updateTips();
        this._playEnterEffect();
    }
    onExit() {
        this._signalBlessSuccess.remove();
        this._signalBlessSuccess = null;
    }
    _updataSigns() {
        var buffDatas = G_UserData.getHomeland().getBuffDatasToday();
        for (var i = 1; i <= 5; i++) {
            var pray = cc.instantiate(this.homelandPraySignNode).getComponent(HomelandPraySignNode);
            pray.ctor(i, handler(this, this._onClickSign));
            this['_sign' + i] = pray;
            new HomelandPraySignNode();
            this['_node' + i].addChild(pray.node);
            this['_node' + i].setScale(0.8);
            var data = buffDatas[i];
            this['_sign' + i].updateUI(data);
        }
    }
    _updateTips() {
        this._nodeResource.updateUI(this._resType, this._resValue, this._resSize);
        this._nodeResource.setTextColorToGAndBTypeColor();
        this._nodeCount.removeAllChildren();
        var count = G_UserData.getHomeland().getPrayRestCount();
        var formatStr = Lang.get('homeland_pray_count_des', { count: count });
        var params = {
            defaultColor: cc.color(255, 184, 12),
            defaultSize: 20
        };
        var richText = RichTextExtend.createRichTextByFormatString(formatStr, params);
        richText.node.setAnchorPoint(cc.v2(0.5, 1));
        this._nodeCount.addChild(richText.node);
    }
    _onClose() {
        this.close();
    }

    _onClickSign(pos) {
        if (G_UserData.getHomeland().getPrayRestCount() <= 0) {
            G_Prompt.showTip(Lang.get('homeland_pray_count_empty_tip'));
            return;
        }
        var isOk = LogicCheckHelper.enoughMoney(this._resSize);
        if (!isOk) {
            G_Prompt.showTip(Lang.get('common_money_not_enough'));
            return;
        }
        G_UserData.getHomeland().c2sHomeTreeBless(pos);
        this['_sign' + pos].setClickEnable(false);
    }
    _onEventBlessSuccess(eventName, buffId, pos) {
        this._playDrawEffect(buffId, pos);
        this._updateTips();
    }
    _playDrawEffect(buffId, pos) {
        this._panelSign.active = (true);
        this._canClickPanelSign = false;
        this['_node' + pos].zIndex = (HIGH_ZORDER);
        var spawn = cc.spawn(cc.moveTo(0.4, cc.v2(0, 0)), cc.scaleTo(0.4, 1));
        var seq = cc.sequence(spawn, cc.callFunc(function () {
            var data = G_UserData.getHomeland().getBuffDataWithId(buffId);
            this['_sign' + pos].updateUI(data);
            this['_sign' + pos].playDrawEffect();
            this._canClickPanelSign = true;
            this['_sign' + pos].setClickEnable(true);
        }.bind(this)));
        this['_node' + pos].runAction(seq);
        G_AudioManager.playSoundWithId(AudioConst.SOUND_JIEQIAN);
        this._selectPos = pos;
    }
    _onClickImageBg() {
        this.close();
    }
    _onClickPanelSign() {
        if (this._canClickPanelSign) {
            this._panelSign.active = (false);
            var pos = this._selectPos;
            this['_node' + pos].setPosition(this._nodeSignPos[pos]);
            this['_node' + pos].zIndex = (LOW_ZORDER);
            this['_node' + pos].setScale(0.8);
            this['_sign' + pos].stopDrawEffect();
        }
    }
    _playEnterEffect() {
        for (var i = 1; i <= 5; i++) {
            this['_sign' + i].playEnterEffect();
        }
    }
}