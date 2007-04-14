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
* Get a file via HTTP (a wrapper around XMLHttpRequest()
*/
function requestFile(url, callback, postData)
{
   // if this is the first time we have been called, figure out
   // which object to use, and cache it in our object prototype,
   // so we only have to do this once
   if (!arguments.callee.prototype.httpobj)
   {
       var XMLHttpFactories = [
           function () {return new XMLHttpRequest()},
           function () {return new ActiveXObject("Msxml2.XMLHTTP")},
           function () {return new ActiveXObject("Msxml3.XMLHTTP")},
           function () {return new ActiveXObject("Microsoft.XMLHTTP")},
           ];

       for (var i=0; i<XMLHttpFactories.length; i++)
       {
           try {
               XMLHttpFactories[i]();
               arguments.callee.prototype.httpobj = XMLHttpFactories[i];
           }
           catch (e) {
               continue;
           }
           break;
       }
       // not supported :-(
       if (!arguments.callee.prototype.httpobj)
           arguments.callee.prototype.httpobj = function() { return false; };
   }

   var req = arguments.callee.prototype.httpobj();
   if (!req) return;
   //req.reqURL = url; // save this for the handler XXX breaks IE!
   var method = (postData) ? "POST" : "GET";
   req.open(method,url,true);
   req.setRequestHeader('User-Agent','XMLHTTP/1.0');

   // set up and encode the post data
   var postStr = "";
   if (postData)
   {
       req.setRequestHeader('Content-type',
                            'application/x-www-form-urlencoded');
       for (i in postData)
       {
           if (postStr) postStr += "&";
           postStr += i+"="+encodeURIComponent(postData[i]);
       }
   }

   req.onreadystatechange = function () {
       if (req.readyState != 4) return;
       if (req.status != 200 && req.status != 304 &&
           req.status != 0)   // for local files
       {
           // XXX throw?
           alert('Error: retrieving '+url+', HTTP error ' + req.status);
           return;
       }
       callback(req, url);
   }
   if (req.readyState == 4) return;
   req.send(postStr);
}

/**
 * load an image
 * @arguments url url of the image
 * @arguments callback function to be called when loading is complete
 */
function requestImage(url, callback)
{
    var i = new Image;
    logger.log(1, "Requesting image "+url);
    i.onload = function (img) { callback(img.currentTarget, url); }
    i.src = url;
}
