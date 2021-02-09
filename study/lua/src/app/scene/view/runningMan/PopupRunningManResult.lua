
-- Author: hedili
-- Date:2018-04-19 14:10:08
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupRunningManResult = class("PopupRunningManResult", PopupBase)
local PopupRunningManResultCell = import(".PopupRunningManResultCell")
local RunningManHelp = require("app.scene.view.runningMan.RunningManHelp")
local RunningManConst = require("app.const.RunningManConst")
function PopupRunningManResult:ctor()

	--csb bind var name
	self._raceNum = nil  --CommonNormalSmallPop
	self._startNode = nil  --ScrollView
	self._runEndList = {}

	local resource = {
		file = Path.getCSB("PopupRunningManResult", "runningMan"),
		binding = {

		},
	}
	self:setName("PopupRunningManResult")
	PopupRunningManResult.super.ctor(self, resource,false,true)
end

-- Describle：
function PopupRunningManResult:onCreate()
	self._runningList = {}

	self._commonContinue:setVisible(false)
	local resolutionSize =  G_ResolutionManager:getDesignCCSize()
	--self._panelCover:setContentSize(cc.size( resolutionSize.width*2, resolutionSize.height*2))
	--self._panelCover:setTouchEnabled(true)
	--self._panelCover:addClickEventListenerEx(handler(self, self.onTouchHandler))
	local lastPos = 0
	for i= 1, 5 do
		local cell =  PopupRunningManResultCell.new(i)
		lastPos = lastPos - cell:getCellHeight()
		self._startNode:addChild(cell)
		cell:setPositionY(lastPos)
		cell:setVisible(false)
		cell:setName("widgetCell"..i)
	end
end

function PopupRunningManResult:onTouchHandler( ... )
	-- body
	logWarn("PopupRunningManResult:onTouchHandler")
	if self._commonContinue:isVisible() == true then
		self:close()
	end

end

-- Describle：
function PopupRunningManResult:onEnter()
	--拿到数据列表,完成列表
	local openTimes = G_UserData:getRunningMan():getOpen_times()
	if openTimes > 0 then
		local state = RunningManHelp.getRunningState()
		--上次开启次数
		if state == RunningManConst.RUNNING_STATE_PRE_START then
			openTimes = openTimes - 1
		end
		self._raceNum:setString(openTimes.."")
	end
	 --[[
	local runningList = RunningManHelp.getRunningFinishList()
	if #runningList > #self._runningList then
		local newNum = #runningList
		local oldNum = #self._runningList
		self._runningList = runningList
		self:playAnimation(oldNum,newNum)
	end
	]]
end

function PopupRunningManResult:updateUI( ... )
	local runningList = RunningManHelp.getRunningFinishList(self._runEndList)
	local tempList = clone(self._runningList)
	table.insertto(tempList, runningList)
	if #tempList > #self._runningList then
		local oldNum = #self._runningList
		local newNum = #tempList
		self._runningList = tempList
		self:_playAnimation(oldNum+1,newNum)
	end
end

-- Describle：
function PopupRunningManResult:onExit()

end


function PopupRunningManResult:getHeroId( heroData )
	-- body
	if heroData.isPlayer == 1 then
		return heroData.user.user_id
	end
	return heroData.heroId
end
function PopupRunningManResult:_playAnimation(startIndex, endIndex)
	-- body

	for i = startIndex, endIndex do
		local cellWidget = self._startNode:getChildByName("widgetCell"..i)
		if cellWidget then
			cellWidget:setVisible(true)
			local runningHero = self._runningList[i]
			cellWidget:updateUI(runningHero)
			cellWidget:playAnimation()
			table.insert(self._runEndList, runningHero)
		end
	end

	--最后一个显示，则显示点击继续
	if endIndex == 5 then
		self._commonContinue:setVisible(true)
	end
end


return PopupRunningManResult