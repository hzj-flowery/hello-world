local PopupBase = require("app.ui.PopupBase")
local PopupHurtReward = class("PopupHurtReward", PopupBase)

local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupHurtRewardCell = require("app.scene.view.siege.PopupHurtRewardCell")

local SiegeHelper = require("app.scene.view.siege.SiegeHelper")
local TextHelper = require("app.utils.TextHelper")

PopupHurtReward.REWARD_TYPE_DAMAGE = 1
PopupHurtReward.REWARD_TYPE_COUNT = 2

PopupHurtReward.REWARD_COUNT = 4 	--次数奖励的数量

function PopupHurtReward:ctor()
	-- self._level = G_UserData:getBase():getToday_init_level()
	self._level = G_UserData:getSiegeData():getUserLevel()
    self._popupBG = nil     --背景
    self._textHurtNum = nil --累计伤害数值
    self._listReward = nil  --奖励list
	self._textGetCount = nil	--领取次数

    self._textCount = nil   --今日领奖次数
    self._loadingBar = nil  --次数进度条
    -- self._panelCon = nil    --下方面板父节点

	--下方4个物品
	self._item1 = nil
	self._item2 = nil
	self._item3 = nil
	self._item4 = nil

	--下方的4个次数
	self._textCount1 = nil
	self._textCount2 = nil
	self._textCount3 = nil
	self._textCount4 = nil

	self._rewardList = {}  --次数奖励
	self._sortedPersonList = nil		--排序完成的个人奖励
	--signal
	self._signalHurtReward = nil

	local resource = {
		file = Path.getCSB("PopupHurtReward", "siege"),
		binding = {
		}
	}
	PopupHurtReward.super.ctor(self, resource)
end

function PopupHurtReward:onCreate()
	self._popupBG:setTitle(Lang.get("siege_damage_reward"))
	self._popupBG:addCloseEventListener(function ()
		self:closeWithAction()
	end)
	self._rewardList[PopupHurtReward.REWARD_TYPE_DAMAGE] = SiegeHelper.parseRewardList(self._level, PopupHurtReward.REWARD_TYPE_DAMAGE)
	self._rewardList[PopupHurtReward.REWARD_TYPE_COUNT] = SiegeHelper.parseRewardList(self._level, PopupHurtReward.REWARD_TYPE_COUNT)
end

function PopupHurtReward:onEnter()
	local myDamage = G_UserData:getSiegeData():getTotal_hurt()
	local myDamageStr = TextHelper.getAmountText2(myDamage)
	self._textHurtNum:setString(myDamageStr)
	self:_refreshHurtReward()
    self:_refreshCountReward()

	self._signalHurtReward = G_SignalManager:add(SignalConst.EVENT_SIEGE_HURT_REWARD, handler(self, self._onEventHurtReward))
end

function PopupHurtReward:onExit()
	self._signalHurtReward:remove()
	self._signalHurtReward = nil
end

function PopupHurtReward:_refreshHurtReward()
	self._sortedPersonList = SiegeHelper.getSortedRewardList(self._rewardList[PopupHurtReward.REWARD_TYPE_DAMAGE])
	local listView = self._listReward
	listView:clearAll()
	listView:setTemplate(PopupHurtRewardCell)
    listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
    listView:resize(#self._sortedPersonList)
end

function PopupHurtReward:_onItemUpdate(item, index)
	item:updateUI(self._sortedPersonList[index+1])
end

function PopupHurtReward:_onItemSelected(item, index)

end

--刷新下方次数奖励
function PopupHurtReward:_refreshCountReward()
	local rewardList = self._rewardList[PopupHurtReward.REWARD_TYPE_COUNT]
	local getNum = G_UserData:getSiegeData():getRewardCount()
	self._textCount:setString(Lang.get("siege_reward_count", {count = getNum}))
	local totalSize = rewardList[#rewardList].target_size
	local percent = math.floor(getNum/totalSize*100)
	self._loadingBar:setPercent(percent)
	-- self._loadingHightlight:setPositionX(percent/100*502-1)
	for i = 1, PopupHurtReward.REWARD_COUNT do
		local rewardData = rewardList[i]
		local iconText = self["_textCount"..i]
		iconText:setString(Lang.get("siege_reward_count", {count = rewardData.target_size}))
		local iconNode = self["_item"..i]
		iconNode:unInitUI()
		iconNode:initUI(rewardData.award_type,rewardData.award_value, rewardData.award_size)
		iconNode:setTouchEnabled(true)
		iconNode:removeLightEffect()
		local isget = G_UserData:getSiegeData():isCountRewardGet(rewardData.id)
		if getNum >= rewardData.target_size then
			if isget then
				iconNode:setIconMask(true)
			else
				iconNode:setIconSelect(true)
				iconNode:setIconMask(false)
				iconNode:showLightEffect()
			end
		else
			iconNode:setIconSelect(false)
			iconNode:setIconMask(false)
		end
		
		local function onIconClick(sender, iconParams)
			if G_UserData:getSiegeData():isExpired() then
				G_UserData:getSiegeData():refreshRebelArmy() 
				return
			end
			G_UserData:getSiegeData():c2sRebArmyHurtReward(rewardData.id)

			-- local PopupItemInfo = require("app.ui.PopupItemInfo").new()
			-- PopupItemInfo:updateUI(iconParams.cfg.id)
			-- PopupItemInfo:openWithAction()
		end

		if getNum >= rewardData.target_size and isget == false then
			iconNode:setCallBack(onIconClick)
		else
			iconNode:setCallBack(nil)
		end
	end
end

function PopupHurtReward:_onEventHurtReward(eventName, rewards)
	-- local PopupGetRewards = require("app.ui.PopupGetRewards").new()
	-- PopupGetRewards:showRewards(rewards)
	G_Prompt:showAwards(rewards)

	self._listReward:clearAll()
	self:_refreshHurtReward()
    self:_refreshCountReward()
end

return PopupHurtReward
