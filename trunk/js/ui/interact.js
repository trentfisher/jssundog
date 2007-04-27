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
    var div = document.getElementById(id);
    var iprefix = '/interactions/interact[@id="'+name+'"]';
    doState("start");

    function doState(s)
    {
        // XXX do actions and such...
        div.innerHTML = s+":  ";
        if (s == "done") return;

        div.appendChild(
            xml2html(XML.getNode(conf,
                                 iprefix+'/state[@id="'+s+'"]/text')));
        var links = XML.getNodes(conf, iprefix+'/state[@id="'+s+'"]/option');
        for (var i = 0; i < links.length; i++)
        {
            var a = document.createElement("a");
            a.href="#";
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
                // XXX use image manager
                im[i].src = "../img/icons/burger.png";
            }
        }
        return dom;
    }
}
