local PopupBase = require("app.ui.PopupBase")
local PopupBossCome = class("PopupBossCome", PopupBase)
local UIHelper = require("yoka.utils.UIHelper")
PopupBossCome.BOSS_PRE_PAGE = 4

function PopupBossCome:ctor(bossChapters)
    self._bossChapters = bossChapters   --章节列表
    self._pageIdx = 1             --页数
    self._totalPage = math.ceil(#bossChapters / PopupBossCome.BOSS_PRE_PAGE)
    self._animOver = false

    
    self._effectNode = nil      --
    

	local resource = {
		file = Path.getCSB("PopupBossCome", "chapter"),
		binding = {
		}
	}
	PopupBossCome.super.ctor(self, resource)
end

function PopupBossCome:onCreate()
    self._nodes = {}
    self:_playAnim()
end

function PopupBossCome:onEnter()
    self._signalActDailyBoss = G_SignalManager:add(SignalConst.EVENT_ACTIVITY_DAILY_BOSS, handler(self, self._onEventDailyBoss))
    self._signalChapterInfoGet = G_SignalManager:add(SignalConst.EVENT_CHAPTER_INFO_GET, handler(self, self._onEventChapterInfoGet))
    
end

function PopupBossCome:_onEventChapterInfoGet(event)
    self:_refreshView()
end

function PopupBossCome:_onEventDailyBoss(eventName, ret)
    self:_refreshView()
end

function PopupBossCome:_playAnim()
    local function effectFunction(effect)
        if effect == "jingying_xiangqing" then
            local CSHelper = require("yoka.utils.CSHelper")
            local helpNode = CSHelper.loadResourceNode(Path.getCSB("CommonHelp", "common"))
            helpNode:updateUI(FunctionConst.FUNC_CHAPTER_BOSS)
            return helpNode
        elseif effect == "jingying_zhangjie1" then
            local bossNode = require("app.scene.view.chapter.PopupBossNode").new(self._bossChapters[1])
            self._nodes[1] = bossNode
            return bossNode
        elseif effect == "jingying_zhangjie2" then
            local bossNode = require("app.scene.view.chapter.PopupBossNode").new(self._bossChapters[2])
            self._nodes[2] = bossNode
            return bossNode
        elseif effect == "jingying_zhangjie3" then
            local bossNode = require("app.scene.view.chapter.PopupBossNode").new(self._bossChapters[3])
            self._nodes[3] = bossNode
            return bossNode
        elseif effect == "jingying_zhangjie4" then
            local bossNode = require("app.scene.view.chapter.PopupBossNode").new(self._bossChapters[4])
            self._nodes[4] = bossNode
            return bossNode
        elseif effect == "jingying_close" then
            -- local sprite = display.newSprite(Path.getEmbattle("btn_embattle_close")) 
            local params = {
                texture = Path.getEmbattle("btn_embattle_close")
            }
            local btnClose = UIHelper.createImage(params)
            btnClose:setTouchEnabled(true)
            btnClose:addTouchEventListenerEx(handler(self, self._onCloseClick))
            return btnClose
        elseif effect == "jingying_jiantou_copy1" then 
            local btn = require("yoka.utils.UIHelper")
            local params = {
                texture = Path.getUICommon("img_com_arrow04")
            }
            local btn = UIHelper.createImage(params)
            btn:setTouchEnabled(true)
            btn:addTouchEventListenerEx(handler(self, self._onLeftPageClick))
            self._btnLeftPage = btn
            -- btn:setVisible(false)
            return btn
        elseif effect == "jingying_jiantou_copy2" then 
            local btn = require("yoka.utils.UIHelper")
            local params = {
                texture = Path.getUICommon("img_com_arrow04")
            }
            local btn = UIHelper.createImage(params)
            btn:setTouchEnabled(true)
            btn:addTouchEventListenerEx(handler(self, self._onRightPageClick))
            self._btnRightPage = btn
            -- btn:setVisible(true)
            return btn
        end
    end
    local function eventFunction(event)
        if event == "finish" then
            self._btnLeftPage:setVisible(false)
            self._animOver = true
            self:_refreshView()
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self._effectNode, "moving_jingying_junqing", effectFunction, eventFunction, false )
end

function PopupBossCome:_onLeftPageClick(sender, event)
    if event == 2 then
        if self._pageIdx <= 1 then
            return
        end
        self._pageIdx = self._pageIdx - 1
        self:_refreshPage()
    end
end

function PopupBossCome:_onRightPageClick(sender, event)
    if event == 2 then
        if self._pageIdx >= self._totalPage then
            return
        end
        self._pageIdx = self._pageIdx + 1
        self:_refreshPage()
    end
end

function PopupBossCome:_refreshPage()
    for i = 1, PopupBossCome.BOSS_PRE_PAGE do
        local bossIndex = (self._pageIdx - 1) * PopupBossCome.BOSS_PRE_PAGE + i
        local bossData = self._bossChapters[bossIndex]
        self._nodes[i]:refreshData(bossData)
    end

    if self._pageIdx == 1 then
        self._btnLeftPage:setVisible(false)
    else
        self._btnLeftPage:setVisible(true)
    end 

    if self._bossChapters[self._pageIdx*PopupBossCome.BOSS_PRE_PAGE + 1] then
        self._btnRightPage:setVisible(true)
    else
        self._btnRightPage:setVisible(false)
    end
end

function PopupBossCome:onExit()
    self._signalActDailyBoss:remove()
    self._signalActDailyBoss = nil
    self._signalChapterInfoGet:remove()
    self._signalChapterInfoGet = nil
end

function PopupBossCome:_onCloseClick(sender, event)
    if event == 2 then
        self:close()
    end
end

function PopupBossCome:_refreshView()
    if not self._animOver then
        return
    end
    local chapterData = G_UserData:getChapter()
    local bossChapters = chapterData:getBossChapters()
    if #bossChapters <= 0 then
        self:close()
        return 
    end
    self._bossChapters = bossChapters   --章节列表
    self._pageIdx = 1             --页数
    self._totalPage = math.ceil(#bossChapters / PopupBossCome.BOSS_PRE_PAGE)
    
    self:_refreshPage()
end


return PopupBossCome