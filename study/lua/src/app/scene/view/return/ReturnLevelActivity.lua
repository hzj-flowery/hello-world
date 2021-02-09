--
-- Author: hyl
-- Date: 2019-7-4
-- 老玩家回归
local ViewBase = require("app.ui.ViewBase")
local ReturnLevelActivity = class("ReturnLevelActivity", ViewBase)
local ParameterIDConst = require("app.const.ParameterIDConst")
local UserCheck = require("app.utils.logic.UserCheck")
local ReturnLevel = require("app.config.return_lv")
local VipPay = require("app.config.vip_pay")

function ReturnLevelActivity:ctor()
	self._selectTabIndex = 0
	self._activityView = {}

	local resource = {
		file = Path.getCSB("ReturnLevelActivity", "return"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_button = {
				events = {{event = "touch", method = "_onLevelupBtn"}}
			},
		}
	}
	ReturnLevelActivity.super.ctor(self, resource)
end

function ReturnLevelActivity:onCreate()
	self._des:addChild(self:_createContentWidget(Lang.get("return_daily_des1")))
	self._desTitle:setString(Lang.get("return_daily_des1_title"))

	self:_initLevelBtn()
end

function ReturnLevelActivity:_initLevelBtn()
	local direct_level = G_UserData:getReturnData():getDirectLevelNum()
	local playerLevel = G_UserData:getBase():getLevel()

	self._button:setVisible(playerLevel < direct_level)

	self._btnEffectNode:removeAllChildren()
	G_EffectGfxMgr:createPlayGfx( self._btnEffectNode, "effect_anniutexiao1" )
	
	self:_setBtnLevelText(direct_level)
end

function ReturnLevelActivity:_playLevelUpEffect ()
	local function effectFunction(effect)
        if effect == "gongke_txt" then
            local fontColor = Colors.getSmallMineGuild()
            local content = Lang.get("return_level_up_succ")

            local label = cc.Label:createWithTTF(content, Path.getFontW8(), 52)
			label:setColor(fontColor)
			label:enableOutline(cc.c3b(0xff, 0x78, 0x00), 2)
            return label
        end
    end
    local function eventFunction(event)
        if event == "finish" then
            --升级检查
			-- local UserCheck = require("app.utils.logic.UserCheck")
			-- UserCheck.isLevelUp()
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self._effectNode, "moving_gongkexiaocheng", effectFunction, eventFunction, true )
end


function ReturnLevelActivity:onEnter()
	self._signalDirectLevelup = G_SignalManager:add(SignalConst.EVENT_RETURN_LEVEL_DIRECT_UP, handler(self, self._onDirectLevelUpSucc))
end

function ReturnLevelActivity:_onDirectLevelUpSucc()
	self:_initLevelBtn()
	self:_playLevelUpEffect()
end

function ReturnLevelActivity:onExit()
	self._signalDirectLevelup:remove()
	self._signalDirectLevelup = nil
end

function ReturnLevelActivity:_createContentWidget(desc)
    --dump(desc)
	local widget = ccui.Widget:create()

	local UIHelper = require("yoka.utils.UIHelper")
	local labelText = UIHelper.createMultiAutoCenterRichTextByParam(desc,
	    {defaultColor = Colors.BUTTON_ONE_NORMAL, defaultSize = 18,} , 22, 1, 450, "=")

	labelText:setAnchorPoint(cc.p(0,1))
	labelText:setPosition(cc.p(0, 0))
	
	widget:addChild(labelText)

	return widget
end

function ReturnLevelActivity:_setBtnLevelText(level_num)
	if level_num == nil or type(level_num)~="number" then return end

	if level_num >= 100 then
		local num1 = math.floor( level_num / 100 )
		local temp = level_num % 100
		local num2 = math.floor( temp / 10 )
		local num3 = temp % 10

		self._threeNum:setVisible(true)
		self._twoNum:setVisible(false)

		self._num_3_1:setString(num1)
		self._num_3_2:setString(num2)
		self._num_3_3:setString(num3)

		self._image1:setPositionX(50.63)
		self._image2:setPositionX(224.94)
	else
		local num1 = math.floor( level_num / 10 )
		local num2 = level_num % 10

		self._threeNum:setVisible(false)
		self._twoNum:setVisible(true)

		self._num_2_1:setString(num1)
		self._num_2_2:setString(num2)

		self._image1:setPositionX(61.63)
		self._image2:setPositionX(204.94)
	end
end

function ReturnLevelActivity:_onLevelupBtn()
	--G_UserData:getReturnData():c2sLevelDirectUp()
	local payId = G_UserData:getReturnData():getDirectLevelPayId()
	if payId == 0 then
		return
	end

	local vipPayInfo = VipPay.get(payId)

	if vipPayInfo then
		local direct_level = G_UserData:getReturnData():getDirectLevelNum()
		local title = Lang.get("guild_appoint_confirm_title")
        local content = Lang.get("return_level_up_cost_tips", {cost = vipPayInfo.rmb, level = direct_level})
		local popupAlert = require("app.ui.PopupAlert").new(title, content, function () 
				G_GameAgent:pay(vipPayInfo.id, 
					vipPayInfo.rmb, 
					vipPayInfo.product_id, 
					vipPayInfo.name, 
					vipPayInfo.name
				)
			end
		)
        popupAlert:openWithAction()
	end
end

return ReturnLevelActivity