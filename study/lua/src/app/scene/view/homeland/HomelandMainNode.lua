
-- Author: hedili
-- Date:2018-05-02 15:59:44
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local HomelandMainNode = class("HomelandMainNode", ViewBase)
local scheduler = require("cocos.framework.scheduler")
local HomelandConst = require("app.const.HomelandConst")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
function HomelandMainNode:ctor(homelandType, data)

	--csb bind var name
	self._homelandType = homelandType
	self._data = data
	self._btnAdd = nil  --Button
	self._effectNode = nil  --SingleNode
	self._imageCity = nil  --ImageView
	self._nodeAvatar = nil  --SingleNode
	self._panelContainer = nil  --Panel
	self._textLandName = nil  --Text

	local resource = {
		file = Path.getCSB("HomelandMainNode", "homeland"),
		binding = {
			_panelContainer = {
				events = {{event = "touch", method = "_onBtnAdd"}}
			},
		},
	}
	HomelandMainNode.super.ctor(self, resource)
end

-- Describle：
function HomelandMainNode:onCreate()
	if self:isFriendTree() == false then
		--local HomelandHarvestNode =require("app.scene.view.homeland.HomelandHarvestNode")
		--local node = HomelandHarvestNode.new()
		--node:setName("_harvestUI")
		--self._harvestNode:addChild(node)
		--self._harvestUI = node
	end

end

function HomelandMainNode:createSpineData( ... )
	-- body
	local config = self._data.treeCfg


	local spineNode = self._nodeAvatar:getChildByName("spineNode")
	if spineNode == nil then
		spineNode = require("yoka.node.SpineNode").new()
		spineNode:setAsset( Path.getEffectSpine(config.spine_res) )
		spineNode:setName("spineNode")
		self._nodeAvatar:addChild(spineNode)
	end
end

function HomelandMainNode:hideSpineNode()
	local spineNode = self._nodeAvatar:getChildByName("spineNode")
	if spineNode ~= nil then
		spineNode:setVisible(false)
	end
end

function HomelandMainNode:createMovingNode(movingName)
	local function effectFunction(effect)
		return cc.Node:create()
	end

	local function eventFunction(event)
		if event == "finish" then
		elseif event == "play" then
		end
	end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeAvatar, movingName, effectFunction, eventFunction, false)
	effect:setName("movingNode")
end

function HomelandMainNode:hideMovingNode()
	local movingNode = self._nodeAvatar:getChildByName("movingNode")
	if movingNode ~= nil then
		movingNode:removeFromParent()
	end
end

function HomelandMainNode:updateUI( data )
	-- body
	self._data = data
	local config = self._data.treeCfg

	local movingName = config.moving_name
	if movingName ~= nil and movingName ~= "" then
		self:hideMovingNode()
		self:hideSpineNode()
		self:createMovingNode(movingName)
	else
		self:hideMovingNode()
		self:createSpineData()
		local spineNode = self._nodeAvatar:getChildByName("spineNode")
		spineNode:setVisible(true)
		spineNode:setAnimation(config.animation_name,true)
	end

	HomelandHelp.updateNodeTreeTitle(self, self._data)

	--更新坐标
	self:setPosition(cc.p(config.spine_x, config.spine_y))
	self._panelContainer:setPosition(cc.p(config.click_x,config.click_y))
	local Node_treeTitle = self:getSubNodeByName("Node_treeTitle")
	Node_treeTitle:setPosition(cc.p(config.title_x, config.title_y))
	self._panelContainer:setContentSize(cc.size(config.width,config.height))
	self:setLocalZOrder(config.order)

	self._harvestNode:setPosition( cc.p( config.icon_x, config.icon_y ) )

	
	self:updateRedPoint()
	self:playLoopEffect()
end


function HomelandMainNode:_startCountDown()
	if self._timeScheduler == nil and self:isFriendTree() == false then
		self._timeScheduler = scheduler.scheduleGlobal(handler(self, self._updateCountDown),0.8)
		self:_updateCountDown()
	end
end

function HomelandMainNode:_updateCountDown( dt )
	-- body
	--if self._harvestUI and self:isFriendTree() == false then
	--	self._harvestUI:updateUI()
	--end
end

function HomelandMainNode:updateRedPoint( ... )
	-- body
	if self:isFriendTree() == false then
		local showRedPoint1 = not G_UserData:getHomeland():isTreeAwardTake() 
		local showRedPoint2 = HomelandHelp.checkMainTreeUp(self._data,false)
		self._redPoint:setVisible(showRedPoint1 or showRedPoint2)
	else
		self._redPoint:setVisible(false)
	end
end

function HomelandMainNode:_stopCountDown()
	if self._timeScheduler ~= nil and self:isFriendTree() == false then
		scheduler.unscheduleGlobal(self._timeScheduler)
		self._timeScheduler = nil
	end
end

-- Describle：
function HomelandMainNode:onEnter()
	--self:_startCountDown()
end

-- Describle：
function HomelandMainNode:onExit()
	--self:_stopCountDown()
end

function HomelandMainNode:isFriendTree( ... )
	-- body
	local HomelandConst = require("app.const.HomelandConst")
	if self._homelandType == HomelandConst.FRIEND_TREE then
		return true
	end 

	return false
end
-- Describle：
function HomelandMainNode:_onBtnAdd()
	-- body
	local PopupHomelandMainUp = require("app.scene.view.homeland.PopupHomelandMainUp")

	if self:isFriendTree() then
		local popUpDlg = PopupHomelandMainUp.new(self._data,self:isFriendTree())
		popUpDlg:openWithAction()
	else
		logWarn("HomelandMainNode:_onBtnAdd")
		local popUpDlg = PopupHomelandMainUp.new(self._data,self:isFriendTree())
		popUpDlg:openWithAction()
	end

end


function HomelandMainNode:playLvUpEffect( finishCall )
	-- body
	local function eventFunction(event)
        if event == "finish" and finishCall then
			finishCall()			
        end
	end

	G_EffectGfxMgr:createPlayGfx( self._nodeAvatar, self._data.treeCfg.up_effect,eventFunction, true )
end


function HomelandMainNode:playLoopEffect()
	self._nodeEffect:removeAllChildren()
	if self._data.treeCfg.up_loop_effect and self._data.treeCfg.up_loop_effect ~= "" then
		G_EffectGfxMgr:createPlayGfx( self._nodeEffect, self._data.treeCfg.up_loop_effect )
	end
end
return HomelandMainNode