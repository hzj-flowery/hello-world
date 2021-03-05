import { SignalConst } from "../../../const/SignalConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { GuildDataHelper } from "../../../utils/data/GuildDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import GuildLogTimeTitle from "./GuildLogTimeTitle";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildLogNode extends ViewBase {

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;


    _signalGuildGetSystemNotify: any;

    public static readonly LINE_WIDTH = 860;
    public static readonly RICH_TEXT_MAX_WIDTH = 775;
    public static readonly LAST_ITEM_DOWN_BLANK_HEIGHT = 25;
    public static readonly ITEM_DOWN_BLANK_HEIGHT = 15;
    public static readonly HOUR_TEXT_X = 43;
    public static readonly RICH_TEXT_X = 150;
    public static readonly FIRST_ITEM_UP_BLANK_HEIGHT = 9;

    onCreate() {
    }
    onEnter() {
        this._signalGuildGetSystemNotify = G_SignalManager.add(SignalConst.EVENT_GUILD_GET_SYSTEM_NOTIFY, handler(this, this._onEventGuildGetSystemNotify));
    }
    onExit() {
        this._signalGuildGetSystemNotify.remove();
        this._signalGuildGetSystemNotify = null;
        this.unschedule(this.CreatItem);
    }
    updateView() {
        G_UserData.getGuild().c2sGetGuildSystemNotify();
    }
    _onEventGuildGetSystemNotify(event) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateInfo();
    }

    private recordData = 0;
    private recordInfo = 0;
    private posY = 0;
    private count = 0;
    _updateInfo() {
        this._listView.content.removeAllChildren();
        this._listView.content.height = 2000;
        this.recordData = 0;
        this.recordInfo = 0;
        this.posY = 0;
        this.schedule(this.CreatItem, 0.1);
    }

    private CreatItem() {
        this.count = 0;
        var notifyDatas = G_UserData.getGuild().getSystemNotifyData();
        var datas = GuildDataHelper.formatNotify(notifyDatas);
        for (var k = this.recordData; k < datas.length; k++) {
            var info = datas[k];
            var msgNumCurrDay = info.length;
            if (msgNumCurrDay >= 1 && this.recordInfo == 0) {
                var timeWidget = this._createDateWidget(info[0].date);
                this.posY -= (timeWidget.getContentSize().height + GuildLogNode.FIRST_ITEM_UP_BLANK_HEIGHT);
                timeWidget.y = this.posY;
                this._listView.content.addChild(timeWidget);
                // this._listView.content.height += (timeWidget.getContentSize().height + GuildLogNode.FIRST_ITEM_UP_BLANK_HEIGHT);
            }
            for (var i = this.recordInfo; i < info.length; i++) {
                var unit = info[i];
                var contentWidget = this._createContentWidget(i, msgNumCurrDay, unit.time, unit.text);
                this.posY -= (contentWidget.getContentSize().height + GuildLogNode.ITEM_DOWN_BLANK_HEIGHT);
                contentWidget.y = this.posY;
                this._listView.content.addChild(contentWidget);
                this.count++;
                this.recordInfo++;
                if (this.count > 1) {
                    break;
                }
                // this._listView.content.height += (contentWidget.getContentSize().height + GuildLogNode.ITEM_DOWN_BLANK_HEIGHT);
            }

            if (this.recordInfo >= info.length) {
                this.recordData++;
                this.recordInfo = 0;
                this.posY -= 25;
            }
            else {
                break;
            }
        }

        if (this.recordData >= datas.length) {
            this.unschedule(this.CreatItem);
            this._listView.content.height = Math.abs(this.posY);
        }
    }

    _createDateWidget(time) {
        var widget = new cc.Node();
        var resourceNode = (cc.instantiate(cc.resources.get("prefab/guild/GuildLogTimeTitle")) as cc.Node).getComponent(GuildLogTimeTitle);
        resourceNode.updateLabel(time);
        var size = resourceNode.getSize();
        widget.addChild(resourceNode.node);
        widget.setContentSize(size);
        return widget;
    }
    _createContentWidget(index, msgNum, time, richElementList) {
        var widget = new cc.Node();

        var params = {
            text: Lang.get('guild_log_hour_minute_second_time', { value: time }),
            font: Path.getCommonFont(),
            fontSize: 20,
            color: Colors.BRIGHT_BG_TWO,
        };

        var labelTime = UIHelper.createLabel(params)
        // labelTime.color = (Colors.BRIGHT_BG_TWO);
        labelTime.setAnchorPoint(0, 0.5);
        labelTime.setContentSize(100, 25);

        let labelTextNode = new cc.Node;
        labelTextNode.addComponent(cc.RichText);
        var labelText = labelTextNode.getComponent(cc.RichText);
        // labelText.string = UIHelper.getRichTextContent((richElementList));
        RichTextExtend.setRichText(labelText, richElementList);
        // labelText.node.setWrapMode(1);
        labelText.node.setAnchorPoint(0, 0.5);
        // labelText.node.setCascadeOpacityEnabled(true);
        // labelText.ignoreContentAdaptWithSize(false);
        labelText.node.setContentSize(cc.size(GuildLogNode.RICH_TEXT_MAX_WIDTH, 25));
        // labelText.formatText();
        var size = labelText.node.getContentSize();
        var height = size.height;


        labelTime.setPosition(cc.v2(GuildLogNode.HOUR_TEXT_X, 0));
        labelText.node.setPosition(cc.v2(GuildLogNode.RICH_TEXT_X, 0));
        widget.addChild(labelTime);
        widget.addChild(labelText.node);
        widget.setContentSize(cc.size(GuildLogNode.LINE_WIDTH, height));
        return widget;
    }

}