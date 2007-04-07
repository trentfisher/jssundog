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
*  Manage debug logging messages
*/
function Logger(div, curlev)
{
    var divobj = document.getElementById(div);
    var starttime = new Date();

    /**
       Log a debugging message
       @param lev the debugging level
       @param msg the message to display
    */
    this.log = function(lev, msg)
    {
        if (!divobj) return;
        if (lev > curlev) return;
        var now = new Date();
        var timespan = (now.valueOf() - starttime.valueOf())/1000;
        divobj.innerHTML += ("<div class='log"+lev+"'>" +
                             (timespan.toFixed(2)) + "("+lev+"): " +
                             msg + "</div>");
        // scroll window to bottom
        divobj.scrollTop = divobj.offsetHeight;
    }
    /**
       Change the level which this logger will display messages.
       Messages with a debug level greater than this number will
       not be displayed.
       @param lev
    */
    this.level = function(lev)
    {
        curlev = lev;
    }
    return this;
}
