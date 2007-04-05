/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-

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
           alert('HTTP error ' + req.status);
           return;
       }
       callback(req);
   }
   if (req.readyState == 4) return;
   req.send(postStr);
}

/**
* Serialize an XML Document or Element and return it as a string.
*/
function serializeXML(node)
{
   if (typeof XMLSerializer != "undefined")
       return (new XMLSerializer()).serializeToString(node);
   else if (node.xml) return node.xml;
   else throw "XML serialize is not supported or can't serialize " + node;
}
