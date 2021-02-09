import PopupBase from "../../../ui/PopupBase";
import { G_ResolutionManager, G_SceneManager, G_UserData, Colors, G_ServerTime } from "../../../init";
import { handler } from "../../../utils/handler";
import { HomelandHelp } from "./HomelandHelp";
import { Path } from "../../../utils/Path";
import { HomelandConst } from "../../../const/HomelandConst";
import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import { DataResetService } from "../../../service/DataResetService";

const { ccclass, property } = cc._decorator;

var SPACE = 5;
var MAX_HEIGHT = 400;

@ccclass
export default class HomelandBuffStateNode extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;
    _fromNode: any;
    _showBuffId: any;
    _fromButton: any;
    _countDownInfo: {};
    _width: number;
    _datas: any[];
    _scheduleHandler: any;

    ctor(fromNode, showBuffId) {
        this._fromNode = fromNode;
        this._showBuffId = showBuffId;
        this._fromButton = this._fromNode.getChildByName('ButtonIcon');
        this.setNotCreateShade(true);
    }
    onCreate() {
        this._panelTouch.setContentSize(G_ResolutionManager.getDesignCCSize());
        UIHelper.addEventListenerToNode(this.node, this._panelTouch, 'HomelandBuffStateNode', '_onTouchEvent');
        this._countDownInfo = {};
        this._width = this._listView.node.getContentSize().width;
    }
    onEnter() {
        this._updateView();
        this._startCountDown();
    }
    onExit() {
        this._stopCountDown();
    }
    _updateView() {
        this._datas = [];
        if (this._showBuffId && this._showBuffId > 0) {
            this._datas = G_UserData.getHomeland().getBuffDatasWithBaseId(this._showBuffId);
        } else {
            this._datas = G_UserData.getHomeland().getBuffDatasBySort();
        }
        this._listView.removeAllChildren();
        for (var i = 0; i < this._datas.length; i++) {
            var data = this._datas[i];
            if (i == 0) {
                var emptyItem = this._createEmptyItem();
                this._listView.pushBackCustomItem(emptyItem);
            }
            var needLine = i != this._datas.length - 1;
            var item = this._createItem(data, needLine);
            this._listView.pushBackCustomItem(item);
        }
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        var maxHeight = Math.min(contentSize.height, MAX_HEIGHT);
        var listSize = cc.size(contentSize.width, maxHeight);
        this._listView.node.setContentSize(listSize);
        var nodePos = this._fromButton.convertToWorldSpaceAR(cc.v2(0, 0));
        var nodeSize = this._fromButton.getContentSize();
        var posX = nodePos.x + nodeSize.width / 2 - 5;
        var posY = nodePos.y - 10;
        if (posY - maxHeight < 0) {
            posY = nodePos.y + nodeSize.height / 2 + maxHeight;
            posX = nodePos.x - contentSize.width + 5;
        }
        var dstPos = this.node.convertToNodeSpace(cc.v2(posX, posY));
        this._listView.node.setPosition(dstPos);
    }
    _createEmptyItem() {
        var widget = new cc.Node();
        var size = cc.size(this._width, 6);
        widget.setContentSize(size);
        return widget;
    }
    _createItem(data, needLine) {
        var widget = new cc.Node();
        var info = data.getConfig();
        var name = info.name;
        var color = info.color;
        var type = info.type;
        var desBuff = HomelandHelp.getBuffDes(data.getBaseId());
        var labelName = UIHelper.createWithTTF(name, Path.getCommonFont(), 16);
        labelName.node.setAnchorPoint(cc.v2(0, 1));
        labelName.node.color = (Colors.getColor(color));
        UIHelper.updateLabelSize(labelName);
        var nameHeight = labelName.node.getContentSize().height;
        widget.addChild(labelName.node);
        var desState = '';
        var labelState = UIHelper.createWithTTF(desState, Path.getCommonFont(), 16);
        var colorState = null;
        var isEffect = false;
        if (type == HomelandConst.TREE_BUFF_TYPE_1) {
            desState = Lang.get('homeland_buff_des_1');
            colorState = Colors.BRIGHT_BG_RED;
            isEffect = false;
        } else if (type == HomelandConst.TREE_BUFF_TYPE_2) {
            var restCount = data.getRestCount();
            if (restCount > 0) {
                desState = Lang.get('homeland_buff_des_2', { count: restCount });
                colorState = Colors.NUMBER_GREEN;
                isEffect = true;
            } else {
                desState = Lang.get('homeland_buff_des_1');
                colorState = Colors.BRIGHT_BG_RED;
                isEffect = false;
            }
        } else if (type == HomelandConst.TREE_BUFF_TYPE_3) {
            var targetTime = data.getEndTime();
            var countDown = targetTime - G_ServerTime.getTime();
            if (countDown > 0) {
                desState = G_ServerTime.getLeftDHMSFormatEx(targetTime);
                colorState = Colors.NUMBER_GREEN;
                isEffect = true;
                this._countDownInfo[data.getId()] = {
                    data: data,
                    label: labelState
                };
            } else {
                desState = Lang.get('homeland_buff_des_1');
                colorState = Colors.BRIGHT_BG_RED;
                isEffect = false;
            }
        }
        labelState.string = (desState);
        labelState.node.setAnchorPoint(cc.v2(1, 1));
        labelState.node.color = (colorState);
        widget.addChild(labelState.node);
        var colorDes = isEffect && cc.color(255, 255, 255) || cc.color(131, 131, 131);
        var labelDes = UIHelper.createWithTTF(desBuff, Path.getCommonFont(), 16);
        labelDes.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        labelDes.node.setAnchorPoint(cc.v2(0, 1));
        labelDes.node.width = (this._width - 20);
        labelDes.node.color = (colorDes);
        UIHelper.updateLabelSize(labelDes);
        var desHeight = labelDes.node.getContentSize().height;
        widget.addChild(labelDes.node);
        var totalHeight = 0 + SPACE;
        if (needLine) {
            var line = UIHelper.newSprite(Path.getUICommon('img_com_board_dark02_line'), cc.size(this._width - 8, 1));
            line.type = cc.Sprite.Type.SLICED;
            // let spriteFrame = line.spriteFrame;
            // spriteFrame.insetBottom = 1;
            // spriteFrame.insetLeft = 1;
            // spriteFrame.insetRight = 1;
            // spriteFrame.insetTop = 1;
            line.node.setAnchorPoint(cc.v2(0, 1));
            var lineHeight = line.node.getContentSize().height;
            totalHeight = totalHeight + lineHeight;
            widget.addChild(line.node);
            line.node.setPosition(cc.v2(4, totalHeight));
        }
        totalHeight = totalHeight + desHeight + SPACE;
        labelDes.node.setPosition(cc.v2(10, totalHeight));
        totalHeight = totalHeight + nameHeight + SPACE;
        labelName.node.setPosition(cc.v2(10, totalHeight));
        labelState.node.setPosition(cc.v2(this._width - 10, totalHeight));
        var size = cc.size(this._width, totalHeight + SPACE);
        widget.setContentSize(size);
        return widget;
    }
    _onTouchEvent(sender, state) {
        this.close();
    }
    _startCountDown() {
        this._stopCountDown();
        this.schedule(this._updateCountDown, 1);
        this._updateCountDown();
    }
    _stopCountDown() {
        this.unschedule(this._updateCountDown);
    }
    _updateCountDown() {
        for (var id in this._countDownInfo) {
            var info = this._countDownInfo[id];
            var lable = info.label;
            var data = info.data;
            var targetTime = data.getEndTime();
            var countDown = targetTime - G_ServerTime.getTime();
            if (countDown > 0) {
                var desState = G_ServerTime.getLeftDHMSFormatEx(targetTime);
                lable.string = (desState);
                lable.node.color = (Colors.NUMBER_GREEN);
            } else {
                lable.string = (Lang.get('homeland_buff_des_1'));
                lable.node.color = (Colors.BRIGHT_BG_RED);
                this._countDownInfo[id] = null;
            }
        }
    }
}