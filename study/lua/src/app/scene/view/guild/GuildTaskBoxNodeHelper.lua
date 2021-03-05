local GuildTaskBoxNodeHelper = class("GuildTaskBoxNodeHelper")
local CommonConst = require("app.const.CommonConst")
local UserDataHelper = require("app.utils.UserDataHelper")


function GuildTaskBoxNodeHelper:ctor(target)
    self._target = target
	self._textCount = ccui.Helper:seekNodeByName(self._target, "TextCount")
    self._boxItemViews = {}
    self._boxDataList = {}
    cc.bind(target,"CommonProgressNode")
    
    self:_initBoxView()
end 


function GuildTaskBoxNodeHelper:_initBoxView()
	for index = 1 ,4, 1 do
		local nodeBox = ccui.Helper:seekNodeByName(self._target, "NodeBox"..index) 
		if nodeBox then
			 local commonItemIcon = ccui.Helper:seekNodeByName(nodeBox, "CommonItemIcon") 
			 cc.bind(commonItemIcon,"CommonIconTemplate")
		 	 nodeBox:setTag(index)
             table.insert( self._boxItemViews, nodeBox )
		 end
	end
end

function GuildTaskBoxNodeHelper:refreshBoxView()
	local boxDataList  = UserDataHelper.getGuildMissionData()
    self._boxDataList = boxDataList
	local lastBox = boxDataList[#boxDataList]
	local guildUnitData = G_UserData:getGuild():getMyGuild()
	local exp = guildUnitData:getDaily_total_exp()
	local maxExp = lastBox and lastBox.config.need_exp or 0
	self._textCount:setString(tostring(exp))
    self._target:setPercent(exp,maxExp,1)
    self._target:showLightLine(true,exp,maxExp)

    local userGuildInfo = G_UserData:getGuild():getUserGuildInfo()
	for k,v in ipairs(self._boxItemViews) do
        local boxData = boxDataList[k]
        self:_refreshBoxItemView(v,boxData)
	end
end


function GuildTaskBoxNodeHelper:_refreshBoxItemView(node,boxData)
     local status = boxData.status 
     local config = boxData.config
     local dropList = boxData.dropList
	 local reward = dropList[1]
	 local text = ccui.Helper:seekNodeByName(node, "Text")
	 text:setString(tostring(config.need_exp))

	 local commonItemIcon = ccui.Helper:seekNodeByName(node, "CommonItemIcon")
	 commonItemIcon:unInitUI()
	 commonItemIcon:initUI(reward.type,reward.value,reward.size)
	 commonItemIcon:setCallBack(function(sender,itemParams) 
	 		self:_onClickBox(node)
	 end)
	 commonItemIcon:setTouchEnabled(true)
	 commonItemIcon:setIconSelect(false)
	 commonItemIcon:setIconMask(false)
     commonItemIcon:removeLightEffect()

	 if status == CommonConst.BOX_STATUS_ALREADY_GET then--宝箱领取
		 commonItemIcon:setIconMask(true)
	 	 commonItemIcon:setIconSelect(true)
	 elseif status == CommonConst.BOX_STATUS_CAN_GET then--宝箱开启
		commonItemIcon:showLightEffect()
	 else 
	 end
end

function GuildTaskBoxNodeHelper:_onClickBox(sender)

	local index = sender:getTag()
    local boxData  = self._boxDataList[index]
    local rewards = boxData.dropList

    local status = boxData.status

	if status == CommonConst.BOX_STATUS_NOT_GET or 
        status == CommonConst.BOX_STATUS_ALREADY_GET then
		return
	end

	G_UserData:getGuild():c2sGetGuildTaskReward(index)

end

return GuildTaskBoxNodeHelper