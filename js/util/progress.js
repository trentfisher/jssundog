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
This is a simple module for displaying a progress bar in a div.
This is for long-running CGI processes or other such things.
Call like so:

<div id="progress" style="border: 1px solid black;">loading...</div>
<script type="text/javascript">
    var prog = new ProgressBar("progress", "I am doing X");
</script>

Then on each update, send this to the client (where the numbers are the
Items to do and the total estimated), the text is optional.

<script type="text/javascript">prog.update(1, 100, "I am doing Y");</script>

 */
function ProgressBar(id, action)
{
    this.div = document.getElementById(id);
    this.starttime = new Date();
    if (action == undefined) { action = "Loading"; }

    // set up the divs
    this.div.style.overflow = "hidden";
    this.div.style.position = "relative";
    if (!this.div.style.height)
        this.div.style.height = this.div.clientHeight + "px";
    this.div.innerHTML = '<div class="progressbar"></div><div class="progresstxt"></div>';
    this.bardiv = this.div.childNodes[0];
    this.bardiv.style.position   = "relative";
    this.bardiv.style.width      = "0%";
    this.bardiv.style.height     = this.div.clientHeight + "px";
    this.bardiv.style.zIndex     = "-1";
    this.txtdiv = this.div.childNodes[1];
    this.txtdiv.style.position  = "relative"; 
    this.txtdiv.style.height    = this.div.clientHeight + "px";
    this.txtdiv.style.top       = (this.div.clientHeight * -1) + "px";

    // update the status bar
    this.update = function(cur, tot, newact)
    {
        if (newact != undefined) { action = newact; }
        var now = new Date();
        var timespan = (now.valueOf() - this.starttime.valueOf())/1000;
        var msg;
        if (tot > 0)
        {
            var percent = cur/tot;
            var tottime = tot*(timespan/cur);
            this.txtdiv.innerHTML =
                printf("%s... %d of %d (%.1f%s) %s ETA %s",
                       action, cur, tot, (100*percent), "%",
                       this.formatTime(timespan),
                       this.formatTime(tottime-timespan));
            this.bardiv.style.width = (100*percent)+"%";
        }
        else
        {
            this.txtdiv.innerHTML =
                action+"... "+cur+", "+this.formatTime(timespan);
            this.bardiv.style.width = "5%";
            // get out your trig textbooks... mapping a sine wave to the
            // width of the div we are in... minus the width of the "bar"
            var halfwid = this.div.offsetWidth/2 * 0.95;
            this.bardiv.style.left =
                (halfwid +
                 halfwid * Math.sin(10*Math.PI *
                                    (timespan / (halfwid))))+"px";
        }
    };

    // format time from seconds to something more readable
    this.formatTime = function(t)
    {
        if (t < 60) { return Math.round(t)+"s"; }
        return Math.floor(t/60)+"m "+Math.round(t%60)+"s";
    };
}
