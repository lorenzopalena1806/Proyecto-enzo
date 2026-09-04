async function test() {
  const url = 'https://maps.app.goo.gl/uX3L3zRjFqTvx9Fv8'; // random example shortlink
  const res = await fetch(url, { redirect: 'manual' });
  console.log('Status:', res.status);
  console.log('Location:', res.headers.get('location'));
}
test();
