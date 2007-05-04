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

        // determine how deep we are in the stack... this seems to be expensive!
        //var stackdepth = 0;
        //var frame = arguments.callee.caller;
        //while(frame != null) { stackdepth++; frame = frame.caller; }
        var indent = " ";
        //for (var i = 0; i < stackdepth; i++) indent += " ";

        divobj.innerHTML += ("<div class='log"+lev+"'>" +
                             (timespan.toFixed(2)) + " ("+lev+"): "+indent+
                             msg + "</div>");
        // scroll window to bottom (seems to slow things down)
        //divobj.scrollTop = divobj.scrollHeight;
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
    /**
     * returns the name of the given function object (if known)
     * this isn't of much use since most functions are anonymous
     */
    this.getFuncName = function(f)
    {
        if (!f) return "null";
        if (! f instanceof Function) return "NotAFunction";
        if (!f.name) return "anonymous";
        return f.name;
    }
    /**
       Return a stack trace
    */
    this.stacktrace = function()
    {
        var s = new Array();
        var f = arguments.callee.caller;
        while(f != null)
        {
            // IE does not define the name attribute
            s += (f.name || f); s+= " -> ";
            f = f.caller;
        }
        return s;
    }
    return this;
}

