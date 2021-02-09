-- Description: 劫镖押镖人物
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-10-25
local ViewBase = require("app.ui.ViewBase")
local GrainCarRunHero = class("GrainCarRunHero", ViewBase)
local CSHelper = require("yoka.utils.CSHelper")


GrainCarRunHero.SCALE_AVATAR = 0.8

function GrainCarRunHero:ctor()
    local resource = {
		file = Path.getCSB("GrainCarRunHero", "grainCar"),
        binding = {
		}
	}
	GrainCarRunHero.super.ctor(self, resource)
end

function GrainCarRunHero:onCreate()
    self._nodeAvatar:removeAllChildren()
    self._heroAvatar =  CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
    self._nodeAvatar:addChild(self._heroAvatar)
end

function GrainCarRunHero:onEnter()
    self:setScale(GrainCarRunHero.SCALE_AVATAR)
end

function GrainCarRunHero:onExit()

end

function GrainCarRunHero:faceLeft()
    self._heroAvatar:turnBack() 
end

function GrainCarRunHero:faceRight()
    self._heroAvatar:turnBack(false) 
end

function GrainCarRunHero:playRun()
    self._heroAvatar:setAction("run", true)
end

function GrainCarRunHero:playIdle()
    self._heroAvatar:setAction("idle", true)
end

function GrainCarRunHero:playWin()
    self._heroAvatar:setAction("win", true)
end

------------------------------------------------------------------
----------------------------方法----------------------------------
------------------------------------------------------------------
function GrainCarRunHero:updateAvatar(simpleUserData)
    local avatarBaseId = simpleUserData:getAvatar_base_id()
    local baseId = simpleUserData:getLeader()
    local limit = require("app.utils.data.AvatarDataHelper").getAvatarConfig(avatarBaseId).limit == 1 and 3 
    local avatarId = require("app.utils.UserDataHelper").convertToBaseIdByAvatarBaseId(avatarBaseId, baseId)
    self._heroAvatar:updateUI(avatarId, nil, nil, limit)
end

------------------------------------------------------------------
----------------------------回调----------------------------------
------------------------------------------------------------------



return GrainCarRunHero