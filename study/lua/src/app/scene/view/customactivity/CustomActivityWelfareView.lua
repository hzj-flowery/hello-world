local ViewBase = require("app.ui.ViewBase")
local CustomActivityWelfareView = class("CustomActivityWelfareView", ViewBase)

function CustomActivityWelfareView:ctor()
	self._customActUnitData = nil
	self._textActTitle = nil
	self._textActDes = nil
	self._commonTalk = nil
	self._textNode = nil
	local resource = {
		file = Path.getCSB("CustomActivityWelfareView", "customactivity"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		},
	}
	CustomActivityWelfareView.super.ctor(self, resource)
end

function CustomActivityWelfareView:onCreate()
	self._commonStoryAvator:updateUI(204)
	self._commonStoryAvator:setScale(0.6)
end

function CustomActivityWelfareView:onEnter()
	self:_startRefreshHandler()
end

function CustomActivityWelfareView:onExit()
	self:_endRefreshHandler()
end
function CustomActivityWelfareView:_startRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),1)
end

function CustomActivityWelfareView:_endRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end


function CustomActivityWelfareView:_onRefreshTick( dt )
	local actUnitdata = self._customActUnitData
	if actUnitdata then
		self:_refreshActTime(actUnitdata)
	end


	--对比ActList决定是否刷新,这样太费性能了
	--G_UserData:getCustomActivity():getShowActUnitDataArr()
	--现在点击按钮触发判断
end

function CustomActivityWelfareView:_refreshActTime(actUnitData)
	local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")
	local timeStr = ""
	if actUnitData:isActInRunTime() then
		timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getEnd_time())
		-- text = Lang.get("days7activity_act_end_time",{time = timeStr})
	else
		timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getAward_time())
		-- text = Lang.get("days7activity_act_reward_time",{time = timeStr})
	end
	self._textTime:setString(timeStr)
end

function CustomActivityWelfareView:_refreshDes()
	if not self._customActUnitData then
		return
	end
	self._textActTitle:setString(self._customActUnitData:getSub_title())
	--self._textActDes:setString(self._customActUnitData:getDesc())

	self:_createProgressRichText(self._customActUnitData:getDesc())
end

function CustomActivityWelfareView:refreshView(customActUnitData)
	self._customActUnitData = customActUnitData
	self:_refreshDes()
	if self._customActUnitData then
		self:_refreshActTime(self._customActUnitData)
	end

	self._commonTalk:setString(self._customActUnitData:getDetail(),325,true,325,76,nil,nil,true)

	
end

function CustomActivityWelfareView:_createProgressRichText(msg)
	local RichTextHelper = require("app.utils.RichTextHelper")
	local richMsg =  json.encode(RichTextHelper.getRichMsgListForHashText(
				msg,Colors.BRIGHT_BG_RED,Colors.DARK_BG_TWO,20))
	self._textNode:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richMsg)
    widget:setAnchorPoint(cc.p(0,1))
	widget:ignoreContentAdaptWithSize(false)
	widget:setContentSize(cc.size(360,0))--高度0则高度自适应
    self._textNode:addChild(widget)
end



function CustomActivityWelfareView:enterModule()
	
	self._commonTalk:doAnim()
end


return CustomActivityWelfareView
