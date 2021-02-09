local ViewBase = require("app.ui.ViewBase")
local PopupMineNode = class("PopupMineNode", ViewBase)

local PopupMineUser = require("app.scene.view.mineCraft.PopupMineUser")
local SchedulerHelper = require ("app.utils.SchedulerHelper")

local CSHelper = require("yoka.utils.CSHelper")-- 创建弹框
local MineCraftHelper = require("app.scene.view.mineCraft.MineCraftHelper")
local MineBarNode = require("app.scene.view.mineCraft.MineBarNode")
-- local node =  CSHelper.loadResourceNode(Path.getCSB("CommonPromptSilverNode", "common"))

PopupMineNode.SCALE_TOTAL = 1
PopupMineNode.SCALE_AVATAR = 0.6

function PopupMineNode:ctor(data)
	self._data = data   --这边是矿区的data，以及表格
    self._config = data:getConfigData()
    self._mineUser = nil
    self._lastAvatarId = nil    --记录一下以前的avatarid，矿位产生变化的时候，可以少刷新
    self._curInfameValue = 0    --当前恶名值
    self._scheduleInfameHandler = nil

    self._randomTime = 0
    self._startTime = 0
    local resource = {
		file = Path.getCSB("PopupMineNode", "mineCraft"),
        binding = {
			_touchPanel = {
				events = {{event = "touch", method = "_onPanelClick"}}
			},
		}
	}
	PopupMineNode.super.ctor(self, resource)
end

function PopupMineNode:onCreate()
    self._barArmy = MineBarNode.new(self._armyBar)
    local posX, posY = self._imagePrivilege:getPosition()
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_boxflash", nil, nil, false)
    if self._config.pit_type == MineCraftHelper.TYPE_MAIN_CITY then 
        self._effectNode:setVisible(false)
        self._nodeAvatar:setPositionX(20)
        self._imagePrivilege:setPositionX(posX)
    else
        self._effectNode:setVisible(true)
        local effectName = self._config.position_icon
        local effect = G_EffectGfxMgr:createPlayMovingGfx(self._effectNode, effectName)
    end
end

function PopupMineNode:onEnter()
    self:setScale(PopupMineNode.SCALE_TOTAL)
end

function PopupMineNode:onExit()
    self:_stopUpdate()
    self:_stopUpdateInfame()
end

function PopupMineNode:_stopUpdate()
    if self._scheduleHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
		self._scheduleHandler = nil
    end
end


function PopupMineNode:_stopUpdateInfame()
    if self._scheduleInfameHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleInfameHandler)
        self._scheduleInfameHandler = nil
    end
end

function PopupMineNode:_startUpdate()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._update), 0.1)
end

function PopupMineNode:_updateInfoPanel()
    local data = self._mineUser
    local isSelfNode = data:getUser_id() == G_UserData:getBase():getId()
    self._imgMyNameBG:setVisible(isSelfNode)
    self._imgNameBG:setVisible(not isSelfNode)

    self._textUserName:setString(data:getUser_name())
    local officerLevel = data:getOfficer_level()
    self._textUserName:setColor(Colors.getOfficialColor(officerLevel))
    

    local bShow = G_ServerTime:getLeftSeconds(data:getPrivilege_time()) > 0
    self._imagePrivilege:setVisible(bShow)
    
    self._barArmy:setPercent(data:getArmy_value(), false, bShow)

    local guildId = data:getGuild_id()
    if guildId == 0 then 
        self._guildFlag:setVisible(false)
    else
        self._guildFlag:setVisible(true)
        self._guildFlag:updateUI(data:getGuild_icon(), data:getGuild_name())
        -- local testIcon = 8
        -- self._guildFlag:updateUI(testIcon, data:getGuild_name())
    end
end

function PopupMineNode:_updateAvatar()
    local mineUser = self._mineUser
    local id = mineUser:getAvatar_base_id()
    local limit = require("app.utils.data.AvatarDataHelper").getAvatarConfig(id).limit == 1 and 3 
    local avatarId = require("app.utils.UserDataHelper").convertToBaseIdByAvatarBaseId(mineUser:getAvatar_base_id(), mineUser:getBase_id())
    if self._lastAvatarId ~= avatarId then 
        self._nodeAvatar:removeAllChildren()
        self._lastAvatarId = avatarId
        self._heroAvatar =  CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
        self._nodeAvatar:addChild(self._heroAvatar)
        self._heroAvatar:updateUI(avatarId,nil, nil, limit)
        if avatarId == mineUser:getBase_id() then 
            self._heroAvatar:addSpineLoadHandler(handler(self, self._onSpineFinish))
        end
        self._heroAvatar:setScale(PopupMineNode.SCALE_AVATAR)
        self._heroAvatar:turnBack() 
        self._randomTime = 0
    end
    
    self._curInfameValue = mineUser:getInfam_value()
    self:_updateInfame()
    if self._curInfameValue > 0 then
        self:_stopUpdateInfame()
        self._scheduleInfameHandler = SchedulerHelper.newSchedule(handler(self, self._updateInfameTimer), 1)
        self:_updateInfameTimer()
    end
end

--更新恶名值
function PopupMineNode:_updateInfame()
    self._nodeInfame:setVisible(self._curInfameValue > 0)
    self._labelInfam:setString(tostring(self._curInfameValue))
    if self._mineUser:getUser_id() ~= G_UserData:getBase():getId() then
        --不是自己
        self._infameBg:setVisible(false)
    else
        self._infameBg:setVisible(true)
    end
end

function PopupMineNode:_updateInfameTimer()
    local curTime = G_ServerTime:getTime()
    
    local bIsVip = G_ServerTime:getLeftSeconds(self._mineUser:getPrivilege_time()) > 0
    local REFRESH_TIME, NUM_PERCHANGE = MineCraftHelper.getInfameCfg(bIsVip) --每隔多少秒变化一次,每次变化数量
    local lastFreshTime = self._mineUser:getRefresh_time()
    local countChange = math.floor((curTime - lastFreshTime) / REFRESH_TIME)
    if countChange > 0 then
        self._curInfameValue = self._mineUser:getInfam_value() - NUM_PERCHANGE * countChange
        self:_updateInfame()
    end
end


function PopupMineNode:refreshUserData(mineUser)
    self:_stopUpdate()
    self:_stopUpdateInfame()
    if not mineUser then 
        self:setVisible(false)
        self._mineUser = nil
        self._lastAvatarId = nil
        return
    end
    self:setVisible(true)
    self._mineUser = mineUser

    self:_updateInfoPanel()
    self:_updateAvatar()

end

function PopupMineNode:_onSpineFinish()
    if self._config.pit_type ~= MineCraftHelper.TYPE_MAIN_CITY then 
        local time = math.random(1, 9)
        self._randomTime = time/10
        self._startTime = 0
        self:_startUpdate()
    end
end

function PopupMineNode:_update(f)
    self._startTime = self._startTime + f
    if self._startTime  >= self._randomTime then 
        self._heroAvatar:setAction("wak", true)
        self._startTime = 0
        self:_stopUpdate()
    end
end

function PopupMineNode:_onPanelClick()
    if not self._mineUser then 
        return
    end
    if self._mineUser:getUser_id() ~= G_UserData:getBase():getId() then
        local popupMineUser = PopupMineUser.new(self._mineUser:getUser_id(), self._data)
        popupMineUser:openWithAction()
    end
end

return PopupMineNode