local ViewBase = require("app.ui.ViewBase")
local LoadingHintView = class("LoadingHintView", ViewBase)

function LoadingHintView:ctor()
    self._nodeHero = nil
	local resource = {
		file = Path.getCSB("LoadingHintView", "login"),
        size = {1136, 640},
	}
	LoadingHintView.super.ctor(self, resource)
end

function LoadingHintView:onCreate()
    local spineHero = require("yoka.node.HeroSpineNode").new()
    self._nodeHero:addChild(spineHero)
    spineHero:setAsset(Path.getSpine("302"))
    spineHero:setAnimation("run", true)
end


function LoadingHintView:showView()
	self:setVisible(true)
end

function LoadingHintView:hideView()
	self:setVisible(false)
end


return LoadingHintView