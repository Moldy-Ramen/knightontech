import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    // Create a simple cookie that lasts for 7 days
const cookie = serialize('admin', '1', {
  httpOnly: true,
  maxAge: 60 * 5, // 5 minutes
  path: '/',
  sameSite: 'lax',
});


    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
}
