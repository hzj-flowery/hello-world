local ViewBase = require("app.ui.ViewBase")
local LogoView = class("LogoView", ViewBase)

local scheduler = require("cocos.framework.scheduler")
--
function LogoView:onCreate()
end

--
function LogoView:isRootScene()
    return true
end

--
function LogoView:onEnter()
    --self:showTips()

    self:showLogo()
end

--
function LogoView:showTips()
    self:_show("other/tip.jpg", handler(self, self.showLogo))
end

--
function LogoView:showLogo()
    self:_show("other/logo.png", handler(self, self.onNextStep))
    local layerColor =
        cc.LayerColor:create(
        cc.c4b(0, 0, 0, 255),
        G_ResolutionManager:getDesignWidth(),
        G_ResolutionManager:getDesignHeight()
    )
    self:addChild(layerColor)
end

--
function LogoView:_show(img, fun)
    --self:removeAllChildren()

    -- local s = cc.Sprite:create(img)
    -- self:addChild(s, 100)
    -- s:setPosition(G_ResolutionManager:getDesignCCPoint())
    -- s:setOpacity(0)

    self:runAction(
        cc.Sequence:create(
            cc.DelayTime:create(0.1),
            cc.CallFunc:create(
                function()
                    fun()
                end
            )
        )
    )
end

function LogoView:onNextStep()
    G_SceneManager:showScene("login")
end


return LogoView
