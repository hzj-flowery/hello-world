
local ActivitySubView = require("app.scene.view.activity.ActivitySubView")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst	 = require("app.const.DataConst")
local PromptSilverGetHelper = import(".PromptSilverGetHelper")
local MoneyTreeView = class("MoneyTreeView", ActivitySubView)
local AudioConst = require("app.const.AudioConst")
local SchedulerHelper = require("app.utils.SchedulerHelper")

MoneyTreeView.BOX_IMG = {close = "baoxiangjin_guan",open = "baoxiangjin_kai",received = "baoxiangjin_kong"}--宝箱各个状态图
MoneyTreeView.SHAKE_ONCE = 1
MoneyTreeView.SHAKE_10TIMES = 2

function MoneyTreeView:ctor(mainView,activityId)
	self._mainView = mainView
	self._activityId = activityId
	self._commonButtonOnce = nil--摇1次按钮
	self._commonButton10Times = nil --摇10次
	self._commonResourceInfoOnce = nil--消耗元宝
	self._textTimes = nil --次数/总次数
	self._commonHeroAvatar = nil
	self._nodeBox = nil--进度条
	self._nodeSilverOnce = nil --摇1次基础硬币富文本的父节点
	self._nodeSilver10Times = nil --摇10次基础硬币富文本的父节点
	self._nodePrompt = nil --提示节点
	self._baseSilverRichText = nil --摇一次基础硬币富文本
	self._base10TimesSilverRichText = nil --摇十次基础硬币富文本
	self._totalFreeCount = G_UserData:getActivityMoneyTree():getFreeCount() --免费次数
	self._promptSilverGetHelper = PromptSilverGetHelper.new()
    local resource = {
        file = Path.getCSB("MoneyTreeView", "activity/moneytree"),
        binding = {
			_commonButtonOnce = {
				events = {{event = "touch", method = "_onShakeOnceClick"}}
			},
			_commonButton10Times = {
				events = {{event = "touch", method = "_onShake10TimesClick"}}	
			}
		},
    }
    MoneyTreeView.super.ctor(self, resource)
end

function MoneyTreeView:_pullData()
	local hasActivityServerData = G_UserData:getActivity():hasActivityData(self._activityId)
	if not hasActivityServerData  then
		G_UserData:getActivity():pullActivityData(self._activityId)
	end
	return hasActivityServerData
end

function MoneyTreeView:onCreate()
	--local actCfg = G_UserData:getActivityMoneyTree():getBaseActivityData():getConfig()
	--self._textTitle:setString(actCfg.name)

	self._commonButtonOnce:setString(Lang.get("lang_activity_moneytree_shakeOnce"))
	self._commonButton10Times:setString(Lang.get("lang_activity_moneytree_shake10Times"))
	--self._commonResourceInfoOnce:showResName(true,Lang.get("lang_activity_moneytree_consume"))
    self._commonResourceInfoOnce:setTextColor(Colors.uiColors.THIN_YELLOW)
	self._commonResourceInfo10Times:setTextColor(Colors.uiColors.THIN_YELLOW)
	self._commonHeroAvatar:updateUI(312)
	-- self._commonHeroAvatar2:updateUI(312)
	self._effectSpineSkillNode = require("yoka.node.SpineNode").new(0.5)
	self._effectSpineSkillNode:setAsset(Path.getSpine("312_fore_effect"))
    self._effectSpineSkillNode:setVisible(false)
	self._effectSpine:addChild(self._effectSpineSkillNode)

	self._promptSilverGetHelper:setPromptRootNode(self._nodePrompt)

	self._nodeBox:setVisible(false) --不显示进度条
    self:_initBoxView()
end

function MoneyTreeView:onEnter()
	self._signalWelfareMoneyTreeGetInfo = G_SignalManager:add(SignalConst.EVENT_WELFARE_MONEY_TREE_GET_INFO, handler(self, self._onEventWelfareMoneyTreeGetInfo))
	self._signalWelfareMoneyTreeShake = G_SignalManager:add(SignalConst.EVENT_WELFARE_MONEY_TREE_SHAKE, handler(self, self._onEventWelfareMoneyTreeShake))
	self._signalWelfareMoneyTreeOpenBox = G_SignalManager:add(SignalConst.EVENT_WELFARE_MONEY_TREE_OPEN_BOX, handler(self, self._onEventWelfareMoneyTreeOpenBox))

	local hasServerData = self:_pullData()
	if hasServerData and G_UserData:getActivityMoneyTree():isExpired() then
		G_UserData:getActivity():pullActivityData(self._activityId)
	end
	if hasServerData then
		self:refreshData()
	end
end

function MoneyTreeView:onExit()
	self._signalWelfareMoneyTreeGetInfo:remove()
	self._signalWelfareMoneyTreeGetInfo = nil

	self._signalWelfareMoneyTreeShake:remove()
	self._signalWelfareMoneyTreeShake = nil

	self._signalWelfareMoneyTreeOpenBox:remove()
	self._signalWelfareMoneyTreeOpenBox = nil

	if self._scheduleShowPrompt then
		SchedulerHelper.cancelSchedule(self._scheduleShowPrompt)
	end
end

function MoneyTreeView:enterModule()

end

function MoneyTreeView:_onEventWelfareMoneyTreeGetInfo(event,id,message)
	self:refreshData()
end

function MoneyTreeView:_onEventWelfareMoneyTreeShake(event,id,message)
	self:refreshData()

	self._commonHeroAvatar:playAnimationOnce("skill2")
	self._effectSpineSkillNode:setVisible(true)
	self._effectSpineSkillNode:setAnimation("skill2", false)
	self._effectSpineSkillNode.signalComplet:addOnce(function( ... )
		self._effectSpineSkillNode:setVisible(false)
	end)

	G_AudioManager:playSoundWithId(AudioConst.SOUND_ACTIVITY_MONEYTREE)
	--提示
	local results = rawget(message, "money_tree")
	self:_showPromptSilver(results)
end

function MoneyTreeView:_showPromptSilver(data)
	if not data or #data == 0 then
		self._commonButtonOnce:setEnabled(true)
		self._commonButton10Times:setEnabled(true)
		return
	end

	local count = 1

	if self._scheduleShowPrompt then
		SchedulerHelper.cancelSchedule(self._scheduleShowPrompt)
		self._scheduleShowPrompt = nil
	end

	for k, v in pairs(data) do 
		self._promptSilverGetHelper:addPrompt(v.money, v.crit)
	end

	if #data > 1 then
		self._scheduleShowPrompt = SchedulerHelper.newScheduleOnce(function () 
			self._commonButtonOnce:setEnabled(true)
			self._commonButton10Times:setEnabled(true)

			SchedulerHelper.cancelSchedule(self._scheduleShowPrompt)
			self._scheduleShowPrompt = nil
		end, 3.3)
	end
end

function MoneyTreeView:_onEventWelfareMoneyTreeOpenBox(event,id,message)
	self:refreshData()
	self:_showRewards(message)
end

function MoneyTreeView:_showRewards(message)
    local awards = rawget(message, "awards")
	if awards then
		G_Prompt:showAwards(awards)
		-- local popupGetRewards = require("app.ui.PopupGetRewards").new()
		-- popupGetRewards:showRewards(awards)

	end
end

function MoneyTreeView:_onShakeOnceClick(sender)
	local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
	local VipFunctionIDConst = require("app.const.VipFunctionIDConst")

	--[[ --摇钱树没有次数限制
	local timesOut = LogicCheckHelper.vipTimesOutCheck(VipFunctionIDConst.VIP_FUNC_ID_MONEY_TREE,
			G_UserData:getActivityMoneyTree():getNum(),Lang.get("lang_activity_moneytree_shake_max_time"))
	if timesOut then
		return
	end
]]
	local cost = G_UserData:getActivityMoneyTree():getShakeOnceCost()--金钱
	local success = LogicCheckHelper.enoughCash(cost,true)
	if success then
		G_UserData:getActivityMoneyTree():c2sActMoneyTree(MoneyTreeView.SHAKE_ONCE)
	end
end

function MoneyTreeView:_onShake10TimesClick(sender)
	local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
	local VipFunctionIDConst = require("app.const.VipFunctionIDConst")

	local cost = G_UserData:getActivityMoneyTree():getShake10TimesCost()--金钱
	local success = LogicCheckHelper.enoughCash(cost,true)
	if success then
		G_UserData:getActivityMoneyTree():c2sActMoneyTree(MoneyTreeView.SHAKE_10TIMES)

		self._commonButtonOnce:setEnabled(false)
		self._commonButton10Times:setEnabled(false)
	end
end

function MoneyTreeView:_onClickBox(sender)
	local id = sender:getTag()
	local data = G_UserData:getActivityMoneyTree():getMoneyTreeBoxDataById(id)
	local CommonConst = require("app.const.CommonConst")
	local status = G_UserData:getActivityMoneyTree():isBoxCanReceived(id)

	if status == CommonConst.BOX_STATUS_NOT_GET or status == CommonConst.BOX_STATUS_ALREADY_GET
		then
		local popupBoxReward = require("app.ui.PopupBoxReward").new(
				Lang.get("lang_activity_moneytree_box_title"), nil)
		popupBoxReward:updateUI(data:getRewards())
		popupBoxReward:setBtnText(status == CommonConst.BOX_STATUS_NOT_GET and Lang.get("get_box_reward")
			or Lang.get("got_star_box")  )
		popupBoxReward:setBtnEnable(false)
		popupBoxReward:setDetailText("")
		popupBoxReward:openWithAction()
		return
	end

	local ActivityDataHelper = require("app.utils.data.ActivityDataHelper")
	if ActivityDataHelper.checkPackBeforeGetActReward(data) then
		G_UserData:getActivityMoneyTree():c2sActMoneyTreeBox(id)
	end
end

--刷新摇一次基础硬币
function MoneyTreeView:_refreshOnceBaseSilverView(silver)
	if self._baseSilverRichText then
		self._baseSilverRichText:removeFromParent()
	end

	local richText = Lang.get("lang_activity_moneytree_base_silver",
    {
        silver = silver,
	})
	
    local widget = ccui.RichText:createWithContent(richText)
    self._nodeSilverOnce:addChild(widget)
	self._baseSilverRichText =  widget
end

--刷新摇十次基础硬币
function MoneyTreeView:_refresh10TimesBaseSilverView(silver)
	if self._base10TimesSilverRichText then
		self._base10TimesSilverRichText:removeFromParent()
	end

	local richText = Lang.get("lang_activity_moneytree_base_silver",
    {
        silver = silver,
	})
	
    local widget = ccui.RichText:createWithContent(richText)
    self._nodeSilver10Times:addChild(widget)
	self._base10TimesSilverRichText =  widget
end

--刷新次数
function MoneyTreeView:_refreshTimesView()
--[[
	local times = G_UserData:getActivityMoneyTree():getNum()
	local maxTimes = G_UserData:getActivityMoneyTree():getMaxBuyCount()
	self._textTimes:setString(Lang.get("lang_activity_moneytree_time",
		 {current = times,total = maxTimes}))
	]]	 
end

function MoneyTreeView:refreshData()
	--self:_refreshTimesView()
	local times = G_UserData:getActivityMoneyTree():getNum()

	-- 设置摇一次相关UI
	local freeTimes = G_UserData:getActivityMoneyTree():getFree_num()
	if freeTimes >= self._totalFreeCount then
		self._commonResourceInfoOnce:setVisible(true)
		self._freeCount:setVisible(false)
		local cfg = G_UserData:getActivityMoneyTree():getActSilverCfgByTime(times + 1)
		if cfg then
			local roleParam = G_UserData:getActivityMoneyTree():getRoleParam()
			local silver = cfg.basic_silver * roleParam / 1000
			self:_refreshOnceBaseSilverView(silver)--刷新基础硬币
			self._commonResourceInfoOnce:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND, cfg.cost)--刷新当前摇一摇花费
			self._commonResourceInfoOnce:setTextColor(Colors.uiColors.THIN_YELLOW)
			self._commonResourceInfoOnce:showResName(false)
		end
	else
		self._commonResourceInfoOnce:setVisible(false)
		self._freeCount:setVisible(true)
		self._freeCount:setString(self._totalFreeCount - freeTimes)
	end

	-- 设置摇10次相关UI
	self._commonResourceInfo10Times:setVisible(true)
	local cfg = G_UserData:getActivityMoneyTree():getActSilverCfgByTime(times + 1)
	if cfg then
		local roleParam = G_UserData:getActivityMoneyTree():getRoleParam()
		local silver = cfg.basic_silver * roleParam / 1000 * 10
		self:_refresh10TimesBaseSilverView(silver)--刷新基础硬币
		self._commonResourceInfo10Times:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND, cfg.cost * 10)--刷新当前摇一摇花费
		self._commonResourceInfo10Times:setTextColor(Colors.uiColors.THIN_YELLOW)
		self._commonResourceInfo10Times:showResName(false)
	end


	--self:_refreshBoxAndProgress()
end

function MoneyTreeView:_refreshBoxItemView(node,data)
	 local text = ccui.Helper:seekNodeByName(node, "Text")
	 text:setString(Lang.get("lang_activity_moneytree_box_time",
		 {time = data:getConfig().count}))
	 node:ignoreContentAdaptWithSize(true)
	 node:setTouchEnabled(true)
	 node:removeChildByName("EffectGfxNode")
	 local times = G_UserData:getActivityMoneyTree():getNum()
	 if data:isReceived() then--宝箱领取
	 	local img = Path.getCommonIcon("common",MoneyTreeView.BOX_IMG.received)
		node:loadTexture(img)
		--node:setTouchEnabled(false)
	 elseif data:getConfig().count <= times then--宝箱开启
	 	local img = Path.getCommonIcon("common",MoneyTreeView.BOX_IMG.open)
		node:loadTexture(img)

		local EffectGfxNode = require("app.effect.EffectGfxNode")
		local subEffect = G_EffectGfxMgr:createPlayMovingGfx( node, "moving_boxflash", nil, nil, false )
		subEffect:setName("EffectGfxNode")

		--node:setTouchEnabled(true)
	 else --宝箱关闭
	 	local img = Path.getCommonIcon("common",MoneyTreeView.BOX_IMG.close)
		node:loadTexture(img)
		--node:setTouchEnabled(false)
	 end
end

--初始化宝箱
function MoneyTreeView:_initBoxView()
	 local boxDataArr = G_UserData:getActivityMoneyTree():getAllMoneyTreeBoxDatas()
	 for k,boxData in ipairs(boxDataArr) do
         local Image_box = ccui.Helper:seekNodeByName(self._nodeBox, "Image_box_"..tostring(k))
		 if Image_box then
		 	 Image_box:setTag(boxData:getId())
		 	 self:_refreshBoxItemView(Image_box,boxData)
			 Image_box:addClickEventListenerEx(handler(self, self._onClickBox))
		 end
	 end
end

--刷新宝箱
function MoneyTreeView:_refreshBoxView()
	 local boxDataArr = G_UserData:getActivityMoneyTree():getAllMoneyTreeBoxDatas()
	 for k,boxData in ipairs(boxDataArr) do
         local Image_box = ccui.Helper:seekNodeByName(self._nodeBox, "Image_box_"..tostring(k))
		 local Image_line = ccui.Helper:seekNodeByName(Image_box, "Image_line")
		 if Image_box then
		 	 self:_refreshBoxItemView(Image_box,boxData)
		 end

		 local times = G_UserData:getActivityMoneyTree():getNum()
		 local showLine = boxData:getConfig().count <= times
		 if Image_line then
			Image_line:setVisible(showLine)
		 end

	 end
end

--刷新宝箱和进度
function MoneyTreeView:_refreshBoxAndProgress()
	 local textTimes = ccui.Helper:seekNodeByName(self._nodeBox, "Text_times")
	 local loadingBar = ccui.Helper:seekNodeByName(self._nodeBox, "LoadingBar")

	 local times = G_UserData:getActivityMoneyTree():getNum()
	 local maxTimes = G_UserData:getActivityMoneyTree():getMaxCount()--G_UserData:getActivityMoneyTree():getMaxBox():getConfig().count

	 --完成次数
	 textTimes:setString(tostring(times))
	 --进度
	 loadingBar:setPercent(math.ceil(times*100/maxTimes))

	 self:_refreshBoxView()
end





return MoneyTreeView
