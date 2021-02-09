-- Description: 劫镖押镖人物
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-04
local ViewBase = require("app.ui.ViewBase")
local PopupGrainCarRobber = class("PopupGrainCarRobber", ViewBase)
local MineBarNode = require("app.scene.view.mineCraft.MineBarNode")
local CSHelper = require("yoka.utils.CSHelper")
local PopupMineUser = require("app.scene.view.mineCraft.PopupMineUser")
local UTF8 = require("app.utils.UTF8")

PopupGrainCarRobber.SCALE_AVATAR = 0.5
PopupGrainCarRobber.SCALE_TOTAL = 0.9

function PopupGrainCarRobber:ctor(data)
    self._data = data
    local resource = {
		file = Path.getCSB("PopupGrainCarRobber", "grainCar"),
        binding = {
			_touchPanel = {
				events = {{event = "touch", method = "_onPanelClick"}}
			},
		}
	}
	PopupGrainCarRobber.super.ctor(self, resource)
end

function PopupGrainCarRobber:onCreate()
    self._barArmy = MineBarNode.new(self._armyBar)
    self._touchPanel:setSwallowTouches(false)
    self._heroAvatar =  CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
    self._nodeAvatar:addChild(self._heroAvatar)
end

function PopupGrainCarRobber:onEnter()
    self:setScale(PopupGrainCarRobber.SCALE_TOTAL)
    -- self:updateAvatar()
end

function PopupGrainCarRobber:onExit()

end

function PopupGrainCarRobber:faceLeft()
    self._heroAvatar:turnBack() 
end

function PopupGrainCarRobber:faceRight()
    self._heroAvatar:turnBack(false) 
end


------------------------------------------------------------------
----------------------------方法----------------------------------
------------------------------------------------------------------
function PopupGrainCarRobber:updateAvatar(mineUser)
    self._mineUser = mineUser
    local id = mineUser:getAvatar_base_id()
    local limit = require("app.utils.data.AvatarDataHelper").getAvatarConfig(id).limit == 1 and 3 
    local avatarId = require("app.utils.UserDataHelper").convertToBaseIdByAvatarBaseId(mineUser:getAvatar_base_id(), mineUser:getBase_id())
    -- if self._lastAvatarId ~= avatarId then 
        -- self._nodeAvatar:removeAllChildren()
        self._lastAvatarId = avatarId
        self._heroAvatar:updateUI(avatarId,nil, nil, limit)
 
        self._heroAvatar:setScale(PopupGrainCarRobber.SCALE_AVATAR)

        --名字
        self._textUserName:setString(mineUser:getUser_name())
        local officerLevel = mineUser:getOfficer_level()
        self._textUserName:setColor(Colors.getOfficialColor(officerLevel))
        require("yoka.utils.UIHelper").updateTextOfficialOutlineForceShow(self._textUserName, officerLevel)

        --兵力
        self._barArmy:setPercent(mineUser:getArmy_value(), true, G_ServerTime:getLeftSeconds(mineUser:getPrivilege_time()) > 0)


        --军团
        if mineUser:getGuild_id() > 0 then
            self._nodeFlag:setVisible(true)
            self._guildFlag:updateUI(mineUser:getGuild_icon(), mineUser:getGuild_name())
        else
            self._nodeFlag:setVisible(false)
        end
    -- end
end

------------------------------------------------------------------
----------------------------回调----------------------------------
------------------------------------------------------------------
function PopupGrainCarRobber:_onPanelClick(sender)
    if not self._mineUser then 
        return
    end
    local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
	local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
	if moveOffsetX < 20 and moveOffsetY < 20 then
		if self._mineUser:getUser_id() ~= G_UserData:getBase():getId() then
            local popupMineUser = PopupMineUser.new(self._mineUser:getUser_id(), self._data)
            popupMineUser:openWithAction()
        end
    end
end


return PopupGrainCarRobber