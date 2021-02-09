local PopupBase = require("app.ui.PopupBase")
local PopupAttrStatistics = class("PopupAttrStatistics", PopupBase)
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local TextHelper = require("app.utils.TextHelper")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
local PetDataHelper = require("app.utils.data.PetDataHelper")

local TYPE_1 = 1 --算战力的属性
local TYPE_2 = 2 --不算战力的属性
local TYPE_3 = 3 --假战力

function PopupAttrStatistics:ctor(heroUnitData)
	self._heroUnitData = heroUnitData
	local resource = {
		file = Path.getCSB("PopupAttrStatistics", "uicontrol"),
		size = {1136, 640},
		binding = {
			_btnClose = {
                events = {{event = "touch", method = "_onClickCancelButton"}}
            },
            _buttonExport = {
            	events = {{event = "touch", method = "_onClickExport"}}
            },
            _buttonShowDetail = {
            	events = {{event = "touch", method = "_onClickShowDetail"}}
            },
		}
	}
	PopupAttrStatistics.super.ctor(self, resource)
end

function PopupAttrStatistics:onCreate()
	self._strExport = "" --需要导出的字符串
	self._buttonExport:setString("导出")
	self._buttonShowDetail:setString("详情")
	self._isShowDetail = false

	self._attrInPower = {} --算战力的属性
	self._attrOutPower = {} --不算战力的属性
	self._attrfakePower = {} --假战力
	self._attrAll = {} --总属性
	self._allDetail = {}

	self:_updateData()
	self:_updateView()
	self:_switchDetail()
end

function PopupAttrStatistics:_updateData()
	local heroUnitData = self._heroUnitData
	local tempRank = 0
	local level = heroUnitData:getLevel()
	local rank = heroUnitData:getRank_lv() + tempRank

	local allInfo = {}

	local attr1 = HeroDataHelper.getBasicAttrWithLevel(heroUnitData:getConfig(), level)
	local unit1 = {attr = attr1, type = TYPE_1, name = "武将升级"}
	table.insert(allInfo, unit1)

	local attr2 = HeroDataHelper.getBreakAttr(heroUnitData, tempRank)
	local unit2 = {attr = attr2, type = TYPE_1, name = "武将突破"}
	table.insert(allInfo, unit2)

	local attr3 = HeroDataHelper.getLimitAttr(heroUnitData)
	local unit3 = {attr = attr3, type = TYPE_1, name = "武将界限"}
	table.insert(allInfo, unit3)

	local attr4 = HeroDataHelper.getAwakeAttr(heroUnitData)
	local unit4 = {attr = attr4, type = TYPE_1, name = "武将觉醒"}
	table.insert(allInfo, unit4)

	local attr5 = HeroDataHelper.getEquipAttr(heroUnitData:getPos())
	local unit5 = {attr = attr5, type = TYPE_1, name = "装备属性"}
	table.insert(allInfo, unit5)

	local attr6 = HeroDataHelper.getTreasureAttr(heroUnitData:getPos())
	local unit6 = {attr = attr6, type = TYPE_1, name = "宝物属性"}
	table.insert(allInfo, unit6)

	local attr7 = HeroDataHelper.getInstrumentAttr(heroUnitData:getPos())
	local unit7 = {attr = attr7, type = TYPE_1, name = "神兵属性"}
	table.insert(allInfo, unit7)

	local attr8 = HeroDataHelper.getMasterAttr(heroUnitData:getPos())
	local unit8 = {attr = attr8, type = TYPE_1, name = "大师属性"}
	table.insert(allInfo, unit8)

	local attr9 = HeroDataHelper.getOfficialAttr(G_UserData:getBase():getOfficialLevel())
	local unit9 = {attr = attr9, type = TYPE_2, name = "官衔属性"}
	table.insert(allInfo, unit9)

	local attr10 = HeroDataHelper.getKarmaAttrRatio(heroUnitData:getConfig())
	local unit10 = {attr = attr10, type = TYPE_1, name = "名将册属性"}
	table.insert(allInfo, unit10)

	local attr11 = HeroDataHelper.getYokeAttrRatio(heroUnitData)
	local unit11 = {attr = attr11, type = TYPE_1, name = "羁绊属性"}
	table.insert(allInfo, unit11)

	local attr12 = HeroDataHelper.getTalentAttr(heroUnitData, rank)
	local unit12 = {attr = attr12, type = TYPE_2, name = "天赋属性"}
	table.insert(allInfo, unit12)

	local attr13 = HeroDataHelper.getInstrumentTalentAttr(heroUnitData:getPos())
	local unit13 = {attr = attr13, type = TYPE_1, name = "神兵天赋属性"}
	table.insert(allInfo, unit13)

	local attr14 = HeroDataHelper.getAwakeTalentAttr(heroUnitData)
	local unit14 = {attr = attr14, type = TYPE_1, name = "觉醒天赋属性"}
	table.insert(allInfo, unit14)

	local attr15 = HeroDataHelper.getAvatarAttr(heroUnitData)
	local unit15 = {attr = attr15, type = TYPE_2, name = "变身卡属性"}
	table.insert(allInfo, unit15)

	local attr16 = HeroDataHelper.getAvatarShowAttr(heroUnitData)
	local unit16 = {attr = attr16, type = TYPE_2, name = "变身卡图鉴属性"}
	table.insert(allInfo, unit16)

	local attr17 = PetDataHelper.getPetHelpAttr(true)
	local unit17 = {attr = attr17, type = TYPE_1, name = "神兽护佑属性"}
	table.insert(allInfo, unit17)

	local attr18 = PetDataHelper.getPetMapAttr()
	local unit18 = {attr = attr18, type = TYPE_2, name = "神兽图鉴属性"}
	table.insert(allInfo, unit18)

	local attr19 = HeroDataHelper.getSilkbagAttr(heroUnitData)
	local unit19 = {attr = attr19, type = TYPE_2, name = "锦囊属性"}
	table.insert(allInfo, unit19)

	local attr20 = HomelandHelp.getHomelandAttr()
	local unit20 = {attr = attr20, type = TYPE_2, name = "家园属性"}
	table.insert(allInfo, unit20)

	local attr21 = HeroDataHelper.getHaloAttr(heroUnitData, rank)
	local unit21 = {attr = attr21, type = TYPE_1, name = "光环属性"}
	table.insert(allInfo, unit21)

	local attr22 = HeroDataHelper.getOfficialPower(G_UserData:getBase():getOfficialLevel())
	local unit22 = {attr = attr22, type = TYPE_3, name = "官衔假战力"}
	table.insert(allInfo, unit22)

	local attr23 = HeroDataHelper.getTalentPower(heroUnitData, tempRank)
	local unit23 = {attr = attr23, type = TYPE_3, name = "天赋假战力"}
	table.insert(allInfo, unit23)

	local attr24 = HeroDataHelper.getAvatarPower(heroUnitData)
	local unit24 = {attr = attr24, type = TYPE_3, name = "变身卡假战力"}
	table.insert(allInfo, unit24)

	local attr25 = HeroDataHelper.getAvatarShowPower(heroUnitData)
	local unit25 = {attr = attr25, type = TYPE_3, name = "变身卡图鉴假战力"}
	table.insert(allInfo, unit25)

	local attr26 = PetDataHelper.getPetMapPower()
	local unit26 = {attr = attr26, type = TYPE_3, name = "神兽图鉴假战力"}
	table.insert(allInfo, unit26)

	local attr27 = HeroDataHelper.getSilkbagPower(heroUnitData)
	local unit27 = {attr = attr27, type = TYPE_3, name = "锦囊假战力"}
	table.insert(allInfo, unit27)

	local attr28 = HeroDataHelper.getHomelandPower()
	local unit28 = {attr = attr28, type = TYPE_3, name = "家园假战力"}
	table.insert(allInfo, unit28)

	self._attrInPower = {} --算战力的属性
	self._attrOutPower = {} --不算战力的属性
	self._attrfakePower = {} --假战力
	self._attrAll = {} --总属性
	self._allDetail = allInfo

	for i, unit in ipairs(allInfo) do
		if unit.type == TYPE_1 then
			AttrDataHelper.appendAttr(self._attrInPower, unit.attr)
			AttrDataHelper.appendAttr(self._attrAll, unit.attr)
		elseif unit.type == TYPE_2 then
			AttrDataHelper.appendAttr(self._attrOutPower, unit.attr)
			AttrDataHelper.appendAttr(self._attrAll, unit.attr)
		elseif unit.type == TYPE_3 then
			AttrDataHelper.appendAttr(self._attrfakePower, unit.attr)
		end
	end
end

function PopupAttrStatistics:_updateView()
	local des1 = "\n[算战力的属性]：\n\n"
	local des2 = "\n[不算战力的属性]：\n\n"
	local des3 = "\n[假战力]：\n\n"
	local des4 = "\n[总属性]：\n\n"
	local des5 = "[计算公式]：\n\n"

	local str1 = des1..self:_formatAttr(self._attrInPower, 1)
	local str2 = des2..self:_formatAttr(self._attrOutPower, 2)
	local str3 = des3..self:_formatAttr(self._attrfakePower, 3)
	local str4 = des4..self:_formatAttr(self._attrAll, 4)

	local param = {heroUnitData = self._heroUnitData}
	local attr = HeroDataHelper.getHeroPowerBaseAttr(param)
	AttrDataHelper.processDefAndAddition(attr)
	local formula = AttrDataHelper.getPowerFormula(attr)
	local power = AttrDataHelper.calPower(formula)
	local str5 = des5..formula.." = "..power

	self._text1:setString(str1)
	self._text2:setString(str2)
	self._text3:setString(str3)
	self._text4:setString(str4)
	self._text5:setString(str5)

	local strSplit = "\n\n------------------\n"
	self._strExport = str1..strSplit..str2..strSplit..str3..strSplit..str4..strSplit..str5


	--详情
	local strDetail = "\n  [各部分详情]\n\n"
	for i, info in ipairs(self._allDetail) do
		local attr = info.attr
		local name = info.name
		local des = "\n  ["..name.."]\n"
		for k, v in pairs(attr) do
			local attrName, attrValue = TextHelper.getAttrBasicText(k, v)
			des = des.."  "..attrName.." +"..attrValue.."\n"
		end
		strDetail = strDetail..des
	end
	self._textDetail:setString(strDetail)
end

function PopupAttrStatistics:_formatAttr(attr, index)
	local Config = require("app.config.attribute")

	local function sortFun(a, b) --排序
        return a.order2 < b.order2
    end

    --是否在此Index部分
    local function isInPart(index, order2)
    	if index == 1 then
    		return order2 >= 100 and order2 <= 199
    	elseif index == 2 then
    		return order2 >= 100 and order2 <= 199
    	elseif index == 3 then
    		return order2 >= 200 and order2 <= 299
    	elseif index == 4 then
    		return order2 > 0
    	end
    end

	local des = ""
	local infos = {}
	local len = Config.length()
	for i = 1, len do
		local info = Config.indexOf(i)
		table.insert(infos, info)
	end
	table.sort(infos, sortFun)

	for i, info in ipairs(infos) do
		local id = info.id
		local value = attr[id] or 0
		local attrName, attrValue = TextHelper.getAttrBasicText(id, value)
		local order2 = info.order2
		if isInPart(index, order2) then
			des = des..attrName.." +"..attrValue.."\n"
		end
	end

    return des
end

function PopupAttrStatistics:_onClickCancelButton()
    self:close()
end

function PopupAttrStatistics:_onClickExport()
	G_StorageManager:saveString("attr_statistics.lua", self._strExport)
end

function PopupAttrStatistics:_onClickShowDetail()
	self._isShowDetail = not self._isShowDetail
	self:_switchDetail()
end

function PopupAttrStatistics:_switchDetail()
	self._listViewDetail:setVisible(self._isShowDetail)
end

return PopupAttrStatistics