import PopupBase from "../../../ui/PopupBase";
import { Lang } from "../../../lang/Lang";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { UTF8 } from "../../../utils/UTF8";
import { handler } from "../../../utils/handler";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { G_ConfigLoader } from "../../../init";
import { Color } from "../../../utils/Color";
import GuildReceiveRecordItemCell from "./GuildReceiveRecordItemCell";
import { RichTextHelper } from "../../../utils/RichTextHelper";
import { RichTextExtend } from "../../../extends/RichTextExtend";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupGuildOpenRedPacket extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGold: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRate: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _richNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel: cc.Node = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource: cc.ScrollView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textSendName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRedPacketName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGoldIcon: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGoldNum: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTx: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textSnatchFinishHint: cc.Label = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _guildReceiveRecordItemCell: cc.Prefab = null;

    public static readonly RATE_IMGS = {
        [6]: 'img_liubei01',
        [3]: 'img_sanbei01',
        [2]: 'img_shuangbei01'
    }
    public static readonly uiParams = {
        [1]: {
            ['bgRes']: 'img_hongbao_dakai02',
            ['_imageTxPos']: cc.v2(-27.05, 262.65),
            ['_textSendNamePos']: cc.v2(0, 147.23),
            ['_textSendNameColor']: Color.OBVIOUS_YELLOW,
            ['_textGoldNumColor']: Color.DARK_BG_ONE,
            ['_textGoldNumSize']: 50,
            ['_textGoldNumPos']: cc.v2(17.28, -45.18),
            ['_imageGoldVisible']: true,
            ['_richNodePos']: cc.v2(-131.85, -103.47),
            ['_imageGoldIconPos']: cc.v2(160.33, -102),
            ['_panelPos']: cc.v2(-174, -277),
            ['_textRedPacketNameVisible']: true
        },
        [2]: {
            ['bgRes']: 'img_auction_red_envelopes02',
            ['_imageTxPos']: cc.v2(-29.05, 222.186),
            ['_textSendNamePos']: cc.v2(0, 109.768),
            ['_textSendNameColor']: Color.NEW_RED_PACKET_NAME_COLOR,
            ['_textGoldNumColor']: Color.NEW_RED_PACKET_NAME_COLOR,
            ['_textGoldNumSize']: 60,
            ['_textGoldNumPos']: cc.v2(9.1, 15.76),
            ['_imageGoldVisible']: false,
            ['_richNodePos']: cc.v2(-131.85, -300),
            ['_imageGoldIconPos']: cc.v2(129, -300),
            ['_panelPos']: cc.v2(-174, -227),
            ['_textRedPacketNameVisible']: false
        }
    }
    _redPacketOpenData: any;
    _redPacketBaseData: any;
    _receiveRecordList: any;
    _myReceiveRecord: any;
    _listData: any;

    initData(redPacketOpenData) {
        this._redPacketOpenData = redPacketOpenData;
        this._redPacketBaseData = redPacketOpenData.redPacketData;
        this._receiveRecordList = redPacketOpenData.list;
        this._myReceiveRecord = redPacketOpenData.myRedBagUser;
        this._listData = null;
        this._isClickOtherClose = true;
        this.name = "PopupGuildOpenRedPacket";
    }
    onCreate() {
        // this._listItemSource.setTemplate(GuildReceiveRecordItemCell);
        // this._listItemSource.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // this._listItemSource.setCustomCallback(handler(this, this._onItemTouch));
        this._imageTx.sizeMode = cc.Sprite.SizeMode.RAW;
    }
    onEnter() {
        this._refreshRedPacketBaseInfo();
        this._refreshMySnatchInfo();
        this._updateList();
        // logWarn('PopupGuildOpenRedPacket:onEnter');
        // dump(this._redPacketOpenData);
    }
    onExit() {
    }
    _onClickClose() {
        this.close();
    }
    _updateList() {
        this._listData = this._receiveRecordList;

        this._listItemSource.content.removeAllChildren();
        this._listItemSource.content.height = 0;

        for (let i = 0; i < this._listData.length; i++) {
            if (this._listData[i]) {
                let cell = cc.instantiate(this._guildReceiveRecordItemCell).getComponent(GuildReceiveRecordItemCell);
                this._listItemSource.content.addChild(cell.node);
                cell.updateData(this._listData[i]);
                cell.node.y = (i + 1) * -40;
                this._listItemSource.content.setContentSize(this._listItemSource.content.getContentSize().width, this._listItemSource.content.getContentSize().height + 40);
            }
        }
        this._listItemSource.scrollToTop();


    }
    _onItemUpdate(item, index) {
        if (this._listData[index + 1]) {
            var showBestImage = this._redPacketOpenData.isFinish && index == 0;
            item.update(this._listData[index + 1], showBestImage);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index) {
    }
    _refreshRedPacketBaseInfo() {
        var redPacketBaseData = this._redPacketBaseData;
        var receiveRecordList = this._receiveRecordList;
        var multiple = redPacketBaseData.getMultiple();
        var config = redPacketBaseData.getConfig();
        var money = redPacketBaseData.getTotal_money() * redPacketBaseData.getMultiple();
        this._textRedPacketName.string = (config.name);
        this._textSendName.string = (Lang.get('guild_red_packet_open_title', { name: redPacketBaseData.getUser_name() }));
        if (multiple > 1) {
            this._imageRate.node.active = (true);
            UIHelper.loadTexture(this._imageRate, Path.getGuildRes(PopupGuildOpenRedPacket.RATE_IMGS[multiple]));
        } else {
            this._imageRate.node.active = (false);
        }
        var itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, redPacketBaseData.getBase_id());
        if (itemParams.res_cfg != null) {
            UIHelper.loadTexture(this._imageTx, Path.getGuildRes(itemParams.res_cfg.icon));
        }
        var richMsg = Lang.get('guild_red_packet_rich_text_snatch_situation', {
            value1: receiveRecordList.length,
            value2: redPacketBaseData.getRed_bag_sum(),
            num: money
        });
        this._createProgressRichText(richMsg);
        var redpacketInfo = G_ConfigLoader.getConfig('guild_redpacket');
        var config = redpacketInfo.get(this._redPacketBaseData.getRed_bag_id());
        var uiParam = PopupGuildOpenRedPacket.uiParams[config.show];
        let img_bg = this._resourceNode.getChildByName("background").getComponent(cc.Sprite) as cc.Sprite;
        UIHelper.loadTexture(img_bg, (Path.getGuildRes(uiParam.bgRes)));
        this._imageTx.node.setPosition(uiParam._imageTxPos);
        this._textSendName.node.setPosition(uiParam._textSendNamePos);
        this._textSendName.node.color = (uiParam._textSendNameColor);
        this._textGoldNum.fontSize = (uiParam._textGoldNumSize);
        this._textGoldNum.node.color = (uiParam._textGoldNumColor);
        this._textGoldNum.node.setPosition(uiParam._textGoldNumPos);
        this._richNode.setPosition(uiParam._richNodePos);
        this._panel.setPosition(uiParam._panelPos);
        this._imageGoldIcon.node.setPosition(uiParam._imageGoldIconPos);
        var str1 = '已领取:' + '个\uFF0C 总额';
        var str2 = receiveRecordList.length + ('/' + (redPacketBaseData.getRed_bag_sum() + money));
        this._imageGoldIcon.node.x = (uiParam._richNodePos.x + UTF8.utf8len(str1) * 20 + (UTF8.utf8len(str2) - 1) * 10 + 20);
        this._textRedPacketName.node.active = (uiParam._textRedPacketNameVisible);
    }
    _refreshMySnatchInfo() {
        if (this._myReceiveRecord) {
            this._textGoldNum.node.active = (true);
            var redpacketInfo = G_ConfigLoader.getConfig('guild_redpacket');
            var config = redpacketInfo.get(this._redPacketBaseData.getRed_bag_id());
            var uiParam = PopupGuildOpenRedPacket.uiParams[config.show];
            this._imageGold.node.active = (uiParam._imageGoldVisible);
            this._textGoldNum.string = ((this._myReceiveRecord.getGet_money().toString()));
            this._textSnatchFinishHint.node.active = (false);
        } else {
            this._textGoldNum.node.active = (false);
            this._imageGold.node.active = (false);
            this._textSnatchFinishHint.node.active = (true);
        }
    }
    _createProgressRichText(richText) {
        this._richNode.removeAllChildren();
        let richLabel = RichTextExtend.createWithContent(richText);
        richLabel.node.setAnchorPoint(cc.v2(0, 0.5));
        this._richNode.addChild(richLabel.node);
    }

}