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
Win.shipBay = function(skinconf, shipconf, playerconf, name)
{
    logger.log(2, "setting up ship bay "+name);

    var t = document.createElement("div");
    var imgurl = XML.getNode(skinconf, "/skin/ship/bays/bay[@id='"+name+"']/img/@src").nodeValue;
    var img = imagecache[imgurl];
    img.useMap = "#"+name;

    // fix the width of the window
    logger.log(3, "bay image url "+imgurl+" "+img.width+"x"+img.height);
    t.style.position = "relative";
    t.style.width = img.width + "px";
    t.style.height = img.height + "px";
    //t.style.backgroundImage = "url("+img.src+")";
    t.appendChild(img);

    // construct the image map
    var slot = new Array();
    var map = document.createElement("map");
    map.name=name;
    t.appendChild(map);

    var areanodes = XML.getNodes(skinconf, "/skin/ship/bays/bay[@id='"+name+"']/map/area");
    for (var i = 0; i < areanodes.length; i++)
    {
        var id = areanodes[i].getAttribute("id");
        var snode;

        // should not happen!
        if (!id)
        {
            logger.log(1, "Error got a blank id in area "+i+" of bay "+name);
            continue;
        }
        if (id.indexOf("status") == 0)
        {
            // XXX later...
            continue;
        }
        else if (id.indexOf("n")  == 0)
        {
            snode = XML.getNode(shipconf, "/ship/bays/bay[@id='"+
                                name+"']/slot[@id='"+id+"']");

        }
        else if (id.indexOf("i") == 0)
        {
            snode = XML.getNode(playerconf, "/player/inventory/item[@id='"+
                                id+"']");
        }
        else if (id == "trash")
        {
            snode = null;
        }
        else
        {
            logger.log(1, "unknown bay slot "+id+" in bay "+name);
            snode = null;
        }
        slot[id] = Win.createSlot(name, id, areanodes[i], snode);

        map.appendChild(Win.createArea(areanodes[i]));

        // If there is a component in this slot, place the image on the screen
        if (slot[id].contents.firstChild.data)
            t.appendChild(Win.createIcon(id, slot, img.width, img.height));
    }
    return t;
}

Win.createSlot = function(bay, id, anode, snode)
{
    // if this happens the xml config wasn't complete
    // shouldn't happen if the xml is complete
    if (!snode)
    {
        logger.log(1, "Missing contents in xml node "+id+" for bay "+bay);
        snode = conf['dat/player/ship.xml'].createElement("slot");
    }
    
    // set up the components
    var c = anode.getAttribute("coords").split(",");
    var slot = {id: id,
                left: c[0], top: c[1], right: c[2], bottom: c[3],
                contents: snode};
    
    // empty text node (this is normal if there is nothing in the slot)
    if (!snode.firstChild)
    {
        snode.appendChild(snode.ownerDocument.createTextNode(""));
    }
    return slot;
};

Win.createArea = function(anode)
{
    // set up the client side image map "area" tag
    var a = document.createElement("area");
    a.id = anode.getAttribute("id");
    a.shape = anode.getAttribute("shape");
    a.coords = anode.getAttribute("coords");
    a.title = anode.getAttribute("title");
    //a.href = "#";
    return a;
};

Win.createIcon = function(id, slot, width, height)
{
    var im = new Image();
    im.src = imagecache[slot[id].contents.firstChild.data].src;
    im.style.position = "absolute";
    im.style.display = "block";
    im.style.left = slot[id].left+"px";
    im.style.top = slot[id].top+"px";
    slot[id].img = im;
    
    // set up the drag and drop module, limiting the icon to
    // the size of the parent window
    Drag.init(im, null, 0, width-im.width, 0, height-im.height);
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
        if (slot[dest].contents.getAttribute("holds") &&
            slot[dest].contents.getAttribute("holds").indexOf(
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
    return im;
};


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
