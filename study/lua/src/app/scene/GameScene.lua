local GameScene = class("GameScene", cc.Scene)

GameScene.LEVEL_SUMMARY = 8000      -- 飘字
GameScene.LEVEL_SUBTITLE = 6000		-- 弹幕层
GameScene.LEVEL_POPUP = 7000		-- 弹出层
GameScene.LEVEL_TIPS = 8000		-- tips
GameScene.LEVEL_VOICE = 9000		-- 语音层

function GameScene:ctor(name, view)
	self._sceneName = name
    self._sceneView = view

	--CC_DESIGN_RESOLUTION.width, CC_DESIGN_RESOLUTION.height
	self._root = cc.Node:create()
    self._root:setContentSize(G_ResolutionManager:getDesignCCSize())
    self._root:setPosition(display.center)
    self._root:setAnchorPoint(0.5,0.5)
	self:addChild(self._root)
    self._root:addChild(self._sceneView)
	--
	self._popup = cc.Node:create()
    self._popup:setContentSize(G_ResolutionManager:getDesignCCSize())
    self._popup:setPosition(display.center)
    self._popup:setAnchorPoint(0.5,0.5)
	self:addChild(self._popup,GameScene.LEVEL_POPUP)


    self._tipsRootNode = cc.Node:create()
    self._tipsRootNode:setContentSize(G_ResolutionManager:getDesignCCSize())
    self._tipsRootNode:setPosition(display.center)
    self._tipsRootNode:setAnchorPoint(0.5,0.5)
	self:addChild(self._tipsRootNode,GameScene.LEVEL_TIPS)

    self._voiceLayer = cc.Node:create()
    self._voiceLayer:setContentSize(G_ResolutionManager:getDesignCCSize())
    self._voiceLayer:setPosition(display.center)
    self._voiceLayer:setAnchorPoint(0.5,0.5)
	self:addChild(self._voiceLayer,GameScene.LEVEL_VOICE)
end

function GameScene:onEnter()
    logWarn(" Enter "..self:getName())
    G_SignalManager:dispatch(SignalConst.EVENT_CHANGE_SCENE,true,self:getName())

    self._signalUseItemMsg = G_SignalManager:add(SignalConst.EVNET_USE_ITEM_SUCCESS, handler(self, self._onEventUseItem))
	self._signalAuctionBuyerReplace =  G_SignalManager:add(SignalConst.EVENT_AUCTION_BUYER_REPLACE, handler(self, self._onEventAuctionBuyerReplace))
    self._signalVipExpChange = G_SignalManager:add(SignalConst.EVENT_VIP_EXP_CHANGE, handler(self, self._onEventVipExpChange))
    self._signalRechargeNotice = G_SignalManager:add(SignalConst.EVENT_RECHARGE_NOTICE, handler(self, self._onEventRechargeNotice))
    


    --断线重连
	self._signalEnterGraveScene = G_SignalManager:add(SignalConst.EVENT_GRAVE_ENTER_SCENE, handler(self, self._onEventEnterGraveScene))
end

function GameScene:onEnterTransitionFinish()
    logWarn(" onEnterTransitionFinish "..self:getName())
    G_SignalManager:dispatch(SignalConst.EVENT_SCENE_TRANSITION,true,self:getName())
end

function GameScene:onExitTransitionStart()
    logWarn(" onExitTransitionStart "..self:getName())
    G_SignalManager:dispatch(SignalConst.EVENT_SCENE_TRANSITION,false,self:getName())
end


function GameScene:onExit()
    logWarn(" Exit  "..self:getName())
     self:_clearEvent()
    G_SignalManager:dispatch(SignalConst.EVENT_CHANGE_SCENE,false,self:getName())

    self._signalUseItemMsg:remove()
    self._signalUseItemMsg = nil
    self._signalAuctionBuyerReplace:remove()
    self._signalAuctionBuyerReplace = nil

    self._signalVipExpChange:remove()
	self._signalVipExpChange = nil

	self._signalEnterGraveScene:remove()
	self._signalEnterGraveScene = nil

	self._signalRechargeNotice:remove()
    self._signalRechargeNotice = nil
    
    -- self:setAccelerometerEnabled(false)
end

--
function GameScene:addAccelerationEvent(callback, target)
    self:setAccelerometerEnabled(true)
    local listerner  = cc.EventListenerAcceleration:create(callback)
    -- -- 获取事件派发器然后设置触摸绑定到精灵，优先级为默认的0
    self:getEventDispatcher():addEventListenerWithSceneGraphPriority(listerner, target)
end

--
function GameScene:getName()
    return self._sceneName
end

--
function GameScene:addChildToRoot(node)
	self._root:addChild(node)
end

--
function GameScene:addChildToPopup(node)
	logWarn("==================addChildToPopup: "..(node.__cname or ""))
	node:setPosition(G_ResolutionManager:getDesignCCPoint())
	self._popup:addChild(node)
end

function GameScene:getPopupByName(name)
	return self._popup:getChildByName(name)
end

function GameScene:getPopupNode( ... )
    -- body
    return self._popup
end


function GameScene:addTips(node)
	logWarn("==================addTips: "..(node.__cname or ""))
	node:setPosition(G_ResolutionManager:getDesignCCPoint())
	self._tipsRootNode:addChild(node)
end


function GameScene:removeAllTips()
    self._tipsRootNode:removeAllChildren()
end

--

function GameScene:addChildToVoiceLayer(node)
	logWarn("==================addChildToVoiceLayer: "..(node.__cname or ""))
	node:setPosition(G_ResolutionManager:getDesignCCPoint())
	self._voiceLayer:addChild(node)
end

function GameScene:clearVoiceLayer()
    self._voiceLayer:removeAllChildren()
end

function GameScene:getVoiceViewByName(name)
	return self._voiceLayer:getChildByName(name)
end


function GameScene:addTextSummary(child, tag)
    -- body
    if self._nodeTextSummary == nil then
        self._nodeTextSummary = display.newNode()
        self._nodeTextSummary:setContentSize(G_ResolutionManager:getDesignCCSize())
        self._nodeTextSummary:setPosition(display.center)
        self._nodeTextSummary:setAnchorPoint(0.5,0.5)
        if self:isRunning() then
            self:addChild(self._nodeTextSummary, GameScene.LEVEL_SUMMARY)
            self:sortAllChildren()
        else
            self._nodeTextSummary:retain()
            cc.Director:getInstance():getActionManager():addAction(cc.CallFunc:create(function()
                self:addChild(self._nodeTextSummary, GameScene.LEVEL_SUMMARY)
                self._nodeTextSummary:release()
                self:sortAllChildren()
            end), self, false)
        end
    end

    return self._nodeTextSummary:addChild(child, 0, tag or 0)
end


function GameScene:clearTextSummary( ... )
    -- body
    if(self._nodeTextSummary ~= nil)then
        self._nodeTextSummary:removeAllChildren(true)
    end
end

function GameScene:addToSubtitleLayer(child, tag)
    if not self._subtitleRootNode then
        self._subtitleRootNode = display.newNode()
        self._subtitleRootNode:setContentSize(G_ResolutionManager:getDesignCCSize())
        self._subtitleRootNode:setPosition(display.center)
        self._subtitleRootNode:setAnchorPoint(0.5,0.5)

        if self:isRunning() then
            self:addChild(self._subtitleRootNode, GameScene.LEVEL_SUBTITLE)
            self:sortAllChildren()
        else
            self._subtitleRootNode:retain()
            cc.Director:getInstance():getActionManager():addAction(cc.CallFunc:create(function()
                self:addChild(self._subtitleRootNode, GameScene.LEVEL_SUBTITLE)
                self._subtitleRootNode:release()
                self:sortAllChildren()
            end), self, false)
        end
    end

	return self._subtitleRootNode:addChild(child, 0, tag or 0)
end


function GameScene:isRootScene()
	--error("Subclasses must override isRootScene methods of the parent class!")
	if self._sceneView.isRootScene then
		return self._sceneView:isRootScene()
	end
	return false
end

function GameScene:getSceneView()
    return self._sceneView
end

function GameScene:_clearEvent( ... )
   if self._signalGetUserBaseInfo then
        self._signalGetUserBaseInfo:remove()
        self._signalGetUserBaseInfo = nil
    end
    if self._signalGetUserDetailInfo then
        self._signalGetUserDetailInfo:remove()
        self._signalGetUserDetailInfo = nil
    end
    if  self._signalPracticePlayer then
        self._signalPracticePlayer:remove()
        self._signalPracticePlayer =nil
    end
end

--玩家查看信息
function GameScene:addGetUserBaseInfoEvent( ... )
    -- body
     self:_clearEvent()

     self._signalGetUserBaseInfo = G_SignalManager:add( SignalConst.EVENT_GET_USER_BASE_INFO, handler(self, self._onEventGetUserBaseInfo))

     self._signalGetUserDetailInfo = G_SignalManager:add( SignalConst.EVENT_GET_USER_DETAIL_INFO, handler(self, self._onEventGetUserDetailInfo))

     self._signalPracticePlayer = G_SignalManager:add( SignalConst.EVENT_PRACTICE_PLAYER, handler(self, self._onEventPracticePlayer))
end


--
function GameScene:_onEventUseItem(id, message)
	local itemId = rawget(message, "id") or 0
	local awards = rawget(message,"awards") or {}
    local itemInfo = require("app.config.item").get(itemId)

    local DataConst = require("app.const.DataConst")
    if DataConst.JADE_STONE_BOX[itemId] then
        local popupObtainJadeStone = require("app.scene.view.equipmentJade.PopupObtainJadeStone").new(itemId,awards)
        popupObtainJadeStone:openWithAction()
        return 
    end

	if itemId > 0 then
		if itemInfo.reward_type == 0 then
			G_Prompt:showTip(itemInfo.tips)
        else
            if awards and #awards > 0 then
			    local PopupGetRewards = require("app.ui.PopupGetRewards").new()
                PopupGetRewards:showRewards(awards)
            end
		end
	end
end

--收到查看玩家信息 玩家阵容 通知
function GameScene:_onEventGetUserBaseInfo( id, message )
    -- body
    if(message == nil)then return end

    --TODO 弹出玩家信息界面
    local PopupUserBaseInfo = require("app.ui.PopupUserBaseInfo")
    local popup = PopupUserBaseInfo.new()
    popup:setName("PopupUserBaseInfo")
    popup:updateUI(message)
    popup:openWithAction()
end


--收到查看玩家信息 玩家阵容 通知
function GameScene:_onEventGetUserDetailInfo( id, message )
    -- body
    if(message == nil)then return end

    --TODO 玩家详细信息查看
    local PopupUserDetailInfo = require("app.ui.PopupUserDetailInfo")
    local popup = PopupUserDetailInfo.new(message)
    popup:setName("PopupUserDetailInfo")
    popup:openWithAction()
end


--切磋事件
--[[
    message S2C_Practice {
	optional uint32 ret = 1;
	optional BattleReport battle_report = 2;
}
]]
function GameScene:_onEventPracticePlayer( id, message )
    -- body
    if(message == nil)then return end
    logWarn("GameScene:_onEventPracticePlayer")

    G_SceneManager:registerGetReport(message.battle_report, function() self:_enterFightView() end)
end

function GameScene:_enterFightView()
    local ReportParser = require("app.fight.report.ReportParser")
    local battleReport = G_UserData:getFightReport():getReport()
    local reportData = ReportParser.parse(battleReport)
    local battleData = require("app.utils.BattleDataHelper").parseFriendFight()
    G_SceneManager:showScene("fight", reportData, battleData, true)
    
    -- local G_SceneManager:showScene("fight", reportData, battleData)
end


--拍卖玩家被顶
function GameScene:_onEventAuctionBuyerReplace(id, message)
	local itemAward = rawget(message,"item")
	if itemAward == nil then
		return
	end
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local itemParams = TypeConvertHelper.convert(itemAward.type, itemAward.value, itemAward.size)
    if itemParams == nil then
        return
    end

    local moneyType = rawget(message, "money_type") or 0
    local DataConst = require("app.const.DataConst")
    local moneyParams
    if moneyType==1 then
		moneyParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
	else
		moneyParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND)
    end

    local richText1 = Lang.get("auction_buyer_replace",
    {
        itemName = itemParams.name,
		itemColor = Colors.colorToNumber(itemParams.icon_color),
        outlineColor =  Colors.colorToNumber(itemParams.icon_color_outline ),
        itemNum = itemParams.size,
        resName = moneyParams.name,
    })

    G_Prompt:showTip(richText1)

end

--
function GameScene:setVipChangeTipDisable(enable)
	if enable then
		self._disablePopVipChange = true
	else
		self._disablePopVipChange = nil
	end
end

--vip 经验显示
function GameScene:_onEventVipExpChange(event, addExp)
	if self._disablePopVipChange then
		return
	end
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local DataConst = require("app.const.DataConst")
	logWarn(" ActivityView xxxx xxe "..tostring(addExp))
	--if addExp > 0 then
		local awards = {
			{
				size = addExp,
				type =  TypeConvertHelper.TYPE_RESOURCE,
				value = DataConst.RES_VIP
			}
		}

		G_Prompt:showAwards(awards)

	--end
end

function GameScene:_onEventRechargeNotice(event,id,message)
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local DataConst = require("app.const.DataConst")

    local function searchResourceType(productId)
        -- body
        local VipPayInfo = require("app.config.vip_pay")
        local RechargeConst = require("app.const.RechargeConst")
        for i = 1, VipPayInfo.length() do
            local rechargeInfo = VipPayInfo.indexOf(i)
            if rawequal(rechargeInfo.product_id, productId) and rechargeInfo.card_type == RechargeConst.VIP_PAY_TYPE_JADE then
                return DataConst.RES_JADE2
            end
        end
        return DataConst.RES_DIAMOND
    end

	local gold = rawget(message, "gold") or 0
    if gold > 0 then
        
        local value = searchResourceType(rawget(message, "product_id"))
		local awards  = {
			{type = TypeConvertHelper.TYPE_RESOURCE ,value = value,size = gold}
		}
		G_Prompt:showAwards(awards)
	end
end

--跳转到先秦皇陵活动
function GameScene:_onEventEnterGraveScene( ... )
	logWarn("GameScene:_onEventEnterGraveScene")

    if self:getName() ~= "fight" then
        local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
        local funcId = FunctionConst.FUNC_MAUSOLEUM
        WayFuncDataHelper.gotoModuleByFuncId(funcId)
    end

end

return GameScene
