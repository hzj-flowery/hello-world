--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法装配选择界面 列表项
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupChooseTacticsCell = class("PopupChooseTacticsCell", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper  = require("yoka.utils.UIHelper")
local ShaderHalper = require("app.utils.ShaderHelper")


function PopupChooseTacticsCell:ctor()
	local resource = {
		file = Path.getCSB("PopupChooseTacticsCell", "common"),
		binding = {
			_buttonChoose1 = {
				events = {{event = "touch", method = "_onButtonClicked1"}}
			},
			_buttonChoose2  = {
				events = {{event = "touch", method = "_onButtonClicked2"}}
			},
			_buttonChoose3  = {
				events = {{event = "touch", method = "_onButtonClicked3"}}
			},
		}
	}
	PopupChooseTacticsCell.super.ctor(self, resource)
end

function PopupChooseTacticsCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function PopupChooseTacticsCell:update(pos, slot, dataList, notSlot)
    self._pos = pos
    self._slot = slot
    self._dataList = dataList
    local function updateCell(index, id)
        if id then
            local data = G_UserData:getTactics():getUnitDataWithId(id)
			self["_item"..index]:setVisible(true)

			local baseId = data:getBase_id()

            self["_item"..index]:updateUI(TypeConvertHelper.TYPE_TACTICS, baseId)
            self["_item"..index]:getCommonIcon():setVisible(false)

            self["_fileIcon"..index]:updateUI(baseId)

			self["_item"..index]:setTouchEnabled(true)
            
            local heroId = data:getHero_id()
            if heroId>0 then
                local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
                local heroBaseId = heroUnitData:getBase_id()
                local limitLevel = heroUnitData:getLimit_level()
                local limitRedLevel = heroUnitData:getLimit_rtg()
                local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, nil, nil, limitLevel, limitRedLevel)
                if heroUnitData:isLeader() then
                    self["_textHeroName"..index]:setString(Lang.get("main_role"))
                else
                    self["_textHeroName"..index]:setString(heroParam.name)
                end
				self["_textHeroName"..index]:setColor(heroParam.icon_color)
				self["_textHeroName"..index]:setVisible(true)
                UIHelper.updateTextOutline(self["_textHeroName"..index], heroParam)
			else
				self["_textHeroName"..index]:setVisible(false)
            end
            
            local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
            local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
            local heroBaseId = heroUnitData:getAvatarToHeroBaseId()
            local isEffect = G_UserData:getTactics():isSuitTacticsToHero(baseId, heroBaseId)
            local isEffective = require("app.utils.data.TacticsDataHelper").isEffectiveTacticsToHero(data:getBase_id(), pos)
            if isEffect and isEffective then
                self["_imgTip"..index]:setVisible(false)
                self["_txtTip"..index]:setVisible(false)
                ShaderHalper.filterNode(self["_fileIcon"..index], "", true)
                ShaderHalper.filterNode(self["_imgBg"..index], "", true)
            else
                self["_imgTip"..index]:setVisible(true)
                self["_txtTip"..index]:setVisible(true)
                self["_txtTip"..index]:setString(Lang.get("tactics_suit_not"))
                self["_txtTip"..index]:setColor(Colors.RED)
                
                ShaderHalper.filterNode(self["_fileIcon"..index], "gray")
                ShaderHalper.filterNode(self["_imgBg"..index], "gray")
            end

            self:_updateButton(index)
		else
			self["_item"..index]:setVisible(false)
		end
	end

    for i=1,3 do
        updateCell(i, dataList[i])
    end
end

function PopupChooseTacticsCell:_updateButton(index)
    local pos = self._pos
    local slot = self._slot
    local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
    -- local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)

    -- local tacticsId = G_UserData:getBattleResource():getResourceId(pos, 5, slot)
    -- local tacticsUnitData = nil
    -- if tacticsId and tacticsId>0 then
    --     tacticsUnitData = G_UserData:getTactics():getUnitDataWithId(tacticsId)
    -- end

    local id = self._dataList[index]
    local unitData = G_UserData:getTactics():getUnitDataWithId(id)
    if unitData:getHero_id()==0 then        -- 未装备
        self["_buttonChoose"..index]:setString(Lang.get("tactics_choose_puton"))    -- 装备
        self["_buttonChoose"..index]:switchToNormal()
    elseif unitData:getHero_id()==heroId then   -- 当前武将
        self["_buttonChoose"..index]:setString(Lang.get("tactics_choose_unload"))        -- 卸载
        self["_buttonChoose"..index]:switchToHightLight()
    else 
        self["_buttonChoose"..index]:setString(Lang.get("equipment_btn_grab"))        -- 抢来穿
        self["_buttonChoose"..index]:switchToNormal()
    end
end

function PopupChooseTacticsCell:_onButtonClicked1()
	self:dispatchCustomCallback(1)
end

function PopupChooseTacticsCell:_onButtonClicked2()
	self:dispatchCustomCallback(2)
end

function PopupChooseTacticsCell:_onButtonClicked3()
	self:dispatchCustomCallback(3)
end

return PopupChooseTacticsCell