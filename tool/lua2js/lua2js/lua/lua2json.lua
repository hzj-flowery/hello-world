local json = require("JSON")
local config = {}

-- local origin, key_map = require("config.equipment_refine")
local origin, key_map = dofile("./config/equipment_refine.lua")
config.data = origin._data
config.index = origin.index()
config.key_map = key_map;

local file = io.open('out.json', "w+")

file:write(json:encode_pretty(config))
file:close()
