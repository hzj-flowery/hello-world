local ViewBase = require("app.ui.ViewBase")
local QinTombBattleView = class("QinTombBattleView", ViewBase)
local Path = require("app.utils.Path")
local AudioConst = require("app.const.AudioConst")
local QinTombBattleMapNode = import(".QinTombBattleMapNode")
local QinTombMiniMap = import(".QinTombMiniMap") 
local QinTombConst = require("app.const.QinTombConst")
local QinTombRebornCDNode = import(".QinTombRebornCDNode")
local QinTombBattleResultAnimation = import(".QinTombBattleResultAnimation")
local ShopFix = require("app.config.shop_fix")
local ShopConst = require("app.const.ShopConst")
local UserDataHelper = require("app.utils.UserDataHelper")

function QinTombBattleView:ctor()
	self._mapNode = nil	--底图
	self._topBar = nil		--顶部条

	self._topbarBase = nil
	self._popSceneTimes = 1
	self._popupBattleResult = nil
	self._commonNodeTime = nil
	local resource = {
		file = Path.getCSB("QinTombBattleView", "qinTomb"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnReport = {
				events = {{event = "touch", method = "_onBtnReport"}}
			},
			_btnMail =  {
				events = {{event = "touch", method = "_onBtnMail"}}
			}
		}
	}
	self:setName("QinTombBattleView")
	QinTombBattleView.super.ctor(self, resource)
end

function QinTombBattleView:onCreate()

	local mapNode =  QinTombBattleMapNode.new()
	local miniMapNode = QinTombMiniMap.new()
	self._battleMapNode = mapNode
	self._mapNode:addChild(mapNode)
	self._miniMapNode = miniMapNode
	self._miniNode:addChild(miniMapNode)

	self._btnReport:updateUI(FunctionConst.FUNC_ARENA_REPORT)

	local rebornCDNode = QinTombRebornCDNode.new()
    self._rebornCDNode = rebornCDNode
    self._nodeRebornCDParent:addChild(rebornCDNode)


	self._topbarBase:setImageTitle("txt_sys_qintombo")
	self._commonHelp:addClickEventListenerEx(handler(self, self._onClickHelp))
    self._topbarBase:setCallBackOnBack(handler(self,self._onBtnOut))
    local TopBarStyleConst = require("app.const.TopBarStyleConst")
    self._topbarBase:updateUI(TopBarStyleConst.STYLE_QINTOMB)

	G_EffectGfxMgr:createPlayGfx(self._autoMovingNode, "effect_xianqinhuangling_zidongxunluzhong", nil, true)
	

	
	self._autoMovingNode:setVisible(false)

	--皇陵邮件刷新显示
	self._btnMail:updateUI(FunctionConst.FUNC_MAIL_RED)
	self._btnMail:setVisible(false)
	self:_updateMailShow()
end


-- Describle：离开队伍
function QinTombBattleView:_onBtnOut()

	local GroupsViewHelper = require("app.scene.view.groups.GroupsViewHelper")
	GroupsViewHelper.quitGroupTip()

end

function QinTombBattleView:_onBtnMail( ... )
	-- body
	local WayFuncDataHelper	= require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_MAIL_RED)
	
end

function QinTombBattleView:_onBtnReport()
	--G_SceneManager:showDialog("app.scene.view.arena.PopupArenaReport")

    local PopupQinTombReport = require("app.scene.view.qinTomb.PopupQinTombReport").new()
    PopupQinTombReport:openWithAction()


end


function QinTombBattleView:_onClickHelp( sender )
	-- body
	local PopupQinTombHelp = require("app.scene.view.qinTomb.PopupQinTombHelp")
	local dlg = PopupQinTombHelp.new()
	dlg:updateByFunctionId(FunctionConst.FUNC_MAUSOLEUM)
	dlg:open()
end

--


function QinTombBattleView:onEnter()
	self._popSceneTimes = 1
	self._signalGraveBattleNotice = G_SignalManager:add(SignalConst.EVENT_GRAVE_BATTLE_NOTICE, handler(self, self._onEventGraveBattleNotice))
	
	self._signalGraveLeaveBattle = G_SignalManager:add(SignalConst.EVENT_GRAVE_LEAVE_BATTLE,handler(self,
	self._onEventGraveLeaveBattle))

	self._signalGraveLeaveScene = G_SignalManager:add(SignalConst.EVENT_GROUP_OUTSIDE_STATE, handler(self, self._onEventGraveLeaveScene))

	--
	self._signalGraveTimeFinish = G_SignalManager:add(SignalConst.EVENT_GRAVE_TIME_FINISH, handler(self, self._onEventUserDataUpdate))

	self._signalUserDataUpdate = G_SignalManager:add(SignalConst.EVENT_RECV_ROLE_INFO, handler(self, self._onEventUserDataUpdate))

	self._signalRedPointUpdate      = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))

	self._signalGraveReward = G_SignalManager:add(SignalConst.EVENT_GRAVE_GETREWARD, handler(self, self._onEventGraveReward))

	self:scheduleUpdateWithPriorityLua(handler(self,self._onUpdate),0)

	self._commonNodeTime:updateQinTomb()
	self._commonNodeTime:setAddTouchCallback(function ()
		local shopFixConfig = ShopFix.get(150)
		local itemId = shopFixConfig.value
		local itemType = shopFixConfig.type
		local shopItemData = G_UserData:getShops():getFixShopGoodsByResId(ShopConst.NORMAL_SHOP, itemType, itemId)

		local itemNum = UserDataHelper.getNumByTypeAndValue(itemType, itemId)

		local remainCount = shopFixConfig.num_ban_value - shopItemData:getBuyCount()
        if remainCount > 0 or itemNum > 0 then
			local popup = require("app.scene.view.qinTomb.QinTombItemBuyUse").new()
			popup:updateUIExt(150)
			popup:openWithAction()
		else
			G_Prompt:showTip(Lang.get("common_use_qintomb_item_no_have"))
		end
	end)

	--if G_UserData:getBase():getGrave_left_sec() then
	 --	local endTime = G_UserData:getBase():getGrave_left_sec() + G_ServerTime:getTime()
	-- 	self._commonCountDown:startCountDown(Lang.get("groups_remaining_time"), endTime)
	 --	self._commonCountDown:setVisible(true)
	--else	
	-- 	self._commonCountDown:setVisible(false)
	--end
	logWarn("QinTombBattleView onEnter")
	G_AudioManager:playMusicWithId(AudioConst.MUSIC_BGM_HUANGLIN)

	self._rebornCDNode:updateVisible()
	self:_refreshRedPoint()
end

-- user数据更新
function QinTombBattleView:_onEventUserDataUpdate(_, param)
	self._commonNodeTime:updateQinTomb()
end

--小红点刷新
function QinTombBattleView:_onEventRedPointUpdate(id, funcId, param)
	self:_updateMailShow()
	self:_refreshRedPoint()
end


function QinTombBattleView:_onEventGraveReward( id, message )
	-- body
	local awards = rawget(message, "awards") or {}

	if #awards > 0 then
		local DropHelper = require("app.utils.DropHelper")
		local merageAwards = DropHelper.merageAwardList(awards)
		G_Prompt:showAwards(merageAwards)
		--local PopupGetRewards = require("app.ui.PopupGetRewards").new()
		--PopupGetRewards:showRewards(merageAwards)
	end
end

--邮件显示
function QinTombBattleView:_updateMailShow( ... )
	-- body
	local RedPointHelper = require("app.data.RedPointHelper")
	local visible =  RedPointHelper.isModuleReach(FunctionConst.FUNC_MAIL)
	self._btnMail:setVisible(visible)
	if visible and visible == true then
		self._btnMail:showRedPoint(true)
		self._btnMail:playFuncGfx()
	end
	
	--mailShow = visible
end

function QinTombBattleView:onExit()
	self._signalGraveBattleNotice:remove()
	self._signalGraveBattleNotice = nil
	self._signalGraveLeaveBattle:remove()
	self._signalGraveLeaveBattle =nil
	self._signalGraveLeaveScene:remove()
	self._signalGraveLeaveScene = nil
	self._signalUserDataUpdate:remove()
	self._signalUserDataUpdate = nil
	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate =nil 
	self._signalGraveReward:remove()
	self._signalGraveReward = nil
	self._signalGraveTimeFinish:remove()
	self._signalGraveTimeFinish = nil
	
	self:unscheduleUpdate() 
end

function QinTombBattleView:_onUpdate(dt)
    local scaleFator = QinTombConst.CAMERA_SCALE_MIN

	--根据相机位置更新怪物附近战况
	local cameraPos, cameraSize = self._battleMapNode:getCameraPos()
	self._miniMapNode:updateCamera(cameraPos.x*scaleFator, cameraPos.y*scaleFator)
	local monsterKey = self._battleMapNode:getMonsterInTheCamera(cameraPos, cameraSize)
	local selfPosX, selfPosY = self._battleMapNode:getSelfTeamPos()
	if selfPosX and selfPosY then
		self._miniMapNode:updateSelf(selfPosX, selfPosY, monsterKey )
	end
	self._battleMapNode:updateUI(monsterKey)

	if self._rebornCDNode:isVisible() == true then
		local function finishCall( ... )
			-- body
			self:updateToRebornPos()
		end
		self._rebornCDNode:refreshCdTimeView(finishCall)
	end
	
	self:updateAuotMovingEffect()
end

--更新自动寻路特效
function QinTombBattleView:updateAuotMovingEffect( ... )
	-- body
	local selfTeam = G_UserData:getQinTomb():getSelfTeam()
	if selfTeam == nil then
		return
	end

	self._autoMovingNode:setVisible(false)
	if selfTeam:getCurrState() == QinTombConst.TEAM_STATE_MOVING then
		self._autoMovingNode:setVisible(true)
	end
end

function QinTombBattleView:updateToRebornPos( ... )
	-- body
	logWarn("QinTombBattleView:updateToRebornPos")
	self._battleMapNode:gotoMyPosition(true)
end

--收到战斗通知，并且是自己时。。处理死亡事件。。
function QinTombBattleView:_onEventGraveLeaveBattle(event,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		--G_Prompt:showTip(Lang.get("qin_tomb_error3"))
	end
end

--离开墓地事件，可能是组队被T，或者队伍解散
function QinTombBattleView:_onEventGraveLeaveScene(event, reason)
	-- body
	if self._popSceneTimes == 1 then
		local reasonIndex = reason or 0
		local langStr = Lang.get("qin_tomb_leave_out"..reasonIndex)
		--加入弹框，再退出
		local function onClick( ... )
			-- body
			G_SceneManager:showScene("main")
		end
		local UIPopupHelper = require("app.utils.UIPopupHelper")
		UIPopupHelper.popupOkDialog(nil,langStr,onClick, Lang.get("recovery_btn_ok"))
	end
	self._popSceneTimes = self._popSceneTimes + 1
end


function QinTombBattleView:_refreshRedPoint( ... )
	-- body
	local value = G_UserData:getRedPoint():isQinTombReport()
	dump(value)
	self._btnReport:showRedPoint(value)
end
--收到战斗通知，并且是自己时。。处理死亡事件。。
function QinTombBattleView:_onEventGraveBattleNotice(event,message)



	local report = rawget(message, "report")
	if report then
		local is_win = report.is_win
		if self._popupBattleResult ~= nil then
			if is_win == false then
				self._rebornCDNode:startCD()
			end
			return
		end
		
		self._popupBattleResult = QinTombBattleResultAnimation.new()
		local function finishCallBack( ... )
			self._popupBattleResult = nil
			--进入死亡倒计时
			if is_win == false then
				self._rebornCDNode:startCD()
			end
		end

		self._popupBattleResult:updateUI(report)
		self._popupBattleResult:showResult(finishCallBack)
	else

	end

end

return QinTombBattleView
