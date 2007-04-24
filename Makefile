# This is GNU Make
#
# it should work on Unix and Windows provided the following commands are
# in your PATH:
#   wget gzip tar perl
#

all: jsdoc.html

clean:
	find . -name '*~' -print | xargs rm

# push to a web site
# XXX this should work... why doesn't it?
push:
	(svn ls -R; echo jsdoc_2-0.2; echo jsdoc.html) | ncftpput -v -R -c -u veganmilitia veganmilitia.org httpdocs/sundog

# Generate JS docs
jsdocvers=jsdoc_2-0.2
jsdoc.html: util/genjsdoc.pl $(jsdocvers)
	perl util/genjsdoc.pl js $(jsdocvers) > $@
$(jsdocvers): $(jsdocvers).tgz
	gzip -dc $(jsdocvers).tgz | tar xf -
	touch $(jsdocvers)  # otherwise the dir will have an older date
$(jsdocvers).tgz:
	wget http://jsdoc-2.googlecode.com/files/$(jsdocvers).tgz

