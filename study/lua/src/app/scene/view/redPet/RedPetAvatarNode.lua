
local RedPetAvatarNode = class("RedPetAvatarNode")


local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PetConfig = require("app.config.pet")
local FragmentConfig = require("app.config.fragment")

function RedPetAvatarNode:ctor(target)
	self._target = target
    self._commonHeroAvatar = ccui.Helper:seekNodeByName(self._target, "_commonHeroAvatar")
    self._avatarName = ccui.Helper:seekNodeByName(self._target, "_avatarName")
    self._nameBg = ccui.Helper:seekNodeByName(self._target, "_nameBg")
    self._starRoot = ccui.Helper:seekNodeByName(self._target, "_starRoot")
    self._refreshEffectNode = ccui.Helper:seekNodeByName(self._target, "_refreshEffectNode")
    self._commonStar = ccui.Helper:seekNodeByName(self._target, "_commonStar")
    self._nameEffectNode = ccui.Helper:seekNodeByName(self._target, "_nameEffectNode")
    self._emojiNode = ccui.Helper:seekNodeByName(self._target, "_emojiNode")

    cc.bind(self._commonHeroAvatar, "CommonHeroAvatar")
    cc.bind(self._commonStar, "CommonHeroStar")

    self._petId = 0
end


function RedPetAvatarNode:onCreate()

end

function RedPetAvatarNode:onEnter()

end

function RedPetAvatarNode:onExit()

end

function RedPetAvatarNode:setPetName(name)
    self._avatarName:setString(name)
end

function RedPetAvatarNode:setPetQuality(quality)
end

function RedPetAvatarNode:updatePetAvatar(avatarData)
    self._commonHeroAvatar:setConvertType(TypeConvertHelper.TYPE_PET)
    self._commonHeroAvatar:updateUI(avatarData.id, "_small")
    self._commonHeroAvatar:setScale(1.2)
    self._commonHeroAvatar:turnBack()

    self._petId = avatarData.id

    local petConfigInfo = PetConfig.get(self._petId)
    self:setPetName(petConfigInfo.name)

    local initial_star = petConfigInfo.initial_star
    if initial_star > 0 then
        self._starRoot:setVisible(true)
        self._commonStar:setCountAdv(initial_star)
        self:playRedPetNameEffect()
    else
        self._starRoot:setVisible(false)
    end

    self._nameBg:loadTexture(initial_star > 0 and Path.getRedPetImage("img_pet_pinzhi01") or Path.getRedPetImage("img_pet_pinzhi02"))
    self._nameBg:ignoreContentAdaptWithSize(true)
end

function RedPetAvatarNode:playRefreshEffect()
    local petConfigInfo = PetConfig.get(self._petId)
    local initial_star = petConfigInfo.initial_star
    if initial_star > 0 then
        return
    end

    self._refreshEffectNode:removeAllChildren()	
    G_EffectGfxMgr:createPlayMovingGfx(self._refreshEffectNode, "moving_qiling_shuaxin", nil, nil, true)
end

function RedPetAvatarNode:playRedPetNameEffect()
    local effectName = "effect_qiling_baixiwenzi"

    self._nameEffectNode:removeAllChildren()	
    G_EffectGfxMgr:createPlayGfx(self._nameEffectNode, effectName, nil)
end

function RedPetAvatarNode:removeEmoji()
    self._emojiNode:removeAllChildren()	
end

function RedPetAvatarNode:playEmojiEffect(petIds, fragmentIds, intersectPanelId)
    local isSelf = false

    petIds = petIds or {}

    for k, v in pairs(petIds) do
        if self._petId == v then
            isSelf = true
            break
        end
    end

    self._emojiNode:removeAllChildren()	

    if isSelf then
        G_EffectGfxMgr:createPlayGfx(self._emojiNode, "effect_xunma_aixin", nil)
        return
    end

    fragmentIds = fragmentIds or {}

    for k, v in pairs(fragmentIds) do
        local fragmentConfigInfo = FragmentConfig.get(v.value)
        local petId = fragmentConfigInfo.comp_value
        if self._petId == petId then
            isSelf = true
            break
        end
    end

    if isSelf then
        G_EffectGfxMgr:createPlayGfx(self._emojiNode, "effect_xunma_chenmo", nil)
        return
    end

    if #fragmentIds == 0 and #petIds == 0 and intersectPanelId == true then
        G_EffectGfxMgr:createPlayGfx(self._emojiNode, "effect_xunma_shengqi", nil)
    end
end

return RedPetAvatarNode