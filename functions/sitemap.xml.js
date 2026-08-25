/* Cloudflare Pages Function: /sitemap.xml
 * → GAS の ?sitemap=1 を叩いて動的 sitemap を返す
 *
 * 目的：Sheets の blog タブが Single Source of Truth なので、
 * Make が 1 行追加すれば sitemap にも自動反映される（Make に追加モジュール不要）
 *
 * キャッシュ：edge で 1h 保持し、GAS 呼び出しを抑制する
 */

const GAS_URL = 'https://script.google.com/macros/s/AKfycbw9QjwJ0tkdU02zvh6My3Erx0k4ThEhzP13dfiEAfWcJuGGZny3Duxe5RaH3r2Ub8KL/exec';

export async function onRequest(context) {
  try {
    const upstream = await fetch(GAS_URL + '?sitemap=1', {
      redirect: 'follow',
      cf: { cacheTtl: 3600, cacheEverything: true },
    });
    if (!upstream.ok) {
      return new Response('<!-- upstream error: ' + upstream.status + ' -->', {
        status: 502,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      });
    }
    const xml = await upstream.text();
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Robots-Tag': 'noindex',
      },
    });
  } catch (err) {
    return new Response('<!-- sitemap fetch failed: ' + (err && err.message || err) + ' -->', {
      status: 500,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}
