import ListViewCellBase from "../../../ui/ListViewCellBase";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { ChatConst } from "../../../const/ChatConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { RichTextHelper } from "../../../utils/RichTextHelper";
import { Colors } from "../../../init";
import { table } from "../../../utils/table";
import { PopupHonorTitleHelper } from "../playerDetail/PopupHonorTitleHelper";
import HonorTitleConst from "../../../const/HonorTitleConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import RollNoticeHelper from "../rollnotice/RollNoticeHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChatMiniMsgItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageChannel: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMsg: cc.Node = null;



    static TEXT_WIDTH = 390;
    static TEXT_MARGIN_BOTTOM = 0;
    static TEXT_MARGIN_TOP = 0;    
    _chatMsg: any;
    _listWidth: any;
    _extraHeight: number;
    _senderTitle: number;
    _richNode:cc.RichText;


    ctor(param) {
        this._chatMsg = param[0];
        this._listWidth = param[1];
        this._extraHeight = 0;
        this._senderTitle = 0;
        this._updateUI();
    }
    onInit(){
        
    }
    onCreate() {
    }
    getTotalHeight() {
        var viewSize = this._resourceNode.getContentSize();
        return viewSize.height + this._extraHeight;
    }
    _updateUI() {
        var channel = this._chatMsg.getChannel();
       // UIHelper.loadTextureFromAtlas(this._imageChannel, Path.getChatFaceMiniRes(ChatConst.CHANNEL_PNGS[channel-1]));
        //this._imageChannel.ignoreContentAdaptWithSize(true);
        if (channel == ChatConst.CHANNEL_SYSTEM) {
            this._updateSystemMsg();
        } else if (this._chatMsg.getSysMsg() != null) {
            this._updateSystemMsg();
        } else {
            this._updateChatMsg();
        }
    }
    _updateSystemMsg() {
        var channel = this._chatMsg.getChannel();
        var [richStr, elementList] = RollNoticeHelper.makeRichMsgFromServerRollMsg(this._chatMsg.getSysMsg(), {
                textColor: Colors.channelColors[channel].hex,
                fontSize: 20
            });
        var channelElement = this._createChannelRichElement(channel);
        var richElementList = [];
        table.insert(richElementList, channelElement);
        for(let k in (elementList as any)){
            table.insert(richElementList, elementList[k]);
        }
        var richStrWithChannel = JSON.stringify(richElementList);//json.encode(richElementList);
        this._showTxt(richStrWithChannel);
    }
    _updateChatMsg() {
        var channel = this._chatMsg.getChannel();
        var baseId = this._chatMsg.getSender().getBase_id();
        var officialLevel = this._chatMsg.getSender().getOffice_level();
        this._senderTitle = this._chatMsg.getSender().getTitles();
        var itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId);
        var msgElementList = RichTextHelper.parse2RichMsgArr({
            strInput: this._chatMsg.getContent(),
            textColor: Colors.channelColors[channel].hex,
            fontSize: 20,
            msgType: this._chatMsg.getMsg_type()
        }, {
            faceWidth: 20,
            faceHeight: 20
        });
        var richElementList = [];
        var nameIconColor = Colors.getOfficialColor(officialLevel);
        var nameIconOutline = Colors.getOfficialColorOutline(officialLevel);
        var name = this._chatMsg.getSender().getName();
        var nameElement = this._createNameRichElement(name, 20, nameIconColor, nameIconOutline, 2);

        var colon = '\uFF1A';
        var colonElement = this._createNameRichElement(colon, 20, nameIconColor, nameIconOutline, 2);

        var channelElement = this._createChannelRichElement(channel);
        table.insert(richElementList, channelElement);

        var isVoice = this._chatMsg.isVoice();
        if (isVoice) {
            var voiceElement = this._createVoiceRichElement(channel);
            table.insert(richElementList,  voiceElement);
        }
        table.insert(richElementList, nameElement);

        var colonSort = 2;
        var voiceSort = 3;
        if (this._senderTitle && this._senderTitle > 0) {
            var element = {} as any;
            element.type = 'image';
            element.filePath = PopupHonorTitleHelper.getTitleImg(this._senderTitle);
            element.opacity = 255;
            var size = PopupHonorTitleHelper.getTitleSize(this._senderTitle);
            var configScale = HonorTitleConst.TITLE_CONFIG;
            element.width = size.width * (configScale['ChatMiniMsgItemCell'][1] as number);
            element.height = size.height * (configScale['ChatMiniMsgItemCell'][1] as number);
            table.insert(richElementList, element);
            colonSort = colonSort + 1;
            voiceSort = voiceSort + 1;
        }

        table.insert(richElementList, colonElement);

        for(let k in msgElementList){
            table.insert(richElementList, msgElementList[k]);
        }

        var richStr = JSON.stringify(richElementList);
        this._showTxt(richStr);
    }
    _showTxt(richStr) {
        var label = RichTextExtend.createWithContent(richStr);
        //label.setWrapMode(1);
        //label.node.setAnchorPoint(cc.v2(0, 1));
        //label.setCascadeOpacityEnabled(true);
        //label.setVerticalSpace(4);
        //label.ignoreContentAdaptWithSize(false);
        //label.node.setContentSize(cc.size(ChatMiniMsgItemCell.TEXT_WIDTH, 0));
        //label.formatText();
        label.lineHeight = 20+6;//label.fontSize + 2;
        label.maxWidth = ChatMiniMsgItemCell.TEXT_WIDTH;
        label.node.anchorX = 0;
       // label.node.setPosition(label.node.width/2, 0);
        this._nodeMsg.removeAllChildren();
        this._nodeMsg.addChild(label.node);
        var virtualContentSize = label.node.getContentSize();
        var richTextWidth = virtualContentSize.width;
        var richtextHeight = virtualContentSize.height;
        var panelSize = this._resourceNode.getContentSize();
        var totalHeight = richtextHeight;//Math.min(richtextHeight, panelSize.height);
        // var offset = 0;
        // for(var i=0;i<label.node.childrenCount;i++){
        //     var child = label.node.children[i];
        //     totalHeight = Math.max(totalHeight, child.height-child.y);
        // }

        this.node.height = totalHeight;
        this._extraHeight = totalHeight - panelSize.height;
        this._richNode = label;
    }
    _createNameRichElement(content, fontSize, textColor:cc.Color, outlineColor, outlineSize) {
        var element = {} as any;
        element.type = 'text';
        element.msg = content;
        element.color = '#'+textColor.toHEX('#rrggbb');
        element.opacity = 255;
        element.fontSize = fontSize;

        return element;
    }
    _createChannelRichElement(channel) {
        var element = {} as any;
        element.type = 'image';
        element.filePath = Path.getChatFaceMiniRes(ChatConst.CHANNEL_PNGS[channel-1]);
        element.width = ChatConst.IMAGE_CHANNEL_WIDTH * ChatConst.IMAGE_CHANNEL_SCALE;
        element.height = ChatConst.IMAGE_CHANNEL_HEIGHT * ChatConst.IMAGE_CHANNEL_SCALE;
        return element;
    }
    _createVoiceRichElement(channel) {
        var element = {} as any;
        element.type = 'image';
        element.filePath = Path.getVoiceRes(ChatConst.CHANNEL_VOICE_PNGS[channel-1]);
        return element;
    }
    getChatMsg() {
        return this._chatMsg;
    }
    updateItemSize(){
        if(!this._richNode){
            return;
        }
        var realHeight = this._richNode.node.getContentSize().height;
        this.node.height = realHeight;
        this._nodeMsg.height = realHeight;
        this._richNode = null;
    }
}
