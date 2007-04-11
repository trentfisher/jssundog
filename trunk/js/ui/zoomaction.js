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
    divobj.onclick = function()
    {
        logger.log(3, "click!");
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
        // XXX calculate location
        pop.style.bottom = 150;
        pop.style.left = 450;
        wins[name].style.display = "block";
        winstack.push(name);
    };
    this.popoff = function()
    {
        var name = winstack.pop();
        logger.log(3, "Popping off "+name);
        wins[name].style.display = "none";
    };
    return this;
}
