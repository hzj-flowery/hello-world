
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupArenaAwardCell = class("PopupArenaAwardCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function PopupArenaAwardCell:ctor()
	self._btnGetAward 		= nil     --领取
	self._imageGetAward 	= nil 	  --已经领取
	self._textCondition 	= nil  	  --条件
	self._scrollView 		= nil     --奖励列表
	self._commonIcon1		= nil	  --通用ICON1
	self._commonIcon2		= nil	  --通用ICON2
	self._commonIcon3		= nil	  --通用ICON3
	self._awardInfo			= nil

	local resource = {
		file = Path.getCSB("PopupArenaAwardCell", "arena"),
	}
	PopupArenaAwardCell.super.ctor(self, resource)
end

function PopupArenaAwardCell:onCreate()

	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._btnGetAward:addClickEventListenerEx(handler(self,self._onButtonClick))
end


--
function PopupArenaAwardCell:updateUI(index,cellValue)
	self._imageGetAward:setVisible(false)
	self._btnGetAward:setVisible(false)
	self._textCondition:setVisible(false)
	if cellValue.isReach == true and cellValue.isTaken == true then
		self._imageGetAward:setVisible(true)
	else
		self._btnGetAward:setVisible(true)
		self._btnGetAward:setString(cellValue.isReach and Lang.get("arena_reward_btn_take") 
			or  Lang.get("arena_reward_btn_unreach") )	
		self._btnGetAward:setEnabled(cellValue.isReach)
	end

	

	--if cellValue.isReach == false and cellValue.isTaken == false then
	self._textCondition:setVisible(true)
	self._textCondition:setString(Lang.get("arena_reward_rank_condition",{rank = cellValue.cfg.rank_min}))
	--end
	local awardList = {}
	local awardInfo = cellValue.cfg
	for i= 1, 3 do
        if awardInfo["award_type_"..i] > 0 then
            local award = {}
            award.type = awardInfo["award_type_"..i]
            award.value = awardInfo["award_value_"..i]
            award.size = awardInfo["award_size_"..i]
            table.insert(awardList, award)
        end
    end
	local commonIcons = self._scrollView:getChildren()
	for i, commIcon in ipairs(commonIcons) do
		local award = awardList[i]
		if award then
			commIcon:unInitUI()
			commIcon:initUI(award.type, award.value, award.size)
			commIcon:setVisible(true)
		else
			commIcon:setVisible(true)	
			commIcon:refreshToEmpty()
		end
	end
	self._awardInfo = cellValue
end

function PopupArenaAwardCell:_onButtonClick(sender)
	logWarn("PopupArenaAwardCell:_onButtonClick")
	local awardId = self._awardInfo.cfg.id
	self:dispatchCustomCallback(awardId)

end


return PopupArenaAwardCell