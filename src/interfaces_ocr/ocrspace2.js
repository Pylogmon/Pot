import { readBinaryFile, BaseDirectory } from '@tauri-apps/api/fs';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { ocrID } from '../windows/Ocr/components/TextArea';

export const info = {
    name: 'ocrspace2',
    supportLanguage: {},
    needs: [
        {
            config_key: 'ocrspace2_apikey',
            place_hold: '',
        }
    ],
};

export async function ocr(imgurl, lang, setText, id) {
    const apikey = get('ocrspace2_apikey') ?? '';

    if (apikey === '') {
        throw 'Please configure client_id and client_secret';
    }

    const url = 'https://api.ocr.space/parse/image';


    let canvas = document.createElement('CANVAS');
    let ctx = canvas.getContext('2d');
    let img = new Image;
    img.src = imgurl;

    let base64 = await new Promise((resolve, reject) => {
        img.onload = () => {
            img.crossOrigin = 'anonymous';
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            let base64 = canvas.toDataURL('image/png');
            if (base64 === 'data:,') {
            } else {
                resolve(base64);
            }
        }
        img.onerror = async (e) => {
            let img = await readBinaryFile('pot_screenshot_cut.png', { dir: BaseDirectory.AppCache });
            let base64 = window.btoa(String.fromCharCode(...img));
            resolve('data:image/png;base64,' + base64);
        };
    });
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            apikey,
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: {
            type: 'Text',
            payload: `base64Image=${encodeURIComponent(base64)}&OCREngine=2`
        }
    }
    )
    if (res.ok) {
        let result = res.data;
        if (result['ParsedResults']) {
            let target = '';
            for (let i of result['ParsedResults']) {
                target += i['ParsedText']
            }
            if (id === ocrID || id === 'translate') {
                setText(target.trim());
            }
        } else {
            throw JSON.stringify(result)
        }
    } else {
        if (id === ocrID || id === 'translate') {
            throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
        }
    }
}