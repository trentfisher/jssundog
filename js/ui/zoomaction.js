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
  Manage ZoomAction windows.
*/
function ZoomAction(div)
{
    var divobj = document.getElementById(div);
    if (!divobj) throw "ZoomAction: nonexistent element "+div;
    var winstack = [];
    var wins = {};
    divobj.onclick = function(e)
    {
        if (!e) var e = window.event;
        // XXX works in firefox
        var posx = e.layerX;
        var posy = e.layerY;
        logger.log(3, "click! at "+posx+", "+posy);
    };
    this.register = function(obj, name)
    {
        obj.style.display = "none";
        obj.className = "popup";
        divobj.appendChild(obj);
        wins[name] = obj;
        logger.log(2, "Registering object "+name);
    };
    this.popup = function(name)
    {
        logger.log(3, "Popping up "+name);
        if (! wins[name])
            throw("cannot popup window "+name+" not registered");
        // calculate location...
        // need to make it display before dimensions are set
        wins[name].style.display = "inline";
        var t = Math.round(Math.random() *
                           (divobj.offsetHeight - wins[name].offsetHeight -6));
        if (t < 0) t = 3;
        var l =  Math.round(Math.random() *
                            (divobj.offsetWidth - wins[name].offsetWidth - 6));
        if (l < 0) l = 3;
        wins[name].style.top = t;
        wins[name].style.left = l;
        logger.log(4, "locating popup "+name+" ("+
                   wins[name].offsetWidth+", "+ wins[name].offsetHeight+
                   ") at "+ l + ", "+t);
        winstack.push(name);
    };
    this.pop = function()
    {
        var name = winstack.pop();
        logger.log(3, "Popping off "+name);
        wins[name].style.display = "none";
    };
    return this;
}
