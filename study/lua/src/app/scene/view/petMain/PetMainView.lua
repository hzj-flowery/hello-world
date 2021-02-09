--
-- Author: hedili
-- Date: 2018-01-23 13:32:07
-- 神兽之家
local ViewBase = require("app.ui.ViewBase")
local PetMainView = class("PetMainView", ViewBase)
local PetListCell = require("app.scene.view.pet.PetListCell")
local PetFragListCell = require("app.scene.view.pet.PetFragListCell")

local UIPopupHelper = require("app.utils.UIPopupHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local FUNC_ID_LIST = {
	FunctionConst.FUNC_PET_LIST,
	FunctionConst.FUNC_PET_SHOP,
	--FunctionConst.FUNC_PET_TRAIN_TYPE1,
	--FunctionConst.FUNC_PET_TRAIN_TYPE2,
	FunctionConst.FUNC_PET_HAND_BOOK,
	FunctionConst.FUNC_PET_HELP,
}
function PetMainView:ctor(index)
	self._fileNodeEmpty = nil --空置控件
	local PetConst = require("app.const.PetConst")
	self._selectTabIndex = index or PetConst.PET_LIST_TYPE1

	local resource = {
		file = Path.getCSB("PetMainView", "pet"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		},
	}
	PetMainView.super.ctor(self, resource,109)
end

function PetMainView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_shenshou")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)

	for i=1, 4 do
		self["_funcIcon"..i]:updateUI(FUNC_ID_LIST[i])
		self["_funcIcon"..i]:addClickEventListenerEx(handler(self, self._onButtonClick))
	end

	local PetConst = require("app.const.PetConst")
	local PetMainAvatorsNode = require("app.scene.view.petMain.PetMainAvatorsNode")

    local showNum = G_UserData:getPet():getShowPetNum()
	local mainAvatorsNode = {}
    if showNum <= PetConst.SCROLL_AVATART_NUM  then
		 mainAvatorsNode = PetMainAvatorsNode.new(
			PetConst.SCROLL_SIZE,
			PetConst.ANGLE_CONTENT,
			PetConst.START_INDEX, 
			self, 
			PetConst.ANGLE_OFFSET,
			PetConst.CIRCLE,
			PetConst.SCALE_RANGE)
		mainAvatorsNode:setPosition(PetConst.SCROLL_POSITION)
	else
		local petInfo = PetConst["PET_INFO"..showNum]
		
		 mainAvatorsNode = PetMainAvatorsNode.new(
			petInfo.SCROLL_SIZE,
			petInfo.ANGLE_CONTENT,
			petInfo.START_INDEX, 
			self, 
			petInfo.ANGLE_OFFSET,
			petInfo.CIRCLE,
			petInfo.SCALE_RANGE)
		mainAvatorsNode:setPosition(petInfo.SCROLL_POSITION)
	end


	mainAvatorsNode:setName("PetMainAvatorsNode")


	--local offset = (display.width - PetConst.SCROLL_SIZE.width)* 0.5
	--mainAvatorsNode:setPositionX(offset)

	local groundNode = self:getGroundNode()
	groundNode:addChild(mainAvatorsNode)
	

end

function PetMainView:onEnter()
	self:_onEventRedPointUpdate()

	
end


function PetMainView:_onEventRedPointUpdate(event,funcId,param)
	self:_refreshRedPoint()
end

function PetMainView:_refreshRedPoint()

	local function checkShopRedPoint( funcNode )
		--dump(funcNode:getFuncId())
		
		if funcNode:getFuncId() == FunctionConst.FUNC_PET_SHOP then
			local RedPointHelper = require("app.data.RedPointHelper")
			local redValue = RedPointHelper.isModuleSubReach( FunctionConst.FUNC_SHOP_SCENE, "petShop" )
			funcNode:showRedPoint(redValue)
		end

		if funcNode:getFuncId() == FunctionConst.FUNC_PET_LIST then
			local redValue = G_UserData:getFragments():hasRedPoint({fragType = TypeConvertHelper.TYPE_PET}) --是否有神兽合成
			funcNode:showRedPoint(redValue)
		end

		if funcNode:getFuncId() == FunctionConst.FUNC_PET_HAND_BOOK then
			local RedPointHelper = require("app.data.RedPointHelper")
			local redValue =RedPointHelper.isModuleSubReach(FunctionConst.FUNC_PET_HOME, "petMapRP")
			funcNode:showRedPoint(redValue)
		end
	end

	for i=1, 4 do
		local funcNode =  self["_funcIcon"..i]
		checkShopRedPoint(funcNode)
	end
	
end

function PetMainView:onExit()
	
end

function PetMainView:_onButtonClick( sender )

	local funcId =  sender:getTag()
	if funcId > 0 then
		 local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	    WayFuncDataHelper.gotoModuleByFuncId(funcId)
	end
end

return PetMainView
