local ViewBase = require("app.ui.ViewBase")
local PopupBossNode = class("ChapterView", ViewBase)
local StoryEssenceBoss = require("app.config.story_essence_boss")
local Color = require("app.utils.Color")
-- local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function PopupBossNode:ctor(chapterData)
    self._chapterData = chapterData

    self._imageChapterBG = nil      --章数bg
    self._txtChapter = nil          --章节数
    self._txtChapterName = nil      --章节名
    self._imageLock = nil           --锁
    self._iconBossImg = nil         --BOSS形象
    self._imageBossBG = nil         --boss名字背景
    self._bossName = nil            --boss名字
    self._btnFight = nil            --攻击
    self._imageKill = nil           --已击杀图案
    self._nodeUI = nil              --除了icon,其他的ui根节点

	local resource = {
		file = Path.getCSB("PopupBossNode", "chapter"),
		binding = {
			_btnFight = {
				events = {{event = "touch", method = "_onFightClick"}}
			},
		}
	}
	PopupBossNode.super.ctor(self, resource)
end

function PopupBossNode:onCreate()
    self._btnFight:setString(Lang.get("elite_challenge"))
end

function PopupBossNode:onEnter()
    self._nodeUI:setVisible(false)
    self._imageLock:setVisible(true)
    self._iconBossImg:setVisible(false)
    self:refreshData(self._chapterData)
end

function PopupBossNode:onExit()
end

function PopupBossNode:refreshData(chapterData)
    self._chapterData = chapterData
   
    if not self._chapterData then
        self._nodeUI:setVisible(false)
        self._imageLock:setVisible(true)
        self._iconBossImg:setVisible(false)
        return
    end
    local config = self._chapterData:getConfigData()
    self._txtChapter:setString(config.chapter)
    self._txtChapterName:setString(config.name)
    local data = StoryEssenceBoss.get(self._chapterData:getBossId())
    self._iconBossImg:updateUI(data.res_id)
    self._iconBossImg:setQuality(data.color)
    self._iconBossImg:setVisible(true)
    self._imageLock:setVisible(false)
    
    self._bossName:setString(data.name)
    self._bossName:setColor(Color.getColor(data.color))
	-- self._bossName:enableOutline(Color.getColorOutline(data.color), 2)	
    local state = self._chapterData:getBossState()
    if state == 0 then
        self._imageKill:setVisible(false)
        self._btnFight:setVisible(true)
    else
        self._imageKill:setVisible(true)
        self._btnFight:setVisible(false)
    end
    self._nodeUI:setVisible(true)
end

function PopupBossNode:_onFightClick()
    local state = self._chapterData:getBossState()
    if state == 1 then
        return
    end    
    G_SceneManager:showScene("stage", self._chapterData:getId(), 0, true, true)
end

return PopupBossNode