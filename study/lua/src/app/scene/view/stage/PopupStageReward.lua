local PopupBase = require("app.ui.PopupBase")
local PopupStageReward = class("PopupStageReward", PopupBase)
local CSHelper  = require("yoka.utils.CSHelper")
local UIHelper  = require("yoka.utils.UIHelper")

local StarBoxOpenImg =
{
    "baoxiangtong_kai",
    "baoxiangyin_kai",
    "baoxiangjin_kai",
}

local StarBoxEmptyImg =
{
    "baoxiangtong_kong",
    "baoxiangyin_kong",
    "baoxiangjin_kong",
}

function PopupStageReward:ctor(chapterData, chapterStar, callback)
    self._chapterData = chapterData
    self._star = chapterStar
    self._panelFinish = nil
    self._finish = false
    self._mapBoxes = {}
    self._starBoxes = {}
    self._callback = callback
    self._notCallBack = false
    self._boxCount = 0
    self._btnConfirm = nil
    self._starNode = {}
    self._mapNode = {}
    self:setName("PopupStageReward")

	PopupStageReward.super.ctor(self, nil, false, false)
end

function PopupStageReward:onEnter()
    local params = {
        name = index,
        contentSize = cc.size(1136, 640),
        anchorPoint = cc.p(0.5, 0.5),
        position = cc.p(0, 0)
    }
    self._panelFinish = UIHelper.createPanel(params)
    self._panelFinish:setTouchEnabled(true)
    self._panelFinish:setSwallowTouches(true)
    self._panelFinish:addTouchEventListener(handler(self,self._onFinishTouch))
    self:addChild(self._panelFinish)
    self:_createEffectNode()
    self:_createBoxBtn()
end

function PopupStageReward:onClose()
    --hark code
    if G_TutorialManager:isDoingStep(12) then
        --抛出新手事件出新手事件
         G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,"PopupStageReward close")
    end

    if self._callback and not self._notCallBack then
		self._callback()
	end
end

function PopupStageReward:onExit()

end

function PopupStageReward:onBoxGet()
	local isAllget = true
	for _,v in pairs(self._boxDatas)do
		if not v:isAlreadyGet(v) then
			isAllget = false
			break
		end
	end
	for _,v in pairs(self._boxItems)do
		v:updateUI()
	end
	if isAllget then
		self._btnConfirm:setString(Lang.get("common_btn_sure"))
	end
end

function PopupStageReward:_createActionNode(effect)
    if effect == "txt" then
        local txtSp = display.newSprite(Path.getSystemImage("txt_sys_lingqubaoxiang"))
        return txtSp
    elseif effect == "all_bg" then
         local bgSp = display.newSprite(Path.getPopupReward("img_gain_borad01"))
         return bgSp
    elseif effect == "button" then
         local confirmBtn = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel0Highlight", "common"))
         confirmBtn:setString(Lang.get("stage_one_btn_get"))
         confirmBtn:setCascadeOpacityEnabled(true)
         confirmBtn:setCascadeColorEnabled(true)
         confirmBtn:addClickEventListenerEx(handler(self,self._getReward))
         confirmBtn:setTouchEnabled(true)
         confirmBtn:setName("confirmBtn")
         self._btnConfirm = confirmBtn
         return confirmBtn
    elseif effect == "txt_meirilibao" then
        return display.newNode()
    elseif effect == "txt_shuoming" then
        return display.newNode()
    end
end

function PopupStageReward:_createEffectNode()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if string.find(effect, "effect_") then
            local subEffect = EffectGfxNode.new(effect)
            subEffect:play()
            return subEffect
        else
            return self:_createActionNode(effect)
        end
    end

    local function eventFunction(event,frameIndex, movingNode)
        if event == "finish" then
            self._finish = true
            G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
        end
    end
   local node =  G_EffectGfxMgr:createPlayMovingGfx( self, "moving_choujiang_hude", effectFunction, eventFunction , false )
   return node
end

function PopupStageReward:_onFinishTouch(sender, event)
    -- if event == 2 and self._finish then
    --     self:close()
    -- end
end

function PopupStageReward:_getReward(sender, event)
	local isAllget = true
	for _,v in pairs(self._boxDatas)do
		if not v:isAlreadyGet(v) then
			isAllget = false
			break
		end
	end

	if isAllget then
		self:close()
	else
		G_UserData:getChapter():c2sGetAllAwardBox(self._chapterData:getId())
		self._notCallBack = true
	end
end

function PopupStageReward:_getBoxReward(data)
	if not data then
		return
	end

	if data.isAlreadyGet(data) then
		return
	end

	if data.type == "passBox" then
		G_UserData:getChapter():c2sFinishChapterBoxRwd(self._chapterData:getId(), data.id)
	elseif data.type == "starBox" then
		G_UserData:getChapter():c2sFinishChapterBoxRwd(self._chapterData:getId(), data.id)
	elseif data.type == "stageBox" then
		G_UserData:getChapter():c2sReceiveStageBox(data.id)
	end
end


function PopupStageReward:_createStarRichText(num)

	 local paramList = {
		[1] = {
			type = "label",
			text = tostring(num),
			fontSize = 20,
			color = Colors.DARK_BG_THREE,
			anchorPoint = cc.p(0, 0.5),
		},

		[2] = {
			type = "image",
			texture = Path.getUICommon("img_lit_stars02"),
			name = "biantaiStar",
			scale = "0.5"
		},
		[3] = {
			type = "label",
			text = Lang.get("stage_box_normal_name"),
			fontSize = 20,
			color = Colors.DARK_BG_THREE,
		},
	}
	local node = UIHelper.createRichItems(paramList)
	return node
end

function PopupStageReward:_initBoxData()
	local configData = self._chapterData:getConfigData()
	local clickHandle = handler(self, self._getBoxReward)

	self._boxDatas = {}
	--通关宝箱
	if self._chapterData:isLastStagePass() and self._chapterData:getPreward() == 0 then
		local data = {}
		data.name = Lang.get("stage_pass_box")
		data.emptyImagePath = Path.getChapterBox("btn_common_box6_3")
		data.fullImagePath = Path.getChapterBox("btn_common_box6_2")
		data.type = "passBox"
		data.id = 4
		data.isAlreadyGet = function()
			return self._chapterData:getPreward() ~= 0
		end
		data.clickCallback = clickHandle
		table.insert(self._boxDatas, data)
	end

	if configData.copperbox_star ~= 0 and self._star >= configData.copperbox_star
        and self._chapterData:getBreward() == 0  then
			local data = {}
			data.richNode = self:_createStarRichText(configData.copperbox_star)
			data.emptyImagePath = Path.getChapterBox("baoxiangtong_kong")
			data.fullImagePath = Path.getChapterBox("baoxiangtong_kai")
			data.type = "starBox"
			data.id = 1
			data.isAlreadyGet = function()
				return self._chapterData:getBreward() ~= 0
			end
			data.clickCallback = clickHandle
			table.insert(self._boxDatas, data)
    end

	if configData.silverbox_star ~= 0 and self._star >= configData.silverbox_star
        and self._chapterData:getSreward() == 0  then
			local data = {}
			data.richNode = self:_createStarRichText(configData.silverbox_star)
			data.emptyImagePath = Path.getChapterBox("baoxiangyin_kong")
			data.fullImagePath = Path.getChapterBox("baoxiangyin_kai")
			data.type = "starBox"
			data.id = 2
			data.isAlreadyGet = function()
				return self._chapterData:getSreward() ~= 0
			end
			data.clickCallback = clickHandle
			table.insert(self._boxDatas, data)
    end


	--金宝箱
	if configData.goldbox_star ~= 0 and self._star >= configData.goldbox_star
        and self._chapterData:getGreward() == 0 then
		local data = {}
		data.richNode = self:_createStarRichText(configData.goldbox_star)
		data.emptyImagePath = Path.getChapterBox("baoxiangjin_kong")
		data.fullImagePath = Path.getChapterBox("baoxiangjin_kai")
		data.type = "starBox"
		data.id = 3
		data.isAlreadyGet = function()
			return self._chapterData:getGreward() ~= 0
		end
		data.clickCallback = clickHandle
		table.insert(self._boxDatas, data)
    end



	local stageList = self._chapterData:getStageIdList()
    for i = 1, #stageList, 1 do
        local stageData = G_UserData:getStage():getStageById(stageList[i])
        local configData = stageData:getConfigData()
        if configData.box_id ~= 0 and stageData then
            local isget = stageData:isReceive_box()
            if not isget then
				local data = {}
				data.name = Lang.get("stage_box")
				data.emptyImagePath = Path.getChapterBox("img_mapbox_kong")
				data.fullImagePath = Path.getChapterBox("img_mapbox_kai")
				data.type = "stageBox"
				data.id = stageList[i]
				data.isAlreadyGet = function(data)
					local stageData = G_UserData:getStage():getStageById(data.id)
					if stageData and stageData:isReceive_box() then
						return true
					end
					return false
				end
				data.clickCallback = clickHandle
				table.insert(self._boxDatas, data)
            end
        end
    end

	dump(self._boxDatas)
end


function PopupStageReward:_createBoxBtn()
    local nodeBox = CSHelper.loadResourceNode(Path.getCSB("StageRewardNode", "stage"))
	self._boxParent = ccui.Helper:seekNodeByName(nodeBox, "BoxParent")
	self:_initBoxData()
	local StageRewardBoxNode = require("app.scene.view.stage.StageRewardBoxNode")
	self._boxItems = {}
	local gap = 120
	for k, v in pairs(self._boxDatas) do
		local box = StageRewardBoxNode.new(v)
		box:updateUI()
		self._boxParent:addChild(box)
		box:setPositionX((k-1)*gap)
		table.insert(self._boxItems, box)
	end
	self._boxParent:setPositionX(-1*(#self._boxDatas - 1)*gap/2)
	self:addChild(nodeBox)
end


return PopupStageReward
