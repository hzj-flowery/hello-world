-- Author: hedili
-- Date: 2018-01-24 15:09:42
-- 护佑加成
local PopupBase = require("app.ui.PopupBase")
local PopupPetAttrAdd = class("PopupPetAttrAdd", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PetConst = require("app.const.PetConst")
local UserDataHelper = require("app.utils.UserDataHelper")


function PopupPetAttrAdd:ctor(petDlgType)
	self._petDlgType = petDlgType

	local resource = {
		file = Path.getCSB("PopupPetAttrAdd", "pet"),
		binding = {

		}
	}

	PopupPetAttrAdd.super.ctor(self, resource)
end

function PopupPetAttrAdd:onCreate()
	
	self._commonBK:addCloseEventListener(handler(self,self.onClickClose))
	self._commonBK:hideBtnBg()
	self._fileNodeEmpty:setButtonGetVisible(false)
	
	self:updateUI()

end

function PopupPetAttrAdd:updateUI( ... )
	-- body
	local node5 = self:getSubNodeByName("Node_5")
	node5:setVisible(false)
	local node10 = self:getSubNodeByName("Node_10")
	node10:setVisible(false)

	local attrList = {}

	dump(self._petDlgType)
	if self._petDlgType == PetConst.PET_DLG_HELP_ADD then
		self._commonBK:setTitle(Lang.get( "pet_help_add" ) )
		self._textDesc:setString(Lang.get("pet_popup_help_add"))
		self._fileNodeEmpty:setTipsString(Lang.get("pet_have_no_1"))
		local attrMap, tempList =  UserDataHelper.getPetHelpAttr()
		attrList = tempList
	else
		self._commonBK:setTitle(Lang.get( "pet_map_add" ) )
		self._textDesc:setString(Lang.get("pet_popup_map_add"))
		self._fileNodeEmpty:setTipsString(Lang.get("pet_have_no_2"))
		local attrMap, tempList =  UserDataHelper.getPetMapAttr()
		attrList = tempList
	end

	local attrMaxSize = 10
	local loopNode = node10
	
	-- if #attrList > attrMaxSize then
	-- 	attrMaxSize = 10
	-- 	loopNode = node10
	-- end

	loopNode:setVisible(true)
	for i=1, attrMaxSize do 
		local attrFileNode = loopNode:getSubNodeByName("Node_Attr"..i)
		attrFileNode:setVisible(false)
	end

	if #attrList == 0 then
		self._fileNodeEmpty:setVisible(true)
		self._fileNodeEmpty:setButtonGetVisible(false)
		self._imageDesc:setVisible(false)
	else
		self._fileNodeEmpty:setVisible(false)
		self._imageDesc:setVisible(true)
	end
	for i, attr in ipairs(attrList) do 
		local attrFileNode = loopNode:getSubNodeByName("Node_Attr"..i)
		attrFileNode:setVisible(true)
		cc.bind(attrFileNode, "CommonAttrNode")
		attrFileNode:updateValue(attr.type, attr.value)
	end
	
end
function PopupPetAttrAdd:onClickClose( ... )
	-- body
	self:close()
end

function PopupPetAttrAdd:onEnter()

end

function PopupPetAttrAdd:onExit()

end

return PopupPetAttrAdd