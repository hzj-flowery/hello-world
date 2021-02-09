--神兽avatar 展示
local ViewBase = require("app.ui.ViewBase")
local PetAvatarNode = class("PetAvatarNode", ViewBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")



function PetAvatarNode:ctor()
    self._commonAvatar = nil
    self._textPetName  = nil
    self._imagePetColor = nil
    self._imageNoShow = nil
    local resource = {
        file = Path.getCSB("PetAvatarNode", "pet"),
    }
    PetAvatarNode.super.ctor(self, resource)
end

function PetAvatarNode:updateUI(petId)
    local params = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET,petId)

    self:updateBaseId(petId)

end

function PetAvatarNode:doNoShow( ... )
    -- body
    self._imageNoShow:setVisible(true)
    self._commonAvatar:setVisible(false)
end
function PetAvatarNode:darkNode( ... )
    -- body
    self._imageNoShow:setVisible(false)
    self._commonAvatar:setVisible(true)
    self._commonAvatar:setAction("idle_ex",true)
end

function PetAvatarNode:highLightNode( ... )
    -- body
    self._imageNoShow:setVisible(false)
    self._commonAvatar:setVisible(true)
    self._commonAvatar:setAction("idle",true)
   
end

function PetAvatarNode:onCreate()
     self._commonAvatar:setTouchEnabled(false)
end

function PetAvatarNode:turnBack()
    self._commonAvatar:turnBack()
end

function PetAvatarNode:updateBaseId(baseId,animSuffix)
    self._commonAvatar:setConvertType(TypeConvertHelper.TYPE_PET)
    self._baseId = baseId
    self._commonAvatar:updateUI(baseId,"_small")
    self._commonAvatar:setScale(1.6)
end

function PetAvatarNode:setAction(ani,loop)
    self._commonAvatar:setAction(ani,loop)
end

function PetAvatarNode:setCallBack(callBack)
    self._commonAvatar:setTouchEnabled(true)
    self._commonAvatar:setCallBack(callBack)
end

function PetAvatarNode:setUserData( data )
    -- body
    self._commonAvatar:setUserData(data)
end

--
function PetAvatarNode:onEnter()

end

function PetAvatarNode:onExit()

end

return PetAvatarNode
