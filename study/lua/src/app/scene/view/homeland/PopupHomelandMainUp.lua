
-- Author: hedili
-- Date:2018-05-02 15:59:38
-- Describle： 主树升级界面

local PopupBase = require("app.ui.PopupBase")
local PopupHomelandMainUp = class("PopupHomelandMainUp", PopupBase)
local HomelandConst = require("app.const.HomelandConst")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
local PopupHomelandUpSubCell = require("app.scene.view.homeland.PopupHomelandUpSubCell")
local PopupHomelandUpMainCell = require("app.scene.view.homeland.PopupHomelandUpMainCell")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")

function PopupHomelandMainUp:ctor( treeData , isFriend)
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
		file = Path.getCSB("PopupHomelandMainUp", "homeland"),
		binding = {
			_btnUp = {
				events = {{event = "touch", method = "_onBtnMainUp"}}
			},
			_btnGetAward = {
				events = {{event = "touch", method = "_onBtnGetAward"}}
			},
			_btnMaxGetAward = {
				events = {{event = "touch", method = "_onBtnGetAward"}}
			},
		},
	}

	self:setName("PopupHomelandMainUp")

	PopupHomelandMainUp.super.ctor(self, resource)
end

-- Describle：
function PopupHomelandMainUp:onCreate()
	self._commonNodeBk:setTitle(Lang.get("homeland_popup_title"))
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._btnUp:setString(Lang.get("homeland_main_lv_up_btn"))
	self._btnGetAward:setString(Lang.get("homeland_main_get_award_btn"))
	self._btnMaxGetAward:setString(Lang.get("homeland_main_get_award_btn"))
	self._btnMaxGetAward:setVisible(false)
	self:_createDlgCell()

	self._nodeMax:setVisible(false)
	self._nodeMainTree:setVisible(false)

	self:_updateUI()
	if self._isFriend == true then
		self:showFriend()
	end
end

function PopupHomelandMainUp:_createDlgCell( ... )
	-- body

	self._levelUpCell1 = PopupHomelandUpMainCell.new()
	self._attrNode1:addChild(self._levelUpCell1)

	self._levelUpCell3 = PopupHomelandUpMainCell.new()
	self._attrNode3:addChild(self._levelUpCell3)
	
	self._levelUpCell3:setVisible(false)
	self._textRankMax:setVisible(false)
end

function PopupHomelandMainUp:onBtnCancel()
	if not isBreak then
		self:close()
	end
end

function PopupHomelandMainUp:_updateUI( ... )
	-- body
	logWarn("PopupHomelandMainUp:_updateUI")

	local mainData1, mainData2 = self:_getMainCfg()
	local isMax = self:updateMainTree()
	if isMax == false then
		self:_updateMainCostInfo(mainData1,mainData2)
	end



	self._btnGetAward:setVisible(false)
	self._btnMaxGetAward:setVisible(false)
	self._imageEmpty:setVisible(true)
	self._btnGetAward:setEnabled(not G_UserData:getHomeland():isTreeAwardTake())
	self._btnGetAward:showRedPoint(not G_UserData:getHomeland():isTreeAwardTake())
	if mainData1.output_efficiency > 0 then
		self._imageEmpty:setVisible(false)
		if mainData2 == nil then
			self._btnMaxGetAward:setVisible(true)
			self._btnMaxGetAward:showRedPoint(not G_UserData:getHomeland():isTreeAwardTake())
		else
			self._btnGetAward:setVisible(true)
		end
	end
	
	self._btnMaxGetAward:setEnabled(not G_UserData:getHomeland():isTreeAwardTake())
end

--限制装饰类型
function PopupHomelandMainUp:_updateSubTreeCondition( mainData1 , mainData2 )
	-- body
	local limitList = {}
	for i = 1 , 2 do
		local rootNode = self._nodeMainTree:getSubNodeByName("FileNode_level"..i)
		rootNode:setVisible(false)
		local subType = mainData2["adorn_type_"..i]
		local subLevel = mainData2["adorn_level_"..i]
		if subType and subType > 0 and subLevel and subLevel > 0 then
			table.insert(limitList, {type = subType, level = subLevel})
		end
	end
	

	local function updateSubTree(rootNode,value)
		-- body

		local subCfg = G_UserData:getHomeland():getSubTreeCfg(value.type, value.level)
		local mainTreeLevel = G_UserData:getHomeland():getMainTreeLevel()
		local levelOk = false
		local subLevel = G_UserData:getHomeland():getSubTreeLevel(value.type)
		levelOk = subLevel >= value.level 

		rootNode:setVisible(true)
		local textName = rootNode:getSubNodeByName("Text_name")
		local textLevel = rootNode:getSubNodeByName("Text_value")
		local button = rootNode:getSubNodeByName("Button_go_level")
		local desc = Lang.get("homeland_sub_tree_desc", {  num= value.level} )
		local color = Colors.DARK_BG_GREEN
		local function goSubTree( ... )
			-- body
			G_SignalManager:dispatch(SignalConst.EVENT_HOME_LAND_OPEN_DLG, value.type)
			self:close()
		end
		button:setVisible(not levelOk)
		if levelOk == false then
			desc = Lang.get("homeland_sub_tree_desc_no", { num= value.level} )
			color = Colors.DARK_BG_RED
			button:addClickEventListenerEx(goSubTree)
		end
		textName:setString(subCfg.name.." : ")
		textLevel:setString(desc)
		textLevel:setColor(color)
	end

	for i, value in ipairs(limitList) do
		local rootNode = self._nodeMainTree:getSubNodeByName("FileNode_level"..i)

		updateSubTree(rootNode, value  )
	end
end

function PopupHomelandMainUp:_updateMainCostInfo( mainData1 , mainData2 )
	-- body


	local costList = {}
	local type = mainData1["type"]
	local value = mainData1["value"]
	local size = mainData1["size"]
	if type > 0 then
		table.insert(costList, {type = type, value =value, size = size})
	end
	self["_resItem1"]:setVisible(false)
	
	local function addButtonCall( ... )
		-- body
		local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
		WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE)
	end

	for i, value in ipairs(costList) do
		local itemCount = UserDataHelper.getNumByTypeAndValue(value.type,value.value)
		local costNode = self["_resItem"..i]
		costNode:updateUI(value.type, value.value)
		costNode:setCount(value.size)
		costNode:setTextColorToATypeColor(itemCount >= value.size)
		if value.size > 0 then
			costNode:setVisible(true)
		end
		--costNode:updateLabel("Text_cost_item"..i, costNode:getResName().." : ")
	end

	self._textLevelDesc:setString(mainData1.up_text_1)

	self:_updateSubTreeCondition(mainData1,mainData2)
end


function PopupHomelandMainUp:_getMainCfg( ... )
	-- body

	logWarn("PopupHomelandMainUp:_getMainCfg")
	local mainData1, mainData2 = HomelandHelp.getMainTreeCfg(self._treeData)
	dump(mainData1)
	dump(mainData2)
	return mainData1, mainData2
end


function PopupHomelandMainUp:_showMax( ... )
	-- body

	self._nodeMaxAttr:setVisible(false)
	self._textRankMax:setVisible(false)

	self._nodeMainTree:setVisible(false)
	self._nodeMax:setVisible(true)
	local mainData1, mainData2 = self:_getMainCfg()
	self._levelUpCell1:setVisible(false)
	self._levelUpCell3:setVisible(true)
	self._levelUpCell3:updateUI(mainData1,mainData2)
	
	if mainData2 == nil then
		self._textRankMax:setVisible(true)
		self._levelUpCell3:moveAttrToMid()
		self._btnMaxGetAward:setVisible(true)
	else
		self._nodeMaxAttr:setVisible(true)
		--local str1 = "+"..mainData2.attribute_percentage.."%"
		--local str2 = "+"..mainData2.output_efficiency
		--self._levelUpCell3:updateNodeNext(1, str1)
		--self._levelUpCell3:updateNodeNext(2, str2)
	end

end

--好友访问
function PopupHomelandMainUp:showFriend( ... )
	-- body
	self:_showMax()
	self._textRankMax:setVisible(false)
	self._btnMaxGetAward:setVisible(false)
end


function PopupHomelandMainUp:updateMainTree( )
	-- body
	logWarn("PopupHomelandMainUp:updateMainTree")

	local mainData1, mainData2 = self:_getMainCfg()
	--max
	self._nodeMax:setVisible(false)
	self._nodeMainTree:setVisible(false)

	if mainData2 == nil then
		self:_showMax()
		return true
	end

	--two
	if mainData1 and mainData2 then
		self._levelUpCell1:setVisible(true)
		self._levelUpCell3:setVisible(false)
		self._levelUpCell1:updateUI(mainData1, mainData2)
		self._nodeMainTree:setVisible(true)
	end

	return false
end

-- Describle：
function PopupHomelandMainUp:onEnter()

	self._signalHomeTreeUpLevel = G_SignalManager:add(SignalConst.EVENT_HOME_TREE_UP_LEVEL_SUCCESS, handler(self, self._onEventHomeTreeUpLevel))

	self._signalHomeTreeHarvest = G_SignalManager:add(SignalConst.EVENT_HOME_TREE_HARVEST_SUCCESS, handler(self, self._onEventHomeTreeHarvest))


	self._signalRecvCurrencysInfo = G_SignalManager:add(SignalConst.EVENT_RECV_CURRENCYS_INFO, handler(self, self._updateData))

end

function PopupHomelandMainUp:onShowFinish( ... )
	-- body
	--抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

-- Describle：
function PopupHomelandMainUp:onExit()
	self._signalHomeTreeUpLevel:remove()
	self._signalHomeTreeUpLevel = nil

	self._signalRecvCurrencysInfo:remove()
	self._signalRecvCurrencysInfo = nil

	self._signalHomeTreeHarvest:remove()
	self._signalHomeTreeHarvest = nil
end



function PopupHomelandMainUp:_onEventHomeTreeHarvest(id, message)
	self._btnGetAward:setEnabled(not G_UserData:getHomeland():isTreeAwardTake())
	self._btnGetAward:showRedPoint(not G_UserData:getHomeland():isTreeAwardTake())
	self._btnMaxGetAward:setEnabled(not G_UserData:getHomeland():isTreeAwardTake())
	self._btnMaxGetAward:showRedPoint(not G_UserData:getHomeland():isTreeAwardTake())
end

function PopupHomelandMainUp:_onBtnGetAward( ... )
	-- body
	if G_UserData:getHomeland():isTreeAwardTake() == false then
	 	G_UserData:getHomeland():c2sHomeTreeHarvest()
	end
end

-- Describle：
function PopupHomelandMainUp:_onBtnMainUp()
	-- body

	--	local PopupHomelandUpResult = require("app.scene.view.homeland.PopupHomelandUpResult").new(self._lastTotalPower)
	--	PopupHomelandUpResult:open()

	local retValue = HomelandHelp.checkMainTreeUp( self._treeData, true )
	if retValue then
		--id 为0 升级主树
		G_UserData:getHomeland():c2sHomeTreeUpLevel(0)
	end

end


function PopupHomelandMainUp:_onEventHomeTreeUpLevel(id, message)

	if self._isFriend == true then
		return
	end	
	--G_Prompt:showTip("晋级成功")
	self:close()
end


function PopupHomelandMainUp:_updateData()

	if self._isFriend == true then
		return
	end
	self:_updateUI()
end

return PopupHomelandMainUp