local ViewBase = require("app.ui.ViewBase")
local LoginBG = class("LoginBG", ViewBase)
local UIPopupHelper = require("app.utils.UIPopupHelper")
local PopupServerList = require("app.scene.view.login.PopupServerList")

--
function LoginBG:ctor()
	self._imageBg = nil
	local resource = {
		file = Path.getCSB("LoginBG1", "login"),
        size = G_ResolutionManager:getDesignSize(),
		binding = {
		}
	}
	LoginBG.super.ctor(self, resource)
end

--
function LoginBG:onCreate()
	local res = Path.getEffectSpine("loading")
    local spine = require("yoka.node.SpineNode").new()
    self._panelLoading:addChild(spine)
    spine:setAsset(res)
    spine:setAnimation("effect", true)

	local MainUIHelper =  require("app.scene.view.main.MainUIHelper")
	local config = MainUIHelper.getCurrShowSceneConfig()

	self._imageBg:loadTexture(config.background)
	self._imageBg:ignoreContentAdaptWithSize(true)
	
	-- "moving_denglu3"
	if config.effect ~= "" then
		local effect = G_EffectGfxMgr:createPlayMovingGfx(self._effectNode,config.effect, nil, nil , false )
		effect:play()
	end
end

--
function LoginBG:onEnter()
    
end

--
function LoginBG:onExit()

end


return LoginBG