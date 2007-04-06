#!/usr/bin/perl
# simple script to generate a "fly mode" html wrapper
# for the js files in the given directory
# the html was stolen from an example in jsdoc-2

use strict;
use File::Find;

my $jsdir = shift;
my $jsdoc = shift;
my @jsfiles = ();
File::Find::find(sub { push @jsfiles, $File::Find::name if /\.js$/; },
                 $jsdir);

print <<CHUMBA;
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
        "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
<head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <title>Sundog JSDoc</title>
        <style type="text/css">
    body {
        font: 12px verdana;
        line-height: 16px;
    }
    
    .object-block {
        margin: 12px;
        border: 1px solid #ccf;
        padding: 8px;
    }
    table {
        border: 1px solid #666;
    }
    table thead {
        background-color: #ccc;
        color: white;
        font: 10px verdana;
    }
    table td {
        padding: 0 4px 0 4px;
        font: 10px verdana;
        border: 1px solid #ccc;
    }
    li {
        margin-top: 12px;
    }
    </style>

    <script src="$jsdoc/lib/jsdoc.js" type="text/javascript"></script>
    
    <script type="text/javascript" language="javascript" charset="utf-8">
        function getSearchValue(key){
            var q = window.location.search;
            if(q.length > 1) q = q.substring(1, q.length);
            
            var keyValues = q.split("&");
            for(var i = 0; i < keyValues.length; i++) {
                var keyValue = keyValues[i].split("=");
                if (keyValue[0] == key) return unescape(keyValue[1]);
            }
        }
    
        function onChange(form) {
            var source = form.source.options[form.source.selectedIndex].value;
            var template = "$jsdoc/examples/fly/templates/sunny.js";
			renderJSDoc(source, template)
			return true;
		}
		
		function renderJSDoc(sourceFile, templateFile) {
			if (typeof sourceFile == "undefined" || sourceFile == "")
				return;
			
			var target = document.getElementById('jsdocDisplay');
			target.innerHTML = "<i>Loading<"+"/i>";

            // XXX cache?
			try {
				JSDoc.parse(sourceFile);
				JSDoc.render(templateFile);
			} catch(e) { alert("Caught error: "+e); }
			
			target.innerHTML = JSDoc.printBuffer.join("\\n");
		}
	</script>
</head>
<body onload="renderJSDoc(getSearchValue('src'))">

<form action="." method="get" target="_self">
	Library: <select name="source" onchange='onChange(this.form);'>
		<option selected></option>
CHUMBA
foreach my $i (@jsfiles)
{
    printf qq(<option value="%s">%s</option>\n), $i, $i;
}

print<<WAMBA;
	</select>
</form>

<div id="jsdocDisplay" style="border: 1px solid #69F; padding: 4px;">
     Choose a library...
</div>
</body>
</html>
WAMBA
exit 0;
