/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-

$Id$

Copyright (C) 2007 Trent A. Fisher <trent@cs.pdx.edu>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the
    Free Software Foundation, Inc.
    59 Temple Place, Suite 330
    Boston, MA 02111-1307 USA

*/

/**
   Main routine for Sundog
*/
// set up debugging output... I don't like having this as a global
logger = new Logger("log", 9);
logger.log(1, "starting up...");
progbar = new ProgressBar("status", "Loading configuration files");

try
{
    var zoom = new ZoomAction("game");
    zoom.register(initialPopup(), "startmenu");
    zoom.popup("startmenu");
}
catch (e)
{
    // IE doesn't define most of these!
    alert(e.name+" at "+e.fileName+" line "+e.lineNumber+": "+e.message);
}

function initialPopup()
{
    var pop = document.createElement("div");
    pop.id = "initialmenu";
    pop.innerHTML = ("Welcome back, Zed.  What now?");
    var a = document.createElement("a");
    a.href="#";
    a.onclick = function() { zoom.pop(); loadGame("Zed"); };
    a.className = "menuentry";
    a.innerHTML = "Resume Game";
    pop.appendChild(a);

    a = document.createElement("a");
    a.href="#";
    a.onclick = function() { alert("soon..."); };
    a.className = "menuentry";
    a.innerHTML = "Select Character";
    pop.appendChild(a);

    a = document.createElement("a");
    a.href="#";
    a.onclick = function() { alert("soon..."); };
    a.className = "menuentry";
    a.innerHTML = "About";
    pop.appendChild(a);
    return pop;
}


function loadGame(name)
{
    logger.log(2, "loading game for "+name);

    var fcnt = 0;
    var expcnt = 1;
    function filecnt(r, url)
    {
        progbar.update(++fcnt, expcnt);
        logger.log(1,"read file "+url);
        if (url == "dat/skin/default.xml")
        {
            skincfg = r;
            var img = r.responseXML.getElementsByTagName("img");
            for (var i = 0; i < img.length; i++)
            {
                expcnt++;
                requestImage(img[i].getAttribute("src"), filecnt);
            }
        }
        if (fcnt >= expcnt)
        {
            startGame();
        }
    }

    requestFile("dat/skin/default.xml", filecnt);

    return;

}

function startGame()
{
    // get rid of the splash graphic
    document.getElementById("splashimg").style.display = "none";

    // Set up the various windows...
    var t = document.createElement("div");
    t.innerHTML = '<img src="img/sundog/interior.png" />';
    zoom.register(t, "ship");
    zoom.popup("ship");
    t.style.width = t.firstChild.offsetWidth;
}
