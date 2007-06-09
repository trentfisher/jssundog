#!/usr/bin/perl
# generate XHTML tag for given images

foreach my $f (@ARGV)
{
    next unless -f $f;
    my $fdat = qx(file "$f");
    my $dimtxt = "";
    # spark-anim2.gif:    GIF image data, version 89a, 80 x 77
    # player.png:         PNG image data, 99 x 330, 8-bit/color RGB, interlaced
    if ($fdat =~ /(\d+) x (\d+)/)
    {
        $dimtxt = sprintf('width="%d" height="%d"', $1, $2);
    }
    else
    {
        warn "Error: unable to determine dimensions of $f: $fdat";
    }
    my $id = $f; $id =~ s,.*/,,; $id =~ s,\.\w+,,;
    printf '<img id="%s" src="%s" %s />'."\n", $id, $f, $dimtxt;
}
exit 0;
