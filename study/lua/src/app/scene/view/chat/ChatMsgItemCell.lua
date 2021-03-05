local CSHelper = require("yoka.utils.CSHelper")
local UIHelper = require("yoka.utils.UIHelper")
local RichTextHelper = require("app.utils.RichTextHelper")
local ChatConst = require("app.const.ChatConst")
local ViewBase = require("app.ui.ViewBase")
--单个聊天信息显示
local ChatMsgItemCell = class("ChatMsgItemCell", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local HonorTitleConst = require("app.const.HonorTitleConst")

function ChatMsgItemCell:ctor(chatMsgData, listWidth)
    self._isLeft = not chatMsgData:getSender():isSelf()
    self._isVoice = chatMsgData:isVoice()
    self._chatMsg = chatMsgData --聊天数据
    self._needShowTime = self._chatMsg:getNeedShowTimeLabel() --是否需要显示时间。
    self._listWidth = listWidth --列表的宽度。
    self._resourceNode = nil
    self._extraHeight = 0 --聊天消息多出的显示高度
    self._viewTimeNode = nil
    self._commonHeroIcon = nil
    self._imageBgRichText = nil --富文本的聊天气泡
    self._panelRichText = nil
    self._imageChannel = nil
    --频道Icon

    self._voiceBtn = nil
    self._textVoiceLen = nil
    self._spriteTitle = nil -- 称号图片

    self._isEvent = chatMsgData:isEvent()

    local resource = nil
    if self._isVoice then
        local csb = self._isLeft and "ChatVoiceItemCell" or "ChatVoiceRightItemCell"
        resource = {
            file = Path.getCSB(csb, "chat"),
            binding = {
                _voiceBtn = {events = {{event = "touch", method = "_onClickItem"}}}
                --  _imageBgRichText = {events = {{event = "touch", method = "_onClickItem"}}},
            }
        }
    else
        local csb = self._isLeft and "ChatMsgItemCell" or "ChatMsgRightItemCell"
        resource = {
            file = Path.getCSB(csb, "chat")
        }
    end
    ChatMsgItemCell.super.ctor(self, resource)
end

function ChatMsgItemCell:onCreate(...)
    -- body
    self._imageVocie = ccui.Helper:seekNodeByName(self, "Image_voice")
    self._imageBgRichText:addTouchEventListener(handler(self, self._onScrollViewTouchCallBack))

    self:_initUI()
    self:_updateUI()
end
function ChatMsgItemCell:onEnter()
    self._signalVoicePlayNotice =
        G_SignalManager:add(SignalConst.EVENT_VOICE_PLAY_NOTICE, handler(self, self._onEventVoicePlayNotice))

    self:_clearVoiceEffect()
end

function ChatMsgItemCell:_clearVoiceEffect(...)
    -- body
    if not self._isVoice then
        return
    end
    --清理特效
    local imageVoice = self:getSubNodeByName("Image_voice")
    imageVoice:removeAllChildren()
end

function ChatMsgItemCell:onExit()
    self._signalVoicePlayNotice:remove()
    self._signalVoicePlayNotice = nil
end

-- chatMsg 可能是空值
function ChatMsgItemCell:_onEventVoicePlayNotice(event, chatMsg, isPlay)
    if not self._isVoice then
        return
    end
    if isPlay and chatMsg and chatMsg:voiceEquil(self._chatMsg) then
        --播放语音动画
        self:_clearVoiceEffect()
        local imageVoice = self:getSubNodeByName("Image_voice")
        G_EffectGfxMgr:createPlayGfx(imageVoice, "effect_yuyin")
    --self._textVoiceLen:setScale(2.0)
    end
    if not isPlay and chatMsg and chatMsg:voiceEquil(self._chatMsg) then
        --暂停语音动画
        self:_clearVoiceEffect()
    --G_EffectGfxMgr:createPlayGfx(imageVoice,"effect_yuyin")
    --self._textVoiceLen:setScale(1.0)
    end
end

function ChatMsgItemCell:_initUI()
    self._commonHeroIcon:setTouchEnabled(true)
    self._commonHeroIcon:setCallBack(handler(self, self.onClickHeroHead))
    self._imageBgRichText:setSwallowTouches(false)
end

function ChatMsgItemCell:onClickHeroHead(sender)
    local chatPlayerData = self._chatMsg:getSender()
    if not chatPlayerData:isSelf() then
        G_SignalManager:dispatch(SignalConst.EVENT_CHAT_SHOW_PLAYER_DETAIL, chatPlayerData)
    else
        dump(chatPlayerData)
    end
end

function ChatMsgItemCell:getTotalHeight()
    local viewSize = self._resourceNode:getContentSize()
    local viewTimeHeight = self._viewTimeNode == nil and 0 or self._viewTimeNode:getContentSize().height

    return viewSize.height + viewTimeHeight + self._extraHeight
end

function ChatMsgItemCell:_updateUI()
    local viewSize = self._resourceNode:getContentSize()
    local officialLevel = self._chatMsg:getSender():getOffice_level()
    local playerInfo = self._chatMsg:getSender():getPlayer_info()
    local baseId = self._chatMsg:getSender():getPlayer_info().covertId
    local senderTitle = self._chatMsg:getSender():getTitles() --称号
    local nameColor = Colors.getOfficialColor(officialLevel)
    local channel = self._chatMsg:getChannel()

    self._imageChannel:loadTexture(Path.getTextSignet(ChatConst.CHANNEL_PNGS[channel]))
    self._imageChannel:setVisible(true)
    self._textPlayerName:setString(self._chatMsg:getSender():getName())
    self._textPlayerName:setColor(nameColor)
    UIHelper.updateTextOfficialOutline(self._textPlayerName, officialLevel)

    -- settexture of Title
    if self._spriteTitle ~= nil then
        dump(senderTitle)
        if senderTitle and senderTitle > 0 then
            UserDataHelper.appendNodeTitle(self._spriteTitle,senderTitle,self.__cname)
            self._spriteTitle:setVisible(true)
        else
            self._spriteTitle:setVisible(false)
        end
    end

    --聊天频道，如果是私聊
    if channel == ChatConst.CHANNEL_PRIVATE then
        local chatPlayerData = self._chatMsg:getSender()
        local chatTargetId = chatPlayerData:getId()
        if chatPlayerData:isSelf() then
            self._imageChannel:loadTexture(Path.getTextSignet("img_voice_ziji"))
            self._imageChannel:setVisible(false)
            local targetPox = self._textPlayerName:getPositionX() + self._imageChannel:getContentSize().width
            self._textPlayerName:setPositionX(targetPox)

            if self._spriteTitle ~= nil then
                local titilePosX =
                    (self._textPlayerName:getPositionX() - (self._textPlayerName:getContentSize().width+ChatConst.CHAT_TITLE_OFFSET))
                self._spriteTitle:setPositionX(titilePosX)
            end
        else
            local isFriend = G_UserData:getFriend():isUserIdInFriendList(chatTargetId)
            if isFriend then
                self._imageChannel:loadTexture(Path.getTextSignet("img_voice_haoyou"))
            else
                self._imageChannel:loadTexture(Path.getTextSignet("img_voice_moshengren"))
            end

            if self._spriteTitle ~= nil then
                local titilePosX =
                    (self._textPlayerName:getPositionX() + (self._textPlayerName:getContentSize().width+ChatConst.CHAT_TITLE_OFFSET))
                self._spriteTitle:setPositionX(titilePosX)
            end
        end
    elseif channel == ChatConst.CHANNEL_CROSS_SERVER then --跨服频道
        local chatPlayerData = self._chatMsg:getSender()
        if chatPlayerData:isSelf() then
            if self._spriteTitle ~= nil then
                local titilePosX = (self._textPlayerName:getPositionX() - (self._textPlayerName:getContentSize().width+ChatConst.CHAT_TITLE_OFFSET))
                self._spriteTitle:setPositionX(titilePosX)
            end
        else
            local serverName = ""
            if self._chatMsg:getSender().getServer_name then
                local totalName = self._chatMsg:getSender():getServer_name()
                serverName = require("app.utils.TextHelper").cutText(totalName)
            end
            if self._textServerName then
                self._textServerName:setString(serverName)
                local serverNameWidth = self._textServerName:getContentSize().width
                self._textPlayerName:setPositionX(self._textServerName:getPositionX()+serverNameWidth)
            end
            if self._spriteTitle ~= nil then
                local titilePosX = (self._textPlayerName:getPositionX() + (self._textPlayerName:getContentSize().width+ChatConst.CHAT_TITLE_OFFSET))
                self._spriteTitle:setPositionX(titilePosX)
            end
        end
    else
        if self._spriteTitle ~= nil then
            local chatPlayerData = self._chatMsg:getSender()
            if chatPlayerData:isSelf() then
                local titilePosX =
                    (self._textPlayerName:getPositionX() - (self._textPlayerName:getContentSize().width+ChatConst.CHAT_TITLE_OFFSET))
                self._spriteTitle:setPositionX(titilePosX)
            else
                local titilePosX =
                    (self._textPlayerName:getPositionX() +  (self._textPlayerName:getContentSize().width+ChatConst.CHAT_TITLE_OFFSET))
                self._spriteTitle:setPositionX(titilePosX)
            end
        end
    end

    self._commonHeroIcon:updateIcon(playerInfo, nil, self._chatMsg:getSender():getHead_frame_id())
    --self._commonHeadFrame:updateUI(self._chatMsg:getSender():getHead_frame_id(),self._commonHeroIcon:getScale())

    -- self._textPlayerName:enableOutline(nameOutline,2)

    --在内部定位左边和右边
    if self._isLeft then
        self._resourceNode:setAnchorPoint(0, 0)
        self._resourceNode:setPositionX(0)
    else
        self._resourceNode:setAnchorPoint(1, 0)
        self._resourceNode:setPositionX(self._listWidth)
    end

    if self._needShowTime then
        self._viewTimeNode = self:_createTimeTipNode(G_ServerTime:getTimeString(self._chatMsg:getTime()))
        self._viewTimeNode:setPosition(viewSize.width * 0.5, viewSize.height)
        self._resourceNode:addChild(self._viewTimeNode)
    end

    self:_showTxt(self._chatMsg:getContent(), self._chatMsg:getMsg_type())

    if self._isVoice then
        local voiceInfo = self._chatMsg:getVoiceInfo()
        self._textVoiceLen:setString(Lang.get("chat_voice_time", {value = voiceInfo.voiceLen}))
    end
end

function ChatMsgItemCell:_createTimeTipNode(text)
    local viewTimeNode = CSHelper.loadResourceNode(Path.getCSB("ChatTimeTipLayer", "chat"))
    local textTime = ccui.Helper:seekNodeByName(viewTimeNode, "Text_Time")
    textTime:setString(text)
    viewTimeNode:setAnchorPoint(0.5, 0)
    return viewTimeNode
end

---将文本转换为可以使用的富文本格式。
function ChatMsgItemCell:_showTxt(chatContent, type)
    local richElementList =
        RichTextHelper.parse2RichMsgArr(
        {
            strInput = chatContent,
            textColor = Colors.CHAT_MSG,
            fontSize = 20,
            msgType = type,
        }
    )
    local richStr = json.encode(richElementList)

    local label = ccui.RichText:createWithContent(richStr)
    label:setWrapMode(1)
    label:setAnchorPoint(cc.p(0.5, 0.5))
    label:setCascadeOpacityEnabled(true)
    --=======================================================
    --计算富文本的Size
    label:ignoreContentAdaptWithSize(false)
    label:setContentSize(cc.size(310, 0))
    --高度0则高度自适应
    label:formatText()
    local virtualContentSize = label:getVirtualRendererSize()
    local richTextWidth = virtualContentSize.width
    local richtextHeight = virtualContentSize.height
    logWarn("---->>>>>>chat msg width:" .. tostring(richTextWidth) .. " height:" .. tostring(richtextHeight))
    --=======================================================

    self._panelRichText:removeAllChildren()
    self._panelRichText:addChild(label)

    local panelSize = self._panelRichText:getContentSize()
    local imgSize = self._imageBgRichText:getContentSize()
    local horizonBlank = imgSize.width - panelSize.width
    local verticalBlank = imgSize.height - panelSize.height
    logWarn("chat msg horizonBlank:" .. tostring(horizonBlank) .. " verticalBlank:" .. tostring(verticalBlank))
    local newWidth = math.max(panelSize.width, richTextWidth)
    local newHeight = math.max(panelSize.height, richtextHeight)

    local imgNewWidth = newWidth + horizonBlank
    local imgNewHeight = newHeight + verticalBlank
    self._extraHeight = imgNewHeight - imgSize.height
    self._resourceNode:setPositionY(self._extraHeight)

    self._imageBgRichText:setContentSize(imgNewWidth, imgNewHeight)
    self._panelRichText:setContentSize(newWidth, newHeight)

    label:setPosition(cc.p(newWidth * 0.5, newHeight * 0.5))
end

function ChatMsgItemCell:getChatMsg()
    return self._chatMsg
end

function ChatMsgItemCell:_onClickItem(sender)
    local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
    local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
    if offsetX < 20 and offsetY < 20 then
        if self._isVoice then
            G_VoiceManager:playRecordVoice(self._chatMsg)
        elseif self._isEvent then
            local sceneName = G_SceneManager:getRunningScene():getName()
            if sceneName == "fight" then
                G_Prompt:showTip(Lang.get("chat_pk_hint_when_infight"))
            else
                if G_SceneManager:getRunningSceneName() == "guildTrain" and not G_UserData:getGuild():getTrainEndState() then
                    G_Prompt:showTipOnTop(Lang.get("guild_exit_tanin_forbid"))
                    return
                end

                local teamType = tonumber(self._chatMsg:getParameter():getValue("teamType"))
                local teamId = tonumber(self._chatMsg:getParameter():getValue("teamId"))
                logWarn("ChatMsgItemCell on click event item ----------------"..tostring(teamId) )
                local isOk, func = require("app.scene.view.groups.GroupsViewHelper").checkIsCanApplyJoin(teamType)
                if isOk then
                    G_UserData:getGroups():c2sApplyTeam(teamType,teamId)
                else
                    if func then
                        func()
                    end
                end
            end
        end
    end
end

function ChatMsgItemCell:_onLongPressCallBack(sender, state)
    if self._moveX < 20 and self._moveY < 20 then
        --复制图片
        local point = cc.p(sender:getTouchBeganPosition().x, sender:getTouchBeganPosition().y)
        local txt = self._chatMsg:getContent()

        --local worldPos = node:convertToWorldSpaceAR(cc.p(0,0))
        --local btnNewPos = container:convertToNodeSpace(cc.p(worldPos))

        local chatCopyNode = G_SceneManager:getRunningScene():getVoiceViewByName("ChatCopyNode")
        if chatCopyNode then
            chatCopyNode:removeFromParent()
        end
        local ChatCopyNode = require("app.scene.view.chat.ChatCopyNode")
        local node = ChatCopyNode.new(point, txt)
        node:setName("ChatCopyNode")

        G_SceneManager:getRunningScene():addChildToVoiceLayer(node)
    end
end

function ChatMsgItemCell:_onScrollViewTouchCallBack(sender, state)
    if state == ccui.TouchEventType.began then
        self._delayStamp = timer:getms()
        self._moveX, self._moveY = 0, 0
        --启动计时器
        local scheduler = require("cocos.framework.scheduler")
        if self._listener then
            scheduler.unscheduleGlobal(self._listener)
        end
        self._listener =
            scheduler.performWithDelayGlobal(
            function()
                logWarn("ChatMsgItemCell long click------------------")
                if self._delayStamp then
                    self._delayStamp = nil
                    logWarn("ChatMsgItemCell long click ok ------------------")
                    self:_onLongPressCallBack(sender, state)
                end
            end,
            0.6
        )
    elseif state == ccui.TouchEventType.moved then
        local offsetX = math.abs(sender:getTouchMovePosition().x - sender:getTouchBeganPosition().x)
        local offsetY = math.abs(sender:getTouchMovePosition().y - sender:getTouchBeganPosition().y)
        -- logWarn( offsetX.." ------------------ "..offsetY)
        self._moveX, self._moveY = offsetX, offsetY
    elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
        if state == ccui.TouchEventType.ended and self._delayStamp then
            self:_onClickItem(sender, state)
        end
        self._delayStamp = nil
    end
end

return ChatMsgItemCell
