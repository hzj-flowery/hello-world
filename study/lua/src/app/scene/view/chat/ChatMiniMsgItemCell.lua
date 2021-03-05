local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RichTextHelper = require("app.utils.RichTextHelper")
local ChatConst = require("app.const.ChatConst")
local ViewBase = require("app.ui.ViewBase")
local PopupHonorTitleHelper = require("app.scene.view.playerDetail.PopupHonorTitleHelper")
local HonorTitleConst = require("app.const.HonorTitleConst")

--单个聊天信息显示
local ChatMiniMsgItemCell = class("ChatMiniMsgItemCell", ViewBase)

ChatMiniMsgItemCell.TEXT_WIDTH = 390
ChatMiniMsgItemCell.TEXT_MARGIN_BOTTOM = 0 --间隔
ChatMiniMsgItemCell.TEXT_MARGIN_TOP = 0 --图片尺寸28  字体20 （28-20）/2

function ChatMiniMsgItemCell:ctor(chatUnit, listWidth)
    self._chatMsg = chatUnit --聊天数据
    self._listWidth = listWidth --列表的宽度。
    self._resourceNode = nil
    self._extraHeight = 0 --聊天消息多出的显示高度
    self._senderTitle = 0

    self._nodeMsg = nil
    local resource = {
        file = Path.getCSB("ChatMiniMsgItemCell", "chat")
    }

    ChatMiniMsgItemCell.super.ctor(self, resource)
end

function ChatMiniMsgItemCell:_initUI()
end

function ChatMiniMsgItemCell:onCreate(...)
    self:_initUI()
    self:_updateUI()
end

function ChatMiniMsgItemCell:getTotalHeight()
    local viewSize = self._resourceNode:getContentSize()
    return viewSize.height + self._extraHeight
end

function ChatMiniMsgItemCell:_updateUI()
    local channel = self._chatMsg:getChannel()
    self._imageChannel:loadTexture(Path.getTextSignet(ChatConst.CHANNEL_PNGS[channel]))
    self._imageChannel:ignoreContentAdaptWithSize(true)
    if channel == ChatConst.CHANNEL_SYSTEM then
        self:_updateSystemMsg()
    elseif self._chatMsg:getSysMsg() ~= nil then
        self:_updateSystemMsg()
    else
        self:_updateChatMsg()
    end
end

function ChatMiniMsgItemCell:_updateSystemMsg()
    local channel = self._chatMsg:getChannel()
    -- dump(self._chatMsg:getSysMsg())
    local RollNoticeHelper = require("app.scene.view.rollnotice.RollNoticeHelper")
    local richStr, richElementList =
        RollNoticeHelper.makeRichMsgFromServerRollMsg(
        self._chatMsg:getSysMsg(),
        {
            textColor = Colors.channelColors[channel].c3b,
            -- outlineColor = Colors.channelColors[channel].outlineColor,
            -- outlineSize = 2,
            fontSize = 20
        },
        {faceWidth = 20, faceHeight = 20}
    )
    local channelElement = self:_createChannelRichElement(channel)
    table.insert(richElementList, 1, channelElement)
    local richStrWithChannel = json.encode(richElementList)
    self:_showTxt(richStrWithChannel)
end

function ChatMiniMsgItemCell:_updateChatMsg()
    local channel = self._chatMsg:getChannel()
    local baseId = self._chatMsg:getSender():getBase_id()
    local officialLevel = self._chatMsg:getSender():getOffice_level()
    self._senderTitle = self._chatMsg:getSender():getTitles() --称号
    local itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId)
    local richElementList =
        RichTextHelper.parse2RichMsgArr(
        {
            strInput = self._chatMsg:getContent(),
            textColor = Colors.channelColors[channel].c3b,
            fontSize = 20,
            msgType = self._chatMsg:getMsg_type(),
            -- outlineColor = Colors.channelColors[channel].outlineColor,
            -- outlineSize = 2,
        },
        {faceWidth = 20, faceHeight = 20}
    )
    local nameIconColor = Colors.getOfficialColor(officialLevel)
    local nameIconOutline = Colors.getOfficialColorOutline(officialLevel)

    --local name = self._chatMsg:getSender():getName().."："
    local name = self._chatMsg:getSender():getName()
    local nameElement = self:_createNameRichElement(name, 20, nameIconColor, nameIconOutline, 2)

    table.insert(richElementList, 1, nameElement)

    local colonSort = 2
    local voiceSort = 3
    if self._senderTitle and self._senderTitle > 0 then
        local element = {}
        element.type = "image"
        element.filePath = PopupHonorTitleHelper.getTitleImg(self._senderTitle)
        element.opacity = 255
        local size = PopupHonorTitleHelper.getTitleSize(self._senderTitle)
        local configScale = require("app.const.HonorTitleConst").TITLE_CONFIG
        element.width = size.width * configScale["ChatMiniMsgItemCell"][2]
        element.height = size.height * configScale["ChatMiniMsgItemCell"][2]
        table.insert(richElementList, 2, element)
        colonSort = colonSort + 1
        voiceSort = voiceSort + 1
    end

    local colon = "："
    local colonElement = self:_createNameRichElement(colon, 20, nameIconColor, nameIconOutline, 2)
    table.insert(richElementList, colonSort, colonElement)

    local isVoice = self._chatMsg:isVoice()
    if isVoice then
        --self._voiceBtn = nil
        --local voiceInfo = self._chatMsg:getVoiceInfo()
        local voiceElement = self:_createVoiceRichElement(channel)
        table.insert(richElementList, voiceSort, voiceElement)
    end

    local serverName = ""
    if self._chatMsg:getSender().getServer_name then
        serverName = self._chatMsg:getSender():getServer_name()
    end
    local serverNameElement = self:_createServerNameElement(channel, serverName)
    table.insert(richElementList, 1, serverNameElement)

    local channelElement = self:_createChannelRichElement(channel)
    table.insert(richElementList, 1, channelElement)

    local richStr = json.encode(richElementList)

    self:_showTxt(richStr)
end

---将文本转换为可以使用的富文本格式。
function ChatMiniMsgItemCell:_showTxt(richStr)
    local label = ccui.RichText:createWithContent(richStr)
    label:setWrapMode(1)
    label:setAnchorPoint(cc.p(0, 1))
    label:setCascadeOpacityEnabled(true)
    --=======================================================
    --计算富文本的Size
    label:setVerticalSpace(4)
    label:ignoreContentAdaptWithSize(false)
    label:setContentSize(cc.size(ChatMiniMsgItemCell.TEXT_WIDTH, 0))
    --高度0则高度自适应
    label:formatText()
    local virtualContentSize = label:getVirtualRendererSize()
    local richTextWidth = virtualContentSize.width
    local richtextHeight = virtualContentSize.height
    --=======================================================
    label:setPosition(0, 0)
    self._nodeMsg:removeAllChildren()
    self._nodeMsg:addChild(label)

    local panelSize = self._resourceNode:getContentSize()
    local totalHeight = math.max(richtextHeight, panelSize.height)

    self._extraHeight = totalHeight - panelSize.height
    self._resourceNode:setPositionY(self._extraHeight)
end

function ChatMiniMsgItemCell:_createNameRichElement(content, fontSize, textColor, outlineColor, outlineSize)
    local element = {}
    element.type = "text"
    element.msg = content
    element.color = textColor
    element.opacity = 255
    -- element.outlineColor = outlineColor
    -- element.outlineSize = outlineSize
    element.fontSize = fontSize
    return element
end

function ChatMiniMsgItemCell:_createChannelRichElement(channel)
    local element = {}
    element.type = "image"
    element.filePath = Path.getTextSignet(ChatConst.CHANNEL_PNGS[channel])
    element.width = ChatConst.IMAGE_CHANNEL_WIDTH * ChatConst.IMAGE_CHANNEL_SCALE
    element.height = ChatConst.IMAGE_CHANNEL_HEIGHT * ChatConst.IMAGE_CHANNEL_SCALE
    return element
end

function ChatMiniMsgItemCell:_createServerNameElement(channel, serverName)
    local formatName = require("app.utils.TextHelper").cutText(serverName)
    local element = {}
    element.type = "text"
    element.msg = formatName
    element.color = Colors.channelColors[1].c3b --用世界频道的颜色
    element.opacity = 255
    element.fontSize = 20
    return element
end

function ChatMiniMsgItemCell:_createVoiceRichElement(channel)
    local element = {}
    element.type = "image"
    element.filePath = Path.getVoiceRes(ChatConst.CHANNEL_VOICE_PNGS[channel])
    return element
end

function ChatMiniMsgItemCell:getChatMsg()
    return self._chatMsg
end

return ChatMiniMsgItemCell
