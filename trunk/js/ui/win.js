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
    logger.log(2, "setting up ship window "+skinconf);
    var img = images.get(XML.getNode(skinconf, "/skin/ship/img[@id='pod']/@src").nodeValue);
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
    t.id = name;
    var imgurl = XML.getNode(skinconf, "/skin/ship/bays/bay[@id='"+name+"']/img/@src").nodeValue;
    var img = images.get(imgurl);
    img.useMap = "#"+name;

    // fix the width of the window
    logger.log(3, "bay image url "+imgurl+" "+img.width+"x"+img.height);
    t.style.position = "relative";
    t.style.width = img.width + "px";
    t.style.height = img.height + "px";
    //t.style.backgroundImage = "url("+img.src+")";
    t.appendChild(img);

    // this data structure will contain info about each slot
    // in this bay, with bindings to the appropriate xml conf nodes
    var slot = t.slot = new Array();

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

        // If there is a component in this slot, place the image on the screen
        if (slot[id].contents.firstChild.data)
            t.appendChild(Win.createIcon(id, slot, img.width, img.height));
    }
    return t;
}

// update the inventory slots in the given bay
Win.updateBayInv = function(bayobj)
{
    logger.log(4, "Updating inventory for "+bayobj.id);
    for (var id in bayobj.slot)
    {
        if (!bayobj.slot[id]) continue; // blank slot... shouldn't happen
        // if this item has changed, remove the old icon and set up a new one
        if (bayobj.slot[id].contents.firstChild.data !=
            bayobj.slot[id].oldcontents)
        {
            logger.log(5, "slot "+bayobj.slot[id].id+
                       " updated from "+bayobj.slot[id].oldcontents+" to "+
                       bayobj.slot[id].contents.firstChild.data);
            // destroy the old image, if we are replacing or removing it
            if (bayobj.slot[id].img)
            {
                bayobj.removeChild(bayobj.slot[id].img);
                bayobj.slot[id].img.onmousedown = 
                    bayobj.slot[id].img.onmousemove =
                    bayobj.slot[id].img.onmouseup =
                    function() {alert("click on nonexistent image "+id); };
            }
            bayobj.slot[id].oldcontents =
                bayobj.slot[id].contents.firstChild.data;
            if (!bayobj.slot[id].contents.firstChild.data) continue;
            // for some reason the dimensions of both the bay AND the image
            // have no dimensions until it is displayed, so we will display
            // it earlier
            bayobj.style.display = "block";
            bayobj.slot[id].img = Win.createIcon(id, bayobj.slot,
                         bayobj.firstChild.width, bayobj.firstChild.height);
            bayobj.appendChild(bayobj.slot[id].img);
        }
    }
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
                contents: snode,
                oldcontents: ""};
    
    // empty text node (this is normal if there is nothing in the slot)
    if (!snode.firstChild)
    {
        snode.appendChild(snode.ownerDocument.createTextNode(""));
        snode.firstChild.data="";
    }
    return slot;
};

Win.createIcon = function(id, slot, width, height)
{
    logger.log(5, "Setting up icon "+id+", containing "+
               slot[id].contents.firstChild.data+
               " in bay "+width+"x"+height);
    slot[id].oldcontents = slot[id].contents.firstChild.data;
    var im = images.get(slot[id].contents.firstChild.data);
    im.style.position = "absolute";
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
