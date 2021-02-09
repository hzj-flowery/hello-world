local PopupBase = require("app.ui.PopupBase")
local PopupStarRank = class("PopupStarRank", PopupBase)

local PopupStarRankNode = require("app.scene.view.stage.PopupStarRankNode")
local Hero = require("app.config.hero")
local Color = require("app.utils.Color")
local ChapterConst = require("app.const.ChapterConst")

function PopupStarRank:waitEnterMsg(callBack, msgParam)
	local function onMsgCallBack(id, message)
		callBack()
	end
    G_UserData:getStarRankData():c2sGetStageStarRank(msgParam)

    local signal = G_SignalManager:add(SignalConst.EVENT_CHAPTER_STAR_RANK, onMsgCallBack)
    return signal
end

function PopupStarRank:ctor(rankType)
    --ui
    self._rankBase = nil            --通用排行底板
    self._listRank = nil            --排行榜list
    self._textMyRank = nil          --我的名次
    self._textMyName = nil          --我的名字
    self._textMyChapter = nil       --我的章节数
    self._textMyStar = nil          --我的星数
    self._myRank = nil              --我的排名icon
    self._nodeEmpty = nil           --空数据提示
    self._rankType = rankType       --排行榜类型

    self._data = G_UserData:getStarRankData()
    print(self._data:getSelfRank())

	local resource = {
		file = Path.getCSB("PopupStarRank", "stage"),
		binding = {
		}
	}
	PopupStarRank.super.ctor(self, resource)
end

function PopupStarRank:onCreate()
    self._rankBase:addCloseEventListener(handler(self, self._onCloseClick))
    self._rankBase:setTitle(Lang.get("mission_star_rank_title"))
    self:_setMyInfo()
    local rankData = self._data:getRankDatas()
    local listView = self._listRank
    listView:setTemplate(PopupStarRankNode)
    listView:setCallback(handler(self, self._onRankUpdate), handler(self, self._onItemSelected))
    listView:resize(#rankData)

    self._nodeEmpty:setVisible(#rankData <= 0)
end

function PopupStarRank:_onRankUpdate(item, index)
    local rankData = self._data:getRankDatas()
    if #rankData > 0 then
		item:refreshInfo(rankData[index+1])
	end
end

function PopupStarRank:_onItemSelected(item, index)

end

function PopupStarRank:onEnter()
    local runningScene = G_SceneManager:getRunningScene()
	runningScene:addGetUserBaseInfoEvent()
end

function PopupStarRank:onExit()
end

function PopupStarRank:_onCloseClick()
    self:closeWithAction()
end


--设置我的信息
function PopupStarRank:_setMyInfo()
    local myRank = self._data:getSelfRank()
    if myRank == 0 then
        self._textMyRank:setString(Lang.get("mission_star_no_rank"))
        self._myRank:setVisible(false)
    elseif myRank < 4 then
        local icon = Path.getRankIcon(myRank)
        -- self._imageRank:loadTexture(icon)      
        self._textMyRank:setVisible(false)
        self._myRank:setVisible(true)
        self._myRank:setRank(myRank)
    else
        self._textMyRank:setString(myRank)
        self._textMyRank:setVisible(true)
        -- self._imageRank:setVisible(false)
        self._myRank:setVisible(false)
    end

    local myName = G_UserData:getBase():getName()
    self._textMyName:setString(myName)

    local officerLevel = G_UserData:getBase():getOfficer_level()
    self._textMyName:setColor(Color.getOfficialColor(officerLevel))
    require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textMyName, officerLevel)


    local chapters = nil
    if self._rankType == ChapterConst.CHAPTER_TYPE_NORMAL then
        chapters = G_UserData:getChapter():getChapters()
    elseif self._rankType == ChapterConst.CHAPTER_TYPE_ELITE then
        chapters = G_UserData:getChapter():getE_chapters()
    end
    assert(chapters, "chapter type is error")
    -- local Chapters = G_UserData:getChapter():getChapters()
    local maxChapterId = 0
    for _, val in pairs(chapters) do
        if val:getChapterStar() ~= 0 then
            maxChapterId = val:getId()
        end
    end
    maxChapterId = maxChapterId % 1000
    self._textMyChapter:setString(Lang.get("mission_star_chapter", {num = maxChapterId}))
    -- local totalStar = G_UserData:getChapter():getTotal_star()
    -- self._textMyStar:setString(totalStar)
    self._textMyStar:setString(self._data:getStar())

end

return PopupStarRank