--
-- Author: hedili
-- Date: 2018-01-25 11:05:27
-- 神兽出生天赋
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PetDetailStarModule = class("PetDetailStarModule", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local PetConst = require("app.const.PetConst")

function PetDetailStarModule:ctor(petUnitData, rangeType)
	self._petUnitData = petUnitData
	self._rangeType = rangeType
	local resource = {
		file = Path.getCSB("PetDetailStarModule", "pet"),
		binding = {
			_buttonStar = {
				events = {{event = "touch", method = "_onButtonUpgradeClicked"}},
			},
			_expPanelClick = {
				events = {{event = "touch", method = "_onExpPanelClick"}},
			},
			_buttonAdd = {
				events = {{event = "touch", method = "_onExpPanelClick"}},
			},
		},
	}
	PetDetailStarModule.super.ctor(self, resource)
end

function PetDetailStarModule:onCreate()
	local contentSize = self._panelBg:getContentSize()
	self:setContentSize(contentSize)
	
	self._panelBg:setSwallowTouches(false)
	self._nodeTitle:setFontSize(24)
	self._nodeTitle:setTitle(Lang.get("pet_detail_title_star"))
	
	self._buttonStar:setString(Lang.get("pet_detail_btn_star"))

	self:update(self._petUnitData)

end

function PetDetailStarModule:_checkBreakRedPoint(petUnitData)
	local RedPointHelper = require("app.data.RedPointHelper")
	local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE2, petUnitData)
	self._buttonStar:showRedPoint(reach)
end

function PetDetailStarModule:_onExpPanelClick()
	logWarn("PetDetailStarModule:_onExpPanelClick()")

	local fragId = self._petUnitData:getFragmentId()

	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(TypeConvertHelper.TYPE_FRAGMENT,fragId)
	PopupItemGuider:openWithAction()

	--[[
	local PopupPetDetail = require("app.scene.view.petDetail.PopupPetDetail").new(TypeConvertHelper.TYPE_PET ,petId)
	PopupPetDetail:openWithAction()
	]]
end

function PetDetailStarModule:_onButtonUpgradeClicked()
	local isOpen, des = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_PET_TRAIN_TYPE2)
	if not isOpen then
		G_Prompt:showTip(des)
		return
	end

	local petId = self._petUnitData:getId()
	G_SceneManager:showScene("petTrain", petId, PetConst.PET_TRAIN_STAR, self._rangeType, true)
end


function PetDetailStarModule:update(petUnitData)

	local starLevel = petUnitData:getStar()
	local maxStar = petUnitData:getStarMax()

	dump(petUnitData:getId())
	self._fileNodeStar:setCount(starLevel,maxStar)
	local function  updateExp( ... )
		-- body
		local curr, max = UserDataHelper.getPetFragment(petUnitData:getId())
		self._textProgress:setString(curr.."/"..max)

		local percent = ( curr / max) * 100
		self._loadingBarProgress:setPercent(percent)
	end

	updateExp()

	
	self:_checkBreakRedPoint(petUnitData)
end

return PetDetailStarModule