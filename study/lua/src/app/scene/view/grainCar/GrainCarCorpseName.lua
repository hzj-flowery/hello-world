local GrainCarCorpseName = class("GrainCarCorpseName")
local UTF8 = require("app.utils.UTF8")
local GrainCarConst  = require("app.const.GrainCarConst")
local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper")

function GrainCarCorpseName:ctor(target)
    self._target = target
    self._carList = {}
end

function GrainCarCorpseName:onCreate()

end

function GrainCarCorpseName:onEnter()
end

function GrainCarCorpseName:onExit()
end

function GrainCarCorpseName:updateUI()
end

--添加名字
function GrainCarCorpseName:addName(carUnit)
    local count = #self._carList

    local name = carUnit:getGuild_name()..Lang.get("grain_car_guild_de")..carUnit:getConfig().name
    local labelName = cc.Label:createWithTTF(name, Path.getCommonFont(), 20)
    labelName:setAnchorPoint(cc.p(0.5, 0))
    labelName:setPosition(cc.p(0, count * 25))
    self._target:addChild(labelName)
	if GrainCarDataHelper.isMyGuild(carUnit:getGuild_id()) then
        labelName:setColor(Colors.BRIGHT_BG_GREEN)
        labelName:enableOutline(Colors.COLOR_QUALITY_OUTLINE[2], 1)
    else
        labelName:setColor(Colors.BRIGHT_BG_RED)
        labelName:enableOutline(Colors.COLOR_QUALITY_OUTLINE[6], 1)
    end
    table.insert(self._carList, carUnit)
end

return GrainCarCorpseName