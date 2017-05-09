/**
 * Created by David on 09/05/2017.
 */
'use strict'

let log = console.log.bind(console),
    id = val => document.getElementById(val),
    ul = id('ul'),
    gUMbtn = id('gUMbtn'),
    start = id('start'),
    stop = id('stop'),
    stream,
    recorder,
    counter=1,
    chunks,
    media;

/*
TODO Grabar con setTimeout(function, milliseconds), repetir con setInterval(function, milliseconds)
30 minutos: 1.8e6; 3 segundos: 3000
https://www.w3schools.com/js/js_timing.asp
*/


gUMbtn.onclick = e => {
    let mv = id('mediaVideo'),
        mediaOptions = {
            video: {
                tag: 'video',
                type: 'video/webm',
                ext: '.mp4',
                gUM: {video: true, audio: true}
            },
            audio: {
                tag: 'audio',
                type: 'audio/ogg',
                ext: '.ogg',
                gUM: {audio: true}
            }
        };
    media = mv.checked ? mediaOptions.video : mediaOptions.audio;
    navigator.mediaDevices.getUserMedia(media.gUM).then(_stream => {
        stream = _stream;
    id('gUMArea').style.display = 'none';
    id('btns').style.display = 'inherit';
    start.removeAttribute('disabled');
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
        chunks.push(e.data);
        if(recorder.state == 'inactive')  makeLink();
    };
    log('got media successfully');
}).catch(log);
}

start.onclick = e => {
    start.disabled = true;
    stop.removeAttribute('disabled');
    chunks=[];
    recorder.start();
}


stop.onclick = e => {
    stop.disabled = true;
    recorder.stop();
    start.removeAttribute('disabled');
}



function makeLink(){
    let blob = new Blob(chunks, {type: media.type })
        , url = URL.createObjectURL(blob)
        , li = document.createElement('li')
        , mt = document.createElement(media.tag)
        , hf = document.createElement('a')
    ;
    mt.controls = true;
    mt.src = url;
    hf.href = url;
    hf.download = `${counter++}${media.ext}`;
    hf.innerHTML = `download ${hf.download}`;
    li.appendChild(mt);
    li.appendChild(hf);
    ul.appendChild(li);
}
