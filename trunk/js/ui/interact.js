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
 * interaction engine
 */
function Interaction(id, conf, name)
{
    var div = (id instanceof Element ? id : document.getElementById(id));
    var iprefix = '/interactions/interact[@id="'+name+'"]';
    logger.log(2, "Initiating interaction "+name+" conf "+conf);
    doState("start");

    function doState(s)
    {
        logger.log(3, "interaction "+id+" changing to state "+s);
        div.innerHTML = "";
        if (s == "done") return;

        var txt = XML.getNode(conf,
                              iprefix+'/state[@id="'+s+'"]/text');
        if (txt) div.appendChild(xml2html(txt));

        // do actions and such...
        var acts = XML.getNodes(conf, iprefix+'/state[@id="'+s+'"]/action');
        for (var i = 0; i < acts.length; i++)
        {
            if (acts[i].getAttribute("id") == "player")
            { div.appendChild(player.toDOM()); }
        }

        var links = XML.getNodes(conf, iprefix+'/state[@id="'+s+'"]/option');
        for (var i = 0; i < links.length; i++)
        {
            var a = document.createElement("a");
            a.href="#";
            a.className = "menuentry";
            a.innerHTML = links[i].getAttribute("name");
            a.next = links[i].getAttribute("next");
            a.onclick = function() {
                doState(this.next);
                return false; };
            div.appendChild(a);
        }

        // timeouts
        var timeout=XML.getNode(conf, iprefix+'/state[@id="'+s+'"]/timeout');
        if (timeout)
        {
            var next = timeout.getAttribute("next");
            setTimeout(function() { doState(next); },
                       timeout.getAttribute("time"));
        }
    };

    // convert xhtml-like xml dom to xhtml
    function xml2html(x)
    {
        var dom = document.createElement("span");
        dom.innerHTML = XML.serialize(x);
        // doctor up any images
        var im = dom.getElementsByTagName("img");
        for (var i = 0; i < im.length; i++)
        {
            if (im[i].id && !im[i].src)
            {
                var newim = images.get(im[i].id);
                im[i].id = "";
                im[i].src = newim.src;
            }
        }
        return dom;
    }
}

/**
 * Generate an interaction window, which may contain
 * items and one or more "interactions"
 * @param skin subtree of xml specifying image and areas
 * @param 
 */
function InteractionWindow(name, skinprefix, shipprefix, interactname,
                           skinconf, shipconf, playerconf, interactconf)
{
    logger.log(2, "Creating interaction window "+name);
    var w = createWindow(name, skinprefix, skinconf);
    w.id = name;
    w.slot = new Array();
    var areanodes = XML.getNodes(skinconf, skinprefix+"/map/area");
    for (var i = 0; i < areanodes.length; i++)
    {
        var id = areanodes[i].getAttribute("id");
        logger.log(3, "Setting up area "+id);

        if (id == "interact")
        {
            w.appendChild(createInteractArea(areanodes[i]));
            w.interact = w.lastChild;
            continue;
        }
        var s = createSlot(id, areanodes[i]);
        if (!s) continue;
        w.slot[id] = s;

        // If there is a component in this slot, place the image on the screen
        if (w.slot[id].contents.firstChild.data)
            w.appendChild(createIcon(id, w.slot,
                                     w.firstChild.width,
                                     w.firstChild.height));
    }
    w.start = function()
    {
        // start up the interaction
        if (interactname && this.interact)
            Interaction(this.interact, interactconf, interactname);
        this.update();
    }
    // update the inventory slots
    w.update = function()
    {
        var win = this;
        logger.log(2, "Updating inventory for "+win.id);
        for (var id in win.slot)
        {
            if (!win.slot[id]) continue; // blank slot... shouldn't happen
            // if this item has changed, remove the old icon and set up
            // a new one
            if (win.slot[id].contents.firstChild.data !=
                win.slot[id].oldcontents)
            {
                logger.log(5, "slot "+win.slot[id].id+
                           " updated from "+win.slot[id].oldcontents+" to "+
                           win.slot[id].contents.firstChild.data);
                // destroy the old image, if we are replacing or removing it
                if (win.slot[id].img)
                {
                    try {
                    win.removeChild(win.slot[id].img);
                    }
                    catch (e)
                    {
                        alert("you found a bug, send the log to trent "+e);
                    }
                    win.slot[id].img.onmousedown = 
                        win.slot[id].img.onmousemove =
                        win.slot[id].img.onmouseup =
                        function() {alert("click on nonexistent image "+id); };
                }
                win.slot[id].oldcontents =
                    win.slot[id].contents.firstChild.data;
                if (!win.slot[id].contents.firstChild.data) continue;
                // for some reason the dimensions of both the bay AND the image
                // have no dimensions until it is displayed, so we will display
                // it earlier
                win.style.display = "block";
                win.slot[id].img = createIcon(id, win.slot,
                                              win.firstChild.width,
                                              win.firstChild.height);
                win.style.display = "none";
                win.appendChild(win.slot[id].img);
            }
        }
    }
    return w;

    function createWindow(name, skinprefix, skinconf)
    {
        var t = document.createElement("div");
        t.id = name;
        var img = images.get(XML.getNode(skinconf,
                                         skinprefix+"/img/@src").nodeValue);
        // fix the width of the window
        logger.log(3, "interact image url "+
                   img.src+" "+img.width+"x"+img.height);
        t.style.position = "absolute";
        t.style.width = img.width + "px";
        t.style.height = img.height + "px";
        t.appendChild(img);
        return t;
    }
    function createSlot(id, areanode)
    {
        var slotnode;
        if (id.indexOf("n")  == 0)
        {
            slotnode = XML.getNode(shipconf, shipprefix+"/slot[@id='"+id+"']");
        }
        else if (id.indexOf("i") == 0)
        {
            slotnode = XML.getNode(playerconf, "/player/inventory/slot[@id='"+
                                   id+"']");
        }
        else if (id == "trash")
        {
            slotnode = skinconf.createElement("slot");
        }
        else
        {
            return null;
        }

        // set up the components
        var c = areanode.getAttribute("coords").split(",");
        var slot = {id: id,
                    left: c[0], top: c[1], right: c[2], bottom: c[3],
                    contents: slotnode,
                    oldcontents: ""};
        // empty text node (this is normal if there is nothing in the slot)
        if (!slotnode.firstChild)
        {
            slotnode.appendChild(slotnode.ownerDocument.createTextNode(""));
            slotnode.firstChild.data="";
        }
        return slot;
    }
    function createInteractArea(areanode)
    {
        var idiv = document.createElement("div");
        idiv.className = "interact";
        var c = areanodes[i].getAttribute("coords").split(",");
        idiv.style.left = c[0] + "px";
        idiv.style.top = c[1] + "px";
        idiv.style.width = (c[2]-c[0]) + "px";
        idiv.style.height = (c[3]-c[1]) + "px";
        return idiv;
    }
    function createIcon(id, slot, width, height)
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
                this.parentNode.removeChild(slot[src].img);
                slot[src].img = null;
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
            //if (slot[dest].contents &&
            //    slot[dest].contents.firstChild &&
            if (slot[dest].contents.firstChild.data)
            {
                // XXX swap someday, for now throw it back to src
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
        }
        return im;
    }
}
