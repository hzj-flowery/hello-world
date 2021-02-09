local ViewBase = require("app.ui.ViewBase")
local ChapterMapCell = class("ChapterMapCell", ViewBase)

function ChapterMapCell:ctor(index)
    self._index = index
	local resource = {
		file = Path.getCSB("ChapterMapCell", "chapter"),
	}
	ChapterMapCell.super.ctor(self, resource)
end

function ChapterMapCell:onCreate()
	local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)

    self._imageMapBG:loadTexture(Path.getChapterBG(self._index))
    self:_createEffect()

end

function ChapterMapCell:_createEffect(index)
    --添加特效
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_fudaomap"..tostring(self._index))
end


return ChapterMapCell