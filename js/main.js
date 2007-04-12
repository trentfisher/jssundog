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

try
{
var prog = new ProgressBar("status", "Loading configuration files");
prog.update(5, 10, "wow");

var fcnt = 0;
function filecnt(r)
{
    prog.update(++fcnt, 10);
    logger.log(1, "read file "+r.reqURL+" "+r.responseText.length+" chars");
}
requestFile("dat/old/7px_bin.xml", filecnt);
requestFile("dat/old/planet.xml", filecnt);
requestFile("dat/old/system.xml", filecnt);
requestFile("dat/old/Drahew2.xml", filecnt);
requestFile("dat/old/sector.xml", filecnt);
requestFile("dat/old/Terofall.xml", filecnt);
requestFile("dat/old/Drahew.xml", filecnt);
requestFile("dat/old/startable.xml", filecnt);
requestFile("dat/old/engineParts.xml", filecnt);
requestFile("dat/old/stockplanet.xml", filecnt);

var zoom = new ZoomAction("game");
zoom.register(initialPopup(), "test");
zoom.popup("test");

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
    a.onclick = function() { alert("soon..."); };
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
