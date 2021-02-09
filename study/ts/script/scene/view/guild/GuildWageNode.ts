const { ccclass, property } = cc._decorator;

import CommonHelp from '../../../ui/component/CommonHelp'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import ViewBase from '../../ViewBase';
import { G_SignalManager, G_UserData, Colors } from '../../../init';
import { handler } from '../../../utils/handler';
import { SignalConst } from '../../../const/SignalConst';
import { GuildDataHelper } from '../../../utils/data/GuildDataHelper';
import { Lang } from '../../../lang/Lang';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { Triangulate } from '../../../utils/Triangulate';

@ccclass
export default class GuildWageNode extends ViewBase {

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _wageItem01: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _wageItem02: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textActivePercent: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textActiveEvaluate: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textActiveDayNum: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildPosition: cc.Label = null;

    @property({
        type: CommonHelp,
        visible: true
    })
    _commonHelp: CommonHelp = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelClip: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageHelpAct: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageAskHelpAct: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBossAct: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGuildFightAct: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageStageAct: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageAct: cc.Sprite = null;
    _itemNodes: CommonIconTemplate[];
    _taskNodes: cc.Sprite[];
    _signalGuildBaseInfoUpdate: any;
    _signalGuildGetUserGuild: any;

    public static readonly ACT_COLOR_IMGS = [
        'img_guild_huoyue_b02',
        'img_guild_huoyue_b03',
        'img_guild_huoyue_b04',
        'img_guild_huoyue_b05',
        'img_guild_huoyue_b06'
    ];

    onEnter() {
        this._signalGuildBaseInfoUpdate = G_SignalManager.add(SignalConst.EVENT_GUILD_BASE_INFO_UPDATE, handler(this, this._onEventGuildBaseInfoUpdate));
        this._signalGuildGetUserGuild = G_SignalManager.add(SignalConst.EVENT_GUILD_GET_USER_GUILD, handler(this, this._onEventGuildGetUserGuild));
    }
    onExit() {
        this._signalGuildBaseInfoUpdate.remove();
        this._signalGuildBaseInfoUpdate = null;
        this._signalGuildGetUserGuild.remove();
        this._signalGuildGetUserGuild = null;
    }
    onCreate() {
        this._itemNodes = [
            this._wageItem01,
            this._wageItem02
        ];
        this._taskNodes = [
            this._imageAct,
            this._imageHelpAct,
            this._imageBossAct,
            this._imageGuildFightAct,
            this._imageStageAct,
            this._imageAskHelpAct
        ];
        this._commonHelp.updateLangName('HELP_GUILD_WAGE');
    }
    updateView() {
        this._updateContent();
        G_UserData.getGuild().c2sGetGuildBase();
    }
    _updateContent() {
        var userGuildInfo = G_UserData.getGuild().getUserGuildInfo();
        var myGuild = G_UserData.getGuild().getMyGuild();
        var items = myGuild.getWeekWageItems();
        var dayNum = myGuild.getActive_days();
        var userMemberData = G_UserData.getGuild().getMyMemberData();
        var myPosition = userMemberData.getPosition();
        var duties = GuildDataHelper.getGuildDutiesName(myPosition);
        var activePercent = GuildDataHelper.getGuildTotalActivePercent();
        var activeColor = GuildDataHelper.getGuildTotalActiveColor();
        for (var k in this._itemNodes) {
            var v = this._itemNodes[k];
            var item = items[k];
            if (item) {
                v.unInitUI();
                v.initUI(item.type, item.value, item.size);
            }
        }
        this._textActiveEvaluate.string = (Lang.get('guild_task_active_evaluate_arr')[activeColor]);
        for (let k = 0; k < this._taskNodes.length; k++) {
            var a = this._taskNodes[k];
            var taskData = myGuild.getGuildTaskUnitData(k + 1);
            this._updateTaskItem(a.node, taskData);
        }
        this._textGuildPosition.string = (duties);
        this._textActiveDayNum.string = (Lang.get('guild_active_day_num', { value: dayNum }));
        this._textActivePercent.string = (Lang.get('guild_task_active_percent', { value: activePercent }));
        var pList = this._getClipPoints();
        this.createClippingNode(pList);
    }
    _updateTaskItem(node: cc.Node, taskData) {
        var text = (node.getChildByName("Text") as cc.Node).getComponent(cc.Label);
        var textName = (node.getChildByName("Text_0") as cc.Node).getComponent(cc.Label);
        var config = taskData.getConfig();
        var people = taskData.getPeople();
        var maxPeople = config.max_active;
        var actColor = 1;
        for (var k = 5; k >= 1; k += -1) {
            if (people >= config['color' + k]) {
                actColor = k;
                break;
            }
        }
        // node.setTag(actColor);
        UIHelper.loadTexture(node.getComponent(cc.Sprite), Path.getGuildRes(GuildWageNode.ACT_COLOR_IMGS[actColor - 1]));
        if (config.is_open == 1) {
            text.string = (Lang.get('common_progress_2', {
                curr: people,
                max: maxPeople
            }));
        } else {
            text.string = (Lang.get('common_function_not_open'));
        }
        textName.string = (config.name);
    }
    _getClipPoints() {
        var radius = 159;
        var minLen = 30;
        var pList = [];
        var activeAngle = [
            120,
            180,
            240,
            300,
            0,
            60
        ];
        var myGuild = G_UserData.getGuild().getMyGuild();
        for (var k = 0; k < this._taskNodes.length; k++) {
            var v = this._taskNodes[k];
            var taskData = myGuild.getGuildTaskUnitData(k + 1);
            var config = taskData.getConfig();
            var people = taskData.getPeople();
            var maxPeople = config.max_active;
            var len = people * (radius - minLen) / maxPeople + minLen;
            var p = {
                x: 0,
                y: 0
            };
            var ao = activeAngle[k];
            p.x = len * Math.cos(ao * 3.14 / 180);
            p.y = len * Math.sin(ao * 3.14 / 180);
            pList.push(p);
        }
        return pList;
    }
    createClippingNode(p) {
        var node = new cc.Node();
        node.addComponent(cc.Graphics);
        let drawNode = node.getComponent(cc.Graphics) as cc.Graphics;
        this._panelClip.removeAllChildren();
        var result = [];
        Triangulate.Process(p, result);
        var tcount = result.length / 3;

        drawNode.lineJoin = cc.Graphics.LineJoin.ROUND;
        drawNode.lineWidth = 5;
        drawNode.fillColor = new cc.Color(254, 183, 45);
        drawNode.strokeColor = new cc.Color(255, 183, 10)

        drawNode.moveTo(p[0].x, p[0].y);
        for (var i = 1; i < p.length; i += 1) {
            drawNode.lineTo(p[i].x, p[i].y);
        }
        drawNode.lineTo(p[0].x, p[0].y);
        drawNode.close(); // 组成一个封闭的路径
        drawNode.stroke();
        drawNode.fill();
        //画6个大点
        for (var i = 0; i < p.length; i += 1) {
            drawNode.circle(p[i].x, p[i].y, 6)
            drawNode.fill();
        }



        // for (var i = 1; i <= tcount; i += 1) {
        //     var p1 = result[(i - 1) * 3 + 0];
        //     var p2 = result[(i - 1) * 3 + 1];
        //     var p3 = result[(i - 1) * 3 + 2];
        //     drawNode.moveTo(p1.x, p1.y);
        //     drawNode.lineTo(p2.x, p2.y);
        //     drawNode.lineTo(p3.x, p2.y);

        //     drawNode.close(); // 组成一个封闭的路径
        //     drawNode.stroke();
        //     drawNode.fill();
        //     drawNode.fillColor = new cc.Color(254, 183, 45, 0)
        // }
        this._panelClip.addChild(node);
        node.setPosition(0, 0);
        // var stencil = new cc.Node();
        // stencil.addChild(drawNode);
        // var clipObject = display.newSprite(Path.getGuildRes('img_guild_gongzi01'));
        // var clippingNode = new cc.ClippingNode();
        // clippingNode.setStencil(stencil);
        // clippingNode.addChild(clipObject);
        // clippingNode.setInverted(false);
        // clippingNode.setAlphaThreshold(1);
        // clippingNode.setName('clippingNode');
        // var size = this._panelClip.getContentSize();
        // clippingNode.setPosition(size.width * 0.5, size.height * 0.5);
        // this._panelClip.addChild(clippingNode);
        // var linePointDrawNode = new cc.DrawNode();
        // for (var k in p) {
        //     var v = p[k];
        //     if (p[k + 1]) {
        //         linePointDrawNode.drawSegment(p[k], p[k + 1], 1.5, cc.c4f(1, 0.72, 0.04, 1));
        //     } else {
        //         linePointDrawNode.drawSegment(p[k], p[1], 1.5, cc.c4f(1, 0.72, 0.04, 1));
        //     }
        //     linePointDrawNode.drawDot(v, 5, cc.c4f(1, 0.72, 0.04, 1));
        // }
        // this._panelClip.addChild(linePointDrawNode);
    }
    _onEventGuildBaseInfoUpdate(event) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateContent();
    }
    _onEventGuildGetUserGuild(event) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateContent();
    }

}