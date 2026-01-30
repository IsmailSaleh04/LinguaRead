export async function fetchWikipediaArticle(title: string, language: string = 'en') {
  try {
    const response = await fetch(
      `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    );
    
    if (!response.ok) {
      throw new Error('Article not found');
    }

    const data = await response.json();
    
    return {
      title: data.title,
      summary: data.extract,
      url: data.content_urls.desktop.page,
      fullText: data.extract_html || data.extract,
    };
  } catch (error) {
    console.error('Wikipedia fetch error:', error);
    throw error;
  }
}
