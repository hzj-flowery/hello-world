--
-- Author: Liangxu
-- Date: 2018-1-10 10:26:17
-- 变身卡图鉴
local ViewBase = require("app.ui.ViewBase")
local AvatarBookView = class("AvatarBookView", ViewBase)
local AvatarBookCell = require("app.scene.view.avatarBook.AvatarBookCell")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIConst = require("app.const.UIConst")
local TabScrollView = require("app.utils.TabScrollView")
local AudioConst = require("app.const.AudioConst")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local CSHelper = require("yoka.utils.CSHelper")

function AvatarBookView:ctor(index)
	self._selectTabIndex = index or 1

	local resource = {
		file = Path.getCSB("AvatarBookView", "avatar"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		}
	}
	
	AvatarBookView.super.ctor(self, resource)
end

function AvatarBookView:onCreate()
	self:_initData()
	self:_initView()
end

function AvatarBookView:onEnter()
	self._signalAvatarPhotoActiveSuccess = G_SignalManager:add(SignalConst.EVENT_AVATAR_PHOTO_ACTIVE_SUCCESS, handler(self, self._avatarPhotoActiveSuccess))

	self._nodeTabRoot:setTabIndex(self._selectTabIndex)
	self:_updateData()
	self:_updateView()
	self:_refreshRedPoint()
end

function AvatarBookView:onExit()
	self._signalAvatarPhotoActiveSuccess:remove()
	self._signalAvatarPhotoActiveSuccess = nil
end

function AvatarBookView:_initData()
	self._allBookIds = AvatarDataHelper.getAllBookIds()
	self._curBookIds = {}
	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst.FUNC_TEAM_SLOT1)
end

function AvatarBookView:_initView()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setImageTitle("txt_sys_com_tujian")
	self._fileNodeBg:setTitle(Lang.get("avatar_book_title"))
	self._fileNodeBg:showCount(true)
	self._fileNodeBg:showCountPrefix(false)
	self:_initTabGroup()
end

function AvatarBookView:_initTabGroup()
	local scrollViewParam = {
		template = AvatarBookCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam, self._selectTabIndex)

	local tabNameList = {}
	for i = 1, 4 do
		table.insert(tabNameList, Lang.get("avatar_book_country_tab_"..i))	
	end

	local param = {
		callback = handler(self, self._onTabSelect),
		textList = tabNameList,
	}

	self._nodeTabRoot:recreateTabs(param)
end

function AvatarBookView:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateCurBookIds()
	self:_updateView()
end

function AvatarBookView:_updateData()
	self:_updateAttrData()
	self:_updateCurBookIds()
end

function AvatarBookView:_updateCurBookIds()
	local bookIds = self._allBookIds[self._selectTabIndex] or {}
	self._curBookIds = AvatarDataHelper.getBookIdsBySort(bookIds)
end

function AvatarBookView:_updateAttrData()
	local heroId = G_UserData:getTeam():getHeroIdWithPos(1)
	local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
	local param = {
        heroUnitData = unitData,
    }
	local curAttr = UserDataHelper.getTotalAttr(param)
	self._recordAttr:updateData(curAttr)

	G_UserData:getAttr():recordPower()
end

function AvatarBookView:_updateView()
	local count = math.ceil(#self._curBookIds / 3)
    self._tabListView:updateListView(self._selectTabIndex, count)
    self:_updateProcess()
end

function AvatarBookView:_updateProcess()
	local count = 0
	for i, bookId in ipairs(self._curBookIds) do
		local isActive = G_UserData:getAvatarPhoto():isActiveWithId(bookId)
		if isActive then
			count = count + 1
		end
	end
	local total = #self._curBookIds
	self._fileNodeBg:setCount(Lang.get("avatar_book_process_"..self._selectTabIndex, {count = count, total = total}))
end

function AvatarBookView:_onItemUpdate(item, index)
	local index = index * 3
	item:update(self._curBookIds[index + 1], self._curBookIds[index + 2], self._curBookIds[index + 3])
end

function AvatarBookView:_onItemSelected(item, index)
	
end

function AvatarBookView:_onItemTouch(index, t)
	local index = index * 3 + t
	local bookId = self._curBookIds[index]
	G_UserData:getAvatarPhoto():c2sActiveAvatarPhoto(bookId)
end

function AvatarBookView:_avatarPhotoActiveSuccess(eventName, photoId)
	self:_playEffect(photoId)
	self:_updateData()
	self:_updateView()
	self:_refreshRedPoint()
end

function AvatarBookView:_playPrompt()
	local summary = {}
	local param = {
		content = Lang.get("summary_avatar_book_active_success"),
		startPosition = {x = 0},
	} 
	table.insert(summary, param)

	self:_addBaseAttrPromptSummary(summary)
	G_Prompt:showSummary(summary)

	G_Prompt:playTotalPowerSummary()
end

function AvatarBookView:_addBaseAttrPromptSummary(summary)
	local attr = self._recordAttr:getAttr()
	local desInfo = TextHelper.getAttrInfoBySort(attr)
	for i, info in ipairs(desInfo) do
		local attrId = info.id
		local diffValue = self._recordAttr:getDiffValue(attrId)
		if diffValue ~= 0 then
			local param = {
				content = AttrDataHelper.getPromptContent(attrId, diffValue),
				anchorPoint = cc.p(0, 0.5),
				startPosition = {x = -60},
			}
			table.insert(summary, param)
		end
	end
	return summary
end

function AvatarBookView:_refreshRedPoint()
	for i = 1, 4 do
		local bookIds = self._allBookIds[i] or {}
		local redPointShow = AvatarDataHelper.isCanActiveInBookIds(bookIds)
		self._nodeTabRoot:setRedPointByTabIndex(i, redPointShow)
	end
end

function AvatarBookView:_playEffect(bookId)
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
    		
        return self:_createActionNode(effect, bookId)
    end

    local function eventFunction(event)
    	if event == "piaozi" then
    		self:_playPrompt()
        elseif event == "finish" then
            
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_yuanfen_2p", effectFunction, eventFunction , true)

    G_AudioManager:playSoundWithId(AudioConst.SOUND_HERO_KARMA) --播音效
end

function AvatarBookView:_createActionNode(effect, bookId)
	local stc, edc = string.find(effect, "moving_yuanfen_icon_")
	if stc then
		local index = string.sub(effect, edc+1, -1)
		local node = self:_createIconNode(bookId, tonumber(index))
    	return node
	end

	return cc.Node:create()
end

function AvatarBookView:_createIconNode(bookId, index)
	local function effectFunction(effect)
        if effect == "icon_2" then
            local icon = CSHelper.loadResourceNode(Path.getCSB("CommonHeroIcon", "common"))   
            local showConfig = AvatarDataHelper.getAvatarShowConfig(bookId)
           	local avatarId = showConfig["avatar_id"..index]
            local avatarConfig = AvatarDataHelper.getAvatarConfig(avatarId)
			local heroId = avatarConfig.hero_id
    		icon:updateUI(heroId)
			return icon
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

return AvatarBookView