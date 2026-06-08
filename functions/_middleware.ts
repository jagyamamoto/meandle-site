export const onRequest: PagesFunction = async ({ request, next }) => {
  const auth = request.headers.get('Authorization');
  const expected = 'Basic ' + btoa('meandle:1234');
  if (auth !== expected) {
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Meandle Preview"',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
  return next();
};
