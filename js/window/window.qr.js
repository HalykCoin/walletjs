'use strict'

const qr = require('qr-image');
const fs = require('fs');

function setQRCode(id, text){
    let img = document.getElementById(id);

    createQRPNGBase64(text)
        .then(dataUri => img.src = dataUri);

}

/**
 * Create QR image data in data URI.
 */
function createQRPNGBase64(text) {
    return new Promise((resolve, reject) => {

        let buffers = [];

    qr.image(text, {
        format: 'svg'
    })
        .on('data', buffer => buffers.push(buffer))
.on('end', _ => {

        let buffer = Buffer.concat(buffers);
    let dataUri = `data:image/svg;base64,${buffer.toString('base64')}`;
    resolve(dataUri);
})
.on('error', reject);
});
}
