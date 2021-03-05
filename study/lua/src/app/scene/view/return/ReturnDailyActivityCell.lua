--
-- Author: hyl
-- Date: 2019-7-8 13:50:59
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local ReturnDailyActivityCell = class("ReturnDailyActivityCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ReturnActivity = require("app.config.return_activity")
local ReturnDataHelper = require("app.utils.data.ReturnDataHelper")
local CustomActivityConst = require("app.const.CustomActivityConst")

ReturnDailyActivityCell.ITEM_GAP = 106--奖励道具之间的间隔

function ReturnDailyActivityCell:ctor()
	self._configId = 0

	local resource = {
		file = Path.getCSB("ReturnDailyActivityCell", "return"),
	}
	ReturnDailyActivityCell.super.ctor(self, resource)
end

function ReturnDailyActivityCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._btnGet:addClickEventListenerEx(handler(self,self._getReward))
	self._btnGet:setString(Lang.get("season_daily_buy"))

	self._btnBuy:setVisible(false)
end

function ReturnDailyActivityCell:update(data)
	--dump(data)
    
    local configInfo = ReturnActivity.get(data.id)
	--dump(configInfo)
	self._configId = data.id

    local des = ""
    if configInfo.mission_time > 1 then
    	des = Lang.getTxt(configInfo.mission_description, { num = configInfo.mission_time})
    else
    	des = configInfo.mission_description
    end

    self._textPlayerName:setString(des)

    self:_initRewardInfo(configInfo)

    local maxTimes = configInfo.mission_time

    local richText = Lang.get("return_progress",
        { title = Lang.get("common_text_progress"), 
            cur = data.num, curColor = Colors.colorToNumber(data.num >= maxTimes and Colors.NORMAL_BG_ONE or Colors.BRIGHT_BG_RED), 
            max = maxTimes, maxColor = Colors.colorToNumber(Colors.NORMAL_BG_ONE )
        }
    )
	self:_createProgressRichText(richText)
	
	if data.status == 1 then
		self._imageReceive:setVisible(true)
		self._btnGet:setVisible(false)
	else
		self._imageReceive:setVisible(false)
		self._btnGet:setVisible(true)

		self._btnGet:setEnabled(data.num >= maxTimes)
	end
end

function ReturnDailyActivityCell:_initRewardInfo(configInfo)
    local rewards = ReturnDataHelper.getRewardConfigInfo(configInfo, 3)
    --dump(rewards)
    local rewardTypes = {}
    for i = 1, #rewards do
		rewardTypes[i] = CustomActivityConst.REWARD_TYPE_ALL
    end
    self._commonRewardListNode:setGaps(ReturnDailyActivityCell.ITEM_GAP)
    self._commonRewardListNode:updateInfo(rewards,rewardTypes)
end


function ReturnDailyActivityCell:_onBtnClick(iconNameNode)

end

--创建富文本
function ReturnDailyActivityCell:_createProgressRichText(richText)
	self._nodeProgress:removeAllChildren()
	local widget = ccui.RichText:createWithContent(richText)
	widget:setAnchorPoint(cc.p(0.5,0.5))
	self._nodeProgress:addChild(widget)
end

function ReturnDailyActivityCell:_getReward()
	if G_UserData:getReturnData():isActivityEnd() then
		G_Prompt:showTip(Lang.get("customactivity_avatar_act_end_tip"))
		return
	end

	G_UserData:getReturnData():c2sReceiveAwards(0, self._configId)
end

return ReturnDailyActivityCell