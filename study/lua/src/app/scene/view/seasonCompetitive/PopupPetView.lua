-- @Author panhoa
-- @Date 11.05.2018
-- @Role 

local PopupBase = require("app.ui.PopupBase")
local PopupPetView = class("PopupPetView", PopupBase)
local TabScrollView = require("app.utils.TabScrollView")
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonPetIcon = require("app.scene.view.seasonCompetitive.SeasonPetIcon")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")

function PopupPetView:ctor(pickCallback, closeCallback)
    self._scrollView    = nil
    self._contentView   = nil
    self._panelTouch    = nil
    self._btnClose      = nil
    self._petListData   = nil   -- 可用神兽
    self._syncEquipedPet= nil
    self._curPetSlot    = 0

    self._pickCallback  = pickCallback 
    self._closeCallback = closeCallback
    local resource = {
		file = Path.getCSB("PopupPetView", "seasonCompetitive"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onCloseView"}}
            },
            _btnClose = {
				events = {{event = "touch", method = "_onCloseView"}}
            },
		}
    }
    self:setName("PopupPetView")
	PopupPetView.super.ctor(self, resource, false, true)
end

function PopupPetView:onCreate()
    self:_initListView()

	local size = G_ResolutionManager:getDesignCCSize()
	self._panelTouch:setContentSize(size)
end

function PopupPetView:onEnter()
    self._petListData = G_UserData:getSeasonSport():getPetListInfo()
    self:_updateListView()
end

function PopupPetView:onExit()
end

function PopupPetView:_onCloseView()
    if self._closeCallback then
        self._closeCallback()
    end
	self:close()
end

function PopupPetView:setCurPetData(curPetSlot, data)
    self._curPetSlot = curPetSlot
    self._syncEquipedPet = data
end

-- @Role    查看是否存在
function PopupPetView:_isExistPetInCur(petId)
    for index = 1, #self._syncEquipedPet do
        if self._syncEquipedPet[index].petId == petId then
            return true
        end
    end
    return false
end

function PopupPetView:_initListView()
	local scrollViewParam = {}
	scrollViewParam.template = SeasonPetIcon
	scrollViewParam.updateFunc = handler(self, self._onCellUpdate)
	scrollViewParam.selectFunc = handler(self, self._onCellSelected)
	scrollViewParam.touchFunc = handler(self, self._onItemTouch)
	self._contentView = TabScrollView.new(self._scrollView, scrollViewParam, 1)
end

function PopupPetView:_updateListView()
    if not self._petListData or table.nums(self._petListData) <= 0 then
        return
    end
    
	local lineCount = math.ceil(table.nums(self._petListData)/4)
	self._contentView:updateListView(1, lineCount)
end

function PopupPetView:_isExistBanedPet(petId)
    -- body
    if type(petId) ~= "number" then
        return false
    end
    local banedPets = G_UserData:getSeasonSport():getBanPets() or {}
    for key, value in pairs(banedPets) do
        if value == petId then
            return true
        end
    end
    return false
end

function PopupPetView:_onCellUpdate(cell, cellIndex)
    if not self._petListData or table.nums(self._petListData) <= 0 then
        return
    end

    local cellStartIdx = (cellIndex * 4 + 1)
    local cellEndIdx = (cellIndex * 4 + 4)

    local cellData = {}
    for index = cellStartIdx, cellEndIdx do
        local data = self._petListData[index]
        if data and data.cfg ~= nil then
            local itemData = data.cfg
            itemData.isExist = self:_isExistPetInCur(itemData.id)
            itemData.isBaned = self:_isExistBanedPet(itemData.id)
            table.insert(cellData, itemData)
        end
    end
    cell:updateUI(cellData)
end

function PopupPetView:_onCellSelected(cell, index)
end

-- @Role 	Item Touch
function PopupPetView:_onItemTouch(index, itemPos)
    local function isExistAdded(baseId)
        for index = 1, #self._syncEquipedPet do
			if self._syncEquipedPet[index].petId == baseId then
				if self._curPetSlot ~= index then
					return true
				end
			end
        end
        return false
    end

    -- 不替换则不关闭
    if isExistAdded(itemPos) then
        return
    end
    if self._pickCallback then
        self._pickCallback(itemPos)
    end
    self:_updateListView()

    if self._closeCallback then
        self._closeCallback()
    end
    self:close()
end



return PopupPetView