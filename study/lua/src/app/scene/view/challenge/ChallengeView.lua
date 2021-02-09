local ViewBase = require("app.ui.ViewBase")
local ChallengeView = class("ChallengeView", ViewBase)

local ChallengeCell = require("app.scene.view.challenge.ChallengeCell")

local FunctionLevel = require("app.config.function_level")
local FunctionConst	= require("app.const.FunctionConst")

ChallengeView.FUNCTION_LIST = 
{
	FunctionConst.FUNC_ARENA,
	FunctionConst.FUNC_DAILY_STAGE,
	FunctionConst.FUNC_PVE_TOWER,
	FunctionConst.FUNC_PVE_SIEGE,
	FunctionConst.FUNC_PVE_TERRITORY,
	--FunctionConst.FUNC_WORLD_BOSS,
}

function ChallengeView:ctor()
	self._signalRedPointUpdate = nil		--红点监听
    self._listMenu = nil    --list滚动层
    self._topBar = nil      --顶部栏
	self._listItems = {}
	local resource = {
		file = Path.getCSB("ChallengeView", "challenge"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		}
	}
	ChallengeView.super.ctor(self, resource)
end

function ChallengeView:onCreate()
   -- self._topBar:setTitle(Lang.get("challenge_title"))
	self._topBar:setImageTitle("txt_sys_com_maoxian")
	
 	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topBar:updateUI(TopBarStyleConst.STYLE_COMMON)
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local functionList = self:_reorderChallenge()
	for i, v in pairs(functionList) do
		-- local isOpen, desc, funcInfo = LogicCheckHelper.funcIsOpened(v)
		-- if isOpen then
		-- 	self:_createCell(v, funcInfo)
		-- end
		local isOpen, desc, funcInfo = LogicCheckHelper.funcIsOpened(v)
		local isShow = LogicCheckHelper.funcIsShow(v)
		if isShow then
			self:_createCell(v, funcInfo)
		end
	end
	self._listMenu:doLayout()
end

function ChallengeView:onEnter()
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
	for k,v in pairs(self._listItems) do
     	v:refreshRedPoint()
	end
	--抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function ChallengeView:onExit()
	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil
end

function ChallengeView:_reorderChallenge()
	local FunctionLevel = require("app.config.function_level")
	local list = ChallengeView.FUNCTION_LIST
	table.sort(list, function(a, b)
		return FunctionLevel.get(a).level < FunctionLevel.get(b).level
	end)
	return list
end

function ChallengeView:_createCell(functionId, info)
	local challengeCell = ChallengeCell.new(functionId, info)
	self._listItems[functionId] = challengeCell 
	self._listMenu:pushBackCustomItem(challengeCell)
end

function ChallengeView:_onEventRedPointUpdate(event,funcId,param)
	--该功能没开启，则返回
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	if  funcId == nil or FunctionCheck.funcIsOpened(funcId) == false then
		return
	end
	if self._listItems[funcId] then
		self._listItems[funcId]:refreshRedPoint()
	end
end

return ChallengeView