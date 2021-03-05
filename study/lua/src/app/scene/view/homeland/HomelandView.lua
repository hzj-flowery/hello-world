
-- Author: hedili
-- Date:2018-04-19 14:10:14
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local HomelandView = class("HomelandView", ViewBase)
local HomelandMainNode = import(".HomelandMainNode")
local HomelandNode = import(".HomelandNode")
local HomelandGuildList = import(".HomelandGuildList")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local HomelandHelp = import(".HomelandHelp")
local UIConst = require("app.const.UIConst")
local HomelandConst = require("app.const.HomelandConst")
local HomelandPrayNode = import(".HomelandPrayNode")

function HomelandView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end

	local inGuild = G_UserData:getGuild():isInGuild()
	if inGuild then
		G_UserData:getGuild():c2sQueryGuildMall()
	end

	G_UserData:getHomeland():c2sGetHomeTree()
    local signal = G_SignalManager:add(SignalConst.EVENT_GET_HOME_TREE_SUCCESS, onMsgCallBack)
	return signal
end


function HomelandView:ctor()

	--csb bind var name
	self._commonChat = nil  --CommonMiniChat
	self._commonHelp = nil  --CommonHelp
	self._commonPreview = nil
	self._panelbk = nil  --Panel
	self._topbarBase = nil  --CommonTopbarBase
	self._betIcon = nil 	--投注按钮
	self._mainNode = nil 
	self._buttonFold = nil --

	self._guildListView = nil
	self._guildListSignal = nil
	local resource = {
		file = Path.getCSB("HomelandView", "homeland"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonFold = {events = {{event = "touch", method = "_onButtonFold"}}},
		},
	}

	self:setName("HomelandView")
	HomelandView.super.ctor(self, resource, 2001)
end

-- Describle：

function HomelandView:onCreate()
	self._topbarBase:setImageTitle("txt_big_homeland_01")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_HOMELAND)
	self:_makeBackGroundBottom()
	self:_updateTreeModel()
	self:_initPrayModel()

	self._commonShop:updateUI(FunctionConst.FUNC_PET_SHOP)
	self._commonShop:addClickEventListenerEx(handler(self, self._onButtonClick))

	self._commonHelp:updateUI(FunctionConst.FUNC_HOMELAND)

	self._commonPreview:updateUI(FunctionConst.FUNC_HOMELAND_PREVIEW)
	self._commonPreview:addClickEventListenerEx(handler(self, self._onButtonPreviewClick))

	self._commonHandbook:updateUI(FunctionConst.FUNC_HOMELAND_HANDBOOK)
	self._commonHandbook:addClickEventListenerEx(handler(self, self._onButtonHandbookClick))
end

function HomelandView:_updateTreeModel( ... )

	local groundNode = self:getGroundNode()

	for i= 1, HomelandConst.MAX_SUB_TREE do
		local subTree = G_UserData:getHomeland():getSubTree(i)
		local subNode = groundNode:getChildByName("subNode"..i)
		if subNode == nil  then
			subNode = HomelandNode.new(HomelandConst.SELF_TREE)
			subNode:setName("subNode"..i)
			groundNode:addChild(subNode)
			self["_subTree"..i] = subNode
		end
		if subTree and subNode then
			subNode:updateUI(subTree)
		end
	end

	-- body
	local mainTree = G_UserData:getHomeland():getMainTree()
	local mainNode = groundNode:getChildByName("mainTree")
	if mainNode == nil and mainTree then
		mainNode = HomelandMainNode.new(HomelandConst.SELF_TREE,mainTree)
		groundNode:addChild(mainNode)
		mainNode:setName("mainTree")
	end
	mainNode:updateUI(mainTree)
	--mainNode:setPosition(HomelandConst.MAIN_TREE_POSITION)
	self._mainTree = mainNode
end

function HomelandView:_initPrayModel()
	local groundNode = self:getGroundNode()
	self._prayNode = HomelandPrayNode.new(HomelandConst.SELF_TREE, handler(self, self._onClickPray))
	groundNode:addChild(self._prayNode, 10000) --放在最高层级上
	self._prayNode:updateRedPoint()
	self._panelScreen:setVisible(false)
end

function HomelandView:_onClickPray()
	local function eventFunction(event)
    	if event == "finish" then
    		local PopupHomelandPray = require("app.scene.view.homeland.PopupHomelandPray")
			local popup = PopupHomelandPray.new()
			popup:open()
			self._panelScreen:setVisible(false)
        end
    end
	G_EffectGfxMgr:createPlayMovingGfx(self._nodePrayMoving, "moving_shenshu_lianhuadengfashe", nil, eventFunction , false)
	self._panelScreen:setVisible(true) --挡住其它点击操作
end

-- Describle：
function HomelandView:_onButtonFold()
	-- body
	if self._guildListView then
		return
	end

	logWarn("HomelandView:_onButtonFold")
	local popup = HomelandGuildList.new(G_UserData:getBase():getId())
	self:addChild(popup)

	self._guildListView = popup
	self._guildListSignal = self._guildListView.signal:add(handler(self, self._onGuildListClose))

	self._popResult = nil
	self._popResultSignal = nil
	self._buttonFold:setVisible(false)

	--local PopupHomelandUpResult = require("app.scene.view.homeland.PopupHomelandUpResult").new(self._lastTotalPower)
	--PopupHomelandUpResult:open()

	--self:_playAttrSummary(1)
	--self:_playOpenSubTreeSummary({[1] = 1, [2] = 2})
end

--公会列表关闭事件通知
function HomelandView:_onGuildListClose(event)
    if event == "close" then
		self._buttonFold:setVisible(true)
        self._guildListView = nil
		if self._guildListSignal then
			self._guildListSignal:remove()
			self._guildListSignal = nil
		end
    end
end

-- Describle：
function HomelandView:onEnter()
	logWarn("HomelandView")

	self._signalHomeTreeUpLevel = G_SignalManager:add(SignalConst.EVENT_HOME_TREE_UP_LEVEL_SUCCESS, handler(self, self._onEventHomeTreeUpLevel))


	self._signalHomeTreeHarvest = G_SignalManager:add(SignalConst.EVENT_HOME_TREE_HARVEST_SUCCESS, handler(self, self._onEventHomeTreeHarvest))

	self._signalRecvRoleInfo = G_SignalManager:add(SignalConst.EVENT_RECV_ROLE_INFO, handler(self, self._onEventRecvRoleInfo))

	self._signalOpenHomelandDlg = G_SignalManager:add(SignalConst.EVENT_HOME_LAND_OPEN_DLG, handler(self,self._onEventOpenDlg))
	self._signalBlessSuccess = G_SignalManager:add(SignalConst.EVENT_HOME_TREE_BLESS_SUCCESS, handler(self,self._onEventBlessSuccess))

	--家园属性
	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst["FUNC_HOMELAND"])

    self._lastTotalPower = G_UserData:getBase():getPower()
	self:_updatePower()


	G_UserData:getAttr():recordPower()

	self._panelTouch:setVisible(false)
	--抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end


-- Describle：
function HomelandView:onExit()                     
	self._signalHomeTreeUpLevel:remove()
	self._signalHomeTreeUpLevel = nil
	self._signalHomeTreeHarvest:remove()
	self._signalHomeTreeHarvest = nil
	self._signalRecvRoleInfo:remove()
	self._signalRecvRoleInfo = nil
	self._signalOpenHomelandDlg:remove()
	self._signalOpenHomelandDlg = nil
	self._signalBlessSuccess:remove()
	self._signalBlessSuccess = nil
end


function HomelandView:_onEventRecvRoleInfo( ... )
	-- body
	G_UserData:getAttr():recordPower()
end
function HomelandView:_updatePower( ... )
	-- body
	self._fileNodePower:updateUI(HomelandHelp.getAllPower())
	self._fileNodePower:setPositionX(250 - self._fileNodePower:getWidth()*0.5)
	
end


function HomelandView:onClickIcon( sender )
	-- body
	local WayFuncDataHelper	=require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RUNNING_BET)
end


--加入基础属性飘字内容
function HomelandView:_addBaseAttrPromptSummary(summary,typeList)
	local attrAllList = {}
	local allPower = 0
	
	for i, value in ipairs(typeList) do
		local attrList , power = HomelandHelp.getSubTreeAttrList(value)
		for k, attrValue in ipairs(attrList) do
			AttrDataHelper.formatAttr(attrAllList, attrValue.type, attrValue.value)
		end
		allPower = allPower + power
	end

	local paramPower = {
		content = HomelandHelp.getPromptPower(allPower),
		anchorPoint = cc.p(0, 0.5),
		startPosition = {x = UIConst.SUMMARY_OFFSET_X_ATTR},
		finishCallback = function ( ... )
			--抛出新手事件出新手事件
			G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, "HomelandView Summary")
		end
	}
	
	table.insert(summary, paramPower)

	for key ,value in pairs(attrAllList) do
		local param = {
			content = HomelandHelp.getPromptContent(key, value),
			anchorPoint = cc.p(0, 0.5),
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_ATTR},
		}
		table.insert(summary, param)
	end



    return summary
end

--播放飘字
function HomelandView:_playOpenSubTreeSummary(typeList)
    local summary = {}

	dump(typeList)
	local openTreeName = ""
	for i, typeValue in ipairs(typeList) do
		local cfgData =  HomelandHelp.getSelfSubTreeCfg(typeValue)
		openTreeName = openTreeName..cfgData.name
		if i ~= #typeList then
			openTreeName = openTreeName..", "
		end
	end


	local content1 = Lang.get("homeland_open_tree_desc", {name = openTreeName})
	table.insert(summary, {content = content1})
    self:_addBaseAttrPromptSummary(summary,typeList)
	

    G_Prompt:showSummary(summary)
	G_Prompt:playTotalPowerSummary()
end


--播放飘字
function HomelandView:_playAttrSummary(type)
    local summary = {}

	local cfgData =  HomelandHelp.getSelfSubTreeCfg(type)

	dump(cfgData.level)
	local content1 = Lang.get("homeland_level_up_desc", {
		name = cfgData.name,
		num = cfgData.level,
	})

	table.insert(summary, {content = content1})

    self:_addBaseAttrPromptSummary(summary,{type})
	
	
    G_Prompt:showSummary(summary)
	G_Prompt:playTotalPowerSummary()

end


function HomelandView:_onEventHomeTreeHarvest(id, message)
	local awards = rawget( message, "awards" )
	if awards then
		G_Prompt:showAwards(awards)
	end

	if self._mainTree then
		local mainTree = G_UserData:getHomeland():getMainTree()
		self._mainTree:updateUI(mainTree)
		--logWarn("HomelandView:_onEventHomeTreeHarvest")
	end
end

function HomelandView:_onPopupResultClose( event )
	-- body
	if event == "close" then
        self._popResult = nil
		if self._popResultSignal then
			self._popResultSignal:remove()
			self._popResultSignal = nil
		end

		local callfuncTimes = 0
		local function effectFinish( ... )
			if callfuncTimes == 0 then
				self:_playOpenSubTreeSummary(self._openTreeList)
				self:_updateTreeModel()
				self:_updatePower()
				callfuncTimes = callfuncTimes + 1
			end
		end

		if self._openTreeList then
			for i, value in ipairs(self._openTreeList) do
				local treeNode = self["_subTree"..value]
				if treeNode then
					treeNode:playOpenEffect(effectFinish)
				end
			end
		else
			self:_updateTreeModel()
			self:_updatePower()
		end

    end


end
function HomelandView:_onEventHomeTreeUpLevel(id, message)	
	--G_Prompt:showTip("晋级成功")
	
	local treeId = rawget(message,"id")
	if treeId == nil then
		return
	end

	if treeId == 0 then
		local function effectFinish( ... )
			if self._popResult == nil then
				local PopupHomelandUpResult = require("app.scene.view.homeland.PopupHomelandUpResult").new(self._lastTotalPower)
				PopupHomelandUpResult:open()
				self._popResult = PopupHomelandUpResult
				self._popResultSignal = self._popResult.signal:add(handler(self, self._onPopupResultClose))
			end
			self._panelTouch:setVisible(false)
			self._lastTotalPower = G_UserData:getBase():getPower()
		end

		local open_trees = rawget(message, "open_trees")
		if open_trees then
			self._openTreeList = open_trees
		end
		self._panelTouch:setVisible(true)
		self._mainTree:playLvUpEffect(effectFinish)
	else
		local function effectFinish( ... )
			-- body
			self:_updateTreeModel()
			self:_playAttrSummary(treeId)
			self:_updatePower()

			self._lastTotalPower = G_UserData:getBase():getPower()
		end
		local treeNode = self["_subTree"..treeId]
		if treeNode then
			treeNode:playLvUpEffect(effectFinish)
		end
	end


	
end


function HomelandView:_onButtonPreviewClick( sender )

	local PopupHomelandMaterial = require("app.scene.view.homeland.PopupHomelandMaterial")
	local popupDlg = PopupHomelandMaterial.new()
	popupDlg:openWithAction()


end

function HomelandView:_onButtonHandbookClick()
	G_SceneManager:showDialog("app.scene.view.homeland.PopupHomelandPrayHandbook")
end

function HomelandView:_onButtonClick( sender )

	local funcId =  sender:getTag()
	if funcId > 0 then
		 local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	    WayFuncDataHelper.gotoModuleByFuncId(funcId)
	end
end

function HomelandView:_onEventOpenDlg( id, dlgType )
	-- body
	if dlgType == nil then
		return
	end
	
	if dlgType == 0 then
		self._mainTree:_onBtnAdd()
	elseif dlgType > 0 then
		local subTree = self["_subTree"..dlgType]
		if subTree and subTree:isSubTreeOpen() then
			subTree:_onBtnAdd()
		else
			local treeCfg = subTree:getTreeCfg()
			G_Prompt:showTip(Lang.get("homeland_main_open_limit",{level = treeCfg.limit_tree_level, name = treeCfg.name}))
		end
	end
end

function HomelandView:_onEventBlessSuccess()
	self._prayNode:updateRedPoint()
end

return HomelandView