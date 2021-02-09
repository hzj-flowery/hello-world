--
-- Author: Liangxu
-- Date: 2018-8-29
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HorseDetailAttrNode = class("HorseDetailAttrNode", ListViewCellBase)
local HorseDataHelper = require("app.utils.data.HorseDataHelper")
local TextHelper = require("app.utils.TextHelper")
local AttributeConst = require("app.const.AttributeConst")
local RedPointHelper = require("app.data.RedPointHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UIConst = require("app.const.UIConst")
local FunctionConst = require("app.const.FunctionConst")
local AttributeConst = require("app.const.AttributeConst")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIHelper = require("yoka.utils.UIHelper")

local RECORD_ATTR_LIST = {	
	{AttributeConst.ATK, "_nodeAttr1"},
	{AttributeConst.HP, "_nodeAttr2"},
	{AttributeConst.PD, "_nodeAttr3"},
	{AttributeConst.MD, "_nodeAttr4"},
	{AttributeConst.CRIT, nil},
	{AttributeConst.NO_CRIT, "_nodeAttr5"},
	{AttributeConst.HIT, "_nodeAttr6"},
	{AttributeConst.NO_HIT, nil},
	{AttributeConst.HURT, nil},
	{AttributeConst.HURT_RED, nil},
}

local ATTR_MAP = {
    1,2,3,4,6,7
}

function HorseDetailAttrNode:ctor(horseData, rangeType, recordAttr)
	self._horseData = horseData
    self._rangeType = rangeType

    if recordAttr then
        self._recordAttr = recordAttr
    else
        self._recordAttr = G_UserData:getAttr():createRecordData(self._horseData:getId())
        local attrInfo = HorseDataHelper.getHorseAttrInfo(self._horseData)    
        self._recordAttr:updateData(attrInfo)
    end

	local resource = {
		file = Path.getCSB("HorseDetailAttrNode", "horse"),
		binding = {
			_buttonUpStar = {
				events = {{event = "touch", method = "_onButtonUpStarClicked"}}
			},
		},
	}
    HorseDetailAttrNode.super.ctor(self, resource)
    
    G_UserData:getAttr():recordPowerWithKey(FunctionConst.FUNC_TEAM)
end

function HorseDetailAttrNode:onCreate()
	local contentSize = self._panelBg:getContentSize()
	local posY = self._nodeCommon:getPositionY()
	if self._horseData:isUser() == false then
		contentSize.height = contentSize.height - 65
		posY = posY - 65
	end
	self:setContentSize(contentSize)
	self._panelBg:setContentSize(contentSize)
	self._nodeTitle:setFontSize(24)
	self._nodeTitle:setTitle(Lang.get("horse_detail_title_attr"))
	self._buttonUpStar:setString(Lang.get("horse_btn_advance"))

	self:_updateAttrDes()
	self._nodeCommon:setPositionY(posY)

	self._buttonUpStar:setVisible(self._horseData:isUser())
	if self._horseData:isUser() then
		local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_TRAIN, "slotRP", self._horseData)
		self._buttonUpStar:showRedPoint(reach)
	end
end

function HorseDetailAttrNode:_updateAttrDes(recordAttr)
    recordAttr = recordAttr or self._recordAttr

    logWarn("战马属性信息")
    dump(recordAttr:getAttr())

    local index = 0
    for i = 1, 6 do
        local attrId = RECORD_ATTR_LIST[ATTR_MAP[i]][1]
        local value = recordAttr:getCurValue(attrId)
        logWarn("attrId = "..tostring(attrId)..", value = "..tostring(value))
        if value and value ~= 0 then
			self["_nodeAttr"..i]:updateView(attrId, value, nil, 4)
			self["_nodeAttr"..i]:setVisible(true)
		else
			self["_nodeAttr"..i]:setVisible(false)
		end
    end
end

function HorseDetailAttrNode:_onButtonUpStarClicked()
	local isOpen, des = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HORSE_TRAIN)
	if not isOpen then
		G_Prompt:showTip(des)
		return
	end

	local horseId = self._horseData:getId()
	G_SceneManager:showScene("horseTrain", horseId, self._rangeType, true)
end

function HorseDetailAttrNode:_updateBaseAttr()
    -- 记录属性
    local attrInfo = HorseDataHelper.getHorseAttrInfo(self._horseData)    
    self._recordAttr:updateData(attrInfo)
end

--穿上/脱下战马装备后，有战力变化
function HorseDetailAttrNode:playBaseAttrPromptSummary(recordAttr,refresh)
    if not self._horseData:isInBattle() or refresh then
        -- 战马不上阵，不用做战力变化动画
        -- 刷新战马当前的属性
        self:_updateAttrDes(recordAttr)
        return
    end

	local summary = {}
	self:_addBaseAttrPromptSummary(summary,recordAttr)
    G_Prompt:showSummary(summary)
    
    if #summary > 0 then
        G_UserData:getAttr():recordPowerWithKey(FunctionConst.FUNC_TEAM)
        G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5)
    end
end

--加入基础属性飘字内容
function HorseDetailAttrNode:_addBaseAttrPromptSummary(summary,recordAttr)
    local size = G_ResolutionManager:getDesignSize()
	for i, one in ipairs(RECORD_ATTR_LIST) do
		local attrId = one[1]
		local dstNodeName = one[2]
        local diffValue = recordAttr:getDiffValue(attrId)

        if diffValue and diffValue ~= 0 then
            local pos = cc.p(0,0)
            if self[dstNodeName] then
                pos = cc.p(self[dstNodeName]:getPosition())
            end
			local param = {
				content = AttrDataHelper.getPromptContent(attrId, diffValue),
				anchorPoint = cc.p(0, 0.5),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM+UIConst.SUMMARY_OFFSET_X_ATTR},
                dstPosition = cc.p(pos.x + size[1]/2,pos.y + size[2]/2),
				finishCallback = function()
                    if attrId and dstNodeName then
                        if recordAttr and self[dstNodeName] then
                            local curValue = recordAttr:getCurValue(attrId)
                            self[dstNodeName]:getSubNodeByName("TextValue"):updateTxtValue(curValue)
                        end
					end
				end,
            }

			table.insert(summary, param)
		end
    end

	return summary
end

return HorseDetailAttrNode