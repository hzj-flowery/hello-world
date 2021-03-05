local HeroShowOld = require("app.scene.view.heroShow.HeroShowOld")
local HeroShowTrue = require("app.scene.view.heroShow.HeroShowTrue")

local HeroShow = {}

function HeroShow.create(heroId, callback, needAutoClose, isRight)
    local className
    if isRight then
        className = HeroShowOld
    else
        className = HeroShowTrue
    end
	-- assert(spriteFrames and num, "spriteFrames and num could not be nil !")
	local heroShow = className.new(heroId, callback, needAutoClose, isRight)
    heroShow:open()
end


return HeroShow