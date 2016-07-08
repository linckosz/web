<?php
/*
	Write here anything you need as debugging information to be display on main page
	For twig display use: {{ _debug() }} or {{ _debug(data) }}
	For php display use: include($app->lincko->path.'/error/debug.php');
	Or simply open the link http://{domain}/debug

	To get data
	print_r($data);

	Then open the link (change the domain name according to dev(.net)/stage(.co)/production(.com) server)
	https://lincko.co/debug
*/
$app = \Slim\Slim::getInstance();
//print_r($data);

$contents = "
ffmpeg version N-76704-ge9aea6d-lincko Copyright (c) 2000-2015 the FFmpeg developers
  built with gcc 4.4.7 (GCC) 20120313 (Red Hat 4.4.7-16)
  configuration: --prefix=/usr/local/cpffmpeg --enable-shared --enable-nonfree --enable-gpl --enable-pthreads --enable-libopencore-amrnb --enable-libopencore-amrwb --enable-libfaac --enable-libmp3lame --enable-libtheora --enable-libvorbis --enable-libx264 --enable-libxvid --extra-cflags=-I/usr/local/cpffmpeg/include/ --extra-ldflags=-L/usr/local/cpffmpeg/lib --enable-version3 --extra-version=lincko --enable-avfilter --arch=x86_64 --enable-postproc --enable-libvo-aacenc --enable-zlib --disable-w32threads
  libavutil      55.  6.100 / 55.  6.100
  libavcodec     57. 15.100 / 57. 15.100
  libavformat    57. 14.100 / 57. 14.100
  libavdevice    57.  0.100 / 57.  0.100
  libavfilter     6. 15.100 /  6. 15.100
  libswscale      4.  0.100 /  4.  0.100
  libswresample   2.  0.101 /  2.  0.101
  libpostproc    54.  0.100 / 54.  0.100
Input #0, mov,mp4,m4a,3gp,3g2,mj2, from '/tmp/phpp4UNC3.video':
  Metadata:
    major_brand     : mp42
    minor_version   : 0
    compatible_brands: isommp42
    creation_time   : 2016-03-26 02:44:39
  Duration: 00:00:07.38, start: 0.000000, bitrate: 11515 kb/s
    Stream #0:0(eng): Video: h264 (Baseline) (avc1 / 0x31637661), yuv420p, 1280x720, 12004 kb/s, 30.01 fps, 30 tbr, 90k tbn, 180k tbc (default)
    Metadata:
      rotate          : 90
      creation_time   : 2016-03-26 02:44:39
      handler_name    : VideoHandle
    Side data:
      displaymatrix: rotation of -90.00 degrees
    Stream #0:1(eng): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, stereo, fltp, 128 kb/s (default)
    Metadata:
      creation_time   : 2016-03-26 02:44:39
      handler_name    : SoundHandle
-async is forwarded to lavfi similarly to -af aresample=async=1:min_hard_comp=0.100000:first_pts=0.
[libx264 @ 0x10d9520] using cpu capabilities: none!
[libx264 @ 0x10d9520] profile High, level 3.1
[libx264 @ 0x10d9520] 264 - core 148 r2638 7599210 - H.264/MPEG-4 AVC codec - Copyleft 2003-2015 - http://www.videolan.org/x264.html - options: cabac=1 ref=2 deblock=1:1:1 analyse=0x3:0x133 me=hex subme=6 psy=1 psy_rd=0.40:0.00 mixed_ref=1 me_range=16 chroma_me=1 trellis=1 8x8dct=1 cqm=0 deadzone=21,11 fast_pskip=1 chroma_qp_offset=-2 threads=3 lookahead_threads=1 sliced_threads=0 nr=0 decimate=1 interlaced=0 bluray_compat=0 constrained_intra=0 bframes=3 b_pyramid=2 b_adapt=1 b_bias=0 direct=1 weightb=1 open_gop=0 weightp=2 keyint=60 keyint_min=25 scenecut=40 intra_refresh=0 rc_lookahead=40 rc=crf mbtree=1 crf=30.0 qcomp=0.60 qpmin=10 qpmax=51 qpstep=4 ip_ratio=1.41 aq=1:0.60
Output #0, mp4, to '/glusterfs/.lincko.cafe/files/share/upload/3/a86008879520accda7a2ba923ebf4ea3':
  Metadata:
    major_brand     : mp42
    minor_version   : 0
    compatible_brands: isommp42
    encoder         : Lavf57.14.100
    Stream #0:0(eng): Video: h264 (libx264) ([33][0][0][0] / 0x0021), yuv420p, 480x856, q=10-51, 30 fps, 15360 tbn, 30 tbc (default)
    Metadata:
      handler_name    : VideoHandle
      creation_time   : 2016-03-26 02:44:39
      encoder         : Lavc57.15.100 libx264
    Stream #0:1(eng): Audio: aac (libvo_aacenc) ([64][0][0][0] / 0x0040), 44100 Hz, stereo, s16, 64 kb/s (default)
    Metadata:
      creation_time   : 2016-03-26 02:44:39
      handler_name    : SoundHandle
      encoder         : Lavc57.15.100 libvo_aacenc
Stream mapping:
  Stream #0:0 -> #0:0 (h264 (native) -> h264 (libx264))
  Stream #0:1 -> #0:1 (aac (native) -> aac (libvo_aacenc))
Press [q] to stop, [?] for help
frame=   39 fps=0.0 q=0.0 size=       0kB time=00:00:02.00 bitrate=   0.2kbits/s    
frame=   47 fps= 44 q=0.0 size=       0kB time=00:00:02.00 bitrate=   0.2kbits/s    
frame=   53 fps= 34 q=36.0 size=      35kB time=00:00:02.00 bitrate= 144.1kbits/s    
frame=   61 fps= 28 q=36.0 size=      62kB time=00:00:02.00 bitrate= 252.7kbits/s    
frame=   68 fps= 25 q=36.0 size=      83kB time=00:00:03.00 bitrate= 225.3kbits/s    
frame=   75 fps= 23 q=36.0 size=     106kB time=00:00:03.00 bitrate= 289.6kbits/s    
frame=   83 fps= 22 q=36.0 size=     132kB time=00:00:03.00 bitrate= 359.6kbits/s    
frame=   92 fps= 21 q=36.0 size=     162kB time=00:00:03.00 bitrate= 442.1kbits/s    
frame=  101 fps= 20 q=36.0 size=     192kB time=00:00:04.00 bitrate= 392.1kbits/s    
frame=  110 fps= 20 q=36.0 size=     235kB time=00:00:04.00 bitrate= 481.7kbits/s    
frame=  120 fps= 20 q=36.0 size=     259kB time=00:00:04.00 bitrate= 530.5kbits/s    
frame=  129 fps= 19 q=36.0 size=     285kB time=00:00:05.00 bitrate= 467.1kbits/s    
frame=  138 fps= 19 q=36.0 size=     308kB time=00:00:05.00 bitrate= 504.8kbits/s    
frame=  145 fps= 18 q=36.0 size=     332kB time=00:00:05.00 bitrate= 542.9kbits/s    
frame=  153 fps= 18 q=36.0 size=     355kB time=00:00:05.00 bitrate= 581.0kbits/s    
frame=  160 fps= 17 q=36.0 size=     376kB time=00:00:06.00 bitrate= 513.9kbits/s    
frame=  166 fps= 17 q=36.0 size=     400kB time=00:00:06.00 bitrate= 546.2kbits/s    ";

//$reg_duration = "/\b.*?Duration:\s*?(\d\d):(\d\d):(\d\d)\.(\d\d).*\b/i";
//$reg_duration = "/\b.*?Duration:\s*?(\d\d:\d\d:\d\d\.\d\d).*\b/i";
//$reg_duration  = "/\b.*?time=\s*?(\d\d:\d\d:\d\d\.\d\d).*\b/i";
$reg_duration  = "/ time=\s*?(\d\d):(\d\d):(\d\d)\.(\d\d) /i";
if(preg_match_all($reg_duration, $contents, $matches, PREG_SET_ORDER)){
	$match = $matches[count($matches)-1];
	$duration = $match[1]*360000 + $match[2]*6000 + $match[3]*100 + $match[4];
	\libs\Watch::php($duration, '$duration', __FILE__, false, false, true);
	print_r($matches);
}
