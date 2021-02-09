--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法界面-列表项战法节点
local TacticsItem = class("TacticsItem")
local TacticsConst = require("app.const.TacticsConst")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")
local CommonTacticsIcon = require("app.ui.component.CommonTacticsIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ShaderHalper = require("app.utils.ShaderHelper")


function TacticsItem:ctor(target)
    self._target = target
    self._isUseShader = false   -- 是否使用shader做变灰处理
    
    self:_init()
end


function TacticsItem:_init()
    self._resourceNode = ccui.Helper:seekNodeByName(self._target, "_resourceNode") 	        -- 容器
    self._imgBg = ccui.Helper:seekNodeByName(self._target, "_imgBg") 	                    -- 背景
    self._imgSelected = ccui.Helper:seekNodeByName(self._target, "_imgSelected") 	        -- 选中状态图片
    self._imgSelected:setVisible(false)
    self._imgText1 = ccui.Helper:seekNodeByName(self._target, "_imgText1") 	                -- 装备武将数量背景
    self._textNum = ccui.Helper:seekNodeByName(self._target, "_textNum") 	                -- 装备武将数量文字
    self._nodeMask = ccui.Helper:seekNodeByName(self._target, "_nodeMask") 	                -- 研习百分比图片的占位节点
    self._imgMask2 = ccui.Helper:seekNodeByName(self._target, "_imgMask2") 	                -- 未解锁情况下的遮罩
    self._txtPercent = ccui.Helper:seekNodeByName(self._target, "_txtPercent")              -- 研习百分比
    self._txtUnlock = ccui.Helper:seekNodeByName(self._target, "_txtUnlock") 	            -- 可解锁文字
    self._txtName = ccui.Helper:seekNodeByName(self._target, "_txtName") 	                -- 战法名字
    self._txtHero = ccui.Helper:seekNodeByName(self._target, "_txtHero") 	                -- 装备武将
    self._imgMaskPercent = ccui.Helper:seekNodeByName(self._target, "_imgMaskPercent") 	    -- 圆形进度
    self._nodeTacticsIcon = ccui.Helper:seekNodeByName(self._target, "_nodeTacticsIcon") 	-- icon
    self._effectNode = ccui.Helper:seekNodeByName(self._target, "_effectNode") 	            -- 特效父节点
    self._panel = ccui.Helper:seekNodeByName(self._target, "_panel") 	                    -- 小红点父节点
    
    self._imgText1:setVisible(false)        -- 隐藏已装配/未装配
	-- local size = self._resourceNode:getContentSize()
	-- self:setContentSize(size.width, size.height)
    cc.bind(self._nodeTacticsIcon, "CommonTacticsIcon")
    self._nodeTacticsIcon:setTouchEnabled(false)
    
    self._imgBg:setTouchEnabled(true)
    self._imgBg:setSwallowTouches(false)
    self._imgBg:addClickEventListenerEx(handler(self,self._onClickIcon))
    
    self:_initProgress()
    self:_initEffect()
end

function TacticsItem:setCallback(clickIcon)
    self._clickIcon = clickIcon
end

function TacticsItem:setVisible(visible)
    self._target:setVisible(visible)
end

function TacticsItem:setSelected(isSel)
    -- self._imgSelected:setVisible(isSel)
    if isSel then
        self._subEffect:setVisible(true)
        self._subEffect:play()
    else
        self._subEffect:setVisible(false)
        self._subEffect:stop()
    end
end

function TacticsItem:_initProgress()
    if self._imgMaskPercent then return end
    local pic = Path.getTacticsImage("img_tactis_zhezhao01")
    local pt = cc.ProgressTimer:create(cc.Sprite:create(pic))
    self._nodeMask:addChild(pt)
    pt:setType(cc.PROGRESS_TIMER_TYPE_RADIAL)
    pt:setPercentage(50)
    local scaleFactor = 80/72
    pt:setScale(-scaleFactor, scaleFactor)
    self._imgMaskPercent = pt
end

function TacticsItem:_initEffect()
	local function eventFunc(event, frameIndex, node)
        if event == "forever" then
            -- node:play()
		end
	end
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local subEffect = EffectGfxNode.new("effect_zhanfa_kuang", eventFunc)
    subEffect:setVisible(false)
    -- subEffect:setPosition(cc.p(0, 0))
    -- subEffect:setScale(1.2)
    self._effectNode:addChild(subEffect)
    self._subEffect = subEffect
end

function TacticsItem:getTarget()
    return self._target
end

function TacticsItem:refresh()
    self:updateUI(self._tacticsUnitData, self._index, self._subIndex)
end

-- 更新图标和其他ui
function TacticsItem:updateUI(tacticsUnitData, index, subIndex)
    self._tacticsUnitData = tacticsUnitData
    self._index = index
    self._subIndex = subIndex
	local value = tacticsUnitData:getConfig().id
	
	local itemParams = self._nodeTacticsIcon:updateUI(tacticsUnitData:getBase_id())
    self._txtName:setString(itemParams.name)
    self._txtName:setColor(itemParams.icon_color)
    if itemParams.icon_color_outline_show then
        self._txtName:enableOutline(itemParams.icon_color_outline, 2) 
    else
        self._txtName:disableEffect(cc.LabelEffect.OUTLINE)
    end

    self._imgMask2:setVisible(false)

    local needShader = false
    if not tacticsUnitData:isUnlocked() then
        self._textNum:setVisible(false)
        self._txtPercent:setVisible(false)
        self._imgMaskPercent:setVisible(false)
        local canUnlock = TacticsDataHelper.isCanUnlocked(tacticsUnitData)
        self._txtUnlock:setVisible(canUnlock)
        self._txtHero:setVisible(false)
        self._imgMask2:setVisible(true)
        needShader = true
    elseif not tacticsUnitData:isStudied() then
        self._textNum:setVisible(false)
        self._txtPercent:setVisible(true)
        self._imgMaskPercent:setVisible(true)
        self._txtUnlock:setVisible(false)
        self._txtHero:setVisible(false)
        local percent = 100*self._tacticsUnitData:getProficiency()/TacticsConst.MAX_PROFICIENCY
        self._txtPercent:setString(Lang.get("hero_detail_common_percent", {value=percent}))
        self._imgMaskPercent:setPercentage(100-percent)
    else
        self._textNum:setVisible(true)
        self._txtPercent:setVisible(false)
        self._imgMaskPercent:setVisible(false)
        self._txtUnlock:setVisible(false)
        if tacticsUnitData:getHero_id()>0 then
            self._txtHero:setVisible(true)

            local heroUnitData = G_UserData:getHero():getUnitDataWithId(tacticsUnitData:getHero_id())
            local baseId = heroUnitData:getBase_id()
            local params = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId)
            self._txtHero:setVisible(true)
            self._txtHero:setString(params.name)
            self._textNum:setString(Lang.get("tactics_item_puton"))
            self._textNum:setColor(Colors.RED)
        else
            self._txtHero:setVisible(false)
            self._textNum:setString(Lang.get("tactics_item_empty"))
            self._textNum:setColor(Colors.TacticsActiveColor)
        end
    end

    if needShader --[[and not self._isUseShader]] then
        self._isUseShader = true
        ShaderHalper.filterNode(self._nodeTacticsIcon, "gray")
    else--[[if not needShader and self._isUseShader then]]
        self._isUseShader = false
        ShaderHalper.filterNode(self._nodeTacticsIcon, "", true)
    end

    self:_updateRedPoint()
end

function TacticsItem:_updateRedPoint()
    local node = self._panel
    local posPercent = cc.p(0.8, 0.8)
    local show = self._tacticsUnitData:isCanUnlock()
    if show then
        local redImg = node:getChildByName("redPoint")
        if not redImg then
            local UIHelper = require("yoka.utils.UIHelper")
            redImg = UIHelper.createImage({texture = Path.getUICommon("img_redpoint")})
            redImg:setName("redPoint")
            node:addChild(redImg)
            if posPercent then
                UIHelper.setPosByPercent(redImg, posPercent)
            end
        end
        redImg:setVisible(true)
    else
        local redImg = node:getChildByName("redPoint")
        if redImg then
            redImg:setVisible(false)
        end
    end
end

function TacticsItem:isTouched(pos)
    local locationInNode = self._imgBg:convertToNodeSpace(pos)
    local s = self._imgBg:getContentSize()
    local rect = cc.rect(0, 0, s.width, s.height)
    if cc.rectContainsPoint(rect. locationInNode) then
        return true
    else
        return false
    end
end

function TacticsItem:_onClickIcon()
    if self._clickIcon then
        self._clickIcon(self._subIndex)
    end
end


return TacticsItem
