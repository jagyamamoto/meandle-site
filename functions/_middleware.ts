/**
 * Basic 認証（preview モード）
 *
 * ユーザー名：meandle
 * パスワード：1234
 *
 * 全リクエストにブラウザ標準の認証ダイアログを挿入する。
 * 公開時にこのファイルを削除する。
 */
export const onRequest: PagesFunction = async ({ request, next }) => {
  const auth = request.headers.get('Authorization');
  const expected = 'Basic ' + btoa('meandle:1234');
  if (auth !== expected) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Meandle Preview"' },
    });
  }
  return next();
};
