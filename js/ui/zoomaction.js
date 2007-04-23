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

    // set up the veil to obscure the underlying windows
    var veil = document.createElement("div");
    veil.id = "veil";
    veil.style.display = "none";
    veil.style.position = "absolute";
    veil.onclick = function(e)
    {
        if (!e) var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();

        // if we click on the veil it means we should
        // pop off the top window, unless it's the lowest one
        if (winstack.length > 1)
        {
            var name = winstack.pop();
            logger.log(3, "Click on veil, popping off "+name);
            wins[name].style.display = "none";
            // move the veil down
            veil.style.zIndex = winstack.length*2-1;
        }
    }
    divobj.appendChild(veil);

    this.register = function(obj, name)
    {
        obj.style.display = "none";
        obj.className = "popup";
        divobj.appendChild(obj);
        wins[name] = obj;
        logger.log(2, "Registering object "+name);
    };
    this.popup = function(name, noveil)
    {
        // Pick out the hash if we got a url
        if (name.lastIndexOf("#") > 0) name = name.substr(name.lastIndexOf("#")+1);

        logger.log(3, "Popping up "+name);
        if (! wins[name])
            throw("cannot popup window "+name+" not registered");

        // calculate location...
        // need to make it display before dimensions are set
        wins[name].style.display = "block";
        var t = Math.round(Math.random() *
                           (divobj.offsetHeight - wins[name].offsetHeight -6));
        if (t < 0) t = 3;
        var l =  Math.round(Math.random() *
                            (divobj.offsetWidth - wins[name].offsetWidth - 6));
        if (l < 0) l = 3;
        wins[name].style.top = t +"px";
        wins[name].style.left = l + "px";
        wins[name].style.zIndex = (1+winstack.length)*2;
        logger.log(4, "locating popup "+name+" ("+
                   wins[name].offsetWidth+", "+ wins[name].offsetHeight+
                   ") at "+ l + ", "+t);
        winstack.push(name);

        // place the "veil" underneath so that underlying event handlers
        // don't fire, and other windows are slightly obscured
        veil.style.zIndex = winstack.length*2-1;
        if (!noveil) veil.style.display = "block";
    };
    this.pop = function()
    {
        var name = winstack.pop();
        logger.log(3, "Popping off "+name);
        wins[name].style.display = "none";
        veil.style.zIndex = winstack.length*2-1;
    };
    return this;
}
