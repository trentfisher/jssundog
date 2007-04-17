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
// XML configuration objects, indexed by relative urls
conf = {};
// cache of pre-loaded images,indexed by relative urls
imagecache = {};

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
    pop.appendChild(Win.menuEntry("Resume Game",
                                  function() { zoom.pop(); loadGame("Zed");
                                      return false; }));
    pop.appendChild(Win.menuEntry("Select Character",
                                  function() { alert("soon..."); }));
    pop.appendChild(Win.menuEntry("About",
                                  function() { alert("soon..."); }));
    return pop;
}


function loadGame(name)
{
    logger.log(2, "loading game for "+name);

    var fcnt = 0;
    var expcnt = 1;
    function process_xml(r, url)
    {
        progbar.update(++fcnt, expcnt);
        logger.log(1,"loaded xml file "+url+" length "+r.responseText.length);
        conf[url] = r.responseXML;

        // request any images referenced by this XML file
        var img = r.responseXML.getElementsByTagName("img");
        for (var i = 0; i < img.length; i++)
        {
            expcnt++;
            requestImage(img[i].getAttribute("src"), process_img);
            //requestImage(img[i].getAttribute("mask"), filecnt);
        }
        // Start the game if we have loaded all files
        if (fcnt >= expcnt) startGame();
    }
    function process_img(r, url)
    {
        progbar.update(++fcnt, expcnt);
        logger.log(1, "loaded image "+url+" ("+r.width+"x"+r.height+")");
        imagecache[url] = r;
        // Start the game if we have loaded all files
        if (fcnt >= expcnt) startGame();
    }

    requestFile("dat/skin/default.xml", process_xml);

    return;
}

function startGame()
{
    // get rid of the splash graphic
    document.getElementById("splashimg").style.display = "none";

    // Set up the various windows...
    zoom.register(Win.shipWindow(conf["dat/skin/default.xml"]), "ship");

    zoom.register(Win.shipBay(conf["dat/skin/default.xml"]), "Warp Drives");

    zoom.popup("ship");
}
