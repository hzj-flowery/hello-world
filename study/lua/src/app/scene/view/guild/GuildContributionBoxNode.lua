local GuildContributionBoxNode = class("GuildContributionBoxNode")
local CommonConst = require("app.const.CommonConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local ReturnConst = require("app.const.ReturnConst")

GuildContributionBoxNode.BOX_IMG ={
        --宝箱各个状态图
    {close = "baoxiangtong_guan",open = "baoxiangtong_kai",received = "baoxiangtong_kong"},
    {close = "baoxiangyin_guan",open = "baoxiangyin_kai",received = "baoxiangyin_kong"},
    {close = "baoxiang_jubaopeng_guan",open = "baoxiang_jubaopeng_kai",received = "baoxiang_jubaopeng_kong"},
    {close = "baoxiangjin_guan",open = "baoxiangjin_kai",received = "baoxiangjin_kong"},
} 

function GuildContributionBoxNode:ctor(target)
    self._target = target
	self._textCount = ccui.Helper:seekNodeByName(self._target, "TextCount")
    self._boxItemViews = {}
    self._boxDataList = {}
	self._maxExp = 0 
    cc.bind(target,"CommonProgressNode")
    
    self:_initBoxView()
end 


function GuildContributionBoxNode:_initBoxView()
	for index = 1 ,4, 1 do
		local node = ccui.Helper:seekNodeByName(self._target, "Node_Box"..index) 
		if node then
			 local commonIcon = ccui.Helper:seekNodeByName(node, "CommonIcon")
			 cc.bind(commonIcon,"CommonIconTemplate")
             local panelTouch = ccui.Helper:seekNodeByName(node, "Panel_Touch")
		 	 panelTouch:setTag(index)
			 panelTouch:addClickEventListenerEx(handler(self, self._onClickBox))
             table.insert( self._boxItemViews, node )
		 end
	end
end

function GuildContributionBoxNode:refreshBoxView()
	local boxDataList,exp,maxExp  = UserDataHelper.getGuildContributionBoxData()
    self._boxDataList = boxDataList
	self._maxExp = maxExp
	exp = math.min(exp, maxExp)
	local lastBox = boxDataList[#boxDataList]

	local myGuild = G_UserData:getGuild():getMyGuild()
	local num = myGuild:getDonate_point()
	self._textCount:setString(tostring(num))
	-- local revise = exp ~= 0 and maxExp*50/680 or 0--这里由于进度条不是均分的，所以要加这种误差项
	-- self._target:setPercent(revise+exp,maxExp,1)
	local percent = exp / maxExp
	if percent <= 0.25 then
		self._target:setPercent(percent + 0.01, 1, 1)
	elseif percent > 0.25 and percent <= 0.5 then
		self._target:setPercent(0.43 + 0.01 * maxExp * (percent - 0.25) , 1, 1)
	elseif percent > 0.5 and percent <= 0.75 then
		self._target:setPercent(0.68 + 0.01 * maxExp * (percent - 0.5) , 1, 1)
	elseif percent > 0.75 and percent <= 1 then
		self._target:setPercent(0.93 + 0.01 * maxExp * (percent - 0.75) , 1, 1)
	end

    self._target:showLightLine(true,exp,maxExp)

	local size = #self._boxItemViews
	for k,v in ipairs(self._boxItemViews) do
        local boxData = boxDataList[k]
        self:_refreshBoxItemView(v,boxData,k,size)
	end
end


function GuildContributionBoxNode:_refreshBoxItemView(node,boxData,index,size)
     local status = boxData.status 
     local config = boxData.config
     local dropList = boxData.dropList
     local exp = boxData.exp
	 local reward = dropList[1]
     local panelTouch = ccui.Helper:seekNodeByName(node, "Panel_Touch")
     local commonIcon = ccui.Helper:seekNodeByName(node, "CommonIcon")

	 local text = ccui.Helper:seekNodeByName(node, "Text")
	 local image = ccui.Helper:seekNodeByName(node, "Image")

	 text:setString(tostring(exp))
	 panelTouch:setTouchEnabled(true)

	

	 commonIcon:unInitUI()
	 commonIcon:initUI(reward.type,reward.value,reward.size)
	 commonIcon:setTouchEnabled(false)
	 commonIcon:setIconSelect(false)
	 commonIcon:setIconMask(false)
	 commonIcon:removeLightEffect()
	 
	 local doubleTimes = G_UserData:getReturnData():getPrivilegeRestTimes(ReturnConst.PRIVILEGE_GUILD_CONTRIBUTION)
	 commonIcon:showDoubleTips(doubleTimes > 0)

     local isLast = index == size
	 if status == CommonConst.BOX_STATUS_ALREADY_GET then--宝箱领取
		 commonIcon:setIconMask(true)
		 commonIcon:setIconSelect(true)
		 image:loadTexture(isLast and Path.getGuildRes("img_jisi04a") or Path.getGuildRes("img_jisi04b"))
	 elseif status == CommonConst.BOX_STATUS_CAN_GET then--宝箱开启
		 commonIcon:showLightEffect()
		 image:loadTexture(isLast and Path.getGuildRes("img_jisi04a") or Path.getGuildRes("img_jisi04b"))
	 else 
		 image:loadTexture(Path.getGuildRes("img_jisi05") )
	 end
end

function GuildContributionBoxNode:_onClickBox(sender)
	local index = sender:getTag()
    local boxData  = self._boxDataList[index]
    local rewards = boxData.dropList

    local status = boxData.status
	if status == CommonConst.BOX_STATUS_NOT_GET or 
        status == CommonConst.BOX_STATUS_ALREADY_GET then
		return
	end

	--local ActivityDataHelper = require("app.utils.data.ActivityDataHelper")
	--if ActivityDataHelper.checkPackBeforeGetActReward(data) then
		G_UserData:getGuild():c2sGetGuildDonateReward(index)
	--end

	
end

return GuildContributionBoxNode