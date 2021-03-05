local ViewBase = require("app.ui.ViewBase")
local ExploreNode = class("ExploreNode", ViewBase)
local Path = require("app.utils.Path")

function ExploreNode:ctor(parentView, data)
    self._parentView = parentView   -- 父界面
    self._data = data   --数据
    -- self._cloudPanel = cloudPanel   --画云的涂层
    self._configData = data:getConfigData() --数据表数据
    self._chapterData = G_UserData:getChapter():getGlobalChapterById(self._configData.chapter_id)   --对应章节数据
    self._closeTip = nil        --点击关闭提示
    self._isOpen = false        --是否开放
    self._isShow = false        --是否显示

    --ui
    self._btnCity = nil         --城市按钮
    self._textCityName = nil    --城市名字
    self._itemReward = nil      --出产图标
    self._imageLock = nil       --锁
    -- self._labelProgressBG = nil     --进度底板
    self._textProgress = nil        --进度文字
    self._textProgressBg = nil --进度背景
    -- self._imageSword = nil      --宝剑图标

    -- self:setPosition(cc.p(self._configData.city_x, self._configData.city_y))

	local resource = {
		file = Path.getCSB("ExploreNode", "exploreMain"),
		binding = {
            _btnCity =
            {
                events = {{event = "touch", method = "_onCityClick"}}
            }
		}
	}
	ExploreNode.super.ctor(self, resource)
end

function ExploreNode:onCreate()
    self:setPosition(cc.p(self._configData.city_x, self._configData.city_y))
    -- self._imageSword:setVisible(false)
    self._nodeSword:removeAllChildren()
    self._btnCity:setSwallowTouches(false)

    self._textCityName:setString(self._configData.name)
    self._btnCity:ignoreContentAdaptWithSize(true)
    local cityIconPath = Path.getExploreCityRes(self._configData.city)
    self._btnCity:loadTextures(cityIconPath, "", cityIconPath, 0)

    self._itemReward:initUI(self._configData.produce_type, self._configData.produce_id)
    self._itemReward:setTouchEnabled(true)
    self._itemReward:setSwallowTouchesEnabled(true)
end

function ExploreNode:onEnter()
end

function ExploreNode:onExit()
end

--刷新城市
function ExploreNode:refreshCity()
    self._isShow = G_UserData:getExplore():isLastPass(self._configData.id, 3)    --前3章节通关,显示
    self:setVisible(self._isShow)

    if G_UserData:getExplore():isLastPass(self._configData.id, 1) then  --上一张通关，开放
        if self._chapterData:isLastStagePass() then
            self:_open()
        else
            local chapteConfig = self._chapterData:getConfigData()
            self._closeTip = Lang.get("explore_main_close_title", {chapter = chapteConfig.chapter, name = chapteConfig.name})
            self:_close()
        end
    else
        if G_UserData:getExplore():isLastPass(self._configData.id, 2) then  --上两张通关
            if self._chapterData:isLastStagePass() then
                local lastExploreId = self._configData.ago_chapter
                local passExploreData = G_UserData:getExplore():getExploreById(lastExploreId)
                self._closeTip = Lang.get("explore_city_close_title", {name = passExploreData:getConfigData().name})
                self:_close()
            else
                local chapteConfig = self._chapterData:getConfigData()
                self._closeTip = Lang.get("explore_main_close_title", {chapter = chapteConfig.chapter, name = chapteConfig.name})
                self:_close()
            end 
        else
            self:_disable()
        end
    end
end

--按钮关闭状态
function ExploreNode:_close()
    self._btnCity:setTouchEnabled(true)
    self._textProgress:setString(self._closeTip)
    self._textProgress:setColor(Colors.OBVIOUS_YELLOW)
    -- self._textProgress:enableOutline(Colors.OBVIOUS_YELLOW_OUTLINE, 2)
    self._textProgress:setVisible(true)
    self._textProgressBg:setVisible(true)
    local oldSize = self._textProgress:getContentSize()
    self._textProgressBg:setContentSize(cc.size(oldSize.width + 60, oldSize.height + 5))
    self._btnCity:setBright(false)
    self._imageLock:setVisible(true)
    self._isOpen = false
end

--设置按钮不可按
function ExploreNode:_disable()
    self._btnCity:setBright(false)
    self._imageLock:setVisible(true)
    self._textProgressBg:setVisible(false)
    self._textProgress:setVisible(false)
    -- self._labelProgressBG:setVisible(false)
    self._btnCity:setTouchEnabled(false)
    self._isOpen = false
end

--按钮开放状态
function ExploreNode:_open()
    self._btnCity:setTouchEnabled(true)
    self._btnCity:setBright(true)
    self._imageLock:setVisible(false)

    --后端发送过来的数据可能会越界 需要判断一下 做一个保护
    local footIndex = self._data:getFoot_index() + 1
    if footIndex > self._configData.size then
        footIndex = self._configData.size
    end
    local progress = math.floor(footIndex / self._configData.size * 100)
    if self._data:getFoot_index() == 0 then
        progress = 0
    end
    if progress ~= 0 then
        -- self._labelProgressBG:setVisible(true)
        self._textProgressBg:setVisible(true)
        self._textProgress:setVisible(true)
        self._textProgress:setString(Lang.get("explore_city_progress", {count = progress}))
        self._textProgress:setColor(Colors.OBVIOUS_GREEN)
        -- self._textProgress:enableOutline(Colors.OBVIOUS_GREEN_OUTLINE, 2)
        local oldSize = self._textProgress:getContentSize()
        self._textProgressBg:setContentSize(cc.size(oldSize.width + 60, oldSize.height + 5))
    else
        self._textProgress:setVisible(false)
        self._textProgressBg:setVisible(false)
        -- self._labelProgressBG:setVisible(false)
    end
    self._isOpen = true
end

--点击城市按钮
function ExploreNode:_onCityClick(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
    if offsetX < 20 and offsetY < 20  then
        if self._parentView:getCurExploreId() == nil then
            self._parentView:setCurExploreId(self._configData.chapter_id)
            self:goToCity()
        end
	end
end
function ExploreNode:goToCity()
    if self._isOpen then
        if self._data:getMap_id() == 0 then
            G_UserData:getExplore():c2sEnterExplore(self._configData.id)
        else
            G_SceneManager:showScene("exploreMap", self._configData.id)
        end
    -- elseif not self._isShowCloud then
    else
        G_Prompt:showTip(self._closeTip)
    end
    local SchedulerHelper = require("app.utils.SchedulerHelper")
    SchedulerHelper.newScheduleOnce(function()
        self._parentView:setCurExploreId(nil)
    end, 0.1)
end

--返回是否开放
function ExploreNode:isOpen()
    return self._isOpen
end

--返回坐标点
function ExploreNode:getNodePosition()
    return cc.p(self._configData.city_x, self._configData.city_y)
end

function ExploreNode:getConfigId()
    return self._configData.id
end

--显示宝剑图样
function ExploreNode:showSword(s)
    -- self._imageSword:setVisible(s)
    if not s then
        self._nodeSword:removeAllChildren()
    else
        self:createSwordEft()
    end
end

--创建剑特效
function ExploreNode:createSwordEft()
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
        if effect == "effect_shuangjian"then
            local subEffect = EffectGfxNode.new("effect_shuangjian")
            subEffect:play()
            return subEffect
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self._nodeSword, "moving_shuangjian", effectFunction, nil, false )
end

function ExploreNode:playFireWorksEffect()
	self._filreNode:removeAllChildren()
	G_EffectGfxMgr:createPlayGfx(self._filreNode,"effect_fudaokaiqi_lihua", nil, true)
end


return ExploreNode
