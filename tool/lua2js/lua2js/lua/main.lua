local clazz = require("class");
local foobar = require("foo.bar")
local bar = require("bar")


local foo = {
    [1] = 1,
    a = 2,
    ["a"] = 3,

    b = function()

    end
}

function foo:bar() 
end

local function main() 
    string.format('a%d', 5);
end

main();
