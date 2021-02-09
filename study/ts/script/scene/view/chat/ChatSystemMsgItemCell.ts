import ViewBase from "../../ViewBase";
import { Path } from "../../../utils/Path";
import { ChatConst } from "../../../const/ChatConst";
import UIHelper from "../../../utils/UIHelper";
import { Colors, G_ServerTime } from "../../../init";
import { table } from "../../../utils/table";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import RollNoticeHelper from "../rollnotice/RollNoticeHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChatSystemMsgItemCell extends ListViewCellBase {

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

    @property(cc.Prefab)
    ChatTimeTipLayer:cc.Prefab = null;
    
    _chatMsg: any;
    _listWidth: any;
    _needShowTime: any;
    _extraHeight: number;
    _viewTimeNode: cc.Node;

    timeHeight:number = 0;
    richNode:cc.RichText;

    static YGAP = 16;
    static RICH_TEXT_MAX_WIDTH = 480;


    ctor(param) {
        var chatMsgData = param[0],listWidth = param[1];
        this._chatMsg = chatMsgData;
        this._listWidth = listWidth;
        this._needShowTime = this._chatMsg.getNeedShowTimeLabel();
        this._extraHeight = 0;
        this._updateUI();
    }
    _initUI() {
    }
    onCreate() {
        this._initUI();
        
    }
    onInit(){
        
    }
    onEnter(){

    }
    onExit(){

    }
    getTotalHeight() {
        var viewSize = this._resourceNode.getContentSize();
        var viewTimeHeight = this._viewTimeNode == null && 0 || this._viewTimeNode.getContentSize().height;
        return viewSize.height + viewTimeHeight + this._extraHeight;
    }
    _updateUI() {
        UIHelper.loadTexture(this._imageChannel, Path.getChatFaceMiniRes(ChatConst.CHANNEL_PNGS[this._chatMsg.getChannel()-1]));
        var msg = this._chatMsg.getSysMsg();
        var [_tmp,richElementList] = RollNoticeHelper.makeRichMsgFromServerRollMsg(msg, {
                textColor: '#'+Colors.BRIGHT_BG_TWO.toHEX('#rrggbb'),
                fontSize: 20
            });
        var element = this._createChannelRichElement(this._chatMsg.getChannel());
        var newElementList = [];
        table.insert(newElementList, element);
        for(let k in (richElementList as any)){
            newElementList.push(richElementList[k]);
        }
        var richStr = JSON.stringify(newElementList);
        this._showTxt(richStr);

        var timeNode = this._resourceNode.getChildByName("_viewTimeNode");
        if(timeNode)
        this._resourceNode.removeChild(timeNode,true);
        this._viewTimeNode = null;

        this.timeHeight = 0;
        var viewSize = this._resourceNode.getContentSize();
        if (this._needShowTime) {
            this._viewTimeNode = this._createTimeTipNode(G_ServerTime.getTimeString(this._chatMsg.getTime()));
            this._viewTimeNode.setPosition(this.node.width * 0.5, this.node.height);
            this._resourceNode.addChild(this._viewTimeNode);
            this.node.height = this.node.height + this._viewTimeNode.height;
            this._viewTimeNode.name = "_viewTimeNode";
            this.timeHeight = this._viewTimeNode.height;
        }
    }
    _createTimeTipNode(text):cc.Node {
        var viewTimeNode = cc.instantiate(this.ChatTimeTipLayer);
        var textTime = UIHelper.seekNodeByName(viewTimeNode, 'Text_Time');
        textTime.getComponent(cc.Label).string = (text);
        viewTimeNode.setAnchorPoint(0.5, 0);
        return viewTimeNode;
    }
    _showTxt(richStr) {
        var richTextMaxWidth = ChatSystemMsgItemCell.RICH_TEXT_MAX_WIDTH;
        var label = RichTextExtend.createWithContent(richStr);
        //label.setWrapMode(1);
        label.node.setAnchorPoint(cc.v2(0, 1));
        //label.setCascadeOpacityEnabled(true);
        //label.setVerticalSpace(3);
        //label.ignoreContentAdaptWithSize(false);
        //label.node.setContentSize(cc.size(richTextMaxWidth, 0));
        label.lineHeight = 26;
        label.maxWidth = richTextMaxWidth;
        //label.formatText();
        label.node.setPosition(0, 0);
        this._nodeMsg.removeAllChildren();
        this._nodeMsg.addChild(label.node);
        //logWarn('richtextHeight  --' + richtextHeight);
        var resourceSize = this._resourceNode.getContentSize();
        var totalHeight = label.node.getContentSize().height;
        this._extraHeight = Math.max(0, totalHeight - this._nodeMsg.y);
        this._nodeMsg.y = totalHeight;
       // this._resourceNode.y = (this._extraHeight);
        this.node.height = totalHeight;
        this.richNode = label;

    }
    _createChannelRichElement(channel) {
        var element = {} as any;
        element.type = 'image';
        element.filePath = Path.getChatFaceMiniRes(ChatConst.CHANNEL_PNGS[channel-1]);
        element.width = ChatConst.IMAGE_CHANNEL_WIDTH * ChatConst.IMAGE_CHANNEL_SCALE;
        element.height = ChatConst.IMAGE_CHANNEL_HEIGHT * ChatConst.IMAGE_CHANNEL_SCALE;
        return element;
    }
    getChatMsg() {
        return this._chatMsg;
    }
    updateItemSize(){
        if(!this.richNode){
            return;
        }
        var virtualContentSize = this.richNode.node.getContentSize();
        var richTextWidth = virtualContentSize.width;
        var richtextHeight = virtualContentSize.height;
        this._nodeMsg.y = richtextHeight;
        this.node.height = richtextHeight + this.timeHeight + 10;

        this.richNode = null;
    }
}
