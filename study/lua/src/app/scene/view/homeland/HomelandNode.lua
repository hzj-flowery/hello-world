
-- Author: hedili
-- Date:2018-05-02 15:59:44
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local HomelandNode = class("HomelandNode", ViewBase)
local HomelandConst = require("app.const.HomelandConst")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")

function HomelandNode:ctor(homelandType, data)

	--csb bind var name
	self._homelandType = homelandType
	self._data = data
	self._btnAdd = nil  --Button
	self._effectNode = nil  --SingleNode
	self._imageCity = nil  --ImageView
	self._nodeCity = nil  --SingleNode
	self._panelContainer = nil  --Panel
	self._textLandName = nil  --Text

	local resource = {
		file = Path.getCSB("HomelandNode", "homeland"),
		binding = {
			_panelContainer = {
				events = {{event = "touch", method = "_onBtnAdd"}}
			},
		},
	}
	HomelandNode.super.ctor(self, resource)
end

-- Describle：
function HomelandNode:onCreate()
	
end


function HomelandNode:createSpineData( ... )
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

function HomelandNode:hideSpineNode()
	local spineNode = self._nodeAvatar:getChildByName("spineNode")
	if spineNode ~= nil then
		spineNode:setVisible(false)
	end
end

function HomelandNode:createMovingNode(movingName)
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

function HomelandNode:hideMovingNode()
	local movingNode = self._nodeAvatar:getChildByName("movingNode")
	if movingNode ~= nil then
		movingNode:removeFromParent()
	end
end

function HomelandNode:getTreeCfg( ... )
	-- body
	return self._data.treeCfg
end

function HomelandNode:updateUI( data )
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


	self._nodeAvatar:setVisible(true)
	self._panelContainer:setVisible(true)
	
	if config.type == HomelandConst.MAX_SUB_TREE_TYPE6  then
		if self._data.treeLevel == 0 then
			self._nodeAvatar:setVisible(false)
			self._panelContainer:setVisible(false)
		end
	end
	self:updateRedPoint()
	self:playLoopEffect()
end

-- Describle：
function HomelandNode:onEnter()

end

-- Describle：
function HomelandNode:onExit()

end
-- Describle：

function HomelandNode:isSubTreeOpen( ... )
	-- body
	return self._data.treeLevel > 0
end

function HomelandNode:_onBtnAdd()
	-- body
	if self._data.treeLevel == 0 then
		return
	end
	-- body
	if self:isFriendTree() then
		local PopupHomelandSubUp = require("app.scene.view.homeland.PopupHomelandSubUp")
		local popUpDlg = PopupHomelandSubUp.new(self._data, self:isFriendTree())

		popUpDlg:openWithAction()
	else
		local PopupHomelandSubUp = require("app.scene.view.homeland.PopupHomelandSubUp")
		local popUpDlg = PopupHomelandSubUp.new(self._data , self:isFriendTree())

		popUpDlg:openWithAction()
	end

end


function HomelandNode:updateRedPoint( ... )
	-- body
	if self:isFriendTree() == false then
		local showRedPoint = HomelandHelp.checkSubTreeUp(self._data,false)
		self._redPoint:setVisible(showRedPoint)
	else
		self._redPoint:setVisible(false)
	end

end

function HomelandNode:isFriendTree( ... )
	-- body
	local HomelandConst = require("app.const.HomelandConst")	
	if self._homelandType == HomelandConst.FRIEND_TREE then
		return true
	end 
	return false
end


function HomelandNode:playLvUpEffect( finishCall )
	-- body
	if finishCall then
		finishCall()
	end
	local function eventFunction(event)
        if event == "finish" then
			
        end
	end

	G_EffectGfxMgr:createPlayGfx( self._nodeAvatar, self._data.treeCfg.up_effect,eventFunction, true )
end

function HomelandNode:playLoopEffect()
	self._nodeEffect:removeAllChildren()
	if self._data.treeCfg.up_loop_effect and self._data.treeCfg.up_loop_effect ~= "" then
		G_EffectGfxMgr:createPlayGfx( self._nodeEffect, self._data.treeCfg.up_loop_effect)
	end
end

function HomelandNode:playOpenEffect( finishCall )
	-- body
	if finishCall then
		finishCall()
	end
	local function eventFunction(event)
        if event == "finish" then
			
        end
	end
	G_EffectGfxMgr:createPlayGfx( self._nodeAvatar, self._data.treeCfg.open_effect,eventFunction, true )
end
return HomelandNode