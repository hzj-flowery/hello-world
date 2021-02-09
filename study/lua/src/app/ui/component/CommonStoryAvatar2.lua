--通用武将立绘spine
local CommonStoryAvatar2 = class("CommonStoryAvatar2")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HeroRes = require("app.config.hero_res")

local EXPORTED_METHODS = {
    "updateUI",
    "updateUIByResId",
    "setAvatarPositionY",
    "setAvatarScale"
}

function CommonStoryAvatar2:ctor()
    self._target = nil
    self._spine = nil
end


function CommonStoryAvatar2:_init()
    self._imageAvatar = ccui.Helper:seekNodeByName(self._target, "ImageAvatar")
	self._nodeAvatar = ccui.Helper:seekNodeByName(self._target, "PanelAvatar")
    self._imageAvatar:setVisible(false)
end

function CommonStoryAvatar2:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonStoryAvatar2:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonStoryAvatar2:updateUI(heroId, limitLevel, limitRedLevel)
    local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId, nil, nil, limitLevel, limitRedLevel)
    local resData = param.res_cfg
    if resData.story_res_spine ~= 0 then
        self:_createHeroSpine(resData.story_res_spine)
        self._imageAvatar:setVisible(false)
    else
        self:_createHeroImage(resData.story_res)
        if self._spine then
            self._spine:setVisible(false)
        end
    end
end

function CommonStoryAvatar2:_createHeroSpine(spineId)
    if not self._spine then
        self._spine = require("yoka.node.SpineNode").new(1, cc.size(1024, 1024))
        self._nodeAvatar:addChild(self._spine)
    end
    self._spine:setAsset(Path.getStorySpine(spineId))
    self._spine:setAnimation("idle", true)
    self._spine:setVisible(true)
end

function CommonStoryAvatar2:_createHeroImage(imageId)
    local imgPath = Path.getChatRoleRes(imageId)
    self._imageAvatar:ignoreContentAdaptWithSize(true)
    self._imageAvatar:loadTexture(imgPath)
    self._imageAvatar:setVisible(true)
end

function CommonStoryAvatar2:updateUIByResId(resId)
    local resData = HeroRes.get(resId)
    if resData.story_res_spine ~= 0 then
        self:_createHeroSpine(resData.story_res_spine)
        self._imageAvatar:setVisible(false)
    else
        self:_createHeroImage(resData.story_res)
        if self._spine then
            self._spine:setVisible(false)
        end
    end   
end

function CommonStoryAvatar2:setAvatarPositionY(posY)
    -- body
    self._nodeAvatar:setPositionY(posY)
end

function CommonStoryAvatar2:setAvatarScale(scale)
    -- body
    self._nodeAvatar:setScale(scale)
end

return CommonStoryAvatar2