const {desktopCapturer,ipcRenderer} = require('electron')
const $ = require('jquery')
const Peer = require('peerjs');

s4 = function(){
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

var call = null;
var stream = {screen:null};
var id = "s".replace(/s/g, s4);
var peer = new Peer('client-'+id, {host: '172.16.0.9', port: 9000, path: '/peerapi'}); 

$('.inStream').hide();

ipcRenderer.on('peerid', (event, message) => {
    $('input[name=peerid]').val(message)
})

desktopCapturer.getSources({types: ['screen']}, (error, sources) => {
    if (error) throw error
    for (let i = 0; i < sources.length; ++i) {
        if(sources[i].name!="ScreenPlay"){
            var {width, height} = sources[i].thumbnail.getSize();
            var $img = $('<img/>',{width:width,height:height,src:sources[i].thumbnail.toDataURL()});
            var $screen = $('<div/>',{id:sources[i].id,class:'screen'}).append($img);
            $('#screens').append($screen);
            $('div.screen').click(function(e){
                e.preventDefault();
                $('div.screen.active').removeClass('active');
                $(this).addClass('active');
                stream.screen = $(this).attr('id');
            });
        }
    }
    $('div.screen:first-child').addClass('active');
    stream.screen = $('div.screen:first-child').attr('id');
})

$('#start').click(function(e){
    e.preventDefault();
    if(stream.screen!=null){
        call = null;
        desktopCapturer.getSources({types: ['screen']}, (error, sources) => {
            if (error) throw error
            for (let i = 0; i < sources.length; ++i) {
                if (sources[i].id === stream.screen) {
                  navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                      mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: sources[i].id,
                        maxWidth: 1280,
                        maxHeight: 720
                      }
                    }
                  })
                  .then((stream) => {
                      call = peer.call($('input[name=peerid]').val(), stream);
                      $('.setupStream').hide();
                      $('.inStream').show();
                  })
                  .catch((e) => handleError(e))
                  return
                }
            }
        });
    }
})

$('#stop').click(function(e){
    e.preventDefault();
    call.close();
    $('.inStream').hide();
    $('.setupStream').show();
});