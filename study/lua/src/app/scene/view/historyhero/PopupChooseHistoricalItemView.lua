-- @Author panhoa
-- @Date 12.27 2018
-- @Role 

local PopupBase = require("app.ui.PopupBase")
local PopupChooseHistoricalItemView = class("PopupChooseHistoricalItemView", PopupBase)
local TabScrollView = require("app.utils.TabScrollView")
local HistoryHeroConst = require("app.const.HistoryHeroConst")
local HistoricalItemCell = require("app.scene.view.historyhero.HistoricalItemCell")


function PopupChooseHistoricalItemView:ctor(type, chooseData, okCallback)
    self._panelTouch        = nil
    self._scrollView        = nil
    self._listView          = nil
    self._type              = type
    self._chooseData        = chooseData
    self._okCallback        = okCallback
    self._curData           = {}
    self._allList           = {}
    self._noWearList        = {}

    local resource = {
		file = Path.getCSB("PopupChooseHistoricalItemView", "historyhero"),
    }

	PopupChooseHistoricalItemView.super.ctor(self, resource, false, false)
end

function PopupChooseHistoricalItemView:onCreate()
	local size = G_ResolutionManager:getDesignCCSize()
    self._panelTouch:setContentSize(size)

    self:_initTitle()
    self:_initListView()

	self._hideWear = G_UserData:getUserSetting():getHideWearHistoryHero()
    self._checkBox:addEventListener(handler(self, self._onCheckBoxClicked))
	self._checkBox:setSelected(self._hideWear)
end

function PopupChooseHistoricalItemView:onEnter()
    self:_updateListView()
end

function PopupChooseHistoricalItemView:onExit()
end

function PopupChooseHistoricalItemView:_onButtonClose()
	self:close()
end

-- @Role    
function PopupChooseHistoricalItemView:_initTitle()
    if HistoryHeroConst.TAB_TYPE_HERO == self._type then
        if self._chooseData then
            self._commonNodeBk:setTitle(Lang.get("historyhero_title_replace"))
        else
            self._commonNodeBk:setTitle(Lang.get("historyhero_equip"))
        end
    elseif HistoryHeroConst.TAB_TYPE_REBORN == self._type then
        self._commonNodeBk:setTitle(Lang.get("historyhero_reborn"))
    else
        self._commonNodeBk:setTitle(Lang.get("historyhero_awake_poptitle"))
    end
    self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
end

-- @Role   
function PopupChooseHistoricalItemView:_initListView()
	local scrollViewParam = {
        template = HistoricalItemCell,
        updateFunc = handler(self, self._onCellUpdate),
        selectFunc = handler(self, self._onCellSelected),
        touchFunc = handler(self, self._onItemTouch),
    }
	self._scrollView = TabScrollView.new(self._listView, scrollViewParam, 1)
end

-- @Role    Get CellData
function PopupChooseHistoricalItemView:_initItemData()
    if HistoryHeroConst.TAB_TYPE_AWAKE == self._type then
        self._curData = G_UserData:getHistoryHero():getWeaponList()
    elseif HistoryHeroConst.TAB_TYPE_REBORN == self._type then
        self._curData = G_UserData:getHistoryHero():getCanRebornHisoricalHero()
    elseif HistoryHeroConst.TAB_TYPE_BREAK == self._type or HistoryHeroConst.TAB_TYPE_HERO == self._type then
        self._allList = G_UserData:getHistoryHero():getHeroList()
        self._noWearList = G_UserData:getHistoryHero():getNotInFormationList()
        if self._chooseData then
            --替换需要显示自己
            table.insert(self._noWearList, self._chooseData)
        end
    end
end

function PopupChooseHistoricalItemView:_sortData()
    if #self._curData <= 1 then
        return
    end


    local tmpList = {}
    for i, v in pairs(self._curData) do
        if self._chooseData then 
            local weight = 0
            local onFormation = 0
            if self._chooseData:getId() == v:getId() then
                weight = 100 --替换排第一
            end
            if v:isOnFormation() then
                onFormation = 1
            end
            table.insert(tmpList, {data = v, weight = weight, onFormation = onFormation})
        else
            local onFormation = 0
            if v:isOnFormation() then
                onFormation = 1
            end
            table.insert(tmpList, {data = v, weight = 0, onFormation = onFormation})
        end
    end
    
    local sortFunc = function(a, b)
        if a.weight ~= b.weight then
            return  a.weight > b.weight --替换的本体排第一
        elseif a.onFormation ~= b.onFormation then
            return a.onFormation == 0 --已经上阵的排后面
        elseif a.data:isEquiped() ~= b.data:isEquiped() then
			return a.data:isEquiped() == true --装备的排在前面
		elseif a.data:getConfig().color ~= b.data:getConfig().color then
			return a.data:getConfig().color > b.data:getConfig().color --橙色排前面
		elseif a.data:getBreak_through() ~= b.data:getBreak_through() then
			return a.data:getBreak_through() > b.data:getBreak_through() --等级高
		else
			return a.data:getId() < b.data:getId()
		end
	end
	
    table.sort(tmpList, sortFunc)

    local result = {}
	for type, data in pairs(tmpList) do
		table.insert(result, data.data)
    end
    self._curData = result
end

-- @Role
function PopupChooseHistoricalItemView:_onCellUpdate(cell, index)
    if self._curData == nil or next(self._curData) == nil then
        return
    end

    local curCellIndex = (index * 2)
    local data = {}
    if HistoryHeroConst.TAB_TYPE_HERO == self._type then                        -- 0. 名将
        --body
        local bCanSelect1 = false
        local bCanSelect2 = false
        if #self._curData >= (curCellIndex + 1) then
            if self._chooseData and self._curData[curCellIndex + 1]:getSystem_id() == self._chooseData:getSystem_id() then
                bCanSelect1 = true
            else
                bCanSelect1 = not self._curData[curCellIndex + 1]:isOnFormation()
            end
        end
        if #self._curData >= (curCellIndex + 2) then
            if self._chooseData and self._curData[curCellIndex + 2]:getSystem_id() == self._chooseData:getSystem_id() then
                bCanSelect2 = true
            else
                bCanSelect2 = not self._curData[curCellIndex + 2]:isOnFormation()
            end
        end
        local itemData1 = {
            cfg = (#self._curData >= (curCellIndex + 1) and self._curData[curCellIndex + 1] or nil),
            canSelect = bCanSelect1,  
            isDown = self._chooseData and index == 0
        }
        table.insert(data, itemData1)
        local itemData2 = {
            cfg = (#self._curData >= (curCellIndex + 2) and self._curData[curCellIndex + 2] or nil),
            canSelect = bCanSelect2,
            isDown = false
        }

        table.insert(data, itemData2)
        cell:setBtnType(self._chooseData and HistoricalItemCell.BTN_TYPE_REPLACE_FORMATION or HistoricalItemCell.BTN_TYPE_ADD_FORMATION)
    elseif HistoryHeroConst.TAB_TYPE_AWAKE == self._type then                   -- 1. 觉醒
        --body
        local itemData1 = {
            cfg = nil,
            canSelect = false,
        }
        local itemData2 = {
            cfg = nil,
            canSelect = false,
        }
        local i = 0
        for k,v in pairs(self._curData) do
            i = (i + 1)
            if i == (curCellIndex + 1) then
                itemData1 = {
                    cfg = v,
                    canSelect = (self._chooseData.value == v:getId()),
                }
               
            elseif i == (curCellIndex + 2) then
                itemData2 = {
                    cfg = v,
                    canSelect = (self._chooseData.value == v:getId()),
                }
            end
        end
        table.insert(data, itemData1)
        table.insert(data, itemData2)
        cell:setBtnType(self._chooseData and HistoricalItemCell.BTN_TYPE_REPLACE_FORMATION or HistoricalItemCell.BTN_TYPE_ADD_FORMATION)
    elseif HistoryHeroConst.TAB_TYPE_BREAK == self._type then                  -- 2. 突破
        --body
        local itemData1 = {
            cfg = nil,
            canSelect = false,
        }
        itemData1.cfg = (#self._curData >= (curCellIndex + 1) and self._curData[curCellIndex + 1] or nil)
        if self._curData[curCellIndex + 1] ~= nil then
            local bEquiped,_ = G_UserData:getHistoryHero():isStarEquiped(self._curData[curCellIndex + 1]:getId())
            local bCurHero = (self._curData[curCellIndex + 1]:getSystem_id() == self._chooseData.value 
                                and self._curData[curCellIndex + 1]:getBreak_through() == HistoryHeroConst.TAB_TYPE_AWAKE)
            itemData1.canSelect = ((not bEquiped) and bCurHero)
        end
        table.insert(data, itemData1)
     
        local itemData2 = {
            cfg = nil,
            canSelect = false
        }
        itemData2.cfg = (#self._curData >= (curCellIndex + 2) and self._curData[curCellIndex + 2] or nil)
        if self._curData[curCellIndex + 2] ~= nil then
            local bEquiped,_ = G_UserData:getHistoryHero():isStarEquiped(self._curData[curCellIndex + 2]:getId())
            local bCurHero = (self._curData[curCellIndex + 2]:getSystem_id() == self._chooseData.value
                                and self._curData[curCellIndex + 2]:getBreak_through() == HistoryHeroConst.TAB_TYPE_AWAKE)
            itemData2.canSelect = ((not bEquiped) and bCurHero)
        end
        table.insert(data, itemData2)
        cell:setBtnType(self._chooseData and HistoricalItemCell.BTN_TYPE_REPLACE_FORMATION or HistoricalItemCell.BTN_TYPE_ADD_FORMATION)
    elseif HistoryHeroConst.TAB_TYPE_REBORN == self._type then                  -- 2. 重生
        local itemData1 = {
            cfg = (#self._curData >= (curCellIndex + 1) and self._curData[curCellIndex + 1] or nil),
            canSelect = true,
        }

        local itemData2 = {
            cfg = (#self._curData >= (curCellIndex + 2) and self._curData[curCellIndex + 2] or nil),
            canSelect = true,
        }
        table.insert(data, itemData1)
        table.insert(data, itemData2)
        cell:setBtnType(HistoricalItemCell.BTN_TYPE_REBORN)
    end

    cell:synchroType(self._type)
    cell:updateUI(data)
end

function PopupChooseHistoricalItemView:_onCellSelected(cell, index)
end

--@Role     Touch CallBack
function PopupChooseHistoricalItemView:_onItemTouch(index, data)
    local itemId = data.cfg:getId()
    if itemId == nil then
        self:close()
        return
    end

    if self._okCallback then
        if data.isDown then
            --下阵
            self._okCallback(0)
        else
            self._okCallback(itemId)
        end
    end
    self:close()
end

function PopupChooseHistoricalItemView:_refreshList()
    if self._hideWear then
        self._curData = self._noWearList
    else
        self._curData = self._allList
    end
    self:_sortData()

	self._listView:clearAll()
	self._count = math.ceil(#self._curData / 2)
	self._listView:resize(self._count)
end

-- @Role    UpdateUI
function PopupChooseHistoricalItemView:_updateListView()
    self:_initItemData()
    self:_refreshList()
    if self._curData == nil or next(self._curData) == nil then
        return
    end
	self._scrollView:updateListView(1, math.ceil(table.nums(self._curData) / 2))
end

function PopupChooseHistoricalItemView:_onCheckBoxClicked(sender)
	self._hideWear = self._checkBox:isSelected()
	G_UserData:getUserSetting():setHideWearHistoryHero(self._hideWear)
	self:_refreshList()
end



return PopupChooseHistoricalItemView