import path from 'path';

export default function formatPath(p: string) {
    const {sep} = path;
    // 如果返回 / 则为 macOS
    if (sep === '/') return p;
    return p.replace(/\\/g, '/');
}
