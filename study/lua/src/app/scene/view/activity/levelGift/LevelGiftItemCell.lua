
-- Author: nieming
-- Date:2017-12-21 11:45:25
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local LevelGiftItemCell = class("LevelGiftItemCell", ListViewCellBase)
local UIActionHelper = require("app.utils.UIActionHelper")
function LevelGiftItemCell:ctor()

	--csb bind var name
	self._alreadyBuy = nil  --ImageView
	self._btnBuy = nil  --CommonButtonSwitchLevel1
	self._icon = nil  --CommonIconTemplate
	self._levelNum1 = nil  --TextAtlas
    self._levelNum2 = nil  --TextAtlas
    self._levelNum3 = nil  --TextAtlas
	self._levelRequireRichNode = nil  --SingleNode
	self._goldGetRichNode = nil --SingleNode
	self._lock = nil  --ImageView
	self._timeCountDown = nil --Text
	self._timeCountDownDes = nil
	local resource = {
		file = Path.getCSB("LevelGiftItemCell", "activity/levelGift"),
		binding = {
			_btnBuy = {
				events = {{event = "touch", method = "_onBtnBuy"}}
			},
		},
	}
	LevelGiftItemCell.super.ctor(self, resource)
end

function LevelGiftItemCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._btnBuy:setString(Lang.get("common_btn_name_confirm"))
end

function LevelGiftItemCell:_lockState()
	self._lock:setVisible(true)
	self._alreadyBuy:setVisible(false)
	self._timeCountDown:setVisible(false)
	self._timeCountDownDes:setVisible(false)
	local config = self._data:getConfig()
	local richText = Lang.get("lang_activity_level_gift_level_require",
	{
		level = config.unlock_level,
	})
	local widget = ccui.RichText:createWithContent(richText)
	widget:setAnchorPoint(cc.p(0.5, 0.5))
	self._levelRequireRichNode:addChild(widget)

	local vipConfig = self._data:getVipConfig()
	self._btnBuy:setVisible(true)
	self._btnBuy:setString(Lang.get("lang_activity_level_gift_btn_buy",{value = vipConfig.rmb}))
	self._btnBuy:setEnabled(false)
end

function LevelGiftItemCell:_alreadyBuyState()
	self._lock:setVisible(false)
	self._timeCountDown:setVisible(false)
	self._timeCountDownDes:setVisible(false)
	self._alreadyBuy:setVisible(true)
	self._timeCountDown:setVisible(false)

	self._btnBuy:setVisible(false)
	self._btnBuy:setEnabled(false)
	-- self._btnBuy:setString(Lang.get("lang_activity_level_gift_btn_alreadyBuy"))
end

function LevelGiftItemCell:_timeoutState()
	self._lock:setVisible(false)
	self._timeCountDown:setVisible(false)
	self._timeCountDownDes:setVisible(false)
	self._alreadyBuy:setVisible(false)
	self._btnBuy:setVisible(true)
	self._btnBuy:setEnabled(false)
	self._btnBuy:setString(Lang.get("lang_activity_level_gift_btn_timeout"))
end


function LevelGiftItemCell:_countDownState()
	self._lock:setVisible(false)
	self._alreadyBuy:setVisible(false)
	self._timeCountDown:setVisible(true)
	self._timeCountDownDes:setVisible(true)
	local action = UIActionHelper.createUpdateAction(function()

		local isTimeOut, limitTime = self._data:isTimeOut()
		if not isTimeOut then
			self._timeCountDown:setString(G_ServerTime:getLeftSecondsString(limitTime, "00:00:00"))
		else
			self:updateUI(self._data)
		end
	end)
	self._timeCountDown:runAction(action)
	local vipConfig = self._data:getVipConfig()
	self._btnBuy:setVisible(true)
	self._btnBuy:setString(Lang.get("lang_activity_level_gift_btn_buy",{value = vipConfig.rmb}))
	self._btnBuy:setEnabled(true)
end

-- appstore 送审条件下  忽略限制条件
function LevelGiftItemCell:updateAppstoreCheckUI(data)
	if not data then
		return
	end

	self._data = data
	self._timeCountDown:stopAllActions()
	self._levelRequireRichNode:removeAllChildren()
	self:_refreshGetGoldInfo()
    local config = self._data:getConfig()
    if config.unlock_level >= 100 then
        self._levelNum1:setString((config.unlock_level %100)%10)
        self._levelNum2:setString(math.floor((config.unlock_level/10)%10))
        self._levelNum3:setString(math.floor(config.unlock_level/100))
        self._levelNum2:setVisible(true)
        self._levelNum3:setVisible(true)
    elseif config.unlock_level > 10 then
		self._levelNum1:setString(config.unlock_level %10)
		self._levelNum2:setString(math.floor(config.unlock_level /10))
		self._levelNum2:setVisible(true)
	else
		self._levelNum1:setString(config.unlock_level %10)
		self._levelNum2:setVisible(false)
	end
	self._icon:unInitUI()
	self._icon:initUI(config.type, config.value, config.size)
	self._icon:setTouchEnabled(true)
	local itemParam = self._icon:getItemParams()
	self._textItemName:setString(itemParam.name)
	self._textItemName:setColor(itemParam.icon_color)


	
	if data:getIs_buy() then
		self:_alreadyBuyState()
	else
		self._lock:setVisible(false)
		self._alreadyBuy:setVisible(false)
		self._timeCountDown:setVisible(false)
		self._timeCountDownDes:setVisible(false)
		local vipConfig = self._data:getVipConfig()
		self._btnBuy:setVisible(true)
		self._btnBuy:setString(Lang.get("lang_activity_level_gift_btn_buy",{value = vipConfig.rmb}))
		self._btnBuy:setEnabled(true)
	end
end

function LevelGiftItemCell:updateUI(data)
	-- body
	if G_ConfigManager:isAppstore() then
		self:updateAppstoreCheckUI(data)
		return
	end

	if not data then
		return
	end

	self._data = data
	self._timeCountDown:stopAllActions()
	self._levelRequireRichNode:removeAllChildren()
	self:_refreshGetGoldInfo()
    local config = self._data:getConfig()
    if config.unlock_level >= 100 then
        self._levelNum1:setString((config.unlock_level %100)%10)
        self._levelNum2:setString(math.floor((config.unlock_level/10)%10))
        self._levelNum3:setString(math.floor(config.unlock_level/100))
        self._levelNum2:setVisible(true)
        self._levelNum3:setVisible(true)
    elseif config.unlock_level > 10 then
		self._levelNum1:setString(config.unlock_level %10)
		self._levelNum2:setString(math.floor(config.unlock_level /10))
        self._levelNum2:setVisible(true)
        self._levelNum3:setVisible(false)
	else
		self._levelNum1:setString(config.unlock_level %10)
        self._levelNum2:setVisible(false)
        self._levelNum3:setVisible(false)
	end
	self._icon:unInitUI()
	self._icon:initUI(config.type, config.value, config.size)
	self._icon:setTouchEnabled(true)
	local itemParam = self._icon:getItemParams()
	self._textItemName:setString(itemParam.name)
	self._textItemName:setColor(itemParam.icon_color)

	if data:isReachUnLockLevel() then
		local isTimeOut = data:isTimeOut()
		if data:getIs_buy() then
			self:_alreadyBuyState()
		elseif isTimeOut then
			self:_timeoutState()
		else
			self:_countDownState()
		end
	else
		self:_lockState()
	end
end

function LevelGiftItemCell:_refreshGetGoldInfo()
	self._goldGetRichNode:removeAllChildren()
	local payCfg = self._data:getVipConfig()
	local richText = Lang.get("lang_activity_level_gift_gold_get_info",
	{
		value = payCfg.gold,
	})
	local widget = ccui.RichText:createWithContent(richText)
	widget:setAnchorPoint(cc.p(0.5, 0.5))
	self._goldGetRichNode:addChild(widget)
end




-- Describle：
function LevelGiftItemCell:_onBtnBuy()
	-- body
	if G_ConfigManager:isAppstore() then
		if self._data:getIs_buy() then
			return
		end
	else
		if not self._data:isReachUnLockLevel() then
			return
		end

		if self._data:getIs_buy() then
			return
		end

		if self._data:isTimeOut() then
			return
		end
	end
	

	local payCfg = self._data:getVipConfig()
	G_GameAgent:pay(payCfg.id, 
					payCfg.rmb, 
					payCfg.product_id, 
					payCfg.name, 
					payCfg.name)
end

return LevelGiftItemCell
