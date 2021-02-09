
local ViewBase = require("app.ui.ViewBase")
local GuildWarUserBuffNode = class("GuildWarUserBuffNode", ViewBase)
local HomelandConst = require("app.const.HomelandConst")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")

local BUFF_RES = {
    [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_8] = "img_buff_xu",
    [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_9] = "img_buff_su",
    [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_10] = "img_buff_xue",
    [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_11] = "img_buff_chai",
}

function GuildWarUserBuffNode:ctor()
	local resource = {
		file = Path.getCSB("GuildWarUserBuffNode", "guildwarbattle"),
		binding = {
		},
	}
	GuildWarUserBuffNode.super.ctor(self, resource)
end

function GuildWarUserBuffNode:onCreate()
    
end

function GuildWarUserBuffNode:onEnter()

end

function GuildWarUserBuffNode:onExit()

end

function GuildWarUserBuffNode:updateUI(buffBaseIds)
    for i = 1, 4 do
        local buffBaseId = buffBaseIds[i]
        if buffBaseId then
            self["_imageBuff"..i]:setVisible(true)
            local resName = BUFF_RES[buffBaseId]
            self["_imageBuff"..i]:loadTexture(Path.getGuildWar(resName))
        else
            self["_imageBuff"..i]:setVisible(false)
        end
    end
end

return GuildWarUserBuffNode