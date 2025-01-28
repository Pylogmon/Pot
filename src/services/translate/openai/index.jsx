import { fetch, Body } from '@tauri-apps/api/http';
import { Language } from './info';
import { defaultRequestArguments } from './Config';

export async function translate(text, from, to, options) {
    const { config, setResult, detect } = options;

    let { service, requestPath, model, apiKey, stream, promptList, requestArguments } = config;

    if (!/https?:\/\/.+/.test(requestPath)) {
        requestPath = `https://${requestPath}`;
    }
    const apiUrl = new URL(requestPath);

    // in openai like api, /v1 is not required
    if (service === 'openai' && !apiUrl.pathname.endsWith('/chat/completions')) {
        // not openai like, populate completion endpoint
        apiUrl.pathname += apiUrl.pathname.endsWith('/') ? '' : '/';
        apiUrl.pathname += 'v1/chat/completions';
    }

    // 兼容旧版
    if (promptList === undefined) {
        promptList = [
            {
                role: 'system',
                content:
                    'You are a professional translation engine, please translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it.',
            },
            { role: 'user', content: `Translate into $to:\n"""\n$text\n"""` },
        ];
    }

    promptList = promptList.map((item) => {
        return {
            ...item,
            content: item.content
                .replaceAll('$text', text)
                .replaceAll('$from', from)
                .replaceAll('$to', to)
                .replaceAll('$detect', Language[detect]),
        };
    });

    const headers =
        service === 'openai'
            ? {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${apiKey}`,
              }
            : {
                  'Content-Type': 'application/json',
                  'api-key': apiKey,
              };
    const body = {
        ...JSON.parse(requestArguments ?? defaultRequestArguments),
        stream: stream,
        messages: promptList,
    };
    if (service === 'openai') {
        body['model'] = model;
    }
    if (stream) {
        const res = await window.fetch(apiUrl.href, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
        });
        if (res.ok) {
            let target = '';
            const reader = res.body.getReader();
            try {
                let temp = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        setResult(target.trim());
                        return target.trim();
                    }
                    const str = new TextDecoder().decode(value);
                    let datas = str.split('data:');
                    for (let data of datas) {
                        if (data.trim() !== '' && data.trim() !== '[DONE]') {
                            try {
                                if (temp !== '') {
                                    data = temp + data.trim();
                                    let result = JSON.parse(data.trim());
                                    if (result.choices[0].delta.content) {
                                        target += result.choices[0].delta.content;
                                        if (setResult) {
                                            setResult(target + '_');
                                        } else {
                                            return '[STREAM]';
                                        }
                                    }
                                    temp = '';
                                } else {
                                    let result = JSON.parse(data.trim());
                                    if (result.choices[0].delta.content) {
                                        target += result.choices[0].delta.content;
                                        if (setResult) {
                                            setResult(target + '_');
                                        } else {
                                            return '[STREAM]';
                                        }
                                    }
                                }
                            } catch {
                                temp = data.trim();
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        } else {
            throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
        }
    } else {
        let res = await window.fetch(apiUrl.href, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
        });
        if (res.ok) {
            let result = await res.json();
            const { choices } = result;
            if (choices) {
                let target = choices[0].message.content.trim();
                if (target) {
                    if (target.startsWith('"')) {
                        target = target.slice(1);
                    }
                    if (target.endsWith('"')) {
                        target = target.slice(0, -1);
                    }
                    return target.trim();
                } else {
                    throw JSON.stringify(choices);
                }
            } else {
                throw JSON.stringify(result);
            }
        } else {
            const errorData = await res.json().catch(() => null);
            throw `Http Request Error\nHttp Status: ${res.status}\n${errorData ? JSON.stringify(errorData) : 'No error details available'}`;
        }
    }
}

export * from './Config';
export * from './info';
