
-- Author: hedili
-- Date:2018-05-02 15:59:38
-- Describle： 主，子树升级界面

local PopupBase = require("app.ui.PopupBase")
local PopupHomelandUp = class("PopupHomelandUp", PopupBase)
local HomelandConst = require("app.const.HomelandConst")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
local PopupHomelandUpSubCell = require("app.scene.view.homeland.PopupHomelandUpSubCell")
local PopupHomelandUpMainCell = require("app.scene.view.homeland.PopupHomelandUpMainCell")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")

function PopupHomelandUp:ctor(upType, treeData)

	--csb bind var name
	self._upType = upType
	self._treeData = treeData
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
	self._imageRankMax = nil  --Text

	local resource = {
		file = Path.getCSB("PopupHomelandUp", "homeland"),
		binding = {
			_btnUp = {
				events = {{event = "touch", method = "_onBtnMainUp"}}
			},
			_btnSubUp ={
				events = {{event = "touch", method = "_onBtnSubUp"}}
			},
		},
	}

	self:setName("PopupHomelandUp")

	PopupHomelandUp.super.ctor(self, resource)
end

-- Describle：
function PopupHomelandUp:onCreate()
	self._commonNodeBk:setTitle(Lang.get("homeland_popup_title"))
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._btnUp:setString(Lang.get("homeland_main_lv_up_btn"))
	self._btnSubUp:setString(Lang.get("homeland_lv_up_btn"))

	self:_createDlgCell()

	self._nodeSubTree:setVisible(false)
	self._nodeMainTree:setVisible(false)
end

function PopupHomelandUp:_createDlgCell( ... )
	-- body
	if self._upType == HomelandConst.DLG_SUB_TREE then
		self._levelUpCell1 = PopupHomelandUpSubCell.new()
		self._attrNode1:addChild(self._levelUpCell1)
		self._levelUpCell2 = PopupHomelandUpSubCell.new()
		self._attrNode2:addChild(self._levelUpCell2)
		self._levelUpCell3 = PopupHomelandUpSubCell.new()
		self._attrNode3:addChild(self._levelUpCell3)
	elseif self._upType == HomelandConst.DLG_MAIN_TREE then
		self._levelUpCell1 = PopupHomelandUpMainCell.new()
		self._attrNode1:addChild(self._levelUpCell1)
		self._levelUpCell2 = PopupHomelandUpMainCell.new()
		self._attrNode2:addChild(self._levelUpCell2)
		self._levelUpCell3 = PopupHomelandUpMainCell.new()
		self._attrNode3:addChild(self._levelUpCell3)
	end

	self._levelUpCell3:setVisible(false)
	self._imageRankMax:setVisible(false)


end
function PopupHomelandUp:onBtnCancel()
	if not isBreak then
		self:close()
	end
end

function PopupHomelandUp:_updateUI( ... )
	-- body
	logWarn("PopupHomelandUp:_updateUI")

	self._nodeSubTree:setVisible(false)
	self._nodeMainTree:setVisible(false)


	if self._upType ==  HomelandConst.DLG_MAIN_TREE then
		local mainData1, mainData2 = self:_getMainCfg()
		local isMax = self:updateMainTree()
		if isMax == false then
			self._nodeMainTree:setVisible(true)
			self:_updateMainCostInfo(mainData1)
		end
	end
	if self._upType == HomelandConst.DLG_SUB_TREE then
		local isMax = self:updateSubTree()
		if isMax == false then
			self._nodeSubTree:setVisible(true)
			local subData1, subData2 = self:_getSubCfg()
			self:_updateSubCostInfo(subData1,subData2)
		end

	end
end

function PopupHomelandUp:_updateMainCostInfo( mainData1 )
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
		costNode:setVisible(true)
		--costNode:updateLabel("Text_cost_item"..i, costNode:getResName().." : ")
	end

	self._textLevelDesc:setString(mainData1.up_text_1)

	local function updateExp( ... )
		-- body

		local needCurExp = mainData1.experience
		local nowExp =   self._treeData.treeExp
		local percent = math.floor ( ( nowExp / needCurExp ) * 100 )

		dump(percent)
		self._progress_txt:setString(nowExp.."/"..needCurExp)
		if needCurExp <= 0 then
			self._progress:setPercent(100)
			self._progress_txt:setString("10/10")
		else
			self._progress:setPercent(percent)
		end
		
	end
	updateExp()
end


function PopupHomelandUp:_getMainCfg( ... )
	-- body

	logWarn("PopupHomelandUp:_getMainCfg")
	local mainData1, mainData2 = HomelandHelp.getMainTreeCfg(self._treeData)
	dump(mainData1)
	dump(mainData2)
	return mainData1, mainData2
end

function PopupHomelandUp:_getSubCfg( ... )
	-- body
	local subData1, subData2 = HomelandHelp.getSubTreeCfg(self._treeData)
	return subData1, subData2
end
function PopupHomelandUp:updateMainTree( )
	-- body
	logWarn("PopupHomelandUp:updateMainTree")

	local mainData1, mainData2 = self:_getMainCfg()
	--max

	if mainData2 == nil then
		self._levelUpCell1:setVisible(false)
		self._levelUpCell2:setVisible(false)
		self._levelUpCell3:setVisible(true)
		self._levelUpCell3:updateUI(mainData1, true)
		self._attrNode3:setPositionY(218)
		self._textLevelDesc:setString(" ")
		self._textNodeRes:setVisible(false)
		self._conditionMainTitle:setVisible(false)
		self._imageArrow:setVisible(false)
		self._imageRankMax:setVisible(true)
		self._imageRankMax:loadTexture(Path.getTextHomeland("txt_homeland_05"))
		return true
	end

	--two
	if mainData1 and mainData2 then
		self._levelUpCell1:setVisible(true)
		self._levelUpCell2:setVisible(true)
		self._levelUpCell3:setVisible(false)
		self._levelUpCell1:updateUI(mainData1, true)
		self._levelUpCell2:updateUI(mainData2, false)
		self._textNodeRes:setVisible(true)
		self._conditionMainTitle:setVisible(true)
		self._imageArrow:setVisible(true)
		self._imageRankMax:setVisible(false)
	end

	return false
end

function PopupHomelandUp:_updateSubCostInfo( subData1,subData2)
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
		local itemCount = UserDataHelper.getNumByTypeAndValue(value.type,value.value)
		local costNode = self["_resSubItem"..i]
		costNode:updateUI(value.type, value.value)
		costNode:setCount(itemCount,value.size)
		costNode:setTextColorToATypeColor(itemCount >= value.size)
		costNode:showImageAdd(true)
		costNode:setVisible(true)
		costNode:updateLabel("Text_cost_item"..i, costNode:getResName().." : ")
	end


	self._textLevelDesc:setString(" ")
	if subData2 then
		local treeLevel = subData2.limit_tree_level
		self._mainTreeNode:setVisible(true)
		local mainTreeLevel = G_UserData:getHomeland():getMainTreeLevel()
		if mainTreeLevel  >= subData2.limit_tree_level then
			self._mainTreeNode:setVisible(false)
		end

		local mainTreeCfg = G_UserData:getHomeland():getMainTreeCfg(treeLevel)
		if mainTreeCfg then
			self._mainTreeNode:removeAllChildren()
			local params1 ={
				name = "label1",
				text = Lang.get("homeland_can_break_up1"),
				fontSize = 22,
				color = Colors.BRIGHT_BG_TWO,
			}
			local params2 ={
				name = "label2",
				text = mainTreeCfg.name,
				fontSize = 22,
				color =  Colors.getHomelandColor(treeLevel),
			}
			local params3 ={
				name = "label3",
				text = Lang.get("homeland_can_break_up2"),
				fontSize = 22,
				color = Colors.BRIGHT_BG_TWO,
			}
			local UIHelper = require("yoka.utils.UIHelper")
			local widget = UIHelper.createLabels({params1,params2,params3})
			self._mainTreeNode:addChild(widget)		
			--self._textMainTree:enableOutline(Colors.getHomelandOutline(treeLevel), 1)
		end
		self._textLevelDesc:setString(Lang.get("homeland_level_up_add_exp",{num = subData2.experience_value}))
	end
	
end
function PopupHomelandUp:updateSubTree( ... )
	
	--max
	local subData1, subData2 = self:_getSubCfg()
	
	if subData2 == nil then
		self._levelUpCell1:setVisible(false)
		self._levelUpCell2:setVisible(false)
		self._levelUpCell3:setVisible(true)
		self._levelUpCell3:updateUI(subData1, true)
		self._attrNode3:setPositionY(285)
		self._textSubNodeRes:setVisible(false)
		self._conditionSubTitle:setVisible(false)
		self._textLevelDesc:setString(" ")
		self._imageArrow:setVisible(false)
		self._imageRankMax:setVisible(true)
		self._imageRankMax:loadTexture(Path.getTextHomeland("txt_homeland_06"))
		return true
	end

	--two
	if subData1 and subData2 then
		self._levelUpCell1:setVisible(true)
		self._levelUpCell2:setVisible(true)
		self._levelUpCell3:setVisible(false)
		self._levelUpCell1:updateUI(subData1, true)
		self._levelUpCell2:updateUI(subData2, false)
		self._textSubNodeRes:setVisible(true)
		self._conditionSubTitle:setVisible(true)
		self._imageArrow:setVisible(true)
		self._imageRankMax:setVisible(false)
	end

	return false
end

-- Describle：
function PopupHomelandUp:onEnter()

	self._signalHomeTreeUpLevel = G_SignalManager:add(SignalConst.EVENT_HOME_TREE_UP_LEVEL_SUCCESS, handler(self, self._onEventHomeTreeUpLevel))

	self:_updateUI()

	self._signalRecvCurrencysInfo = G_SignalManager:add(SignalConst.EVENT_RECV_CURRENCYS_INFO, handler(self, self._updateData))

end

function PopupHomelandUp:onShowFinish( ... )
	-- body
	--抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end
-- Describle：
function PopupHomelandUp:onExit()
	self._signalHomeTreeUpLevel:remove()
	self._signalHomeTreeUpLevel = nil

	self._signalRecvCurrencysInfo:remove()
	self._signalRecvCurrencysInfo = nil
end
-- Describle：
function PopupHomelandUp:_onBtnMainUp()
	-- body

	--	local PopupHomelandUpResult = require("app.scene.view.homeland.PopupHomelandUpResult").new(self._lastTotalPower)
	--	PopupHomelandUpResult:open()

	local retValue = HomelandHelp.checkMainTreeUp( self._treeData, true )
	if retValue then
		--id 为0 升级主树
		G_UserData:getHomeland():c2sHomeTreeUpLevel(0)
	end

end


function PopupHomelandUp:_onBtnSubUp( ... )
	-- body
	local retValue = HomelandHelp.checkSubTreeUp( self._treeData )
	if retValue then
		--id 为0 升级主树
		G_UserData:getHomeland():c2sHomeTreeUpLevel( self._treeData.treeId )
	end
end

function PopupHomelandUp:_onEventHomeTreeUpLevel(id, message)	
	--G_Prompt:showTip("晋级成功")

	self:close()
end


function PopupHomelandUp:_updateData()
	self:_updateUI()
end

return PopupHomelandUp