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
 * Generate HTML for various popup windows
 */
Win = {};

/**
* Generate window displaying the ship
*/
Win.shipWindow = function(skinconf)
{
    var t = document.createElement("div");
    logger.log(2, "setting up ship window");
    var img = imagecache[XML.getNode(skinconf, "/skin/ship/img[@id='pod']/@src").nodeValue];
    img.useMap = "#pod";

    // fix the width of the window
    t.style.width = img.width;
    t.appendChild(img);

    // construct the image map
    var map = document.createElement("map");
    map.name="pod";
    t.appendChild(map);
    var areanodes = XML.getNodes(skinconf, "/skin/ship/map[@name='pod']/area");
    for (var i = 0; i < areanodes.length; i++)
    {
        var a = document.createElement("area");
        a.shape = areanodes[i].getAttribute("shape");
        a.coords = areanodes[i].getAttribute("coords");
        a.title = areanodes[i].getAttribute("title");
        a.href = "#";
        a.onclick = function() { zoom.popup("Warp Drives"); return false;  };
        map.appendChild(a);
    }
    return t;
}

/**
 * Generate window for a given ship's bay
 */
Win.shipBay = function(skinconf, name)
{
    var t = document.createElement("div");
    logger.log(2, "setting up ship window");
    var img = imagecache[XML.getNode(skinconf, "/skin/ship/bays/bay[@name='Warp Drives']/img/@src").nodeValue];
    img.useMap = "#warp";

    // fix the width of the window
    t.style.width = img.width;
    t.appendChild(img);

    // construct the image map
    var map = document.createElement("map");
    map.name="warp";
    t.appendChild(map);
    var areanodes = XML.getNodes(skinconf, "/skin/ship/bays/bay[@name='Warp Drives']/map/area");
    for (var i = 0; i < areanodes.length; i++)
    {
        var a = document.createElement("area");
        a.shape = areanodes[i].getAttribute("shape");
        a.coords = areanodes[i].getAttribute("coords");
        a.title = areanodes[i].getAttribute("title");
        a.href = "#";
        a.onclick = function() { alert("click on " + a.title); return false; };
        map.appendChild(a);
    }

    return t;
}

/**
 * Generate a menu entry anchor
 */
Win.menuEntry = function(text, action)
{
    var a = document.createElement("a");
    a.href="#";
    a.onclick = action;
    a.className = "menuentry";
    a.innerHTML = text;
    return a;
}
