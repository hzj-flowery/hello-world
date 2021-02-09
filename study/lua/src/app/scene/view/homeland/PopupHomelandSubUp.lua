
-- Author: hedili
-- Date:2018-05-02 15:59:38
-- Describle： 子树升级界面

local PopupBase = require("app.ui.PopupBase")
local PopupHomelandSubUp = class("PopupHomelandSubUp", PopupBase)
local HomelandConst = require("app.const.HomelandConst")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
local PopupHomelandUpSubCell = require("app.scene.view.homeland.PopupHomelandUpSubCell")

local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")

function PopupHomelandSubUp:ctor( treeData, isFriend)
	self._treeData = treeData
	self._isFriend = isFriend
	self._attrNode1 = nil  --SingleNode
	self._attrNode2 = nil  --SingleNode
	self._attrNode3 = nil  --SingleNode
	self._btnUp = nil  --CommonButtonHighLight
	self._commonHelp = nil  --CommonHelp
	self._commonNodeBk = nil  --CommonNormalSmallPop
	self._conditionTitle = nil  --ImageView
	self._imageArrow = nil  --ImageView
	self._resItem1 = nil  --CommonResourceInfo
	self._resItem2 = nil  --CommonResourceInfo
	self._resItem3 = nil  --CommonResourceInfo
	self._textAddPlayerJoint = nil  --Text
	self._textNodeRes = nil  --SingleNode
	self._textRankMax = nil  --Text

	local resource = {
		file = Path.getCSB("PopupHomelandSubUp", "homeland"),
		binding = {
			_btnUp = {
				events = {{event = "touch", method = "_onBtnSubUp"}}
			},
		},
	}

	self:setName("PopupHomelandSubUp")

	PopupHomelandSubUp.super.ctor(self, resource)
end

-- Describle：
function PopupHomelandSubUp:onCreate()
	self._commonNodeBk:setTitle(Lang.get("homeland_popup_title"))
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._btnUp:setString(Lang.get("homeland_lv_up_btn"))
	self:_createDlgCell()

	self._nodeMax:setVisible(false)
	self._nodeSubTree:setVisible(false)

	-- self:_updateUI()

	if self._isFriend == true then
		self:showFriend()
	end
end

function PopupHomelandSubUp:_createDlgCell( ... )
	-- body

	self._levelUpCell1 = PopupHomelandUpSubCell.new()
	self._attrNode1:addChild(self._levelUpCell1)

	self._levelUpCell3 = PopupHomelandUpSubCell.new()
	self._attrNode3:addChild(self._levelUpCell3)
	
	self._levelUpCell3:setVisible(false)
	self._textRankMax:setVisible(false)
end

function PopupHomelandSubUp:onBtnCancel()
	if not isBreak then
		self:close()
	end
end

function PopupHomelandSubUp:_getSubCfg( ... )
	-- body
	local subData1, subData2 = HomelandHelp.getSubTreeCfg(self._treeData)
	dump(subData1)
	dump(subData2)
	return subData1, subData2
end

function PopupHomelandSubUp:_updateUI( ... )
	-- body
	logWarn("PopupHomelandSubUp:_updateUI")

	local subData1, subData2 = self:_getSubCfg()
	local isMax = self:updateSubTree()
	if isMax == false then
		self:_updateSubCostInfo(subData1,subData2)
	end

end

--限制装饰类型
function PopupHomelandSubUp:_updateSubTreeCondition( subData1,subData2 )
	-- body
	local limitList= {}

	local rootNode = self._nodeSubTree:getSubNodeByName("FileNode_level3")
	rootNode:setVisible(false)
	if subData2.limit_tree_level > 0 then
		table.insert(limitList, {type = 0, level = subData2.limit_tree_level})
	end
	

	for i = 1 , 2 do
		local rootNode = self._nodeSubTree:getSubNodeByName("FileNode_level"..i)
		rootNode:setVisible(false)
		local subType = subData2["adorn_type_"..i]
		local subLevel = subData2["adorn_level_"..i]
		if subType and subType > 0 and subLevel and subLevel > 0 then
			table.insert(limitList, {type = subType, level = subLevel})
		end
	end
	local function updateSubTreeLimit(rootNode, value )
		-- body
		local descName = ""
		local levelOk = false
		if value.type == 0 then
			local mainTree = G_UserData:getHomeland():getMainTreeCfg(value.level)
			descName = mainTree.name.." : "
			local mainTreeLevel = G_UserData:getHomeland():getMainTreeLevel()
			levelOk = mainTreeLevel >= value.level 
		else
			local subCfg = G_UserData:getHomeland():getSubTreeCfg(value.type, value.level)
			local subLevel = G_UserData:getHomeland():getSubTreeLevel(value.type)
			levelOk = subLevel >= value.level 
			descName = subCfg.name.." :"
		end

		
		rootNode:setVisible(true)
		local textName = rootNode:getSubNodeByName("Text_name")
		local textLevel = rootNode:getSubNodeByName("Text_value")
		local button = rootNode:getSubNodeByName("Button_go_level")
		local desc = Lang.get("homeland_sub_tree_desc", {num= value.level} )
		if value.type == 0 then
			desc = Lang.get("homeland_main_tree_desc", {num = value.level})
		end
		
		local color = Colors.DARK_BG_GREEN
		local function goSubTree( ... )
			-- body
			G_SignalManager:dispatch(SignalConst.EVENT_HOME_LAND_OPEN_DLG, value.type)
			self:close()
			logWarn("goSubTree   xcxxxxxxxxxxxxxxx")
		end
		button:setVisible(not levelOk)
		if levelOk == false then
			if value.type == 0 then
				desc = Lang.get("homeland_main_tree_desc_no", {num= value.level} )
			else
				desc = Lang.get("homeland_sub_tree_desc_no", {num= value.level} )
			end
			
			color = Colors.DARK_BG_RED
			button:addClickEventListenerEx(goSubTree)
		end
		textName:setString(descName)
		textLevel:setString(desc)
		textLevel:setColor(color)
	end

	for i, value in ipairs(limitList) do
		local rootNode = self._nodeSubTree:getSubNodeByName("FileNode_level"..i)

		updateSubTreeLimit(rootNode, value )
	end

	
end


function PopupHomelandSubUp:_updateSubCostInfo( subData1,subData2)
	-- body
	local costList = {}
	for i=1, 2 do
		local type = subData1["type_"..i]
		local value = subData1["value_"..i]
		local size = subData1["size_"..i]
		if type > 0 and value > 0 then
			table.insert(costList, {type = type, value =value, size = size})
		end
		self["_resSubItem"..i]:setVisible(false)
	end

	for i, value in ipairs(costList) do
		local costNode = self["_resSubItem"..i]
		costNode:updateView(value)
		costNode:setVisible(true)
	end
	self:_updateSubTreeCondition(subData1,subData2)
end





function PopupHomelandSubUp:_showMax( ... )
	-- body
	self._nodeMaxAttr:setVisible(false)
	self._textRankMax:setVisible(false)
	self._nodeMax:setVisible(true)
	local subData1, subData2 = self:_getSubCfg()
	self._levelUpCell1:setVisible(false)
	self._levelUpCell3:setVisible(true)
	self._levelUpCell3:updateUI(subData1, subData2)
	
	if subData2 == nil then
		self._textRankMax:setVisible(true)
		self._levelUpCell3:moveAttrToMid()
	else
		self._nodeMaxAttr:setVisible(true)
	end

end

--好友访问
function PopupHomelandSubUp:showFriend( ... )
	-- body
	self:_showMax()
	self._textRankMax:setVisible(false)
	self._nodeSubTree:setVisible(false)
end


function PopupHomelandSubUp:updateSubTree( )
	-- body
	logWarn("PopupHomelandSubUp:updateSubTree")

	local subData1, subData2 = self:_getSubCfg()
	--max
	self._nodeMax:setVisible(false)
	self._nodeSubTree:setVisible(false)

	if subData2 == nil then
		self:_showMax()
		return true
	end

	--two
	if subData1 and subData2 then
		self._nodeSubTree:setVisible(true)
		self._levelUpCell1:setVisible(true)

		self._levelUpCell3:setVisible(false)
		self._levelUpCell1:updateUI(subData1, subData2)
	end

	return false
end

-- Describle：
function PopupHomelandSubUp:onEnter()


	self._signalHomeTreeUpLevel = G_SignalManager:add(SignalConst.EVENT_HOME_TREE_UP_LEVEL_SUCCESS, handler(self, self._onEventHomeTreeUpLevel))


	self._signalRecvCurrencysInfo = G_SignalManager:add(SignalConst.EVENT_RECV_CURRENCYS_INFO, handler(self, self._updateData))
	
	self:_updateUI()
end

function PopupHomelandSubUp:onShowFinish( ... )
	-- body
	--抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

-- Describle：
function PopupHomelandSubUp:onExit()
	self._signalHomeTreeUpLevel:remove()
	self._signalHomeTreeUpLevel = nil

	self._signalRecvCurrencysInfo:remove()
	self._signalRecvCurrencysInfo = nil
end

-- Describle：
function PopupHomelandSubUp:_onBtnSubUp( ... )
	-- body
	local retValue = HomelandHelp.checkSubTreeUp( self._treeData )
	if retValue then
		--id 为0 升级主树
		G_UserData:getHomeland():c2sHomeTreeUpLevel( self._treeData.treeId )
	end
end


function PopupHomelandSubUp:_onEventHomeTreeUpLevel(id, message)	
	--G_Prompt:showTip("晋级成功")
	if self._isFriend == true then
		return
	end
	self:close()
end


function PopupHomelandSubUp:_updateData()

	if self._isFriend == true then
		return
	end
	self:_updateUI()
end

return PopupHomelandSubUp