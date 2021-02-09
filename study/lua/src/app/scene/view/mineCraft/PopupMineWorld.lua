local PopupBase = require("app.ui.PopupBase")
local PopupMineWorld = class("PopupMineWorld", PopupBase)

local PopupMineWorldNode = require("app.scene.view.mineCraft.PopupMineWorldNode")
local SchedulerHelper = require ("app.utils.SchedulerHelper")

PopupMineWorldNode.SCALE_AVATAR = 0.5
PopupMineWorldNode.AVATAR_Z = 100

function PopupMineWorld:waitEnterMsg(callBack, msgParam)
	local function onMsgCallBack(id, message)
		callBack()
	end
    G_UserData:getMineCraftData():c2sGetMineWorld()

    local signal = G_SignalManager:add(SignalConst.EVENT_GET_MINE_WORLD, onMsgCallBack)
    return signal
end

PopupMineWorld.DISTRICT_LIST = 
{
	8, 7, 6, 5, 10, 9, 3, 2, 4, 1,
}

function PopupMineWorld:ctor()
	self._normalState = true
	self._mineDistricts = {}
	local resource = {
		file = Path.getCSB("PopupMineWorld", "mineCraft"),
		binding = {
			_btnClose = {
				events = {{event = "touch", method = "_onCloseClick"}}
			},
			_btnChange = {
				events = {{event = "touch", method = "_onChangeClick"}}
			}
		}
	}
	PopupMineWorld.super.ctor(self, resource)

	self._signalChangeBorn = nil
	self._scheduleHandler = nil
	self._nextConfig = nil
end

function PopupMineWorld:onCreate()
	for i = 1, #PopupMineWorld.DISTRICT_LIST do 
		local data = G_UserData:getMineCraftData():getDistrictById(PopupMineWorld.DISTRICT_LIST[i])
		local district = PopupMineWorldNode.new(self["_mineNode"..i], data)
		table.insert(self._mineDistricts, district)
	end

	self._heroAvatar:updateUI(G_UserData:getBase():getPlayerBaseId())
	self._heroAvatar:setScale(PopupMineWorldNode.SCALE_AVATAR)
	self._heroAvatar:turnBack()
	self._heroAvatar:setLocalZOrder(PopupMineWorldNode.AVATAR_Z)
	self._heroAvatar:showName(true, G_UserData:getBase():getName())
	self._heroAvatar:setNameOffsetY(-75)

	self._imageRebornName:ignoreContentAdaptWithSize(true)


end

function PopupMineWorld:onEnter()
	local myDistrictId = G_UserData:getMineCraftData():getMyDistrictId()
	for i, v in pairs(self._mineDistricts) do 
		if v:getId() == myDistrictId then 
			local posX, posY = v:getPosition()
			self._heroAvatar:setPosition(cc.p(posX+35, posY-25))
		end
	end

	self:_refreshBornMine()

	self._signalChangeBorn = G_SignalManager:add(SignalConst.EVENT_CHANGE_MINE_BORN, handler(self, self._onEventChangeBorn))

	self:_refreshCountDown()
	
end

function PopupMineWorld:onExit()
	self._signalChangeBorn:remove()
	self._signalChangeBorn = nil

	if self._scheduleHandler then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
	end
	self._scheduleHandler = nil
end

function PopupMineWorld:_refreshCountDown()
	local leftTime, config = G_UserData:getMineCraftData():getOpenLeftTime()
	if leftTime and  leftTime > 0 then 
		self._textCountDownTitle:setVisible(true)
		self._textCountTime:setVisible(true)
		self._countBG:setVisible(true)
		self._textCountTime:setString(G_ServerTime:getTimeStringDHMS(leftTime))
		if not self._nextConfig or config.id ~= self._nextConfig.id then
			self._textCountDownTitle:setString(config.count_down_title)
			self._nextConfig = config
		end
		if not self._scheduleHandler then 
			self._scheduleHandler = SchedulerHelper.newSchedule(function()
				self:_update()
			end, 1)	
		end
	else 
		self._textCountDownTitle:setVisible(false)
		self._textCountTime:setVisible(false)
		self._countBG:setVisible(false)
	end
end


function PopupMineWorld:_onCloseClick()
    self:closeWithAction()
end

function PopupMineWorld:_refreshBornMine()
	local bornId = G_UserData:getMineCraftData():getSelfBornId()
	local myGuild = G_UserData:getGuild():getMyGuild()
	if myGuild then 
		bornId = myGuild:getMine_born_id()
	end
	local districtData = G_UserData:getMineCraftData():getDistrictDataByMineId(bornId)
	local config = districtData:getConfigData()
    local districtImg = Path.getMineNodeTxt(config.district_name_txt)
    self._imageRebornName:loadTexture(districtImg)
end

function PopupMineWorld:_onChangeClick()
	local myGuild = G_UserData:getGuild():getMyGuild()
	if not myGuild then 
		G_Prompt:showTip(Lang.get("mine_not_guild_leader"))
        return
	end
	local leaderId = myGuild:getLeader()
	if leaderId ~= G_UserData:getBase():getId() then
		G_Prompt:showTip(Lang.get("mine_not_guild_leader"))
		return
	end
	self:_changeShowState()
end

function PopupMineWorld:_changeShowState()
	if self._normalState then 
		self._normalState = false
	else 
		self._normalState = true
	end
	for _, v in pairs(self._mineDistricts) do 
		v:setBright(self._normalState)
	end
end

function PopupMineWorld:_onEventChangeBorn()
	self:_changeShowState()
	self:_refreshBornMine()
end

function PopupMineWorld:_update()
	self:_refreshCountDown()
end

return PopupMineWorld

