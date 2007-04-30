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

function ImageManager()
{
    this.cache = {};
    this.requested = 0;
    this.loaded = 0;
}

ImageManager.prototype.add = function(url, id, callback)
{
    if (this.cache[id] && this.cache[url]) return 0;
    if (this.cache[url]) // duplicate url
    {
        logger.log(3, "duplicate image "+id+" url "+url);
        this.cache[id] = this.cache[url];
        return 0;
    }
    logger.log(1, "Requesting image "+url+" id "+id);
    this.requested++;
    var i = new Image;
    this.cache[id] = this.cache[url] = i;
    i.id = id;
    i.imgMgr = this;
    i.onload = function (img) { this.imgMgr.loaded++;
                                this.onload = null;
                                callback(this, url, id); }
    i.onerror = function (img)
    {
        logger.log(1, "Failed to load "+this.src);
    }
    i.onabort = function (img)
    {
        logger.log(1, "Aborted load of "+this.src);
    }
    i.src = url;
    return 1;
};
ImageManager.prototype.remaining = function()
{
    return this.requested - this.loaded;
};
ImageManager.prototype.get = function(id)
{
    var i = new Image();
    logger.log(3, "getting image "+id);
    i.src = this.cache[id].src;
    return i;
};
