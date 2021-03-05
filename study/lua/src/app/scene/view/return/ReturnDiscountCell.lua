--
-- Author: hyl
-- Date: 2019-7-8 13:50:59
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local ReturnDiscountCell = class("ReturnDiscountCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ReturnDiscount = require("app.config.return_discount")
local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
local VipPay = require("app.config.vip_pay")
local CustomActivityConst = require("app.const.CustomActivityConst")
local ReturnDataHelper = require("app.utils.data.ReturnDataHelper")

ReturnDiscountCell.ITEM_GAP = 106--奖励道具之间的间隔
ReturnDiscountCell.ITEM_OR_GAP = 132--可选奖励道具之间间隔

function ReturnDiscountCell:ctor()
    self._configId = 0
    
	local resource = {
		file = Path.getCSB("ReturnDailyActivityCell", "return"),
        binding = {
            _btnBuy = {
				events = {{event = "touch", method = "_onBtnBuyClick"}}
            },
            _btnGet = {
				events = {{event = "touch", method = "_onBtnGetClick"}}
			},
        },
	}
	ReturnDiscountCell.super.ctor(self, resource)
end

function ReturnDiscountCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function ReturnDiscountCell:update(data)
	--dump(data)
    
    local configInfo = ReturnDiscount.get(data.id)
    --dump(configInfo)

    self._configId = data.id

    self:_initRewardInfo(configInfo)

    if configInfo.reward_type == 2 then
        local rechargeNum = G_UserData:getReturnData():getRechargeNum()

        self._textPlayerName:setString(Lang.getTxt(configInfo.txt, { num = configInfo.price}))

        self._btnGet:setVisible(data.num > 0)
        self._btnBuy:setVisible(false)

        self._imageReceive:setVisible(data.num == 0)

        self._btnGet:setString(Lang.get("lang_activity_fund_receive"))

        local richText = Lang.get("return_progress",
            { 
                title = Lang.get("times_title1"), 
                cur = rechargeNum, curColor = Colors.colorToNumber(Colors.NORMAL_BG_ONE), 
                max = configInfo.price, maxColor = Colors.colorToNumber(Colors.NORMAL_BG_ONE )
            }
        )
        self:_createProgressRichText(richText)

        self._btnGet:setEnabled(data.num > 0 and rechargeNum >= configInfo.price)
    else
        self._textPlayerName:setString(configInfo.txt)

        --print("configInfo.vip_pay_id "..configInfo.vip_pay_id)
        local vipPayInfo = VipPay.get(configInfo.vip_pay_id)

        self._btnGet:setVisible(false)

        self._btnBuy:setVisible(true)
        self._btnBuy:setString(vipPayInfo.name)

        self._imageReceive:setVisible(false)

        local maxTimes = configInfo.time

        local richText = Lang.get("return_progress",
            { 
                title = Lang.get("times_title"), 
                cur = data.num, curColor = Colors.colorToNumber(data.num > 0 and Colors.NORMAL_BG_ONE or Colors.BRIGHT_BG_RED), 
                max = maxTimes, maxColor = Colors.colorToNumber(Colors.NORMAL_BG_ONE )
            }
        )
        self:_createProgressRichText(richText)

        self._btnBuy:setEnabled(data.num > 0)
    end
end

function ReturnDiscountCell:_onBtnGetClick()
    if G_UserData:getReturnData():isActivityEnd() then
		G_Prompt:showTip(Lang.get("customactivity_avatar_act_end_tip"))
		return
    end
    
    local configInfo = ReturnDiscount.get(self._configId)

    if configInfo.reward_type == 2 then      -- 累计充值奖励
        local function callBackFunction(awardItem, index, total)
            if awardItem == nil then
                G_Prompt:showTip(Lang.get("common_choose_item"))
                return true
            end
            --G_UserData:getItems():c2sUseItem(awardItem.itemId, total or 1, 0, awardItem.index, awardItem.boxId)
            G_UserData:getReturnData():c2sReceiveAwards(3, self._configId, index)
            return false
        end

        if configInfo.is_choose == 1 then    -- 奖励多选1
            local rewardPanel = require("app.ui.PopupSelectReward").new(Lang.get("popup_title_select_reward"), callBackFunction)
            local rewards = ReturnDataHelper.getRewardConfigInfo(configInfo, 3)
            rewardPanel:updateUI(rewards)
            --rewardPanel:setMaxLimit(1)
            rewardPanel:openWithAction()
        else
            G_UserData:getReturnData():c2sReceiveAwards(3, self._configId)
        end
    end
end

function ReturnDiscountCell:_onBtnBuyClick ()
    if G_UserData:getReturnData():isActivityEnd() then
		G_Prompt:showTip(Lang.get("customactivity_avatar_act_end_tip"))
		return
    end
    
    local configInfo = ReturnDiscount.get(self._configId)

    if configInfo.reward_type == 2 then      -- 累计充值奖励

    else
        local vipPayInfo = VipPay.get(configInfo.vip_pay_id)
        G_GameAgent:pay(vipPayInfo.id, 
            vipPayInfo.rmb, 
            vipPayInfo.product_id, 
            vipPayInfo.name, 
            vipPayInfo.name
        )
    end
end

function ReturnDiscountCell:_initRewardInfo(configInfo)
    local rewards = ReturnDataHelper.getRewardConfigInfo(configInfo, 3)
    --dump(rewards)
    local rewardTypes = {}

    local configInfo = ReturnDiscount.get(self._configId)

    if configInfo.is_choose == 1 then    -- 奖励多选1
        for i = 1, #rewards do
            rewardTypes[i] = CustomActivityConst.REWARD_TYPE_SELECT
        end
        self._commonRewardListNode:setGaps(ReturnDiscountCell.ITEM_GAP, nil, ReturnDiscountCell.ITEM_OR_GAP)
        self._commonRewardListNode:updateInfo(rewards,rewardTypes)
    else
        for i = 1, #rewards do
            rewardTypes[i] = CustomActivityConst.REWARD_TYPE_ALL
        end
        self._commonRewardListNode:setGaps(ReturnDiscountCell.ITEM_GAP)
        self._commonRewardListNode:updateInfo(rewards,rewardTypes)
    end
end

--创建富文本
function ReturnDiscountCell:_createProgressRichText(richText)
    self._nodeProgress:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0.5,0.5))
    self._nodeProgress:addChild(widget)
end


return ReturnDiscountCell