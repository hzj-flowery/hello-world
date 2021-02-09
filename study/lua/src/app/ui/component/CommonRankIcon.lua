local CommonRankIcon = class("CommonRankIcon")


local EXPORTED_METHODS = {
    "setRank",
	"setRankType2",
	"setRankType3",
	"setRankType4"
}

function CommonRankIcon:ctor()
	self._target = nil
	self._imageRankBG = nil
	self._imageRank = nil
end

function CommonRankIcon:_init()
	self._imageRankBG = ccui.Helper:seekNodeByName(self._target, "ImageRankBG")
	self._imageRank = ccui.Helper:seekNodeByName(self._target, "ImageRank")
	self._textRank = ccui.Helper:seekNodeByName(self._target, "TextRank")
	self._textRank:setVisible(false)
end

function CommonRankIcon:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonRankIcon:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonRankIcon:setRank(rank)
    self._imageRankBG:loadTexture(Path.getArenaUI("img_qizhi0"..rank))
    --self._imageRank:loadTexture(Path.getComplexRankUI("txt_ranking0"..rank))
end

function CommonRankIcon:setRankType2(rank)
	if rank <=3 and rank > 0  then
		--self._imageRank:setVisible(true)
		self._textRank:setVisible(false)
		self._imageRankBG:loadTexture(Path.getArenaUI("img_qizhi0"..rank))
	    --self._imageRank:loadTexture(Path.getComplexRankUI("txt_ranking0"..rank))
	else
		self._imageRankBG:loadTexture(Path.getArenaUI("img_qizhi04"))
		self._imageRank:setVisible(false)
		self._textRank:setVisible(true)
		self._textRank:setString(rank)
	end
end

--
function CommonRankIcon:setRankType4(rank)
	if rank <=3 and rank > 0  then
		--self._imageRank:setVisible(true)
		self._textRank:setVisible(false)
		self._imageRankBG:setVisible(true)
		self._imageRankBG:loadTexture(Path.getArenaUI("img_qizhi0"..rank))
	    --self._imageRank:loadTexture(Path.getComplexRankUI("txt_ranking0"..rank))
	else
		self._imageRankBG:setVisible(false)
		-- self._imageRankBG:loadTexture(Path.getComplexRankUI("icon_ranking04"))
		self._imageRank:setVisible(false)
		self._textRank:setVisible(true)
		self._textRank:setString(rank)
	end
end


function CommonRankIcon:setRankType3(rank)
	self._imageRankBG:setVisible(false)
	self._imageRank:setVisible(false)
	self._textRank:setVisible(true)
	self._textRank:setString(rank)
end




return CommonRankIcon
