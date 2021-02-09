local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RichTextHelper = require("app.utils.RichTextHelper")
local ViewBase = require("app.ui.ViewBase")
--单个聊天信息显示
local ChatSystemMsgItemCell = class("ChatSystemMsgItemCell", ViewBase)
local ChatConst = require("app.const.ChatConst")

ChatSystemMsgItemCell.YGAP = 16 -- 富文本上下间距
ChatSystemMsgItemCell.RICH_TEXT_MAX_WIDTH = 475

function ChatSystemMsgItemCell:ctor(chatMsgData, listWidth)
    self._chatMsg = chatMsgData --通知消息
    self._listWidth = listWidth --列表的宽度
    self._needShowTime = self._chatMsg:getNeedShowTimeLabel() --是否需要显示时间。
    self._resourceNode = nil
    self._viewTimeNode = nil
    self._imageChannel = nil
     --渠道图标
    self._extraHeight = 0 --聊天消息多出的显示高度
    self._nodeMsg = nil
    local resource = {
        file = Path.getCSB("ChatSystemMsgItemCell", "chat")
    }

    ChatSystemMsgItemCell.super.ctor(self, resource)
end

function ChatSystemMsgItemCell:_initUI()
end

function ChatSystemMsgItemCell:onCreate(...)
    self:_initUI()
    self:_updateUI()
end

function ChatSystemMsgItemCell:getTotalHeight()
    local viewSize = self._resourceNode:getContentSize()
    local viewTimeHeight = self._viewTimeNode == nil and 0 or self._viewTimeNode:getContentSize().height
    return viewSize.height + viewTimeHeight + self._extraHeight
end

function ChatSystemMsgItemCell:_updateUI()
    local ChatConst = require("app.const.ChatConst")
    self._imageChannel:loadTexture(Path.getTextSignet(ChatConst.CHANNEL_PNGS[self._chatMsg:getChannel()]))

    local RollNoticeHelper = require("app.scene.view.rollnotice.RollNoticeHelper")
    local msg = self._chatMsg:getSysMsg()
    local _,richElementList =
        RollNoticeHelper.makeRichMsgFromServerRollMsg(
        msg,
        {
            textColor = Colors.BRIGHT_BG_TWO,
            fontSize = 20
        }
    )
    local element = self:_createChannelRichElement(self._chatMsg:getChannel())
    table.insert(richElementList,1,element)
    local richStr = json.encode(richElementList)
    self:_showTxt(richStr)

    local viewSize = self._resourceNode:getContentSize()
    if self._needShowTime then
        self._viewTimeNode = self:_createTimeTipNode(G_ServerTime:getTimeString(self._chatMsg:getTime()))
        self._viewTimeNode:setPosition(viewSize.width * 0.5, viewSize.height)
        self._resourceNode:addChild(self._viewTimeNode)
    end
end

function ChatSystemMsgItemCell:_createTimeTipNode(text)
    local viewTimeNode = CSHelper.loadResourceNode(Path.getCSB("ChatTimeTipLayer", "chat"))
    local textTime = ccui.Helper:seekNodeByName(viewTimeNode, "Text_Time")
    textTime:setString(text)
    viewTimeNode:setAnchorPoint(0.5, 0)
    return viewTimeNode
end

---将文本转换为可以使用的富文本格式。
function ChatSystemMsgItemCell:_showTxt(richStr)
    local richTextMaxWidth = ChatSystemMsgItemCell.RICH_TEXT_MAX_WIDTH
     --self._listWidth - self._nodeMsg:getPositionX()-5
    local label = ccui.RichText:createWithContent(richStr)
    label:setWrapMode(1)
    label:setAnchorPoint(cc.p(0, 1))
    label:setCascadeOpacityEnabled(true)
    label:setVerticalSpace(3)
    --=======================================================
    --计算富文本的Size
    label:ignoreContentAdaptWithSize(false)
    label:setContentSize(cc.size(richTextMaxWidth, 0))
     --高度0则高度自适应
    label:formatText()
    local virtualContentSize = label:getVirtualRendererSize()
    local richTextWidth = virtualContentSize.width
    local richtextHeight = virtualContentSize.height
    --=======================================================
    label:setPosition(0, 0)

    self._nodeMsg:removeAllChildren()
    self._nodeMsg:addChild(label)

    logWarn("richtextHeight  --" .. richtextHeight)
    local resourceSize = self._resourceNode:getContentSize()
    self._extraHeight = math.max(0, richtextHeight - self._nodeMsg:getPositionY())
    self._resourceNode:setPositionY(self._extraHeight)
end

function ChatSystemMsgItemCell:_createChannelRichElement(channel)
    local element = {}
    element.type = "image"
    element.filePath = Path.getTextSignet(ChatConst.CHANNEL_PNGS[channel])
    element.width = ChatConst.IMAGE_CHANNEL_WIDTH * ChatConst.IMAGE_CHANNEL_SCALE
    element.height = ChatConst.IMAGE_CHANNEL_HEIGHT * ChatConst.IMAGE_CHANNEL_SCALE
    return element
end

function ChatSystemMsgItemCell:getChatMsg()
    return self._chatMsg
end

return ChatSystemMsgItemCell
