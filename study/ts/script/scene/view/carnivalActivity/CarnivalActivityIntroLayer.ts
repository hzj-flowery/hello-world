import ViewBase from "../../ViewBase";
import { assert } from "../../../utils/GlobleFunc";
import { G_ConfigLoader, Colors, G_ServerTime } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import UIActionHelper from "../../../utils/UIActionHelper";
import { Lang } from "../../../lang/Lang";
import { CustomActivityUIHelper } from "../customActivity/CustomActivityUIHelper";
import CarnivalActivityIntroTitleNode from "./CarnivalActivityIntroTitleNode";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import ListViewCellBase from "../../../ui/ListViewCellBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CarnivalActivityIntroLayer extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _otherClient: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _countdownText: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _countdownTime: cc.Label = null;

    @property(cc.Prefab)
    CarnivalActivityIntroTitleNode:cc.Prefab = null;

    _actType: any;
    _activityData: any;
    _resConfig: any;
    static TEXT_WIDTH = 576;
    static TEXT_UP_GAP = 10;
    static TEXT_DOWN_GAP = 26;

    ctor(actType) {
        this._actType = actType;
        this._activityData = null;
        this._resConfig = null;

    }
    onCreate() {
    }
    onEnter(){

    }
    onExit(){

    }
    _updateText() {
        this._listView.removeAllChildren();
        var title = this._activityData.getTitle1();
        var desc = this._activityData.getDesc1();
        var title2 = this._activityData.getTitle2();
        var desc2 = this._activityData.getDesc2();
        var resId = this._activityData.getDrop_res_id();
        var FestivalResConfog = G_ConfigLoader.getConfig(ConfigNameConst.FESTIVAL_RES);
        var resConfig = FestivalResConfog.get(resId);
      //assert((resConfig != null, 'can not find res id');
        this._resConfig = resConfig;
        //logWarn('--ddd-----------' + resId);
        UIHelper.loadTexture(this._imageBg, resConfig.res_id);
        if (title && title != '') {
            var timeWidget = this._createTitleWidget(title);
            this._listView.pushBackCustomItem(timeWidget);
        }
        if (desc && desc != '') {
            var contentWidget = this._createContentWidget(desc, 1);
            this._listView.pushBackCustomItem(contentWidget);
        }
        if (title2 && title2 != '') {
            var timeWidget = this._createTitleWidget(title2);
            this._listView.pushBackCustomItem(timeWidget);
        }
        if (desc2 && desc2 != '') {
            var contentWidget = this._createContentWidget(desc2, 2);
            this._listView.pushBackCustomItem(contentWidget);
        }
    }
    _createTitleWidget(title) {
        var widget = new cc.Node();
        var resourceNode = cc.instantiate(this.CarnivalActivityIntroTitleNode).getComponent(CarnivalActivityIntroTitleNode);
        UIHelper.loadTexture(resourceNode._resourceNode, this._resConfig.res_id_2);
        resourceNode.text.string = title;
        resourceNode.text.node.color = Colors.toColor3B(parseInt(this._resConfig.color_1));
        var size = resourceNode.node.getContentSize();
        widget.setAnchorPoint(0.5,0)
        resourceNode.node.y = size.height / 2;
        widget.addChild(resourceNode.node);
        widget.addComponent(ListViewCellBase);
        widget.setContentSize(size);
        return widget;
    }
    _createContentWidget(desc, index) {
        var widget = new cc.Node();
        var textColor = Colors.toColor3B(parseInt(this._resConfig.color_2));
        var specialColor = Colors.toColor3B(parseInt(this._resConfig.color_3));
        // var subTitles = RichTextExtend.parse2SubTitleExtend(desc, true);
        // subTitles = RichTextExtend.fillSubTitleUseColor(subTitles, [
        //     null,
        //     specialColor,
        //     null
        // ]);
        // var richElementList = RichTextHelper.convertSubTitleToRichMsgArr({
        //     textColor: textColor,
        //     fontSize: 20
        // }, subTitles);
        //var richStr = JSON.stringify(richElementList);//json.encode(richElementList);
        //logWarn(richStr);
        var labelText = UIHelper.createMultiAutoCenterRichTextByParam(desc, {
            defaultColor: textColor,
            defaultSize: 20,
            other: [{
                    fontSize: 20,
                    color: specialColor
                }]
        }, 8, 1, CarnivalActivityIntroLayer.TEXT_WIDTH, '=');
        // let comp = labelText.getComponent(cc.Label);
        // if(comp){
        //     (comp as any)._updateRenderData(true);
        // }
        var size= labelText.getContentSize();
        var height = size.height + CarnivalActivityIntroLayer.TEXT_UP_GAP;
        // if (index != 2) {
        //     height = height + CarnivalActivityIntroLayer.TEXT_DOWN_GAP;
        // }

        labelText.setAnchorPoint(cc.v2(0, 1));
        var curPosY = 0;
        for(var i=0; i<labelText.childrenCount; i++){
            var child = labelText.children[i];
            child.setPosition(0,curPosY);
            curPosY -= child.height;
        }
        //labelText.setPosition(cc.v2(0, height - CarnivalActivityIntroLayer.TEXT_UP_GAP));
        labelText.setPosition(-size.width/2,height);
        widget.setAnchorPoint(0.5,0)
        widget.addChild(labelText);
        widget.addComponent(ListViewCellBase);
        widget.setContentSize(cc.size(CarnivalActivityIntroLayer.TEXT_WIDTH, height));
        return widget;
    }
    // static TEXT_WIDTH(desc: any, arg1: { defaultColor: any; defaultSize: number; other: { fontSize: number; color: any; }[]; }, arg2: number, arg3: number, TEXT_WIDTH: any, arg5: string) {
    //     throw new Error("Method not implemented.");
    // }
    refreshView(activityData, resetListData) {
        this._activityData = activityData;
        this._updateText();
        this._refreshTime();
    }
    _refreshTime() {
        this._countdownTime.node.stopAllActions();
        this._updateTime();
        var action = UIActionHelper.createUpdateAction(function () {
            this._updateTime();
        }.bind(this), 0.5);
        this._countdownTime.node.runAction(action);
    }
    _updateTime() {
        if (!this._activityData) {
            return;
        }
        var startTime = this._activityData.getStart_time();
        var endTime = this._activityData.getEnd_time();
        var awardTime = this._activityData.getAward_time();
        var curTime = G_ServerTime.getTime();
        if (curTime < startTime) {
            this._countdownText.node.active = (true);
            this._countdownText.string = (Lang.get('lang_carnival_activity_begin_countdown'));
            this._countdownTime.string = (CustomActivityUIHelper.getLeftDHMSFormat(startTime));
        } else if (curTime >= startTime && curTime < endTime) {
            this._countdownText.node.active = (true);
            this._countdownText.string = (Lang.get('lang_carnival_activity_end_countdown'));
            this._countdownTime.string = (CustomActivityUIHelper.getLeftDHMSFormat(endTime));
        } else if (curTime >= endTime && curTime < awardTime) {
            this._countdownText.node.active = (true);
            this._countdownText.string = (Lang.get('lang_carnival_activity_award_end_countdown'));
            this._countdownTime.string = (CustomActivityUIHelper.getLeftDHMSFormat(awardTime));
        } else {
            this._countdownText.node.active = (false);
            this._countdownTime.node.stopAllActions();
            this._countdownTime.string = (Lang.get('lang_carnival_activity_award_end'));
        }
        var targetPosX = this._countdownText.node.x + this._countdownText.node.getContentSize().width + 6;
        this._countdownTime.node.x = (targetPosX);
    }

}
