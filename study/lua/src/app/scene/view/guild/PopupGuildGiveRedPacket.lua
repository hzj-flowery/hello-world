
local PopupBase = require("app.ui.PopupBase")
local PopupGuildGiveRedPacket = class("PopupGuildGiveRedPacket", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst =  require("app.const.DataConst")


function PopupGuildGiveRedPacket:ctor(redPacketData)
    self._redPacketData = redPacketData
    self._isOpenAddPricePanel = false
    self._textRedPacketName = nil
    self._nodeAdd = nil
    self._buttonAdd = nil
    self._nodeRich = nil
    self._textGoldNum = nil
    self._checkNodeList = {}
	local resource = {
		file = Path.getCSB("PopupGuildGiveRedPacket", "guild"),
		binding = {
           	_buttonAdd = {
				events = {{event = "touch", method = "_onButtonAdd"}}
			},
            _btnSend = {
				events = {{event = "touch", method = "_onButtonSend"}}
			},
		}
	}
	PopupGuildGiveRedPacket.super.ctor(self, resource, true)
end

function PopupGuildGiveRedPacket:onCreate()
    self._btnSend:setString(Lang.get("guild_red_packet_btn_give"))
end

function PopupGuildGiveRedPacket:onEnter()
    self:_checkIsCanAdd()
    self:_refreshAddPriceValue()
    self:_refreshBaseInfo()
    self:_refreshGoldNum()
end

function PopupGuildGiveRedPacket:onExit()
	
end

function PopupGuildGiveRedPacket:_checkIsCanAdd()
    local canNotAddIds = { --不能加倍的红包Id，写死，因为没有规则。。。
        3101, 3102, 3103, 3401,3402, 3403,3404, 3405, 7101, 7102, 7103, 7104, 7201, 7202, 7203, 30, 31, 32, 33
    }
    local redBagId = self._redPacketData:getRed_bag_id()
    local isIn = false
    for i, id in ipairs(canNotAddIds) do
        if id == redBagId then
            isIn = true
            break
        end
    end
    self._buttonAdd:setVisible(not isIn)
    self._nodeAdd:setVisible(not isIn)
end

function PopupGuildGiveRedPacket:_refreshAddPriceValue()
   local config = self._redPacketData:getConfig()
   self._resInfo01:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND, config.gold)
   self._resInfo01:setTextColor(Colors.DARK_BG_ONE)

   self._resInfo02:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND, 2 * config.gold)
   self._resInfo02:setTextColor(Colors.DARK_BG_ONE)

   self._resInfo03:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND,  5 * config.gold)
   self._resInfo03:setTextColor(Colors.DARK_BG_ONE)

   self._checkBox1:setTag(2)
   self._checkBox2:setTag(3)
   self._checkBox3:setTag(6)

   self._checkBox1:addEventListener(handler(self,self._onClickCheckBox))
   self._checkBox2:addEventListener(handler(self,self._onClickCheckBox))
   self._checkBox3:addEventListener(handler(self,self._onClickCheckBox))

   self._checkNodeList = {self._checkBox1, self._checkBox2, self._checkBox3}
end

function PopupGuildGiveRedPacket:_onButtonAdd(render)
    self._isOpenAddPricePanel = not self._isOpenAddPricePanel
    self._nodeAdd:setVisible(self._isOpenAddPricePanel)
end

function PopupGuildGiveRedPacket:_onButtonSend(render)
   
   --检查红包是否存在（玩家停留在发红包界面太久了）
   if not G_UserData:getGuild():isCanGiveRedPacket(self._redPacketData:getId()) then
        G_Prompt:showTip("guild_red_packet_give_tip_invalid_redpacket")
        self:close()
        return
   end
   --检查金额
   local cost = self:_getCostGold()
   if cost > 0 then
        local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
        local success = LogicCheckHelper.enoughCash(cost,true)
        if not success then
            return
        end
   end
   local multiple = self:_getSelectMultiple()
   G_UserData:getGuild():c2sPutGuildRedBag(self._redPacketData:getId(),multiple)
   self:close()
end


function PopupGuildGiveRedPacket:_onClickCheckBox(sender)
    local vipLimit = require("app.utils.UserDataHelper").getParameter(G_ParameterIDConst.REDBAG_MULTI_LIMIT)
    local vipLimit2 = require("app.utils.UserDataHelper").getParameter(G_ParameterIDConst.REDBAG_MULTI_LIMIT2)
    local vipLevel = G_UserData:getVip():getLevel() or 0
    local multiple = sender:getTag()
    if multiple == 2 then 
        if vipLimit > vipLevel then
            G_Prompt:showTip(Lang.get("guild_red_packet_give_tip_limit_redpacket"))
            sender:setSelected(false)
            return
        end
    else
        if vipLimit2 > vipLevel then
            G_Prompt:showTip(Lang.get("guild_red_packet_give_tip_limit_redpacket2", {value = multiple}))
            sender:setSelected(false)
            return
        end
    end

	local isSelect = sender:isSelected()
    if isSelect then
         for k,v in ipairs(self._checkNodeList) do
            if v:getTag() ~= multiple then
                v:setSelected(false)
            end
        end
    end 
    
    self:_refreshGoldNum()
end

function PopupGuildGiveRedPacket:_refreshGoldNum()
    local multiple = self:_getSelectMultiple()
    local config = self._redPacketData:getConfig()
    if multiple then
        self._textGoldNum:setString(tostring(config.gold*multiple))
    else
        self._textGoldNum:setString(tostring(config.gold))
    end
    
end

function PopupGuildGiveRedPacket:_refreshBaseInfo()
    local config = self._redPacketData:getConfig()
    self._textRedPacketName:setString(config.name)
    self:_createProgressRichText(
         Lang.get("guild_red_packet_rich_text_give_num",{value = self._redPacketData:getRed_bag_sum()}))
end

--返回花费的元宝
function PopupGuildGiveRedPacket:_getCostGold()
    local multiple = self:_getSelectMultiple()
    local config = self._redPacketData:getConfig()
    if multiple then
        return config.gold*(multiple-1)
    else
        return 0
    end
end

function PopupGuildGiveRedPacket:_getSelectMultiple()
    local multiple = nil
    for k,v in ipairs(self._checkNodeList) do
        if v:isSelected() then
             multiple = v:getTag() 
        end
    end
    return multiple
end


--创建富文本
function PopupGuildGiveRedPacket:_createProgressRichText(richText)
	self._nodeRich:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0.5,0.5))
    self._nodeRich:addChild(widget)
end

return PopupGuildGiveRedPacket
