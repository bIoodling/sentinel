
-- Hika's FullBright
-- Auto re-executes after teleports within the same experience

local Lighting = game:GetService("Lighting")

if not game:IsLoaded() then
    game.Loaded:Wait()
end

local env = (type(getgenv) == "function" and getgenv()) or _G
local key = "HikaFullBright"

-- Remove previous connections to prevent duplicates
if env[key] and env[key].Cleanup then
    pcall(env[key].Cleanup)
end

local connections = {}
local originalGameId = game.GameId

local settings = {
    Brightness = 2,
    ClockTime = 14,
    FogEnd = 100000,
    GlobalShadows = false,
    OutdoorAmbient = Color3.fromRGB(128, 128, 128)
}

local function apply()
    for property, value in pairs(settings) do
        if Lighting[property] ~= value then
            Lighting[property] = value
        end
    end
end

apply()

-- Keep FullBright enabled if the game changes lighting
for property, value in pairs(settings) do
    table.insert(connections,
        Lighting:GetPropertyChangedSignal(property):Connect(function()
            if Lighting[property] ~= value then
                Lighting[property] = value
            end
        end)
    )
end

env[key] = {
    Cleanup = function()
        for _, connection in ipairs(connections) do
            connection:Disconnect()
        end
    end
}

-- Teleport persistence
local queue = queue_on_teleport
    or (syn and syn.queue_on_teleport)
    or (fluxus and fluxus.queue_on_teleport)

if type(queue) == "function" then
    local source = "https://raw.githubusercontent.com/bIoodling/blood/main/fb.lua"

    local queuedScript = string.format([[
        if not game:IsLoaded() then
            game.Loaded:Wait()
        end

        if game.GameId == %d then
            loadstring(game:HttpGet(%q))()
        end
    ]], originalGameId, source)

    pcall(queue, queuedScript)
end
