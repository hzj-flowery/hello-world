
-- Author: nieming
-- Date:2018-05-16 16:13:45
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupLinkageActivity = class("PopupLinkageActivity", PopupBase)


function PopupLinkageActivity:ctor()

	--csb bind var name
	self._btnDisableLable1 = nil  --Text
	self._btnLable1 = nil  --Text
	self._btnDisableLable2 = nil  --Text
	self._btnLable2 = nil  --Text
	self._btnDisableLable3 = nil  --Text
	self._btnLable3 = nil  --Text
	self._btnClose = nil  --Button
	self._btnGet1 = nil  --Button
	self._btnGet2 = nil  --Button
	self._btnGet3 = nil  --Button
	self._countdownTime = nil  --Text
	self._gameTitleImage = nil  --ImageView
	self._item1 = nil  --Sprite
	self._itemName1 = nil  --Text
	self._item2 = nil  --Sprite
	self._itemName2 = nil  --Text
	self._item3 = nil  --Sprite
	self._itemName3 = nil  --Text
	self._lable1 = nil  --Text
	self._lable2 = nil  --Text

	local resource = {
		file = Path.getCSB("PopupLinkageActivity", "common"),
		binding = {
			_btnClose = {
				events = {{event = "touch", method = "_onBtnClose"}}
			},
			_btnGet1 = {
				events = {{event = "touch", method = "_onBtnGet1"}}
			},
			_btnGet2 = {
				events = {{event = "touch", method = "_onBtnGet2"}}
			},
			_btnGet3 = {
				events = {{event = "touch", method = "_onBtnGet3"}}
			},
		},
	}
	PopupLinkageActivity.super.ctor(self, resource)
end

-- Describle：
function PopupLinkageActivity:onCreate()
	self:_updateUI()
	self:_startCountDown()

end

-- Describle：
function PopupLinkageActivity:onEnter()
	self._signalTake = G_SignalManager:add(SignalConst.EVENT_TAKE_LINKAGE_ACTIVITY_CODE_SUCCESS, handler(self, self._onEventTake))
end

-- Describle：
function PopupLinkageActivity:onExit()
	self._signalTake:remove()
	self._signalTake = nil
end
-- Describle：
function PopupLinkageActivity:_onBtnClose()
	-- body
	self:close()
end

function PopupLinkageActivity:_popCode(codeStr)
	local PopupLinkageActivityCode = require("app.ui.PopupLinkageActivityCode")
	local p = PopupLinkageActivityCode.new(codeStr)
	p:openWithAction()
end

function PopupLinkageActivity:_handleBtn(index)
	local records = G_UserData:getLinkageActivity():getRecords()
	if records[index] then
		self:_popCode(records[index])
		return
	end
	local userLevel = G_UserData:getBase():getLevel()
	local levels = G_UserData:getLinkageActivity():getRequireLevels()
	if userLevel >= levels[index] then
		G_UserData:getLinkageActivity():c2sTakeSGSCode(index)
		return
	end
end

function PopupLinkageActivity:_onEventTake(id, index)
	self:_updateButton()
	local records = G_UserData:getLinkageActivity():getRecords()
	if records[index] then
		self:_popCode(records[index])
	end
end
-- Describle：
function PopupLinkageActivity:_onBtnGet1()
	-- body
	self:_handleBtn(1)
end
-- Describle：
function PopupLinkageActivity:_onBtnGet2()
	-- body
	self:_handleBtn(2)
end
-- Describle：
function PopupLinkageActivity:_onBtnGet3()
	-- body
	self:_handleBtn(3)
end

function PopupLinkageActivity:_getItemConfigByType()
	local gameType = G_UserData:getLinkageActivity():getGame_id()
	local LinkageActivityConfig = require("app.config.linkage_activity")
	local indexs = LinkageActivityConfig.index()
	for k ,v in pairs(indexs) do
		local cfg = LinkageActivityConfig.get(k)
		if cfg.game_type == gameType then
			return cfg
		end
	end
	assert(false, "linkage_activity can not find game type id = "..(gameType or "nil"))
end
function PopupLinkageActivity:_updateUI()
	local cfg = self:_getItemConfigByType()
	for i = 1, 3 do
		logError(Path.getLinkageActivity(cfg["reward_"..i]))
		self["_item"..i]:loadTexture(Path.getLinkageActivity(cfg["reward_"..i]))
		self["_itemName"..i]:setString(cfg["code_text_"..i])
	end
	self._lable1:setString(Lang.get("linkage_activity_label1", {game = cfg.name}))
	self._lable2:setString(Lang.get("linkage_activity_label2", {game = cfg.name}))
	self._gameTitleImage:loadTexture(Path.getLinkageActivity(cfg.title))
	self._gameTitleImage:ignoreContentAdaptWithSize(true)
	self:_updateButton()
end
function PopupLinkageActivity:_updateButton()
	local records = G_UserData:getLinkageActivity():getRecords()
	local userLevel = G_UserData:getBase():getLevel()
	local levels = G_UserData:getLinkageActivity():getRequireLevels()
	for i = 1, 3 do
		local codeStr = records[i]
		if codeStr then
			self["_btnGet"..i]:loadTextures(Path.getLinkageActivity("gang_activity_anniu01"),nil, nil)
			self["_btnLable"..i]:setString(Lang.get("linkage_activity_btn_look"))
			self["_btnLable"..i]:setVisible(true)
			self["_btnDisableLable"..i]:setVisible(false)
		elseif userLevel >= levels[i] then
			self["_btnGet"..i]:loadTextures(Path.getLinkageActivity("gang_activity_anniu01"),nil, nil)
			self["_btnLable"..i]:setString(Lang.get("linkage_activity_btn_get"))
			self["_btnLable"..i]:setVisible(true)
			self["_btnDisableLable"..i]:setVisible(false)
		else
			self["_btnGet"..i]:loadTextures(Path.getLinkageActivity("gang_activity_anniu02"),Path.getLinkageActivity("gang_activity_anniu02"), Path.getLinkageActivity("gang_activity_anniu02"))
			self["_btnDisableLable"..i]:setString(Lang.get("linkage_activity_btn_level", {level = levels[i]}))
			self["_btnLable"..i]:setVisible(false)
			self["_btnDisableLable"..i]:setVisible(true)
		end

	end
end



function PopupLinkageActivity:_startCountDown()
    self._endTime = G_UserData:getLinkageActivity():getEnd_time()
    self._countdownTime:stopAllActions()
	self._countdownTime:setString(G_ServerTime:getLeftDHMSFormat(self._endTime, "00:00:00"))
	local curTime = G_ServerTime:getTime()
	if curTime <= self._endTime then
		local UIActionHelper = require("app.utils.UIActionHelper")
		local action = UIActionHelper.createUpdateAction(function()
			self:_timeUpdae()
		end, 0.5)
		self._countdownTime:runAction(action)
	end
end

function PopupLinkageActivity:_timeUpdae()
	local curTime = G_ServerTime:getTime()
	if  curTime > self._endTime then
		self._countdownTime:stopAllActions()
	else
		self._countdownTime:setString(G_ServerTime:getLeftDHMSFormat(self._endTime, "00:00:00"))
	end
end

return PopupLinkageActivity
