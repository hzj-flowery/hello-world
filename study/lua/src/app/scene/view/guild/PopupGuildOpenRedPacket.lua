local PopupBase = require("app.ui.PopupBase")
local PopupGuildOpenRedPacket = class("PopupGuildOpenRedPacket", PopupBase)
local GuildReceiveRecordItemCell = require("app.scene.view.guild.GuildReceiveRecordItemCell")

PopupGuildOpenRedPacket.RATE_IMGS = {[6] = "img_liubei01", [3] = "img_sanbei01", [2] = "img_shuangbei01"}

PopupGuildOpenRedPacket.uiParams = {
    [1] = {
        ["bgRes"] = "img_hongbao_dakai02",
        ["_imageTxPos"] = cc.p(159.95, 552.65),
        ["_textSendNamePos"] = cc.p(187, 437.25),
        ["_textSendNameColor"] = Colors.OBVIOUS_YELLOW,
        ["_textGoldNumColor"] = Colors.DARK_BG_ONE,
        ["_textGoldNumSize"] = 50,
        ["_textGoldNumPos"] = cc.p(204.28, 244.82),
        ["_imageGoldVisible"] = true,
        ["_richNodePos"] = cc.p(55.15, 186.53),
        ["_imageGoldIconPos"] = cc.p(326.33, 187.90),
        ["_panelPos"] = cc.p(13.00, 13.00),
        ["_textRedPacketNameVisible"] = true
    },
    [2] = {
        ["bgRes"] = "img_auction_red_envelopes02",
        ["_imageTxPos"] = cc.p(159.5, 507.65),
        ["_textSendNamePos"] = cc.p(187, 386.25),
        ["_textSendNameColor"] = Colors.NEW_RED_PACKET_NAME_COLOR,
        ["_textGoldNumColor"] = Colors.NEW_RED_PACKET_NAME_COLOR,
        ["_textGoldNumSize"] = 60,
        ["_textGoldNumPos"] = cc.p(187, 298.82),
        ["_imageGoldVisible"] = false,
        ["_richNodePos"] = cc.p(40, 18),
        ["_imageGoldIconPos"] = cc.p(300, 18),
        ["_panelPos"] = cc.p(13.00, 75),
        ["_textRedPacketNameVisible"] = false
    }
}

function PopupGuildOpenRedPacket:ctor(redPacketOpenData)
    self._redPacketOpenData = redPacketOpenData
    self._redPacketBaseData = redPacketOpenData.redPacketData
    self._receiveRecordList = redPacketOpenData.list
    self._myReceiveRecord = redPacketOpenData.myRedBagUser
    self._listData = nil
    self._textRedPacketName = nil
    self._textGoldNum = nil
    self._textSendName = nil
    self._imageTx = nil
    self._richNode = nil
    self._panel = nil
    self._imageGoldIcon = nil
    local resource = {
        file = Path.getCSB("PopupGuildOpenRedPacket", "guild"),
        binding = {}
    }
    PopupGuildOpenRedPacket.super.ctor(self, resource, true)
end

function PopupGuildOpenRedPacket:onCreate()
    self._listItemSource:setTemplate(GuildReceiveRecordItemCell)
    self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
    self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))
    self._imageTx:ignoreContentAdaptWithSize(true)
end

function PopupGuildOpenRedPacket:onEnter()
    self:_refreshRedPacketBaseInfo()
    self:_refreshMySnatchInfo()
    self:_updateList()

    logWarn("PopupGuildOpenRedPacket:onEnter")
    dump(self._redPacketOpenData)
end

function PopupGuildOpenRedPacket:onExit()
end

function PopupGuildOpenRedPacket:_onClickClose()
    self:close()
end

function PopupGuildOpenRedPacket:_updateList()
    self._listData = self._receiveRecordList
    self._listItemSource:clearAll()
    self._listItemSource:resize(#self._listData)
end

function PopupGuildOpenRedPacket:_onItemUpdate(item, index)
    if self._listData[index + 1] then
        local showBestImage = self._redPacketOpenData.isFinish and index == 0
        item:update(self._listData[index + 1], showBestImage)
    end
end

function PopupGuildOpenRedPacket:_onItemSelected(item, index)
end

function PopupGuildOpenRedPacket:_onItemTouch(index)
end

function PopupGuildOpenRedPacket:_refreshRedPacketBaseInfo()
    local redPacketBaseData = self._redPacketBaseData
    local receiveRecordList = self._receiveRecordList

    local multiple = redPacketBaseData:getMultiple()
    local config = redPacketBaseData:getConfig()
    local money = redPacketBaseData:getTotal_money() * redPacketBaseData:getMultiple()
    self._textRedPacketName:setString(config.name)
    self._textSendName:setString(Lang.get("guild_red_packet_open_title", {name = redPacketBaseData:getUser_name()}))
    if multiple > 1 then
        self._imageRate:setVisible(true)
        self._imageRate:loadTexture(Path.getGuildRes(PopupGuildOpenRedPacket.RATE_IMGS[multiple]))
    else
        self._imageRate:setVisible(false)
    end

    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, redPacketBaseData:getBase_id())
    if itemParams.res_cfg ~= nil then
        self._imageTx:loadTexture(Path.getGuildRes(itemParams.res_cfg.icon))
    end

    local richMsg =
        Lang.get(
        "guild_red_packet_rich_text_snatch_situation",
        {
            value1 = #receiveRecordList,
            value2 = redPacketBaseData:getRed_bag_sum(),
            num = money,
            --urlIcon = "icon/resourcemini/1.png"
        }
    )
    self:_createProgressRichText(richMsg)

    local redpacketInfo = require("app.config.guild_redpacket")
    local config = redpacketInfo.get(self._redPacketBaseData:getRed_bag_id())
    local uiParam = PopupGuildOpenRedPacket.uiParams[config.show]
    self._resourceNode:setBackGroundImage(Path.getGuildRes(uiParam.bgRes))
    self._imageTx:setPosition(uiParam._imageTxPos)
    self._textSendName:setPosition(uiParam._textSendNamePos)
    self._textSendName:setColor(uiParam._textSendNameColor)
    self._textGoldNum:setFontSize(uiParam._textGoldNumSize)
    self._textGoldNum:setColor(uiParam._textGoldNumColor)
    self._textGoldNum:setPosition(uiParam._textGoldNumPos)
    self._richNode:setPosition(uiParam._richNodePos)
    self._panel:setPosition(uiParam._panelPos)
    self._imageGoldIcon:setPosition(uiParam._imageGoldIconPos)

    -- 计算richtext文本长度。。。
    local str1 = "已领取:".."个， 总额"
    local str2 = #receiveRecordList.."/"..redPacketBaseData:getRed_bag_sum()..money
    local UTF8 = require("app.utils.UTF8")
    self._imageGoldIcon:setPositionX(uiParam._richNodePos.x + (UTF8.utf8len(str1) * 20) + ((UTF8.utf8len(str2) - 1) * 10))
    
    self._textRedPacketName:setVisible(uiParam._textRedPacketNameVisible)
end

function PopupGuildOpenRedPacket:_refreshMySnatchInfo()
    if self._myReceiveRecord then
        self._textGoldNum:setVisible(true)
        local redpacketInfo = require("app.config.guild_redpacket")
        local config = redpacketInfo.get(self._redPacketBaseData:getRed_bag_id())
        local uiParam = PopupGuildOpenRedPacket.uiParams[config.show]
        self._imageGold:setVisible(uiParam._imageGoldVisible)
        self._textGoldNum:setString(tostring(self._myReceiveRecord:getGet_money()))
        self._textSnatchFinishHint:setVisible(false)
    else
        self._textGoldNum:setVisible(false)
        self._imageGold:setVisible(false)
        self._textSnatchFinishHint:setVisible(true)
    end
end

--创建富文本
function PopupGuildOpenRedPacket:_createProgressRichText(richText)
    self._richNode:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0, 0.5))
    self._richNode:addChild(widget)
end

return PopupGuildOpenRedPacket
