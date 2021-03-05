--弹出界面
--官衔系统
local PopupBase = require("app.ui.PopupBase")
local PopupOfficialRankUp = class("PopupOfficialRankUp", PopupBase)
local Path = require("app.utils.Path")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupOfficialRankUpCell = import(".PopupOfficialRankUpCell")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local START_COLOR = 6

function PopupOfficialRankUp:ctor(title )
	--
	self._title = title or Lang.get("official_rank_title") 

	--control init
	self._commonNodeBk = nil		--通用背景框
	self._attrNode1    = nil		--属性节点1
	self._attrNode2	   = nil		--属性节点1
	self._attrNode3	   = nil		--属性节点1
	self._btnUp		   = nil		--晋级按钮
	self._resItem1	   = nil		--资源1
	self._resItem2	   = nil		--资源2
	self._resItem3	   = nil		--资源3
	self._conditionTitle = nil
	self._commonHelp = nil --帮助按钮
	self._textAddPlayerJoint = nil --主角缘分
	--
	local resource = {
		file = Path.getCSB("PopupOfficialRankUp", "official"),
		binding = {
			_btnUp = {
				events = {{event = "touch", method = "onBtnUp"}}
			},
		}
	}
	self:setName("PopupOfficialRankUp")
	PopupOfficialRankUp.super.ctor(self, resource, true)
end

--
function PopupOfficialRankUp:onCreate()
	
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._commonNodeBk:setTitle(self._title)

	self._commonHelp:updateUI(FunctionConst.FUNC_OFFICIAL)

	self._rankUpCell1 = PopupOfficialRankUpCell.new()
	self._attrNode1:addChild(self._rankUpCell1)
	self._rankUpCell2 = PopupOfficialRankUpCell.new()
	self._attrNode2:addChild(self._rankUpCell2)
	self._rankUpCell3 = PopupOfficialRankUpCell.new()
	self._attrNode3:addChild(self._rankUpCell3)
	self._rankUpCell3:setVisible(false)

	self._textRankMax:setVisible(false)
end




function PopupOfficialRankUp:_onInit()

end

function PopupOfficialRankUp:updateUI() 
	self:_recordTotalPower()
	local currRank =  G_UserData:getBase():getOfficialLevel() or 0
	
	local nextRank = currRank + 1
	local currInfo = G_UserData:getBase():getOfficialInfo(currRank)
	local nextInfo = G_UserData:getBase():getOfficialInfo(nextRank)

    self._textAddPlayerJoint:setString(currInfo.text_1)
	if nextInfo == nil then
		self._rankUpCell1:setVisible(false)
		self._rankUpCell2:setVisible(false)
		self._rankUpCell3:setVisible(true)
		self._rankUpCell3:updateUI(currRank, true)
		self._textNodeRes:setVisible(false)
		self._conditionTitle:setVisible(false)
		self._imageArrow:setVisible(false)
		self._textRankMax:setVisible(true)
	else
		self._rankUpCell1:setVisible(true)
		self._rankUpCell2:setVisible(true)
		self._rankUpCell3:setVisible(false)
		self._rankUpCell1:updateUI(currRank, true)
		self._rankUpCell2:updateUI(nextRank, false)
		self._textNodeRes:setVisible(true)
		self._conditionTitle:setVisible(true)
		self._imageArrow:setVisible(true)
		self._textRankMax:setVisible(false)
	end
	self:_updateRes()

	self._btnUp:setString(Lang.get("official_btn_up"))
end


function PopupOfficialRankUp:_updateRes()
	--local currPower = G_UserData:getBase():getPower()
	local currRank = G_UserData:getBase():getOfficialLevel()
	local currInfo = G_UserData:getBase():getOfficialInfo(currRank)
	local currPower = G_UserData:getBase():getPower()
	self._resItem1:updateUI(TypeConvertHelper.TYPE_POWER, currInfo.combat_demand)
	self._resItem1:setTextColorToDTypeColor()

	self._resItem1:setCount( TextHelper.getAmountText(currInfo.combat_demand) )

	if currPower > currInfo.combat_demand then
		
		self._resItem1:setCountColorRed(false)
	else
		self._resItem1:setCountColorRed(true)
	end
	

	self._resItem2:setVisible(false)
	if currInfo.type_1 > 0 then
		local itemCount1 = UserDataHelper.getNumByTypeAndValue(currInfo.type_1,currInfo.value_1)
		self._resItem2:updateUI(currInfo.type_1, currInfo.value_1)
		self._resItem2:setCount(itemCount1,currInfo.size_1)
		self._resItem2:setTextColorToATypeColor(itemCount1 >= currInfo.size_1)
		self._resItem2:showImageAdd(true)
		self._resItem2:setVisible(true)
		self:updateLabel("Text_cost_item2", self._resItem2:getResName()..": ")
	end

	self._resItem3:setVisible(false)
	if currInfo.type_2 > 0 and currInfo.value_2 > 0 then
		local itemCount2 = UserDataHelper.getNumByTypeAndValue(currInfo.type_2,currInfo.value_2)
		self._resItem3:updateUI(currInfo.type_2, currInfo.value_2)
		self._resItem3:setCount(itemCount2,currInfo.size_2)
		self._resItem3:setTextColorToATypeColor(itemCount2 >= currInfo.size_2)
		self._resItem3:showImageAdd(true)
		self._resItem3:setVisible(true)
		self:updateLabel("Text_cost_item3", self._resItem3:getResName()..": ")
		self._resItem2:setPositionY(66.23)
	else
		self._resItem2:setPositionY(46.22)	
	end
end

function PopupOfficialRankUp:onEnter()
	self._getRankUp = G_SignalManager:add(SignalConst.EVENT_OFFICIAL_LEVEL_UP, handler(self, self._onEventRankUp))
	self:updateUI()
	--抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end


function PopupOfficialRankUp:sendRankUp()

	G_UserData:getBase():c2sUpOfficerLevel()
end

function PopupOfficialRankUp:onExit()
    self._getRankUp:remove()
	self._getRankUp = nil 

end



function PopupOfficialRankUp:onBtnUp()

	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local retValue, retFunc = LogicCheckHelper.checkOfficialLevelUp()
	if retValue == true then
		logWarn("self:sendRankUp()")
		self:sendRankUp()
	else
		retFunc()

		--local PopupOfficialRankUpResult = require("app.scene.view.official.PopupOfficialRankUpResult").new()
		--PopupOfficialRankUpResult:updateUI(2,self._lastTotalPower-100)
		--PopupOfficialRankUpResult:open()
	end
	
end


function PopupOfficialRankUp:onBtnCancel()
	if not isBreak then
		self:close()
	end
end


function PopupOfficialRankUp:_onEventRankUp(id, message)	
	--G_Prompt:showTip("晋级成功")
	
	local level = rawget(message,"level")
    local PopupOfficialRankUpResult = require("app.scene.view.official.PopupOfficialRankUpResult").new()
    PopupOfficialRankUpResult:updateUI(level,self._lastTotalPower)
    PopupOfficialRankUpResult:open()
	self:updateUI()
end


function PopupOfficialRankUp:_recordTotalPower()
	local totalPower = G_UserData:getBase():getPower()
	self._lastTotalPower = totalPower
end

return PopupOfficialRankUp