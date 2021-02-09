local ViewBase = require("app.ui.ViewBase")
local MineMoveCarCorpse = class("MineMoveCarCorpse", ViewBase)
local UTF8 = require("app.utils.UTF8")
local GrainCarConst  = require("app.const.GrainCarConst")
local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper")
local GrainCarCorpseName = require("app.scene.view.grainCar.GrainCarCorpseName")

function MineMoveCarCorpse:ctor()
	local resource = {
		file = Path.getCSB("MineMoveCarCorpse", "mineCraft"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {

		}
	}
    MineMoveCarCorpse.super.ctor(self, resource)
end

function MineMoveCarCorpse:onCreate()
    self._corpseName = GrainCarCorpseName.new(self._nameNode)
end

function MineMoveCarCorpse:onEnter()
    self._carAvatar:playDead()
end

function MineMoveCarCorpse:onExit()
end

function MineMoveCarCorpse:updateUIWithLevel(level)
    self._carAvatar:updateUI(level)
end

function MineMoveCarCorpse:addName(carUnit)
    self._corpseName:addName(carUnit)
end

return MineMoveCarCorpse