--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法界面-研习模块
local TacticsConst = require("app.const.TacticsConst")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")

local TacticsStudyModule = class("TacticsStudyModule")

function TacticsStudyModule:ctor(parentView, target, studyCallback)
    self._parentView = parentView
    self._target = target
    self._onClickStudy = studyCallback

    self._nodeTitle = ccui.Helper:seekNodeByName(self._target, "_nodeTitle")
	cc.bind(self._nodeTitle, "CommonDetailTitleWithBg")
    self._nodeDesc = ccui.Helper:seekNodeByName(self._target, "Node_1")
    self._imgBtnBg = ccui.Helper:seekNodeByName(self._target, "_imgBtnBg")
    self._btnStudy = ccui.Helper:seekNodeByName(self._target, "_btnStudy")
	self._btnStudy:addClickEventListenerEx(handler(self, self._onButtonStudyClicked))
    
    self:init()
end

function TacticsStudyModule:init()
	self._nodeTitle:setFontSize(24)
    self._nodeTitle:setTitle(Lang.get("tactics_title_study"))
end

function TacticsStudyModule:updateInfo(tacticsUnitData)
    self._nodeDesc:removeAllChildren()
    local config = tacticsUnitData:getStudyConfig()
    local camp = config.camp
    local campStr = Lang.get("avatar_book_country_tab_" .. camp)
    
    local list = {}
    -- 消耗红色魏国武将熟练度+10%
    for i=1,3 do
        local color = config["color"..i]
        local proficiency = config["proficiency"..i]
        if color>0 and proficiency>0 then
            local colorStr = Lang.get("common_color_desc_" .. color)

            local richText = Lang.get("tactics_study_description", {
                color = colorStr,
                country = campStr,
                proficiency = proficiency/10
            })
            local label = ccui.RichText:createWithContent(richText)
            label:setPosition(cc.p(0, 0))
            self._nodeDesc:addChild(label)
            table.insert(list, label)
        end
    end
    local count = #list
    if count==1 then
        list[1]:setPositionY(-8)
    elseif count==2 then
        list[1]:setPositionY(10)
        list[2]:setPositionY(-20)
    else
        list[1]:setPositionY(22)
        list[2]:setPositionY(-8)
        list[3]:setPositionY(-38)
    end
end


function TacticsStudyModule:_onButtonStudyClicked()
	if self._onClickStudy then
		self._onClickStudy()
	end
end


function TacticsStudyModule:setVisible(visible)
    self._target:setVisible(visible)
end


return TacticsStudyModule
