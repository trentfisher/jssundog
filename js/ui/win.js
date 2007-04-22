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
    t.style.width = img.width + "px";
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
        var b;
        if (b = areanodes[i].getAttribute("bay"))
        {
            a.href = "#"+b;
            a.onclick = function() { zoom.popup(this.href); return false; };
        }
        map.appendChild(a);
    }
    return t;
}

/**
 * Generate window for a given ship's bay
 */
Win.shipBay = function(skinconf, shipconf, name)
{
    var selected;
    var t = document.createElement("div");
    logger.log(2, "setting up ship bay "+name);
    var img = imagecache[XML.getNode(skinconf, "/skin/ship/bays/bay[@id='"+name+"']/img/@src").nodeValue];
    img.useMap = "#"+name;
    t.style.positon = "relative";

    // fix the width of the window
    t.style.width = img.width + "px";
    t.style.height = img.height + "px";
    t.style.backgroundImage = "url("+img.src+")";

    // construct the image map
    var slot = new Array();
    var map = document.createElement("map");
    map.name=name;
    t.appendChild(map);
    var areanodes = XML.getNodes(skinconf, "/skin/ship/bays/bay[@id='"+name+"']/map/area");
    for (var i = 0; i < areanodes.length; i++)
    {
        // set up the client side image map "area" tag
        var a = document.createElement("area");
        a.id = areanodes[i].getAttribute("id");
        a.shape = areanodes[i].getAttribute("shape");
        a.coords = areanodes[i].getAttribute("coords");
        a.title = areanodes[i].getAttribute("title");
        a.href = "#";
        a.onclick = function() { alert("click on "+a.title); return false;  };
        map.appendChild(a);

        // set up the components
        var c = a.coords.split(",");
        slot[a.id] =
            {id: a.id,
             left: c[0], top: c[1], right: c[2], bottom: c[3],
             contents: XML.getNode(shipconf, "/ship/bays/bay[@id='"+
                                   name+"']/slot[@id='"+a.id+"']")
            };

        // if this happens the xml config wasn't complete
        if (!slot[a.id].contents) continue;

        // empty text node
        if (!slot[a.id].contents.firstChild)
        {
            slot[a.id].contents.appendChild(
                slot[a.id].contents.ownerDocument.createTextNode(""));
        }

        // If there is a component in this slot, place the image on the screen
        if (slot[a.id].contents.firstChild.data)
        {
            var im = new Image();
            im.src = imagecache[slot[a.id].contents.firstChild.data].src;
            im.style.position = "absolute";
            im.style.display = "block";
            im.style.left = slot[a.id].left+"px";
            im.style.top = slot[a.id].top+"px";
            slot[a.id].img = im;
            t.appendChild(im);

            Drag.init(im, null, 0, img.width-im.width,
                      0, img.height-im.height);
            im.onDragStart = function(x, y)
            {
                // figure out which item was clicked on
                var s;
                for (var i in slot)
                {
                    if (this == slot[i].img) { s=i; break; }
                }

                logger.log(4, "you grabbed item from "+s);
                // remove the item from the slot
            };
            im.onDragEnd = function(x, y)
            {
                logger.log(4, "you dropped "+this+" at "+x+","+y);

                // figure out where this object came from and where it is going
                var dest;
                var src;
                for (var i in slot)
                {
                    if (this == slot[i].img) { src = i; }
                    if (Math.abs(x - slot[i].left) < this.width &&
                        Math.abs(y - slot[i].top)  < this.height)
                    { dest = i; }
                }
                logger.log(3, "Moving item from "+src+" to "+dest);

                // if we didn't drop it on a slot, put it back
                if (!dest)
                {
                    logger.log(4, "Dest not a slot, returning");
                    this.style.top = slot[src].top + "px";
                    this.style.left = slot[src].left + "px";
                    return false;
                }
                // destroy the object if it is a trash can
                if (dest == "trash")
                {
                    logger.log(4, "Trashing item "+
                               slot[src].contents.firstChild.data);
                    slot[src].contents.firstChild.data = "";
                    t.removeChild(slot[src].img);
                    slot[a.id].img = null;
                    return true;
                }
                // can the object be placed here? if not, put it back
                logger.log(4, "does "+
                           slot[src].contents.firstChild.data+" fit in "+
                           slot[dest].contents.getAttribute("holds")+ "? ");
                if (slot[dest].contents.getAttribute("holds").indexOf(
                        slot[src].contents.firstChild.data) < 0)
                {
                    this.style.top = slot[src].top + "px";
                    this.style.left = slot[src].left + "px";
                    return false;
                }
                // if an item is there, swap places
                if (slot[dest].contents &&
                    slot[dest].contents.firstChild &&
                    slot[dest].contents.firstChild.data)
                {
                    // XXX someday, for now throw it back to src
                    this.style.top = slot[src].top + "px";
                    this.style.left = slot[src].left + "px";
                    return false;
                }

                // move the image to the nearest slot (determined above)
                this.style.top = slot[dest].top + "px";
                this.style.left = slot[dest].left + "px";
                slot[dest].img = slot[src].img;
                slot[src].img = null;

                // move the item in the actual inventory
                slot[dest].contents.firstChild.data =
                    slot[src].contents.firstChild.data;
                slot[src].contents.firstChild.data = "";
                
                // update bay status indicators
                //logger.log(6, (new XMLSerializer()).serializeToString(slot[src].contents.parentNode));
            };
        }
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
