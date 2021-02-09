local PopupBase = require("app.ui.PopupBase")
local PopupGuildFlagSetting = class("PopupGuildFlagSetting", PopupBase)
local GuildFlagColorItemCell = require("app.scene.view.guild.GuildFlagColorItemCell")
local PopUpGuildFlagSettingHelper = require("app.scene.view.guild.PopupGuildFlagSettingHelper")

local GuildFlagConfig = require("app.config.guild_true_flag")
local SchedulerHelper = require("app.utils.SchedulerHelper")

PopupGuildFlagSetting.FLAG_NUM = 10

function PopupGuildFlagSetting:ctor()
    self._flagItems = {}
    self._selectIndex = nil
	local resource = {
		file = Path.getCSB("PopupGuildFlagSetting", "guild"),
		binding = {
		}
	}
	PopupGuildFlagSetting.super.ctor(self, resource, true)
end

function PopupGuildFlagSetting:onCreate()
     self._popBase:setTitle(Lang.get("guild_flag_setting_title"))

    local myGuild = G_UserData:getGuild():getMyGuild()
    assert(myGuild, "G_UserData:getGuild():getMyGuild() = nil")
    
    self:_initFlagData()

    local icon =  myGuild:getIcon()
    PopUpGuildFlagSettingHelper.setCurrentTouchIndex(icon or 0)

    self._currentChooseFlagInfo = self._dataList[icon]

    self:_initListView()
      
    self._buttonOk:setString(Lang.get("common_btn_name_confirm"))
    self._buttonOk:addClickEventListenerEx(handler(self,self._onClickButtonOK))
    

    self:_updateFlagColor(icon)

    self._scheduler = SchedulerHelper.newSchedule(handler(self,self._updateFlagLeftTimeCountdown), 1)
end

function PopupGuildFlagSetting:onEnter()
	self._signalGuildFlagChange = G_SignalManager:add(SignalConst.EVENT_GUILD_FLAG_CHANGE, handler(self, self._onEventGuildFlagChange))
    --EVENT_GUILD_BASE_INFO_UPDATE
end

function PopupGuildFlagSetting:onExit()
	self._signalGuildFlagChange:remove()
    self._signalGuildFlagChange = nil
    
    if self._scheduler then
        SchedulerHelper.cancelSchedule(self._scheduler)
        self._scheduler = nil
    end
end

function PopupGuildFlagSetting:_initFlagData(  )
    local data = {}
    local length = GuildFlagConfig.length()
    local openServerDay = G_UserData:getBase():getOpenServerDayNum()
    local myGuild = G_UserData:getGuild():getMyGuild()
    local guildIconList = myGuild:getIcon_list()
    local curTime = G_ServerTime:getTime()

    for i = 1, length do 
        local configInfo = GuildFlagConfig.get(i)

        if configInfo then
            local flagData = {}

            if i <= 10 then
                flagData.isUnLock = true
                flagData.expireTime = 0
                flagData.cfg = configInfo
                table.insert( data, flagData )
            else
                local flagData = {}

                local expireTime = guildIconList[configInfo.id]
                if expireTime and curTime < expireTime then
                    flagData.isUnLock = true
                    flagData.expireTime = expireTime
                else
                    flagData.isUnLock = false
                    flagData.expireTime = 0
                end

                flagData.cfg = configInfo
                table.insert( data, flagData )
            end
        end
    end
    

    self._dataList = data
end

function PopupGuildFlagSetting:_updateFlagData(  )
    local curTime = G_ServerTime:getTime()
    local myGuild = G_UserData:getGuild():getMyGuild()

    for k, v in pairs(self._dataList) do
        if v.isUnLock == true and v.expireTime > 0 and v.expireTime <= curTime then
            v.isUnLock = false

            local curIcon =  myGuild:getIcon()
            local lastIcon =  myGuild:getLast_icon()
            PopUpGuildFlagSettingHelper.setCurrentTouchIndex(lastIcon or 0)

            if curIcon == v.cfg.id then
                self._updateExpireFlag = true
                G_UserData:getGuild():c2sChangeGuildIcon(lastIcon)
            end
        end
    end
end

function PopupGuildFlagSetting:_updateFlagLeftTimeCountdown()
    if self._currentChooseFlagInfo ~= nil then
        local timeStr = ""
        if self._currentChooseFlagInfo.isUnLock == true and self._currentChooseFlagInfo.expireTime > 0 then
            if self._currentChooseFlagInfo.expireTime > 0 then
                timeStr = PopUpGuildFlagSettingHelper.getExpireTimeString(self._currentChooseFlagInfo.expireTime)
            end

            self._labelTime:setString(timeStr)
        end
    end

    self:_updateFlagData()
end

function PopupGuildFlagSetting:_initListView()
	local lineCount = math.ceil(#self._dataList / 3)

	if lineCount > 0 and self._listview then
	    local listView = self._listview
		listView:setTemplate(GuildFlagColorItemCell)
        listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
        
        GuildFlagColorItemCell:setItemTouchCallBack(handler(self,self._updateListView))
		listView:setCustomCallback(handler(self, self._onItemTouch))
		listView:clearAll()
		listView:resize(lineCount)
	end
end

function PopupGuildFlagSetting:_updateListView( currentId )
    self._currentChooseFlagInfo = self._dataList[currentId]
    self:_updateFlagLeftTimeCountdown()
    self:_updateFlagColor(currentId)

    local myGuild = G_UserData:getGuild():getMyGuild()
    self._listview:clearAll()
    local lineCount = math.ceil(#self._dataList / 3)
    self._listview:resize(lineCount)
end

function PopupGuildFlagSetting:_onItemUpdate(item, index)
    if #self._dataList > 0 then
        local listIndex = index * 3 + 1
		if self._dataList[listIndex] ~=nil then
			item:updateUI(index + 1, self._dataList, self._onItemTouch)
		end
	end
end

function PopupGuildFlagSetting:_onItemSelected(item, index)

end

function PopupGuildFlagSetting:_onEventGuildFlagChange(event,rewards)
    if self._updateExpireFlag then
        local myGuild = G_UserData:getGuild():getMyGuild()
        local curIcon =  myGuild:getIcon()

        self:_updateListView(curIcon)
    else
        self:close()
        G_Prompt:showTip(Lang.get("guild_flag_setting_success_tip"))
    end
end

function PopupGuildFlagSetting:_onClickClose()
	self:close()
end

function PopupGuildFlagSetting:_onClickButtonOK()
    local currentId = PopUpGuildFlagSettingHelper:getCurrentTouchIndex()

    local flagData = self._dataList[currentId]
    if flagData and flagData.isUnLock then
        G_UserData:getGuild():c2sChangeGuildIcon(currentId)
    end
end

function PopupGuildFlagSetting:_updateList()
end

function PopupGuildFlagSetting:_onItemTouch(index)
end


function PopupGuildFlagSetting:_updateFlagColor(flagId) 
    print("flagId "..flagId)
    local myGuild = G_UserData:getGuild():getMyGuild()
	assert(myGuild, "G_UserData:getGuild():getMyGuild() = nil")
	local name = myGuild:getName()
    self._commonGuildFlag:updateUI(flagId, name)

    local flagData = self._dataList[flagId]
    if flagData then
        self._labelDes:setString(flagData.cfg.description)

        self._buttonOk:setEnabled(true)

        if flagData.cfg.time_value == 0 then
            self._labelTime:setString(Lang.get("frame_forever"))
            self._labelTime:setColor(Colors.SYSTEM_TARGET)
        elseif flagData.isUnLock == false then
            self._labelTime:setString(string.format(Lang.get("frame_time"), flagData.cfg.time_value))
            self._labelTime:setColor(Colors.SYSTEM_TARGET_RED)
            self._buttonOk:setEnabled(false)
        else
            local timeStr = PopUpGuildFlagSettingHelper.getExpireTimeString(flagData.expireTime)
            self._labelTime:setString(timeStr)
            self._labelTime:setColor(Colors.SYSTEM_TARGET_RED)
        end

        self._flagName:setString(flagData.cfg.name)
    end
end

return PopupGuildFlagSetting
