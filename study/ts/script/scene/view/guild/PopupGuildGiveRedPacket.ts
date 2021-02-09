const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { DataConst } from '../../../const/DataConst';
import { Colors, G_UserData, G_Prompt } from '../../../init';
import { handler } from '../../../utils/handler';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { G_ParameterIDConst } from '../../../const/ParameterIDConst';

@ccclass
export default class PopupGuildGiveRedPacket extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRedPacketName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _nodeAdd: cc.Sprite = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox1: cc.Toggle = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox2: cc.Toggle = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox3: cc.Toggle = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resInfo01: CommonResourceInfo = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resInfo02: CommonResourceInfo = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resInfo03: CommonResourceInfo = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnSend: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonAdd: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRich: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGoldNum: cc.Label = null;
    _redPacketData: any;
    _isOpenAddPricePanel: boolean;
    _checkNodeList: Array<any>;


    initData(redPacketData) {
        this._redPacketData = redPacketData;
        this._isOpenAddPricePanel = false;
        this._checkNodeList = [];
    }
    onCreate() {
        this._btnSend.setString(Lang.get('guild_red_packet_btn_give'));
    }
    onEnter() {
        this._checkIsCanAdd();
        this._refreshAddPriceValue();
        this._refreshBaseInfo();
        this._refreshGoldNum();
    }
    onExit() {
    }
    _checkIsCanAdd() {
        var canNotAddIds = [
            3101,
            3102,
            3103,
            3401,
            3402,
            3403,
            3404,
            3405,
            7101,
            7102,
            7103,
            7104,
            7201,
            7202,
            7203,
            30,
            31,
            32,
            33
        ];
        var redBagId = this._redPacketData.getRed_bag_id();
        var isIn = false;
        for (var i in canNotAddIds) {
            var id = canNotAddIds[i];
            if (id == redBagId) {
                isIn = true;
                break;
            }
        }
        this._buttonAdd.node.active = (!isIn);
        this._nodeAdd.node.active = (!isIn);
    }
    _refreshAddPriceValue() {
        var config = this._redPacketData.getConfig();
        this._resInfo01.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, config.gold);
        this._resInfo01.setTextColor(Colors.DARK_BG_ONE);
        this._resInfo02.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, 2 * config.gold);
        this._resInfo02.setTextColor(Colors.DARK_BG_ONE);
        this._resInfo03.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, 5 * config.gold);
        this._resInfo03.setTextColor(Colors.DARK_BG_ONE);

        this._checkNodeList = [
            this._checkBox1,
            this._checkBox2,
            this._checkBox3
        ];
        this._checkBox1.uncheck();
        this._checkBox2.uncheck();
        this._checkBox3.uncheck();
    }
    onButtonAdd(render) {
        this._isOpenAddPricePanel = !this._isOpenAddPricePanel;
        this._nodeAdd.node.active = (this._isOpenAddPricePanel);
    }
    onButtonSend(render) {
        if (!G_UserData.getGuild().isCanGiveRedPacket(this._redPacketData.getId())) {
            G_Prompt.showTip('guild_red_packet_give_tip_invalid_redpacket');
            this.close();
            return;
        }
        var cost = this._getCostGold();
        if (cost > 0) {
            var success = UserCheck.enoughCash(cost, true);
            if (!success) {
                return;
            }
        }
        var multiple = this._getSelectMultiple();
        G_UserData.getGuild().c2sPutGuildRedBag(this._redPacketData.getId(), multiple);
        this.close();
    }
    onClickCheckBox1() {
        var vipLimit = UserDataHelper.getParameter(G_ParameterIDConst.REDBAG_MULTI_LIMIT);
        var vipLimit2 = UserDataHelper.getParameter(G_ParameterIDConst.REDBAG_MULTI_LIMIT2);
        var vipLevel = G_UserData.getVip().getLevel() || 0;
        if (vipLimit > vipLevel) {
            G_Prompt.showTip(Lang.get('guild_red_packet_give_tip_limit_redpacket'));
            this._checkBox1.uncheck();
            return;
        }
        var isSelect = this._checkBox1.isChecked;
        if (isSelect) {
            this._checkBox2.uncheck();
            this._checkBox3.uncheck();
        }
        this._refreshGoldNum();
    }
    onClickCheckBox2() {
        var vipLimit = UserDataHelper.getParameter(G_ParameterIDConst.REDBAG_MULTI_LIMIT);
        var vipLimit2 = UserDataHelper.getParameter(G_ParameterIDConst.REDBAG_MULTI_LIMIT2);
        var vipLevel = G_UserData.getVip().getLevel() || 0;
        if (vipLimit2 > vipLevel) {
            G_Prompt.showTip(Lang.get('guild_red_packet_give_tip_limit_redpacket2', { value: 3 }));
            this._checkBox2.uncheck();
            return;
        }
        var isSelect = this._checkBox2.isChecked;
        if (isSelect) {
            this._checkBox1.uncheck();
            this._checkBox3.uncheck();
        }
        this._refreshGoldNum();
    }
    onClickCheckBox3() {
        var vipLimit = UserDataHelper.getParameter(G_ParameterIDConst.REDBAG_MULTI_LIMIT);
        var vipLimit2 = UserDataHelper.getParameter(G_ParameterIDConst.REDBAG_MULTI_LIMIT2);
        var vipLevel = G_UserData.getVip().getLevel() || 0;
        if (vipLimit2 > vipLevel) {
            G_Prompt.showTip(Lang.get('guild_red_packet_give_tip_limit_redpacket2', { value: 6 }));
            this._checkBox3.uncheck();
            return;
        }
        var isSelect = this._checkBox3.isChecked;
        if (isSelect) {
            this._checkBox1.uncheck();
            this._checkBox2.uncheck();
        }
        this._refreshGoldNum();
    }

    _refreshGoldNum() {
        var multiple = this._getSelectMultiple();
        var config = this._redPacketData.getConfig();
        if (multiple) {
            this._textGoldNum.string = ((config.gold * multiple).toString());
        } else {
            this._textGoldNum.string = ((config.gold).toString());
        }
    }
    _refreshBaseInfo() {
        var config = this._redPacketData.getConfig();
        this._textRedPacketName.string = (config.name);
        this._createProgressRichText(Lang.get('guild_red_packet_rich_text_give_num', { value: this._redPacketData.getRed_bag_sum() }));
    }
    _getCostGold() {
        var multiple = this._getSelectMultiple();
        var config = this._redPacketData.getConfig();
        if (multiple) {
            return config.gold * (multiple - 1);
        } else {
            return 0;
        }
    }
    _getSelectMultiple() {
        if (this._checkBox1.isChecked) {
            return 2;
        }
        else if (this._checkBox2.isChecked) {
            return 3;
        }
        else if (this._checkBox3.isChecked) {
            return 6;
        }
        return null;
    }
    _createProgressRichText(richText) {
        this._nodeRich.removeAllChildren();
        let node1 = new cc.Node();
        node1.addComponent(cc.RichText);
        let widget = RichTextExtend.createWithContent(richText);
        // var widget = ccui.RichText.createWithContent(richText);
        widget.node.setAnchorPoint(cc.v2(0.5, 0.5));
        this._nodeRich.addChild(widget.node);
    }

}