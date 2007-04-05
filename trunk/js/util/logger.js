/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-

/**
*  Manage debug logging messages
*/
function Logger(div, curlev)
{
    var divobj = document.getElementById(div);
    var starttime = new Date();
    this.log = function(lev, msg)
    {
        if (!divobj) return;
        if (lev > curlev) return;
        var now = new Date();
        var timespan = (now.valueOf() - starttime.valueOf())/1000;
        divobj.innerHTML += ("<div class='log"+lev+"'>" +
                             (timespan.toFixed(2)) + "("+lev+"): " +
                             msg + "</div>");
    }
    this.level = function(lev)
    {
        curlev = lev;
    }
    return this;
}
