--
-- Author: JerryHe
-- Date: 2019-01-29
-- 战马图鉴
-- 
local PopupBase = require("app.ui.PopupBase")
local PopupHorseKarma = class("PopupHorseKarma", PopupBase)
local HorseKarmaCell = require("app.scene.view.horseTrain.HorseKarmaCell")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local CSHelper = require("yoka.utils.CSHelper")
local AttributeConst = require("app.const.AttributeConst")
local TextHelper = require("app.utils.TextHelper")
local AudioConst = require("app.const.AudioConst")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")

--需要记录的属性列表
--{属性Id， 对应控件名}
local RECORD_ATTR_LIST = {  
    {AttributeConst.ATK, "_fileNodeAttr1"},
    {AttributeConst.HP, "_fileNodeAttr3"},
    {AttributeConst.PD, "_fileNodeAttr2"},
    {AttributeConst.MD, "_fileNodeAttr4"},
    {AttributeConst.CRIT, nil},
    {AttributeConst.NO_CRIT, nil},
    {AttributeConst.HIT, nil},
    {AttributeConst.NO_HIT, nil},
    {AttributeConst.HURT, nil},
    {AttributeConst.HURT_RED, nil},
}

local MAX_COL_NUM = 3         --战马图鉴的每行列数

function PopupHorseKarma:ctor(parentView)
	self._parentView = parentView

	local resource = {
		file = Path.getCSB("PopupHorseKarma", "horse"),
		binding = {
		}
	}
	self:setName("PopupHorseKarma")
	PopupHorseKarma.super.ctor(self, resource, nil, false)
end

function PopupHorseKarma:onCreate()
	self._activeData = nil --所激活的相关数据
    self._canClose = true --能否关闭

    self._lastPowerValue = 0     --记录上一次总战力
    
	self._panelBg:addCloseEventListener(handler(self, self._onButtonClose))
	
	self._listView:setTemplate(HorseKarmaCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupHorseKarma:onEnter()
    self._signalHorseKarmaActive = G_SignalManager:add(SignalConst.EVENT_HORSE_KARMA_ACTIVE_SUCCESS, handler(self, self._horseKarmaActiveSuccess))
    
    self:_initHorseKarmaInfo()
    self:_updateView()
end

function PopupHorseKarma:onExit()
	self._signalHorseKarmaActive:remove()
	self._signalHorseKarmaActive = nil
end

function PopupHorseKarma:_initHorseKarmaInfo()
    self._karmaData,self._karmaNum = G_UserData:getHorse():getHorsePhotoStateList()
    -- logWarn("战马图鉴信息"..tostring(self._karmaNum))
    -- dump(self._karmaData)

    self._count = math.ceil(self._karmaNum / MAX_COL_NUM)

    -- 记录当前总战力
    self._lastPowerValue = G_UserData:getBase():getPower()

    G_UserData:getAttr():recordPower()
end

function PopupHorseKarma:_updateView()
    self._panelBg:setTitle(Lang.get("horse_karma_title"))
    self._listView:clearAll()
    self._listView:resize(self._count)
end

function PopupHorseKarma:_onItemUpdate(item, index)
    logWarn("更新节点 index = "..index)
    local index = index * MAX_COL_NUM
	item:update(self._karmaData[index + 1], self._karmaData[index + 2], self._karmaData[index + 3])
end

function PopupHorseKarma:_onItemSelected(item, index)
	
end

function PopupHorseKarma:doActive(photoId)
    G_UserData:getHorse():c2sActiveWarHorsePhoto(photoId)
end

function PopupHorseKarma:_onItemTouch(index, t)
    local index = index * MAX_COL_NUM + t
	local photoId = self._karmaData[index].photoId
    G_UserData:getHorse():c2sActiveWarHorsePhoto(photoId)
end

function PopupHorseKarma:_onButtonClose()
    if self._canClose then
        self:close()
    end
end

function PopupHorseKarma:_horseKarmaActiveSuccess(eventName, photoId)
    self._karmaData,self._karmaNum = G_UserData:getHorse():getHorsePhotoStateList()

	local itemList = self._listView:getItems()
	for i, cell in ipairs(itemList) do
        if cell:getKarmaId1() == photoId then
            local index = cell:getTag()
			local data1 = self._karmaData[index*MAX_COL_NUM+1]
            local data2 = self._karmaData[index*MAX_COL_NUM+2]
            local data3 = self._karmaData[index*MAX_COL_NUM+3]
			cell:update(data1,data2,data3)
            G_UserData:getAttr():recordPower()
			self:_playEffect(photoId)
			break
		end
        if cell:getKarmaId2() == photoId then
            local index = cell:getTag()
            local data1 = self._karmaData[index*MAX_COL_NUM+1]
            local data2 = self._karmaData[index*MAX_COL_NUM+2]
            local data3 = self._karmaData[index*MAX_COL_NUM+3]
            cell:update(data1,data2,data3)
            G_UserData:getAttr():recordPower()
            self:_playEffect(photoId)
            break
        end
        if cell:getKarmaId3() == photoId then
            local index = cell:getTag()
            local data1 = self._karmaData[index*MAX_COL_NUM+1]
            local data2 = self._karmaData[index*MAX_COL_NUM+2]
            local data3 = self._karmaData[index*MAX_COL_NUM+3]
            cell:update(data1,data2,data3)
            G_UserData:getAttr():recordPower()
            self:_playEffect(photoId)
            break
        end
	end
end

function PopupHorseKarma:_playEffect(photoId)
    self._effectPhotoId = photoId

	local function effectFunction(effect)
        if effect == "effect_yuanfen_baozha" then
            local subEffect = EffectGfxNode.new("effect_yuanfen_baozha")
            subEffect:play()
            return subEffect
        end

        if effect == "effect_bg5" then
        	local subEffect = EffectGfxNode.new("effect_bg5")
            subEffect:play()
            return subEffect
        end

    	if effect == "effect_yuanfen_shandian" then
    		local subEffect = EffectGfxNode.new("effect_yuanfen_shandian")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_yuanfen_guangxian" then
    		local subEffect = EffectGfxNode.new("effect_yuanfen_guangxian")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_yuanfen_zhiguang" then
    		local subEffect = EffectGfxNode.new("effect_yuanfen_zhiguang")
            subEffect:play()
            return subEffect
    	end

    	if effect == "heidi" then
            local layerColor = cc.LayerColor:create(cc.c4b(0, 0, 0, 255*0.8))
            layerColor:setAnchorPoint(0.5,0.5)
            layerColor:setIgnoreAnchorPointForPosition(false)
            layerColor:setTouchEnabled(true)
            layerColor:setTouchMode(cc.TOUCHES_ONE_BY_ONE)
            layerColor:registerScriptTouchHandler(function(event)
                if event == "began" then
                    return true
                elseif event == "ended" then
                    
                end
            end)
            return layerColor
    	end
    		
        return self:_createActionNode(effect)
    end

    local function eventFunction(event)
    	if event == "piaozi" then
    		self:_playKarmaActiveSummary()
        elseif event == "finish" then
            self._canClose = true
            self:setShowFinish(true)
        end
    end

    self._canClose = false
    self:setShowFinish(false)

    local len = G_UserData:getHorse():getHorsePhotoNeedNum(photoId)       --战马图鉴激活需要的个数
	local effect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_yuanfen_"..len.."p", effectFunction, eventFunction , true)
    effect:setPosition(cc.p(0, 0))

    G_AudioManager:playSoundWithId(AudioConst.SOUND_HERO_KARMA) --播音效
end

function PopupHorseKarma:_createActionNode(effect)
	local stc, edc = string.find(effect, "moving_yuanfen_icon_")
	if stc then
		local index = string.sub(effect, edc+1, -1)
		local node = self:_createIconNode(tonumber(index))
    	return node
	end

	return cc.Node:create()
end

function PopupHorseKarma:_createIconNode(index)
    logWarn("PopupHorseKarma:_createIconNode， index = "..tostring(index))
	local function effectFunction(effect)
        if effect == "icon_2" then
            local icon = CSHelper.loadResourceNode(Path.getCSB("CommonHorseIcon", "common")) 
            local groupData = G_UserData:getHorse():getHorsePhotoDetailInfo(self._effectPhotoId)
            local horseBaseId = groupData["horse"..index]          
            if horseBaseId then
        		icon:updateUI(horseBaseId)
				return icon
        	end
        end

        if effect == "effect_yuanfen_faguangkuang" then
            local subEffect = EffectGfxNode.new("effect_yuanfen_faguangkuang")
            subEffect:play()
            return subEffect
        end

        if effect == "effect_yuanfen_shanguang" then
            local subEffect = EffectGfxNode.new("effect_yuanfen_shanguang")
            subEffect:play()
            return subEffect
        end
    		
        return cc.Node:create()
    end

    local function eventFunction(event)
        if event == "finish" then
        
        end
    end

    local node = cc.Node:create()
    local resName = "moving_yuanfen_icon_"..index
	local effect = G_EffectGfxMgr:createPlayMovingGfx(node, resName, effectFunction, eventFunction , false)
    return node
end

--播放图鉴激活的总战力变化动画
function PopupHorseKarma:_playKarmaActiveSummary()
    G_Prompt:playTotalPowerSummary()
end

return PopupHorseKarma
