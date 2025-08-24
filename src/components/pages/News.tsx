interface NewsProps {
  language: 'en' | 'fa';
}

const News = ({ language }: NewsProps) => {
  const isRTL = language === 'fa';

  const texts = {
    en: {
      title: 'Cryptocurrency News',
      subtitle: 'Latest news and updates from the crypto world',
      comingSoon: 'Coming Soon',
      description: 'News section is under development. Stay tuned for the latest cryptocurrency news and market updates.'
    },
    fa: {
      title: 'اخبار ارزهای دیجیتال',
      subtitle: 'آخرین اخبار و به‌روزرسانی‌های دنیای کریپتو',
      comingSoon: 'به زودی',
      description: 'بخش اخبار در حال توسعه است. منتظر آخرین اخبار ارزهای دیجیتال و به‌روزرسانی‌های بازار باشید.'
    }
  };

  const t = texts[language];

  return (
    <div className={`p-6 space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Coming Soon Content */}
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="text-6xl">📰</div>
          <h2 className="text-2xl font-bold">{t.comingSoon}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">{t.description}</p>
        </div>
      </div>
    </div>
  );
};

export default News;
