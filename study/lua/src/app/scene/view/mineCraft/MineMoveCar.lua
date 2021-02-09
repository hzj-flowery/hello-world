local ViewBase = require("app.ui.ViewBase")
local MineMoveCar = class("MineMoveCar", ViewBase)
local UTF8 = require("app.utils.UTF8")
local GrainCarConst  = require("app.const.GrainCarConst")
local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper")
local GrainCarBar = require("app.scene.view.grainCar.GrainCarBar")

MineMoveCar.AVATAR_SCALE = 1.2
MineMoveCar.GUILD_NAME_HEIGHT = 40
MineMoveCar.CAR_SCALE = {
   [1] = 1,
   [2] = 1,
   [3] = 1.1,
   [4] = 1.1,
   [5] = 1.1
}

function MineMoveCar:ctor()
	local resource = {
		file = Path.getCSB("MineMoveCar", "mineCraft"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {

		}
	}
    MineMoveCar.super.ctor(self, resource)
end

function MineMoveCar:onCreate()
    self:setScale(MineMoveCar.AVATAR_SCALE)
    self._titleInitPosY = self._guildName:getPositionY()
    self._barInitPosY = self._armyBar:getPositionY()
    self._barArmy = GrainCarBar.new(self._armyBar)
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_bianshenka")
end

function MineMoveCar:onEnter()
    -- self._barArmy:setSmallMode()
end

function MineMoveCar:onExit()
end

function MineMoveCar:updateUI(carUnit)
    self._carAvatar:updateUI(carUnit:getLevel())
    self._carAvatar:setScale(1.4 * MineMoveCar.CAR_SCALE[carUnit:getLevel()])

    --军团名
    self._guildName:setString(carUnit:getGuild_name()..Lang.get("grain_car_guild_de")..carUnit:getConfig().name)
    if GrainCarDataHelper.isMyGuild(carUnit:getGuild_id()) then
        self._guildName:setColor(Colors.BRIGHT_BG_GREEN)
        self._guildName:enableOutline(Colors.COLOR_QUALITY_OUTLINE[2], 1)
        self._nodeEffect:setVisible(true)
    else
        self._nodeEffect:setVisible(false)
    end
    -- local nameWidth = self._guildName:getContentSize().width
    -- local offset = (nameWidth - 36) / 2
    -- self._guildName:setPositionX(offset)
    -- self._title:setPositionX(offset)



    --车名
    -- self._title:loadTexture(Path.getGrainCarText(GrainCarConst.CAR_TITLE[carUnit:getLevel()]))

    --粮车血量
    self._barArmy:updateBarWithCarUnit(carUnit)
    self._barArmy:showPercentText(false)
end

--设置军团名称垂直位置 index:重叠列表中的序号
function MineMoveCar:setGuildNameYWithIndex(index)
    self._guildName:setPositionY(self._titleInitPosY + MineMoveCar.GUILD_NAME_HEIGHT * (index - 1))
    self._title:setPositionY(self._titleInitPosY + MineMoveCar.GUILD_NAME_HEIGHT * (index - 1))
    self._armyBar:setPositionY(self._barInitPosY + MineMoveCar.GUILD_NAME_HEIGHT * (index - 1))
end

function MineMoveCar:resetGuildNamePos()
    self._guildName:setPositionY(self._titleInitPosY)
    self._title:setPositionY(self._titleInitPosY)
    self._armyBar:setPositionY(self._barInitPosY)
end

function MineMoveCar:playRun()
    self._carAvatar:playRun()
end

function MineMoveCar:playIdle()
    self._carAvatar:playIdle()
end

function MineMoveCar:playDead()
    self._carAvatar:playDead()
end

function MineMoveCar:turnBack(needTurn)
    self._carAvatar:turnBack(needTurn)
end

return MineMoveCar