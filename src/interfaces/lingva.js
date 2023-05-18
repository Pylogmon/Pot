import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export const info = {
    name: 'Lingva翻译',

    supportLanguage: {
        auto: 'auto',
        'zh-cn': 'zh',
        'zh-tw': 'zh_HANT',
        en: 'en',
        ja: 'ja',
        ko: 'ko',
        fr: 'fr',
        es: 'es',
        ru: 'ru',
        de: 'de',
    },
    needs: [
        {
            config_key: 'lingva_domain',
            place_hold: 'lingva.ml',
            display_name: '自定义域名',
        },
    ],
};

export async function translate(text, from, to, setText) {

    const { supportLanguage } = info;

    if (!(to in supportLanguage) || !(from in supportLanguage)) {
        return '该接口不支持该语言';
    }

    let domain = get('lingva_domain') ?? '';
    if (domain == '') {
        domain = 'lingva.ml';
    }

    let res = await fetch(`https://${domain}/api/v1/${supportLanguage[from]}/${supportLanguage[to]}/${encodeURIComponent(text)}`, {
        method: 'GET'
    })

    if (res.ok) {
        let result = res.data;
        if (result.translation && result.info && result.info.detectedSource) {
            if (result.info.detectedSource == supportLanguage[to]) {
                let secondLanguage = get('second_language') ?? 'en';
                if (secondLanguage != to) {
                    await translate(text, from, secondLanguage, setText);
                    return;
                }
            }
            setText(result.translation);
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw 'http请求出错\n' + JSON.stringify(res);
    }
}
