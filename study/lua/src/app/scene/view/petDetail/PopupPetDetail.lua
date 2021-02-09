-- Author: hedili
-- Date: 2018-01-24 15:09:42
-- 神兽详情
local PopupBase = require("app.ui.PopupBase")
local PopupPetDetail = class("PopupPetDetail", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PetDataHelper = require("app.utils.data.PetDataHelper")

function PopupPetDetail:ctor(type, value, isPage)
	self._type = type
	self._value = value
	self._isPage = isPage

	local resource = {
		file = Path.getCSB("PopupPetDetail", "pet"),
		binding = {
			_btnWayGet = {
				events = {{event = "touch", method = "_onBtnWayGetClicked"}}
			},

		}
	}

	PopupPetDetail.super.ctor(self, resource)
end

function PopupPetDetail:onCreate()
	self._btnWayGet:setString(Lang.get("way_type_goto_get"))
	self._commonBg:addCloseEventListener(handler(self,self._onBtnClose))
	self._commonBg:setTitle(Lang.get("pet_detail_title"))
	self._isShowDrawing = false
	self._avatarPageItems = nil

	self._curSelectedPos = 0
end

function PopupPetDetail:onEnter()
	if not self._isPage then
		local dataList = {{cfg = {id = self._value}}}
		self:setPageData(dataList)
	end
end

function PopupPetDetail:onExit()

end

function PopupPetDetail:_updateUnitInfo(petBaseId)
	self._petBaseId = petBaseId
	self._fileNodeCountryFlag:updateUI(TypeConvertHelper.TYPE_PET, petBaseId)
	self._detailWindow:updateUI(nil,petBaseId)
	
	local havePet = G_UserData:getPet():isPetHave(petBaseId)
	local color = havePet and Colors.DARK_BG_THREE or Colors.BRIGHT_BG_RED
	self._hasText:setColor(color)
	self._hasText:setString(havePet and Lang.get("common_have") or  Lang.get("common_not_have")) 
end



function PopupPetDetail:_onBtnWayGetClicked()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(self._type,self._value)
	PopupItemGuider:openWithAction()
end


function PopupPetDetail:_updateDrawing(show)
		
	self._scrollPage:setCurPage(self._curSelectedPos)
end

function PopupPetDetail:_onBtnClose()
	self:close()
end

--使用了翻页功能
function PopupPetDetail:setPageData(dataList)
	local selectPos = 0
	for i, data in ipairs(dataList) do
		if data.cfg.id == self._value then
			selectPos = i
		end
	end
	self:_setScrollPage(dataList, selectPos)

end

function PopupPetDetail:_setScrollPage(dataList, selectPos)
	self._dataList = dataList
	
	self._scrollPage:setCallBack(handler(self, self._updateAvatarItem))
	self._scrollPage:setUserData(dataList, selectPos)
end

function PopupPetDetail:_updateAvatarItem(sender, widget, index, selectPos)
	local data = self._dataList[index]
	if data == nil then
		return
	end
	
	self._avatarPageItems = self._scrollPage:getPageItems()

	local petBaseId = data.cfg.id


	if self._avatarPageItems then
		local avatarItem = self._avatarPageItems[index]
		if avatarItem then
			local avatarCount = avatarItem:getChildrenCount()
			if avatarCount == 0 then
				local CSHelper = require("yoka.utils.CSHelper")
				local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
				avatar:setConvertType(TypeConvertHelper.TYPE_PET)
				avatar:updateUI(petBaseId,"_small")
				avatar:setScale(2)
				avatar:setPosition(cc.p(self._scrollPage:getPageSize().width / 2, self._scrollPage:getPageSize().height / 2 - 150))
				avatarItem:addChild(avatar)
			end
		end
	end
	

	if selectPos == index then
		if self._curSelectedPos ~= selectPos then
			self._value = petBaseId
			self._curSelectedPos = selectPos
			self:_updateUnitInfo(petBaseId)
		end
	end
end


return PopupPetDetail