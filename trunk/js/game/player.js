/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-

$Id: win.js 50 2007-04-27 22:49:20Z trent.a.fisher $

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
 * Object representing the player
 * @param conf XML DOM of configuration file
 */
function Player(conf)
{
    this.conf = conf;
}

Player.prototype.update = function()
{
};

Player.prototype.toDOM = function()
{
    var w = document.createElement("div");
    w.innerHTML = "Name: "+name+"<br/>";
    var attrs = XML.getNodes(this.conf, "/player/attribute");
    for (var i = 0; i < attrs.length; i++)
    {
        w.innerHTML += attrs[i].getAttribute("id")+": "+
            attrs[i].firstChild.data+"<br/>";
    }
    var status = XML.getNodes(this.conf, "/player/status");
    for (var i = 0; i < status.length; i++)
    {
        w.innerHTML += status[i].getAttribute("id")+": "+
            status[i].firstChild.data+"<br/>";
    }
    var inv = XML.getNodes(this.conf, "/player/inventory/slot");
        w.innerHTML += "Inventory: ";
    for (var i = 0; i < inv.length; i++)
    {
        if (inv[i].firstChild)
            w.innerHTML += inv[i].firstChild.data+" ";
    }
    return w;
}
