UI.AddHotkey(["Rage", "General", "General", "Key assignment"], "Autowall", "Autowall")
UI.AddHotkey(["Rage", "General", "General", "Key assignment"], "Fakeduck", "Fakeduck")
UI.AddHotkey(["Rage", "General", "General", "Key assignment"], "Damage override", "Damage override")

UI.AddSubTab(["Rage", "SUBTAB_MGR"], "viskyHook")
UI.AddCheckbox(["Rage", "viskyHook", "viskyHook"], "FOV over Crosshair")
UI.AddSliderInt(["Rage", "viskyHook", "viskyHook"], "Override minimum damage", 0, 130)
UI.AddCheckbox(["Rage", "viskyHook", "viskyHook"], "Fakeduck on Valve Servers")
UI.AddCheckbox(["Rage", "viskyHook", "viskyHook"], "Advanced AA")
UI.AddCheckbox(["Rage", "viskyHook", "viskyHook"], "Jitter Slow walk")
UI.AddSliderInt(["Rage", "viskyHook", "viskyHook"], "Jitter Slow walk intensity", 0, 10)
UI.AddColorPicker(["Rage", "viskyHook", "viskyHook"], "Indicator Color")

var tickcount = Global.Tickcount()
var screen_size = Global.GetScreenSize()

var enable_fd = false

var show_rage = false
var show_aw = false
var show_baim = false
var show_fd = false
var show_error_window = false

var white = [255, 255, 255, 255]
var black = [0, 0, 0, 255]
var green = [150, 200, 60, 255]
var red = [255, 0, 0, 255]
var yellow = [255, 255, 102, 255]

var wepname_category = {
    "usp s": "USP", "glock 18": "Glock", "dual berettas": "Dualies", "r8 revolver": "Revolver", "desert eagle": "Deagle", "p250": "P250", "tec 9": "Tec-9",
    "mp9": "MP9", "mac 10": "Mac10", "pp bizon": "PP-Bizon", "ump 45": "UMP45", "ak 47": "AK47", "sg 553": "SG553", "aug": "AUG", "m4a1 s": "M4A1-S", "m4a4": "M4A4", "ssg 08": "SSG08",
    "awp": "AWP", "g3sg1": "G3SG1", "scar 20": "SCAR20", "xm1014": "XM1014", "mag 7": "MAG7", "m249": "M249", "negev": "Negev", "p2000": "General", "famas": "FAMAS", "five seven": "Five Seven", "mp7": "MP7",
    "ump 45": "UMP45", "p90": "P90", "cz75 auto": "CZ-75", "mp5 sd": "MP5", "galil ar": "GALIL", "sawed off": "Sawed off"
}

var wd = [["Sawed off", 0, 0], ["Negev", 0, 0], ["MAG7", 0, 0], ["XM1014", 0, 0], ["M249", 0, 0], ["G3SG1", 0, 0], ["SCAR20", 0, 0], ["SSG08", 0, 0], ["GALIL", 0, 0], ["FAMAS", 0, 0], ["AWP", 0, 0],
["SG553", 0, 0], ["AUG", 0, 0], ["AK47", 0, 0], ["M4A4", 0, 0], ["M4A1-S", 0, 0], ["PP-Bizon", 0, 0], ["UMP45", 0, 0], ["MP9", 0, 0], ["MP7", 0, 0], ["MP5", 0, 0], ["P90", 0, 0], ["Mac10", 0, 0], ["CZ-75", 0, 0],
["P250", 0, 0], ["Dualies", 0, 0], ["Revolver", 0, 0], ["Deagle", 0, 0], ["Tec-9", 0, 0], ["Five Seven", 0, 0], ["Glock", 0, 0], ["USP", 0, 0], ["General", 0, 0]]


function keybinds() {

    aa_run()

    var fd_kp = UI.GetValue(["Rage", "General", "General", "Key assignment", "Fakeduck"])
    var slow_jitter = UI.GetValue(["Rage", "viskyHook", "viskyHook", "Jitter Slow walk"])

    UI.SetEnabled(["Rage", "viskyHook", "viskyHook", "Jitter Slow walk intensity"], slow_jitter)

    if (fd_kp) {
        if(!UI.GetValue(["Rage", "viskyHook", "viskyHook", "Fakeduck on Valve Servers"])) {
            show_error("You have to enable the Fakeduck feature in the viskyHook Rage Tab!")
            enable_fd = false
        } else {
            enable_fd = true
            FakeDuck()
        }
    }
    
    weapon = weaponType(Entity.GetName(Entity.GetWeapon(Entity.GetLocalPlayer())))

    switch(show_aw) {
        case true : UI.SetValue(["Rage", "Target", weapon, "Disable autowall"], 0); break;
        case false : UI.SetValue(["Rage", "Target", weapon, "Disable autowall"], 1); break;
    }

    for (i = 0; i < wd.length; i++) {
        wd[i][2] = UI.GetValue(["Rage", "viskyHook", "viskyHook", "Override minimum damage"])
        if (UI.GetValue(["Rage", "General", "General", "Key assignment", "Damage override"])) {
            UI.SetValue(["Rage", "Target", wd[i][0], "Minimum damage"], wd[i][2])
        }
        else {
            UI.SetValue(["Rage", "Target", wd[i][0], "Minimum damage"], wd[i][1])
        }
    }

    if (UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Slow walk"]) && slow_jitter) {
        var velocity = Math.floor(Math.random() * (UI.GetValue(["Rage", "viskyHook", "viskyHook", "Jitter Slow walk intensity"]) * 5 )) + 5
        dir = [0, 0, 0];
        if (Input.IsKeyPressed(0x57)) {
            dir[0] += velocity;
        }
        if (Input.IsKeyPressed(0x44)) {
            dir[1] += velocity;
        }
        if (Input.IsKeyPressed(0x41)) {
            dir[1] -= velocity;
        }
        if (Input.IsKeyPressed(0x53)) {
            dir[0] -= velocity;
        }
        UserCMD.SetMovement(dir);  
    }
  

    if (Global.Tickcount() - tickcount > 600) {
        show_error_window = false
        tickcount = Global.Tickcount()
    }

}

function indicators () {
    if (Entity.IsValid(Entity.GetLocalPlayer()) && Entity.IsAlive(Entity.GetLocalPlayer())) {
        weapon = weaponType(Entity.GetName(Entity.GetWeapon(Entity.GetLocalPlayer())))
        
        var get_fov = UI.GetValue(["Rage", "Target", weapon, "Field of view"])
        var get_dmg = UI.GetString(["Rage", "Target", weapon, "Minimum damage"])

        var show_fov_above = UI.GetValue(["Rage", "viskyHook", "viskyHook", "FOV over Crosshair"])
        var dmg_trigger = UI.GetValue(["Rage", "General", "General", "Key assignment", "Damage override"])

        var render_x = 10
        var render_y = (screen_size[1] / 2) + 27
        var font = Render.AddFont("Tahomabd", 18, 800)


        if (dmg_trigger) {
            Render.String(render_x, render_y + 2, 0, "DMG: "+get_dmg, black, font)
            Render.String(render_x, render_y, 0, "DMG: "+get_dmg, red, font)
        } else {
            Render.String(render_x, render_y + 2, 0, "DMG: "+get_dmg, black, font)
            Render.String(render_x, render_y, 0, "DMG: "+get_dmg, white, font)
        }

        if (get_fov != 0) {
            Render.String(render_x, render_y + 20, 0, "FOV:"+get_fov, black, font);
            Render.String(render_x, render_y + 18, 0, "FOV:"+get_fov, green, font);
        } else {
            Render.String(render_x, render_y + 20, 0, "FOV", black, font);
            Render.String(render_x, render_y + 18, 0, "FOV", red, font);
        }

        if(show_fov_above && get_fov != 0) {
            render_x = (screen_size[0] / 2)
            render_y = (screen_size[1] / 2) - 23
            var font = Render.AddFont("Tahomabd", 10, 800)

            Render.String(render_x, render_y - 1, 1, "FOV: "+get_fov, black, font)
            Render.String(render_x, render_y, 1, "FOV: "+get_fov, green, font)
        }

        if (UI.GetValue(["Rage", "General", "General", "Key assignment", "Ragebot activation"])) {
            if(!show_rage){
                show_rage = true
            }
            render_x = (screen_size[0] / 2)
            render_y = (screen_size[1] / 2) + 10
            var font = Render.AddFont("Tahomabd", 12, 800)

            if (Entity.IsValid(Entity.GetLocalPlayer()) && Entity.IsAlive(Entity.GetLocalPlayer())) {
                Render.String(render_x, render_y - 1, 1, "Rage", black, font)
                Render.String(render_x, render_y, 1, "Rage", green, font)
            }
        } else {
            if(show_rage){
                show_rage = false
            }
        }

        if (UI.GetValue(["Rage", "General", "General", "Key assignment", "Fakeduck"]) && enable_fd) { 

            if(!show_fd){
                show_fd = true
            }

            var plus_by = 0

            if(show_rage || show_aw){
                plus_by = 15
            }
            if (show_rage && show_aw) {
                plus_by = 30
            }


            render_x = (screen_size[0] / 2)
            render_y = (screen_size[1] / 2) + 10 + plus_by
            var font = Render.AddFont("Tahomabd", 12, 800)

            if (Entity.IsValid(Entity.GetLocalPlayer()) && Entity.IsAlive(Entity.GetLocalPlayer())) {
                Render.String(render_x, render_y - 1, 1, "Fakeduck", black, font)
                Render.String(render_x, render_y, 1, "Fakeduck", green, font)
            }
        } else {
            if(show_fd){
                show_fd = false
            }
        }

        if (UI.GetValue(["Rage", "General", "General", "Key assignment", "Autowall"])) {
            if(!show_aw){
                show_aw = true
            }

            var plus_by = 0

            if(show_rage){
                plus_by = 15
            }

            render_x = (screen_size[0] / 2)
            render_y = (screen_size[1] / 2) + 10 + plus_by
            var font = Render.AddFont("Tahomabd", 12, 800)

            if (Entity.IsValid(Entity.GetLocalPlayer()) && Entity.IsAlive(Entity.GetLocalPlayer())) {
                Render.String(render_x, render_y - 1, 1, "Autowall", black, font)
                Render.String(render_x, render_y, 1, "Autowall", green, font)
            }
        } else {
            if(show_aw){
                show_aw = false
            }
        }

        if (UI.GetValue(["Rage", "General", "General", "Key assignment", "Force body aim"])) {

            if(!show_baim){
                show_baim = true
            }

            var plus_by = 0

            if(show_rage || show_aw || show_fd){
                plus_by = 15
            }
            if (show_rage && show_aw) {
                plus_by = 30
            }
            if (show_rage && show_fd) {
                plus_by = 30
            }
            if (show_aw && show_fd) {
                plus_by = 30
            }
            if (show_rage && show_aw && show_fd) {
                plus_by = 45
            }

            render_x = (screen_size[0] / 2)
            render_y = (screen_size[1] / 2) + 10 + plus_by
            var font = Render.AddFont("Tahomabd", 12, 800)

            if (Entity.IsValid(Entity.GetLocalPlayer()) && Entity.IsAlive(Entity.GetLocalPlayer())) {
                Render.String(render_x, render_y - 1, 1, "Baim", black, font)
                Render.String(render_x, render_y, 1, "Baim", green, font)
            }
        } else {
            if(show_baim){
                show_baim = false
            }
        }
    }

}

function aa_indicator() {
    if (UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Jitter"]) && UI.GetValue(["Rage", "Anti Aim", "General", "Enabled"])) {
        
        Rx_l = (screen_size[0] / 2) - 32
        Ry_l = (screen_size[1] / 2) - 2
        Rx_r = (screen_size[0] / 2) + 22
        Ry_r = (screen_size[1] / 2) - 2
        color = UI.GetColor(["Rage", "viskyHook", "viskyHook", "Indicator Color"])
        if (Entity.IsValid(Entity.GetLocalPlayer()) && Entity.IsAlive(Entity.GetLocalPlayer())) {
            switch (UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "AA Direction inverter"])) {
                case 1: { Render.FilledRect(Rx_l, Ry_l, 10, 3, color); break; }
                case 0: { Render.FilledRect(Rx_r, Ry_r, 10, 3, color); break; }
            }
        }
    }
}

function FakeDuck() {
    var cmd = UserCMD.GetButtons();
    if (UI.GetValue(["Rage", "General", "General", "Key assignment", "Fakeduck"])) {
        var entityStuff = Entity.GetProp(Entity.GetLocalPlayer(), "CCSPlayer", "m_flDuckAmount");
        if (UserCMD.Choke(), entityStuff <= .28) {
            crouchHeight = !0
        }
        if (entityStuff >= .8 && (crouchHeight = !1, UserCMD.Send()), crouchHeight) {
            UserCMD.SetButtons(4 | cmd)
        } else UserCMD.SetButtons(cmd | 1 << 22)
    } else {
        UserCMD.SetButtons(cmd | 1 << 22)
    }
}

function weaponType() {
    weapon = Entity.GetName(Entity.GetWeapon(Entity.GetLocalPlayer()))

    if (wepname_category[weapon] == undefined)
        return "General";

    return wepname_category[weapon];
}


function contains(v){
    for (i=0; i<wd.length;i++)
    {
        if (wd[i][0] == v)
        {
            return true
        }
 
    } 
}

function cache_values()
{
    for (var i=0; i < wd.length; i++)
    {
        wd[i][1] = UI.GetValue(["Rage", "Target", wd[i][0], "Minimum damage"])
    }
}
cache_values()
 
function handle_menu()
{
    UI.AddHotkey(["Rage", "General", "General", "Key assignment"], "Damage override", "Override minimum damage");
    for (var i=0; i < wd.length; i++)
    {
        UI.AddSliderInt(["Rage", "Target", wd[i][0]], "Minimum damage (on key)", 0, 130);
    }
}
handle_menu()

var flipper = 1;
var flip = false;
function aa_doFlip() {
    if(UI.GetValue(["Rage", "viskyHook", "viskyHook", "Advanced AA"])) {
        flip = !flip
        flipper = flip ? 1.3 : -0.85
    }
}


function aa_run() {
    if(UI.GetValue(["Rage", "viskyHook", "viskyHook", "Advanced AA"])) {
        var v = Entity.GetProp(Entity.GetLocalPlayer(), "DT_CSPlayer", "m_vecVelocity[0]")
        var speed = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
        var crouch = Entity.GetProp(Entity.GetLocalPlayer(), "CCSPlayer", "m_flDuckAmount") > 0.4

        var r = Math.random()
        var mult = flipper

        AntiAim.SetOverride(1);
        if (speed < 1) {
            AntiAim.SetLBYOffset(-60 * mult + r*6*mult)
            AntiAim.SetRealOffset(-14 * mult)
            AntiAim.SetFakeOffset(5 * mult * r)
        } else {

            if (crouch || speed > 130) mult *= 2

            AntiAim.SetLBYOffset(20 * mult)
            AntiAim.SetRealOffset(30 * mult + r*10*mult)
            AntiAim.SetFakeOffset(5 * mult)
        }
    }
}

function show_error (text) {
    if (!show_error_window) {
        show_error_window = true
        Cheat.PrintChat("[viskyHook] Error: "+text)
    }
    
}


function on_unload()
{
    for (var i=0; i < wd.length; i++)
    {
        UI.SetValue(["Rage", "Target", wd[i][0], "Minimum damage"], wd[i][1])
    }
}
Cheat.RegisterCallback("Unload", "on_unload")
Cheat.RegisterCallback("Draw", "aa_indicator")
Cheat.RegisterCallback("Draw", "indicators")
Cheat.RegisterCallback("CreateMove", "keybinds")
Cheat.RegisterCallback("bullet_impact", "aa_doFlip")
