export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, phone, center, program, message } = req.body;

  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_DATABASE_SOURCE_ID = process.env.NOTION_DATABASE_SOURCE_ID;

  if (!NOTION_API_KEY || !NOTION_DATABASE_SOURCE_ID) {
    return res.status(500).json({ message: 'Vercel 환경 변수에 노션 API 키 또는 데이터베이스 소스 ID가 설정되지 않았습니다.' });
  }

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_SOURCE_ID },
        properties: {
          "고객명": { 
            title: [{ text: { content: name || '' } }] 
          },
          "전화번호": { 
            phone_number: phone || ''
          },
          "메모": { 
            rich_text: [{ text: { content: center ? `[소속 센터] ${center}` : '' } }] 
          },
          "프로그램": { 
            select: { name: program || '기타 상담' } 
          },
          "문의내용": { 
            rich_text: [{ text: { content: message || '' } }] 
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Notion API Error:', errorData);
      return res.status(500).json({ message: 'Failed to save to Notion', error: errorData });
    }

    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
