--
-- Author: hyl
-- Date: 2019-06-20 14:20:20
-- 合成界面
local ViewBase = require("app.ui.ViewBase")
local SynthesisView = class("SynthesisView", ViewBase)

local SynthesisDataHelper = require("app.utils.data.SynthesisDataHelper")
local SynthesisTabIcon = require("app.scene.view.synthesis.SynthesisTabIcon")

local SynthesisConfig = require("app.config.synthesis")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local CommonSynthesiscon = require("app.ui.component.CommonSynthesisIcon")

local UserDataHelper = require("app.utils.UserDataHelper")

local TopBarStyleConst = require("app.const.TopBarStyleConst")

local SynthesisConst = require("app.const.SynthesisConst")

local TextHelper = require("app.utils.TextHelper")

local AudioConst = require("app.const.AudioConst")

function SynthesisView:ctor(type, index)
	self._selectSynthesisType = type  -- 当前选择的合成类型,类型值根据配表
	self._selectItemTabIndex = index or 1  -- 当前合成类型下产出的第几个物品
	self._synthesisData = nil    --缓存的处理后的配置信息
	self._synthesisDataTypes = nil  -- 缓存的合成数据类型数组

	local resource = {
		file = Path.getCSB("SynthesisView", "synthesis"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_tab1 = {
				events = {{event = "touch", method = "_onClickMidTab1Icon"}}
			},
			_tab2 = {
				events = {{event = "touch", method = "_onClickMidTab2Icon"}}
			},
			_tab2_1 = {
				events = {{event = "touch", method = "_onClickMidTab1Icon"}}
			},
			_tab2_2 = {
				events = {{event = "touch", method = "_onClickMidTab2Icon"}}
			},
			_tab2_3 = {
				events = {{event = "touch", method = "_onClickMidTab3Icon"}}
			},
			_synthesisBtn = {
				events = {{event = "touch", method = "_onClickSynthesisCallback"}}
			},
		}
	}

	SynthesisView.super.ctor(self, resource)
end

function SynthesisView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_hecheng")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)

	self._synthesisData = G_UserData:getSynthesis():getSynthesisConfigData()
	self._synthesisDataTypes = G_UserData:getSynthesis():getDataTypes(self._synthesisData)
	self._selectSynthesisType = self._selectSynthesisType or self._synthesisDataTypes[1] -- 默认第一个type

	self:_initTab()
	self:_initItemTab()
	self:_updateTabIcons()

	self._synthesisBtn:setVisible(#self._synthesisData > 0)
	self._synthesisBtn:setString(Lang.get("synthesis_title"))
end

function SynthesisView:onEnter()
	self._signalSynthesisResultMsg =
		G_SignalManager:add(SignalConst.EVENT_SYNTHESIS_RESULT, handler(self, self._onSynthesisResult))

	self:_updateView()
	self:_playBaguaEffect()
	--self:_refreshRedPoint()
end

function SynthesisView:onExit()
	self._signalSynthesisResultMsg:remove()
	self._signalSynthesisResultMsg = nil

end

function SynthesisView:_initTab()

	self._scrollViewTab:removeAllChildren()

	--dump(self._synthesisData)
	local len = table.nums(self._synthesisData)

	local index = 1
	--local types = G_UserData:getSynthesis():getDataTypes(self._synthesisData)
	for index, type in pairs(self._synthesisDataTypes) do
		self["_nodeTabIcon"..index] = SynthesisTabIcon.new(handler(self, self._onClickLeftTabIcon))
		self["_nodeTabIcon"..index]:updateUI(index, type, len)
		self._scrollViewTab:pushBackCustomItem(self["_nodeTabIcon"..index])
		index = index + 1
	end
end

function SynthesisView:_refreshLeftTabRedPoint ()
	local index = 1
	--local types = G_UserData:getSynthesis():getDataTypes(self._synthesisData)
	for index, type in pairs(self._synthesisDataTypes) do
		local isNeedShowRedPoint = G_UserData:getSynthesis():checkMaterailEnoughByType(self._synthesisData, type)
		self["_nodeTabIcon"..index]:showRedPoint(isNeedShowRedPoint)
		index = index + 1
	end
end

function SynthesisView:_refreshItemTabRedPoint ()
	local curSelectIds = self._synthesisData[self._selectSynthesisType]
	local index = 1
	for index, id in pairs(self._synthesisData[self._selectSynthesisType]) do
		local isNeedShowRedPoint = G_UserData:getSynthesis():checkMaterailEnoughById(id)
		local nodeTabRedPoint
		if #curSelectIds == 2 then
			nodeTabRedPoint = self["_tabRedPoint"..index]
		else
			nodeTabRedPoint = self["_tabRedPoint2_"..index]
		end
		nodeTabRedPoint:setVisible(isNeedShowRedPoint)
		index = index + 1
	end
end

function SynthesisView:_onSynthesisResult (event, awards)
	--dump(awards)
	-- local popup = require("app.ui.PopupGetRewards").new()
	-- popup:showRewards(awards)

	self:_playJuheEffect(awards)
	self:_playMaterialIconEffect()

	G_AudioManager:playSoundWithId(AudioConst.SOUND_SYNTHESIS)
	
	--self:_updateView()
end

function SynthesisView:_initItemTab()
	self:_initItemTabName()
	self:_switchTab()
end

function SynthesisView:_initItemTabName()
	local curSelectIds = self._synthesisData[self._selectSynthesisType]

	if curSelectIds == nil then
		return 
	end

	if #curSelectIds == 2 then
		self._panelTab:setVisible(true)
		self._panelTab2:setVisible(false)

		for k, id in pairs(curSelectIds) do	 
			local configInfo = SynthesisConfig.get(id)
			local itemInfo = TypeConvertHelper.convert(configInfo.syn_type, configInfo.syn_value)
			self["_name"..k]:setString(itemInfo.name)
		end
	else
		self._panelTab:setVisible(false)
		self._panelTab2:setVisible(true)

		for k, id in pairs(curSelectIds) do	 
			local configInfo = SynthesisConfig.get(id)
			local itemInfo = TypeConvertHelper.convert(configInfo.syn_type, configInfo.syn_value)
			self["_name2_"..k]:setString(itemInfo.name)
		end
	end
end

function SynthesisView:_onClickSynthesisCallback ()
	local id = self._synthesisData[self._selectSynthesisType][self._selectItemTabIndex]
	local configInfo = SynthesisConfig.get(id)

	if configInfo == nil then return end

	local ownCostNum = UserDataHelper.getNumByTypeAndValue(configInfo.cost_type, configInfo.cost_value)
	
	if ownCostNum < configInfo.cost_size then
		G_Prompt:showTip(Lang.get("common_money_not_enough"))
		return 
	end
	--print(id)
	self._synthesisBtn:setEnabled(false)
	G_UserData:getSynthesis():c2sGetSynthesisResult(id)
end

function SynthesisView:_onClickLeftTabIcon(type)
	if type == self._selectSynthesisType then
		return
	end

	self._selectSynthesisType = type
	if self._selectItemTabIndex == 3 then
		self._selectItemTabIndex = 2
	end

	self:_initItemTabName()
	self:_updateTabIcons()
	self:_switchTab()
	self:_updateView()
end

function SynthesisView:_onClickMidTab1Icon()
	if self._selectItemTabIndex == 1 then
		return
	end
	self._selectItemTabIndex = 1
	self:_switchTab()
	self:_updateView()
end

function SynthesisView:_onClickMidTab2Icon()
	if self._selectItemTabIndex == 2 then
		return
	end
	self._selectItemTabIndex = 2
	self:_switchTab()
	self:_updateView()
end

function SynthesisView:_onClickMidTab3Icon()
	if self._selectItemTabIndex == 3 then
		return
	end
	self._selectItemTabIndex = 3
	self:_switchTab()
	self:_updateView()
end

function SynthesisView:_switchTab()
	local curSelectIds = self._synthesisData[self._selectSynthesisType]
	
	for i=1,3 do
		local nodeTab, nodeName
		if #curSelectIds == 2 then
			nodeTab = self["_tabIcon"..i]
			nodeName = self["_name"..i]
		else
			nodeTab = self["_tabIcon2_"..i]
			nodeName = self["_name2_"..i]
		end
		if #curSelectIds < i then
			break
		end
		if self._selectItemTabIndex == i then
			nodeTab:setVisible(true)
			nodeName:setColor(cc.c3b(0xc7, 0x5d, 0x09))
			nodeName:enableOutline(cc.c3b(0xff, 0xcf, 0x77), 2) 
		else
			nodeTab:setVisible(false)
			nodeName:setColor(cc.c3b(0xe5, 0x89, 0x46))
			nodeName:enableOutline(cc.c3b(0x9c, 0x32, 0x11), 2) 
		end
	end
end

function SynthesisView:_updateTabIcons()

	local index = 1
	--local types = G_UserData:getSynthesis():getDataTypes(self._synthesisData)
	for index, type in pairs(self._synthesisDataTypes) do
		self["_nodeTabIcon"..index]:setSelected(type == self._selectSynthesisType)
		index = index + 1
	end

	self._topbarBase:updateUI(TopBarStyleConst.STYLE_SYNTHESIS_TYPE1 + self._selectSynthesisType - 1)
end

function SynthesisView:_updateView()
	if self._synthesisData[self._selectSynthesisType] == nil then 
		--print(self._selectSynthesisType)
		--dump(self._synthesisData)
		return 
	end

	local configId = self._synthesisData[self._selectSynthesisType][self._selectItemTabIndex]
	local configInfo = SynthesisConfig.get(configId)

	if configInfo == nil then return end

	local materailNum = SynthesisDataHelper.getSynthesisMaterilNum(configInfo)
	--print("materailNum "..materailNum)

	for index = 1, SynthesisConst.MAX_MATERIAL_NUM do
		local panel = self["_panelMaterial"..index]
		if panel then
			panel:setVisible(false)
		end
	end

	local panel = self["_panelMaterial"..materailNum]
	panel:setVisible(true)

	local isMaterialEnough = true

	for index = 1, materailNum do
		local materialIcon = self["_mat_"..materailNum.."_"..index]

		local type = configInfo["material_type_"..index]
		local value = configInfo["material_value_"..index]
		local size = configInfo["material_size_"..index]
		local ownNum = UserDataHelper.getNumByTypeAndValue(type, value)

		materialIcon:updateUI(type, value, size, ownNum)

		if ownNum < size then
			isMaterialEnough = false
		end
	end

	self:_playFaguangEffect(isMaterialEnough)

	self._nodeSilver:updateUI(configInfo.cost_type, configInfo.cost_value)
	local strSilver = TextHelper.getAmountText1(configInfo.cost_size)
	self._nodeSilver:setCount(strSilver, nil, true)

	local ownCostNum = UserDataHelper.getNumByTypeAndValue(configInfo.cost_type, configInfo.cost_value)

	if ownCostNum >= configInfo.cost_size then
		self._nodeSilver:setTextColorToDTypeColor()
	else
		self._nodeSilver:setTextColorToDTypeColor(false)
	end

	--self._nodeSilver:setCountColorRed(ownCostNum < configInfo.cost_size)

	self._synthesisBtn:setEnabled(isMaterialEnough)
	
	local param = TypeConvertHelper.convert(configInfo.syn_type, configInfo.syn_value)
	self._resultTips:setColor(param.icon_color)
    self._resultTips:enableOutline(param.icon_color_outline, 2)
	self._resultTips:setString(Lang.get("synthesis_result_tips", {name = param.name}))

	-- 合成产出动效和icon
	self:_playResultIconMovingEffect(Path.getBigItemIconPath(param.cfg.res_id))

	if materailNum == 2 then   -- 材料数量为2位置特殊处理
		self._resultIcon:setScale(0.9)
		self._resultIcon:setPositionY(340)
		self._faguangEffectNode:setPositionY(340)
	else
		self._resultIcon:setScale(1)
		self._resultIcon:setPositionY(292)
		self._faguangEffectNode:setPositionY(292)
	end

	self:_refreshLeftTabRedPoint()
	self:_refreshItemTabRedPoint()
end

function SynthesisView:_playResultIconMovingEffect(path)
	local function effectFunction(effect)
		if effect == "yin" then
			local resultIcon = ccui.ImageView:create()
			resultIcon:loadTexture(path)
			return resultIcon
		end
	end
	
    local function eventFunction(event)
	end
	
	self._resultIcon:removeAllChildren()
    G_EffectGfxMgr:createPlayMovingGfx(self._resultIcon, "moving_hecheng_yin", effectFunction, eventFunction , true)
end

function SynthesisView:_playBaguaEffect ()
	local function effectFunction(effect)
	end
	
    local function eventFunction(event)
	end
	
	self._baguaEffectNode:removeAllChildren()
    G_EffectGfxMgr:createPlayGfx(self._baguaEffectNode, "effect_hecheng_bagua", eventFunction , true)
end

function SynthesisView:_playFaguangEffect(isEnough)
	self._faguangEffectNode:removeAllChildren()

	local effectName = ""
	if isEnough then
		effectName = "effect_hecheng_qiangguang"
	else
		effectName = "effect_hecheng_ruoguang"
	end

	G_EffectGfxMgr:createPlayGfx(self._faguangEffectNode, effectName, nil, true)
end

function SynthesisView:_playJuheEffect(awards)
    local function eventFunction(event)
		if event == "gongxihuode" then
			local popup = require("app.ui.PopupGetRewards").new()
			popup:showRewards(awards)

			self:_updateView()
        end
    end
    self._juheEffectNode:removeAllChildren()
	--G_EffectGfxMgr:createPlayGfx(self._juheEffectNode, "effect_hecheng_juhe", eventFunction, true)
	G_EffectGfxMgr:createPlayMovingGfx(self._juheEffectNode, "moving_hecheng_shanguang", nil, eventFunction , true)
end

function SynthesisView:_playMaterialIconEffect ()
	local configId = self._synthesisData[self._selectSynthesisType][self._selectItemTabIndex]
	local configInfo = SynthesisConfig.get(configId)
	local materailNum = SynthesisDataHelper.getSynthesisMaterilNum(configInfo)

	for index = 1, materailNum do
		local materialIcon = self["_mat_"..materailNum.."_"..index]
		self:_playOneIconEffect(materialIcon:getEffectNode())
	end
end

function SynthesisView:_playOneIconEffect (node)
    local function eventFunction(event)
    end
    node:removeAllChildren()
    G_EffectGfxMgr:createPlayGfx(node, "effect_hecheng_iconout", eventFunction, true)
end

return SynthesisView