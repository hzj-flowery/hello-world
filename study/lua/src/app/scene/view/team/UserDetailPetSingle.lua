local ViewBase = require("app.ui.ViewBase")
local UserDetailPetSingle = class("UserDetailPetSingle", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function UserDetailPetSingle:ctor(petUnitData)
	self._petUnitData = petUnitData

	local resource = {
		file = Path.getCSB("UserDetailPetSingle", "common"),
		binding = {
			
		},
	}

	UserDetailPetSingle.super.ctor(self, resource)
end

function UserDetailPetSingle:onCreate()
	self:_updateView()
end

function UserDetailPetSingle:onEnter()
	
end

function UserDetailPetSingle:onExit()
	
end

function UserDetailPetSingle:_updateView()
	local baseId = self._petUnitData:getBase_id()
	local star = self._petUnitData:getStar()
	local level = self._petUnitData:getLevel()
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, baseId)

	for i = 1, 5 do
		if i <= star then
			self["_imageStar"..i]:loadTexture(Path.getUICommon("img_lit_stars02"))
		else
			self["_imageStar"..i]:loadTexture(Path.getUICommon("img_lit_stars02c"))
		end
	end

	self._textLevel:setString(Lang.get("pet_txt_level", {level = level}))
	self._textName:setString(param.name)
	self._textName:setColor(param.icon_color)
	self._textName:enableOutline(param.icon_color_outline)

	self._nodePet:setConvertType(TypeConvertHelper.TYPE_PET)
	self._nodePet:updateUI(baseId)
end

function UserDetailPetSingle:setAvatarScale(scale)
	self._nodePet:setScale(scale)
end

return UserDetailPetSingle
